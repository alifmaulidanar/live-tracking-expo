import Radar from 'react-native-radar';
import supabase from './supabase';
import { getUserData } from '../api/auth';

const initializeRadar = (publishableKey: string) => {
  // Initialize Radar SDK with your publishable key
  Radar.initialize(publishableKey);
};

// Request permissions for foreground and background location
const requestLocationPermissions = async () => {
  const status = await Radar.getPermissionsStatus();
  console.log('Location permissions status:', status);
  if (status === 'NOT_DETERMINED') {
    await Radar.requestPermissions(false); // Request foreground permissions first
    await Radar.requestPermissions(true);  // Request background permissions second
  }
};

// Track location once (Foreground tracking)
const trackLocationOnce = async () => {
  // Radar.trackOnce().then((result) => {
  //   console.log('Location:', result.location);
  //   console.log('Events:', result.events);
  //   console.log('User Metadata:', result.user);
  // }).catch((err) => {
  //   console.error('Error tracking location:', err);
  // });
  try {
    const result = await Radar.trackOnce();
    console.log('Location:', result.location);
    console.log('Events:', result.events);
    console.log('User Metadata:', result.user);
  } catch (err) {
    console.error('Error tracking location:', err);
  }
};

// Start background location tracking with Radar presets
const startBackgroundTracking = (preset: 'EFFICIENT' | 'RESPONSIVE' | 'CONTINUOUS') => {
  console.log('Starting background tracking with preset:', preset);
  switch (preset) {
    case 'EFFICIENT':
      Radar.startTrackingEfficient();
      break;
    case 'RESPONSIVE':
      Radar.startTrackingResponsive();
      break;
    case 'CONTINUOUS':
      Radar.startTrackingContinuous();
      break;
    default:
      console.error('Invalid preset for background tracking.');
  }
};

// Stop background location tracking
const stopBackgroundTracking = () => {
  console.log('Stopping background tracking...');
  Radar.stopTracking();
};

// Event listeners for location updates
const listenForLocationUpdates = () => {
  Radar.on('location', (result: { location: any; }) => {
    console.log('Location updated:', result.location);
  });

  Radar.on('error', (err: any) => {
    console.error('Location error:', err);
  });
};

// Example usage of Radar SDK
const setupRadarTracking = async () => {
  const publishableKey = process.env.EXPO_PUBLIC_RADAR_PUBLISHABLE_KEY as string;  // Replace with your actual Radar publishable key
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not found');
  const userId = user?.id as string;
  const userData = await getUserData(userId);

  // Initialize Radar SDK, set user ID, 
  initializeRadar(publishableKey);
  // Radar.setUserId(userId);
  // Radar.setMetadata(userData)
  // Radar.setDescription(`${userData.username} - ${userData.email} - ${userData.phone}`);

  console.log('Radar initialized with publishable key:', publishableKey);
  // console.log('Radar initialized with user ID:', userId);
  // console.log('User metadata:', userData);
  // console.log('User description:', `${userData.username} - ${userData.email} - ${userData.phone}`);

  // Request location permissions
  await requestLocationPermissions();

  // Start location tracking
  trackLocationOnce(); // Track location once in foreground
  console.log('Location tracked once in foreground');
  startBackgroundTracking('RESPONSIVE'); // Start background tracking with responsive preset
  console.log('Background tracking started: RESPONSIVE');
  listenForLocationUpdates(); // Listen for location updates
};

export {
  initializeRadar,
  setupRadarTracking,
  requestLocationPermissions,
  trackLocationOnce,
  startBackgroundTracking,
  stopBackgroundTracking,
  listenForLocationUpdates,
};
