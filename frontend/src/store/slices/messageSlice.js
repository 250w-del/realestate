import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import messageService from '../../services/messageService'

// Async thunks
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await messageService.sendMessage(messageData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessages(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const fetchMessageById = createAsyncThunk(
  'messages/fetchMessageById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await messageService.getMessageById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch message')
    }
  }
)

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await messageService.markAsRead(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as read')
    }
  }
)

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (id, { rejectWithValue }) => {
    try {
      await messageService.deleteMessage(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message')
    }
  }
)

export const getUnreadCount = createAsyncThunk(
  'messages/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await messageService.getUnreadCount()
      return response.data.unread_count
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get unread count')
    }
  }
)

export const getConversation = createAsyncThunk(
  'messages/getConversation',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await messageService.getConversation(userId, params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversation')
    }
  }
)

// Initial state
const initialState = {
  messages: [],
  currentMessage: null,
  conversations: [],
  unreadCount: 0,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20,
  },
  isLoading: false,
  error: null,
  isSending: false,
  conversationLoading: false,
}

// Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessages: (state) => {
      state.messages = []
      state.currentMessage = null
      state.conversations = []
    },
    clearCurrentMessage: (state) => {
      state.currentMessage = null
    },
    addNewMessage: (state, action) => {
      state.messages.unshift(action.payload)
    },
    updateMessageInList: (state, action) => {
      const { id, updatedMessage } = action.payload
      const index = state.messages.findIndex(msg => msg.id === id)
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...updatedMessage }
      }
    },
    removeMessageFromList: (state, action) => {
      const id = action.payload
      state.messages = state.messages.filter(msg => msg.id !== id)
    },
    decrementUnreadCount: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1)
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false
        state.messages.unshift(action.payload.message)
        state.error = null
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false
        state.error = action.payload
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages = action.payload.messages
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.messages = []
      })
      
      // Fetch Message by ID
      .addCase(fetchMessageById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentMessage = action.payload.message
        state.error = null
      })
      .addCase(fetchMessageById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.currentMessage = null
      })
      
      // Mark as Read
      .addCase(markAsRead.pending, (state) => {
        // Don't set loading for this operation as it's usually quick
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const messageId = action.payload
        const index = state.messages.findIndex(msg => msg.id === messageId)
        if (index !== -1) {
          state.messages[index].is_read = true
        }
        
        if (state.currentMessage?.id === messageId) {
          state.currentMessage.is_read = true
        }
        
        // Update unread count
        if (state.unreadCount > 0) {
          state.unreadCount -= 1
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        console.error('Failed to mark message as read:', action.payload)
      })
      
      // Delete Message
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false
        const messageId = action.payload
        state.messages = state.messages.filter(msg => msg.id !== messageId)
        
        if (state.currentMessage?.id === messageId) {
          state.currentMessage = null
        }
        
        state.error = null
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Get Unread Count
      .addCase(getUnreadCount.pending, (state) => {
        // Don't set loading for this operation as it's usually quick
      })
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(getUnreadCount.rejected, (state, action) => {
        console.error('Failed to get unread count:', action.payload)
        state.unreadCount = 0
      })
      
      // Get Conversation
      .addCase(getConversation.pending, (state) => {
        state.conversationLoading = true
        state.error = null
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.conversationLoading = false
        state.conversations = action.payload.messages
        state.error = null
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.conversationLoading = false
        state.error = action.payload
        state.conversations = []
      })
  },
})

export const {
  clearError,
  clearMessages,
  clearCurrentMessage,
  addNewMessage,
  updateMessageInList,
  removeMessageFromList,
  decrementUnreadCount,
  incrementUnreadCount,
} = messageSlice.actions

export default messageSlice.reducer

// Selectors
export const selectMessages = (state) => state.messages.messages
export const selectCurrentMessage = (state) => state.messages.currentMessage
export const selectConversations = (state) => state.messages.conversations
export const selectUnreadCount = (state) => state.messages.unreadCount
export const selectMessagePagination = (state) => state.messages.pagination
export const selectMessageLoading = (state) => state.messages.isLoading
export const selectMessageError = (state) => state.messages.error
export const selectMessageSending = (state) => state.messages.isSending
export const selectConversationLoading = (state) => state.messages.conversationLoading

// Helper selectors
export const selectUnreadMessages = (state) => 
  state.messages.messages.filter(msg => !msg.is_read && msg.receiver_id === state.auth.user?.id)

export const selectSentMessages = (state) => 
  state.messages.messages.filter(msg => msg.sender_id === state.auth.user?.id)

export const selectReceivedMessages = (state) => 
  state.messages.messages.filter(msg => msg.receiver_id === state.auth.user?.id)
