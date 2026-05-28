module Api
  class ColumnsController < ApplicationController
    def index
      scope = Column.includes(:newspaper).order("newspapers.name", :name).references(:newspaper)
      scope = scope.where(newspaper_id: params[:newspaper_id]) if params[:newspaper_id].present?

      render json: scope.map { |c|
        {
          id: c.id,
          name: c.name,
          source_url: c.source_url,
          newspaper: { id: c.newspaper.id, name: c.newspaper.name }
        }
      }
    end
  end
end
