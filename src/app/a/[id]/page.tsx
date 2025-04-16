"use client";
import { Room } from "@/app/Room";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Threads } from "@/components/Threads";
import { Presence } from "@/components/Presence";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { NewThreadComposer } from "@/components/NewThreadComposer";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import {
  ChatBubbleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileIcon,
  InfoCircledIcon,
  LayoutIcon,
} from "@radix-ui/react-icons";
import {
  ArrowRightOutlined,
  MenuUnfoldOutlined,
  VerticalLeftOutlined,
} from "@ant-design/icons";
import { Dropdown, Tooltip } from "antd";

type ResourceType = "video" | "audio" | "image";
type Resource = {
  id: string;
  url: string;
  type: ResourceType;
  name: string;
};

export default function Home() {
  const data: Resource[] = [
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
    {
      id: "4",
      url: "https://cdn-staging.tryatria.com/adfiles/m251372610916846_KLmeVsQV7so.mp4",
      type: "video",
      name: "Video 2",
    },
    {
      id: "5",
      type: "video",
      url: "https://cdn-staging.tryatria.com/adfiles/m514351247319683_sAdJ_jDCc1k.mp4",
      name: "Video 3",
    },
  ];

  const params = useParams();
  const id = params.id;
  const router = useRouter();

  // Initialize currentResource with a useEffect to avoid re-renders
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [videoState, setVideoState] = useState<any>(null);
  const [currentSidebarTab, setCurrentSidebarTab] = useState<string | null>(
    null
  );

  useEffect(() => {
    const resourceIndex = data.findIndex((item) => item.id === id);
    if (resourceIndex !== -1) {
      setCurrentResource(data[resourceIndex]);
    }
    console.log("----id", id, data[resourceIndex]);
  }, [id]);

  const handleVideoStateChange = (newState: any) => {
    setVideoState(newState);
  };

  const navigateResource = (direction: "prev" | "next") => {
    if (!currentResource) return;

    const currentIndex = data.findIndex(
      (item) => item.id === currentResource.id
    );
    if (currentIndex === -1) return;

    const newIndex =
      direction === "prev"
        ? (currentIndex - 1 + data.length) % data.length
        : (currentIndex + 1) % data.length;
    setCurrentResource(data[newIndex]);

    // router.push(`/a/${data[newIndex].id}`);
    // router.replace(`/a/${data[newIndex].id}`);
    window.history.pushState(null, "", `/a/${data[newIndex].id}`);
  };

  if (!currentResource) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading resource...
      </div>
    );
  }

  const sidebarNavItems = [
    {
      id: "comments",
      icon: <ChatBubbleIcon className="w-6 h-6" />,
      name: "Comments",
      component: (
        <div>
          <Threads resourceId={currentResource.id} />
          <ClientSideSuspense fallback={<Loading />}>
            <NewThreadComposer
              resourceType={currentResource.type}
              resourceId={currentResource.id}
              getCurrentPercentage={videoState?.getCurrentPercentage}
              setPlaying={videoState?.setPlaying}
              time={videoState?.time}
            />
          </ClientSideSuspense>
        </div>
      ),
    },
    {
      id: "board",
      icon: <LayoutIcon className="w-6 h-6" />,
      name: "Board",
      component: <div>Board Content</div>,
    },
    {
      id: "files",
      icon: <FileIcon className="w-6 h-6" />,
      name: "Files",
      component: <div>Files Content</div>,
    },
    {
      id: "info",
      icon: <InfoCircledIcon className="w-6 h-6" />,
      name: "Info",
      component: <div>Info Content</div>,
    },
  ];

  return (
    <Room>
      <div className="h-screen w-full flex">
        {/* Main Content Area */}
        <div className="flex-1 h-full flex flex-col">
          {/* Header */}
          <header className="flex-none flex justify-between items-center px-4 py-3 h-[60px] bg-gray-2 border-b border-gray-4">
            <h1 className="text-base font-medium">{currentResource.name}</h1>
            <Presence />
          </header>

          {/* Content and Navigation */}
          <main className="flex max-h-[calc(100%-60px)] min-h-0 w-full flex-1 items-start justify-start">
            {/* Media Display Area */}
            <div className="flex h-full w-full max-h-full flex-1 flex-col items-start justify-start">
              {/* Render media content */}
              <div className="group/visualizer relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden p-6 pb-3 pl-6 pr-6 pt-6">
                {(() => {
                  switch (currentResource.type) {
                    case "image":
                      return (
                        <img
                          src={currentResource.url}
                          alt={currentResource.name}
                          className="object-contain max-w-full max-h-full"
                        />
                      );
                    case "video":
                    case "audio":
                      return (
                        <VideoPlayer
                          src={currentResource.url}
                          onStateChange={handleVideoStateChange}
                        />
                      );
                    default:
                      return null;
                  }
                })()}
              </div>

              {/* Navigation Buttons */}
              <div className="relative flex w-full flex-shrink-0 flex-col items-center justify-center overflow-hidden h-16 border-t border-gray-4">
                <button
                  onClick={() => navigateResource("prev")}
                  className="w-12 h-12 hover:bg-white/10 transition-colors group relative rounded-md flex items-center justify-center"
                >
                  <ArrowRightOutlined className="h-6 rotate-180" />
                </button>
              </div>
            </div>

            {/* Sidebar Navigation - Now with content to the left */}
            <div className="flex h-full">
              {/* Expanded Sidebar Content - Appears to the left of navigation */}
              {currentSidebarTab && (
                <div className="w-80 bg-gray-2 border-l border-gray-4 overflow-y-auto">
                  <div className="flex justify-between items-center p-4 border-b border-gray-4">
                    <h2 className="text-lg font-semibold">
                      {
                        sidebarNavItems.find(
                          (item) => item.id === currentSidebarTab
                        )?.name
                      }
                    </h2>
                    <button
                      onClick={() => setCurrentSidebarTab(null)}
                      className="hover:bg-white/10 p-2 rounded"
                    >
                      <MenuUnfoldOutlined />
                    </button>
                  </div>
                  <div className="py-4">
                    {
                      sidebarNavItems.find(
                        (item) => item.id === currentSidebarTab
                      )?.component
                    }
                  </div>
                </div>
              )}

              {/* Vertical Navigation Icons - Always on the right */}
              <div className="bg-gray-2 border-l border-gray-4 p-2 flex flex-col justify-between">
                <div className="flex flex-col gap-4">
                  {sidebarNavItems.map((item) => (
                    <Tooltip title={item.name} placement="left">
                      <button
                        key={item.id}
                        onClick={() =>
                          setCurrentSidebarTab(
                            currentSidebarTab === item.id ? null : item.id
                          )
                        }
                        className={`
                    w-12 h-12 hover:bg-white/10 transition-colors group relative rounded-md flex items-center justify-center
                    ${currentSidebarTab === item.id ? "bg-white/10" : ""}
                  `}
                      >
                        {item.icon}
                      </button>
                    </Tooltip>
                  ))}
                </div>
                <button
                  onClick={() => navigateResource("next")}
                  className="w-12 h-12 hover:bg-white/10 transition-colors group relative rounded-md flex items-center justify-center"
                >
                  <ArrowRightOutlined className="h-6" />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </Room>
  );
}
