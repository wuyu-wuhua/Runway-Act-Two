"use client";

import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoSrc: string;
  posterSrc?: string;
  fallbackSrc?: string;
  className?: string;
}

export default function VideoBackground({
  videoSrc,
  posterSrc,
  fallbackSrc,
  className = "w-full h-full object-cover"
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleError = () => {
      // 如果视频加载失败，隐藏视频元素
      console.log('Video failed to load:', videoSrc);
      video.style.display = 'none';
    };

    const handleLoadStart = () => {
      // 视频开始加载时显示
      console.log('Video started loading:', videoSrc);
      video.style.display = 'block';
    };

    const handleCanPlay = () => {
      // 视频可以播放时显示
      console.log('Video can play:', videoSrc);
      video.style.display = 'block';
    };

    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoSrc]);

  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      className={className}
      poster={posterSrc}
      style={{ display: 'block' }}
    >
      <source src={videoSrc} type="video/mp4" />
      {fallbackSrc && <source src={fallbackSrc} type="video/webm" />}
      您的浏览器不支持视频播放。
    </video>
  );
} 