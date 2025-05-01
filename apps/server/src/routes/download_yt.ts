import { DownloadYTAudioSchema } from "@beatsync/shared";
import { mkdir } from "node:fs/promises";
import * as path from "path";
import { AUDIO_DIR } from "../config";
import { errorResponse, jsonResponse, sendBroadcast } from "../utils/responses";
import * as ytdl from '../utils/ytdl-core-bun/index.js'
import { server } from "..";


export const handleYTDownload = async (req: Request) => {
    try {
        // Check content type
        const contentType = req.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return errorResponse("Content-Type must be application/json", 400);
        }

        // Parse and validate the request body using Zod schema
        const rawBody = await req.json();
        const parseResult = DownloadYTAudioSchema.safeParse(rawBody);

        if (!parseResult.success) {
            return errorResponse(`Invalid request data: ${parseResult.error.message}`, 400);
        }

        const { url, roomId } = parseResult.data;

        // Check if the supplied url is valid
        if (!ytdl.validateURL(url)) {
            return errorResponse(`Invalid audio url: ${url}`, 400);
        }

        // Create room-specific directory if it doesn't exist
        const roomDir = path.join(AUDIO_DIR, `room-${roomId}`);
        await mkdir(roomDir, { recursive: true });

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const ext = ".mp3"; // Default to mp3
        const filename = `${timestamp}${ext}`;

        // The ID that will be used for retrieving the file (includes room path)
        const fileId = path.join(`room-${roomId}`, filename);
        // Full path to the file
        const filePath = path.join(AUDIO_DIR, fileId);

        try {
            console.log("Trying to download url: ", url)
            const stream = ytdl(url, {
                filter: "audioonly",
                highWaterMark: 16384,
                dlChunkSize: 65536,
                quality: "highestaudio",
            });

            const chunks: Uint8Array[] = [];
            for await (const chunk of stream) {
                chunks.push(new Uint8Array(chunk));
                console.log("Storing chunk of size ", chunk.length)
            }
            
            // Combine all chunks into a single buffer
            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const buffer = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                buffer.set(chunk, offset);
                offset += chunk.length;
            }
        
            // Write the buffer to file using Bun.write
            await Bun.write(filePath, buffer);

            sendBroadcast({
                server,
                roomId,
                message: {
                    type: "ROOM_EVENT",
                    event: {
                        type: "NEW_AUDIO_SOURCE",
                        id: fileId,
                        title: "yt_" + ytdl.getVideoID(url), // Keep original name for display
                        duration: 1, // TODO: lol calculate this later properly
                        addedAt: Date.now(),
                        addedBy: roomId,
                    },
                },
            });

            // Return success response with the file details
            return jsonResponse({
                success: true,
            }); // Wait for the broadcast to be received.
        } catch (err) {
            console;
        }
    } catch (error) {
        console.error("Error handling upload:", error);
        return errorResponse("Failed to process upload", 500);
    }
};
