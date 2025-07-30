#!/bin/bash

# Create macOS app icon from SVG
echo "🎨 Creating SnapHashQR app icon..."

# Check if we have the required tools
if ! command -v sips &> /dev/null; then
    echo "❌ sips command not found (required for image conversion)"
    exit 1
fi

# Create icon directory structure
mkdir -p assets/icon.iconset

# Convert SVG to different PNG sizes for macOS icon
sizes=(16 32 64 128 256 512)

for size in "${sizes[@]}"; do
    echo "Creating ${size}x${size} icon..."
    # Use sips to convert SVG to PNG
    sips -s format png -Z $size assets/icon.svg --out assets/icon.iconset/icon_${size}x${size}.png
    
    # Create @2x versions for retina displays
    if [ $size -le 256 ]; then
        double_size=$((size * 2))
        echo "Creating ${size}x${size}@2x icon..."
        sips -s format png -Z $double_size assets/icon.svg --out assets/icon.iconset/icon_${size}x${size}@2x.png
    fi
done

# Create the .icns file
echo "📦 Creating .icns file..."
iconutil -c icns assets/icon.iconset -o assets/icon.icns

# Also create a simple PNG for other uses
sips -s format png -Z 512 assets/icon.svg --out assets/icon.png

echo "✅ Icon files created successfully!"
echo "   - assets/icon.icns (for macOS app)"
echo "   - assets/icon.png (general use)"
echo "   - assets/icon.svg (source)"
