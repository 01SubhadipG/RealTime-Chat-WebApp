import { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useChatStore } from "../Store/useChatStore";
import { Image, Send, X, FileText, Paperclip, Sticker, File, Loader2 } from "lucide-react"; // Added Loader2
import toast from "react-hot-toast";
import UserDetail from "./UserDetail";
import GroupDetail from "./GroupDetail";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [filePreview, setFilePreview] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    
    const fileInputRef = useRef(null);
    const docInputRef = useRef(null);
    const menuRef = useRef(null);
    
    // Pull isSending from the store
    const { sendMessage, sendGroupMessage, isDetailOpen, closeDetailPanel, selectedUser, selectedGroup, isSending } = useChatStore();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowAttachmentMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === "image" && !file.type.startsWith("image/")) {
            return toast.error("Please select an image");
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result);
            setFileData({ 
                name: file.name, 
                type: file.type, 
                isImage: file.type.startsWith("image/") 
            });
            setShowAttachmentMenu(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        // Prevent sending if already uploading
        if ((!text.trim() && !filePreview) || isSending) return;
        
        const type = fileData?.isImage ? "image" : (fileData ? "file" : "text");

        const sendFunction = selectedGroup ? sendGroupMessage : sendMessage;

        await sendFunction({ 
            text: text.trim(), 
            file: filePreview || null,
            fileName: fileData?.name || null,
            messageType: type
        });

        setText("");
        setFilePreview(null);
        setFileData(null);
    };

    return (
        <div className="p-4 w-full relative">
            {filePreview && (
                <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="relative w-24 h-24 group">
                        {/* Overlay loading spinner on the preview itself */}
                        {isSending && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded-lg">
                                <Loader2 className="animate-spin text-white" size={24} />
                            </div>
                        )}
                        
                        {fileData?.isImage ? (
                            <img src={filePreview} alt="Preview" className={`w-full h-full object-cover rounded-lg border shadow-sm ${isSending ? 'opacity-50' : ''}`} />
                        ) : (
                            <div className={`w-full h-full flex flex-col items-center justify-center bg-base-200 rounded-lg border ${isSending ? 'opacity-50' : ''}`}>
                                <FileText className="text-primary" size={28} />
                                <span className="text-[10px] truncate w-full px-1 text-center mt-1">{fileData?.name}</span>
                            </div>
                        )}
                        
                        {!isSending && (
                            <button onClick={() => setFilePreview(null)} className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 shadow-md">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex gap-2 relative" ref={menuRef}>
                    
                    {showAttachmentMenu && (
                        <div className="absolute bottom-14 left-0 bg-base-100 border rounded-2xl shadow-xl p-2 flex flex-col gap-1 min-w-[160px] z-50 animate-in zoom-in-95 duration-100">
                            <button type="button" disabled={isSending} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl text-sm transition-colors disabled:opacity-50">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Image size={18} /></div>
                                Photo & Video
                            </button>
                            <button type="button" disabled={isSending} onClick={() => docInputRef.current?.click()} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl text-sm transition-colors disabled:opacity-50">
                                <div className="bg-purple-100 p-2 rounded-full text-purple-600"><File size={18} /></div>
                                Document
                            </button>
                            <button type="button" disabled={isSending} onClick={() => toast("Sticker Picker coming soon!")} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl text-sm transition-colors disabled:opacity-50">
                                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600"><Sticker size={18} /></div>
                                Sticker
                            </button>
                        </div>
                    )}

                    <button
                        type="button"
                        disabled={isSending}
                        className={`btn btn-circle ${showAttachmentMenu ? "btn-primary" : "btn-ghost text-base-content/60"}`}
                        onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    >
                        <Paperclip size={20} className={showAttachmentMenu ? "rotate-45 transition-transform" : "transition-transform"} />
                    </button>

                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg"
                        placeholder={isSending ? "Sending..." : (selectedGroup ? `Message ${selectedGroup.name}` : "Type a message...")}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isSending}
                    />

                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileChange(e, "image")} />
                    <input type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" ref={docInputRef} onChange={(e) => handleFileChange(e, "doc")} />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-primary btn-circle" 
                    disabled={(!text.trim() && !filePreview) || isSending}
                >
                    {isSending ? (
                        <Loader2 className="animate-spin" size={22} />
                    ) : (
                        <Send size={22} />
                    )}
                </button>
            </form>

            {isDetailOpen && ReactDOM.createPortal(
                selectedGroup ? 
                    <GroupDetail group={selectedGroup} onClose={closeDetailPanel} /> :
                    <UserDetail user={selectedUser} onClose={closeDetailPanel} />,
                document.body
            )}
        </div>
    );
};


export default MessageInput;