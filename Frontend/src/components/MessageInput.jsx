import { useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useChatStore } from "../Store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import UserDetail from "./UserDetail";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const { sendMessage, isDetailOpen, closeDetailPanel, selectedUser } = useChatStore();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;
        await sendMessage({ text: text.trim(), image: imagePreview });
        setText("");
        removeImage();
    };

    return (
        <>
            <div className="p-4 w-full">
                {imagePreview && (
                    <div className="mb-3">
                        <div className="relative w-20 h-20">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            
                            {/* --- Code Added Here --- */}
                            
                            <button
                                onClick={removeImage}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                                type="button"
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </div>
                    
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="flex-1 flex gap-2">
                        <input
                            type="text"
                            className="w-full input input-bordered rounded-lg"
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                        <button
                            type="button"
                            className={`btn btn-circle ${imagePreview ? "btn-success" : "btn-ghost"}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Image size={20} />
                        </button>
                    </div>
                    <button type="submit" className="btn btn-primary btn-circle" disabled={!text.trim() && !imagePreview}>
                        <Send size={22} />
                    </button>
                </form>
            </div>

            {isDetailOpen && ReactDOM.createPortal(
                <UserDetail user={selectedUser} onClose={closeDetailPanel} />,
                document.body
            )}
        </>
    );
};
export default MessageInput;