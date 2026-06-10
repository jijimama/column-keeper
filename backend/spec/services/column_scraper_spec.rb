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
  end
end
