require "csv"
require "yaml"

namespace :columns do
  desc "ヘッダ付きCSVから過去コラムを取り込む。Usage: bin/rails columns:import CSV=path/to/file.csv"
  task import: :environment do
    csv_path = ENV["CSV"]
    abort "CSV=path/to/file.csv を指定してください" if csv_path.blank?
    abort "ファイルが見つかりません: #{csv_path}" unless File.exist?(csv_path)

    stats = { created: 0, updated: 0, skipped: 0 }

    CSV.foreach(csv_path, headers: true).with_index(1) do |row, idx|
      newspaper_name = row["newspaper_name"]&.strip
      column_name    = row["column_name"]&.strip
      published_on   = row["published_on"]&.strip
      content        = row["content"]&.strip
      source_url     = row["source_url"]&.strip.presence

      if newspaper_name.blank? || column_name.blank? || published_on.blank? || content.blank?
        warn "skip(record #{idx}): 必須カラム不足または空"
        stats[:skipped] += 1
        next
      end

      newspaper = Newspaper.find_or_create_by!(name: newspaper_name)
      column    = Column.find_or_create_by!(newspaper: newspaper, name: column_name)
      entry     = ColumnEntry.find_or_initialize_by(column: column, published_on: Date.parse(published_on))
      was_new   = entry.new_record?

      entry.content = content
      entry.source_url = source_url if source_url
      entry.save!

      stats[was_new ? :created : :updated] += 1
    end

    puts "Import done: #{stats[:created]} created, #{stats[:updated]} updated, #{stats[:skipped]} skipped"
  end

  desc "ヘッダなし4列CSV(年,月,日,本文)を取り込む。Usage: bin/rails columns:import_legacy CSV=path NEWSPAPER=朝日新聞 COLUMN=天声人語"
  task import_legacy: :environment do
    csv_path       = ENV["CSV"]
    newspaper_name = ENV["NEWSPAPER"]
    column_name    = ENV["COLUMN"]
    encoding       = ENV["ENCODING"].presence || "UTF-8"

    abort "CSV=path/to/file.csv を指定してください" if csv_path.blank?
    abort "NEWSPAPER=新聞名 を指定してください"   if newspaper_name.blank?
    abort "COLUMN=コラム名 を指定してください"   if column_name.blank?
    abort "ファイルが見つかりません: #{csv_path}" unless File.exist?(csv_path)

    stats = LegacyCsvImporter.new(
      csv_path: csv_path,
      newspaper_name: newspaper_name,
      column_name: column_name,
      encoding: encoding
    ).import!

    puts "Import legacy (#{newspaper_name} / #{column_name}): #{stats[:created]} created, #{stats[:updated]} updated, #{stats[:skipped]} skipped"
  end

  desc "scrape_enabled なコラムをすべてスクレイピング。cron から呼ぶ用。Usage: bin/rails columns:scrape_all"
  task scrape_all: :environment do
    results = ScrapingRunner.new.run!
    summary = { "created" => 0, "updated" => 0, "error" => 0 }

    results.each do |r|
      flag = r[:status] == "error" ? "✗" : "✓"
      detail = r[:error] ? " (#{r[:error]})" : ""
      puts "  #{flag} #{r[:newspaper]} / #{r[:column]}: #{r[:status]}#{detail}"
      summary[r[:status]] ||= 0
      summary[r[:status]] += 1
    end

    puts "---"
    puts "Total: #{summary["created"]} created, #{summary["updated"]} updated, #{summary["error"]} failed"
    exit(1) if summary["error"] > 0 && summary["created"] + summary["updated"] == 0
  end

  desc "data/sources.yml に従って全 CSV を一括取り込む"
  task import_all: :environment do
    sources_path = Rails.root.join("data", "sources.yml")
    abort "sources.yml が見つかりません: #{sources_path}" unless File.exist?(sources_path)

    sources = YAML.load_file(sources_path)
    abort "sources.yml の形式が不正です（配列を期待）" unless sources.is_a?(Array)

    total = { created: 0, updated: 0, skipped: 0, missing: 0 }

    sources.each do |src|
      file      = src["file"]
      newspaper = src["newspaper"]
      column    = src["column"]

      if file.blank? || newspaper.blank? || column.blank?
        warn "skip source: file/newspaper/column が不足 (#{src.inspect})"
        next
      end

      csv_path = Rails.root.join("data", file)
      unless File.exist?(csv_path)
        warn "skip source: ファイル無し #{csv_path}"
        total[:missing] += 1
        next
      end

      stats = LegacyCsvImporter.new(
        csv_path: csv_path.to_s,
        newspaper_name: newspaper,
        column_name: column
      ).import!

      puts "  #{newspaper} / #{column}: #{stats[:created]} created, #{stats[:updated]} updated, #{stats[:skipped]} skipped"
      total[:created] += stats[:created]
      total[:updated] += stats[:updated]
      total[:skipped] += stats[:skipped]
    end

    puts "---"
    puts "Total: #{total[:created]} created, #{total[:updated]} updated, #{total[:skipped]} skipped, #{total[:missing]} missing files"
  end

  desc "data/sources.yml の scrape: ブロックを Column テーブルに反映する。冪等。Usage: bin/rails columns:sync_scrape_config"
  task sync_scrape_config: :environment do
    sources_path = Rails.root.join("data", "sources.yml")
    abort "sources.yml が見つかりません: #{sources_path}" unless File.exist?(sources_path)

    sources = YAML.load_file(sources_path)
    stats = { upserted: 0, scrape_enabled: 0, scrape_cleared: 0 }

    sources.each do |src|
      newspaper = Newspaper.find_or_create_by!(name: src["newspaper"])
      column    = Column.find_or_create_by!(newspaper: newspaper, name: src["column"])

      if src["scrape"].is_a?(Hash)
        sc = src["scrape"]
        column.update!(
          scrape_enabled:        true,
          scrape_base_url:       sc["base_url"],
          scrape_list_selector:  sc["list_selector"],
          scrape_list_index:     sc["list_index"] || 0,
          scrape_detail_base_url: sc["detail_base_url"],
          scrape_detail_selector: sc["detail_selector"],
          scrape_date_selector:  sc["date_selector"],
          scrape_date_regexp:    sc["date_regexp"],
          scrape_replace_rules:  sc["replace_rules"] || {}
        )
        stats[:scrape_enabled] += 1
      else
        column.update!(scrape_enabled: false)
        stats[:scrape_cleared] += 1
      end
      stats[:upserted] += 1
    end

    puts "Synced: #{stats[:upserted]} columns (scrape_enabled=#{stats[:scrape_enabled]}, no-scrape=#{stats[:scrape_cleared]})"
  end

  desc "市民タイムス みすず野 のアーカイブを巡回して CSV に書き出す。DB は触らない。Usage: bin/rails columns:archive_shimin FROM=2025-05-19 TO=2026-06-03 MAX_PAGES=37"
  task archive_shimin: :environment do
    require "csv"
    require "net/http"
    require "nokogiri"
    require "uri"

    from      = ENV["FROM"].presence ? Date.parse(ENV["FROM"]) : Date.new(2025, 5, 19)
    to        = ENV["TO"].presence   ? Date.parse(ENV["TO"])   : Date.today
    max_pages = (ENV["MAX_PAGES"].presence || 37).to_i

    base       = "https://www.shimintimes.co.jp/features/misuzuno"
    csv_path   = Rails.root.join("data/shimin_misuzu.csv")
    user_agent = "column-keeper/0.1 (+local research)"

    fetcher = ->(url) do
      uri = URI.parse(url)
      Net::HTTP.start(uri.host, uri.port, use_ssl: uri.scheme == "https",
                                          open_timeout: 10, read_timeout: 10) do |http|
        req = Net::HTTP::Get.new(uri.request_uri, "User-Agent" => user_agent, "Accept" => "text/html,*/*")
        res = http.request(req)
        raise "HTTP #{res.code}" unless res.is_a?(Net::HTTPSuccess)
        res.body
      end
    end

    rows = []
    puts "FROM=#{from} TO=#{to} MAX_PAGES=#{max_pages}"

    (1..max_pages).each do |page|
      url = page == 1 ? "#{base}/" : "#{base}/page/#{page}/"
      begin
        list_doc = Nokogiri::HTML(fetcher.call(url))
      rescue => e
        warn "[page #{page}] ERROR fetching list: #{e.message}"
        sleep 1
        next
      end
      links = list_doc.css("a.card-title").map { |a| a["href"] }.compact.uniq
      puts "[page #{page}/#{max_pages}] links=#{links.size}"

      links.each do |link|
        sleep 0.5
        begin
          article_doc = Nokogiri::HTML(fetcher.call(link))
        rescue => e
          warn "  ERROR #{link}: #{e.message}"
          next
        end

        date_raw = article_doc.css("div.content-block-header div.date").first&.text&.strip
        unless date_raw && (m = date_raw.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/))
          warn "  skip(date parse): #{link}"
          next
        end
        date = Date.new(m[1].to_i, m[2].to_i, m[3].to_i)
        next if date < from || date > to

        content_nodes = article_doc.css("div.content-block-body p")
        content = content_nodes.map { |n| n.text.strip }.reject(&:empty?).join("\n")
        content = content.gsub(/　/, "").gsub(/[ \t]+\n/, "\n").gsub(/\n{3,}/, "\n\n").strip
        if content.blank?
          warn "  skip(empty): #{link}"
          next
        end

        puts "  #{date}: #{content[0, 40].tr("\n", ' ')}..."
        rows << [date.year, date.month, date.day, content]
      end
      sleep 1
    end

    # 重複排除 (同じ年月日が複数ヒットしたら最初のもの優先)
    rows = rows.uniq { |r| [r[0], r[1], r[2]] }
    rows.sort_by! { |r| [r[0], r[1], r[2]] }

    CSV.open(csv_path, "wb") do |csv|
      rows.each { |r| csv << r }
    end

    puts "---"
    puts "wrote #{rows.size} rows to #{csv_path}"
  end
end
