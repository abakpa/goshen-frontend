import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const persistedUser = JSON.parse(localStorage.getItem('goshen_user') || 'null');
const persistedToken = localStorage.getItem('goshen_access_token');

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await authClient.post('/auth/login', payload);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Unable to sign in');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  try {
    const token = localStorage.getItem('goshen_access_token');
    await authClient.post('/auth/logout', {}, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  } finally {
    dispatch(clearSession());
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: persistedUser,
    accessToken: persistedToken,
    status: 'idle',
    error: null
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      localStorage.setItem('goshen_access_token', action.payload);
    },
    clearSession: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('goshen_user');
      localStorage.removeItem('goshen_access_token');
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('goshen_user', JSON.stringify(action.payload.user));
        localStorage.setItem('goshen_access_token', action.payload.accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearSession, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
