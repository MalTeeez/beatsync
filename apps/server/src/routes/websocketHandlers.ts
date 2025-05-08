import {
  ClientActionEnum,
  epochNow,
  WSBroadcastType,
  WSRequestSchema,
} from "@beatsync/shared";
import { Server, ServerWebSocket } from "bun";
import { SCHEDULE_TIME_MS } from "../config";
import { ROOM_MANAGER } from "../roomManager";
import { sendBroadcast, sendUnicast } from "../utils/responses";
import { WSData } from "../utils/websocket";

const createClientUpdate = (roomId: string) => {
  const message: WSBroadcastType = {
    type: "ROOM_EVENT",
    event: {
      type: ClientActionEnum.Enum.CLIENT_CHANGE,
      clients: ROOM_MANAGER.getClients(roomId),
    },
  };
  return message;
};

export const handleOpen = (ws: ServerWebSocket<WSData>, server: Server) => {
  console.log(
    `WebSocket connection opened for user ${ws.data.username} in room ${ws.data.roomId}`
  );
  sendUnicast({
    ws,
    message: {
      type: "SET_CLIENT_ID",
      clientId: ws.data.clientId,
    },
  });

  const { roomId } = ws.data;
  ws.subscribe(roomId);

  ROOM_MANAGER.addClient(ws);

  const message = createClientUpdate(roomId);
  sendBroadcast({ server, roomId, message });
};

export const handleMessage = async (
  ws: ServerWebSocket<WSData>,
  message: string | Buffer,
  server: Server
) => {
  const t1 = epochNow();
  const { roomId, username } = ws.data;

  try {
    const parsedData = JSON.parse(message.toString());
    const parsedMessage = WSRequestSchema.parse(parsedData);

    console.log(
      `Room: ${roomId} | User: ${username} | Message: ${JSON.stringify(
        parsedMessage
      )}`
    );

    // NTP Request
    if (parsedMessage.type === ClientActionEnum.enum.NTP_REQUEST) {
      sendUnicast({
        ws,
        message: {
          type: "NTP_RESPONSE",
          t0: parsedMessage.t0, // Echo back the client's t0
          t1, // Server receive time
          t2: epochNow(), // Server send time
        },
      });

      return;
    } else if (
      parsedMessage.type === ClientActionEnum.enum.PLAY ||
      parsedMessage.type === ClientActionEnum.enum.PAUSE
    ) {
      sendBroadcast({
        server,
        roomId,
        message: {
          type: "SCHEDULED_ACTION",
          scheduledAction: parsedMessage,
          serverTimeToExecute: epochNow() + SCHEDULE_TIME_MS, // 500 ms from now
          // TODO: Make the longest RTT + some amount instead of hardcoded this breaks for long RTTs
        },
      });

      return;
    } else if (
      parsedMessage.type === ClientActionEnum.enum.START_SPATIAL_AUDIO
    ) {
      // Start loop only if not already started
      const room = ROOM_MANAGER.getRoomState(roomId);
      if (!room || room.intervalId) return; // do nothing if no room or interval already exists

      ROOM_MANAGER.startInterval({ server, roomId });
    } else if (
      parsedMessage.type === ClientActionEnum.enum.STOP_SPATIAL_AUDIO
    ) {
      // This important for
      const message: WSBroadcastType = {
        type: "SCHEDULED_ACTION",
        scheduledAction: {
          type: "STOP_SPATIAL_AUDIO",
        },
        serverTimeToExecute: epochNow() + 0,
      };

      // Reset all gains:
      sendBroadcast({ server, roomId, message });

      // Stop the spatial audio interval if it exists
      const room = ROOM_MANAGER.getRoomState(roomId);
      if (!room || !room.intervalId) return; // do nothing if no room or no interval exists

      ROOM_MANAGER.stopInterval(roomId);
    } else if (parsedMessage.type === ClientActionEnum.enum.REUPLOAD_AUDIO) {
      // Handle reupload request by broadcasting the audio source again
      // This will trigger clients that don't have this audio to download it
      sendBroadcast({
        server,
        roomId,
        message: {
          type: "ROOM_EVENT",
          event: {
            type: "NEW_AUDIO_SOURCE",
            id: parsedMessage.audioId, // Use the existing file ID
            title: parsedMessage.audioName, // Use the original name
            duration: 1, // TODO: Calculate properly
            addedAt: Date.now(),
            addedBy: roomId,
          },
        },
      });
    } else if (parsedMessage.type === ClientActionEnum.enum.REORDER_CLIENT) {
      // Handle client reordering
      const reorderedClients = ROOM_MANAGER.reorderClients({
        roomId,
        clientId: parsedMessage.clientId,
        server,
      });

      // Broadcast the updated client order to all clients
      sendBroadcast({
        server,
        roomId,
        message: {
          type: "ROOM_EVENT",
          event: {
            type: ClientActionEnum.Enum.CLIENT_CHANGE,
            clients: reorderedClients,
          },
        },
      });
    } else if (
      parsedMessage.type === ClientActionEnum.enum.SET_LISTENING_SOURCE
    ) {
      // Handle listening source update
      ROOM_MANAGER.updateListeningSource({
        roomId,
        position: parsedMessage,
        server,
      });
    } else if (parsedMessage.type === ClientActionEnum.enum.MOVE_CLIENT) {
      // Handle client move
      ROOM_MANAGER.moveClient({ parsedMessage, roomId, server });
    } else {
      console.log(`UNRECOGNIZED MESSAGE: ${JSON.stringify(parsedMessage)}`);
    }
  } catch (error) {
    console.error("Invalid message format:", error);
    ws.send(
      JSON.stringify({ type: "ERROR", message: "Invalid message format" })
    );
  }
};

export const handleClose = (ws: ServerWebSocket<WSData>, server: Server) => {
  console.log(
    `WebSocket connection closed for user ${ws.data.username} in room ${ws.data.roomId}`
  );
  ws.unsubscribe(ws.data.roomId);
  ws.close();

  ROOM_MANAGER.removeClient(ws.data.roomId, ws.data.clientId);

  if (ROOM_MANAGER.getClients(ws.data.roomId).length > 0) {
    const message = createClientUpdate(ws.data.roomId);
    server.publish(ws.data.roomId, JSON.stringify(message));
  }
};