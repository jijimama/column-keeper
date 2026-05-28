require "csv"

namespace :columns do
  desc "CSVから過去コラムを取り込む。Usage: bin/rails columns:import CSV=path/to/file.csv"
  task import: :environment do
    csv_path = ENV["CSV"]
    abort "CSV=path/to/file.csv を指定してください" if csv_path.blank?
    abort "ファイルが見つかりません: #{csv_path}" unless File.exist?(csv_path)

    stats = { created: 0, updated: 0, skipped: 0 }

    CSV.foreach(csv_path, headers: true) do |row|
      newspaper_name = row["newspaper_name"]&.strip
      column_name    = row["column_name"]&.strip
      published_on   = row["published_on"]&.strip
      content        = row["content"]
      source_url     = row["source_url"]&.strip.presence

      if newspaper_name.blank? || column_name.blank? || published_on.blank? || content.blank?
        warn "skip(line #{$.}): 必須カラム不足"
        stats[:skipped] += 1
        next
      end

      newspaper = Newspaper.find_or_create_by!(name: newspaper_name)
      column    = Column.find_or_create_by!(newspaper: newspaper, name: column_name)
      entry     = ColumnEntry.find_or_initialize_by(column: column, published_on: Date.parse(published_on))
      was_new   = entry.new_record?

      entry.content = content
      entry.source_url = source_url if source_url
      entry.save!

      stats[was_new ? :created : :updated] += 1
    end

    puts "Import done: #{stats[:created]} created, #{stats[:updated]} updated, #{stats[:skipped]} skipped"
  end
end
