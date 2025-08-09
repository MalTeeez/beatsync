import { Button } from "@/components/ui/button";
import { useSpotifyPlayer } from "react-spotify-web-playback-sdk";

export const SpotifyPlayer: React.FC = () => {
  const player = useSpotifyPlayer();

  if (player === null) {
    return null
  };

  return (
    <div className="flex my-2 justify-end select-none">
      <Button
        className="text-xs px-3 py-1 h-auto bg-green-600/60 hover:bg-green-600 text-white transition-colors duration-200 w-fit rounded-lg select-none"
        onClick={() => {
          player.togglePlay();
        }}
      >
        Click to Play
      </Button>
    </div>
  );
};
