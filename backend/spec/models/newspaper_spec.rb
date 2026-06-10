require "rails_helper"

RSpec.describe Newspaper, type: :model do
  describe "validations" do
    it "name が必須" do
      expect(build(:newspaper, name: "")).not_to be_valid
      expect(build(:newspaper, name: nil)).not_to be_valid
    end

    it "name はユニーク" do
      create(:newspaper, name: "朝日新聞")
      duplicate = build(:newspaper, name: "朝日新聞")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:name]).to be_present
    end
  end

  describe "associations" do
    it "削除すると紐づく Column も削除される" do
      newspaper = create(:newspaper)
      create_list(:column, 2, newspaper: newspaper)
      expect { newspaper.destroy! }.to change(Column, :count).by(-2)
    end
  end
end
