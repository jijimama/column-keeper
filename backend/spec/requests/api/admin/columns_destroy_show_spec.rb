require "rails_helper"

RSpec.describe "Api::Admin::Columns (show / destroy)", type: :request do
  let(:newspaper) { create(:newspaper, name: "新聞") }
  let(:column) { create(:column, newspaper: newspaper, name: "コラム") }

  describe "GET /api/admin/columns/:id" do
    it "詳細を返す（scrape 設定とゼロ件の entries_count）" do
      get "/api/admin/columns/#{column.id}"
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["name"]).to eq("コラム")
      expect(body["scrape_enabled"]).to be false
      expect(body["entries_count"]).to eq(0)
      expect(body["scrape_replace_rules"]).to eq({})
    end
  end

  describe "DELETE /api/admin/columns/:id" do
    it "削除すると 204、紐づく entries も cascade 削除" do
      create_list(:column_entry, 2, column: column)
      expect {
        delete "/api/admin/columns/#{column.id}"
      }.to change(Column, :count).by(-1).and change(ColumnEntry, :count).by(-2)
      expect(response).to have_http_status(:no_content)
    end
  end
end
