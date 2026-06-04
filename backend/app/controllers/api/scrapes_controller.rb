module Api
  class ScrapesController < ApplicationController
    def create
      newspaper = params[:newspaper].presence
      scope = Column.includes(:newspaper).where(scrape_enabled: true)
      scope = scope.joins(:newspaper).where(newspapers: { name: newspaper }) if newspaper

      targets = scope.to_a

      results = targets.each_with_index.map do |column, idx|
        sleep 1 if idx.positive?
        run_one(column)
      end

      render json: {
        results: results,
        summary: summarize(results)
      }
    end

    private

    def run_one(column)
      status = ColumnScraper.new(
        newspaper_name: column.newspaper.name,
        column_name: column.name,
        config: column.scrape_config
      ).scrape!

      {
        newspaper: column.newspaper.name,
        column: column.name,
        status: status.to_s
      }
    rescue ColumnScraper::ScrapeError => e
      { newspaper: column.newspaper.name, column: column.name, status: "error", error: e.message }
    rescue StandardError => e
      Rails.logger.error("[ScrapesController] unexpected: #{e.class}: #{e.message}")
      { newspaper: column.newspaper.name, column: column.name, status: "error", error: "予期しないエラー: #{e.class}" }
    end

    def summarize(results)
      {
        total: results.size,
        created: results.count { |r| r[:status] == "created" },
        updated: results.count { |r| r[:status] == "updated" },
        failed:  results.count { |r| r[:status] == "error" }
      }
    end
  end
end
