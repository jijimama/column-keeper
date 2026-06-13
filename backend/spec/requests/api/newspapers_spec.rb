require "rails_helper"

RSpec.describe "Api::Newspapers", type: :request do
  describe "GET /api/newspapers" do
    it "名前順で全件取得" do
      create(:newspaper, name: "毎日新聞")
      create(:newspaper, name: "朝日新聞")
      get "/api/newspapers"
      body = JSON.parse(response.body)
      expect(body.map { |n| n["name"] }).to eq(["毎日新聞", "朝日新聞"].sort)
    end
  end
end
