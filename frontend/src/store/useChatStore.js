import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/users');
      set({ users: res.data });
    } catch (error) {
      console.log('Error in getUsers:', error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.log('Error in getMessages:', error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    // Add clientMessageId for idempotency
    const clientMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payload = { ...messageData, clientMessageId };
    
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.log('Error in sendMessage:', error);
    }
  },

  markAsRead: async (userId) => {
    try {
      await axiosInstance.put(`/messages/read/${userId}`);
    } catch (error) {
      console.log('Error in markAsRead:', error);
    }
  },

  deleteMessage: async (messageId) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: messages.map((msg) =>
          msg._id === messageId ? { ...msg, deletedAt: res.data.deletedAt } : msg
        ),
      });
    } catch (error) {
      console.log('Error in deleteMessage:', error);
    }
  },

  editMessage: async (messageId, newText) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.put(`/messages/${messageId}`, { text: newText });
      set({
        messages: messages.map((msg) =>
          msg._id === messageId ? { ...msg, text: res.data.text, editedAt: res.data.editedAt } : msg
        ),
      });
    } catch (error) {
      console.log('Error in editMessage:', error);
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  subscribeToMessages: (socket) => {
    if (!socket) return;
    
    socket.on('newMessage', (newMessage) => {
      const { selectedUser } = get();
      if (!selectedUser || newMessage.sender !== selectedUser._id) return;
      
      set({ messages: [...get().messages, newMessage] });
    });

    socket.on('messageDeleted', (deletedMessage) => {
      const { selectedUser } = get();
      if (!selectedUser || deletedMessage.sender !== selectedUser._id) return;

      set({
        messages: get().messages.map((msg) =>
          msg._id === deletedMessage._id ? { ...msg, deletedAt: deletedMessage.deletedAt } : msg
        ),
      });
    });

    socket.on('messageEdited', (editedMessage) => {
      const { selectedUser } = get();
      if (!selectedUser || editedMessage.sender !== selectedUser._id) return;

      set({
        messages: get().messages.map((msg) =>
          msg._id === editedMessage._id ? { ...msg, text: editedMessage.text, editedAt: editedMessage.editedAt } : msg
        ),
      });
    });

    socket.on('typing:start', ({ senderId }) => {
      set((state) => ({ typingUsers: [...new Set([...state.typingUsers, senderId])] }));
    });

    socket.on('typing:stop', ({ senderId }) => {
      set((state) => ({ typingUsers: state.typingUsers.filter((id) => id !== senderId) }));
    });

    socket.on('userOffline', ({ userId, lastSeen }) => {
      set((state) => ({
        users: state.users.map((u) => (u._id === userId ? { ...u, lastSeen } : u)),
        selectedUser: state.selectedUser?._id === userId 
          ? { ...state.selectedUser, lastSeen } 
          : state.selectedUser
      }));
    });

    socket.on('messagesDelivered', ({ receiverId }) => {
      set((state) => ({
        messages: state.messages.map((msg) => 
          (msg.receiver === receiverId && msg.status === 'SENT') ? { ...msg, status: 'DELIVERED' } : msg
        )
      }));
    });

    socket.on('messagesRead', ({ readerId }) => {
      set((state) => ({
        messages: state.messages.map((msg) => 
          (msg.receiver === readerId && msg.status !== 'READ') ? { ...msg, status: 'READ' } : msg
        )
      }));
    });
  },

  unsubscribeFromMessages: (socket) => {
    if (!socket) return;
    socket.off('newMessage');
    socket.off('messageDeleted');
    socket.off('messageEdited');
    socket.off('typing:start');
    socket.off('typing:stop');
    socket.off('userOffline');
    socket.off('messagesDelivered');
    socket.off('messagesRead');
  },
}));
