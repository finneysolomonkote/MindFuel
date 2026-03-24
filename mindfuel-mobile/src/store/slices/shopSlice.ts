import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ShopState, Address } from '../../types';
import { shopApi, ordersApi } from '../../services/api';

const initialState: ShopState = {
  products: [],
  categories: [],
  cart: {
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
  },
  orders: [],
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'shop/fetchProducts',
  async (params?: { category?: string; search?: string }, { rejectWithValue }) => {
    try {
      return await shopApi.getProducts(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchCategories = createAsyncThunk('shop/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    return await shopApi.getCategories();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
  }
});

export const fetchCart = createAsyncThunk('shop/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await shopApi.getCart();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'shop/addToCart',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await shopApi.addToCart(productId, quantity);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'shop/updateCartItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      return await shopApi.updateCartItem(itemId, quantity);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'shop/removeFromCart',
  async (itemId: string, { rejectWithValue }) => {
    try {
      return await shopApi.removeFromCart(itemId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from cart');
    }
  }
);

export const fetchOrders = createAsyncThunk('shop/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    return await ordersApi.getOrders();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
  }
});

const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });

    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });

    builder
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });

    builder
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      });

    builder
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });

    builder
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      });
  },
});

export const { clearError } = shopSlice.actions;
export default shopSlice.reducer;
