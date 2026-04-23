import { motion } from "framer-motion";

/**
 * Mini Timeline fragment — mirrors the real RunTimeline UI:
 *   1. Header row (TIMELINE · 13:08 + window glyphs)
 *   2. Video preview tile (16:9, with the reference image)
 *   3. Transport row (play btn, 00:00:00:00, scrub bar with playhead dot)
 *   4. Time ruler
 *   5. Lanes: SHOTS / TRACKLETS / JOE / ANDREW / AKAASH / TRANSCRIPT / EMOTION / AUDIO
 *      Speakers show gray ambient waveform across the whole lane plus a
 *      colored "active turn" segment, exactly like real WaveformLane.
 *   6. Vertical playhead overlay across all lanes.
 */

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F"];

/** Mirrors the production WaveformLane.tsx mulberry32 PRNG. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded random-walk peaks — high during [activeStart, activeEnd], low elsewhere. */
function generatePeaks(seed: number, count: number, activeStart: number, activeEnd: number, roughness = 0): Float32Array {
  const rng = mulberry32(seed * 2053 + 137);
  const raw = new Float32Array(count);
  let val = 0.25 + rng() * 0.35;
  for (let i = 0; i < count; i++) {
    const speaking = i >= activeStart && i < activeEnd;
    const stepSize = speaking ? 0.15 + roughness * 0.08 : 0.05;
    val += (rng() - 0.5) * stepSize;
    val = Math.max(0, Math.min(1, val));
    let sample = speaking ? Math.max(0.1, val) : val * 0.18;
    if (speaking && roughness > 0) {
      const modulation =
        1 +
        Math.sin(i * 0.53 + seed) * roughness * 0.22 +
        Math.cos(i * 0.19 + seed * 0.7) * roughness * 0.14 +
        (((i + seed * 5) % 11 === 0 ? 1 : 0) * roughness * 0.32);
      sample = Math.max(0.08, Math.min(1, sample * modulation));
    }
    raw[i] = sample;
  }
  // light smoothing
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const radius = roughness > 0 ? 2 : 3;
    const lo = Math.max(0, i - radius);
    const hi = Math.min(count - 1, i + radius);
    let s = 0;
    for (let j = lo; j <= hi; j++) s += raw[j];
    out[i] = s / (hi - lo + 1);
  }
  return out;
}

