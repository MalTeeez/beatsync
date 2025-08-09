import { WebPlaybackSDK } from "react-spotify-web-playback-sdk";
import { SpotifyPlayer } from "./SpotifyPlayer";
import { SpotifyDevice } from "./SpotifyDevice";
import { getToken } from "@/lib/spotify";
import { useCallback } from "react";
import { FaSpotify } from "react-icons/fa";

export const SpotifyContainer: React.FC = () => {
  const getOAuthToken: Spotify.PlayerInit["getOAuthToken"] = useCallback(
    async (callback) => callback((await getToken()) || ""),
    []
  );

  return (
    <WebPlaybackSDK
      initialDeviceName="Beatsync"
      getOAuthToken={getOAuthToken}
      initialVolume={0.5}
      connectOnInitialized={true}
    >
      <div className="border-2 border-green-600 size-fit rounded-xl self-end">
        <div className="flex flex-row justify-end items-center gap-4 px-4">
          <FaSpotify className="h-5 w-5 text-primary-500" />
          <SpotifyPlayer />
          <SpotifyDevice />
        </div>
      </div>
    </WebPlaybackSDK>
  );
};
