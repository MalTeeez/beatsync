import { GRID, PositionType } from "@beatsync/shared/types/basic";
import { RoomData } from "./roomManager";
import { Server } from "bun";
import { WSBroadcastType } from "@beatsync/shared/types/WSBroadcast";
import { epochNow } from "@beatsync/shared";
import { SCHEDULE_TIME_MS } from "./config";
import { sendBroadcast } from "./utils/responses";

function calculateEuclideanDistance(
  p1: PositionType,
  p2: PositionType
): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

interface GainParams {
  client: PositionType;
  source: PositionType;
  falloff?: number;
  minGain?: number;
  maxGain?: number;
}

export const calculateGainFromDistanceToSource = (params: GainParams) => {
  return gainFromDistanceQuadratic(params);
};

export function gainFromDistanceExp({
  client,
  source,
  falloff = 0.05,
  minGain = 0.15,
  maxGain = 1.0,
}: GainParams): number {
  const distance = calculateEuclideanDistance(client, source);
  const gain = maxGain * Math.exp(-falloff * distance);
  return Math.max(minGain, gain);
}

export function gainFromDistanceLinear({
  client,
  source,
  falloff = 0.01,
  minGain = 0.15,
  maxGain = 1.0,
}: GainParams): number {
  const distance = calculateEuclideanDistance(client, source);
  // Linear falloff: gain decreases linearly with distance
  const gain = maxGain - falloff * distance;
  return Math.max(minGain, gain);
}

export function gainFromDistanceQuadratic({
  client,
  source,
  falloff = 0.001,
  minGain = 0.15,
  maxGain = 1.0,
}: GainParams): number {
  const distance = calculateEuclideanDistance(client, source);
  // Quadratic falloff: gain decreases with square of distance
  const gain = maxGain - falloff * distance * distance;
  return Math.max(minGain, gain);
}

export function updateSpatialAudio (room: RoomData, server: Server) {
  const clients = Array.from(room.clients.values()); // get most recent
  console.log(
    `ROOM ${room.roomId} LOOP ${room.spatialLoopCount}: Connected clients: ${clients.length}`
  );
  if (clients.length < 1) return;

  // Calculate new position for listening source in a circle
  // Use loopCount to determine the angle
  const radius = 25; // Radius of the circle
  const centerX = GRID.ORIGIN_X;
  const centerY = GRID.ORIGIN_Y;
  const angle = (room.spatialLoopCount * Math.PI) / 30; // Slow rotation, completes a circle every 60 iterations

  const newX = centerX + radius * Math.cos(angle);
  const newY = centerY + radius * Math.sin(angle);

  // Update the listening source position
  room.listeningSource = { x: newX, y: newY };

  // Calculate gains for each client based on distance from listening source
  const gains = Object.fromEntries(
    clients.map((client) => {
      const gain = calculateGainFromDistanceToSource({
        client: client.position,
        source: room.listeningSource,
      });

      return [
        client.clientId,
        {
          gain,
          rampTime: 0.25, // Use a moderate ramp time for smooth transitions
        },
      ];
    })
  );

  // Send the updated configuration to all clients
  const message: WSBroadcastType = {
    type: "SCHEDULED_ACTION",
    serverTimeToExecute: epochNow() + SCHEDULE_TIME_MS,
    scheduledAction: {
      type: "SPATIAL_CONFIG",
      listeningSource: room.listeningSource,
      gains,
    },
  };
  
  sendBroadcast({ server, roomId: room.roomId, message });
  room.spatialLoopCount++;
};