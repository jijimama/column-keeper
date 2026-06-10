require "rails_helper"

RSpec.describe Column, type: :model do
  describe "validations" do
    it "name が必須" do
      expect(build(:column, name: "")).not_to be_valid
    end

    it "(newspaper_id, name) で複合ユニーク" do
      np = create(:newspaper)
      create(:column, newspaper: np, name: "天声人語")
      duplicate = build(:column, newspaper: np, name: "天声人語")
      expect(duplicate).not_to be_valid
    end

    it "別の新聞でなら同じコラム名を許可" do
      asahi = create(:newspaper, name: "朝日新聞")
      mainichi = create(:newspaper, name: "毎日新聞")
      create(:column, newspaper: asahi, name: "コラム")
      expect(build(:column, newspaper: mainichi, name: "コラム")).to be_valid
    end
  end

  describe "#scrape_config" do
    it "scrape カラムから ColumnScraper の期待する Hash を返す" do
      column = build(
        :column,
        scrape_enabled: true,
        scrape_base_url: "https://example.com",
        scrape_list_selector: "a.title",
        scrape_list_index: 1,
        scrape_detail_base_url: "https://example.com",
        scrape_detail_selector: "div.body p",
        scrape_date_selector: "time",
        scrape_date_regexp: '(\d{4})/(\d{1,2})/(\d{1,2})',
        scrape_replace_rules: { "old" => "new" }
      )

      expect(column.scrape_config).to eq(
        "base_url"        => "https://example.com",
        "list_selector"   => "a.title",
        "list_index"      => 1,
        "detail_base_url" => "https://example.com",
        "detail_selector" => "div.body p",
        "date_selector"   => "time",
        "date_regexp"     => '(\d{4})/(\d{1,2})/(\d{1,2})',
        "replace_rules"   => { "old" => "new" }
      )
    end

    it "scrape_replace_rules が空 Hash なら replace_rules は nil" do
      column = build(:column, scrape_replace_rules: {})
      expect(column.scrape_config["replace_rules"]).to be_nil
    end
  end
end
