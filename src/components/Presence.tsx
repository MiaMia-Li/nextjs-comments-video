"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { PresenceStates } from "@/liveblocks.config";
import { PauseIcon } from "@/icons/Pause";
import { PlayIcon } from "@/icons/Play";
import { ClientSideSuspense } from "@liveblocks/react";

export function Presence() {
  return (
    <ClientSideSuspense fallback={null}>
      <Avatars />
    </ClientSideSuspense>
  );
}

function Avatars() {
  const users = useOthers();
  const currentUser = useSelf();

  return (
    <div className="flex">
      {users.map(({ connectionId, info, presence }) => {
        return (
          <Avatar
            key={connectionId}
            src={info.avatar}
            name={info.name}
            state={presence.state}
          />
        );
      })}

      {currentUser && (
        <Avatar
          src={currentUser.info.avatar}
          name={currentUser.info.name}
          state={currentUser.presence.state}
        />
      )}
    </div>
  );
}

type AvatarProps = { src: string; name: string; state: PresenceStates };

function Avatar({ src, name, state }: AvatarProps) {
  return (
    <div
      className="
        flex 
        place-content-center 
        relative 
        border-2 
        border-gray-2
        rounded-full 
        w-[32px] 
        h-[32px] 
        -ml-2 
        group
      "
      data-tooltip={name}
    >
      <img src={src} className="w-full h-full rounded-full" alt={name} />
      <span
        className="
          absolute 
          bottom-0 
          left-1/2 
          -translate-x-1/2 
          translate-y-1/2 
          w-4 
          h-4 
          bg-gray-2
          rounded-full 
          flex 
          items-center 
          justify-center
        "
      >
        {state === "playing" ? (
          <PlayIcon className="w-2 h-2 fill-gray-11" />
        ) : (
          <PauseIcon className="w-2 h-2 fill-gray-11" />
        )}
      </span>

      {/* Tooltip */}
      <div
        className="
          absolute 
          top-full 
          left-1/2 
          -translate-x-1/2 
          opacity-0 
          group-hover:opacity-100 
          transition-opacity 
          duration-150 
          ease-out 
          bg-gray-1
          text-gray-12
          text-xs 
          px-2 
          py-1 
          rounded-md 
          whitespace-nowrap 
          mt-2.5 
          z-10
        "
      >
        {name}
      </div>
    </div>
  );
}

export default Presence;
