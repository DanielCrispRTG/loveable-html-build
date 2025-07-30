#!/bin/bash

# SnapHashQR Desktop App Installer
echo "🚀 Building and Installing SnapHashQR to Applications..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create the app icon
echo "🎨 Creating app icon..."
if [ -f "create-icon.sh" ]; then
    ./create-icon.sh
else
    echo "⚠️  Icon creation script not found, using default icon"
fi

# Build the macOS app
echo "🔨 Building macOS application..."
npm run build-mac

# Check if build was successful
if [ -d "dist/mac/SnapHashQR.app" ]; then
    echo "✅ Build successful!"
    
    # Copy to Applications folder
    echo "📱 Installing to Applications folder..."
    
    # Remove existing app if it exists
    if [ -d "/Applications/SnapHashQR.app" ]; then
        echo "🗑️  Removing existing SnapHashQR.app..."
        rm -rf "/Applications/SnapHashQR.app"
    fi
    
    # Copy new app
    cp -r "dist/mac/SnapHashQR.app" "/Applications/"
    
    # Verify installation
    if [ -d "/Applications/SnapHashQR.app" ]; then
        echo "🎉 SnapHashQR successfully installed to Applications!"
        echo "📱 You can now find it in your Applications folder or Launchpad"
        echo "🚀 Opening the app..."
        
        # Open the app
        open "/Applications/SnapHashQR.app"
    else
        echo "❌ Installation failed - could not copy to Applications folder"
        exit 1
    fi
else
    echo "❌ Build failed - SnapHashQR.app not found in dist/mac/"
    exit 1
fi

echo ""
echo "✅ Installation complete!"
echo "   📍 App location: /Applications/SnapHashQR.app"
echo "   🎯 You can now launch SnapHashQR from Applications or Spotlight"
