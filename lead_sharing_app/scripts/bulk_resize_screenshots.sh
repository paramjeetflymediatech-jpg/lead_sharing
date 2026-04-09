#!/bin/bash

# Get the absolute path of the scripts directory
SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPTS_DIR" )"

# Target dimensions
IPHONE_W=1284
IPHONE_H=2778
IPAD_W=2048
IPAD_H=2732

echo "🔍 Scanning for existing screenshots to resize..."

# Process iPhone screenshots
if [ -d "$PROJECT_ROOT/ios_screenshots" ]; then
    find "$PROJECT_ROOT/ios_screenshots" -maxdepth 1 -name "*.png" | while read -r img; do
        echo "Processing iPhone screenshot: $(basename "$img")"
        WIDTH=$(sips -g pixelWidth "$img" | awk '/pixelWidth/ {print $2}')
        HEIGHT=$(sips -g pixelHeight "$img" | awk '/pixelHeight/ {print $2}')
        
        if [ "$WIDTH" -lt "$HEIGHT" ]; then
            sips -z $IPHONE_H $IPHONE_W "$img" > /dev/null
        else
            sips -z $IPHONE_W $IPHONE_H "$img" > /dev/null
        fi
    done
fi

# Process iPad screenshots
if [ -d "$PROJECT_ROOT/ios_screenshots/ipad" ]; then
    find "$PROJECT_ROOT/ios_screenshots/ipad" -maxdepth 1 -name "*.png" | while read -r img; do
        echo "Processing iPad screenshot: $(basename "$img")"
        WIDTH=$(sips -g pixelWidth "$img" | awk '/pixelWidth/ {print $2}')
        HEIGHT=$(sips -g pixelHeight "$img" | awk '/pixelHeight/ {print $2}')
        
        if [ "$WIDTH" -lt "$HEIGHT" ]; then
            sips -z $IPAD_H $IPAD_W "$img" > /dev/null
        else
            sips -z $IPAD_W $IPAD_H "$img" > /dev/null
        fi
    done
fi

echo "✅ Bulk resizing complete!"
