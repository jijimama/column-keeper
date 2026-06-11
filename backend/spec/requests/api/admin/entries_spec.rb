require "rails_helper"

RSpec.describe "Api::Admin::Entries", type: :request do
  let(:column) { create(:column) }

  describe "GET /api/admin/entries" do
    it "ページネーション付きで返す" do
      create_list(:column_entry, 3, column: column)
      get "/api/admin/entries", params: { per_page: 2, page: 1 }
      body = JSON.parse(response.body)
      expect(body["entries"].size).to eq(2)
      expect(body["pagination"]).to include("total_count" => 3, "total_pages" => 2)
    end
  end

  describe "POST /api/admin/entries" do
    it "新規作成できる" do
      post "/api/admin/entries", params: {
        entry: {
          column_id: column.id,
          published_on: "2026-06-01",
          content: "新しい本文"
        }
      }, as: :json
      expect(response).to have_http_status(:created)
      expect(ColumnEntry.last.content).to eq("新しい本文")
    end

    it "本文必須エラーで 422" do
      post "/api/admin/entries", params: {
        entry: { column_id: column.id, published_on: "2026-06-01", content: "" }
      }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/admin/entries/:id" do
    it "本文を更新できる" do
      entry = create(:column_entry, column: column, content: "古い")
      patch "/api/admin/entries/#{entry.id}", params: {
        entry: { content: "新しい" }
      }, as: :json
      expect(response).to have_http_status(:ok)
      expect(entry.reload.content).to eq("新しい")
    end
  end
end
