"use client";
import { useGlobalStore } from "@/store/global";
import { Hash, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { SyncProgress } from "../ui/SyncProgress";
import { QRCodeModal } from "../QRCodeModal";

interface TopBarProps {
  roomId: string;
}

export const TopBar = ({ roomId }: TopBarProps) => {
  const isLoadingAudio = useGlobalStore((state) => state.isInitingSystem);
  const isSynced = useGlobalStore((state) => state.isSynced);
  const roundTripEstimate = useGlobalStore((state) => state.roundTripEstimate);
  const sendNTPRequest = useGlobalStore((state) => state.sendNTPRequest);
  const resetNTPConfig = useGlobalStore((state) => state.resetNTPConfig);
  const pauseAudio = useGlobalStore((state) => state.pauseAudio);
  const connectedClients = useGlobalStore((state) => state.connectedClients);
  const setIsLoadingAudio = useGlobalStore((state) => state.setIsInitingSystem);
  const clockOffset = useGlobalStore((state) => state.offsetEstimate);
  const resync = () => {
    try {
      pauseAudio({ when: 0 });
    } catch (error) {
      console.error("Failed to pause audio:", error);
    }
    resetNTPConfig();
    sendNTPRequest();
    setIsLoadingAudio(true);
  };

  // Show minimal nav bar when synced and not loading
  if (!isLoadingAudio && isSynced) {
    return (
      <div className="h-8 bg-black/80 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b border-zinc-800">
        <div className="flex items-center space-x-4 text-xs text-neutral-400 py-2 md:py-0">
          <Link href="/" className="font-medium hover:text-white transition-colors">
            Beatsync
          </Link>
          <div className="flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
            <span>Synced</span>
          </div>
          <div className="flex items-center">
            <Hash size={12} className="mr-1" />
            <span className="flex items-center">{roomId}</span>
          </div>
          <div className="flex items-center">
            <Users size={12} className="mr-1" />
            <span className="flex items-center">
              <span className="mr-1.5">
                {connectedClients.length} {connectedClients.length === 1 ? "user" : "users"}
              </span>
            </span>
          </div>
          {/* Hide separator on small screens */}
          <div className="hidden md:block">|</div>
          {/* Hide Offset/RTT on small screens */}
          <div className="hidden md:flex items-center space-x-2">
            <span>Offset: {clockOffset.toFixed(2)}ms</span>
            <span>
              RTT: <span>{roundTripEstimate.toFixed(2)}</span>ms
            </span>
          </div>
          {/* Hide separator on small screens */}
          <div className="hidden md:block">|</div>
          {/* Hide Full Sync button on small screens */}
          <button
            onClick={resync}
            className="hidden md:block text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Full Sync
          </button>
          {/* Add QR Code Modal button */}
          <div className="hidden md:block">|</div>
          <div className="hidden md:block">
            <QRCodeModal roomId={roomId} />
          </div>
        </div>

        {/* GitHub icon in the top right */}
        <a
          href="https://github.com/freeman-jiang/beatsync"
          target="_blank"
          rel="noopener noreferrer"
          className="github-corner relative -top-3 -right-2"
          aria-label="View source on GitHub"
        >
          <svg
            className="size-10 -rotate-45 absolute"
            viewBox="0 0 250 250"
            style={{
              color: "#a1a1a1",
              position: "absolute",
              top: 0,
              border: 0,
              right: 0,
              stroke: "#151513", // Add outline
              strokeWidth: "6", // Control outline thickness
              fill: "none", // Remove fill
            }}
            aria-hidden="true"
          >
            {/* <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" /> */}
            <path
              d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
              stroke="currentColor"
              style={{ transformOrigin: "130px 106px" }}
              className="octo-arm"
            />
            <path
              d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
              stroke="currentColor"
              className="octo-body"
            />
          </svg>
          <style jsx>{`
            .github-corner:hover .octo-arm {
              animation: octocat-wave 560ms ease-in-out;
            }
            @keyframes octocat-wave {
              0%,
              100% {
                transform: rotate(0);
              }
              20%,
              60% {
                transform: rotate(-25deg);
              }
              40%,
              80% {
                transform: rotate(10deg);
              }
            }
            @media (max-width: 500px) {
              .github-corner:hover .octo-arm {
                animation: none;
              }
              .github-corner .octo-arm {
                animation: octocat-wave 560ms ease-in-out;
              }
            }
          `}</style>
        </a>
      </div>
    );
  }

  // Use the existing SyncProgress component for loading/syncing states
  return (
    <AnimatePresence>
      {isLoadingAudio && (
        <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <SyncProgress />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
