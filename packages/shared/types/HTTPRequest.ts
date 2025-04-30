import { z } from "zod";

export const UploadAudioSchema = z.object({
  name: z.string(),
  audioData: z.string(), // base64 encoded audio data
  roomId: z.string(),
});
export type UploadAudioType = z.infer<typeof UploadAudioSchema>;

export const GetAudioSchema = z.object({
  id: z.string(),
});
export type GetAudioType = z.infer<typeof GetAudioSchema>;

export const DownloadYTAudioSchema = z.object({
  url: z.string(),
  roomId: z.string(),
});
export type DownloadYTAudioType = z.infer<typeof DownloadYTAudioSchema>;