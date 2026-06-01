require "csv"
require "yaml"

namespace :columns do
  desc "ヘッダ付きCSVから過去コラムを取り込む。Usage: bin/rails columns:import CSV=path/to/file.csv"
  task import: :environment do
    csv_path = ENV["CSV"]
    abort "CSV=path/to/file.csv を指定してください" if csv_path.blank?
    abort "ファイルが見つかりません: #{csv_path}" unless File.exist?(csv_path)

    stats = { created: 0, updated: 0, skipped: 0 }

    CSV.foreach(csv_path, headers: true).with_index(1) do |row, idx|
      newspaper_name = row["newspaper_name"]&.strip
      column_name    = row["column_name"]&.strip
      published_on   = row["published_on"]&.strip
      content        = row["content"]&.strip
      source_url     = row["source_url"]&.strip.presence

      if newspaper_name.blank? || column_name.blank? || published_on.blank? || content.blank?
        warn "skip(record #{idx}): 必須カラム不足または空"
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

  desc "ヘッダなし4列CSV(年,月,日,本文)を取り込む。Usage: bin/rails columns:import_legacy CSV=path NEWSPAPER=朝日新聞 COLUMN=天声人語"
  task import_legacy: :environment do
    csv_path       = ENV["CSV"]
    newspaper_name = ENV["NEWSPAPER"]
    column_name    = ENV["COLUMN"]
    encoding       = ENV["ENCODING"].presence || "UTF-8"

    abort "CSV=path/to/file.csv を指定してください" if csv_path.blank?
    abort "NEWSPAPER=新聞名 を指定してください"   if newspaper_name.blank?
    abort "COLUMN=コラム名 を指定してください"   if column_name.blank?
    abort "ファイルが見つかりません: #{csv_path}" unless File.exist?(csv_path)

    stats = LegacyCsvImporter.new(
      csv_path: csv_path,
      newspaper_name: newspaper_name,
      column_name: column_name,
      encoding: encoding
    ).import!

    puts "Import legacy (#{newspaper_name} / #{column_name}): #{stats[:created]} created, #{stats[:updated]} updated, #{stats[:skipped]} skipped"
  end

  desc "data/sources.yml に従って全 CSV を一括取り込む"
  task import_all: :environment do
    sources_path = Rails.root.join("data", "sources.yml")
    abort "sources.yml が見つかりません: #{sources_path}" unless File.exist?(sources_path)

    sources = YAML.load_file(sources_path)
    abort "sources.yml の形式が不正です（配列を期待）" unless sources.is_a?(Array)

    total = { created: 0, updated: 0, skipped: 0, missing: 0 }

    sources.each do |src|
      file      = src["file"]
      newspaper = src["newspaper"]
      column    = src["column"]

      if file.blank? || newspaper.blank? || column.blank?
        warn "skip source: file/newspaper/column が不足 (#{src.inspect})"
        next
      end

      csv_path = Rails.root.join("data", file)
      unless File.exist?(csv_path)
        warn "skip source: ファイル無し #{csv_path}"
        total[:missing] += 1
        next
      end

      stats = LegacyCsvImporter.new(
        csv_path: csv_path.to_s,
        newspaper_name: newspaper,
        column_name: column
      ).import!

      puts "  #{newspaper} / #{column}: #{stats[:created]} created, #{stats[:updated]} updated, #{stats[:skipped]} skipped"
      total[:created] += stats[:created]
      total[:updated] += stats[:updated]
      total[:skipped] += stats[:skipped]
    end

    puts "---"
    puts "Total: #{total[:created]} created, #{total[:updated]} updated, #{total[:skipped]} skipped, #{total[:missing]} missing files"
  end
end
