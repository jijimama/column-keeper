require "net/http"
require "nokogiri"
require "uri"

# 静的HTMLのコラムサイトをスクレイピングして最新記事1本を取り込む。
#
# config は sources.yml の scrape: ブロック。
# 期待されるキー:
#   base_url        - 一覧ページ（or 一覧と詳細が同じページの場合は詳細URL）
#   list_selector   - 一覧から記事リンクを抽出するCSS（空なら base_url を詳細扱い）
#   list_index      - 一覧内で何番目のリンクを取るか（既定 0）
#   detail_base_url - 詳細URLが相対のときに前置するベース
#   detail_selector - 詳細ページから本文を抽出するCSS
#   date_selector   - 詳細ページから日付を抽出するCSS
#   date_regexp     - 抽出文字列からの正規表現（任意。年/月/日 を $1..$3 でキャプチャ想定）
class ColumnScraper
  class ScrapeError < StandardError; end

  USER_AGENT = "column-keeper/0.1 (+local research; contact: local)"
  TIMEOUT_SEC = 10
  MAX_REDIRECTS = 3

  def initialize(newspaper_name:, column_name:, config:)
    @newspaper_name = newspaper_name
    @column_name = column_name
    @config = config
  end

  def scrape!
    list_doc = fetch_doc(@config["base_url"])
    detail_url = resolve_detail_url(list_doc)
    detail_doc = list_doc == nil || detail_url == @config["base_url"] ? list_doc : fetch_doc(detail_url)

    content = extract_content(detail_doc)
    raise ScrapeError, "本文が取得できませんでした (selector=#{@config["detail_selector"]})" if content.blank?

    date = extract_date(detail_doc)
    raise ScrapeError, "日付の抽出に失敗" unless date

    persist!(date: date, content: content, source_url: detail_url)
  end

  private

  def fetch_doc(url)
    body = http_get(url)
    Nokogiri::HTML(body)
  end

  def http_get(url, redirects_remaining: MAX_REDIRECTS)
    uri = URI.parse(url)
    raise ScrapeError, "URL が http(s) ではない: #{url}" unless uri.is_a?(URI::HTTP)

    Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https",
                                       open_timeout: TIMEOUT_SEC, read_timeout: TIMEOUT_SEC) do |http|
      req = Net::HTTP::Get.new(uri.request_uri, "User-Agent" => USER_AGENT, "Accept" => "text/html,*/*")
      res = http.request(req)

      case res
      when Net::HTTPSuccess
        res.body
      when Net::HTTPRedirection
        raise ScrapeError, "redirect が多すぎる" if redirects_remaining <= 0
        next_url = URI.join(url, res["location"]).to_s
        http_get(next_url, redirects_remaining: redirects_remaining - 1)
      else
        raise ScrapeError, "HTTP #{res.code} on #{url}"
      end
    end
  rescue Timeout::Error, SocketError, EOFError => e
    raise ScrapeError, "通信エラー: #{e.class}: #{e.message}"
  end

  def resolve_detail_url(list_doc)
    selector = @config["list_selector"]
    return @config["base_url"] if selector.blank?

    idx = (@config["list_index"] || 0).to_i
    link = list_doc.css(selector)[idx]
    raise ScrapeError, "一覧からリンクが見つからない (selector=#{selector}, index=#{idx})" unless link

    href = link["href"]
    raise ScrapeError, "href が空" if href.blank?

    join_url(href, @config["detail_base_url"])
  end

  def join_url(href, base)
    if @config["replace_rules"].is_a?(Hash)
      @config["replace_rules"].each { |old_str, new_str| href = href.gsub(old_str.to_s, new_str.to_s) }
    end
    return href if href.start_with?("http://", "https://")
    return base + href if base.present?
    URI.join(@config["base_url"], href).to_s
  end

  def extract_content(doc)
    nodes = doc.css(@config["detail_selector"])
    return "" if nodes.empty?
    text = nodes.map { |n| n.text.strip }.join("\n")
    text.gsub(/　/, "").gsub(/[ \t]+\n/, "\n").gsub(/\n{3,}/, "\n\n").strip
  end

  def extract_date(doc)
    raw = doc.css(@config["date_selector"]).first&.text&.strip
    return nil if raw.blank?

    if @config["date_regexp"].present?
      m = Regexp.new(@config["date_regexp"]).match(raw)
      return nil unless m
      year  = (m[1] || Date.today.year).to_i
      month = m[2].to_i
      day   = m[3].to_i
      return nil if month.zero? || day.zero?
      Date.new(year, month, day)
    else
      Date.parse(raw)
    end
  rescue ArgumentError
    nil
  end

  def persist!(date:, content:, source_url:)
    newspaper = Newspaper.find_or_create_by!(name: @newspaper_name)
    column = Column.find_or_create_by!(newspaper: newspaper, name: @column_name)
    entry = ColumnEntry.find_or_initialize_by(column: column, published_on: date)
    was_new = entry.new_record?
    entry.content = content
    entry.source_url = source_url
    entry.save!
    was_new ? :created : :updated
  end
end
