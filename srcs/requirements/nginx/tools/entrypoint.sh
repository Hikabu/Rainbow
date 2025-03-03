#!/bin/sh

echo "Waiting for backend to start..."
until curl -s http://backend:8000/ > /dev/null; do
    echo "Waiting for backend to respond..."
    sleep 2
done
echo "✓ Backend is up and running!"

echo "Waiting for PostgreSQL to start..."
until nc -z postgres 5432; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo "✓ PostgreSQL is up and running!"

exec nginx -g 'daemon off;'
