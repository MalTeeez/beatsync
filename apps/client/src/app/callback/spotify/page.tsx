"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalStore } from "@/store/global";

export default function SpotifyCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const currentUser = useGlobalStore().currentUser;

  useEffect(() => {
    // Parse query params from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const [clientId, roomId] = params.get("state")?.split("-") ?? [];
    const errorParam = params.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }

    if (!code || !clientId) {
      setError("Missing code or state from Spotify.");
      return;
    }

    // For now, just redirect to the room the person was in
    router.replace(`/room/${roomId}?code=${code}`);
  }, [router, currentUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Spotify Login Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Logging you in with Spotify…</h1>
      <p className="text-neutral-400">Please wait…</p>
    </div>
  );
}