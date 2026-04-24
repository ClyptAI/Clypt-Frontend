import { Pause } from "lucide-react";
import { useMemo } from "react";
import AppFrameMock from "./AppFrameMock";
import phase1Frame from "@/assets/landing-phase1-frame.png";

/**
 * Faithful preview of the RunTimeline page. Mirrors the real layout:
 * - RunContextBar (run name left, phase status right, cyan)
 * - Video player (16:9 letterboxed) showing the real podcast frame
 * - Drag divider
 * - Transport bar (play, current time, scrubber w/ violet fill, total time)
 * - Time ruler with vertical playhead line
 * - Stacked lanes (Shots, Tracklets, 3 Speakers, Transcript, Emotion, Audio)
 *   each with sticky left LABEL column matching the production styling.
 */

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F"];
const LABEL_W = 92;
const DURATION = 110;
const PLAYHEAD_TIME = 38;

const RULER_TICKS = ["0:00", "0:30", "1:00", "1:30", "2:00", "2:30", "3:00", "3:30"];

const SHOTS = [
  { id: "1", start: 4, end: 18 },
  { id: "2", start: 22, end: 41 },
  { id: "3", start: 46, end: 62 },
  { id: "4", start: 68, end: 86 },
  { id: "5", start: 92, end: 108 },
];

const TRACKLETS = [
  { start: 4, end: 18, letters: ["A", "B"] },
  { start: 22, end: 41, letters: ["A"] },
  { start: 46, end: 62, letters: ["B", "C"] },
  { start: 68, end: 86, letters: ["A", "B"] },
  { start: 92, end: 108, letters: ["C"] },
];

const SPEAKER_TURNS: Array<Array<{ start: number; end: number }>> = [
  // Speaker 0 (blue)
  [
    { start: 4, end: 17 },
    { start: 31, end: 44 },
    { start: 80, end: 96 },
  ],
  // Speaker 1 (orange)
  [
    { start: 19, end: 30 },
    { start: 62, end: 78 },
  ],
  // Speaker 2 (green)
  [
    { start: 46, end: 60 },
    { start: 98, end: 108 },
  ],
];

const TRANSCRIPT_TURNS = [
  { spk: 0, start: 4, end: 17, text: "Everyone should have a fear of grizzly bears" },
  { spk: 1, start: 19, end: 30, text: "And you're gonna have a little cloth house" },
  { spk: 0, start: 31, end: 44, text: "It's like a 900-pound predatory wild dog" },
  { spk: 2, start: 46, end: 60, text: "But what if you scare them by yelling?" },
  { spk: 1, start: 62, end: 78, text: "No, that's a polar bear. He smells meat" },
  { spk: 0, start: 80, end: 96, text: "He's trying to bite that box to eat that man" },
  { spk: 2, start: 98, end: 108, text: "There's no zagging with bears" },
];

const EMOTIONS = [
  { start: 4, end: 22, color: "rgba(96,165,250,0.45)", label: "sad" },
  { start: 22, end: 44, color: "rgba(34,211,238,0.5)", label: "surprised" },
  { start: 44, end: 66, color: "rgba(251,113,133,0.5)", label: "angry" },
  { start: 66, end: 88, color: "rgba(251,178,73,0.55)", label: "happy" },
  { start: 88, end: 108, color: "rgba(167,139,250,0.5)", label: "fearful" },
];

const AUDIO_EVENTS = [
  { at: 7, label: "laugh" },
  { at: 25, label: "applause" },
  { at: 51, label: "music" },
  { at: 90, label: "laugh" },
];

const pct = (s: number) => `${(s / DURATION) * 100}%`;
const widthPct = (a: number, b: number) => `${((b - a) / DURATION) * 100}%`;

