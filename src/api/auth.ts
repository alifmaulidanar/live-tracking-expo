import Radar from 'react-native-radar';
import supabase from '../utils/supabase';

// Login
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('User ID not found');

  const userData = await getUserData(userId);
  if (!userData) throw new Error('User data not found');

  // Set Radar user data with user ID, metadata, and description
  Radar.setUserId(userId);
  Radar.setMetadata(userData)
  Radar.setDescription(`${userData.username} - ${userData.email} - ${userData.phone}`);
  console.log('Radar initialized with user ID:', userId);
  console.log('User metadata:', userData);
  console.log('User description:', `${userData.username} - ${userData.email} - ${userData.phone}`);

  return userData;
};

// Get user data
export const getUserData = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

// Logout
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  console.log("User logged out");
  if (error) throw error;
};
