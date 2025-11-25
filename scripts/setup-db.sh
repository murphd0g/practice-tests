#!/usr/bin/env bash

DB_NAME=practice_tests_db

# If Postgres is not installed or psql is not available, exit
if ! command -v psql >/dev/null 2>&1; then
  echo "psql command not found. Install PostgreSQL or ensure psql is in PATH." >&2
  exit 1
fi

# Create database if it doesn't exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo "Creating database $DB_NAME..."
  createdb "$DB_NAME" || { echo "Failed to create database $DB_NAME"; exit 1; }
else
  echo "Database $DB_NAME already exists"
fi

# Run schema SQL
echo "Running schema SQL..."
psql -d "$DB_NAME" -f scripts/schema.sql

echo "Database setup complete."
