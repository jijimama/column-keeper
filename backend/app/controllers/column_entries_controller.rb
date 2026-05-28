module Api
  class ColumnEntriesController < ApplicationController
    SNIPPET_LENGTH = 120

    def index
      scope = ColumnEntry.eager_load(:favorite, column: :newspaper)
                        .order(published_on: :desc, id: :desc)

      scope = scope.where(column_id: params[:column_id]) if params[:column_id].present?
      scope = scope.where(columns: { newspaper_id: params[:newspaper_id] }) if params[:newspaper_id].present?
      scope = scope.where.not(favorites: { id: nil }) if params[:favorited] == "true"

      render json: scope.map { |e| serialize_list(e) }
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
