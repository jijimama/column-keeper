require "yaml"

module Api
  class ScrapesController < ApplicationController
    def create
      sources_path = Rails.root.join("data", "sources.yml")
      unless File.exist?(sources_path)
        return render json: { error: "sources.yml が見つかりません" }, status: :unprocessable_entity
      end

      sources = YAML.load_file(sources_path)
      newspaper = params[:newspaper].presence

      targets = sources.select do |src|
        next false unless src["scrape"].is_a?(Hash)
        newspaper.nil? || src["newspaper"] == newspaper
      end

      # 各サイトへの連続アクセスを避けるため1秒間隔。最後の1件は sleep 不要
      results = targets.each_with_index.map do |src, idx|
        sleep 1 if idx.positive?
        run_one(src)
      end

      render json: {
        results: results,
        summary: summarize(results)
      }
    end

    private

    def run_one(src)
      status = ColumnScraper.new(
        newspaper_name: src["newspaper"],
        column_name: src["column"],
        config: src["scrape"]
      ).scrape!

      {
        newspaper: src["newspaper"],
        column: src["column"],
        status: status.to_s
      }
    rescue ColumnScraper::ScrapeError => e
      {
        newspaper: src["newspaper"],
        column: src["column"],
        status: "error",
        error: e.message
      }
    rescue StandardError => e
      Rails.logger.error("[ScrapesController] unexpected: #{e.class}: #{e.message}")
      {
        newspaper: src["newspaper"],
        column: src["column"],
        status: "error",
        error: "予期しないエラー: #{e.class}"
      }
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
