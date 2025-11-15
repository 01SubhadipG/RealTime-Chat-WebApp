import { X } from "lucide-react";
import { useAuthStore } from "../Store/useAuthStore";
import { useChatStore } from "../Store/useChatStore";

const ChatHeader = () => {
    const { selectedUser, setSelectedUser, openDetailPanel } = useChatStore(); // Get openDetailPanel action
    const { onlineUsers } = useAuthStore();

    return (
        <div className="p-2.5 border-b border-base-300">
            <div className="flex items-center justify-between">
                {/* Make this section clickable to open the detail panel */}
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={openDetailPanel} // Call the store action directly
                >
                    <div className="avatar">
                        <div className="size-10 rounded-full relative">
                            <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser?.username} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-medium">{selectedUser?.username}</h3>
                        <p className="text-sm text-base-content/70">
                            {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
                        </p>
                    </div>
                </div>

                {/* This button deselects the user */}
                <button onClick={() => setSelectedUser(null)} className="lg:hidden">
                    <X />
                </button>
            </div>
        </div>
    );
};
export default ChatHeader;