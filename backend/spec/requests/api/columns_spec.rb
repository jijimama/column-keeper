require "rails_helper"

RSpec.describe "Api::Columns", type: :request do
  let!(:asahi) { create(:newspaper, name: "朝日新聞") }
  let!(:mainichi) { create(:newspaper, name: "毎日新聞") }
  let!(:tensei) { create(:column, newspaper: asahi, name: "天声人語") }
  let!(:yoroku) { create(:column, newspaper: mainichi, name: "余録") }

  describe "GET /api/columns" do
    it "全件、新聞順" do
      get "/api/columns"
      body = JSON.parse(response.body)
      expect(body.size).to eq(2)
      expect(body.first["newspaper"]["name"]).to eq("朝日新聞")
    end

    it "newspaper_id で絞り込める" do
      get "/api/columns", params: { newspaper_id: mainichi.id }
      body = JSON.parse(response.body)
      expect(body.size).to eq(1)
      expect(body.first["name"]).to eq("余録")
    end
  end
end
