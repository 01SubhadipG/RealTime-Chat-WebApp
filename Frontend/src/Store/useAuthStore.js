import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';


export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async()=>{
    try {
      const res=await axiosInstance.get('/auth/check');
      set({authUser:res.data.user})
    } catch (error) {
      console.log(error);
      set({authUser:null});
    }finally{
      set({isCheckingAuth:false})
    }
  },
  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      console.log("Form Data:", formData);
      const res = await axiosInstance.post('/auth/signup', formData);
      console.log("Signup Response:", res);
      set({ authUser: res.data });
      toast.success("Signup successful!");
    } catch (error) {
      console.error("Signup failed:", error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (formData) => {
  set({ isLoggingIn: true });
  try {
    const res = await axiosInstance.post('/auth/login', formData);
    // FIX 1: Use the correct state key 'authUser'
    set({ authUser: res.data.user });
    toast.success("Login successful!");
    // FIX 2: Return true on success for navigation logic
    return true;
  } catch (error) {
    console.error("Login failed:", error);
    toast.error(error.response?.data?.message || "Login failed");
    // Return false on failure
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
      // Return true on success
      return true;
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
      // Return false on failure
      return false;
    }
  },

  updateProfile: async (profileData) => {
    set({ isUpdatingProfile: true });
    try {
      // MODIFIED: Using PATCH for updates and a more RESTful endpoint.
      const res = await axiosInstance.put('/auth/update-profile', profileData);

      // MODIFIED: Merging existing user data with the response for a safer update.
      set({authUser:res.data});
      toast.success("Profile updated successfully!");
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },



}));

