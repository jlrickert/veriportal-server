Veriportal
==========

Tracking who signed what made easy

# Install

## Get the code

Clone the git repository available on github and change directory to it:

```bash
git clone https://github.com/jlrickert/veriportal.git
cd veriportal
```

## Prerequisites


| Dependency | version | Arch Package | Ubuntu Package | Description                |
| ---------- | ------- | ------------ | -------------- | -----------                |
| PostgreSQL | 9.0+    | postgresql   |                | Primary datastore          |
| node       | 9.6+    | nodejs       |                | Javascript environment     |
| npm        | 5.6+    | npm          |                | Javascript package manager |

Note: Versions are based on the versions that wered used during development and
older versions will probably work but are not tested.

## Configuration

Copy `.env.sample` to `.env` and edit `.env`.

Options include:

| Option            | Default  | Description                                                                                                      |
| ----------------- | -------- | ----------------------------------------------                                                                   |
| APP_PORT          | 3001     | Port server will run on                                                                                          |
| DATABASE_URL      |          | Database connection string to connect to a postgesql database. Ex. postgres://username:password@url/databasename |

## Postgresql

Primary data store. This assumes that 


This guide assumes you have a working PostgreSQL install running under the unix
user postgres, and that you can access it with sudo -u postgres psql. That's the
norm if you installed PostgreSQL on Ubuntu/Debian/Fedora from operating system
packages, and on Mac OS X using Homebrew. To test that, copy and paste the
following command to your terminal and run it:

```bash
sudo -u postgres psql -qAt -c "SELECT 'connected ok, superuser: ' || (select usesuper from pg_user where usename = CURRENT_USER)||', version: '||version()"

```

It should print something like:

```bash
connected ok, superuser: true, version: PostgreSQL 10.2 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 7.3.0, 64-bit
```

### Create the database

Create a database for veriportal

```bash
sudo -u postgresql createdb -E utf8 veriportal
```

If you want to run tests or a development server create the test and development
database bases.

```bash
sudo -u postgresql createdb -E utf8 veriportal-dev
sudo -u postgresql createdb -E utf8 veriportal-test
```

Note: the database name doesn't have to be `veriportal`. However, `-dev` and
`-test` are still necessary for dev and test mode as the application will look
for the prefixes.

Create a user to connect to the database

```bash
sudo -u postgresql psql veriportal
> CREATE USER veriportal WITH PASSWORD 'password'
> \q
```

Add or edit `DATABASE_URL` in `.env` so that the application will know how to
connect to the database assuming that the database is running on localhost. For Example:

```bash
DATABASE_URL=postgresq://veriportal:password@127.0.0.1:5432/veriportal
```

## Start application

Install all the Javascript dependencies:

```bash
npm install
```

Migrate schema to the database. If a production mode is desired prepend all
commands with NODE_ENV=production.

```bash
npm run migrate
NODE_ENV=production npm migrate # for production mode
```

To start the server run:

```bash
npm run start
NODE_ENV=production npm run start # for production mode
```

## Running tests

Make sure to have a test database setup. To run tests run:

```bash
npm run test
```
