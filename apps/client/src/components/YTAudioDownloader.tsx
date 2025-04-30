import React, { useState } from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { useRoomStore } from "@/store/room";
import { downloadYTAudioFile } from "@/lib/api";

const DownloadEdit: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [inputValue, setInputValue] = useState(""); // Add this line
    const roomId = useRoomStore((state) => state.roomId);
    
    const containerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "start",
    };

    const inputStyle: React.CSSProperties = {
        borderRadius: "4px",
    };

    return (
        <div style={containerStyle} className="text-white font-medium rounded-md text-xs bg-[#292929]">
            <Button
                className="w-full flex justify-start gap-3 py-2 cursor-pointer text-white font-medium hover:bg-white/5 rounded-md text-xs transition-colors duration-200"
                variant="ghost"
                onClick={() => setIsActive(!isActive)}
            >
                <Download className="h-4 w-4" />
                <span>Download</span>
            </Button>
            {isActive && (
                <div className="flex flex-row">
                    <input
                        type="text"
                        placeholder="youtube url"
                        style={inputStyle}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="mb-2 ml-1 p-1.5 focus:ring-2 ring-[#16a34a]/50 focus:outline-none w-5/6 focus:bg-white/5 focus:shadow-lg"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                download_music(inputValue.trim());
                                setInputValue("");
                            }
                        }}
                    />
                    <Button
                        className="h-8 w-8 ml-4 pb-2 cursor-pointer text-white font-medium hover:bg-white/5 rounded-md text-sm transition-colors duration-200 -translate-y-0.5 hover:shadow-lg ring-2 ring-[#16a34a]/50"
                        variant="ghost"
                        onClick={() => {
                            if (inputValue.trim()) {
                                download_music(inputValue.trim());
                                setInputValue("");
                            }
                        }}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );

    function download_music(url: string) {
        downloadYTAudioFile({ roomId: roomId, url: url })
    }
};

export default DownloadEdit;
