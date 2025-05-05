'use client'

import { NewSyncer } from "@/components/NewSyncer"
import { validateFullRoomId } from "@/lib/room"
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RoomContent() {
  const roomId = useSearchParams().get("id");

  if (typeof roomId !== 'string' || (typeof roomId === 'string' && !validateFullRoomId(roomId))) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2">
        <div>
          Invalid room ID: <span className="font-bold">{roomId}</span>
        </div>
        <div className="text-sm text-gray-500">
          Please enter a valid 6-digit numeric code.
        </div>
      </div>
    )
  }

  return <NewSyncer roomId={roomId} />
}

export default function Page() {
  return (
    <Suspense>
      <RoomContent />
    </Suspense>
  )
}