// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  goals: string[];
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface UserStats {
  booksCompleted: number;
  readingStreak: number;
  practicesCompleted: number;
  journalEntries: number;
}

// ==================== Auth Types ====================
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ==================== Book Types ====================
export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  totalChapters: number;
  category: string;
  publishedDate: string;
  price?: number;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  chapterNumber: number;
  sections: Section[];
  isCompleted?: boolean;
}

export interface Section {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  sectionNumber: number;
  pageNumber: number;
}

export interface LibraryBook {
  id: string;
  book: Book;
  userId: string;
  progress: number;
  currentChapterId?: string;
  currentSectionId?: string;
  currentPageNumber?: number;
  lastReadAt: string;
  completedChapters: string[];
  bookmarks: Bookmark[];
}

export interface Bookmark {
  id: string;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  note?: string;
  createdAt: string;
}

export interface ReadingProgress {
  bookId: string;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  progress: number;
}

export interface BooksState {
  library: LibraryBook[];
  currentBook: LibraryBook | null;
  chapters: Chapter[];
  currentChapter: Chapter | null;
  loading: boolean;
  error: string | null;
}

// ==================== AI Types ====================
export interface AIConversation {
  id: string;
  title: string;
  userId: string;
  lastMessage?: string;
  lastMessageAt: string;
  context?: ConversationContext;
  createdAt: string;
}

export interface ConversationContext {
  bookId?: string;
  chapterId?: string;
  sectionId?: string;
  pageNumber?: number;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  recommendations?: Recommendation[];
  createdAt: string;
}

export interface Citation {
  text: string;
  source: string;
  url?: string;
}

export interface Recommendation {
  type: 'book' | 'practice' | 'product';
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface AIState {
  conversations: AIConversation[];
  currentConversation: AIConversation | null;
  messages: AIMessage[];
  loading: boolean;
  typing: boolean;
  error: string | null;
}

// ==================== Shop Types ====================
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ShopState {
  products: Product[];
  categories: Category[];
  cart: Cart;
  orders: Order[];
  loading: boolean;
  error: string | null;
}

// ==================== Goals Types ====================
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: number;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Practice {
  id: string;
  title: string;
  description: string;
  category: 'meditation' | 'reflection' | 'gratitude' | 'mindfulness';
  duration: number; // in minutes
  steps: PracticeStep[];
  imageUrl?: string;
}

export interface PracticeStep {
  stepNumber: number;
  title: string;
  content: string;
  duration?: number;
}

export interface Journal {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: 'happy' | 'calm' | 'sad' | 'anxious' | 'neutral';
  createdAt: string;
  updatedAt: string;
}

export interface GoalsState {
  goals: Goal[];
  practices: Practice[];
  journals: Journal[];
  loading: boolean;
  error: string | null;
}

// ==================== Profile Types ====================
export interface ProfileState {
  profile: User | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

// ==================== Dashboard Types ====================
export interface DashboardData {
  quote: DailyQuote;
  continueReading?: LibraryBook;
  stats: UserStats;
  recommendedPractice?: Practice;
  featuredProducts: Product[];
}

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  category?: string;
}

// ==================== Navigation Types ====================
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Onboarding: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  BookDetails: { bookId: string };
  Reader: { bookId: string; chapterId?: string };
  Chapters: { bookId: string };
  PracticeDetail: { practiceId: string };
  PracticeSteps: { practiceId: string };
};

export type AIStackParamList = {
  AIConversations: undefined;
  AIChat: { conversationId?: string; context?: ConversationContext };
};

export type LibraryStackParamList = {
  Library: undefined;
  BookDetails: { bookId: string };
  Reader: { bookId: string; chapterId?: string };
  Chapters: { bookId: string };
};

export type ShopStackParamList = {
  Shop: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  OrdersList: undefined;
  OrderDetail: { orderId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Goals: undefined;
  CreateGoal: undefined;
  JournalList: undefined;
  CreateJournal: { journalId?: string };
  PracticesList: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  AITab: undefined;
  LibraryTab: undefined;
  ShopTab: undefined;
  ProfileTab: undefined;
};

// ==================== API Types ====================
export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
