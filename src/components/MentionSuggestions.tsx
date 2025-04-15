"use client";

import {
  Composer,
  ComposerEditorMentionSuggestionsProps,
} from "@liveblocks/react-ui/primitives";
import { Avatar } from "./Avatar";
import { Suspense } from "react";
import { User } from "./User";

export function MentionSuggestions({
  userIds,
}: ComposerEditorMentionSuggestionsProps) {
  return (
    <Composer.Suggestions
      className="
        bg-gray-1 
        shadow-custom 
        rounded-base 
        p-[4px]
      "
    >
      <Composer.SuggestionsList>
        {userIds.map((userId) => (
          <MentionSuggestion key={userId} userId={userId} />
        ))}
      </Composer.SuggestionsList>
    </Composer.Suggestions>
  );
}

function MentionSuggestion({ userId }: { userId: string }) {
  return (
    <Composer.SuggestionsListItem
      value={userId}
      className="
        bg-gray-1 
        flex 
        items-center 
        gap-1.5 
        p-[4px] 
        pl-2 
        text-sm 
        rounded-[calc(0.75*0.375em)] 
        cursor-pointer 
        min-h-[calc(20px+8px)] 
        min-w-[120px] 
        hover:bg-gray-3 
        data-[selected]:bg-gray-3
      "
    >
      <Suspense>
        <Avatar
          userId={userId}
          width={20}
          height={20}
          className="rounded-full"
        />
        <User userId={userId} className="text-white" />
      </Suspense>
    </Composer.SuggestionsListItem>
  );
}
