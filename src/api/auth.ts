import supabase from '../utils/supabase';

// Login
export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const userId = data.user?.id;
  if (!userId) throw new Error('User ID not found');

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (userError) throw userError;

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
