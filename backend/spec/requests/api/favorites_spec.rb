require "rails_helper"

RSpec.describe "Api::Favorites", type: :request do
  let(:entry) { create(:column_entry) }

  describe "POST /api/column_entries/:id/favorite" do
    it "新規にお気に入り登録すると 204" do
      expect {
        post "/api/column_entries/#{entry.id}/favorite"
      }.to change(Favorite, :count).by(1)
      expect(response).to have_http_status(:no_content)
    end

    it "すでにお気に入り済みでも 204（冪等）" do
      create(:favorite, column_entry: entry)
      expect {
        post "/api/column_entries/#{entry.id}/favorite"
      }.not_to change(Favorite, :count)
      expect(response).to have_http_status(:no_content)
    end
  end

  describe "DELETE /api/column_entries/:id/favorite" do
    it "お気に入り解除で 204、レコードが消える" do
      create(:favorite, column_entry: entry)
      expect {
        delete "/api/column_entries/#{entry.id}/favorite"
      }.to change(Favorite, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end

    it "お気に入りが無くても 204（冪等）" do
      expect {
        delete "/api/column_entries/#{entry.id}/favorite"
      }.not_to change(Favorite, :count)
      expect(response).to have_http_status(:no_content)
    end
  end
end
