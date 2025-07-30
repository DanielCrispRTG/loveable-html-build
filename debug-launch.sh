#!/bin/bash

# Debug version launcher for SnapHashQR
echo "🔧 Starting SnapHashQR in Debug Mode..."

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

# Start the Electron app with debug logging
echo "🚀 Launching SnapHashQR in debug mode..."
echo "📋 Watch the terminal for debug messages..."
npm run dev
