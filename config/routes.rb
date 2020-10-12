Rails.application.routes.draw do
  get 'users/info', to: 'users#info'
  post 'users/charge', to: 'users#charge'

  devise_for :users
  root to: "home#index"
  resources :publications, only: [:index, :show]
  namespace :admin do
    resources :publications
  end
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
