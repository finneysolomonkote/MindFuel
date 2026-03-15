import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  LibraryBook,
  Book,
  Chapter,
  ReadingProgress,
  AIConversation,
  AIMessage,
  Product,
  Category,
  Cart,
  CartItem,
  Order,
  Address,
  Goal,
  Practice,
  Journal,
  DashboardData,
  ApiResponse,
  PaginatedResponse,
  ConversationContext,
} from '../types';

// Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.mindfuel.ai/api';

const TOKEN_KEY = '@mindfuel_token';
const REFRESH_TOKEN_KEY = '@mindfuel_refresh_token';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          // No refresh token, logout user
          await handleLogout();
          return Promise.reject(error);
        }

        // Attempt to refresh token
        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token, refreshToken: newRefreshToken } = response.data.data;

        // Save new tokens
        await AsyncStorage.setItem(TOKEN_KEY, token);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        await handleLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle logout
const handleLogout = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  // The navigation will be handled by Redux state change
};

// ==================== Auth API ====================
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { token, refreshToken, user } = response.data.data;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { token, refreshToken, user } = response.data.data;
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await handleLogout();
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  getStoredToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  clearTokens: async (): Promise<void> => {
    await handleLogout();
  },
};

// ==================== User API ====================
export const userApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data;
  },

  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/users/dashboard');
    return response.data.data;
  },

  updatePreferences: async (preferences: Partial<User['preferences']>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/preferences', preferences);
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/users/change-password', { currentPassword, newPassword });
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/account');
    await handleLogout();
  },
};

// ==================== Library API ====================
export const libraryApi = {
  getLibrary: async (): Promise<LibraryBook[]> => {
    const response = await apiClient.get<ApiResponse<LibraryBook[]>>('/library');
    return response.data.data;
  },

  getLibraryBook: async (bookId: string): Promise<LibraryBook> => {
    const response = await apiClient.get<ApiResponse<LibraryBook>>(`/library/${bookId}`);
    return response.data.data;
  },

  updateProgress: async (bookId: string, progress: ReadingProgress): Promise<LibraryBook> => {
    const response = await apiClient.post<ApiResponse<LibraryBook>>(
      `/library/${bookId}/progress`,
      progress
    );
    return response.data.data;
  },

  addBookmark: async (bookId: string, bookmark: Omit<any, 'id' | 'createdAt'>): Promise<LibraryBook> => {
    const response = await apiClient.post<ApiResponse<LibraryBook>>(
      `/library/${bookId}/bookmarks`,
      bookmark
    );
    return response.data.data;
  },

  removeBookmark: async (bookId: string, bookmarkId: string): Promise<LibraryBook> => {
    const response = await apiClient.delete<ApiResponse<LibraryBook>>(
      `/library/${bookId}/bookmarks/${bookmarkId}`
    );
    return response.data.data;
  },
};

// ==================== Books API ====================
export const booksApi = {
  getBook: async (bookId: string): Promise<Book> => {
    const response = await apiClient.get<ApiResponse<Book>>(`/workbooks/${bookId}`);
    return response.data.data;
  },

  getChapters: async (bookId: string): Promise<Chapter[]> => {
    const response = await apiClient.get<ApiResponse<Chapter[]>>(`/workbooks/${bookId}/chapters`);
    return response.data.data;
  },

  getChapter: async (bookId: string, chapterId: string): Promise<Chapter> => {
    const response = await apiClient.get<ApiResponse<Chapter>>(
      `/workbooks/${bookId}/chapters/${chapterId}`
    );
    return response.data.data;
  },

  searchBooks: async (query: string): Promise<Book[]> => {
    const response = await apiClient.get<ApiResponse<Book[]>>('/workbooks/search', {
      params: { q: query },
    });
    return response.data.data;
  },
};

// ==================== AI API ====================
export const aiApi = {
  getConversations: async (): Promise<AIConversation[]> => {
    const response = await apiClient.get<ApiResponse<AIConversation[]>>('/ai/conversations');
    return response.data.data;
  },

  getConversation: async (conversationId: string): Promise<AIConversation> => {
    const response = await apiClient.get<ApiResponse<AIConversation>>(
      `/ai/conversations/${conversationId}`
    );
    return response.data.data;
  },

  getMessages: async (conversationId: string): Promise<AIMessage[]> => {
    const response = await apiClient.get<ApiResponse<AIMessage[]>>(
      `/ai/conversations/${conversationId}/messages`
    );
    return response.data.data;
  },

  sendMessage: async (
    conversationId: string | undefined,
    message: string,
    context?: ConversationContext
  ): Promise<{ conversation: AIConversation; message: AIMessage }> => {
    const endpoint = conversationId
      ? `/ai/conversations/${conversationId}/messages`
      : '/ai/messages';

    const response = await apiClient.post<ApiResponse<{ conversation: AIConversation; message: AIMessage }>>(
      endpoint,
      { message, context }
    );
    return response.data.data;
  },

  deleteConversation: async (conversationId: string): Promise<void> => {
    await apiClient.delete(`/ai/conversations/${conversationId}`);
  },

  createConversation: async (title: string, context?: ConversationContext): Promise<AIConversation> => {
    const response = await apiClient.post<ApiResponse<AIConversation>>('/ai/conversations', {
      title,
      context,
    });
    return response.data.data;
  },
};

