import supabase from './supabase';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import BackgroundFetch from 'react-native-background-fetch';

// Task names
const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Save location to backend
const sendLocationToBackend = async (latitude: number, longitude: number) => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL as string;
  const { data: { user } } = await supabase.auth.getUser();
  const user_id = user?.id;
  if (!user) throw new Error('User not authenticated');
  console.log('User ID:', user_id);

  const response = await fetch(`${apiBaseUrl}/save-location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, latitude, longitude }),
  });

  if (!response.ok) throw new Error('Failed to save location');
  console.log('Location saved:', { user_id, latitude, longitude });
};

// Location task (This remains the same as before)
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error('Error in background location task:', error);
    return;
  }
  if (data) {
    try {
      const { locations } = data as { locations: Location.LocationObject[] };
      const { latitude, longitude } = locations[0].coords;
      console.log('Location received:', { latitude, longitude });
      console.log('Save location attempt:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
      await sendLocationToBackend(latitude, longitude);
      console.log('Location saved successfully:', { latitude, longitude });
    } catch (error) {
      console.error('Failed to save location in background location task:', error);
    }
  }
});

// Background fetch task with react-native-background-fetch
const onBackgroundFetchEvent = async (taskId: string) => {
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
    }

    // Finish the task and signal success
    BackgroundFetch.finish(taskId);
    console.log('Background fetch task completed');
  } catch (error) {
    console.error('Error in background fetch task:', error);
    BackgroundFetch.finish(taskId);
  }
};

// Register the background fetch task
const registerBackgroundFetch = () => {
  BackgroundFetch.configure({
    minimumFetchInterval: 15, // Minimum interval (in minutes)
    stopOnTerminate: false,   // Continue running even if the app is terminated
    startOnBoot: true,        // Start on device reboot
    enableHeadless: true,     // Enable headless mode
    requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY, // Allow any network type
    requiresCharging: false,  // Do not require charging
    requiresDeviceIdle: false, // Do not require device idle state
    requiresBatteryNotLow: false, // Do not require battery to be full
    requiresStorageNotLow: false, // Do not require sufficient storage
  }, onBackgroundFetchEvent, onTimeout);

  // Start background fetch immediately
  BackgroundFetch.start();
  console.log('Background fetch registered and started');
};

// onTimeout callback to handle when the background fetch time is about to expire
const onTimeout = (taskId: string) => {
  console.log('Background fetch timeout. Finishing task early.');
  BackgroundFetch.finish(taskId);
};

// Start location tracking
export const startLocationTracking = async (): Promise<void> => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Permission to access location was denied');
  }

  console.log('Starting location tracking');
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High, // High accuracy
    // timeInterval: 300000, // Every 5 minutes
    timeInterval: 900000, // Every 15 minutes
    distanceInterval: 5, // Every 5 meters
    showsBackgroundLocationIndicator: true, // Android only
    foregroundService: {
      notificationTitle: 'Using your location', // Android only
      notificationBody: 'To turn off, go back to the app and switch something off.', // Android only
    },
  });

  // Register background fetch task after location tracking starts
  console.log('Registering background fetch');
  registerBackgroundFetch();

  console.log('Location tracking started');
  console.log('First location update:', await Location.getLastKnownPositionAsync());
  console.log('Time:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
};

// Stop location tracking
export const stopLocationTracking = async (): Promise<void> => {
  console.log('Stopping location tracking');
  await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);

  // Unregister background fetch when stopping location tracking
  console.log('Unregistering background fetch');
  BackgroundFetch.stop();
};