export default function LandingTimelinePreview() {
  return (
    <AppFrameMock windowLabel="Joe Rogan × Flagrant — Timeline" height={640}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0A0909" }}>
        {/* RunContextBar */}
        <ContextBar runName="joeroganflagrant.mp4" />

        {/* Video player — 16:9 letterboxed in a black container */}
        <div
          style={{
            height: 300,
            flexShrink: 0,
            background: "#000",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={phase1Frame}
            alt=""
            style={{
              height: "100%",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
          {/* Time overlay */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 12,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.75)",
              background: "rgba(0,0,0,0.55)",
              padding: "2px 6px",
              borderRadius: 3,
            }}
          >
            0:38 / 24:31
          </div>
        </div>

        {/* Drag divider */}
        <div style={{ height: 6, background: "rgba(255,255,255,0.05)", position: "relative", flexShrink: 0 }}>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: 32,
              height: 3,
              borderRadius: 2,
              background: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        {/* Transport bar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 14px",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 4,
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Pause size={12} color="rgba(255,255,255,0.85)" />
          </div>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.85)", minWidth: 60 }}>
            0:38
          </span>
          {/* Scrubber */}
          <div style={{ flex: 1, height: 14, position: "relative", display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
              <div
                style={{
                  width: `${(PLAYHEAD_TIME / DURATION) * 100}%`,
                  height: "100%",
                  background: "#A78BFA",
                  borderRadius: 2,
                }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                left: `${(PLAYHEAD_TIME / DURATION) * 100}%`,
                top: "50%",
                transform: "translate(-50%,-50%)",
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#A78BFA",
                boxShadow: "0 0 0 3px rgba(167,139,250,0.18)",
              }}
            />
          </div>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            24:31
          </span>
        </div>

        {/* Time ruler */}
        <div
          style={{
            height: 26,
            flexShrink: 0,
            display: "flex",
            background: "rgba(255,255,255,0.015)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: LABEL_W,
              flexShrink: 0,
              borderRight: "1px solid rgba(255,255,255,0.06)",
            }}
          />
          <div style={{ flex: 1, position: "relative" }}>
            {RULER_TICKS.map((t, i) => (
              <div
                key={t}
                style={{
                  position: "absolute",
                  left: `${(i / (RULER_TICKS.length - 1)) * 96}%`,
                  bottom: 4,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.4)",
                  transform: "translateX(-50%)",
                }}
              >
                {t}
              </div>
            ))}
            {/* Vertical playhead line in ruler */}
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${(PLAYHEAD_TIME / DURATION) * 100}%`,
                width: 1,
                background: "#A78BFA",
              }}
            />
          </div>
        </div>

        {/* Lanes — fixed-height stack so we don't leave blank space at the bottom */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0A0909", display: "flex", flexDirection: "column" }}>
          {/* Persistent vertical playhead across lanes */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `calc(${LABEL_W}px + ${(PLAYHEAD_TIME / DURATION) * 100}% - ${LABEL_W * (PLAYHEAD_TIME / DURATION)}px)`,
              width: 1,
              background: "rgba(167,139,250,0.85)",
              boxShadow: "0 0 6px rgba(167,139,250,0.5)",
              zIndex: 5,
              pointerEvents: "none",
            }}
          />

          <Lane label="SHOTS" flex={2}>
            {SHOTS.map((s, i) => (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  left: pct(s.start),
                  width: widthPct(s.start, s.end),
                  background: i % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 5,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                Shot {s.id}
              </div>
            ))}
          </Lane>

          <Lane label="TRACKLETS" flex={2}>
            {TRACKLETS.map((t, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 5,
                  bottom: 5,
                  left: pct(t.start),
                  width: widthPct(t.start, t.end),
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {t.letters.join(", ")}
              </div>
            ))}
          </Lane>

          {/* Speaker lanes — colored waveform-style blocks */}
          {["JOE", "ANDREW", "AKAASH"].map((label, spk) => {
            const c = SPEAKER_COLORS[spk];
            return (
              <Lane key={spk} label={label} labelColor={c} flex={4}>
                <FullWaveform speakerId={spk} turns={SPEAKER_TURNS[spk]} color={c} />
              </Lane>
            );
          })}

          <Lane label="TRANSCRIPT" flex={2}>
            {TRANSCRIPT_TURNS.map((t, i) => {
              const c = SPEAKER_COLORS[t.spk];
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "70%",
                    left: pct(t.start),
                    maxWidth: widthPct(t.start, t.end),
                    background: "rgba(255,255,255,0.05)",
                    borderLeft: `2px solid ${c}`,
                    borderRadius: "0 2px 2px 0",
                    padding: "0 5px",
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 9,
                    color: "rgba(255,255,255,0.55)",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.text}
                </div>
              );
            })}
          </Lane>

          <Lane label="EMOTION" flex={2}>
            {EMOTIONS.map((e, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: pct(e.start),
                  width: widthPct(e.start, e.end),
                  background: e.color,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 5,
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 8.5,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {e.label}
              </div>
            ))}
          </Lane>

          <Lane label="AUDIO" lastLane flex={2}>
            {AUDIO_EVENTS.map((e, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: pct(e.at),
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div style={{ width: 2, height: "100%", background: "#FBB249" }} />
                <span
                  style={{
                    marginLeft: 4,
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 8.5,
                    color: "#FBB249",
                  }}
                >
                  {e.label}
                </span>
              </div>
            ))}
          </Lane>
        </div>
      </div>
    </AppFrameMock>
  );
}

/* ── Subcomponents ── */

function ContextBar({ runName }: { runName: string }) {
  return (
    <div
      style={{
        height: 40,
        flexShrink: 0,
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
      }}
    >
      <span
        style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 600,
          fontSize: 12.5,
          color: "rgba(255,255,255,0.92)",
        }}
      >
        {runName}
      </span>
      <span
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 10,
          color: "#67E8F9",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Phase 1 of 6 — Running
      </span>
    </div>
  );
}

function Lane({
  label,
  labelColor,
  children,
  lastLane = false,
  flex = 2,
}: {
  label: string;
  labelColor?: string;
  children: React.ReactNode;
  lastLane?: boolean;
  flex?: number;
}) {
  return (
    <div
      style={{
        flex,
        minHeight: 0,
        display: "flex",
        borderBottom: lastLane ? "none" : "1px solid rgba(255,255,255,0.045)",
      }}
    >
      <div
        style={{
          width: LABEL_W,
          flexShrink: 0,
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          background: "rgba(255,255,255,0.015)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 500,
          fontSize: 9.5,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: labelColor ?? "rgba(255,255,255,0.55)",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, position: "relative" }}>{children}</div>
    </div>
  );
}

/* ── Realistic waveform lane (mirrors production WaveformLane.tsx algorithm) ── */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a peaks array for the full lane using the same seeded random walk
 * as `src/components/timeline/WaveformLane.tsx`. High amplitude during speaker
 * turns, low amplitude (silence) outside.
 */
function generatePeaks(
  speakerId: number,
  turns: Array<{ start: number; end: number }>,
  durationS: number,
  pps: number,
): Float32Array {
  const rng = mulberry32(speakerId * 2053 + 137);
  const n = Math.ceil(durationS * pps);
  const raw = new Float32Array(n);
  let val = 0.25 + rng() * 0.35;
  for (let i = 0; i < n; i++) {
    const t = i / pps;
    const speaking = turns.some((tu) => t >= tu.start && t <= tu.end);
    const stepSize = speaking ? 0.15 : 0.05;
    val += (rng() - 0.5) * stepSize;
    val = Math.max(0, Math.min(1, val));
    raw[i] = speaking ? Math.max(0.1, val) : val * 0.18;
  }
  // light smoothing
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = Math.max(0, i - 3);
    const hi = Math.min(n - 1, i + 3);
    let s = 0;
    for (let j = lo; j <= hi; j++) s += raw[j];
    out[i] = s / (hi - lo + 1);
  }
  return out;
}

/**
 * Renders a full-width waveform across the whole lane (not just turn blocks),
 * with bars colored when inside a turn and dim grey during silence — matching
 * the production WaveformLane visual exactly.
 */
function FullWaveform({
  speakerId,
  turns,
  color,
}: {
  speakerId: number;
  turns: Array<{ start: number; end: number }>;
  color: string;
}) {
  // Dense bar count to look like the production canvas waveform.
  const BAR_PPS = 8;
  const peaks = useMemo(
    () => generatePeaks(speakerId, turns, DURATION, BAR_PPS),
    [speakerId, turns],
  );
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
          const t = i / BAR_PPS;
          const speaking = turns.some((tu) => t >= tu.start && t <= tu.end);
          const h = Math.max(3, p * (speaking ? 95 : 70));
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
      {/* Translucent turn overlays — match production WaveformLane.tsx */}
      {turns.map((tu, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(tu.start / DURATION) * 100}%`,
            width: `${((tu.end - tu.start) / DURATION) * 100}%`,
            background: color,
            opacity: 0.22,
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}
