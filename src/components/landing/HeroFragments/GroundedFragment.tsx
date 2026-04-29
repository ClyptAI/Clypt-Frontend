import { motion } from "framer-motion";
import { landingHeroImageSrc } from "../landingMedia";

/**
 * Mini Grounded fragment — modeled after src/pages/RunGrounding.tsx.
 * Per user request: NO sidebar, NO confidence pill. Just a clean 16:9
 * video tile with the speaker bbox, "GROUNDING · SHOT 1" header, and
 * caption + follow label below.
 */
export default function GroundedFragment() {
  // Bumped up — user asked for a slightly larger Grounded card.
  const W = 460;
  const padX = 14;
  const videoW = W - padX * 2;                  // 432
  const videoH = Math.round((videoW * 9) / 16); // ~243
  // header(32) + padTop(14) + video + gap(12) + caption(46) + padBottom(14)
  const H = 32 + 14 + videoH + 12 + 46 + 14;

  return (
    <div
      style={{
        width: W,
        height: H,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        background:
          "linear-gradient(160deg, rgba(20,16,28,0.95) 0%, rgba(10,9,9,0.95) 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 30,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          GROUNDING
        </span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.08em",
          }}
        >
          · shot 2
        </span>
      </div>

      {/* Video region */}
      <div style={{ padding: padX, paddingBottom: 0 }}>
        <div
          style={{
            width: videoW,
            height: videoH,
            borderRadius: 6,
            position: "relative",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "#0a0909",
            backgroundImage: `url(${landingHeroImageSrc.groundedRogan})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Bounding box around speaker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{
              position: "absolute",
              left: "30%",
              top: "16%",
              width: "32%",
              height: "70%",
              border: "1.5px solid #A78BFA",
              borderRadius: 3,
              boxShadow: "0 0 14px rgba(167,139,250,0.4)",
            }}
          >
            {/* Letter label */}
            <div
              style={{
                position: "absolute",
                top: -1,
                left: -1,
                background: "#A78BFA",
                color: "#0A0909",
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "0 0 3px 0",
                lineHeight: "13px",
              }}
            >
              A
            </div>
            {/* Speaker badge */}
            <div
              style={{
                position: "absolute",
                bottom: -1,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(10,9,9,0.85)",
                border: "1px solid #A78BFA",
                borderRadius: 3,
                padding: "1px 6px",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: "#A78BFA",
                whiteSpace: "nowrap",
              }}
            >
              Andrew
            </div>
          </motion.div>

          {/* Time overlay (bottom-left) */}
          <div
            style={{
              position: "absolute",
              left: 6,
              bottom: 6,
              background: "rgba(10,9,9,0.7)",
              borderRadius: 3,
              padding: "1px 6px",
              fontFamily: "'Geist Mono', monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            1:40 - 2:05
          </div>
        </div>
      </div>

      {/* Caption */}
      <div style={{ padding: `10px ${padX}px 12px`, display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontFamily: "'DM Serif Display', serif",
            fontStyle: "italic",
            fontSize: 13,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.3,
          }}
        >
          "No, that's a polar bear. He smells meat."
        </span>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 9,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.06em",
          }}
        >
          FOLLOW · ANDREW
        </span>
      </div>
    </div>
  );
}
