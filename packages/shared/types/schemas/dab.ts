/**
 * Defines a track type.
 */
export type Track = {
    id: number;
    title: string;
    artist: string;
    albumTitle: string;
    duration: number;
    version: string | null;
    images: {
        small: string;
        thumbnail: string;
        large: string;
    };
};

export type Pagination = {
    offset: number;
    total: number;
    hasMore: boolean;
};
