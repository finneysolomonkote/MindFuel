import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workbooksReducer from './slices/workbooksSlice';
import productsReducer from './slices/productsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workbooks: workbooksReducer,
    products: productsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
