"use client";

import { useThreads, useUser } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";
import { ErrorBoundary } from "react-error-boundary";
import { ThreadData } from "@liveblocks/core";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Comment } from "@liveblocks/react-ui/primitives";
import {
  resetAllHighlights,
  useHighlightPinListener,
  useHighlightThread,
} from "@/utils";
import { formatTime } from "@/components/Duration";
import { Mention } from "@/components/Mention";
import { Link } from "@/components/Link";
import { useState } from "react";

export function ThreadsTimeline() {
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <ClientSideSuspense fallback={null}>
        <PinnedThreads />
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}

function PinnedThreads() {
  const { threads } = useThreads();

  return (
    <div className="w-full mb-2.5">
      {threads.map((thread) => (
        <PinnedThread key={thread.id} thread={thread} />
      ))}
    </div>
  );
}

function PinnedThread({ thread }: { thread: ThreadData }) {
  const { user } = useUser(thread.comments?.[0].userId || "");
  const highlightThread = useHighlightThread(thread.id);
  const [highlightedPin, setHighlightedPin] = useState(false);

  useHighlightPinListener((threadId) => {
    if (thread.id !== threadId) {
      setHighlightedPin(false);
      return;
    }

    setHighlightedPin(false);
    setTimeout(() => setHighlightedPin(true));
  });

  if (thread.metadata.time === -1 || !thread.comments.length) {
    return null;
  }

  return (
    <div
      className="
        absolute 
        bottom-0 
        cursor-pointer 
        -translate-x-1/2 
        origin-center-bottom 
        transition-transform 
        duration-100 
        ease-out
        data-[highlight]:scale-[1.2]
      "
      onClick={highlightThread}
      onPointerEnter={highlightThread}
      onPointerLeave={resetAllHighlights}
      style={{ left: `${thread.metadata.timePercentage}%` }}
      data-highlight={highlightedPin || undefined}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div className="cursor-pointer select-none">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-[20px] h-[20px] rounded-full"
            />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content
          className="
           font-medium
            select-none 
            bg-gray-2
            text-gray-12
            p-2 
            rounded-[var(--border-radius)] 
            mb-2 
            whitespace-nowrap 
            max-w-[200px] 
            text-base
          "
        >
          <div className="flex gap-1.5 items-center font-medium">
            <img
              src={user.avatar}
              alt=""
              className="w-[20px] h-[20px] rounded-full"
            />
            {user.name}
          </div>
          <div className="mt-2">
            <span className="text-accent">
              {formatTime(thread.metadata.time) + " "}
            </span>
            <Comment.Body
              body={thread.comments[0].body}
              components={{
                Mention: (props) => (
                  <Comment.Mention asChild>
                    <Mention {...props} />
                  </Comment.Mention>
                ),
                Link: (props) => (
                  <Comment.Link asChild>
                    <Link {...props}>{props.children}</Link>
                  </Comment.Link>
                ),
              }}
              className="inline-block"
            />
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}

export default ThreadsTimeline;
