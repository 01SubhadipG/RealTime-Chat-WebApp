import React, { useEffect, useRef } from "react";
import { useChatStore } from "../Store/useChatStore";
import Message from "./Message";
import MessageSkeleton from "./skeletons/MessageSkeleton";

const MessagesList = () => {
  const { messages, isMessagesLoading } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom every time messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isMessagesLoading ? (
        [...Array(3)].map((_, i) => <MessageSkeleton key={i} />)
      ) : (
        messages.map((message) => <Message key={message._id} message={message} />)
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessagesList;
