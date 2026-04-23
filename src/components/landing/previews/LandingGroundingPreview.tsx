import { Pause, Crop, Check, Lock } from "lucide-react";
import AppFrameMock from "./AppFrameMock";
import phase5Frame from "@/assets/landing-phase5-frame.png";

/**
 * Faithful preview of the RunGrounding page. Top-level structure:
 *  - Custom RunGrounding context bar: "← Clips · Grounding · Clip 002 …"
 *    plus right-side completion pips and Save / Done buttons.
 *  - Video region with a floating Queue panel (top-left) and an Edit boxes
 *    toolbar (top-right). Bounding boxes drawn on the real podcast still.
 *  - Drag divider, transport bar, time ruler.
 *  - Bottom workspace: tracklets row + speaker lanes + transcript word strip.
 */

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F"];

const QUEUE = [
  { label: "Clip 001", time: "0:38 → 1:04", status: "complete" as const },
  { label: "Clip 002", time: "1:40 → 2:05", status: "active" as const },
  { label: "Clip 003", time: "2:27 → 3:10", status: "partial" as const },
  { label: "Clip 004", time: "4:18 → 5:09", status: "not_started" as const },
  { label: "Clip 005", time: "5:56 → 6:24", status: "locked" as const },
];

const TRACKLETS = [
  { letter: "A", boundTo: "Joe", color: SPEAKER_COLORS[0] },
  { letter: "B", boundTo: "Andrew", color: SPEAKER_COLORS[1] },
];

const TRANSCRIPT = [
  "No", "that's", "a", "polar", "bear", "He", "smells", "meat",
  "He's", "trying", "to", "bite", "that", "box",
];

