import React, { useEffect, useRef } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { FileText, Download } from "lucide-react"; 
import assets from "../assets/assets";

const ChatContainer = () => {
  const { 
    messages, 
    getMessages, 
    getGroupMessages, 
    isMessagesLoading, 
    selectedUser, 
    selectedGroup, 
    subscribeToMessages, 
    unsubscribeFromMessages 
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
    }
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, selectedGroup?._id, getMessages, getGroupMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  const getSenderProfilePic = (message) => {
    if (message.senderId === authUser._id) {
      return authUser.profilePic || assets.user_icon;
    }
    if (selectedUser) {
      return selectedUser.profilePic || assets.user_icon;
    }
    const sender = selectedGroup?.members?.find(member => member._id === message.senderId);
    return sender?.profilePic || assets.user_icon;
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => {
          // 1. System message (membership update, etc.)
          if (!message.senderId) {
            return (
              <div key={message._id} className="w-full text-center text-sm text-base-content/60 my-2">
                {message.text}
              </div>
            );
          }

          // 2. Regular message (needs an explicit return here)
          return (
            <div
              key={message._id}
              className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={getSenderProfilePic(message)}
                    alt="profile pic"
                  />
                </div>
              </div>
              
              <div className="chat-bubble flex flex-col gap-2">
                {selectedGroup && message.senderId !== authUser._id && (
                  <div className="text-xs font-medium text-base-content/70">
                    {selectedGroup.members.find(m => m._id === message.senderId)?.username || "Member"}
                  </div>
                )}

                {/* --- RENDER IMAGES --- */}
                {(message.messageType === "image" || (message.file && !message.messageType)) && (
                  <img 
                    src={message.file || message.image} 
                    alt="Attachment" 
                    className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => window.open(message.file || message.image, "_blank")}
                  />
                )}

                {/* --- RENDER DOCUMENTS --- */}
                {message.messageType === "file" && (
                  <div className="flex items-center gap-3 p-3 bg-base-300 rounded-xl border border-base-100 max-w-[250px]">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{message.fileName || "Document"}</p>
                      {message.file && (
                        <a 
                          href={message.file.replace("/upload/", "/upload/fl_attachment/")} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download={message.fileName || "file.pdf"}
                          className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={12} /> DOWNLOAD
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* --- RENDER TEXT --- */}
                {message.text && <p>{message.text}</p>}
              </div>

              <div className="chat-header mb-1">
                <time className="text-xs opacity-50 ml-1">
                  {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </time>
              </div>
            </div>
          ); // <-- End of regular message return
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;