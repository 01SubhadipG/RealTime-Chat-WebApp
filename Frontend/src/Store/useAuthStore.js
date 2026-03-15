import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { io } from "socket.io-client"; // FIX 1: Import io

// FIX 2: Define BASE_URL (or import it from a config file)
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "https://realtime-chat-webapp-v84l.onrender.com";

// FIX 3: Add 'get' to the arguments here ----------------v
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ authUser: res.data.user });
      
      // Optional: Auto-connect socket if user is found
      get().connectSocket(); 
    } catch (error) {
      console.log(error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/signup', formData);
      set({ authUser: res.data });
      toast.success("Signup successful!");
      
      get().connectSocket(); // Connect socket on signup
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', formData);
      set({ authUser: res.data.user }); // Ensure this matches your API response structure
      toast.success("Login successful!");
      
      get().connectSocket(); // Connect socket on login
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      toast.success("Logged out successfully!");
      
      get().disconnectSocket(); // Disconnect socket on logout
      return true;
    } catch (error) {
      toast.error("Logout failed");
      return false;
    }
  },

  updateProfile: async (profileData) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put('/auth/update-profile', profileData);
      set({ authUser: res.data });
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    // We can now safely use get() because we added it to create((set, get))
    const { authUser } = get();
    
    // Safety check: Don't connect if not logged in or already connected
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      transports: ["websocket"], // Forces it to skip polling entirely
    });
    
    socket.connect();
    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    // Optional: Add logging to catch errors in the browser console
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
      // Clear socket from state to prevent memory leaks
      set({ socket: null }); 
    }
  },
}));