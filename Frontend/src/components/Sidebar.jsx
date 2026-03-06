import React, { useEffect, useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, MessageCircle, Plus, Search } from "lucide-react";
import assets from "../assets/assets";
import CreateGroup from "./CreateGroup";

const Sidebar = () => {
    const { 
        getUsers, 
        getGroups, 
        users, 
        groups, 
        selectedUser, 
        selectedGroup, 
        setSelectedUser, 
        setSelectedGroup, 
        activeTab, 
        setActiveTab, 
        isUsersLoading, 
        isGroupsLoading 
    } = useChatStore();
    const { onlineUsers = [] } = useAuthStore();
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getUsers();
        getGroups();
    }, [getUsers, getGroups]);

    // Filter users and groups based on search term
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = groups.filter(group => 
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="size-6" />
                        <span className="font-medium hidden lg:block">Chats</span>
                    </div>
                    <button
                        onClick={() => setShowCreateGroup(true)}
                        className="btn btn-ghost btn-circle"
                        title="Create Group"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex mt-3">
                    <button
                        onClick={() => setActiveTab("users")}
                        className={`flex-1 py-2 px-3 text-sm rounded-l-lg transition-colors ${
                            activeTab === "users" ? "bg-primary text-primary-content" : "bg-base-200"
                        }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab("groups")}
                        className={`flex-1 py-2 px-3 text-sm rounded-r-lg transition-colors ${
                            activeTab === "groups" ? "bg-primary text-primary-content" : "bg-base-200"
                        }`}
                    >
                        Groups
                    </button>
                </div>

                {/* Search Input */}
                <div className="mt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 size-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto w-full py-3">
                {activeTab === "users" && filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`
                            w-full p-3 flex items-center gap-3
                            hover:bg-base-300 transition-colors
                            ${selectedUser?._id === user._id ? "bg-base-300" : ""}
                        `}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <img
                                src={user.profilePic || assets.user_icon}
                                alt={user.username}
                                className="size-12 object-cover rounded-full"
                            />
                            {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                            )}
                        </div>
                        <div className="hidden lg:block text-left min-w-0">
                            <div className="font-medium truncate">{user?.username}</div>
                            <div className="text-sm text-base-content/70">
                                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                            </div>
                        </div>
                    </button>
                ))}

                {activeTab === "groups" && filteredGroups.map((group) => (
                    <button
                        key={group._id}
                        onClick={() => setSelectedGroup(group)}
                        className={`
                            w-full p-3 flex items-center gap-3
                            hover:bg-base-300 transition-colors
                            ${selectedGroup?._id === group._id ? "bg-base-300" : ""}
                        `}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <div className="size-12 bg-primary rounded-full flex items-center justify-center">
                                <MessageCircle className="size-6 text-primary-content" />
                            </div>
                        </div>
                        <div className="hidden lg:block text-left min-w-0">
                            <div className="font-medium truncate">{group.name}</div>
                            <div className="text-sm text-base-content/70">
                                {group.members.length} members
                            </div>
                        </div>
                    </button>
                ))}

                {/* No results message */}
                {activeTab === "users" && filteredUsers.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-base-content/60">
                        <Search className="size-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No users found</p>
                    </div>
                )}

                {activeTab === "groups" && filteredGroups.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-base-content/60">
                        <Search className="size-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No groups found</p>
                    </div>
                )}
            </div>
            {showCreateGroup && <CreateGroup onClose={() => setShowCreateGroup(false)} />}
        </aside>
    );
};
export default Sidebar;