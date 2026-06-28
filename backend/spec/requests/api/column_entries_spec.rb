require "rails_helper"

RSpec.describe "Api::ColumnEntries", type: :request do
  let(:asahi) { create(:newspaper, name: "朝日新聞") }
  let(:mainichi) { create(:newspaper, name: "毎日新聞") }
  let(:tensei) { create(:column, newspaper: asahi, name: "天声人語") }
  let(:yoroku) { create(:column, newspaper: mainichi, name: "余録") }

  describe "GET /api/column_entries" do
    let!(:e1) { create(:column_entry, column: tensei, published_on: Date.new(2026, 1, 1), content: "サンプルテキストA", view_count: 5) }
    let!(:e2) { create(:column_entry, column: tensei, published_on: Date.new(2025, 1, 1), content: "サンプルテキストB", view_count: 10) }
    let!(:e3) { create(:column_entry, column: yoroku, published_on: Date.new(2026, 5, 1), content: "別新聞のテキスト", view_count: 1) }

    it "デフォルトは published_on 降順、全件取得" do
      get "/api/column_entries"
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["entries"].size).to eq(3)
      expect(body["entries"].first["id"]).to eq(e3.id) # 2026-05-01
      expect(body["pagination"]["total_count"]).to eq(3)
    end

    it "newspaper_id で絞り込める" do
      get "/api/column_entries", params: { newspaper_id: asahi.id }
      expect(JSON.parse(response.body)["entries"].size).to eq(2)
    end

    it "favorited=true で絞り込める" do
      create(:favorite, column_entry: e1)
      get "/api/column_entries", params: { favorited: "true" }
      body = JSON.parse(response.body)
      expect(body["entries"].size).to eq(1)
      expect(body["entries"].first["id"]).to eq(e1.id)
    end

    it "unread=true で last_viewed_at が nil のものだけ" do
      e1.update!(last_viewed_at: Time.current)
      get "/api/column_entries", params: { unread: "true" }
      ids = JSON.parse(response.body)["entries"].map { |e| e["id"] }
      expect(ids).to contain_exactly(e2.id, e3.id)
    end

    it "q で content の LIKE 検索ができる" do
      get "/api/column_entries", params: { q: "サンプル" }
      ids = JSON.parse(response.body)["entries"].map { |e| e["id"] }
      expect(ids).to contain_exactly(e1.id, e2.id)
    end

    it "sort=views で view_count 降順" do
      get "/api/column_entries", params: { sort: "views" }
      ids = JSON.parse(response.body)["entries"].map { |e| e["id"] }
      expect(ids).to eq([e2.id, e1.id, e3.id]) # 10, 5, 1
    end

    it "month=1&day=1 で異年の同じ月日がヒット" do
      get "/api/column_entries", params: { month: 1, day: 1 }
      ids = JSON.parse(response.body)["entries"].map { |e| e["id"] }
      expect(ids).to contain_exactly(e1.id, e2.id)
    end

    it "per_page と page でページング" do
      get "/api/column_entries", params: { per_page: 2, page: 2 }
      body = JSON.parse(response.body)
      expect(body["entries"].size).to eq(1)
      expect(body["pagination"]).to include("page" => 2, "per_page" => 2, "total_pages" => 2, "total_count" => 3)
    end

    it "column_id で絞り込める" do
      get "/api/column_entries", params: { column_id: tensei.id }
      ids = JSON.parse(response.body)["entries"].map { |e| e["id"] }
      expect(ids).to contain_exactly(e1.id, e2.id)
    end

    it "sort=oldest で published_on 昇順" do
      get "/api/column_entries", params: { sort: "oldest" }
      ids = JSON.parse(response.body)["entries"].map { |e| e["id"] }
      # 2025-01-01 (e2), 2026-01-01 (e1), 2026-05-01 (e3)
      expect(ids).to eq([e2.id, e1.id, e3.id])
    end

    it "page 範囲外でも 200、entries は空配列" do
      get "/api/column_entries", params: { per_page: 2, page: 99 }
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)["entries"]).to eq([])
    end
  end

  describe "GET /api/column_entries/:id" do
    let(:entry) { create(:column_entry, column: tensei, view_count: 0, last_viewed_at: nil) }

    it "view_count を +1、last_viewed_at を現在時刻に更新" do
      get "/api/column_entries/#{entry.id}"
      expect(response).to have_http_status(:ok)
      entry.reload
      expect(entry.view_count).to eq(1)
      expect(entry.last_viewed_at).to be_within(5.seconds).of(Time.current)
    end

    it "詳細レスポンスに本文全文が含まれる" do
      get "/api/column_entries/#{entry.id}"
      body = JSON.parse(response.body)
      expect(body["content"]).to eq(entry.content)
      expect(body["column"]["newspaper"]["name"]).to eq("朝日新聞")
    end
  end
end
