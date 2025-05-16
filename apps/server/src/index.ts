import { handleGetAudio } from "./routes/audio";
import { handleYTDownload } from "./routes/download_yt";
import { handleDownload } from "./routes/download";
import { handleSearch } from "./routes/search";
import { handleBunStats, handleStats, handleV8Stats, handleRoomStats } from "./routes/stats";
import { handleUpload } from "./routes/upload";
import { handleWebSocketUpgrade } from "./routes/websocket";
import { handleClose, handleMessage, handleOpen } from "./routes/websocketHandlers";
import { corsHeaders, errorResponse } from "./utils/responses";
import { WSData } from "./utils/websocket";

const api_path = process.env.API_PATH || '';
// Bun.serve with WebSocket support
export const server = Bun.serve<WSData, any>({
    hostname: "0.0.0.0",
    port: process.env.PORT_API || 3651,
    routes: {
        [`${api_path}/ws`]: (req: Request) => handleWebSocketUpgrade(req),
        [`${api_path}/upload`]: {
            POST: async (req: Request) => handleUpload(req),
        },
        [`${api_path}/yt_download`]: {
            POST: async (req: Request) => handleYTDownload(req),
        },
        [`${api_path}/download`]: {
            POST: async (req: Request) => handleDownload(req),
        },
        [`${api_path}/search`]: {
            GET: async (req: Request) => handleSearch(req),
        },
        [`${api_path}/audio`]: {
            POST: async (req: Request) => handleGetAudio(req),
        },
        [`${api_path}/stats_rooms`]: async () => handleRoomStats(),
        [`${api_path}/stats_v8`]: async () => handleV8Stats(),
        [`${api_path}/stats_bun`]: async () => handleBunStats(),
        [`${api_path}/stats`]: async (req: Request) => handleStats(req),
        [`${api_path}/`]: {
            GET: () => new Response("Hello Hono!"),
        },
    },
    // Global catch-all (/*) is still a little buggy with methods, so we do it here
    async fetch(req) {
        if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders, status: 200 });
        return errorResponse(`${req.url} not found with method ${req.method}.`, 404);
    },

    websocket: {
        sendPings: true,
        // Close websockets that have been idle (not responding to pings) after 2 minutes
        idleTimeout: 900,
        async open(ws) {
            handleOpen(ws, server);
        },

        async message(ws, message) {
            handleMessage(ws, message, server);
        },

        async close(ws) {
            handleClose(ws, server);
        },
    },
});

console.log(`HTTP listening on http://${server.hostname}:${server.port}${api_path}`);
