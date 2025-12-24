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

# Run db push (uses prisma.config.ts for URL)
npx prisma db push

# Check if seeding is requested
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx tsx prisma/seed.ts
fi

echo "✅ Database setup complete"
echo "🎯 Starting application..."

# Start the Next.js server
exec node server.js
