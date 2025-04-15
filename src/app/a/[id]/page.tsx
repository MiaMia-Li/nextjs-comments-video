"use client";
import { Room } from "@/app/Room";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Threads } from "@/components/Threads";
import { Presence } from "@/components/Presence";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { NewThreadComposer } from "@/components/NewThreadComposer";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Loading } from "@/components/Loading";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export default function Home() {
  const data = [
    {
      id: "1",
      url: "https://cdn-staging.tryatria.com/adfiles/igDHgKAD7NB2a_BqAKl5Ve2KE.mp4",
      type: "video",
      name: "Video 1",
    },
    {
      id: "2",
      url: "https://nextjs-comments-audio.liveblocks.app/titanium-170190.mp3",
      type: "audio",
      name: "Audio 1",
    },
    {
      id: "3",
      url: "https://cdn-staging.tryatria.com/adfiles/igDHgKAD7NB2a_X7c176iNl1M.jpeg",
      type: "image",
      name: "Image 1",
    },
  ];

  // url:a/:id
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [currentResourceIndex, setCurrentResourceIndex] = useState(() =>
    data.findIndex((item) => item.id === id)
  );
  const [currentResource, setCurrentResource] = useState(
    data[currentResourceIndex]
  );
  const [videoState, setVideoState] = useState<any>(null);
  const handleVideoStateChange = (newState: any) => {
    setVideoState(newState);
  };

  useEffect(() => {
    console.log("id changed:", id);
    const newIndex = data.findIndex((item) => item.id === id);

    if (newIndex !== -1) {
      setCurrentResourceIndex(newIndex);
      setCurrentResource(data[newIndex]);
    }
  }, [id]);

  const navigateResource = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? (currentResourceIndex - 1 + data.length) % data.length
        : (currentResourceIndex + 1) % data.length;
    console.log("--navigateResource", data[newIndex].id);
    window.location.href = `/a/${data[newIndex].id}`;

    // router.push(`/a/${data[newIndex].id}`, { scroll: false });
  };

  if (!currentResource) {
    return <div>Resource not found</div>;
  }

  const renderContent = () => {
    switch (currentResource.type) {
      case "video":
      case "audio":
        return (
          <Room>
            <div className="h-full w-full flex flex-col">
              <header className="flex-none flex justify-between items-center px-4 py-3 h-[60px] bg-gray-2 text-2xl border-b border-gray-4">
                <h1 className="text-base font-medium">
                  {currentResource.name}
                </h1>
                <Presence />
              </header>

              <main className="flex-1 flex min-h-0 relative">
                <div className="flex-1 overflow-y-auto relative">
                  <VideoPlayer
                    src={currentResource.url}
                    onStateChange={handleVideoStateChange}
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                      onClick={() => navigateResource("prev")}
                      className="bg-gray-3 hover:bg-gray-4 p-2 rounded-full"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateResource("next")}
                      className="bg-gray-3 hover:bg-gray-4 p-2 rounded-full"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-none w-[350px] max-w-full bg-gray-2 border-l border-gray-4 overflow-y-auto">
                  <Threads resourceId={currentResource.id} />
                  <ClientSideSuspense fallback={<Loading />}>
                    <NewThreadComposer
                      getCurrentPercentage={videoState?.getCurrentPercentage}
                      setPlaying={videoState?.setPlaying}
                      time={videoState?.time}
                      resourceType={currentResource.type}
                      resourceId={currentResource.id}
                    />
                  </ClientSideSuspense>
                </div>
              </main>
            </div>
          </Room>
        );
      case "image":
        return (
          <Room>
            <div className="h-full w-full flex flex-col">
              <header className="flex-none flex justify-between items-center px-4 py-3 h-[60px] bg-gray-2 text-2xl border-b border-gray-4">
                <h1 className="text-base font-medium">
                  {currentResource.name}
                </h1>
                <Presence />
              </header>

              <main className="flex-1 flex min-h-0 relative">
                <div className="flex-1 overflow-y-auto flex items-center justify-center relative">
                  <img
                    className="object-contain max-w-full max-h-full"
                    src={currentResource.url}
                    alt={currentResource.name}
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                      onClick={() => navigateResource("prev")}
                      className="bg-gray-3 hover:bg-gray-4 p-2 rounded-full"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateResource("next")}
                      className="bg-gray-3 hover:bg-gray-4 p-2 rounded-full"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-none w-[350px] max-w-full bg-gray-2 border-l border-gray-4 overflow-y-auto">
                  <Threads resourceId={currentResource.id} />
                  <ClientSideSuspense fallback={<Loading />}>
                    <NewThreadComposer
                      resourceType={currentResource.type}
                      resourceId={currentResource.id}
                    />
                  </ClientSideSuspense>
                </div>
              </main>
            </div>
          </Room>
        );
      default:
        return <div>Unsupported resource type</div>;
    }
  };

  return renderContent();
}
