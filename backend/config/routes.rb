Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :newspapers, only: [:index]
    resources :columns, only: [:index]
    resources :column_entries, only: [:index, :show] do
      resource :favorite, only: [:create, :destroy]
    end
  end
end
