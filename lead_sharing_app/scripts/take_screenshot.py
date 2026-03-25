import subprocess
import datetime
import os
import sys

def take_screenshot():
    # Make sure screenshots directory exists
    if not os.path.exists('screenshots'):
        os.makedirs('screenshots')
    
    # Generate filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"screenshot_{timestamp}.png"
    remote_path = f"/sdcard/{filename}"
    local_path = os.path.join("screenshots", filename)
    
    print(f"Taking screenshot: {filename}...")
    
    try:
        # 1. Capture the screen on the device
        subprocess.run(["adb", "shell", "screencap", "-p", remote_path], check=True)
        
        # 2. Pull the file from the device to the computer
        subprocess.run(["adb", "pull", remote_path, local_path], check=True)
        
        # 3. Remove the temporary file from the device
        subprocess.run(["adb", "shell", "rm", remote_path], check=True)
        
        print(f"Success! Screenshot saved to: {local_path}")
    except subprocess.CalledProcessError as e:
        print(f"Error: ADB command failed. {e}")
        print("Check if your device is connected via ADB ('adb devices').")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    take_screenshot()
