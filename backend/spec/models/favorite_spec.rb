require "rails_helper"

RSpec.describe Favorite, type: :model do
  describe "validations" do
    it "同じ記事を二重にお気に入りできない" do
      entry = create(:column_entry)
      create(:favorite, column_entry: entry)
      duplicate = build(:favorite, column_entry: entry)
      expect(duplicate).not_to be_valid
    end
  end

  describe "associations" do
    it "ColumnEntry が削除されると Favorite も削除される" do
      entry = create(:column_entry)
      create(:favorite, column_entry: entry)
      expect { entry.destroy! }.to change(Favorite, :count).by(-1)
    end
  end
end
