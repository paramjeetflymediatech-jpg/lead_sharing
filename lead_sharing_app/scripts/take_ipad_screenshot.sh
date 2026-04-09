#!/bin/bash

# Create iPad screenshots directory if it doesn't exist
mkdir -p ios_screenshots/ipad

# Generate timestamped filename
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="ipad_screenshot_${TIMESTAMP}.png"
FILEPATH="ios_screenshots/ipad/${FILENAME}"

echo "📸 Taking iPad screenshot..."

# Check if an iOS simulator is booted
BOOTED_CHECK=$(xcrun simctl list devices booted | grep "(Booted)")

if [ -z "$BOOTED_CHECK" ]; then
    echo "❌ Error: No iOS simulator is currently running."
    echo "Please start your iPad simulator first."
    exit 1
fi

# Capture the screenshot from the booted simulator
xcrun simctl io booted screenshot "$FILEPATH"

if [ $? -eq 0 ]; then
    echo "✅ Success! Screenshot saved to: $FILEPATH"
    # Open the file automatically for preview
    open "$FILEPATH"
else
    echo "❌ Failed to take screenshot."
    exit 1
fi
