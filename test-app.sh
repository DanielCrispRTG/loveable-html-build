#!/bin/bash

echo "🧪 Testing SnapHashQR Main App..."

# Function to test different modes
test_app_mode() {
    local mode=$1
    echo "📱 Testing $mode mode..."
    
    case $mode in
        "main")
            echo "🚀 Starting main app..."
            npm start &
            ;;
        "debug")
            echo "🔧 Starting debug mode..."
            npm run debug &
            ;;
        "camera-test")
            echo "📹 Starting camera test..."
            npm run camera-test &
            ;;
    esac
    
    local pid=$!
    echo "   Process ID: $pid"
    echo "   Waiting 3 seconds for app to load..."
    sleep 3
    
    if ps -p $pid > /dev/null; then
        echo "   ✅ App started successfully"
        echo "   📱 Check the app window for functionality"
        echo "   Press Ctrl+C in the app to stop"
        wait $pid
    else
        echo "   ❌ App failed to start"
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in the right directory. Please run from the project root."
    exit 1
fi

echo "🔍 Available test modes:"
echo "  1) main - Full SnapHashQR app"
echo "  2) debug - Debug mode with diagnostics"
echo "  3) camera-test - Simple camera test"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        test_app_mode "main"
        ;;
    2)
        test_app_mode "debug"
        ;;
    3)
        test_app_mode "camera-test"
        ;;
    *)
        echo "❌ Invalid choice. Running main app..."
        test_app_mode "main"
        ;;
esac

echo "🏁 Test completed."
