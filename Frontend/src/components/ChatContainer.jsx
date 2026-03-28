import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { FileText, Download, X, Check, CheckCheck, AlertCircle } from "lucide-react"; 
import assets from "../assets/assets";

const MessageStatus = ({ status }) => {
  if (status === "seen") {
    return <CheckCheck size={16} className="text-blue-500" />;
  } else if (status === "delivered") {
    return <Check size={16} className="text-base-content/60" />;
  } else if (status === "failed") {
    return <AlertCircle size={16} className="text-red-500" />;
  } else if (status === "sent") {
    return <Check size={16} className="text-base-content/60" />;
  }
  return null;
};


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
  const [zoomedImage, setZoomedImage] = useState(null);


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
      <div className="flex-1 flex flex-col">
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
    <div className="h-full flex flex-col">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message, index) => {
          // 1. System message (membership update, etc.)
          if (!message.senderId) {
            return (
              <div key={message._id} className="w-full text-center text-sm text-base-content/60 my-2">
                {message.text}
              </div>
            );
          }
          
          // FOR DEMONSTRATION: Cycle through statuses
          const statuses = ["sent", "delivered", "seen", "failed"];
          const demoMessage = { ...message, status: message.senderId === authUser._id ? statuses[index % 4] : null };

          // 2. Regular message (needs an explicit return here)
          return (
            <div
              key={demoMessage._id}
              className={`chat ${demoMessage.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={getSenderProfilePic(demoMessage)}
                    alt="profile pic"
                  />
                </div>
              </div>

              <div className={`chat-bubble flex flex-col gap-2 ${demoMessage.pending ? 'opacity-50' : ''}`}>
                {selectedGroup && demoMessage.senderId !== authUser._id && (
                  <div className="text-xs font-medium text-base-content/70">
                    {selectedGroup.members.find(m => m._id === demoMessage.senderId)?.username || "Member"}
                  </div>
                )}

                {/* --- RENDER IMAGES --- */}
                {(demoMessage.messageType === "image" || (demoMessage.file && !demoMessage.messageType)) && (
                  <img 
                    src={demoMessage.file || demoMessage.image} 
                    alt="Attachment" 
                    className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => setZoomedImage(demoMessage.file || demoMessage.image)}
                  />
                )}

                {/* --- RENDER DOCUMENTS --- */}
                {demoMessage.messageType === "file" && (
                  <div className="flex items-center gap-3 p-3 bg-base-300 rounded-xl border border-base-100 max-w-[250px]">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{demoMessage.fileName || "Document"}</p>
                      {demoMessage.file && (
                        <a 
                          href={demoMessage.file.replace("/upload/", "/upload/fl_attachment/")} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          download={demoMessage.fileName || "file.pdf"}
                          className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={12} /> DOWNLOAD
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* --- RENDER TEXT --- */}
                {demoMessage.text && <p>{demoMessage.text}</p>}
              </div>

              <div className="chat-footer flex items-center gap-1">
                {demoMessage.senderId === authUser._id && <MessageStatus status={demoMessage.status} />}
                <time className="text-xs opacity-50">
                  {demoMessage.createdAt ? new Date(demoMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </time>
              </div>
            </div>
          ); // <-- End of regular message return
        })}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />

      {/* --- ZOOMED IMAGE MODAL --- */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setZoomedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
          />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;