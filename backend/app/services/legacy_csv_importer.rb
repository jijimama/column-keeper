require "csv"

class LegacyCsvImporter
  def initialize(csv_path:, newspaper_name:, column_name:, encoding: "UTF-8")
    @csv_path = csv_path
    @newspaper_name = newspaper_name
    @column_name = column_name
    @encoding = encoding
  end

  def import!
    newspaper = Newspaper.find_or_create_by!(name: @newspaper_name)
    column    = Column.find_or_create_by!(newspaper: newspaper, name: @column_name)

    stats = { created: 0, updated: 0, skipped: 0 }
    label = File.basename(@csv_path)

    CSV.foreach(@csv_path, headers: false, encoding: @encoding).with_index(1) do |row, idx|
      year, month, day, content = row.map { |v| v&.strip }

      if year.blank? || month.blank? || day.blank? || content.blank?
        warn "skip(#{label} record #{idx}): 列不足または空"
        stats[:skipped] += 1
        next
      end

      begin
        date = Date.new(Integer(year), Integer(month), Integer(day))
      rescue ArgumentError, TypeError
        warn "skip(#{label} record #{idx}): 日付パース失敗 (#{year},#{month},#{day})"
        stats[:skipped] += 1
        next
      end

      entry = ColumnEntry.find_or_initialize_by(column: column, published_on: date)
      was_new = entry.new_record?
      entry.content = content
      entry.save!

      stats[was_new ? :created : :updated] += 1
    end

    stats
  end
end
