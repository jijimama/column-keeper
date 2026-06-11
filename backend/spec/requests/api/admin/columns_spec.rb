require "rails_helper"

RSpec.describe "Api::Admin::Columns", type: :request do
  let(:newspaper) { create(:newspaper, name: "テスト新聞") }

  describe "GET /api/admin/columns" do
    it "newspaper を含めて返す" do
      create(:column, newspaper: newspaper, name: "テストコラム")
      get "/api/admin/columns"
      body = JSON.parse(response.body)
      expect(body.size).to eq(1)
      expect(body.first["newspaper"]["name"]).to eq("テスト新聞")
    end
  end

  describe "POST /api/admin/columns" do
    it "scrape 設定込みで新規作成できる" do
      post "/api/admin/columns", params: {
        column: {
          newspaper_id: newspaper.id,
          name: "新規コラム",
          scrape_enabled: true,
          scrape_base_url: "https://example.com",
          scrape_list_selector: "a.title",
          scrape_replace_rules: { "old" => "new" }
        }
      }, as: :json

      expect(response).to have_http_status(:created)
      column = Column.last
      expect(column.scrape_enabled).to be true
      expect(column.scrape_replace_rules).to eq("old" => "new")
    end
  end

  describe "PATCH /api/admin/columns/:id" do
    it "scrape_enabled を OFF にできる" do
      column = create(:column, newspaper: newspaper, scrape_enabled: true)
      patch "/api/admin/columns/#{column.id}", params: {
        column: { scrape_enabled: false }
      }, as: :json
      expect(response).to have_http_status(:ok)
      expect(column.reload.scrape_enabled).to be false
    end
  end
end
