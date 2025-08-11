#!/bin/bash

# Test Vercel Build Process Locally
echo "🧪 Testing Vercel build process locally..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf client/dist
rm -rf server/dist

# Install dependencies (simulating Vercel's install command)
echo "📦 Installing dependencies..."
npm install --no-audit --no-fund

# Run the build command (simulating Vercel's build command)
echo "🔨 Running build command..."
npm run -w client build

# Check if build was successful
if [ -d "client/dist" ]; then
    echo "✅ Build successful! Output directory created at client/dist"
    echo "📊 Build output:"
    ls -la client/dist/
    echo ""
    echo "📁 Assets directory:"
    ls -la client/dist/assets/ 2>/dev/null || echo "No assets directory found"
else
    echo "❌ Build failed! Output directory not found"
    exit 1
fi

echo ""
echo "🎉 Vercel build test completed successfully!"
echo "💡 If this test passes, your Vercel deployment should work."
echo "📝 Don't forget to set up environment variables in Vercel dashboard!"