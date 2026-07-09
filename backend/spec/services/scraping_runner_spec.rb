require "rails_helper"

RSpec.describe ScrapingRunner do
  let(:detail_html) do
    <<~HTML
      <html><body>
        <div class="pubdate">2026/03/03</div>
        <div class="body"><p>本文</p></div>
      </body></html>
    HTML
  end

  def scrape_enabled_column(newspaper_name:, column_name:, slug:)
    np = create(:newspaper, name: newspaper_name)
    create(:column,
      newspaper: np, name: column_name,
      scrape_enabled: true,
      scrape_base_url: "https://example.com/#{slug}/",
      scrape_detail_selector: "div.body p",
      scrape_date_selector: "div.pubdate",
      scrape_date_regexp: '(\d{4})/(\d{1,2})/(\d{1,2})'
    )
  end

  describe "#run!" do
    it "scrape_enabled=true のコラム全部を実行" do
      scrape_enabled_column(newspaper_name: "新聞A", column_name: "コラムA", slug: "a")
      scrape_enabled_column(newspaper_name: "新聞B", column_name: "コラムB", slug: "b")
      create(:column, newspaper: create(:newspaper, name: "無効新聞"), scrape_enabled: false)

      stub_request(:get, "https://example.com/a/").to_return(body: detail_html, status: 200)
      stub_request(:get, "https://example.com/b/").to_return(body: detail_html, status: 200)

      results = described_class.new(sleep_between: 0).run!
      expect(results.size).to eq(2)
      expect(results.map { |r| r[:status] }).to all(eq("created"))
    end

    it "newspaper 指定で絞り込む" do
      scrape_enabled_column(newspaper_name: "新聞A", column_name: "コラムA", slug: "a")
      scrape_enabled_column(newspaper_name: "新聞B", column_name: "コラムB", slug: "b")
      stub_request(:get, "https://example.com/a/").to_return(body: detail_html, status: 200)

      results = described_class.new(newspaper: "新聞A", sleep_between: 0).run!
      expect(results.size).to eq(1)
      expect(results.first[:newspaper]).to eq("新聞A")
    end

    it "ScrapeError を捕捉して status: error を返す" do
      scrape_enabled_column(newspaper_name: "新聞X", column_name: "コラムX", slug: "x")
      stub_request(:get, "https://example.com/x/").to_return(status: 500)

      results = described_class.new(sleep_between: 0).run!
      expect(results.first[:status]).to eq("error")
      expect(results.first[:error]).to include("HTTP 500")
    end

    it "sleep_between で指定した間隔で sleep する（2件目以降）" do
      scrape_enabled_column(newspaper_name: "新聞A", column_name: "コラムA", slug: "a")
      scrape_enabled_column(newspaper_name: "新聞B", column_name: "コラムB", slug: "b")
      stub_request(:get, "https://example.com/a/").to_return(body: detail_html, status: 200)
      stub_request(:get, "https://example.com/b/").to_return(body: detail_html, status: 200)

      runner = described_class.new(sleep_between: 0.42)
      expect(runner).to receive(:sleep).with(0.42).once # 2件目の前だけ
      runner.run!
    end
  end
end
