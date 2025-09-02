import React, { useState } from "react";
// 1. Import the new 'ShieldCheck' icon
import { X, ShieldBan, ShieldCheck } from "lucide-react"; 
import { useAuthStore } from "../Store/useAuthStore";
import { useChatStore } from "../Store/useChatStore";
import SharedFiles from "./SharedFiles";

const UserDetail = ({ user, onClose }) => {
    const { onlineUsers = [] } = useAuthStore();
    // 2. Get the 'toggleBlockStatus' action instead of 'blockUser'
    const { messages, toggleBlockStatus } = useChatStore();
    const isOnline = onlineUsers.includes(user._id);
    const [isLoading, setIsLoading] = useState(false);

    // This function now handles both blocking and unblocking
    const handleToggleBlock = async () => {
        if (!user) return;
        setIsLoading(true);
        await toggleBlockStatus(user._id);
        setIsLoading(false);

        // After blocking, close the details panel
        if (!user.isBlocked) {
            onClose();
        }
    };
    
    // 3. Determine if the user is currently blocked
    const isBlocked = user?.isBlocked;

    if (!user) return null;

    return (
        <aside className="h-[calc(100%-4rem)] w-full sm:w-80 border-l border-base-300 flex flex-col absolute top-16 right-0 bg-base-100 z-40">
            {/* ... (Header, User Info, Shared Files sections are unchanged) ... */}
            <div className="border-b border-base-300 w-full p-4 flex items-center gap-4">
                <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
                    <X className="size-5" />
                </button>
                <span className="font-medium">Contact Info</span>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="flex flex-col items-center justify-center gap-4 p-6 border-b border-base-300">
                    <div className="avatar">
                        <div className="w-24 rounded-full relative ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold">{user.fullName}</h3>
                        <p className={`text-sm ${isOnline ? "text-green-500" : "text-base-content/70"}`}>
                            {isOnline ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                <SharedFiles messages={messages} />

                {/* Actions */}
                <div className="p-6 mt-auto">
                    {/* 4. The button now changes based on 'isBlocked' status */}
                    <button
                        onClick={handleToggleBlock}
                        className={`btn w-full gap-2 ${isBlocked ? 'btn-success btn-outline' : 'btn-error btn-outline'}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            isBlocked ? <ShieldCheck size={20} /> : <ShieldBan size={20} />
                        )}
                        
                        {isLoading ? (isBlocked ? 'Unblocking...' : 'Blocking...') : (isBlocked ? 'Unblock User' : 'Block User')}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default UserDetail;