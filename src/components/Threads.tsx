"use client";

import { useThreads } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { Thread } from "@liveblocks/react-ui";
import { FormEvent, useCallback, useRef, useState } from "react";
import styles from "./Threads.module.css";
import {
  resetAllHighlights,
  useHighlightPin,
  useHighlightThreadListener,
  useSkipTo,
} from "@/utils";
import { ThreadData } from "@liveblocks/core";
import { formatTime } from "@/components/Duration";
import { TimeIcon } from "@/icons/Time";
import { Loading } from "./Loading";

export function Threads({
  resourceId,
  status,
}: {
  resourceId: string;
  status: string;
}) {
  return (
    <ClientSideSuspense fallback={<Loading />}>
      <ThreadList resourceId={resourceId} status={status} />
    </ClientSideSuspense>
  );
}

function ThreadList({
  resourceId,
  status,
}: {
  resourceId: string;
  status: string;
}) {
  const { threads } = useThreads();
  const filteredThreads = threads.filter((thread) => {
    // First filter by resourceId
    if (thread.metadata.resourceId !== resourceId) return false;

    if (status === "Open") return !thread.resolved;
    if (status === "Resolved") return thread.resolved;

    // If selectedFilter is 'All', include all threads for this resource
    return true;
  });

  if (threads.length === 0) {
    return <div className={styles.emptyState}>No comments yet!</div>;
  }

  return (
    <>
      {filteredThreads.sort(sortThreads).map((thread) => (
        <CustomThread key={thread.id} thread={thread} />
      ))}
    </>
  );
}

function CustomThread({ thread }: { thread: ThreadData }) {
  const ref = useRef<HTMLDivElement>(null);
  const threadHasTime =
    thread.metadata.timePercentage !== -1 &&
    thread.metadata.resourceType !== "image";
  const skipTo = useSkipTo();
  const highlightPin = useHighlightPin(thread.id);

  const [highlightedThread, setHighlightedThread] = useState(false);

  // Send highlight event to thread timeline
  useHighlightThreadListener((threadId) => {
    if (thread.id !== threadId) {
      setHighlightedThread(false);
      return;
    }

    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
    setHighlightedThread(false);
    setTimeout(() => setHighlightedThread(true));
  });

  // Skip to metadata time
  const handleButtonClick = useCallback(() => {
    if (!thread.metadata.timePercentage) {
      return;
    }

    skipTo(thread.metadata.timePercentage);
  }, [skipTo]);

  // Stop keyboard events firing on window when typing (i.e. prevent fullscreen with `f`)
  const handleKeyDown = useCallback((event: FormEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      ref={ref}
      className={styles.threadWrapper}
      onPointerEnter={highlightPin}
      onPointerLeave={resetAllHighlights}
      data-highlight={highlightedThread || undefined}
    >
      {threadHasTime ? (
        <button className={styles.threadTime} onClick={handleButtonClick}>
          <TimeIcon />
          {formatTime(thread.metadata.time)}
        </button>
      ) : null}
      <Thread
        className={styles.thread}
        thread={thread}
        indentCommentContent={true}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

function sortThreads(a: ThreadData, b: ThreadData) {
  if (a.metadata.timePercentage > b.metadata.timePercentage) {
    return 1;
  }

  if (a.metadata.timePercentage < b.metadata.timePercentage) {
    return -1;
  }

  return 0;
}
