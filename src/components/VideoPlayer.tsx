"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { OnProgressProps } from "react-player/base";
import * as reactSlider from "@radix-ui/react-slider";

import { ClientSideSuspense } from "@liveblocks/react";
import { ThreadsTimeline } from "@/components/ThreadsTimeline";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { useKeyDownListener, useSkipToListener } from "@/utils";
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SoundOutlined,
  AudioMutedOutlined,
  RetweetOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  PlayCircleFilled,
  PauseCircleFilled,
  PauseOutlined,
  SettingOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { Slider, Button, Dropdown, Menu } from "antd";
import Duration from "./Duration";

// 速度选项
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.5, 1.75, 2];
// 质量选项
const QUALITY_OPTIONS = ["Auto", "180p", "540p", "720p", "1080p"];

export function VideoPlayer({
  onStateChange,
  src,
  resourceId,
}: {
  onStateChange: (p: any) => void;
  src: string;
  resourceId: string;
}) {
  const player = useRef<ReactPlayer>(null);
  const playerWrapper = useRef(null);
  const playerClickWrapper = useRef<HTMLDivElement>(null);

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // 新增状态
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8); // 默认音量: 80%
  const [muted, setMuted] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [loop, setLoop] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    if (seeking) {
      updateMyPresence({ state: "seeking" });
      return;
    }

    updateMyPresence({ state: playing ? "playing" : "paused" });
  }, [playing, seeking, updateMyPresence]);

  const getCurrentPercentage = useCallback(() => {
    const time = player?.current?.getCurrentTime();

    if (time === 0) {
      return 0;
    }

    if (!time || !player.current) {
      return -1;
    }

    return (time / duration) * 100;
  }, [duration]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        getCurrentPercentage,
        setPlaying,
        time: duration * time,
        duration,
      });
    }
  }, [getCurrentPercentage, setPlaying, time, duration, onStateChange]);

  const handleProgress = useCallback(
    (progress: OnProgressProps) => {
      if (!seeking) {
        setTime(progress.played);
      }
    },
    [seeking]
  );

  const handleEnded = useCallback(() => {
    if (!loop) {
      setPlaying(false);
    }
  }, [loop]);

  const handleFullscreen = useCallback(() => {
    if (!playerWrapper.current) {
      return;
    }

    if (fullscreen) {
      exitFullscreen();
      setFullscreen(false);
      return;
    }

    setFullscreen(requestFullscreen(playerWrapper.current));
  }, [fullscreen]);

  const handleSliderChange = useCallback(([value]: [number]) => {
    setSeeking(true);
    setTime(value);
  }, []);

  const handleSliderCommit = useCallback(([value]: [number]) => {
    setTime(value);
    if (player.current) {
      player.current.seekTo(value);
    }
    setSeeking(false);
  }, []);

  useSkipToListener((timePercentage) => {
    if (!player.current) {
      return;
    }

    const newTime = timePercentage / 100;
    setSeeking(false);
    setPlaying(false);
    setTime(newTime);
    player.current.seekTo(newTime);
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSpeedMenu || showQualityMenu) {
        const target = event.target as Node;
        const speedControl = document.querySelector(".speed-control");
        const qualityControl = document.querySelector(".quality-control");

        if (speedControl && !speedControl.contains(target)) {
          setShowSpeedMenu(false);
        }

        if (qualityControl && !qualityControl.contains(target)) {
          setShowQualityMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSpeedMenu, showQualityMenu]);

  return (
    <div className="flex-1 min-h-0 size-full pt-6 px-6 flex items-center justify-center">
      <div
        className="relative size-full flex items-center justify-center"
        ref={playerWrapper}
      >
        <div className="size-full">
          <div
            ref={playerClickWrapper}
            className="flex h-full w-full flex-col items-start justify-start pb-[92px]"
          >
            <div className="m-auto flex size-full select-none items-center justify-center overflow-hidden relative group">
              <ClientSideSuspense fallback={null}>
                <ReactPlayer
                  ref={player}
                  width="100%"
                  height="100%"
                  url={src}
                  playing={playing}
                  playbackRate={playbackSpeed}
                  volume={volume}
                  muted={muted}
                  loop={loop}
                  onProgress={handleProgress}
                  onEnded={handleEnded}
                  onDuration={setDuration}
                  onClick={() => setPlaying(!playing)}
                  onDoubleClick={handleFullscreen}
                />
              </ClientSideSuspense>

              {/* 播放按钮 */}
              {!playing && (
                <div className="absolute inset-0 flex items-center justify-center z-10 opacity-100 duration-300">
                  <button
                    onClick={() => setPlaying(true)}
                    className="flex items-center justify-center bg-white/30 backdrop-blur-sm rounded-full w-16 h-16 hover:bg-white/50 transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="text-5xl"
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="absolute bottom-0 left-0 flex w-full flex-col items-center justify-center">
              <div className="relative h-[20px] w-full">
                <ThreadsTimeline resourceId={resourceId} />
              </div>
              <Slider
                className="custom-slider w-full"
                style={{ margin: 0 }}
                value={time}
                max={1}
                step={0.0001}
                onChange={(val) => {
                  handleSliderChange([val]);
                }}
                onChangeComplete={(val) => {
                  handleSliderCommit([val]);
                }}
                tooltip={{ open: false }}
              />
              <div className="flex justify-between items-center py-2 text-white w-full">
                {/* 左侧控制区 */}
                <div className="flex-1 text-left flex items-center space-x-4">
                  {/* 播放/暂停 */}
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="rounded-md w-12 h-12 transition-all duration-300 flex items-center justify-center  hover:bg-white/10"
                  >
                    {!playing ? (
                      <PlayCircleOutlined className="text-2xl" />
                    ) : (
                      <PauseOutlined className="text-2xl" />
                    )}
                  </button>

                  {/* 循环播放 */}

                  <button
                    onClick={() => setLoop(!loop)}
                    className="rounded-md w-12 h-12 transition-all duration-300 flex items-center justify-center  hover:bg-white/10"
                  >
                    <RetweetOutlined
                      className={`${!loop ? "" : "text-accent"} text-2xl`}
                    />
                  </button>
                  {/* 播放速度 */}
                  <Dropdown
                    menu={{
                      items: [
                        {
                          extra: <h3>SPEED</h3>,
                          key: "title",
                          // label: `SPEED`,
                          // type: "extra",
                          // onClick: () =>,
                        },
                        ...SPEED_OPTIONS.map((speed) => ({
                          key: speed,
                          label: `${speed}x`,
                          onClick: () => setPlaybackSpeed(speed),
                        })),
                      ],
                      selectedKeys: [playbackSpeed.toString()],
                      theme: "dark",
                    }}
                    placement="topLeft"
                    trigger={["click"]}
                  >
                    <button className="text-xl rounded-md w-12 h-12 transition-all duration-300 flex items-center justify-center  hover:bg-white/10">
                      {playbackSpeed}x
                    </button>
                  </Dropdown>
                </div>

                {/* 时间显示 */}

                {player.current ? (
                  <div className="flex-1 flex justify-center text-lg">
                    <Duration seconds={duration * time} /> /{" "}
                    <Duration seconds={duration} />
                  </div>
                ) : null}

                {/* 右侧控制区 */}
                <div className="flex-1 flex items-center justify-end space-x-4">
                  {/* 音量控制 */}
                  <Dropdown
                    dropdownRender={() => (
                      <div
                        className="bg-white/10 p-4 rounded-lg shadow-lg"
                        style={{
                          height: 150,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Slider
                          vertical
                          value={volume * 100} // 显示时乘以 100
                          onChange={(value) => setVolume(value / 100)} // 设置时除以 100
                          min={0}
                          max={100}
                          style={{ height: 120 }}
                        />
                      </div>
                    )}
                  >
                    <button
                      onClick={() => setMuted(!muted)}
                      className="rounded-md w-12 h-12 transition-all duration-300 flex items-center justify-center  hover:bg-white/10"
                    >
                      {muted ? (
                        <AudioMutedOutlined className="text-2xl" />
                      ) : (
                        <SoundOutlined className="text-2xl" />
                      )}
                    </button>
                  </Dropdown>

                  {/* 视频质量 */}
                  <Dropdown
                    menu={{
                      items: [
                        {
                          extra: <h3>QUALITY</h3>,
                          key: "title",
                        },
                        ...QUALITY_OPTIONS.map((quality) => ({
                          key: quality,
                          label: `${quality}`,
                          onClick: () => setQuality(quality),
                        })),
                      ],
                      selectedKeys: [quality.toString()],
                      theme: "dark",
                    }}
                    placement="topRight"
                  >
                    <button className="rounded-md w-12 h-12 transition-all duration-300 flex items-center justify-center  hover:bg-white/10">
                      <SettingOutlined className="text-2xl" />
                    </button>
                  </Dropdown>

                  {/* 全屏切换 */}
                  <button
                    onClick={handleFullscreen}
                    className="rounded-md w-12 h-12 transition-all duration-300 flex items-center justify-center  hover:bg-white/10"
                  >
                    {fullscreen ? (
                      <FullscreenExitOutlined className="text-2xl" />
                    ) : (
                      <FullscreenOutlined className="text-2xl" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function requestFullscreen(element: HTMLElement | null) {
  if (!element) {
    return false;
  }

  if (element.requestFullscreen) {
    element.requestFullscreen();
    return true;
  }

  // @ts-ignore
  if (element.webkitRequestFullscreen) {
    // @ts-ignore
    element.webkitRequestFullscreen();
    return true;
  }

  // @ts-ignore
  if (element.msRequestFullscreen) {
    // @ts-ignore
    element.msRequestFullscreen();
    return true;
  }

  return false;
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  // @ts-ignore
  else if (document.webkitExitFullscreen) {
    // @ts-ignore
    document.webkitExitFullscreen();
  }
  // @ts-ignore
  else if (document.msExitFullscreen) {
    // @ts-ignore
    document.msExitFullscreen();
  }
}

export default VideoPlayer;
