---
description: Build Android APK
---

To build a new Android APK for your app, verify your `eas.json` configuration and then run the build command.

1. **Verify `eas.json`**: Ensure you have the `production` profile configured with `"buildType": "apk"`.

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

2. **Run Build Command**:

// turbo
```bash
npx eas-cli build -p android --profile production
```

3. **Follow Prompts**:
   - If asked to log in, follow the instructions to log in to your Expo account.
   - Wait for the build to complete in the cloud.
   - Download the APK from the link provided at the end.
