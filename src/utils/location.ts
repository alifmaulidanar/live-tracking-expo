import supabase from './supabase';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const { latitude, longitude } = locations[0].coords;
    const apiBaseUrl = process.env.API_BASE_URL;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const user_id = user?.id;

      if (!user) throw new Error('User not authenticated');

      const response = await fetch(`${apiBaseUrl}/save-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, latitude, longitude }),
      });

      if (!response.ok) throw new Error('Failed to save location');
    } catch (error) {
      throw new Error('Failed to save location: ' + error);
    }
  }
});

export const startLocationTracking = async (): Promise<void> => {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access location was denied');
  }

  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 300000, // Every 5 minutes
    distanceInterval: 0, // No minimum distance
  });
};

export const stopLocationTracking = async (): Promise<void> => {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
};
