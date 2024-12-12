import supabase from '../utils/supabase';

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  console.log("User logged in:", { data });
  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  console.log("User logged out");
  if (error) throw error;
};
