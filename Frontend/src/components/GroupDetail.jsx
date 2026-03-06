import React, { useState, useEffect } from "react";
import { X, Users, UserPlus, Trash2, Image, FileText, Download, ChevronDown, ChevronUp } from "lucide-react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import assets from "../assets/assets";

const GroupDetail = ({ group: initialGroup, onClose }) => {
    const { users, addMemberToGroup, removeMemberFromGroup, getUsers, getGroupMessages, messages } = useChatStore();
    const { authUser } = useAuthStore();
    const [group, setGroup] = useState(initialGroup);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [groupMessages, setGroupMessages] = useState([]);
    const [showAllImages, setShowAllImages] = useState(false);
    const [showAllFiles, setShowAllFiles] = useState(false);

    // keep local state up-to-date when parent passes a different group
    useEffect(() => {
        setGroup(initialGroup);
    }, [initialGroup]);

    useEffect(() => {
        // refresh users list if not already loaded
        if (users.length === 0) getUsers();
    }, [users, getUsers]);

    useEffect(() => {
        // Load group messages when group changes
        if (group?._id) {
            getGroupMessages(group._id).then(() => {
                // Filter messages for this group
                const currentMessages = messages.filter(msg => msg.groupId === group._id);
                setGroupMessages(currentMessages);
            });
        }
    }, [group?._id, getGroupMessages, messages]);

    const filteredUsers = users.filter(u => 
        !group.members.some(m => String(m._id) === String(u._id)) &&
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter shared media
    const sharedImages = groupMessages.filter(msg => msg.messageType === "image");
    const sharedFiles = groupMessages.filter(msg => msg.messageType === "file");

    const handleAdd = async (user) => {
        setIsAdding(true);
        const updated = await addMemberToGroup(group._id, user._id);
        if (updated) {
            setGroup(updated);
            setSearchTerm('');
        }
        setIsAdding(false);
    };

    if (!group) return null;

    return (
        <aside className="h-[calc(100%-4rem)] w-full sm:w-80 border-l border-base-300 flex flex-col absolute top-16 right-0 bg-base-100 z-40">
            <div className="border-b border-base-300 w-full p-4 flex items-center gap-4">
                <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
                    <X className="size-5" />
                </button>
                <span className="font-medium">Group Info</span>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="p-6 border-b border-base-300">
                    <h3 className="text-xl font-semibold">{group.name}</h3>
                    {group.description && <p className="text-sm mt-1 text-base-content/70">{group.description}</p>}
                </div>

                <div className="p-6">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Users /> Members ({group.members.length})
                    </h4>
                    <ul className="space-y-2 mb-4">
                        {group.members.map(m => (
                            <li key={m._id} className="flex items-center gap-3 justify-between">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={m.profilePic || assets.user_icon}
                                        alt={m.username}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span>{m.username}</span>
                                </div>
                                {m._id !== authUser?._id && (
                                    <button
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={async () => {
                                            setIsAdding(true);
                                            const updated = await removeMemberFromGroup(group._id, m._id);
                                            if (updated) setGroup(updated);
                                            setIsAdding(false);
                                        }}
                                        disabled={isAdding}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div>
                        <label className="label">
                            <span className="label-text">Add member</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                            disabled={isAdding}
                        />
                        {searchTerm && filteredUsers.length > 0 && (
                            <div className="mt-2 max-h-40 overflow-y-auto bg-base-100 border rounded-md">
                                {filteredUsers.map(u => (
                                    <div
                                        key={u._id}
                                        className={`flex items-center justify-between p-2 hover:bg-base-200 cursor-pointer ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}
                                        onClick={() => handleAdd(u)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={u.profilePic || assets.user_icon}
                                                alt={u.username}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span>{u.username}</span>
                                        </div>
                                        <UserPlus size={16} className="text-primary" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <UserPlus /> Users not in group
                        </h4>
                        <div className="max-h-40 overflow-y-auto space-y-1">
                            {users.filter(u => !group.members.some(m => String(m._id) === String(u._id))).map(u => (
                                <div key={u._id} className="flex items-center justify-between p-2 bg-base-200 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={u.profilePic || assets.user_icon}
                                            alt={u.username}
                                            className="w-6 h-6 rounded-full"
                                        />
                                        <span className="text-sm">{u.username}</span>
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-xs text-primary"
                                        onClick={() => handleAdd(u)}
                                        disabled={isAdding}
                                    >
                                        <UserPlus size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shared Media Section */}
                    {(sharedImages.length > 0 || sharedFiles.length > 0) && (
                        <div className="mt-6">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Image /> Shared Media
                            </h4>

                            {/* Images */}
                            {sharedImages.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-sm font-medium mb-2 text-base-content/70">Images ({sharedImages.length})</h5>
                                    <div className="grid grid-cols-3 gap-2">
                                        {sharedImages.slice(0, showAllImages ? sharedImages.length : 5).map((image) => (
                                            <div key={image._id} className="relative group">
                                                <img
                                                    src={image.file}
                                                    alt="Shared image"
                                                    className="w-full h-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => window.open(image.file, "_blank")}
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md flex items-center justify-center">
                                                    <Image size={16} className="text-white opacity-0 group-hover:opacity-100" />
                                                </div>
                                            </div>
                                        ))}
                                        {!showAllImages && sharedImages.length > 5 && (
                                            <button
                                                onClick={() => setShowAllImages(true)}
                                                className="w-full h-16 bg-base-200 rounded-md flex items-center justify-center text-xs text-base-content/60 hover:bg-base-300 transition-colors"
                                            >
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>+{sharedImages.length - 5} more</span>
                                                    <ChevronDown size={14} />
                                                </div>
                                            </button>
                                        )}
                                        {showAllImages && sharedImages.length > 5 && (
                                            <button
                                                onClick={() => setShowAllImages(false)}
                                                className="w-full h-16 bg-base-200 rounded-md flex items-center justify-center text-xs text-base-content/60 hover:bg-base-300 transition-colors col-span-3"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Show less</span>
                                                    <ChevronUp size={14} />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Files */}
                            {sharedFiles.length > 0 && (
                                <div>
                                    <h5 className="text-sm font-medium mb-2 text-base-content/70">Files ({sharedFiles.length})</h5>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {sharedFiles.slice(0, showAllFiles ? sharedFiles.length : 5).map((file) => (
                                            <div key={file._id} className="flex items-center gap-3 p-2 bg-base-200 rounded-md">
                                                <div className="p-1 bg-primary/20 rounded text-primary">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-medium truncate">{file.fileName || "Document"}</p>
                                                    <p className="text-xs text-base-content/60">
                                                        {new Date(file.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <a
                                                    href={file.file.replace("/upload/", "/upload/fl_attachment/")}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={file.fileName || "file.pdf"}
                                                    className="btn btn-ghost btn-xs text-primary hover:bg-primary hover:text-primary-content"
                                                >
                                                    <Download size={14} />
                                                </a>
                                            </div>
                                        ))}
                                        {!showAllFiles && sharedFiles.length > 5 && (
                                            <button
                                                onClick={() => setShowAllFiles(true)}
                                                className="w-full py-2 bg-base-200 rounded-md flex items-center justify-center text-xs text-base-content/60 hover:bg-base-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Show {sharedFiles.length - 5} more files</span>
                                                    <ChevronDown size={14} />
                                                </div>
                                            </button>
                                        )}
                                        {showAllFiles && sharedFiles.length > 5 && (
                                            <button
                                                onClick={() => setShowAllFiles(false)}
                                                className="w-full py-2 bg-base-200 rounded-md flex items-center justify-center text-xs text-base-content/60 hover:bg-base-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>Show less</span>
                                                    <ChevronUp size={14} />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default GroupDetail;