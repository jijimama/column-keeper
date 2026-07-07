# whenever gem のスケジュール定義。
# 反映（crontab に書き込み）:
#   cd backend && bundle exec whenever --update-crontab --set environment=development
# 反映を取り消し:
#   cd backend && bundle exec whenever --clear-crontab
#
# ローカル PC 起動中のみ動きます（スリープ中・シャットダウン中は起動しない）。

# 出力ログ (stdout/stderr 両方)
set :output, "log/cron.log"

# rake タスクを bundle exec で実行するために PATH を通す
env :PATH, ENV["PATH"]

# 毎朝 6:00 に scrape_enabled な全コラムをスクレイピング
every 1.day, at: "6:00 am" do
  rake "columns:scrape_all"
end
