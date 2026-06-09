#!/bin/bash
set -e

echo "Start database creation"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL1
	create database $APP_DB;
	create user $APP_USER;
	alter role $APP_USER with password '$APP_PASSWORD'
EOSQL1

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$APP_DB" -f /docker-entrypoint-initdb.d/initial_db_setup.psql;

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$APP_DB" <<-EOSQL2
	grant select, insert, update, delete on all tables in schema public to $APP_USER;
	grant usage on sequence hibernate_sequence to $APP_USER;
EOSQL2

echo "Finish database creation"
