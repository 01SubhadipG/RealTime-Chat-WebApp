import { useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const EditGroup = ({ group, onClose }) => {
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description);
    const { updateGroupDetails } = useChatStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Group name cannot be empty");
            return;
        }

        try {
            await updateGroupDetails(group._id, { name, description });
            toast.success("Group details updated");
            onClose();
        } catch (error) {
            toast.error("Failed to update group details");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Edit Group</h2>
                    <button onClick={onClose} className="btn btn-ghost btn-circle">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="label">
                                <span className="label-text">Group Name</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter group name"
                            />
                        </div>
                        <div>
                            <label className="label">
                                <span className="label-text">Description (Optional)</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered w-full"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter group description"
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditGroup;