export default function TimelineFragment() {
  // Card sized to comfortably contain the video preview + full lane stack.
  const W = 540;
  const labelW = 78;
  const innerW = W - labelW;
  // Dense bar count matches the Phase 1 section preview (`FullWaveform`),
  // ~8 bars per second × ~120s = ~960 bars across the lane width.
  const ambientCount = 480;
  const padX = 12;

  // Video tile — trimmed to ~2.1:1 for a more horizontal letterboxed look.
  const videoW = W - padX * 2;                // 516
  const videoH = Math.round(videoW / 2.1);    // ~246

  const rows = [
    { type: "shots" as const, h: 18 },
    { type: "tracklets" as const, h: 18 },
    { type: "speaker" as const, h: 22, idx: 0, label: "JOE", heightScale: 1, roughness: 0 },
    { type: "speaker" as const, h: 22, idx: 1, label: "ANDREW", heightScale: 1, roughness: 0 },
    { type: "speaker" as const, h: 22, idx: 2, label: "AKAASH", heightScale: 0.78, roughness: 0.65 },
    { type: "transcript" as const, h: 18 },
    { type: "emotion" as const, h: 16 },
    { type: "audio" as const, h: 16 },
  ];
  const lanesH = rows.reduce((s, r) => s + r.h, 0);
  // header(28) + videoArea(padTop10 + video + padBottom6) + transport(26) + ruler(18) + lanes
  const H = 28 + 10 + videoH + 6 + 26 + 18 + lanesH;

  return (
    <div
      style={{
        width: W,
        height: H,
        borderRadius: 14,
        background:
          "linear-gradient(170deg, rgba(20,16,28,0.95) 0%, rgba(10,9,9,0.95) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow:
          "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(167,139,250,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 28,
          padding: "0 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Geist Mono', monospace", fontSize: 10 }}>
          <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, letterSpacing: "0.1em" }}>TIMELINE</span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ color: "rgba(255,255,255,0.55)" }}>Joe Rogan × Flagrant</span>
        </div>
        <div />
      </div>

      {/* Video preview tile */}
      <div style={{ padding: `10px ${padX}px 6px` }}>
        <div
          style={{
            width: videoW,
            height: videoH,
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            backgroundColor: "#0a0909",
            backgroundImage: "url(/images/hero/timeline-rogan.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      {/* Transport row */}
      <div
        style={{
          height: 26,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <span
          style={{
            width: 18, height: 18, borderRadius: 4,
            background: "rgba(167,139,250,0.15)",
            border: "1px solid rgba(167,139,250,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#A78BFA", fontSize: 9,
          }}
        >▶</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>00:00:00:00</span>
        <div style={{ flex: 1, position: "relative", height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 999 }}>
          <div
            style={{
              position: "absolute",
              left: "8%", top: -3,
              width: 8, height: 8,
              borderRadius: "50%",
              background: "#A78BFA",
              boxShadow: "0 0 8px rgba(167,139,250,0.7)",
            }}
          />
        </div>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>13:08</span>
      </div>

      {/* Time ruler */}
      <div
        style={{
          height: 18,
          display: "flex",
          alignItems: "center",
          paddingLeft: labelW,
          paddingRight: 8,
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {["0:00", "0:20", "0:40", "1:00", "1:20", "1:40", "2:00"].map((t, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 8,
              color: "rgba(255,255,255,0.32)",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Lanes */}
      <div style={{ flex: 1, position: "relative" }}>
        {rows.map((row, rIdx) => (
          <div
            key={rIdx}
            style={{
              height: row.h,
              display: "flex",
              alignItems: "center",
              borderBottom: rIdx < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}
          >
            <div
              style={{
                width: labelW,
                paddingLeft: 12,
                flexShrink: 0,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 8,
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)",
                fontWeight: 600,
              }}
            >
              {row.type === "shots" && "SHOTS"}
              {row.type === "tracklets" && "TRACKLETS"}
              {row.type === "speaker" && row.label}
              {row.type === "transcript" && "TRANSCRIPT"}
              {row.type === "emotion" && "EMOTION"}
              {row.type === "audio" && "AUDIO"}
            </div>

            <div style={{ flex: 1, position: "relative", height: "100%", paddingRight: 8 }}>
              {row.type === "shots" && <ShotsLane />}
              {row.type === "tracklets" && <TrackletsLane />}
              {row.type === "speaker" && row.idx !== undefined && (
                <SpeakerLane
                  color={SPEAKER_COLORS[row.idx]}
                  seed={row.idx + 1}
                  innerW={innerW - 8}
                  ambientCount={ambientCount}
                  heightScale={row.heightScale}
                  roughness={row.roughness}
                  activeRange={
                    row.idx === 0 ? [0.30, 0.55] :
                    row.idx === 1 ? [0.42, 0.62] :
                                    [0.60, 0.74]
                  }
                />
              )}
              {row.type === "transcript" && <TranscriptLane />}
              {row.type === "emotion" && <EmotionLane />}
              {row.type === "audio" && <AudioLane />}
            </div>
          </div>
        ))}

        {/* Vertical playhead across all lanes */}
        <motion.div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: labelW + (innerW - 8) * 0.45,
            width: 1,
            background: "#A78BFA",
            opacity: 0.85,
            pointerEvents: "none",
            zIndex: 5,
          }}
          animate={{ x: [-30, 60, -30] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

/* ─── lane components ─── */

function ShotsLane() {
  const shots = [
    { left: 0,    w: 0.22, label: "shot_001" },
    { left: 0.22, w: 0.28, label: "shot_002" },
    { left: 0.50, w: 0.26, label: "shot_003" },
    { left: 0.76, w: 0.24, label: "shot_004" },
  ];
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {shots.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.left * 100}%`,
            width: `calc(${s.w * 100}% - 1px)`,
            top: 2, bottom: 2,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 2,
            paddingLeft: 4,
            display: "flex",
            alignItems: "center",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 7,
            color: "rgba(255,255,255,0.4)",
            overflow: "hidden",
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

function TrackletsLane() {
  const tr = [
    { left: 0,    w: 0.22, label: "A,B,C" },
    { left: 0.22, w: 0.28, label: "A" },
    { left: 0.50, w: 0.26, label: "A,B" },
    { left: 0.76, w: 0.24, label: "A,B,C" },
  ];
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {tr.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.left * 100}%`,
            width: `calc(${s.w * 100}% - 1px)`,
            top: 2, bottom: 2,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 7,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          {s.label}
        </div>
      ))}
    </div>
  );
}

function SpeakerLane({
  color, seed, ambientCount, activeRange, heightScale, roughness,
}: {
  color: string; seed: number; innerW: number; ambientCount: number; activeRange: [number, number]; heightScale: number; roughness: number;
}) {
  const activeStart = Math.floor(activeRange[0] * ambientCount);
  const activeEnd = Math.ceil(activeRange[1] * ambientCount);
  const peaks = generatePeaks(seed, ambientCount, activeStart, activeEnd, roughness);

  return (
    <>
      {/* Bars layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: 0,
        }}
      >
        {Array.from(peaks).map((p, i) => {
          const speaking = i >= activeStart && i < activeEnd;
          const h = Math.max(3, p * (speaking ? 95 : 70) * heightScale);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                minWidth: 0,
                height: `${h}%`,
                background: speaking ? color : "rgba(255,255,255,0.22)",
                opacity: speaking ? 0.95 : 0.4,
              }}
            />
          );
        })}
      </div>
      {/* Translucent turn overlay — matches production WaveformLane.tsx */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${activeRange[0] * 100}%`,
          width: `${(activeRange[1] - activeRange[0]) * 100}%`,
          background: color,
          opacity: 0.22,
          borderRadius: 2,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function TranscriptLane() {
  const chips = [
    { left: 0.30, w: 0.18, t: "Fear grizzlies by def…" },
    { left: 0.48, w: 0.18, t: "900-pound wild dog" },
    { left: 0.67, w: 0.14, t: "He smells meat" },
    { left: 0.84, w: 0.15, t: "There's no zag…" },
  ];
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {chips.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${c.left * 100}%`,
            width: `calc(${c.w * 100}% - 2px)`,
            top: 2, bottom: 2,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 2,
            paddingLeft: 4, paddingRight: 4,
            display: "flex",
            alignItems: "center",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 7,
            color: "rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {c.t}
        </div>
      ))}
    </div>
  );
}

function EmotionLane() {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%", display: "flex", alignItems: "center" }}>
      <div style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: "82%", background: "rgba(255,255,255,0.04)" }} />
      <span
        style={{
          position: "relative",
          marginLeft: 4,
          fontFamily: "'Geist Mono', monospace",
          fontSize: 7,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        tense
      </span>
      <div style={{ position: "absolute", left: "82%", top: 2, bottom: 2, width: "18%", background: "rgba(251,178,73,0.45)" }} />
    </div>
  );
}

function AudioLane() {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div
        style={{
          position: "absolute",
          left: "32%",
          top: 1, bottom: 1,
          paddingLeft: 4,
          borderLeft: "2px solid #FBB249",
          fontFamily: "'Geist Mono', monospace",
          fontSize: 7,
          color: "#FBB249",
          display: "flex",
          alignItems: "center",
        }}
      >
        laughter
      </div>
    </div>
  );
}
