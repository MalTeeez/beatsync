import { ExternalPlayActionType } from "@beatsync/shared";
import { getAudioPlayer, useGlobalStore } from "./global";
import { getSDKPlaybackState, playTrack, stopPlaying } from "@/lib/spotify";

export type AudioProviderId = "internal" | "spotify"; // Add more as needed

export interface ExternalProvider {
  id: AudioProviderId;
  play: (data: ExternalPlayActionType, relativeWhenMillis: number) => Promise<void>;
  pause: (whrelativeWhenMillisen: number) => Promise<void>;
  isReady: () => boolean;
  // Add more methods as needed
}

// --- Provider Registry Implementation ---
export const providerRegistry: Record<AudioProviderId, ExternalProvider> = {
  //   Example for internal play logic
  // TODO: Migrate existing play logic through this
  internal: {
    id: "internal",
    play: async (data) => {
      //@ts-expect-error Not used yet, will need more logic to map onto existing payload type
      useGlobalStore.getState().playAudio(data);
    },
    pause: async (data) => {
      //@ts-expect-error Not used yet, will need more logic to map onto existing payload type
      useGlobalStore.getState().pauseAudio(data);
    },
    isReady: () => true,
  },
  spotify: {
    id: "spotify",
    play: async (data, relativeWhenMillis) => {
      setTimeout(async () => {
        await playTrack(data.trackTimeMillis, data.externalTrackId).then((duration_ms) => {
          console.log("started at, with offset, will take", Date.now() / 1000, data.trackTimeMillis / 1000, duration_ms / 1000)
          useGlobalStore.setState((state) => ({
            ...state,
            isPlaying: true,
            playbackStartTime: getAudioPlayer(useGlobalStore.getState()).audioContext.currentTime, // Don't have to adjust for when since we are already there
            playbackOffset: data.trackTimeMillis / 1000,
            duration: duration_ms / 1000, // Set the duration
          }));
        });
      }, relativeWhenMillis);
    },
    pause: async (relativeWhenMillis) => {
      setTimeout(async () => {
        await stopPlaying().then(() => {
          getSDKPlaybackState().then((SDKstate) => {
            useGlobalStore.setState((state) => ({
              ...state,
              isPlaying: false,
              currentTime: SDKstate.position,
            }));
          });
        });
      }, relativeWhenMillis);
    },
    isReady: () => useGlobalStore.getState().isSpotifySignedIn && useGlobalStore.getState().isSpotifyReadyToPlay,
  },
  // Add more providers here
};
