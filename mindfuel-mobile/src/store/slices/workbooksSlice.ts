import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkbooksState {
  workbooks: any[];
  userWorkbooks: any[];
  loading: boolean;
}

const initialState: WorkbooksState = {
  workbooks: [],
  userWorkbooks: [],
  loading: false,
};

const workbooksSlice = createSlice({
  name: 'workbooks',
  initialState,
  reducers: {
    setWorkbooks: (state, action: PayloadAction<any[]>) => {
      state.workbooks = action.payload;
    },
    setUserWorkbooks: (state, action: PayloadAction<any[]>) => {
      state.userWorkbooks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setWorkbooks, setUserWorkbooks, setLoading } = workbooksSlice.actions;
export default workbooksSlice.reducer;
