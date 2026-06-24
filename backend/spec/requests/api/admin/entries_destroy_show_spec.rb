require "rails_helper"

RSpec.describe "Api::Admin::Entries (show / destroy)", type: :request do
  let(:entry) { create(:column_entry, content: "本文テスト") }

  describe "GET /api/admin/entries/:id" do
    it "詳細を返す（view_count を増やさない）" do
      get "/api/admin/entries/#{entry.id}"
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["content"]).to eq("本文テスト")
      expect(entry.reload.view_count).to eq(0)
    end
  end

  describe "DELETE /api/admin/entries/:id" do
    it "削除すると 204、Favorite も cascade 削除" do
      create(:favorite, column_entry: entry)
      expect {
        delete "/api/admin/entries/#{entry.id}"
      }.to change(ColumnEntry, :count).by(-1).and change(Favorite, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
