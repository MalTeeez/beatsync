"use client";
import { useGlobalStore, useCanMutate } from "@/store/global";
import { AudioLines } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { FaSpotify } from "react-icons/fa";
import { useRoomStore } from "@/store/room";
import { useEffect } from "react";
import { handleSpotifyOAuthCallback, TokenObject } from "@/lib/spotify";

export const SourceControls = () => {
  const canMutate = useCanMutate();
  const isSpotifySignedIn = useGlobalStore((state) => state.isSpotifySignedIn);
  const signInToSpotify = useGlobalStore((state) => state.signInToSpotify);
  const signOutOfSpotify = useGlobalStore((state) => state.signOutOfSpotify);
  const setSpotifyLoggedIn = useGlobalStore((state) => state.setSpotifyLoggedIn)
  const roomId = useRoomStore((state) => state.roomId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleSpotifyOAuthCallback(code).then((data) => {
        const tokenData = data as TokenObject;
        setSpotifyLoggedIn(tokenData)
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  });

  const handleSpotifySignIn = () => {
    signInToSpotify(roomId)
  };

  const handleSpotifySignOut = () => {
    signOutOfSpotify()
  };

  return (
    <motion.div className="px-4 space-y-2 py-3 mt-1">
      <div className="flex items-center gap-2 font-medium">
        <AudioLines size={18} />
        <span>Streaming Sources</span>
      </div>

      <div className="space-y-2">
        <motion.div className={cn(
          "bg-neutral-800/20 rounded-md p-3 hover:bg-neutral-800/30 transition-colors",
          !canMutate && "opacity-50"
        )}>
          <div className="flex justify-between items-center">
            <div className="text-xs text-neutral-300 flex items-center gap-1.5">
              <FaSpotify className="h-5 w-5 text-primary-500" />
              <span className="pl-1">Spotify</span>
            </div>
            <div className="flex gap-2">
              <Button
                className="text-xs px-3 py-1 h-auto bg-primary-600/80 hover:bg-primary-600 text-white"
                size="sm"
                onClick={handleSpotifySignIn}
                disabled={isSpotifySignedIn}
              >
                Sign In
              </Button>
              <Button
                className="text-xs px-3 py-1 h-auto bg-neutral-700/60 hover:bg-neutral-700 text-white"
                size="sm"
                onClick={handleSpotifySignOut}
                disabled={!isSpotifySignedIn}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
