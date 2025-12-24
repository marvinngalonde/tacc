#!/bin/sh
# Startup script for Prisma 7 with PostgreSQL adapter

echo "🚀 Starting TACC PMS..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

# Convert postgres:// to postgresql:// if needed
export DATABASE_URL=$(echo $DATABASE_URL | sed 's/^postgres:/postgresql:/')

echo "📦 Setting up database schema..."

# Create a temporary schema file with the URL for db push
cat > /tmp/schema.prisma << EOF
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
EOF

# Append the rest of the schema (skip the first 11 lines which contain generator and datasource)
tail -n +12 /app/prisma/schema.prisma >> /tmp/schema.prisma

# Run db push with the temporary schema
npx prisma db push --schema=/tmp/schema.prisma

# Check if seeding is requested
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npm run seed
fi

echo "✅ Database setup complete"
echo "🎯 Starting application..."

# Start the Next.js server
exec node server.js
