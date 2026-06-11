require "rails_helper"

RSpec.describe "Api::Admin::Newspapers", type: :request do
  describe "GET /api/admin/newspapers" do
    it "name 順 + columns_count を返す" do
      asahi = create(:newspaper, name: "朝日新聞")
      create(:column, newspaper: asahi, name: "天声人語")
      create(:newspaper, name: "毎日新聞")

      get "/api/admin/newspapers"
      body = JSON.parse(response.body)
      expect(body.map { |n| n["name"] }).to eq(["朝日新聞", "毎日新聞"])
      expect(body.first["columns_count"].to_i).to eq(1)
    end
  end

  describe "POST /api/admin/newspapers" do
    it "新規作成すると 201 + JSON" do
      post "/api/admin/newspapers", params: { newspaper: { name: "新作新聞" } }, as: :json
      expect(response).to have_http_status(:created)
      expect(JSON.parse(response.body)["name"]).to eq("新作新聞")
    end

    it "name 重複なら 422" do
      create(:newspaper, name: "既存新聞")
      post "/api/admin/newspapers", params: { newspaper: { name: "既存新聞" } }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH/DELETE /api/admin/newspapers/:id" do
    let(:np) { create(:newspaper, name: "古い名前") }

    it "更新 → 名前が変わる" do
      patch "/api/admin/newspapers/#{np.id}", params: { newspaper: { name: "新しい名前" } }, as: :json
      expect(response).to have_http_status(:ok)
      expect(np.reload.name).to eq("新しい名前")
    end

    it "削除 → 204、紐づくコラムも消える" do
      create(:column, newspaper: np)
      expect {
        delete "/api/admin/newspapers/#{np.id}"
      }.to change(Newspaper, :count).by(-1).and change(Column, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
