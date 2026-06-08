module Api
  module Admin
    class EntriesController < ApplicationController
      DEFAULT_PER_PAGE = 30
      MAX_PER_PAGE = 100

      def index
        scope = ColumnEntry.includes(column: :newspaper).order(published_on: :desc, id: :desc)
        scope = scope.where(column_id: params[:column_id]) if params[:column_id].present?
        if params[:newspaper_id].present?
          scope = scope.joins(:column).where(columns: { newspaper_id: params[:newspaper_id] })
        end

        per_page = (params[:per_page].presence || DEFAULT_PER_PAGE).to_i.clamp(1, MAX_PER_PAGE)
        page = (params[:page].presence || 1).to_i
        page = 1 if page < 1

        total_count = scope.count
        total_pages = total_count.zero? ? 0 : (total_count.to_f / per_page).ceil
        entries = scope.limit(per_page).offset((page - 1) * per_page)

        render json: {
          entries: entries.map { |e| serialize(e) },
          pagination: {
            page: page,
            per_page: per_page,
            total_count: total_count,
            total_pages: total_pages
          }
        }
      end

      def show
        entry = ColumnEntry.includes(column: :newspaper).find(params[:id])
        render json: serialize(entry)
      end

      def create
        entry = ColumnEntry.new(entry_params)
        if entry.save
          entry.reload
          render json: serialize(entry), status: :created
        else
          render json: { errors: entry.errors }, status: :unprocessable_entity
        end
      end

      def update
        entry = ColumnEntry.find(params[:id])
        if entry.update(entry_params)
          render json: serialize(entry)
        else
          render json: { errors: entry.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        ColumnEntry.find(params[:id]).destroy!
        head :no_content
      end

      private

      def entry_params
        params.require(:entry).permit(:column_id, :published_on, :content, :source_url)
      end

      def serialize(entry)
        {
          id: entry.id,
          published_on: entry.published_on,
          content: entry.content,
          source_url: entry.source_url,
          view_count: entry.view_count,
          last_viewed_at: entry.last_viewed_at,
          column: { id: entry.column.id, name: entry.column.name },
          newspaper: { id: entry.column.newspaper.id, name: entry.column.newspaper.name }
        }
      end
    end
  end
end
