import { getToken } from "@/lib/spotify";
import { MonitorSpeaker } from "lucide-react";
import React, { useEffect, useState } from "react";
import { usePlayerDevice, useSpotifyPlayer, useWebPlaybackSDKReady } from "react-spotify-web-playback-sdk";

interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

interface DevicesResponse {
  devices: SpotifyDevice[];
}

export const SpotifyDevice: React.FC = () => {
  const player = useSpotifyPlayer();
  const playerDevice = usePlayerDevice();
  const webPlaybackSDKReady = useWebPlaybackSDKReady();
  const [showDevices, setShowDevices] = useState(false);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (playerDevice?.device_id === undefined || !webPlaybackSDKReady) {
      console.log("Tried to initialize spotify web session, but device or sdk are uninitialized", webPlaybackSDKReady);
      return;
    }

    (async function () {
      const accessToken = await getToken();
      if (!accessToken) return;
      // https://developer.spotify.com/documentation/web-api/reference/#endpoint-transfer-a-users-playback
      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        body: JSON.stringify({ device_ids: [playerDevice.device_id], play: true }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
    })();
  }, [playerDevice?.device_id, webPlaybackSDKReady]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      const response = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data: DevicesResponse = await response.json();

        // Set correct volume according to what is currently set by spotify for this client
        for (const device of data.devices) {
          if (
            device.name === player?._options.name &&
            player._options.volume != undefined &&
            device.volume_percent !== player._options.volume * 100
          ) {
            player.setVolume(device.volume_percent / 100);
          }
        }
        setDevices(data.devices);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceClick = () => {
    if (!showDevices) {
      fetchDevices();
    }
    setShowDevices(!showDevices);
  };

  const switchToDevice = async (deviceId: string) => {
    try {
      const accessToken = await getToken();
      if (!accessToken) return;

      await fetch(`https://api.spotify.com/v1/me/player`, {
        method: "PUT",
        body: JSON.stringify({ device_ids: [deviceId], play: true }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Refresh devices list
      fetchDevices();
      setShowDevices(false);
    } catch (error) {
      console.error("Failed to switch device:", error);
    }
  };

  return (
    <div className="relative">
      <div className="">
        <MonitorSpeaker onClick={handleDeviceClick} className="cursor-pointer hover:text-green-500 transition-colors" />
      </div>

      {showDevices && (
        <div className="absolute bottom-10 -right-4 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg min-w-64 z-50">
          <div className="p-3 border-b border-neutral-700">
            <h3 className="text-sm font-medium text-white">Spotify Devices</h3>
          </div>

          {loading ? (
            <div className="p-4 text-center text-neutral-400">Loading...</div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {devices.length === 0 ? (
                <div className="p-4 text-center text-neutral-400">No devices found</div>
              ) : (
                devices.map((device) => (
                  <div
                    key={device.id}
                    onClick={() => switchToDevice(device.id)}
                    className={`p-3 cursor-pointer hover:bg-neutral-700 border-b border-neutral-700 last:border-b-0 ${
                      device.is_active ? "bg-green-600/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">{device.name}</div>
                        <div className="text-xs text-neutral-400 capitalize">{device.type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.is_active && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        <div className="text-xs text-neutral-400">{device.volume_percent}%</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
