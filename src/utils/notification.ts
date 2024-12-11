import * as Notifications from 'expo-notifications';

export const setupNotificationChannel = async (): Promise<void> => {
  await Notifications.setNotificationChannelAsync('tracking', {
    name: 'Tracking',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  })
}

export const sendTrackingNotification = async (): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Tracking Active',
      body: 'Your location is being updated in the background!',
    },
    trigger: null,
  })
}