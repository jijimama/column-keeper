module Api
  class ScrapesController < ApplicationController
    def create
      results = ScrapingRunner.new(newspaper: params[:newspaper].presence).run!
      render json: { results: results, summary: summarize(results) }
    end

    private

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
