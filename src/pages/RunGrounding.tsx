import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Lock } from "lucide-react";

/* ── Mock clip queue ── */
interface QueueClip {
  id: string;
  label: string;
  timeStart: string;
  timeEnd: string;
  duration: string;
  status: "partial" | "not_started" | "complete" | "locked";
  speakers?: string;
  camera?: string;
}

const QUEUE: QueueClip[] = [
  { id: "001", label: "Clip 001", timeStart: "0:42", timeEnd: "1:18", duration: "35s", status: "partial", speakers: "3/4", camera: "4/4" },
  { id: "002", label: "Clip 002", timeStart: "3:22", timeEnd: "4:05", duration: "43s", status: "not_started" },
  { id: "003", label: "Clip 003", timeStart: "1:50", timeEnd: "2:31", duration: "41s", status: "not_started" },
  { id: "004", label: "Clip 004", timeStart: "6:10", timeEnd: "6:48", duration: "38s", status: "not_started" },
  { id: "005", label: "Clip 005", timeStart: "8:05", timeEnd: "8:44", duration: "39s", status: "not_started" },
  { id: "006", label: "Clip 006", timeStart: "11:22", timeEnd: "12:00", duration: "38s", status: "locked" },
  { id: "007", label: "Clip 007", timeStart: "14:33", timeEnd: "15:10", duration: "37s", status: "locked" },
  { id: "008", label: "Clip 008", timeStart: "17:02", timeEnd: "17:38", duration: "36s", status: "locked" },
];

function StatusIcon({ status }: { status: QueueClip["status"] }) {
  const base: React.CSSProperties = { width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
  switch (status) {
    case "complete":
      return <span style={{ ...base, background: "var(--color-green-muted)", border: "1px solid var(--color-green)" }}><Check size={12} color="var(--color-green)" /></span>;
    case "partial":
      return (
        <span style={{ ...base, border: "2px solid var(--color-amber)", background: "var(--color-amber-muted)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-amber)" }} />
        </span>
      );
    case "locked":
      return <span style={{ ...base, border: "1px solid var(--color-border)", opacity: 0.3 }}><Lock size={10} color="var(--color-text-muted)" /></span>;
    default:
      return <span style={{ ...base, border: "1px solid var(--color-border)" }} />;
  }
}

export default function RunGrounding() {
  const { id, clipId } = useParams();
  const [activeClip, setActiveClip] = useState(clipId ?? "001");
  const current = QUEUE.find((c) => c.id === activeClip) ?? QUEUE[0];
  const isComplete = current.status === "complete";

  return (
    <div className="flex flex-col" style={{ height: "100vh" }}>
      {/* ── Header bar ── */}
      <div style={{ height: 56, flexShrink: 0, background: "var(--color-surface-1)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between" }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            to={`/runs/${id ?? "demo"}/clips`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-muted)", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            ← Clip Candidates
          </Link>
          <span style={{ width: 1, height: 16, background: "var(--color-border)" }} />
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Lex ep. 412 — Sam Altman</span>
          <span style={{ color: "var(--color-text-muted)", fontSize: 14 }}>›</span>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-secondary)" }}>Grounding</span>
        </div>

        {/* Center */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>Clip {current.id}</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14, color: "var(--color-text-muted)" }}>·  {current.timeStart} → {current.timeEnd}  ·  {current.duration}</span>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[{ label: `Speakers ${current.speakers ?? "0/0"}`, done: current.speakers?.startsWith(current.speakers?.split("/")[1] ?? "") }, { label: `Camera ${current.camera ?? "0/0"}`, done: current.camera?.startsWith(current.camera?.split("/")[1] ?? "") }].map((p) => (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.done ? "var(--color-green)" : "var(--color-amber)" }} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>{p.label}</span>
              </div>
            ))}
          </div>
          <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--color-border)", background: "var(--color-surface-2)", fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", cursor: "pointer" }}>Save</button>
          <button
            disabled={!isComplete}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "none",
              background: isComplete ? "var(--color-violet)" : "var(--color-surface-3)",
              fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13,
              color: isComplete ? "#0A0909" : "var(--color-text-muted)",
              cursor: isComplete ? "pointer" : "not-allowed",
            }}
          >Done →</button>
        </div>
      </div>

      {/* ── Main work area ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left clip sidebar */}
        <div style={{ width: 220, flexShrink: 0, background: "var(--color-surface-1)", borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center" }}>
            <span className="label-caps">Grounding queue</span>
            <span style={{ marginLeft: 6, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>8 clips</span>
          </div>
          {QUEUE.map((clip) => {
            const isActive = clip.id === activeClip;
            const isLocked = clip.status === "locked";
            return (
              <div
                key={clip.id}
                onClick={() => !isLocked && setActiveClip(clip.id)}
                style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: isActive ? "var(--color-surface-2)" : "transparent",
                  borderLeft: isActive ? "3px solid var(--color-violet)" : "3px solid transparent",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => { if (!isActive && !isLocked) e.currentTarget.style.background = "var(--color-surface-2)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <StatusIcon status={clip.status} />
                <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 3 }}>
                  <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>{clip.label}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{clip.timeStart} → {clip.timeEnd}  ·  {clip.duration}</span>
                  {isActive && clip.speakers && (
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 11, color: "var(--color-text-muted)" }}>
                      Speakers: {clip.speakers}  ·  Camera: {clip.camera}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center + right */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Center column */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Center timeline editor placeholder */}
            <div style={{ flex: 1, background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>
                Shot lanes load here — coming in next prompt
              </span>
            </div>
            {/* Bottom camera intent placeholder */}
            <div style={{ height: 200, flexShrink: 0, background: "var(--color-surface-1)", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>
                Camera intent panel loads here — coming in next prompt
              </span>
            </div>
          </div>

          {/* Right details placeholder */}
          <div style={{ width: 360, flexShrink: 0, background: "var(--color-surface-1)", borderLeft: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>
              Details panel loads here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
