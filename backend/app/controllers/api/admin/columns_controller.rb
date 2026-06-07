module Api
  module Admin
    class ColumnsController < ApplicationController
      def index
        columns = Column.includes(:newspaper)
          .left_joins(:entries)
          .group("columns.id")
          .select("columns.*, COUNT(column_entries.id) AS entries_count")
          .order("newspapers.name", "columns.name")
          .references(:newspaper)

        render json: columns.map { |c| serialize(c, entries_count: c.attributes["entries_count"]) }
      end

      def show
        column = Column.find(params[:id])
        render json: serialize(column)
      end

      def create
        column = Column.new(column_params)
        if column.save
          render json: serialize(column), status: :created
        else
          render json: { errors: column.errors }, status: :unprocessable_entity
        end
      end

      def update
        column = Column.find(params[:id])
        if column.update(column_params)
          render json: serialize(column)
        else
          render json: { errors: column.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        Column.find(params[:id]).destroy!
        head :no_content
      end

      private

      def column_params
        permitted = params.require(:column).permit(
          :name, :newspaper_id, :source_url,
          :scrape_enabled, :scrape_base_url, :scrape_list_selector,
          :scrape_list_index, :scrape_detail_base_url, :scrape_detail_selector,
          :scrape_date_selector, :scrape_date_regexp
        ).to_h

        rules = params.dig(:column, :scrape_replace_rules)
        if rules.is_a?(ActionController::Parameters)
          permitted["scrape_replace_rules"] = rules.to_unsafe_h
        elsif rules.is_a?(Hash)
          permitted["scrape_replace_rules"] = rules
        elsif rules.nil? && params[:column].key?(:scrape_replace_rules)
          permitted["scrape_replace_rules"] = {}
        end

        permitted
      end

      def serialize(column, entries_count: nil)
        {
          id: column.id,
          name: column.name,
          source_url: column.source_url,
          newspaper: { id: column.newspaper.id, name: column.newspaper.name },
          scrape_enabled: column.scrape_enabled,
          scrape_base_url: column.scrape_base_url,
          scrape_list_selector: column.scrape_list_selector,
          scrape_list_index: column.scrape_list_index,
          scrape_detail_base_url: column.scrape_detail_base_url,
          scrape_detail_selector: column.scrape_detail_selector,
          scrape_date_selector: column.scrape_date_selector,
          scrape_date_regexp: column.scrape_date_regexp,
          scrape_replace_rules: column.scrape_replace_rules || {},
          entries_count: entries_count || column.entries.count
        }
      end
    end
  end
end
