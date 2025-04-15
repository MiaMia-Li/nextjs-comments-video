"use client";

import {
  Composer,
  ComposerSubmitComment,
} from "@liveblocks/react-ui/primitives";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { useCreateThread, useSelf } from "@liveblocks/react/suspense";
import { formatTime } from "@/components/Duration";
import { Mention } from "@/components/Mention";
import { MentionSuggestions } from "@/components/MentionSuggestions";
import { Link } from "@/components/Link";
import { TimeIcon } from "@/icons/Time";
import { useParams } from "next/navigation";

type Props = {
  getCurrentPercentage?: () => number;
  setPlaying?: (vale: boolean) => void;
  time?: number;
  resourceId: string;
  resourceType: string;
};

export function NewThreadComposer({
  getCurrentPercentage = () => -1,
  setPlaying,
  time = -1,
  resourceId,
  resourceType,
}: Props) {
  const currentUser = useSelf();
  const createThread = useCreateThread();
  const [attachTime, setAttachTime] = useState(true);

  // Submit thread with current time
  const handleSubmit = useCallback(
    ({ body }: ComposerSubmitComment, event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      createThread({
        body,
        metadata: {
          resourceType,
          resourceId,
          time: attachTime ? time : -1,
          timePercentage: attachTime ? getCurrentPercentage() : -1,
        },
      });
    },
    [attachTime, getCurrentPercentage, time]
  );

  // Pause video on focus
  const handleFocus = useCallback(() => {
    setPlaying && setPlaying(false);
  }, []);

  // Stop keyboard events firing on window when typing (i.e. prevent fullscreen with `f`)
  const handleKeyDown = useCallback((event: FormEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }, []);

  const handleCheckboxChecked = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setAttachTime(event.target.checked);
    },
    []
  );

  return (
    <Composer.Form
      onComposerSubmit={handleSubmit}
      className="
        w-full 
        my-8 
        mx-auto 
        max-w-[680px] 
        bg-gray-2 
        p-4 
        border 
        border-gray-4 
        rounded-base
      "
    >
      <div className="flex gap-4 items-start">
        {currentUser && (
          <img
            className="flex-shrink-0 rounded-full"
            width={24}
            height={24}
            src={currentUser.info.avatar}
            alt={currentUser.info.name}
          />
        )}
        <Composer.Editor
          className="
            w-full 
            pt-1 
            outline-none 
           [&_[data-placeholder]]:text-gray-9
    text-gray-12
          "
          placeholder="Add comment…"
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          components={{
            Mention: (props) => (
              <Composer.Mention asChild>
                <Mention {...props} />
              </Composer.Mention>
            ),
            MentionSuggestions,
            Link: (props) => (
              <Composer.Link asChild>
                <Link {...props}>{props.children}</Link>
              </Composer.Link>
            ),
          }}
        />
      </div>
      <div
        className="
        mt-5 
        flex 
        justify-between 
        items-center 
        gap-3
      "
      >
        {resourceType !== "image" && (
          <label
            htmlFor="attach-time"
            className="
            
            h-7 
            bg-accent-background 
            text-accent 
            inline-flex 
            gap-1 
            px-1.5 
            items-center 
            text-base
            rounded-[4px] 
            font-tabular-nums 
            transition-colors 
            duration-150 
            ease-out 
            cursor-pointer 
            select-none 
            hover:bg-accent-background-hover
          "
          >
            <span className="inline-flex gap-1.5 items-center">
              <TimeIcon />
              {formatTime(time)}
            </span>

            <input
              id="attach-time"
              className="
              accent-accent 
              cursor-pointer
            "
              type="checkbox"
              checked={attachTime}
              onChange={handleCheckboxChecked}
            />
          </label>
        )}
        <Composer.Submit
          className="
    bg-accent 
    text-accent-contrast 
    px-3 
    py-2 
    rounded-lg 
    hover:bg-accent-hover
    whitespace-nowrap
    text-[13px]
    font-medium
    font-sans
    cursor-pointer
    transition-all
    duration-150
    ease-out
    focus:outline-none
    focus:ring-2
    focus:ring-accent/50
    disabled:bg-gray-3
    disabled:text-gray-8
    disabled:cursor-not-allowed
  "
        >
          Comment
        </Composer.Submit>
      </div>
    </Composer.Form>
  );
}
