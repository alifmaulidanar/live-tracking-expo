import supabase from './supabase';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Task names
const LOCATION_TASK_NAME = 'background-location-task';
const BACKGROUND_FETCH_TASK = 'background-fetch';

// Save location to backend
const sendLocationToBackend = async (latitude: number, longitude: number) => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL as string;
  const { data: { user } } = await supabase.auth.getUser();
  const user_id = user?.id;
  if (!user) throw new Error('User not authenticated');

  const response = await fetch(`${apiBaseUrl}/save-location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, latitude, longitude }),
  });

  if (!response.ok) throw new Error('Failed to save location');
  console.log('Location saved:', { user_id, latitude, longitude });
};

// Location task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    try {
      const { locations } = data as { locations: Location.LocationObject[] };
      const { latitude, longitude } = locations[0].coords;
      console.log('Location received:', { latitude, longitude });
      console.log('Save location attempt:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
      await sendLocationToBackend(latitude, longitude);
      console.log('Save location updated:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  }
});

// Background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error(error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      throw new Error('Permission to access location was denied');
    }

    const lastKnownPosition = await Location.getLastKnownPositionAsync();
    if (lastKnownPosition) {
      const { latitude, longitude } = lastKnownPosition.coords;
      await sendLocationToBackend(latitude, longitude);
      console.log('Location saved in background fetch:', { latitude, longitude });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('Error in background fetch task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Start location tracking
export const startLocationTracking = async (): Promise<void> => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Permission to access location was denied');
  }

  console.log('Starting location tracking');
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 60000, // Every 1 minutes
    // timeInterval: 300000, // Every 5 minutes
    distanceInterval: 1,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Using your location',
      notificationBody: 'To turn off, go back to the app and switch something off.',
    },
  });

  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60, // 1 minutes in seconds
    // minimumInterval: 300, // 5 minutes in seconds
  });

  console.log('Location tracking started');
  console.log('First location update:', await Location.getLastKnownPositionAsync());
  console.log('Time:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
};

// Stop location tracking
export const stopLocationTracking = async (): Promise<void> => {
  console.log('Stopping location tracking');
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
};