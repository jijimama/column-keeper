# 開発用サンプルデータ。db:seed は idempotent。
sample = [
  {
    newspaper: "朝日新聞",
    column: "天声人語",
    entries: [
      { date: Date.new(2026, 5, 27), body: "サンプル本文：朝日・天声人語 2026-05-27 のコラム。これはダミーデータです。" },
      { date: Date.new(2026, 5, 28), body: "サンプル本文：朝日・天声人語 2026-05-28 のコラム。これはダミーデータです。" },
      { date: Date.new(2026, 5, 29), body: "サンプル本文：朝日・天声人語 2026-05-29 のコラム。これはダミーデータです。" }
    ]
  },
  {
    newspaper: "毎日新聞",
    column: "余録",
    entries: [
      { date: Date.new(2026, 5, 28), body: "サンプル本文：毎日・余録 2026-05-28 のコラム。これはダミーデータです。" },
      { date: Date.new(2026, 5, 29), body: "サンプル本文：毎日・余録 2026-05-29 のコラム。これはダミーデータです。" }
    ]
  }
]

sample.each do |group|
  newspaper = Newspaper.find_or_create_by!(name: group[:newspaper])
  column = Column.find_or_create_by!(newspaper: newspaper, name: group[:column])
  group[:entries].each do |entry|
    record = ColumnEntry.find_or_initialize_by(column: column, published_on: entry[:date])
    record.content = entry[:body]
    record.save!
  end
end

puts "Seeded: #{Newspaper.count} newspapers / #{Column.count} columns / #{ColumnEntry.count} entries"
