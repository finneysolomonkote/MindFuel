import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AIState, AIConversation, AIMessage, ConversationContext } from '../../types';
import { aiApi } from '../../services/api';

const initialState: AIState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  typing: false,
  error: null,
};

export const fetchConversations = createAsyncThunk('ai/fetchConversations', async (_, { rejectWithValue }) => {
  try {
    return await aiApi.getConversations();
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
  }
});

export const fetchMessages = createAsyncThunk(
  'ai/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      return await aiApi.getMessages(conversationId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'ai/sendMessage',
  async (
    { conversationId, message, context }: { conversationId?: string; message: string; context?: ConversationContext },
    { rejectWithValue }
  ) => {
    try {
      return await aiApi.sendMessage(conversationId, message, context);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const deleteConversation = createAsyncThunk(
  'ai/deleteConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await aiApi.deleteConversation(conversationId);
      return conversationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete conversation');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(sendMessage.pending, (state) => {
        state.typing = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.typing = false;
        state.currentConversation = action.payload.conversation;
        state.messages.push(action.payload.message);
        const convIndex = state.conversations.findIndex((c) => c.id === action.payload.conversation.id);
        if (convIndex !== -1) {
          state.conversations[convIndex] = action.payload.conversation;
        } else {
          state.conversations.unshift(action.payload.conversation);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.typing = false;
        state.error = action.payload as string;
      });

    builder.addCase(deleteConversation.fulfilled, (state, action) => {
      state.conversations = state.conversations.filter((c) => c.id !== action.payload);
      if (state.currentConversation?.id === action.payload) {
        state.currentConversation = null;
        state.messages = [];
      }
    });
  },
});

export const { clearError, clearCurrentConversation, setCurrentConversation } = aiSlice.actions;
export default aiSlice.reducer;
