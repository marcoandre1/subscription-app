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
