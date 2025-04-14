"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { OnProgressProps } from "react-player/base";
import * as Slider from "@radix-ui/react-slider";
import styles from "./VideoPlayer.module.css";
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

export function VideoPlayer() {
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

  // 获取视频尺寸

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

  // 获取当前视频进度百分比
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
        const speedControl = document.querySelector(`.${styles.speedControl}`);
        const qualityControl = document.querySelector(
          `.${styles.qualityControl}`
        );

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
    <div className={styles.videoPlayer}>
      <div className={styles.playerWrapper} ref={playerWrapper}>
        {/* Video player */}
        <div
          ref={playerClickWrapper}
          className={styles.playerClickWrapper}
          onClick={() => setPlaying(!playing)}
          onDoubleClick={handleFullscreen}
        >
          <ClientSideSuspense fallback={null}>
            <ReactPlayer
              ref={player}
              width="100%"
              height="90vh"
              playing={playing}
              playbackRate={playbackSpeed}
              volume={volume}
              muted={muted}
              loop={loop}
              onDuration={setDuration}
              onProgress={handleProgress}
              onEnded={handleEnded}
              url="https://cdn-staging.tryatria.com/adfiles/igDHgKAD7NB2a_BqAKl5Ve2KE.mp4"
              className={styles.reactPlayer}
              config={{
                file: {
                  attributes: {
                    controlsList: "nodownload",
                  },
                  quality: quality !== "Auto" ? quality : undefined,
                },
              }}
            />
          </ClientSideSuspense>
        </div>

        <div className={styles.sliderAndComments}>
          {/* 视频时间轴上的评论 */}
          <div className={styles.sliderComments}>
            <ThreadsTimeline />
          </div>

          {/* 视频进度条 */}
          <Slider.Root
            className={styles.sliderRoot}
            min={0}
            max={0.999999}
            step={0.001}
            value={[time]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
          >
            <Slider.Track className={styles.sliderTrack}>
              <Slider.Range className={styles.sliderRange} />
            </Slider.Track>
            <Slider.Thumb className={styles.sliderThumb} />
          </Slider.Root>
        </div>

        {/* 视频控制栏 - 直接显示在进度条下方 */}
        <div className={styles.controls}>
          <div className={styles.leftControls}>
            {/* 播放/暂停按钮 */}
            <button
              className={styles.playButton}
              onClick={() => setPlaying(!playing)}
              title={playing ? "暂停" : "播放"}
            >
              {playing ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* 控制元素组 - 放在播放按钮右侧 */}
            <div className={styles.controlsGroup}>
              {/* 循环播放按钮 */}
              <button
                className={`${styles.loopButton} ${loop ? styles.loopActive : ""}`}
                onClick={toggleLoop}
                title="循环播放"
              >
                ↻
              </button>

              {/* 播放速度控制 */}
              <div className={styles.speedControl}>
                <button
                  className={styles.speedSelect}
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  title="播放速度"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className={styles.dropdownMenu}>
                    {SPEED_OPTIONS.map((speed) => (
                      <div
                        key={speed}
                        className={`${styles.dropdownItem} ${playbackSpeed === speed ? styles.dropdownItemActive : ""}`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 音量控制 */}
              <div className={styles.volumeControl}>
                <button
                  className={styles.volumeButton}
                  onClick={toggleMute}
                  title={muted ? "取消静音" : "静音"}
                >
                  {muted ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12Z"
                        fill="currentColor"
                      />
                      <path
                        d="M19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12Z"
                        fill="currentColor"
                      />
                      <path
                        d="M4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 18.04 14.83 18.45 14 18.7V20.76C15.38 20.45 16.63 19.81 17.69 18.95L19.73 21L21 19.73L12 10.73L4.27 3ZM12 4L9.91 6.09L12 8.18V4Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : volume > 0.5 ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 9V15H7L12 20V4L7 9H3ZM16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.85 14 18.71V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : volume > 0 ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 9V15H7L12 20V4L7 9H3ZM14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12C16.5 10.23 15.48 8.71 14 7.97Z"
                        fill="currentColor"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 9V15H11L16 20V4L11 9H7Z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                </button>

                <Slider.Root
                  className={styles.horizontalVolumeSlider}
                  min={0}
                  max={1}
                  step={0.01}
                  value={[muted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                >
                  <Slider.Track className={styles.horizontalVolumeSliderTrack}>
                    <Slider.Range className={styles.volumeSliderRange} />
                  </Slider.Track>
                  <Slider.Thumb className={styles.volumeSliderThumb} />
                </Slider.Root>
              </div>

              {/* 视频质量控制 */}
              <div className={styles.qualityControl}>
                <button
                  className={styles.qualitySelect}
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  title="视频质量"
                >
                  {quality}
                </button>

                {showQualityMenu && (
                  <div className={styles.dropdownMenu}>
                    {QUALITY_OPTIONS.map((q) => (
                      <div
                        key={q}
                        className={`${styles.dropdownItem} ${quality === q ? styles.dropdownItemActive : ""}`}
                        onClick={() => handleQualityChange(q)}
                      >
                        {q}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 时间显示 */}
            {player.current ? (
              <div className={styles.time}>
                <Duration seconds={duration * time} /> /{" "}
                <Duration seconds={duration} />
              </div>
            ) : null}
          </div>

          <div className={styles.rightControls}>
            {/* 全屏按钮 */}
            <button
              className={styles.fullscreenButton}
              onClick={handleFullscreen}
              title={fullscreen ? "退出全屏" : "全屏"}
            >
              {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* 添加评论组件 */}
      <ClientSideSuspense fallback={null}>
        <NewThreadComposer
          getCurrentPercentage={getCurrentPercentage}
          setPlaying={setPlaying}
          time={duration * time}
        />
      </ClientSideSuspense>
    </div>
  );
}

function requestFullscreen(element: HTMLElement | null) {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const rfs =
    element.requestFullscreen ||
    (element as any).webkitRequestFullScreen ||
    (element as any).mozRequestFullScreen ||
    (element as any).msRequestFullscreen;
  rfs.call(element);

  return true;
}

function exitFullscreen() {
  if (document.fullscreenElement === null) {
    return;
  }

  document.exitFullscreen();
}
