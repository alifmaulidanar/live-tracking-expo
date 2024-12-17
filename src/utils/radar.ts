import supabase from './supabase';
import Radar from 'react-native-radar';
import { getUserData } from '../api/auth';

// Initialize Radar SDK
const initializeRadar = (publishableKey: string) => {
  Radar.initialize(publishableKey);
  console.log('Radar successfully initialized.');
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
  Radar.trackOnce().then((result) => {
    console.log('Location:', result.location);
    console.log('Events:', result.events);
    console.log('User Metadata:', result.user);
  }).catch((err) => {
    console.error('Error tracking location:', err);
  });
};

// Start background location tracking with Radar presets
const startBackgroundTracking = async (preset: 'EFFICIENT' | 'RESPONSIVE' | 'CONTINUOUS') => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not found');
  const userId = user?.id as string;
  const userData = await getUserData(userId);
  if (!userData) throw new Error('User data not found');

  // Initialize Radar with user ID, metadata, and description
  Radar.setUserId(userId);
  Radar.setMetadata(userData)
  Radar.setDescription(`${userData.username} - ${userData.email} - ${userData.phone}`);

  console.log('Radar initialized with user ID:', userId);
  console.log('User metadata:', userData);
  console.log('User description:', `${userData.username} - ${userData.email} - ${userData.phone}`);

  // Request location permissions
  await requestLocationPermissions();

  // Start location tracking
  trackLocationOnce(); // Track location once in foreground
  console.log('Location tracked once in foreground:', new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }));
  // console log time in WIB

  // Start background tracking
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

  // Set foreground service options
  Radar.setForegroundServiceOptions({
    options: {
      text: "Pekerjaan dimulai.",
      title: "Lokasi diperbarui.",
      updatesOnly: false,
      importance: 2,
      activity: 'com.alifmaulidanar.pastitracking'
    }
  });

  // Check if background tracking is active
  const isTracking = Radar.isTracking();
  console.log('Background tracking status:', isTracking);

  // Listen for location updates
  listenForLocationUpdates();
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

export {
  initializeRadar,
  requestLocationPermissions,
  trackLocationOnce,
  startBackgroundTracking,
  stopBackgroundTracking,
  listenForLocationUpdates,
};