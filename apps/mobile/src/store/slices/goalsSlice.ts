import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GoalsState, Goal, Journal } from '../../types';
import { goalsApi, practicesApi, journalsApi } from '../../services/api';

const initialState: GoalsState = {
  goals: [],
  practices: [],
  journals: [],
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk('goals/fetchGoals', async (_, { rejectWithValue }) => {
  try {
    return await goalsApi.getGoals();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
  }
});

export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await goalsApi.createGoal(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ goalId, data }: { goalId: string; data: Partial<Goal> }, { rejectWithValue }) => {
    try {
      return await goalsApi.updateGoal(goalId, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update goal');
    }
  }
);

export const deleteGoal = createAsyncThunk('goals/deleteGoal', async (goalId: string, { rejectWithValue }) => {
  try {
    await goalsApi.deleteGoal(goalId);
    return goalId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
  }
});

export const fetchPractices = createAsyncThunk(
  'goals/fetchPractices',
  async (category?: string, { rejectWithValue }) => {
    try {
      return await practicesApi.getPractices(category);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch practices');
    }
  }
);

export const fetchJournals = createAsyncThunk('goals/fetchJournals', async (_, { rejectWithValue }) => {
  try {
    return await journalsApi.getJournals();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch journals');
  }
});

export const createJournal = createAsyncThunk(
  'goals/createJournal',
  async (data: Omit<Journal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      return await journalsApi.createJournal(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create journal');
    }
  }
);

export const deleteJournal = createAsyncThunk(
  'goals/deleteJournal',
  async (journalId: string, { rejectWithValue }) => {
    try {
      await journalsApi.deleteJournal(journalId);
      return journalId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete journal');
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createGoal.fulfilled, (state, action) => {
        state.goals.push(action.payload);
      });

    builder
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      });

    builder
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter((g) => g.id !== action.payload);
      });

    builder
      .addCase(fetchPractices.fulfilled, (state, action) => {
        state.practices = action.payload;
      });

    builder
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.journals = action.payload;
      });

    builder
      .addCase(createJournal.fulfilled, (state, action) => {
        state.journals.unshift(action.payload);
      });

    builder
      .addCase(deleteJournal.fulfilled, (state, action) => {
        state.journals = state.journals.filter((j) => j.id !== action.payload);
      });
  },
});

export const { clearError } = goalsSlice.actions;
export default goalsSlice.reducer;