export default function LandingGroundingPreview() {
  return (
    <AppFrameMock windowLabel="Joe Rogan × Flagrant — Grounding · Clip 002" height={580}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0A0909" }}>
        {/* Grounding context bar */}
        <div
          style={{
            height: 40,
            flexShrink: 0,
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              ← Clips
            </span>
            <span style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.92)" }}>
              Grounding
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>·</span>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 11.5, color: "rgba(255,255,255,0.7)" }}>
              Clip 002
            </span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              1:40 → 2:05 · 25s
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ProgressPip color="#FBB249" label="Speakers 2/2" />
            <ProgressPip color="#4ADE80" label="Camera 2/2" />
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: 10.5,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Save
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 4,
                background: "#A78BFA",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: 10.5,
                color: "#0A0909",
              }}
            >
              Done →
            </span>
          </div>
        </div>

        {/* Video region with Queue panel + bbox overlay */}
        <div
          style={{
            height: 270,
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
            src={phase5Frame}
            alt=""
            style={{
              height: "100%",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />

          {/* Bounding boxes — positioned over the real frame.
              The screenshot has Joe (left), Andrew (center), Akaash (right).
              We mark Andrew (the speaker) and Joe (the reaction target). */}
          <BBox color={SPEAKER_COLORS[1]} letter="B" name="Andrew" left="36%" top="22%" width="22%" height="62%" />
          <BBox color={SPEAKER_COLORS[0]} letter="A" name="Joe" left="68%" top="24%" width="20%" height="60%" />

          {/* Queue panel — top-left float */}
          <div
            style={{
              position: "absolute",
              left: 8,
              top: 8,
              width: 158,
              maxHeight: "calc(100% - 16px)",
              background: "rgba(10,9,9,0.78)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "7px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 600,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Queue
              </span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.45)" }}>
                {QUEUE.length}
              </span>
            </div>
            {QUEUE.map((c, i) => {
              const isActive = c.status === "active";
              return (
                <div
                  key={i}
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    borderLeft: isActive ? "2px solid #A78BFA" : "2px solid transparent",
                    background: isActive ? "rgba(167,139,250,0.12)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <StatusDot status={c.status} />
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                    <span
                      style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: 10.5,
                        color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {c.label}
                    </span>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 8.5, color: "rgba(255,255,255,0.35)" }}>
                      {c.time}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit boxes toolbar — top-right float */}
          <div
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              display: "flex",
              gap: 6,
              padding: 4,
              background: "rgba(10,9,9,0.78)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 9px",
                borderRadius: 5,
                border: "1px solid rgba(167,139,250,0.6)",
                background: "rgba(167,139,250,0.18)",
                color: "#A78BFA",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: 10.5,
              }}
            >
              <Crop size={11} />
              Edit boxes
            </span>
            <span
              style={{
                padding: "5px 9px",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.12)",
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 600,
                fontSize: 10.5,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              + Add box
            </span>
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
            height: 40,
            flexShrink: 0,
            background: "rgba(255,255,255,0.02)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 14px",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Pause size={11} color="rgba(255,255,255,0.85)" />
          </div>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.85)", minWidth: 50 }}>
            1:52
          </span>
          <div style={{ flex: 1, height: 12, position: "relative", display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
              <div style={{ width: "38%", height: "100%", background: "#A78BFA", borderRadius: 2 }} />
            </div>
            <div
              style={{
                position: "absolute",
                left: "38%",
                top: "50%",
                transform: "translate(-50%,-50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#A78BFA",
              }}
            />
          </div>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            2:05
          </span>
        </div>

        {/* Bottom workspace — tracklets, speaker lanes, transcript */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "#0A0909" }}>
          {/* Tracklets */}
          <WorkspaceRow label="TRACKLETS">
            <div style={{ display: "flex", gap: 6, alignItems: "center", height: "100%" }}>
              {TRACKLETS.map((t) => (
                <div
                  key={t.letter}
                  style={{
                    flex: 1,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 8px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: `3px solid ${t.color}`,
                    borderRadius: 4,
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: t.color }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>
                    {t.letter}
                  </span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.5)" }}>
                    {t.boundTo}
                  </span>
                </div>
              ))}
            </div>
          </WorkspaceRow>

          {/* Speaker lanes — bar fills the full lane width (the clip's whole
              span) and shows colored regions where the speaker is active. */}
          <WorkspaceRow label="JOE" labelColor={SPEAKER_COLORS[0]}>
            <SpeakerBar color={SPEAKER_COLORS[0]} segments={[[0, 0.58]]} />
          </WorkspaceRow>
          <WorkspaceRow label="ANDREW" labelColor={SPEAKER_COLORS[1]}>
            <SpeakerBar color={SPEAKER_COLORS[1]} segments={[[0.34, 1]]} />
          </WorkspaceRow>

          {/* Transcript word strip */}
          <div
            style={{
              flexShrink: 0,
              padding: "8px 12px 10px 84px",
              background: "rgba(255,255,255,0.015)",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
            }}
          >
            {TRANSCRIPT.map((word, i) => {
              const spk = i < 8 ? 0 : 1;
              const c = SPEAKER_COLORS[spk];
              return (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: 10.5,
                    color: "rgba(255,255,255,0.78)",
                    background: `${c}1f`,
                    padding: "2px 5px",
                    borderRadius: 3,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AppFrameMock>
  );
}

/* ── Subcomponents ── */

function ProgressPip({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10.5, color: "rgba(255,255,255,0.55)" }}>
        {label}
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: typeof QUEUE[number]["status"] }) {
  const base: React.CSSProperties = {
    width: 14,
    height: 14,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
  switch (status) {
    case "complete":
      return (
        <span style={{ ...base, background: "rgba(74,222,128,0.18)", border: "1px solid #4ADE80" }}>
          <Check size={8} color="#4ADE80" />
        </span>
      );
    case "active":
      return (
        <span style={{ ...base, border: "2px solid #A78BFA" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#A78BFA" }} />
        </span>
      );
    case "partial":
      return (
        <span style={{ ...base, border: "2px solid #FBB249" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FBB249" }} />
        </span>
      );
    case "locked":
      return (
        <span style={{ ...base, border: "1px solid rgba(255,255,255,0.15)", opacity: 0.4 }}>
          <Lock size={7} color="rgba(255,255,255,0.5)" />
        </span>
      );
    default:
      return <span style={{ ...base, border: "1px solid rgba(255,255,255,0.15)" }} />;
  }
}

function WorkspaceRow({
  label,
  labelColor,
  children,
}: {
  label: string;
  labelColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 36,
        display: "flex",
        alignItems: "center",
        padding: "6px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          width: 72,
          flexShrink: 0,
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 500,
          fontSize: 9,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: labelColor ?? "rgba(255,255,255,0.5)",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "100%" }}>{children}</div>
    </div>
  );
}

function BBox({
  color,
  letter,
  name,
  left,
  top,
  width,
  height,
}: {
  color: string;
  letter: string;
  name: string;
  left: string;
  top: string;
  width: string;
  height: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        border: `2px solid ${color}`,
        borderRadius: 3,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -1,
          left: -1,
          background: color,
          color: "#0A0909",
          fontFamily: "'Geist Mono', monospace",
          fontSize: 9,
          fontWeight: 700,
          padding: "1px 5px",
          borderRadius: "0 0 3px 0",
          lineHeight: "13px",
        }}
      >
        {letter}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -1,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,9,9,0.85)",
          border: `1px solid ${color}`,
          borderRadius: 3,
          padding: "1px 6px",
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontWeight: 600,
          fontSize: 8.5,
          color,
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
}

/**
 * A speaker lane bar that spans the full width of the lane (the clip's full
 * timespan) and renders colored "speaking" segments at the supplied [start,
 * end] fractions (0..1). Includes a faint background track so silence is
 * visible.
 */
function SpeakerBar({
  color,
  segments,
}: {
  color: string;
  segments: Array<[number, number]>;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Active speaking segments only — no silence track */}
      {segments.map(([s, e], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s * 100}%`,
            width: `${(e - s) * 100}%`,
            top: "50%",
            transform: "translateY(-50%)",
            height: "60%",
            background: color,
            borderRadius: 3,
            boxShadow: `inset 0 0 0 1px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
