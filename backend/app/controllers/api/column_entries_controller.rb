module Api
  class ColumnEntriesController < ApplicationController
    SNIPPET_LENGTH = 120

    DEFAULT_PER_PAGE = 20
    MAX_PER_PAGE = 100

    def index
      scope = ColumnEntry.eager_load(:favorite, column: :newspaper)

      scope = scope.where(column_id: params[:column_id]) if params[:column_id].present?
      scope = scope.where(columns: { newspaper_id: params[:newspaper_id] }) if params[:newspaper_id].present?
      scope = scope.where.not(favorites: { id: nil }) if params[:favorited] == "true"
      scope = scope.where(last_viewed_at: nil) if params[:unread] == "true"

      if params[:q].present?
        like = "%#{ActiveRecord::Base.sanitize_sql_like(params[:q].to_s.strip)}%"
        scope = scope.where("column_entries.content LIKE ?", like)
      end

      if params[:month].present?
        scope = scope.where("strftime('%m', published_on) = ?", format("%02d", params[:month].to_i))
      end
      if params[:day].present?
        scope = scope.where("strftime('%d', published_on) = ?", format("%02d", params[:day].to_i))
      end

      scope = case params[:sort]
              when "views"
                scope.order(view_count: :desc, published_on: :desc, id: :desc)
              when "oldest"
                scope.order(published_on: :asc, id: :asc)
              else
                scope.order(published_on: :desc, id: :desc)
              end

      per_page = (params[:per_page].presence || DEFAULT_PER_PAGE).to_i.clamp(1, MAX_PER_PAGE)
      page = (params[:page].presence || 1).to_i
      page = 1 if page < 1

      total_count = scope.distinct.count(:id)
      total_pages = total_count.zero? ? 0 : (total_count.to_f / per_page).ceil
      entries = scope.limit(per_page).offset((page - 1) * per_page)

      render json: {
        entries: entries.map { |e| serialize_list(e) },
        pagination: {
          page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }
    end

    def show
      entry = ColumnEntry.eager_load(:favorite, column: :newspaper).find(params[:id])
      entry.update!(view_count: entry.view_count + 1, last_viewed_at: Time.current)
      render json: serialize_detail(entry)
    end

    private

    def serialize_list(entry)
      {
        id: entry.id,
        published_on: entry.published_on,
        content_snippet: snippet(entry.content),
        view_count: entry.view_count,
        last_viewed_at: entry.last_viewed_at,
        is_unread: entry.last_viewed_at.nil?,
        is_favorited: entry.favorite.present?,
        column: column_payload(entry.column)
      }
    end

    def serialize_detail(entry)
      serialize_list(entry).merge(
        content: entry.content,
        source_url: entry.source_url
      )
    end

    def column_payload(column)
      {
        id: column.id,
        name: column.name,
        newspaper: { id: column.newspaper.id, name: column.newspaper.name }
      }
    end

    def snippet(text)
      return "" if text.blank?
      text.length > SNIPPET_LENGTH ? "#{text[0, SNIPPET_LENGTH]}…" : text
    end
  end
end
