import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "./useChatStore";
import { useAuthStore } from "./useAuthStore";

const useSendMessage = create((set) => ({
  isSending: false,
  sendMessage: async (messageData) => {
    set({ isSending: true });

    const { selectedUser, selectedGroup, messages } = useChatStore.getState();
    const { authUser } = useAuthStore.getState();
    const isGroupMessage = !!selectedGroup;

    // Create a temporary message for optimistic UI
    const tempId = Date.now();
    const tempMessage = {
      ...messageData,
      _id: tempId,
      tempId: tempId,
      senderId: authUser?._id,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // Add optimistic message to the state
    useChatStore.setState({ messages: [...messages, tempMessage] });

    try {
      let res;
      if (isGroupMessage) {
        res = await axiosInstance.post(
          `/messages/send-group/${selectedGroup._id}`,
          messageData
        );
      } else {
        res = await axiosInstance.post(
          `/messages/send/${selectedUser._id}`,
          messageData
        );
      }

      // Replace optimistic message with the actual one from server
      useChatStore.setState((state) => ({
        messages: state.messages.map((msg) =>
          msg.tempId === tempId ? { ...res.data, pending: false } : msg
        ),
      }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send message"
      );

      // Remove the optimistic message on failure
      useChatStore.setState((state) => ({
        messages: state.messages.filter((msg) => msg.tempId !== tempId),
      }));
    } finally {
      set({ isSending: false });
    }
  },
}));

export default useSendMessage;
