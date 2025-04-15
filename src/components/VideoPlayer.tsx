"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { OnProgressProps } from "react-player/base";
import * as Slider from "@radix-ui/react-slider";
import { PlayIcon } from "@/icons/Play";
import { PauseIcon } from "@/icons/Pause";
import { FullscreenIcon } from "@/icons/Fullscreen";
import Duration from "@/components/Duration";
import { ClientSideSuspense } from "@liveblocks/react";
import { ThreadsTimeline } from "@/components/ThreadsTimeline";
import { NewThreadComposer } from "@/components/NewThreadComposer";
import { ExitFullscreenIcon } from "@/icons/ExitFullscreen";
import { useUpdateMyPresence } from "@liveblocks/react/suspense";
import { useKeyDownListener, useSkipToListener } from "@/utils";

// 速度选项
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.5, 1.75, 2];
// 质量选项
const QUALITY_OPTIONS = ["Auto", "180p", "540p", "720p", "1080p"];

export function VideoPlayer({
  onStateChange,
}: {
  onStateChange: (p: any) => void;
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

  // 更新多人协作状态
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

  // 使用 useEffect 将状态变化通知给父组件
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

  // 播放时更新进度
  const handleProgress = useCallback(
    (progress: OnProgressProps) => {
      if (!seeking) {
        setTime(progress.played);
      }
    },
    [seeking]
  );

  // 视频结束时停止播放
  const handleEnded = useCallback(() => {
    if (!loop) {
      setPlaying(false);
    }
  }, [loop]);

  // 切换全屏
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

  // 拖动进度条时更新UI时间
  const handleSliderChange = useCallback(([value]: [number]) => {
    setSeeking(true);
    setTime(value);
  }, []);

  // 拖动结束时更新视频时间
  const handleSliderCommit = useCallback(([value]: [number]) => {
    setTime(value);
    if (player.current) {
      player.current.seekTo(value);
    }
    setSeeking(false);
  }, []);

  // 处理音量变化
  const handleVolumeChange = useCallback(([value]: [number]) => {
    setVolume(value);
    setMuted(value === 0);
  }, []);

  // 切换静音
  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted]);

  // 切换循环播放
  const toggleLoop = useCallback(() => {
    setLoop(!loop);
  }, [loop]);

  // 更改播放速度
  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  // 更改视频质量
  const handleQualityChange = useCallback((quality: string) => {
    setQuality(quality);
    setShowQualityMenu(false);
  }, []);

  // 监听跳转事件
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

  // 监听键盘事件
  useKeyDownListener((event) => {
    if (event.code === "Space") {
      setPlaying(!playing);
      return;
    }

    if (event.code === "KeyF") {
      handleFullscreen();
      return;
    }

    // 音量控制快捷键
    if (event.code === "ArrowUp") {
      setVolume(Math.min(1, volume + 0.1));
      return;
    }

    if (event.code === "ArrowDown") {
      setVolume(Math.max(0, volume - 0.1));
      return;
    }

    // 静音快捷键
    if (event.code === "KeyM") {
      toggleMute();
      return;
    }

    // 循环播放快捷键
    if (event.code === "KeyL") {
      toggleLoop();
      return;
    }
  });

  // 点击外部关闭下拉菜单
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

  // 第二部分代码将在下一个回复中展示
  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      <div className="relative w-full">
        {/* 内容区 */}
        <div
          ref={playerClickWrapper}
          className="relative w-full pt-[80vh] bg-black" // 16:9 aspect ratio
        >
          <ClientSideSuspense fallback={null}>
            <ReactPlayer
              ref={player}
              width="100%"
              height="100%"
              url="https://cdn-staging.tryatria.com/adfiles/igDHgKAD7NB2a_BqAKl5Ve2KE.mp4"
              playing={playing}
              playbackRate={playbackSpeed}
              volume={volume}
              muted={muted}
              loop={loop}
              onProgress={handleProgress}
              onEnded={handleEnded}
              onDuration={setDuration}
              className="absolute top-0 left-0"
              onClick={() => setPlaying(!playing)}
              onDoubleClick={handleFullscreen}
            />
          </ClientSideSuspense>

          {/* Timeline */}
          <div className="absolute bottom-0 left-0 right-0 px-4 flex flex-col bg-transparent">
            <div className="relative h-[20px] w-full">
              <ThreadsTimeline />
            </div>
            <div className="w-full h-1 bg-gray-800/50">
              <Slider.Root
                className="relative flex items-center h-full w-full"
                value={[time]}
                onValueChange={handleSliderChange}
                onValueCommit={handleSliderCommit}
                max={1}
                step={0.0001}
              >
                <Slider.Track className="bg-white/30 relative grow rounded-full h-full">
                  <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-lg" />
              </Slider.Root>
            </div>
          </div>
        </div>

        {/* 进度条 */}

        {/* 视频设置区 */}
        <div className="flex justify-between items-center px-4 py-2 bg-black/70 text-white">
          {/* 左侧控制区 */}
          <div className="flex items-center gap-3">
            <button
              className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1 rounded-full transition-colors hover:bg-white/20 min-w-6 min-h-6"
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            <div className="flex items-center gap-3 ml-3">
              {/* 音量控制 */}
              <div className="relative h-6 group">
                <button
                  className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1 rounded-full transition-colors hover:bg-white/20 min-w-6 min-h-6"
                  onClick={toggleMute}
                >
                  {muted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {/* 静音图标 */}
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {/* 音量图标 */}
                    </svg>
                  )}
                </button>

                {/* 音量滑块 */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 h-24 bg-black/80 rounded p-2 hidden group-hover:flex justify-center z-20">
                  <Slider.Root
                    className="relative flex items-center h-20 w-1.5"
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    step={0.1}
                    orientation="vertical"
                  >
                    <Slider.Track className="bg-white/30 relative grow rounded-full h-full">
                      <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-lg" />
                  </Slider.Root>
                </div>
              </div>

              {/* 水平音量滑块 */}
              <div className="w-16 h-6 flex items-center">
                <Slider.Root
                  className="relative flex items-center h-1.5 w-full"
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={1}
                  step={0.1}
                >
                  <Slider.Track className="bg-white/30 relative grow rounded-full h-full">
                    <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-lg" />
                </Slider.Root>
              </div>
            </div>

            {/* 时间显示 */}
            <div className="flex items-center gap-1.5 text-sm">
              <Duration seconds={duration * time} />
              <span>/</span>
              <Duration seconds={duration} />
            </div>
          </div>

          {/* 右侧控制区 */}
          <div className="flex items-center gap-3">
            {/* 播放速度控制 */}
            <div className="relative h-6 speed-control">
              <button
                className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1 rounded-full transition-colors hover:bg-white/20 min-w-6 min-h-6"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-8 left-0 bg-black/80 rounded p-1 z-50">
                  {SPEED_OPTIONS.map((speed) => (
                    <button
                      key={speed}
                      className={`
                    block 
                    w-full 
                    px-2 
                    py-1 
                    text-sm 
                    text-left 
                    rounded 
                    hover:bg-white/20 
                    ${speed === playbackSpeed ? "text-blue-500" : "text-white"}
                  `}
                      onClick={() => handleSpeedChange(speed)}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 视频质量控制 */}
            <div className="relative h-6 quality-control">
              <button
                className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1 rounded-full transition-colors hover:bg-white/20 min-w-6 min-h-6"
                onClick={() => setShowQualityMenu(!showQualityMenu)}
              >
                {quality}
              </button>
              {showQualityMenu && (
                <div className="absolute bottom-8 left-0 bg-black/80 rounded p-1 z-50">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q}
                      className={`
                    block 
                    w-full 
                    px-2 
                    py-1 
                    text-sm 
                    text-left 
                    rounded 
                    hover:bg-white/20 
                    ${q === quality ? "text-blue-500" : "text-white"}
                  `}
                      onClick={() => handleQualityChange(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 循环播放 */}
            <button
              className={`
            bg-transparent 
            border-none 
            cursor-pointer 
            flex 
            items-center 
            justify-center 
            p-1 
            rounded-full 
            transition-colors 
            hover:bg-white/20 
            min-w-6 
            min-h-6 
            ${loop ? "text-blue-500" : "text-white"}
          `}
              onClick={toggleLoop}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* 全屏切换 */}
            <button
              className="bg-transparent border-none text-white cursor-pointer flex items-center justify-center p-1 rounded-full transition-colors hover:bg-white/20 min-w-6 min-h-6"
              onClick={handleFullscreen}
            >
              {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
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
