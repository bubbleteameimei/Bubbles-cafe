#!/bin/bash

# Render build script for Bubbles Cafe monorepo
set -e  # Exit on any error

echo "🚀 Starting Render build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build client
echo "🔨 Building client..."
cd client
npm install
npm run build
cd ..

# Build server
echo "🔨 Building server..."
cd server
npm install
npm run build
cd ..

# Prepare for deployment
echo "📁 Preparing deployment files..."
npm run deploy:prepare

echo "✅ Build completed successfully!"