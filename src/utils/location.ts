import supabase from './supabase';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

// Task names
const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Save location to backend
const sendLocationToBackend = async (latitude: number, longitude: number) => {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL as string;
  const { data: { user } } = await supabase.auth.getUser();
  const user_id = user?.id;
  if (!user) throw new Error('User not authenticated');

  console.log('Sending location data to backend');
  const response = await fetch(`${apiBaseUrl}/save-location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, latitude, longitude }),
  });

  if (!response.ok) throw new Error('Failed to save location');
  console.log('Location saved:', { user_id, latitude, longitude });
};

// Location task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    try {
      console.log('BACKGROUND_LOCATION_TASK');
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

// Start location tracking
export const startLocationTracking = async (): Promise<void> => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error('Permission to access location was denied');
  }

  console.log('Starting location tracking');
  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High, // High accuracy
    // timeInterval: 60000, // Every 1 minute
    timeInterval: 300000, // Every 5 minutes
    // timeInterval: 3000000, // Every 50 minutes
    distanceInterval: 5, // Every 5 meters
    showsBackgroundLocationIndicator: true, // Android only
    foregroundService: {
      notificationTitle: 'Using your location', // Android only
      notificationBody: 'To turn off, go back to the app and switch something off.', // Android only
    },
  });
  console.log('BACKGROUND_LOCATION_TASK registered');
  console.log('Location tracking started');
  console.log('First location update:', await Location.getLastKnownPositionAsync());
  console.log('Time:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
};

// Stop location tracking
export const stopLocationTracking = async (): Promise<void> => {
  console.log('Stopping location tracking');
  await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
};