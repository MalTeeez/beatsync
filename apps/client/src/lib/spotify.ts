import { getCookie, removeCookie, setCookie } from "@/utils/cookies";

export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_API_TOKEN_URL = "https://accounts.spotify.com/api/token";
export const SPOTIFY_REDIRECT_URI = "http://127.0.0.1:3000/callback/spotify";

export const SPOTIFY_SCOPES = [
  // "ugc-image-upload",
  // "user-read-recently-played",
  // "user-top-read",
  // "user-read-playback-position",
  "user-read-playback-state",
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

export function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

export async function getChallengeCode(): Promise<[string, string]> {
  // See https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(96));
  const codeVerifier = values.reduce((acc, x) => acc + possible[x % possible.length], "");
  const challengeCode = base64encode(await sha256(codeVerifier));
  return [codeVerifier, challengeCode];
}

export function handleSpotifyOAuthCallback(code: string) {
  return new Promise(async (resolve, reject) => {
    const codeVerifier = getCookie("spotifyChallengeSecret");
    if (!codeVerifier) {
      reject("Missing code_verifier cookie");
      return;
    }

    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    };
    const response = await fetch(SPOTIFY_API_TOKEN_URL, payload)
      .then((res) => res.json())
      .catch((err) => reject(err));

    if (isTokenObject(response)) {
      saveToken(response);
      removeCookie("spotifyChallengeSecret");
      resolve(response);
    } else {
      reject();
    }
  });
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

export function saveToken(token: TokenObject) {
  setCookie("spotifyToken", token.access_token, 3600);
  setCookie("spotifyRefreshToken", token.refresh_token, 360000);
  setCookie("spotifyTokenCreatedAt", String(Date.now()), 3600);
}

export function needToRefreshToken() {
  const token = getCookie("spotifyToken");
  const createdAt = getCookie("spotifyTokenCreatedAt");
  const spotifyRefreshToken = getCookie("spotifyRefreshToken");

  console.log(
    "Need to refresh spotify token? " + !(token && createdAt && spotifyRefreshToken && Date.now() - Number(createdAt) < 3_000_000)
  );

  // Need to refresh if we have no token, or if the current token is about to expire (10 minutes beforehand)
  return !(token && createdAt && spotifyRefreshToken && Date.now() - Number(createdAt) < 3_000_000);
}

export async function refreshToken() {
  const spotifyRefreshToken = getCookie("spotifyRefreshToken");
  if (spotifyRefreshToken) {
    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: SPOTIFY_CLIENT_ID,
        refresh_token: spotifyRefreshToken,
      }),
    };
    const response = await fetch(SPOTIFY_API_TOKEN_URL, payload);

    if (response.ok) {
      const data = await response.json();
      console.log("refreshed spotify token")
      setCookie("spotifyToken", data.access_token, 3600);
      setCookie("spotifyTokenCreatedAt", String(Date.now()), 3600);

      // We are sometimes provided a new refresh token on these calls, so we save that here
      if (data.refresh_token) {
        setCookie("spotifyRefreshToken", data.refresh_token, 360000);
      }
    } else {
      console.warn("Failed to renew spotify token, logging out.");
      removeCookie("spotifyToken");
      removeCookie("spotifyRefreshToken");
      removeCookie("spotifyTokenCreatedAt");
      removeCookie("spotifyChallengeSecret");
    }
  }
}

export async function getToken(): Promise<string | undefined> {
  if (needToRefreshToken()) {
    await refreshToken();
  }

  return getCookie("spotifyToken");
}
