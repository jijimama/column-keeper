module Api
  class NewspapersController < ApplicationController
    def index
      newspapers = Newspaper.order(:name)
      render json: newspapers.map { |n| { id: n.id, name: n.name } }
    end
  end
end
