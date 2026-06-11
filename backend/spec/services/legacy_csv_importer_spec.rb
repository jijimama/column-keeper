require "rails_helper"
require "tempfile"

RSpec.describe LegacyCsvImporter do
  def write_csv(content, encoding: "UTF-8")
    file = Tempfile.create(["legacy", ".csv"])
    File.write(file.path, content, encoding: encoding)
    file.path
  end

  describe "#import!" do
    it "新規に4列CSVから取り込む" do
      path = write_csv(<<~CSV)
        2025,1,1,本文1
        2025,1,2,本文2
      CSV

      stats = described_class.new(
        csv_path: path, newspaper_name: "テスト新聞", column_name: "テストコラム"
      ).import!

      expect(stats).to eq(created: 2, updated: 0, skipped: 0)
      expect(ColumnEntry.count).to eq(2)
    end

    it "同じ日付の行は上書き更新する" do
      column = create(:column, newspaper: create(:newspaper, name: "テスト新聞"), name: "テストコラム")
      create(:column_entry, column: column, published_on: Date.new(2025, 1, 1), content: "古い本文")

      path = write_csv("2025,1,1,新しい本文\n")

      stats = described_class.new(
        csv_path: path, newspaper_name: "テスト新聞", column_name: "テストコラム"
      ).import!

      expect(stats).to eq(created: 0, updated: 1, skipped: 0)
      expect(ColumnEntry.find_by(column: column, published_on: Date.new(2025, 1, 1)).content).to eq("新しい本文")
    end

    it "空セル・不正日付の行は skip する" do
      path = write_csv(<<~CSV)
        2025,1,1,
        2025,2,30,本文
        2025,1,2,正常な本文
      CSV

      stats = described_class.new(
        csv_path: path, newspaper_name: "テスト新聞", column_name: "テストコラム"
      ).import!

      expect(stats).to eq(created: 1, updated: 0, skipped: 2)
    end

    it "前後の空白は除去される" do
      path = write_csv(" 2025 , 1 , 1 ,  ああああ\n")

      described_class.new(
        csv_path: path, newspaper_name: "テスト新聞", column_name: "テストコラム"
      ).import!

      expect(ColumnEntry.last.content).to eq("ああああ")
    end

    it "Newspaper / Column は冪等に find_or_create される" do
      path = write_csv("2025,1,1,本文\n")

      expect {
        described_class.new(csv_path: path, newspaper_name: "朝日", column_name: "コラム").import!
        described_class.new(csv_path: path, newspaper_name: "朝日", column_name: "コラム").import!
      }.to change(Newspaper, :count).by(1).and change(Column, :count).by(1)
    end
  end
end
