import { useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import { X, Plus, Users } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroup = ({ onClose }) => {
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const { users, createGroup, setSelectedGroup, getGroups, setActiveTab } = useChatStore();

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddMember = (user) => {
        if (!selectedMembers.find(member => member._id === user._id)) {
            setSelectedMembers([...selectedMembers, user]);
        }
    };

    const handleRemoveMember = (userId) => {
        setSelectedMembers(selectedMembers.filter(member => member._id !== userId));
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast.error("Group name is required");
            return;
        }
        if (selectedMembers.length === 0) {
            toast.error("Please select at least one member");
            return;
        }

        const memberIds = selectedMembers.map(member => member._id);
        const newGroup = await createGroup({
            name: groupName.trim(),
            description: groupDescription.trim(),
            memberIds
        });

        // switch to the new group chat automatically if creation succeeded
        if (newGroup) {
            setSelectedGroup(newGroup);
            setActiveTab("groups");
            getGroups(); // refresh list just in case
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Create Group</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="label">
                            <span className="label-text">Group Name</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Description (Optional)</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="Enter group description"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="label">
                            <span className="label-text">Add Members</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search users..."
                        />
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                        {filteredUsers.map(user => (
                            <div
                                key={user._id}
                                className="flex items-center justify-between p-2 hover:bg-base-200 rounded cursor-pointer"
                                onClick={() => handleAddMember(user)}
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={user.profilePic || "/user_icon.png"}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span>{user.username}</span>
                                </div>
                                {!selectedMembers.find(member => member._id === user._id) && (
                                    <Plus size={16} className="text-primary" />
                                )}
                            </div>
                        ))}
                    </div>

                    {selectedMembers.length > 0 && (
                        <div>
                            <label className="label">
                                <span className="label-text">Selected Members ({selectedMembers.length})</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {selectedMembers.map(member => (
                                    <div
                                        key={member._id}
                                        className="badge badge-primary gap-2 cursor-pointer"
                                        onClick={() => handleRemoveMember(member._id)}
                                    >
                                        {member.username}
                                        <X size={12} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="btn btn-ghost">
                        Cancel
                    </button>
                    <button onClick={handleCreateGroup} className="btn btn-primary">
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;