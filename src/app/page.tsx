"use client";
import { Room } from "@/app/Room";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Threads } from "@/components/Threads";
import { Presence } from "@/components/Presence";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { NewThreadComposer } from "@/components/NewThreadComposer";
import { useState } from "react";

export default function Home() {
  const [videoState, setVideoState] = useState<any>(null);

  const handleVideoStateChange = (newState: any) => {
    setVideoState(newState);
  };

  return (
    <Room>
      <div className="h-full w-full flex flex-col">
        <header className="flex-none flex justify-between items-center px-4 py-3 h-[60px] bg-gray-2 text-2xl border-b border-gray-4">
          <h1 className="text-base font-medium">My video name</h1>
          <Presence />
        </header>

        <main className="flex-1 flex min-h-0">
          <div className="flex-1 overflow-y-auto">
            <VideoPlayer onStateChange={handleVideoStateChange} />
          </div>

          <div className="flex-none w-[350px] max-w-full bg-gray-2 border-l border-gray-4 overflow-y-auto">
            <Threads />
            <ClientSideSuspense fallback={null}>
              <NewThreadComposer
                getCurrentPercentage={videoState?.getCurrentPercentage}
                setPlaying={videoState?.setPlaying}
                time={videoState?.time}
              />
            </ClientSideSuspense>
          </div>
        </main>
      </div>
    </Room>
  );
}
