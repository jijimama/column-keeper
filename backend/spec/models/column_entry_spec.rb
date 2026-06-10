require "rails_helper"

RSpec.describe ColumnEntry, type: :model do
  describe "validations" do
    it "published_on が必須" do
      expect(build(:column_entry, published_on: nil)).not_to be_valid
    end

    it "content が必須" do
      expect(build(:column_entry, content: "")).not_to be_valid
    end

    it "(column_id, published_on) で複合ユニーク" do
      column = create(:column)
      create(:column_entry, column: column, published_on: Date.new(2025, 1, 1))
      duplicate = build(:column_entry, column: column, published_on: Date.new(2025, 1, 1))
      expect(duplicate).not_to be_valid
    end

    it "別コラムなら同日付を許可" do
      c1 = create(:column)
      c2 = create(:column, newspaper: c1.newspaper, name: "別コラム")
      create(:column_entry, column: c1, published_on: Date.new(2025, 1, 1))
      expect(build(:column_entry, column: c2, published_on: Date.new(2025, 1, 1))).to be_valid
    end
  end

  describe "defaults" do
    it "view_count は 0 で作られる" do
      expect(create(:column_entry).view_count).to eq(0)
    end
  end
end
