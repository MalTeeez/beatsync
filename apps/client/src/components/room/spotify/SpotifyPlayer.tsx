import { Button } from "@/components/ui/button";
import { setSDKPlayer } from "@/lib/spotify";
import { useGlobalStore } from "@/store/global";
import { sendWSRequest } from "@/utils/ws";
import { ClientActionEnum } from "@beatsync/shared/types/WSRequest";
import { useSpotifyPlayer } from "react-spotify-web-playback-sdk";

export const SpotifyPlayer: React.FC = () => {
  const player = useSpotifyPlayer();
  const socket = useGlobalStore((state) => state.socket);

  if (player === null) {
    return null;
  } else {
    setSDKPlayer(player);
  }

  function playExampleTrack() {
    if (socket) {
      sendWSRequest({
        ws: socket,
        request: {
          type: ClientActionEnum.enum.EXTERNAL_PLAY,
          externalProviderId: "spotify",
          externalTrackId: "spotify:track:1WKiMN73NFY2QuRSrmtpHH",
          trackTimeMillis: 0,
        },
      });
    }
  }

  return (
    <div className="flex my-2 justify-end select-none">
      <Button
        className="text-xs px-3 py-1 h-auto bg-green-600/60 hover:bg-green-600 text-white transition-colors duration-200 w-fit rounded-lg select-none"
        onClick={() => {
          playExampleTrack();
        }}
      >
        Click to Play
      </Button>
    </div>
  );
};
