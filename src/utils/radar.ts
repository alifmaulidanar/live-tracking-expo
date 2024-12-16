import Radar from 'react-native-radar';

const initializeRadar = (publishableKey: string) => {
  // Initialize Radar SDK with your publishable key
  Radar.initialize(publishableKey);
};

// Request permissions for foreground and background location
const requestLocationPermissions = async () => {
  const status = await Radar.getPermissionsStatus();
  if (status === 'NOT_DETERMINED') {
    await Radar.requestPermissions(false); // Request foreground permissions first
    await Radar.requestPermissions(true);  // Request background permissions second
  }
};

// Track location once (Foreground tracking)
const trackLocationOnce = async () => {
  try {
    const result = await Radar.trackOnce();
    console.log('Location:', result.location);
    console.log('User Events:', result.events);
    console.log('User Metadata:', result.user);
  } catch (err) {
    console.error('Error tracking location:', err);
  }
};

// Start background location tracking with Radar presets
const startBackgroundTracking = (preset: 'EFFICIENT' | 'RESPONSIVE' | 'CONTINUOUS') => {
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
  initializeRadar(publishableKey);

  // Request location permissions
  await requestLocationPermissions();

  // Start location tracking
  trackLocationOnce(); // Track location once in foreground
  startBackgroundTracking('RESPONSIVE'); // Start background tracking with responsive preset

  // Listen for location updates
  listenForLocationUpdates();
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
