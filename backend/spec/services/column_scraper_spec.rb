require "rails_helper"

RSpec.describe ColumnScraper do
  let(:list_url) { "https://example.com/columns/" }
  let(:detail_url) { "https://example.com/articles/123" }

  let(:list_html) do
    <<~HTML
      <html><body>
        <ul>
          <li><a class="title" href="/articles/123">最新コラム</a></li>
          <li><a class="title" href="/articles/122">過去コラム</a></li>
        </ul>
      </body></html>
    HTML
  end

  let(:detail_html) do
    <<~HTML
      <html><body>
        <div class="pubdate">2026/01/15</div>
        <div class="body">
          <p>本文の段落1。</p>
          <p>本文の段落2。</p>
        </div>
      </body></html>
    HTML
  end

  let(:config) do
    {
      "base_url"        => list_url,
      "list_selector"   => "a.title",
      "list_index"      => 0,
      "detail_base_url" => "https://example.com",
      "detail_selector" => "div.body p",
      "date_selector"   => "div.pubdate",
      "date_regexp"     => '(\d{4})/(\d{1,2})/(\d{1,2})'
    }
  end

  subject(:scraper) do
    described_class.new(
      newspaper_name: "テスト新聞",
      column_name: "テストコラム",
      config: config
    )
  end

  describe "#scrape!" do
    it "新規記事を作成する" do
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, detail_url).to_return(body: detail_html, status: 200)

      expect { scraper.scrape! }.to change(ColumnEntry, :count).by(1)
        .and change(Newspaper, :count).by(1)
        .and change(Column, :count).by(1)

      entry = ColumnEntry.last
      expect(entry.published_on).to eq(Date.new(2026, 1, 15))
      expect(entry.content).to include("本文の段落1")
      expect(entry.content).to include("本文の段落2")
      expect(entry.source_url).to eq(detail_url)
    end

    it "既存記事は上書き更新する（重複作成しない）" do
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, detail_url).to_return(body: detail_html, status: 200)

      scraper.scrape! # 1回目
      expect { scraper.scrape! }.not_to change(ColumnEntry, :count)
      expect(scraper.scrape!).to eq(:updated)
    end

    it "本文セレクタにマッチしない場合は ScrapeError" do
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, detail_url).to_return(body: "<html><body>empty</body></html>", status: 200)

      expect { scraper.scrape! }.to raise_error(ColumnScraper::ScrapeError, /本文が取得できませんでした/)
    end

    it "HTTP 404 のときは ScrapeError" do
      stub_request(:get, list_url).to_return(status: 404, body: "Not Found")
      expect { scraper.scrape! }.to raise_error(ColumnScraper::ScrapeError, /HTTP 404/)
    end

    it "replace_rules でURL置換が効く" do
      config["replace_rules"] = { "/articles/" => "/full/" }
      replaced_url = "https://example.com/full/123"
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, replaced_url).to_return(body: detail_html, status: 200)

      scraper.scrape!
      expect(ColumnEntry.last.source_url).to eq(replaced_url)
    end

    it "list_selector が空のとき base_url を詳細扱い" do
      config["list_selector"] = nil
      stub_request(:get, list_url).to_return(body: detail_html, status: 200)
      scraper.scrape!
      expect(ColumnEntry.last.content).to include("本文の段落1")
    end

    it "リダイレクトを追って最終ページから取得" do
      redirected_url = "https://example.com/articles/123-final"
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, detail_url).to_return(
        status: 302,
        headers: { "Location" => redirected_url }
      )
      stub_request(:get, redirected_url).to_return(body: detail_html, status: 200)

      expect { scraper.scrape! }.to change(ColumnEntry, :count).by(1)
    end

    it "list_index で指定した順番のリンクを使う" do
      config["list_index"] = 1
      other_url = "https://example.com/articles/122"
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, other_url).to_return(body: detail_html, status: 200)

      scraper.scrape!
      expect(ColumnEntry.last.source_url).to eq(other_url)
    end

    it "本文の半角・全角スペースは整理される" do
      messy_html = <<~HTML
        <html><body>
          <div class="pubdate">2026/01/15</div>
          <div class="body">
            <p>　全角スペース付き本文1。</p>
            <p>   半角スペース付き本文2。   </p>
          </div>
        </body></html>
      HTML
      stub_request(:get, list_url).to_return(body: list_html, status: 200)
      stub_request(:get, detail_url).to_return(body: messy_html, status: 200)

      scraper.scrape!
      # 全角スペースは除去、行末空白も除去
      expect(ColumnEntry.last.content).to include("全角スペース付き本文1")
      expect(ColumnEntry.last.content).to include("半角スペース付き本文2")
      expect(ColumnEntry.last.content).not_to include("　")
    end
  end
end
