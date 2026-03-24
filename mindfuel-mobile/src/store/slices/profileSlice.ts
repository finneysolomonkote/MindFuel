import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProfileState, User } from '../../types';
import { userApi } from '../../services/api';

const initialState: ProfileState = {
  profile: null,
  preferences: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk('profile/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    return await userApi.getProfile();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      return await userApi.updateProfile(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'profile/updatePreferences',
  async (preferences: Partial<User['preferences']>, { rejectWithValue }) => {
    try {
      return await userApi.updatePreferences(preferences);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update preferences');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.preferences = action.payload.preferences || null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });

    builder
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.preferences = action.payload.preferences || null;
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;
