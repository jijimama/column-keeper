require "rails_helper"
require "rake"

RSpec.describe "columns:sync_scrape_config", type: :task do
  before(:all) do
    Rails.application.load_tasks if Rake::Task.tasks.empty?
  end

  let(:task) { Rake::Task["columns:sync_scrape_config"] }

  after { task.reenable }

  it "sources.yml の scrape: ブロックを Column に反映する" do
    # 既存の sources.yml を読む前提のテスト（実 sources.yml に依存）
    expect { task.invoke }.not_to raise_error

    # 朝日新聞・天声人語: scrape: なし → scrape_enabled=false
    asahi_tensei = Column.joins(:newspaper).find_by(
      newspapers: { name: "朝日新聞" }, name: "天声人語"
    )
    expect(asahi_tensei&.scrape_enabled).to eq(false)

    # 毎日新聞・余録: scrape: あり → scrape_enabled=true
    mainichi_yoroku = Column.joins(:newspaper).find_by(
      newspapers: { name: "毎日新聞" }, name: "余録"
    )
    expect(mainichi_yoroku&.scrape_enabled).to eq(true)
    expect(mainichi_yoroku&.scrape_base_url).to include("mainichi.jp/yoroku")
  end
end
