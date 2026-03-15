import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { BooksState, LibraryBook, Chapter, ReadingProgress } from '../../types';
import { libraryApi, booksApi } from '../../services/api';

const initialState: BooksState = {
  library: [],
  currentBook: null,
  chapters: [],
  currentChapter: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchLibrary = createAsyncThunk('books/fetchLibrary', async (_, { rejectWithValue }) => {
  try {
    return await libraryApi.getLibrary();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch library');
  }
});

export const fetchLibraryBook = createAsyncThunk(
  'books/fetchLibraryBook',
  async (bookId: string, { rejectWithValue }) => {
    try {
      return await libraryApi.getLibraryBook(bookId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch book');
    }
  }
);

export const fetchChapters = createAsyncThunk(
  'books/fetchChapters',
  async (bookId: string, { rejectWithValue }) => {
    try {
      return await booksApi.getChapters(bookId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chapters');
    }
  }
);

export const fetchChapter = createAsyncThunk(
  'books/fetchChapter',
  async ({ bookId, chapterId }: { bookId: string; chapterId: string }, { rejectWithValue }) => {
    try {
      return await booksApi.getChapter(bookId, chapterId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chapter');
    }
  }
);

export const updateReadingProgress = createAsyncThunk(
  'books/updateProgress',
  async ({ bookId, progress }: { bookId: string; progress: ReadingProgress }, { rejectWithValue }) => {
    try {
      return await libraryApi.updateProgress(bookId, progress);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBook: (state) => {
      state.currentBook = null;
      state.chapters = [];
      state.currentChapter = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Library
    builder
      .addCase(fetchLibrary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLibrary.fulfilled, (state, action) => {
        state.loading = false;
        state.library = action.payload;
      })
      .addCase(fetchLibrary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Library Book
    builder
      .addCase(fetchLibraryBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLibraryBook.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBook = action.payload;
      })
      .addCase(fetchLibraryBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Chapters
    builder
      .addCase(fetchChapters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapters.fulfilled, (state, action) => {
        state.loading = false;
        state.chapters = action.payload;
      })
      .addCase(fetchChapters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Chapter
    builder
      .addCase(fetchChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.currentChapter = action.payload;
      })
      .addCase(fetchChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Progress
    builder
      .addCase(updateReadingProgress.fulfilled, (state, action) => {
        state.currentBook = action.payload;
        // Update in library
        const index = state.library.findIndex((book) => book.id === action.payload.id);
        if (index !== -1) {
          state.library[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentBook } = booksSlice.actions;
export default booksSlice.reducer;
