#!/bin/sh

echo "🚀 Starting ShopIT Backend..."

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 3

# Run seeders (they handle duplicate checks internally)
echo "🌱 Seeding database..."
node backend/seeder/adminSeeder.js || true
node backend/seeder/seeder.js || true

echo "✅ Database seeded!"

# Start the main application
echo "🚀 Starting server..."
exec node backend/app.js
