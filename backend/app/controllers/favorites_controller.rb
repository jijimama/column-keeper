module Api
  class FavoritesController < ApplicationController
    def create
      entry = ColumnEntry.find(params[:column_entry_id])
      Favorite.find_or_create_by!(column_entry: entry)
      head :no_content
    end

    def destroy
      entry = ColumnEntry.find(params[:column_entry_id])
      entry.favorite&.destroy
      head :no_content
    end
  end
end
