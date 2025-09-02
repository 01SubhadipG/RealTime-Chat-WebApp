import React, { useState, useMemo } from "react";
import { FileText, Download } from "lucide-react";

const SharedFiles = ({ messages }) => {
    const [activeTab, setActiveTab] = useState("media");

    // Memoize the filtered files to avoid re-calculating on every render
    const { mediaFiles, documentFiles } = useMemo(() => {
        const media = messages.filter(msg => msg.image);
        // Assuming messages with documents have a 'file' object
        const documents = messages.filter(msg => msg.file); 
        return { mediaFiles: media, documentFiles: documents };
    }, [messages]);

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 p-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabName ? "bg-primary text-primary-content" : "hover:bg-base-300"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Shared Files</h3>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1 rounded-lg bg-base-200">
                <TabButton tabName="media" label={`Media (${mediaFiles.length})`} />
                <TabButton tabName="docs" label={`Documents (${documentFiles.length})`} />
            </div>

            {/* Content Display */}
            <div className="max-h-60 overflow-y-auto pr-2">
                {activeTab === "media" && (
                    <div className="grid grid-cols-3 gap-2">
                        {mediaFiles.length > 0 ? (
                            mediaFiles.map((msg) => (
                                <a key={msg._id} href={msg.image} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={msg.image}
                                        alt="Shared media"
                                        className="aspect-square w-full h-full object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-sm text-base-content/70 mt-4">
                                No media shared yet.
                            </p>
                        )}
                    </div>
                )}

                {activeTab === "docs" && (
                    <div className="space-y-2">
                        {documentFiles.length > 0 ? (
                            documentFiles.map((msg) => (
                                <div key={msg._id} className="flex items-center justify-between p-2 rounded-md bg-base-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="size-5 flex-shrink-0" />
                                        <span className="truncate text-sm">{msg.file.name}</span>
                                    </div>
                                    <a href={msg.file.url} target="_blank" rel="noopener noreferrer" download>
                                        <Download className="size-5 cursor-pointer hover:text-primary transition-colors" />
                                    </a>
                                </div>
                            ))
                        ) : (
                             <p className="text-center text-sm text-base-content/70 mt-4">
                                No documents shared yet.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedFiles;