
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from './api';

// Configure how notifications are handled when the app is in the foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
  });
} catch (e) {
  console.warn('[NotificationService] Failed to set notification handler:', e);
}

export const NotificationService = {
  /**
   * Register for push notifications
   * Returns the push token or null
   */
  registerForPushNotificationsAsync: async () => {
    let token;

    if (Platform.OS === 'web') {
      console.log('[NotificationService] Web platform detected, skipping notification registration');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[NotificationService] Using dummy token for simulator');
      token = "SIMULATOR_TOKEN_" + (Platform.OS === 'android' ? 'ANDROID' : 'IOS');
      try {
        await AsyncStorage.setItem('push_device_token', token);
      } catch (e) {
        console.error('[NotificationService] Failed to save simulator token:', e);
      }
      return token;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[NotificationService] Notification permission not granted');
        return null;
      }

      // Get the token specifically for Expo
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId ??
          "4631fecd-0a2f-4f8f-a678-88df81b831af"; // Fallback to app.json's ID

        console.log('[NotificationService] Requesting token with Project ID:', projectId);

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('[NotificationService] Expo Push Token:', token ? 'SUCCESS' : 'FAILED');

        if (Platform.OS === 'android') {
          try {
            await Notifications.setNotificationChannelAsync('default', {
              name: 'default',
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: '#FF231F7C',
              enableVibrate: true,
              showBadge: true,
              playSound: true,
            });
          } catch (e) {
            console.warn('[NotificationService] Failed to set notification channel:', e);
          }
        }

        // Cache token locally
        try {
          await AsyncStorage.setItem('push_device_token', token);
        } catch (e) {
          console.error('[NotificationService] Failed to save token to storage:', e);
        }

        return token;
      } catch (tokenError) {
        console.error('[NotificationService] Error getting token:', tokenError);
        return null;
      }
    } catch (error) {
      console.error('[NotificationService] Error registering for push notifications:', error);
      return null;
    }
  },

  /**
   * Sync the push token with the backend
   */
  syncTokenWithBackend: async (forceToken = null) => {
    try {
      const token = forceToken || await AsyncStorage.getItem('push_device_token');
      if (!token) {
        console.log('[NotificationService] No token found in storage to sync');
        return;
      }

      // Ensure we have a registerPushToken method in authAPI
      if (authAPI.registerPushToken) {
        try {
          await authAPI.registerPushToken(token, Platform.OS);
          console.log('[NotificationService] Token synced with backend');
          try {
            await AsyncStorage.setItem('push_token_synced', 'true');
          } catch (e) {
            console.error('[NotificationService] Failed to mark token as synced:', e);
          }
        } catch (apiError) {
          console.warn('[NotificationService] API Sync failed:', apiError.message);
          // Don't throw, just log
        }
      }
    } catch (error) {
      console.error('[NotificationService] Error syncing token with backend:', error);
    }
  },

  /**
   * Add listener for incoming notifications
   */
  addListener: (callback) => {
    try {
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('[NotificationService] Notification Received:', notification);
        try {
          if (callback) callback(notification);
        } catch (e) {
          console.error('[NotificationService] Error in notification callback:', e);
        }
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('[NotificationService] Notification Tapped:', response);
        // You can handle navigation here based on data in response.notification.request.content.data
      });

      return () => {
        try {
          notificationListener.remove();
          responseListener.remove();
        } catch (e) {
          console.error('[NotificationService] Error removing listeners:', e);
        }
      };
    } catch (e) {
      console.error('[NotificationService] Error adding listeners:', e);
      return () => { };
    }
  },

  /**
   * Initial channel setup for Android
   */
  init: async () => {
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          enableVibrate: true,
          showBadge: true,
          playSound: true,
        });
      } catch (e) {
        console.warn('[NotificationService] Failed to init notification channel:', e);
      }
    }
  }
};
