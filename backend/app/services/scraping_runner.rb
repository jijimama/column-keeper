# scrape_enabled な Column 群に対して ColumnScraper を順に走らせる Service。
# Controller (Api::ScrapesController) と rake task (columns:scrape_all) の共通ロジック。
class ScrapingRunner
  DEFAULT_SLEEP_BETWEEN = 1.0

  def initialize(newspaper: nil, sleep_between: DEFAULT_SLEEP_BETWEEN)
    @newspaper = newspaper
    @sleep_between = sleep_between
  end

  # @return [Array<Hash>] 各コラムの実行結果（status: created/updated/error）
  def run!
    targets.each_with_index.map do |column, idx|
      sleep(@sleep_between) if idx.positive?
      run_one(column)
    end
  end

  private

  def targets
    scope = Column.includes(:newspaper).where(scrape_enabled: true)
    scope = scope.joins(:newspaper).where(newspapers: { name: @newspaper }) if @newspaper
    scope.to_a
  end

  def run_one(column)
    status = ColumnScraper.new(
      newspaper_name: column.newspaper.name,
      column_name: column.name,
      config: column.scrape_config
    ).scrape!

    { newspaper: column.newspaper.name, column: column.name, status: status.to_s }
  rescue ColumnScraper::ScrapeError => e
    { newspaper: column.newspaper.name, column: column.name, status: "error", error: e.message }
  rescue StandardError => e
    Rails.logger.error("[ScrapingRunner] unexpected: #{e.class}: #{e.message}")
    { newspaper: column.newspaper.name, column: column.name, status: "error", error: "予期しないエラー: #{e.class}" }
  end
end
