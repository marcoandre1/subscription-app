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

- Migrate the database:

```console
rake db:migrate
```

### Add administrators

### Build an administrator view for publications

### Build a subscriber view for publications
