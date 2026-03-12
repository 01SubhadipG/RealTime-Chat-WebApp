import { ArrowLeft, MessageCircle } from "lucide-react";
import { useAuthStore } from "../Store/useAuthStore";
import { useChatStore } from "../Store/useChatStore";
import assets from "../assets/assets";

const ChatHeader = () => {
    const { selectedUser, selectedGroup, setSelectedUser, setSelectedGroup, openDetailPanel } = useChatStore();
    const { onlineUsers } = useAuthStore();

    const chatEntity = selectedUser || selectedGroup;

    if (!chatEntity) return null;

    return (
        <div className="p-2.5 border-b border-base-300 sticky top-0 z-10 bg-base-100">
            <div className="flex items-center">
                <button 
                    onClick={() => {
                        if (selectedUser) setSelectedUser(null);
                        if (selectedGroup) setSelectedGroup(null);
                    }} 
                    className="btn btn-ghost btn-circle -ml-2"
                >
                    <ArrowLeft />
                </button>
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={openDetailPanel}
                >
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            {selectedGroup ? (
                                <div className="bg-primary rounded-full flex items-center justify-center w-full h-full">
                                    <MessageCircle className="size-6 text-primary-content" />
                                </div>
                            ) : (
                                <img src={selectedUser.profilePic || assets.user_icon} alt={selectedUser?.username} />
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium">{selectedGroup ? selectedGroup.name : selectedUser?.username}</h3>
                        <p className="text-sm text-base-content/70">
                            {selectedGroup 
                                ? `${selectedGroup.members.length} members`
                                : (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")
                            }
                        </p>
                    </div>
                </div>
                <div className="flex-grow"></div>
            </div>
        </div>
    );
};
export default ChatHeader;