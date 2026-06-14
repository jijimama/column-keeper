require "rails_helper"

RSpec.describe "Api::Scrapes", type: :request do
  # 連続アクセス用の sleep をテスト時は無効化
  before { allow_any_instance_of(Object).to receive(:sleep) }

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

  describe "POST /api/scrapes" do
    it "DB から scrape_enabled なコラムを引いて全部走らせる" do
      scrape_enabled_column(newspaper_name: "新聞A", column_name: "コラムA", slug: "a")
      scrape_enabled_column(newspaper_name: "新聞B", column_name: "コラムB", slug: "b")
      stub_request(:get, "https://example.com/a/").to_return(body: detail_html, status: 200)
      stub_request(:get, "https://example.com/b/").to_return(body: detail_html, status: 200)

      post "/api/scrapes"
      body = JSON.parse(response.body)
      expect(body["summary"]).to include("total" => 2, "created" => 2, "failed" => 0)
    end

    it "newspaper で絞り込める" do
      scrape_enabled_column(newspaper_name: "新聞A", column_name: "コラムA", slug: "a")
      scrape_enabled_column(newspaper_name: "新聞B", column_name: "コラムB", slug: "b")
      stub_request(:get, "https://example.com/a/").to_return(body: detail_html, status: 200)

      post "/api/scrapes", params: { newspaper: "新聞A" }, as: :json
      body = JSON.parse(response.body)
      expect(body["summary"]).to include("total" => 1, "created" => 1)
    end

    it "スクレイピング失敗は error として集計される" do
      scrape_enabled_column(newspaper_name: "新聞A", column_name: "コラムA", slug: "a")
      stub_request(:get, "https://example.com/a/").to_return(status: 500)

      post "/api/scrapes"
      body = JSON.parse(response.body)
      expect(body["summary"]).to include("failed" => 1, "created" => 0)
      expect(body["results"].first["status"]).to eq("error")
    end
  end
end
