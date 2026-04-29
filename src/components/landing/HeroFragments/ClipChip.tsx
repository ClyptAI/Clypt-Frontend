import { useEffect, useRef, useState } from "react";

/**
 * Small floating "Clip card" placeholder, sized like the originals before the refactor.
 * Two of these get added to the hero cluster around the larger product fragments.
 */

type Props = {
  title: string;
  range: string;
  /** Tinted background gradient stops to simulate a vertical 9:16 thumbnail. */
  bgFrom: string;
  bgTo: string;
  videoSrc?: string;
  posterSrc?: string;
};

export default function ClipChip({ title, range, bgFrom, bgTo, videoSrc, posterSrc }: Props) {
  // 9:16 portrait — bumped up per user request.
  const W = 162;
  const H = Math.round((W * 16) / 9); // ~288
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const resetVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.muted = true;
    try {
      video.currentTime = 0;
    } catch {
      // Ignore reset failures while metadata is still loading.
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isPlaying;

    if (isPlaying && isHovered) {
      void video.play().catch(() => {
        setIsPlaying(false);
      });
      return;
    }

    video.pause();
  }, [isHovered, isPlaying]);

  const handleTogglePlayback = () => {
    if (!videoSrc) return;
    setIsPlaying((current) => !current);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    resetVideo();
  };

  return (
    <div
      role={videoSrc ? "button" : undefined}
      tabIndex={videoSrc ? 0 : undefined}
      aria-label={videoSrc ? `Play clip preview: ${title}` : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleTogglePlayback}
      onKeyDown={(event) => {
        if (!videoSrc) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleTogglePlayback();
        }
      }}
      style={{
        width: W,
        height: H,
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(180deg, ${bgFrom} 0%, ${bgTo} 100%)`,
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 30px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(167,139,250,0.05), inset 0 1px 0 rgba(255,255,255,0.06)",
        cursor: videoSrc ? "pointer" : "default",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {videoSrc ? (
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          playsInline
          preload="metadata"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            pointerEvents: "none",
          }}
        />
      ) : null}

      {posterSrc && !isPlaying ? (
        <img
          src={posterSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            pointerEvents: "none",
          }}
        />
      ) : null}

      {/* top: timestamp pill */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "rgba(10,9,9,0.65)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 4,
          padding: "2px 6px",
          fontFamily: "'Geist Mono', monospace",
          fontSize: 9,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.06em",
          backdropFilter: "blur(6px)",
        }}
      >
        {range}
      </div>
    </div>
  );
}
