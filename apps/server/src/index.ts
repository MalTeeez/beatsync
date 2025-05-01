import { handleGetAudio } from "./routes/audio";
import { handleYTDownload } from "./routes/download_yt";
import { handleRoot } from "./routes/root";
import { handleStats } from "./routes/stats";
import { handleUpload } from "./routes/upload";
import { handleWebSocketUpgrade } from "./routes/websocket";
import { handleClose, handleMessage, handleOpen } from "./routes/websocketHandlers";
import { corsHeaders } from "./utils/responses";
import { WSData } from "./utils/websocket";

const api_path = process.env.API_PATH || '';
// Bun.serve with WebSocket support
export const server = Bun.serve<WSData, any>({
    hostname: "0.0.0.0",
    port: process.env.PORT_API || 3651,
    routes: {
        [`${api_path}/*`]: {
            OPTIONS: () => new Response(null, { headers: corsHeaders }),
        },
        [`${api_path}/`]: (req: Request) => handleRoot(req),
        [`${api_path}/ws`]: (req: Request) => handleWebSocketUpgrade(req),
        [`${api_path}/upload`]: {
            POST: async (req: Request) => handleUpload(req),
        },
        [`${api_path}/yt_download`]: {
            POST: async (req: Request) => handleYTDownload(req),
        },
        [`${api_path}/audio`]: {
            POST: async (req: Request) => handleGetAudio(req),
        },
        [`${api_path}/stats`]: async (req: Request) => handleStats(req),
    },
    async fetch(req) {
        return new Response("Not Found", { status: 404 });
    },

    websocket: {
        open(ws) {
            handleOpen(ws, server);
        },

        message(ws, message) {
            handleMessage(ws, message, server);
        },

        close(ws) {
            handleClose(ws, server);
        },
    },
});

console.log(`HTTP listening on http://${server.hostname}:${server.port}`);
