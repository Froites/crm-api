#!/bin/bash

echo "🚀 Setting up CRM API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and try again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🐳 Starting MongoDB with Docker..."
docker-compose up -d

echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

echo "📄 Copying environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env file created. Please update the environment variables if needed."
else
    echo "⚠️ .env file already exists. Skipping copy."
fi

echo "🗄️ Generating Prisma client..."
npx prisma generate

echo "🔄 Pushing database schema..."
npx prisma db push

echo "🌱 Seeding database with sample data..."
npx prisma db seed

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review the .env file and update any necessary configurations"
echo "2. Start the development server: npm run start:dev"
echo "3. Access the API documentation at: http://localhost:3000/docs"
echo ""
echo "🔐 Default login credentials:"
echo "Admin: admin@crm.com / admin123"
echo "Manager: manager@crm.com / manager123"
echo "Agent: agent1@crm.com / agent123"
echo ""
echo "🎉 Happy coding!"