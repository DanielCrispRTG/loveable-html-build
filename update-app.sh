#!/bin/bash

# Quick update script for SnapHashQR
echo "🔄 Updating SnapHashQR in Applications..."

# Kill any running instances
echo "🛑 Stopping any running instances..."
pkill -f "SnapHashQR" 2>/dev/null || true

# Rebuild and reinstall
echo "🔨 Rebuilding and reinstalling..."
npm run build-mac

if [ -d "dist/mac/SnapHashQR.app" ]; then
    # Remove old version
    rm -rf "/Applications/SnapHashQR.app" 2>/dev/null || true
    
    # Install new version
    cp -r "dist/mac/SnapHashQR.app" "/Applications/"
    
    echo "✅ SnapHashQR updated successfully!"
    echo "🚀 Launching updated app..."
    
    # Launch the updated app
    open "/Applications/SnapHashQR.app"
else
    echo "❌ Build failed"
    exit 1
fi
