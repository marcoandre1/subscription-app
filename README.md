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
rake db:migrate
```

- Open your project in Visual Studio Code. _You can type `explorer.exe .` to open the project on windows (for BashOnUbuntuOnWindows)._

## Introducing Devise

- [Devise](https://github.com/heartcombo/devise) provides a number of user [routes](https://rubydoc.info/github/heartcombo/devise/ActionDispatch/Routing/Mapper) automatically.

Session routes for Authenticatable (default):

| new_user_session GET        | /users/sign_in  | {controller:"devise/sessions", action:"new"}      |
| destroy_user_session DELETE | /users/sign_out | {controller:"devise/sessions", action:"destroy"}  |
| new_user_registration GET   | /users/sign_up  | {controller:"devise/registrations", action:"new"} |

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

| id                 | integer                     |
| email              | character varying           |
| encrypted_password | character varying           |
| sign_in_count      | integer                     |
| current_sign_in_at | timestamp without time zone |
| created_at         | timestamp without time zone |
| updated_at         | timestamp without time zone |

## Add Devise
