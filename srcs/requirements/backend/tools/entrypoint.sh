#!/bin/sh

echo "Waiting for PostgreSQL to start..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "✓ PostgreSQL is up and running!"

echo "Running migrations..."
pipenv run python manage.py makemigrations --noinput
pipenv run python manage.py migrate --noinput
echo "✓ Migrations are successfully applied!"

exec pipenv run "$@"
