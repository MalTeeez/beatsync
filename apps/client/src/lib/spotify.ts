export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_API_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_REDIRECT_URI = "http://127.0.0.1:3000/callback/spotify";

export const SPOTIFY_SCOPES = [
  // "ugc-image-upload",
  // "user-read-recently-played",
  // "user-top-read",
  // "user-read-playback-position",
  // "user-read-playback-state",
  "user-modify-playback-state",
  // "user-read-currently-playing",
  // "app-remote-control",
  "streaming",
  // "playlist-modify-public",
  // "playlist-modify-private",
  // "playlist-read-private",
  // "playlist-read-collaborative",
  // "user-follow-modify",
  // "user-follow-read",
  // "user-library-modify",
  // "user-library-read",
  "user-read-email",
  "user-read-private",
] as const;

export const SPOTIFY_CLIENT_ID = "5a84f18bf3204f07bbf7b162bddc0c12";
export const SPOTIFY_CLIENT_SECRET = "5986155990d5428088c33323b5ca5604";

export function handleSpotifyOAuthCallback(code: string) {
  return new Promise(async (resolve, reject) => {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET,
    });
  
    const response = await fetch(SPOTIFY_API_TOKEN_URL, {
      method: "POST",
      body: params,
    }).then((res) => res.json()).catch(() => reject());
  
    if (isTokenObject(response)) {
      resolve( 
        response,
      );
    } else {
      reject()
    }
  })
}

export type TokenObject = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

function isTokenObject(value: unknown): value is TokenObject {
  return (
    typeof value === "object" &&
    value !== null &&
    "access_token" in value &&
    "token_type" in value &&
    "scope" in value &&
    "expires_in" in value &&
    "refresh_token" in value &&
    typeof value.access_token === "string" &&
    typeof value.token_type === "string" &&
    typeof value.scope === "string" &&
    typeof value.expires_in === "number" &&
    typeof value.refresh_token === "string"
  );
}
