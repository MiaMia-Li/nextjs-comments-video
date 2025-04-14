"use client";
import { Room } from "@/app/Room";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Threads } from "@/components/Threads";
import styles from "./page.module.css";
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
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>My video name</h1>
          <Presence />
        </header>
        <main className={styles.main}>
          <div className={styles.videoPanel}>
            <VideoPlayer onStateChange={handleVideoStateChange} />
          </div>
          <div className={styles.threadsPanel}>
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
