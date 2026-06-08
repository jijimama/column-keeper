Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    resources :newspapers, only: [:index]
    resources :columns, only: [:index]
    resources :column_entries, only: [:index, :show] do
      resource :favorite, only: [:create, :destroy]
    end
    resources :scrapes, only: [:create]

    namespace :admin do
      resources :newspapers, only: [:index, :create, :update, :destroy]
      resources :columns, only: [:index, :show, :create, :update, :destroy]
      resources :entries, only: [:index, :show, :create, :update, :destroy]
    end
  end
end
