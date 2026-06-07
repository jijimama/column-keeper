module Api
  module Admin
    class NewspapersController < ApplicationController
      def index
        newspapers = Newspaper
          .left_joins(:columns)
          .group("newspapers.id")
          .select("newspapers.*, COUNT(columns.id) AS columns_count")
          .order(:name)
        render json: newspapers.map { |n| serialize(n, columns_count: n.attributes["columns_count"]) }
      end

      def create
        newspaper = Newspaper.new(newspaper_params)
        if newspaper.save
          render json: serialize(newspaper), status: :created
        else
          render json: { errors: newspaper.errors }, status: :unprocessable_entity
        end
      end

      def update
        newspaper = Newspaper.find(params[:id])
        if newspaper.update(newspaper_params)
          render json: serialize(newspaper)
        else
          render json: { errors: newspaper.errors }, status: :unprocessable_entity
        end
      end

      def destroy
        Newspaper.find(params[:id]).destroy!
        head :no_content
      end

      private

      def newspaper_params
        params.require(:newspaper).permit(:name)
      end

      def serialize(newspaper, columns_count: nil)
        {
          id: newspaper.id,
          name: newspaper.name,
          columns_count: columns_count || newspaper.columns.count
        }
      end
    end
  end
end
