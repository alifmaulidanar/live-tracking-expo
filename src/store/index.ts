import { createSlice, configureStore } from '@reduxjs/toolkit';

interface UserData {
  id: number;
  email: string;
  username: string;
  role: string;
  phone: string;
}

const userSlice = createSlice({
  name: 'user',
  initialState: null as UserData | null,
  reducers: {
    setUser: (state, action) => action.payload,
    clearUser: () => null,
  },
});

export const { setUser, clearUser } = userSlice.actions;

// Konfigurasi store Redux
const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
