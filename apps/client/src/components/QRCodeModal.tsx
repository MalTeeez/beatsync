import React from "react";
import QRCode from "react-qr-code";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";


export const QRCodeModal: React.FC = () => {
  const joinUrl = window.location.href;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="text-neutral-400 hover:text-white transition-colors cursor-pointer">QR Code</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col items-center">
          <QRCode value={joinUrl} size={200} />
          <p className="mt-2 text-sm text-neutral-400">Scan this on another device to join the session</p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
