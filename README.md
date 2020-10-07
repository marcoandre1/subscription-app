# Subscription-app

- create a new rails application named `subscription-app`

```console
rails new subscription-app -d mysql
```

- Enter your application

```console
cd subscription-app
```

> If you setup **MySQL** or **Postgres** with a username/password, modify the
> `config/database.yml` file to contain the username/password that you specified

- Make sure that MySQL server is running. Just type `mysql`. If you get an error like this:

```console
ERROR 2002 (HY000): Can't connect to local MySQL server through socket '/var/run/mysqld/mysqld.sock' (2)
```

It's most likely that MySQL server is not running. You can start it with:

```console
sudo service mysql start
```

- Generate the database

```console
rake db:create
```

- Open your project in Visual Studio Code. _You can type `explorer.exe .` to open the project on windows (for BashOnUbuntuOnWindows)._

## Introducing Devise

- [Devise](https://github.com/heartcombo/devise) provides a number of user [routes](https://rubydoc.info/github/heartcombo/devise/ActionDispatch/Routing/Mapper) automatically.
- Session routes for **Authenticatable** (default):

| User/scope                  | Method | Route           | Controller Action        |
|-----------------------------|--------|-----------------|--------------------------|
| new_user_session            | GET    | /users/sign_in  | devise/sessions#new      |
| destroy_user_session        | DELETE | /users/sign_out | devise/sessions#destroy  |
| new_user_registration       | GET    | /users/sign_up  | devise/registrations#new |

> For other available routes, look at [SessionsController](https://www.rubydoc.info/github/heartcombo/devise/master/Devise/SessionsController) and [RegistrationsController](https://www.rubydoc.info/github/heartcombo/devise/master/Devise/RegistrationsController)

- [URL helpers](https://www.rubydoc.info/github/heartcombo/devise/master/Devise/Controllers/UrlHelpers) are provided to be used with resource/scope. They act like proxies to the generated routes created by devise. Example:

| User/scope                  | URL helper                 |
|-----------------------------|----------------------------|
| new_user_session            | new_user_session_path      |
| destroy_user_session        | destroy_user_session_path  |
| new_user_registration       | new_user_registration_path |

- Devise provides a number of user [helpers](https://www.rubydoc.info/github/heartcombo/devise/master/Devise/Controllers/Helpers) automatically.

Roles:
  User
  Admin

Generated methods:
  authenticate_user!  # Signs user in or redirect
  authenticate_admin! # Signs admin in or redirect
  user_signed_in?     # Checks whether there is a user signed in or not
  admin_signed_in?    # Checks whether there is an admin signed in or not
  current_user        # Current signed in user
  current_admin       # Current signed in admin
  user_session        # Session data available only to the user scope
  admin_session       # Session data available only to the admin scope

Use:
  before_action :authenticate_user!  # Tell devise to use :user map
  before_action :authenticate_admin! # Tell devise to use :admin map

- Users have an **email** and **password**
- Use Devise for drop-in authentication
- Devise includes **modules** for additional functionality: Encrypt password, OmniAuth, Email confirmation, Recover password, Lock account, Expire session.
- Devise configures the [user table](https://rubydoc.info/github/heartcombo/devise/Devise/Models/Authenticatable) with same default columns.

| Name               | Type                        |
|--------------------|-----------------------------|
| id                 | integer                     |
| email              | character varying           |
| encrypted_password | character varying           |
| sign_in_count      | integer                     |
| current_sign_in_at | timestamp without time zone |
| created_at         | timestamp without time zone |
| updated_at         | timestamp without time zone |

## Add Devise

- For instructions on installing Devise go to [getting started](https://github.com/heartcombo/devise#getting-started)

Small recap:

1. `gem 'devise'` in `Gemfile`
2. `$ bundle install`
3. `$ rails generate devise:install`
4. `config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }` in `config/environments/development.rb`
5. `root to: "home#index"` in `config/routes.rb`
6. Create and update `home_controller.rb`
7. Create and update `views/home/index.html.erb`
8. `rails server` (ensure that MySQL server is running)
9. Update `views/layouts/application.html.erb` to include `<p class="notice"><%= notice %></p>` and `<p class="alert"><%= alert %></p>`
10. `$ rails generate devise User`
11. `$ rake db:migrate`
12. `rails server` if your application is nor running yet

- `http://localhost:3000/users/sign_in` and `http://localhost:3000/users/sign_up` should be available and functional.

## Add navigation

- Add Bootstrap CDN and `<%= render 'nav' %>` in `views/layouts/application.html.erb`
- Create and update `views/application/_nav.html.erb`

## Add publications

- The Publication Model:
  - The digital file subscribers will have access to
  - "Lightweight" model as it is not very relevant to implementing payments
  - Should be customized based on your needs
- Publication scheme:

| Name               | Type                        |
|--------------------|-----------------------------|
| id                 | integer                     |
| title              | character varying           |
| file_url           | character varying           |
| description        | character varying           |
| created_at         | timestamp without time zone |
| updated_at         | timestamp without time zone |

- Administrators:
  - Administrators are users with `is_admin` set to true
  - A initial administrator will be created, with the option to add more via the console
  - Many Ruby gems exist for handling administrators : `cancan`, `pundit`, `rolify`

- Administrator and Subscriber views:
  - Administrators can create, edit, and update publications
  - Subscribers can only view publications
  - Non-subscribers can see publications but not access their details

Publication Routes (Admin):

| Method | Route                        | Controller Action          |
|--------|------------------------------|----------------------------|
| GET    | /admin/publications          | admin/publications#index   |
| GET    | /admin/publications/:id      | admin/publications#show    |
| GET    | /admin/publications/new      | admin/publications#new     |
| POST   | /admin/publications          | admin/publications#create  |
| GET    | /admin/publications/:id/edit | admin/publications#edit    |
| PUT    | /admin/publications/:id      | admin/publications#update  |
| DELETE | /admin/publications/:id      | admin/publications#destroy |

Publication Routes (Subscriber):

| Method | Route                  | Controller Action          |
|--------|------------------------|----------------------------|
| GET    | /publications          | publications#index         |
| GET    | /publications/:id      | publications#show          |

Publication Routes (Non-subscriber):

| Method | Route                  | Controller Action          |
|--------|------------------------|----------------------------|
| GET    | /publications/:id      | publications#show          |

### Create the Publication model

- Create the publication model

```console
rails g model publication title:string description:text file_url:string
```

- Migrate the database to generate the publication model:

```console
rake db:migrate
```

- Add routes in `config/routes.rb`:

```ruby
resources :publications, only: [:index, :show]
```

- Create the `publications_controller.rb` and the `index` and `show` views.
- To add a publication for test you can type:

```console
rails c
p = Publication.new(title: 'My first publication', description: 'This is my first publication', file_url: 'http://myfilelocation.com')
p.save
exit
```

### Add administrators

- Create a migration file to add the `is_admin` column to the `users` table to allow users to become admin:

```console
rails g migration add_is_admin_to_users is_admin:boolean
```

- Modify the generated migration file for `add_is_admin_to_users` to set null to false and default to false.

```ruby
add_column :users, :is_admin, :boolean, null: false, default: false
```

- Run the migration:

```console
rake db:migrate
```

- You can test everything with the rails console:

```console
rails c
User.last
User.last.is_admin
User.last.update(is_admin: true)
```

- If you wish, you can set an admin in the `seeds.rb` (so you have one by default):

```ruby
User.create(
  email: 'admin@test.com',
  password: 'password',
  is_admin: true
)
```

### Build an administrator view for publications

- Update the `routes.rb` to add the admin routes.
- Create the `admin_controller.rb` under controllers.
- Add the `admin` folder under controllers, and add the `publications_controller.rb`.
- Add the `admin` folder under views and, under `admin` folder, the `publications` folder and add the `index.html.erb`, `edit.html.erb`, `show.html.erb`, `new.html.erb`.
- Run `rails s` and navigate to `localhost:3000/admin/publications` to test the admin routes.

### Build a subscriber view for publications

- We already did at `localhost:3000/publications`. You can check that everything works fine.

## Stripe API

### Discuss the payment processor Stripe

- Payment processors: `PayPal`, `Authorize.Net`, `Stripe`.
- Why Stripe?
  - PCI compliance is hard
  - Powerful API
  - Low cost
  - Great support

### Understand Stripe's subscription API

- Stripe's Subscription API
  - Allows recurring charges on a schedule
  - Handles storing credit card information
  - Additional features like coupons and trial periods are also available

### Integrate the Stripe library in our application

- Adding Stripe to Our application
  - Add the Stripe API gem
  - Find our Stripe API keys
  - Use `dotenv` to securely store API keys
  - Test the API in the console

- Go to [Stripe](https://stripe.com/en-ca) and open an account.
- Create a new product in the `Products` section. Example:

> Subscription App Bronze Plan 9.00 $ / month

1. Install Stripe libraries and tools

```ruby
# If you use bundler, you can add this line to your Gemfile
gem 'stripe'
```

- Run `bundle install`
- Create `config/initializers/stripe.rb` and paste the [Stripe.api_key](https://stripe.com/docs/api/authentication?lang=ruby)

```ruby
Stripe.api_key = 'sk_test_XXXXXXXXXXXXXXXXXXXXXX'
```

- To retrieve the subscription, you need to [retrieve the plan](https://stripe.com/docs/api/plans/retrieve?lang=ruby) using the [prices API](https://stripe.com/docs/api/prices) ID.
- You can test that everything works fine using the rails console:

```console
rails c
Stripe::Plan.retrieve('price_XXXXXXXXXXXXXXXXXX')
exit
```

> Notice: be sure to use your `API key` and the `price_id` of your product (if you are logged in, the provided examples should already have your keys and price_id).

### Learn how to securely store configuration keys

- Add `dotenv`. A `.env` file can keep the API keys out of the code.
- Add the API key in a [dotenv](https://github.com/bkeepers/dotenv) file.
- Add `gem 'dotenv-rails', groups: [:development, :test]` to Gemfile and run `bundle install`.
- Create `.env` file and add `STRIPE_API_KEY="XXXXXXXXXXX"`. Make sure that `.env` is in `.gitignore`.
- Update `stripe.rb`: `Stripe.api_key = ENV["STRIPE_API_KEY"]`.
- Test again in your console that everything is still working:

```console
rails c
Stripe.api_key
exit
```

## Add subscriptions

### Build the Subscription model

- Tied to a user
- `active` boolean
- Stores Stripe user_id for retrieval

- Create the subscription model:

```console
rails generate model subscription stripe_user_id:string active:boolean user:references
```

- Update `create_subscriptions.rb` migration file to ensure `active` can't be null and is false by default:

```ruby
t.boolean :active, null: false, default: false
```

- Add the subscription relation to `user.rb` model:

```ruby
has_one :subscription
```

- Make sure that the user relation is set in `subscription.rb` model:

```ruby
belongs_to :user
```

- Run `rake db:migrate`

- Add an [active record callback](https://guides.rubyonrails.org/active_record_callbacks.html) in the `user.rb` model to generate a default subscription to every new user:

```ruby
after_create :create_subscription
def create_subscription
  Subscription.create(user_id: id) if subscription.nil?
end
```

- Add a new migration to ensure previous users also have a subscription:

```console
rails g migration AddSubscriptionToPreviousUsers
```

- Update the `add_subscription_to_previous_users.rb` migration file with the `up` function. More details at [active record migrations](https://edgeguides.rubyonrails.org/active_record_migrations.html):

```ruby
def up
  User.all.each do |user|
    user.create_subscription
  end
end
```

- Run `rake db:migrate`

> We should see that a subscription is created for every existing user.

- You can also verify with rails console:

```console
rails c
User.last.subscription
exit
```

#### Creating the User info Screen

```console
rails generate controller users info
```

- Update `routes.rb`:

```ruby
get '/users/info', to: 'users#info'
```

- Update `users_controller.rb`:

```ruby
before_action :authenticate_user!
def info
  @subscription = current_user.subscription
end
```

- Update `app/views/users/info.html.erb`:

```html
<%= current_user.email %>
<% if @subscription.active %>
subscribed
<% else %>
unsubscribed
<% end %>
```

- Navigate to `localhost:3000/users/info`

### Accept credit cards using Stripe.js

- Client-side JavaScript library
- Credit card information never touches our servers
- A Stripe `token` is used to communicate back and forth
- Gather credit card information in a form
- Send it directly to Stripe from the browser
- Recommended by Stripe
- Local Subscription model becomes super light-weight

### Tie a subscription to a user with Stripe API

- Using the Stripe token, we create a subscription with the Stripe Ruby library
- The corresponding user_id from Stripe is stored locally for easy retrieval

### Create a view to show a user's subscription status
