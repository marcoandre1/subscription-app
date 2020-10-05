Rails.application.routes.draw do
  devise_for :users
  root to: "home#index"
  resources :publications, only: [:index, :show]
  namespace :admin do
    resources :publications
  end
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
