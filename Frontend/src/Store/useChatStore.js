import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isDetailOpen: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  openDetailPanel: () => set({ isDetailOpen: true }),
    closeDetailPanel: () => set({ isDetailOpen: false }),

  // src/Store/useChatStore.js
   toggleBlockStatus: async (userId) => {
        const { users } = get();
        const userToToggle = users.find((u) => u._id === userId);

        if (!userToToggle) {
            toast.error("User not found.");
            return;
        }

        // Optimistically update the UI for a faster feel
        const updatedUsers = users.map(user =>
            user._id === userId ? { ...user, isBlocked: !user.isBlocked } : user
        );
        set({ users: updatedUsers });

        try {
            if (userToToggle.isBlocked) {
                // If user WAS blocked, call the UNBLOCK endpoint
                // **IMPORTANT**: Replace with your actual UNBLOCK API call
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API
                toast.success(`${userToToggle.fullName} has been unblocked.`);
            } else {
                // If user was NOT blocked, call the BLOCK endpoint
                // **IMPORTANT**: Replace with your actual BLOCK API call
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulating API
                toast.success(`${userToToggle.fullName} has been blocked.`);

                // Deselect the user from chat after blocking them
                if (get().selectedUser?._id === userId) {
                    set({ selectedUser: null });
                }
            }
        } catch (error) {
            console.error("Failed to toggle block status:", error);
            toast.error("Action failed. Please try again.");
            // If API call fails, revert the optimistic update
            set({ users }); 
        }
    },

subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // ✅ ADD THIS CHECK
    if (!socket) {
        console.error("Socket not available. Cannot subscribe to messages.");
        return; 
    }

    socket.on("newMessage", (newMessage) => {
        // This check is good, but let's make sure we're getting the right state.
        const currentSelectedUser = get().selectedUser;
        if (!currentSelectedUser || newMessage.senderId !== currentSelectedUser._id) {
            return;
        }

        // Use the functional form of set to ensure you have the latest messages state.
        set((state) => ({
            messages: [...state.messages, newMessage],
        }));
    });
},

unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    
    // ✅ ADD THIS CHECK HERE TOO for safety
    if (socket) {
        socket.off("newMessage");
    }
},

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));