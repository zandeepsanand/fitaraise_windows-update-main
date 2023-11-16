/* eslint-disable prettier/prettier */
import React, { useContext, useEffect } from 'react';
import 'react-native-gesture-handler';
import { DataProvider } from './src/hooks';
import AppNavigation from './src/navigation/App';
import LoginContext, { LoginProvider } from './src/hooks/LoginContext';
import * as Notifications from 'expo-notifications';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const { customerId } = useContext(LoginContext);
  console.log(customerId , "from main app.tsx");
  
  useEffect(() => {
    registerForPushNotifications();

    // Add a listener for received notifications
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Handle received notification here
      console.log('Received notification:', notification);
    });

    // Add a listener for notification responses
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response here
      console.log('Notification response:', response);
    });

    // Clean up the listeners when the component unmounts
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function registerForPushNotifications() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
        const device_token = token;
        console.log('Expo push token:', token);

        // Store the token in AsyncStorage for later use
        await AsyncStorage.setItem('expoPushToken', device_token);

        // Uncomment and complete this part to send the token to your server
        // await api.post('set_personal_datas', { customerId, device_token });
      
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  return (
    <LoginProvider>
      <DataProvider>
        <AppNavigation />
      </DataProvider>
    </LoginProvider>
  );
}