// ==================== Shop API ====================
export const shopApi = {
  getProducts: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    const response = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return response.data.data;
  },

  getProduct: async (productId: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${productId}`);
    return response.data.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<ApiResponse<Category[]>>('/shop/categories');
    return response.data.data;
  },

  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<Cart>>('/shop/cart');
    return response.data.data;
  },

  addToCart: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>('/shop/cart/items', {
      productId,
      quantity,
    });
    return response.data.data;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put<ApiResponse<Cart>>(`/shop/cart/items/${itemId}`, {
      quantity,
    });
    return response.data.data;
  },

  removeFromCart: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<Cart>>(`/shop/cart/items/${itemId}`);
    return response.data.data;
  },

  applyCoupon: async (code: string): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<Cart>>('/shop/cart/coupon', { code });
    return response.data.data;
  },

  removeCoupon: async (): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<Cart>>('/shop/cart/coupon');
    return response.data.data;
  },
};

// ==================== Orders API ====================
export const ordersApi = {
  createOrder: async (shippingAddress: Address, paymentMethod: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', {
      shippingAddress,
      paymentMethod,
    });
    return response.data.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get<ApiResponse<Order[]>>('/orders');
    return response.data.data;
  },

  getOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${orderId}`);
    return response.data.data;
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/cancel`);
    return response.data.data;
  },
};

// ==================== Goals API ====================
export const goalsApi = {
  getGoals: async (): Promise<Goal[]> => {
    const response = await apiClient.get<ApiResponse<Goal[]>>('/goals');
    return response.data.data;
  },

  getGoal: async (goalId: string): Promise<Goal> => {
    const response = await apiClient.get<ApiResponse<Goal>>(`/goals/${goalId}`);
    return response.data.data;
  },

  createGoal: async (data: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    const response = await apiClient.post<ApiResponse<Goal>>('/goals', data);
    return response.data.data;
  },

  updateGoal: async (goalId: string, data: Partial<Goal>): Promise<Goal> => {
    const response = await apiClient.put<ApiResponse<Goal>>(`/goals/${goalId}`, data);
    return response.data.data;
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    await apiClient.delete(`/goals/${goalId}`);
  },

  updateProgress: async (goalId: string, progress: number): Promise<Goal> => {
    const response = await apiClient.put<ApiResponse<Goal>>(`/goals/${goalId}/progress`, {
      progress,
    });
    return response.data.data;
  },
};

// ==================== Practices API ====================
export const practicesApi = {
  getPractices: async (category?: string): Promise<Practice[]> => {
    const response = await apiClient.get<ApiResponse<Practice[]>>('/practices', {
      params: { category },
    });
    return response.data.data;
  },

  getPractice: async (practiceId: string): Promise<Practice> => {
    const response = await apiClient.get<ApiResponse<Practice>>(`/practices/${practiceId}`);
    return response.data.data;
  },

  completePractice: async (practiceId: string): Promise<void> => {
    await apiClient.post(`/practices/${practiceId}/complete`);
  },
};

// ==================== Journals API ====================
export const journalsApi = {
  getJournals: async (): Promise<Journal[]> => {
    const response = await apiClient.get<ApiResponse<Journal[]>>('/journals');
    return response.data.data;
  },

  getJournal: async (journalId: string): Promise<Journal> => {
    const response = await apiClient.get<ApiResponse<Journal>>(`/journals/${journalId}`);
    return response.data.data;
  },

  createJournal: async (data: Omit<Journal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Journal> => {
    const response = await apiClient.post<ApiResponse<Journal>>('/journals', data);
    return response.data.data;
  },

  updateJournal: async (journalId: string, data: Partial<Journal>): Promise<Journal> => {
    const response = await apiClient.put<ApiResponse<Journal>>(`/journals/${journalId}`, data);
    return response.data.data;
  },

  deleteJournal: async (journalId: string): Promise<void> => {
    await apiClient.delete(`/journals/${journalId}`);
  },
};

export default apiClient;
