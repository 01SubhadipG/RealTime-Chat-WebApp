import React from "react";
import { useAuthStore } from "../Store/useAuthStore";

const Message = ({ message }) => {
  const { authUser } = useAuthStore();
  const isSender = message.senderId === authUser._id;

  const getStatusIcon = () => {
    if (message.status === "failed") {
      return <span className="text-red-500">!!</span>;
    }
    if (message.status === "seen") {
      return <span className="text-blue-500">✓✓</span>;
    }
    if (message.status === "delivered") {
      return <span>✓</span>;
    }
    return null; // for 'sent'
  };

  return (
    <div className={`chat ${isSender ? "chat-end" : "chat-start"}`}>
      <div className="chat-bubble">
        {message.text}
        <div className="flex items-center justify-end mt-1">
            <span className="text-xs text-base-content/60 mr-2">
                {new Date(message.createdAt).toLocaleTimeString()}
            </span>
            {isSender && getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default Message;
