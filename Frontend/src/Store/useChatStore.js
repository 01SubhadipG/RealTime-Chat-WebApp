import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  activeTab: 'users', // 'users' or 'groups'
  isUsersLoading: false,
  isMessagesLoading: false,
  isGroupsLoading: false,
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

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  // fetch details for a single group (useful when opening detail panel)
  getGroupDetails: async (groupId) => {
    try {
      const res = await axiosInstance.get(`/groups/${groupId}`);
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map(g => String(g._id) === String(groupId) ? res.data : g);
      set({ groups: updatedGroups });
      if (selectedGroup?._id === groupId) set({ selectedGroup: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not fetch group");
    }
  },

  addMemberToGroup: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/add-member`, { memberId });
      const updatedGroup = res.data;
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map(g => String(g._id) === String(groupId) ? updatedGroup : g);
      set({ groups: updatedGroups });
      if (selectedGroup?._id === groupId) set({ selectedGroup: updatedGroup });
      toast.success("Member added to group");
      return updatedGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  },

  removeMemberFromGroup: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/remove-member`, { memberId });
      const updatedGroup = res.data;
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map(g => String(g._id) === String(groupId) ? updatedGroup : g);
      set({ groups: updatedGroups });
      if (selectedGroup?._id === groupId) set({ selectedGroup: updatedGroup });
      toast.success("Member removed from group");
      return updatedGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      const { groups } = get();
      set({ groups: [res.data, ...groups] });
      toast.success("Group created successfully");
      return res.data;
    } catch (error) {
      console.error(error.response);
      toast.error(error.response.data.message);
    }
  },

  updateGroupProfile: async (groupId, groupImage) => {
    try {
      const res = await axiosInstance.post(`/groups/update-profile/${groupId}`, { groupImage });
      const updatedGroup = res.data;
      const { groups, selectedGroup } = get();
      const updatedGroups = groups.map(g => String(g._id) === String(groupId) ? updatedGroup : g);
      set({ groups: updatedGroups });
      if (selectedGroup?._id === groupId) set({ selectedGroup: updatedGroup });
      toast.success("Group image updated successfully");
      return updatedGroup;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group image");
    }
  },

  updateGroupDetails: async (groupId, groupData) => {
    try {
        const res = await axiosInstance.put(`/groups/${groupId}/update-details`, groupData);
        const updatedGroup = res.data;
        const { groups, selectedGroup } = get();
        const updatedGroups = groups.map(g => (g._id === groupId ? updatedGroup : g));
        set({ groups: updatedGroups });

        if (selectedGroup?._id === groupId) {
            set({ selectedGroup: updatedGroup });
        }
        toast.success("Group details updated successfully");
        return updatedGroup;
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update group details");
        throw error;
    }
  },

  deleteGroup: async (groupId) => {
    try {
        await axiosInstance.delete(`/groups/${groupId}`);
        const { groups, selectedGroup } = get();
        const updatedGroups = groups.filter(g => g._id !== groupId);
        set({ groups: updatedGroups });

        if (selectedGroup?._id === groupId) {
            set({ selectedGroup: null });
        }
        toast.success("Group deleted successfully");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete group");
        throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
        await axiosInstance.post(`/groups/${groupId}/leave`);
        const { groups, selectedGroup } = get();
        const updatedGroups = groups.filter(g => g._id !== groupId);
        set({ groups: updatedGroups });

        if (selectedGroup?._id === groupId) {
            set({ selectedGroup: null });
        }
        toast.success("You have left the group");
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to leave group");
        throw error;
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

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/group/${groupId}`);
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

  sendGroupMessage: async (messageData) => {
    const { selectedGroup, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send-group/${selectedGroup._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  openDetailPanel: async () => {
    const { selectedGroup, getGroupDetails } = get();
    if (selectedGroup) {
      // refresh members list in case it changed
      await getGroupDetails(selectedGroup._id);
    }
    set({ isDetailOpen: true });
  },
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
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Clean up to prevent duplicate listeners
    socket.off("newMessage");
    socket.off("newGroupMessage");

    socket.on("newMessage", (newMessage) => {
        const { selectedUser } = get();
        
        // Logical check: Is this message for the current chat?
        // Compare string values because mongoose ObjectIds may be objects
        const isFromSelectedUser = selectedUser &&
          String(newMessage.senderId) === String(selectedUser._id);
        
        if (!isFromSelectedUser) return;

        set((state) => ({
            messages: [...state.messages, newMessage],
        }));
    });

    socket.on("newGroupMessage", (newMessage) => {
        const { selectedGroup } = get();
        
        const isFromSelectedGroup = selectedGroup &&
          String(newMessage.groupId) === String(selectedGroup._id);
        
        if (!isFromSelectedGroup) return;

        set((state) => ({
            messages: [...state.messages, newMessage],
        }));
    });

    // group membership changed
    socket.on("memberAdded", ({ groupId, member }) => {
        const { groups, selectedGroup, messages } = get();
        const updatedGroups = groups.map(g => String(g._id) === String(groupId) ? { ...g, members: [...g.members, member] } : g);
        set({ groups: updatedGroups });
        if (selectedGroup?._id === groupId) {
            set({ selectedGroup: { ...selectedGroup, members: [...selectedGroup.members, member] } });
            toast(`${member.username} added to group`);
            // append system message
            set({ messages: [...messages, { _id: Date.now(), text: `${member.username} joined the group`, messageType: "text", senderId: null, groupId }] });
        }
    });

    socket.on("memberRemoved", ({ groupId, memberId }) => {
        const { groups, selectedGroup, messages } = get();
        const updatedGroups = groups.map(g => {
            if (String(g._id) === String(groupId)) {
                return { ...g, members: g.members.filter(m => String(m._id) !== String(memberId)) };
            }
            return g;
        });
        set({ groups: updatedGroups });

        const authUser = useAuthStore.getState().authUser;
        if (String(memberId) === String(authUser?._id)) {
            // current user was removed
            toast(`You were removed from a group`);
            // if this group was open, deselect it
            const { selectedGroup } = get();
            if (selectedGroup?._id === groupId) {
                set({ selectedGroup: null });
            }
            return; // no need to update selectedGroup further
        }

        if (selectedGroup?._id === groupId) {
            const removed = selectedGroup.members.find(m => String(m._id) === String(memberId));
            set({ selectedGroup: { ...selectedGroup, members: selectedGroup.members.filter(m => String(m._id) !== String(memberId)) } });
            toast(`${removed?.username || 'Someone'} was removed from the group`);
            set({ messages: [...messages, { _id: Date.now(), text: `${removed?.username || 'A member'} left the group`, messageType: "text", senderId: null, groupId }] });
        }
    });
},

unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    
    // ✅ ADD THIS CHECK HERE TOO for safety
    if (socket) {
        socket.off("newMessage");
        socket.off("newGroupMessage");
        socket.off("memberAdded");
        socket.off("memberRemoved");
    }
},

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedGroup: null, activeTab: 'users' }),
  setSelectedGroup: (selectedGroup) => set({ selectedGroup, selectedUser: null, activeTab: 'groups' }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));