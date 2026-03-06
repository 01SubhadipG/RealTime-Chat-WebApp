import React, { useState } from "react";
import { X, ShieldBan, ShieldCheck, Maximize2 } from "lucide-react"; 
import { useAuthStore } from "../Store/useAuthStore";
import { useChatStore } from "../Store/useChatStore";
import SharedFiles from "./SharedFiles";
import assets from "../assets/assets";

const UserDetail = ({ user, onClose }) => {
    const { onlineUsers = [] } = useAuthStore();
    const { messages, toggleBlockStatus } = useChatStore();
    const isOnline = onlineUsers.includes(user._id);
    
    const [isLoading, setIsLoading] = useState(false);
    // State to handle the full-screen image preview
    const [showModal, setShowModal] = useState(false);

    const handleToggleBlock = async () => {
        if (!user) return;
        setIsLoading(true);
        await toggleBlockStatus(user._id);
        setIsLoading(false);

        if (!user.isBlocked) {
            onClose();
        }
    };

    // The function to trigger the modal
    const toggleImageModal = () => setShowModal(!showModal);

    const isBlocked = user?.isBlocked;

    if (!user) return null;

    return (
        <>
            <aside className="h-[calc(100%-4rem)] w-full sm:w-80 border-l border-base-300 flex flex-col absolute top-16 right-0 bg-base-100 z-40">
                <div className="border-b border-base-300 w-full p-4 flex items-center gap-4">
                    <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
                        <X className="size-5" />
                    </button>
                    <span className="font-medium">Contact Info</span>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center justify-center gap-4 p-6 border-b border-base-300">
                        <div className="avatar">
                            {/* Added cursor-pointer and onClick here */}
                            <div 
                                className="w-24 rounded-full relative ring ring-primary ring-offset-base-100 ring-offset-2 cursor-pointer group" 
                                onClick={toggleImageModal}
                            >
                                <img src={user.profilePic || assets.user_icon} alt={user?.username} />
                                {/* Subtle hover effect to indicate it's clickable */}
                                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Maximize2 className="text-white size-5" />
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">{user?.username}</h3>
                            <p className={`text-sm ${isOnline ? "text-green-500" : "text-base-content/70"}`}>
                                {isOnline ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>

                    <SharedFiles messages={messages} />

                    <div className="p-6 mt-auto">
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

            {/* --- Full Image Modal Overlay --- */}
            {showModal && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
                    onClick={toggleImageModal} 
                >
                    {/* Close Button */}
                    <button 
                        className="absolute top-6 right-6 btn btn-circle btn-ghost text-white z-[110]"
                        onClick={toggleImageModal}
                    >
                        <X className="size-8" />
                    </button>
                    
                    {/* Main Image Container */}
                    <div 
                        className="relative flex flex-col items-center justify-center w-full h-full max-w-4xl max-h-[90vh] animate-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <img 
                            src={user.profilePic || assets.user_icon} 
                            alt="Full Profile" 
                            // 'object-contain' ensures the whole image fits without cropping
                            // 'max-h-full' and 'max-w-full' keeps it responsive
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default UserDetail;