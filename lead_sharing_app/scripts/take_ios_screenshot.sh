#!/bin/bash

# Get the absolute path of the scripts directory
SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPTS_DIR" )"

# Define screenshots directory at project root
SCREENSHOTS_DIR="$PROJECT_ROOT/ios_screenshots"
mkdir -p "$SCREENSHOTS_DIR"

# Generate timestamped filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="ios_screenshot_${TIMESTAMP}.png"
FILEPATH="$SCREENSHOTS_DIR/$FILENAME"

echo "📸 Taking iOS simulator screenshot..."

# Check if an iOS simulator is booted
BOOTED_CHECK=$(xcrun simctl list devices booted | grep "(Booted)")

if [ -z "$BOOTED_CHECK" ]; then
    echo "❌ Error: No iOS simulator is currently running."
    echo "Please start a simulator first."
    exit 1
fi

# Capture the screenshot from the booted simulator using absolute path
xcrun simctl io booted screenshot "$FILEPATH"

if [ $? -eq 0 ]; then
    echo "📏 Resizing to App Store dimensions (6.7\" Display)..."
    
    # Get current dimensions
    WIDTH=$(sips -g pixelWidth "$FILEPATH" | awk '/pixelWidth/ {print $2}')
    HEIGHT=$(sips -g pixelHeight "$FILEPATH" | awk '/pixelHeight/ {print $2}')
    
    if [ "$WIDTH" -lt "$HEIGHT" ]; then
        # Portrait: Target 1284 x 2778
        sips -z 2778 1284 "$FILEPATH" > /dev/null
    else
        # Landscape: Target 2778 x 1284
        sips -z 1284 2778 "$FILEPATH" > /dev/null
    fi
    
    echo "✅ Success! Resized screenshot saved to: $FILEPATH"
    # Open the file automatically for preview
    open "$FILEPATH"
else
    echo "❌ Failed to take screenshot."
    echo "Tip: Ensure the simulator is fully loaded and on a screen that allows capture."
    exit 1
fi
