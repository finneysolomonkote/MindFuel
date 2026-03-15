import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WorkbooksState {
  workbooks: any[];
  loading: boolean;
}

const initialState: WorkbooksState = {
  workbooks: [],
  loading: false,
};

const workbooksSlice = createSlice({
  name: 'workbooks',
  initialState,
  reducers: {
    setWorkbooks: (state, action: PayloadAction<any[]>) => {
      state.workbooks = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setWorkbooks, setLoading } = workbooksSlice.actions;
export default workbooksSlice.reducer;
