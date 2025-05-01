declare function ytdl(url: string, options?: ytdl.downloadOptions): AsyncIterableIterator<Uint8Array>;

declare namespace ytdl {
    interface downloadOptions {
        filter?: string;
        quality?: string;
        highWaterMark?: number;
        dlChunkSize?: number;
    }

    function validateURL(url: string): boolean;
    function getVideoID(url: string): string;
}

export = ytdl;