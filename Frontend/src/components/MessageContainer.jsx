import React, { useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import UserDetail from "./UserDetail";
import { useChatStore } from "../Store/useChatStore";

// You should also import and render your component that displays messages.
import MessagesList from "./MessagesList";

const MessageContainer = () => {
    const { selectedUser } = useChatStore();
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // If no user is selected, show a placeholder message
    if (!selectedUser) {
        return (
            <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-lg text-base-content/60">
                    Welcome! 👋 <br /> Select a contact to start messaging.
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            <ChatHeader onHeaderClick={() => setIsDetailOpen(true)} />

            <MessagesList />

            <MessageInput />

            {/* Conditionally render the UserDetail panel */}
            {isDetailOpen && (
                <UserDetail user={selectedUser} onClose={() => setIsDetailOpen(false)} />
            )}
        </div>
    );
};

export default MessageContainer;