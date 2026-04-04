import { useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ChevronUp, ChevronDown, X, Pencil } from "lucide-react";
import RunContextBar from "@/components/app/RunContextBar";

/* ─── constants ─── */
const VIDEO_DURATION = 24 * 60 + 31; // 24:31 in seconds
const ZOOM_LEVELS = [1, 2, 4] as const;
const PPS_BASE = 8; // pixels per second at 1×

const LAYER_TOGGLES = ["Shots", "Tracklets", "Speakers", "Transcript", "Emotion", "Audio Events"] as const;

const SPEAKER_COLORS = ["#4A9EFF", "#FF7A5C", "#5CCD8F", "#C98EFF"];

const EMOTION_COLORS: Record<string, string> = {
  neutral: "var(--color-surface-3)",
  happy: "rgba(251,178,73,0.5)",
  surprised: "rgba(34,211,238,0.5)",
  angry: "rgba(251,113,133,0.5)",
  sad: "rgba(96,165,250,0.5)",
  fearful: "rgba(167,139,250,0.5)",
  disgusted: "rgba(249,115,22,0.5)",
};

/* ─── mock data ─── */
const MOCK_SHOTS = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  start: (VIDEO_DURATION / 42) * i,
  end: (VIDEO_DURATION / 42) * (i + 1),
}));

const MOCK_TRACKLETS = MOCK_SHOTS.slice(0, 20).flatMap((shot, si) => {
  const dur = shot.end - shot.start;
  const count = si % 3 === 0 ? 2 : 1;
  return Array.from({ length: count }, (_, ti) => ({
    id: `T${si}-${String.fromCharCode(65 + ti)}`,
    shotId: shot.id,
    letter: String.fromCharCode(65 + ti),
    start: shot.start + (dur / count) * ti,
    end: shot.start + (dur / count) * (ti + 1),
  }));
});

const generateTurns = (speaker: number, count: number) => {
  const gap = VIDEO_DURATION / (count + 1);
  return Array.from({ length: count }, (_, i) => {
    const start = gap * (i + 0.5) + speaker * 3;
    const duration = 8 + Math.random() * 28;
    return {
      id: `turn_${speaker}_${i}`,
      speaker,
      start: Math.min(start, VIDEO_DURATION - duration),
      end: Math.min(start + duration, VIDEO_DURATION),
      transcript: speaker === 0
        ? "So the question really becomes, how do you scale that kind of reasoning across all of these different modalities?"
        : "I think the interesting thing about this approach is that it fundamentally changes how we think about the problem space.",
      emotion: { primary: i % 2 === 0 ? "happy" : "neutral", score: 0.6 + Math.random() * 0.3, secondary: [{ label: "surprised", score: 0.2 }] },
    };
  });
};

const MOCK_SPEAKERS = [
  { id: 0, name: "Speaker 0", turns: generateTurns(0, 18) },
  { id: 1, name: "Speaker 1", turns: generateTurns(1, 14) },
];

const MOCK_EMOTIONS = [
  { start: 0, end: 120, label: "neutral" },
  { start: 120, end: 280, label: "happy" },
  { start: 280, end: 420, label: "surprised" },
  { start: 420, end: 600, label: "neutral" },
  { start: 600, end: 780, label: "angry" },
  { start: 780, end: 1000, label: "happy" },
  { start: 1000, end: 1200, label: "neutral" },
  { start: 1200, end: VIDEO_DURATION, label: "sad" },
];

const MOCK_AUDIO_EVENTS = [
  { start: 45, end: 46, label: "laughter", confidence: 0.92 },
  { start: 190, end: 191, label: "applause", confidence: 0.78 },
  { start: 380, end: 381, label: "music", confidence: 0.85 },
  { start: 540, end: 541, label: "laughter", confidence: 0.88 },
  { start: 720, end: 721, label: "silence", confidence: 0.95 },
  { start: 890, end: 891, label: "laughter", confidence: 0.81 },
  { start: 1100, end: 1101, label: "applause", confidence: 0.73 },
  { start: 1300, end: 1301, label: "music", confidence: 0.69 },
];

/* ─── helpers ─── */
function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
function fmtTimePrecise(s: number) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1);
  return `${m}:${parseFloat(sec) < 10 ? "0" : ""}${sec}`;
}

/* ─── tooltip ─── */
function TT({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap pointer-events-none"
          style={{ background: "var(--color-surface-3)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" }}>
          {tip}
        </div>
      )}
    </div>
  );
}

/* ─── info panel ─── */
type Selection = { type: "turn"; data: typeof MOCK_SPEAKERS[0]["turns"][0]; speakerName: string } | null;

function InfoPanel({ selection, onClose }: { selection: Selection; onClose: () => void }) {
  const [editing, setEditing] = useState(false);

  if (!selection) {
    return (
      <div className="flex items-center justify-center h-full px-6">
        <span className="font-body text-[14px] text-center" style={{ color: "var(--color-text-muted)" }}>
          Click any lane segment to inspect it.
        </span>
      </div>
    );
  }

  const { data: turn, speakerName } = selection;
  const emo = turn.emotion;

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--color-border-subtle)" }}>
        <span className="label-caps">Speaker turn</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-2)]">
          <X size={16} style={{ color: "var(--color-text-muted)" }} />
        </button>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* identity */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>{turn.id}</span>
          <div className="flex items-center gap-2 group">
            {editing ? (
              <div className="flex items-center gap-2">
                <input defaultValue={speakerName} className="font-heading font-semibold text-[16px] bg-transparent border-b outline-none" style={{ color: "var(--color-text-primary)", borderColor: "var(--color-violet)" }} />
                <button onClick={() => setEditing(false)} className="font-body text-[12px]" style={{ color: "var(--color-violet)" }}>Save</button>
              </div>
            ) : (
              <>
                <span className="font-heading font-semibold text-[16px]" style={{ color: "var(--color-text-primary)" }}>{speakerName}</span>
                <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                  <Pencil size={12} style={{ color: "var(--color-text-muted)" }} />
                </button>
              </>
            )}
          </div>
          <span className="font-mono text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            {fmtTimePrecise(turn.start)} → {fmtTimePrecise(turn.end)} ({(turn.end - turn.start).toFixed(1)}s)
          </span>
        </div>

        {/* transcript */}
        <div>
          <span className="label-caps mb-2 block">Transcript</span>
          <p className="font-body text-[14px] leading-relaxed max-h-[120px] overflow-y-auto" style={{ color: "var(--color-text-primary)" }}>
            {turn.transcript}
          </p>
        </div>

        {/* emotion */}
        <div>
          <span className="label-caps mb-2 block">Emotion</span>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="font-body text-[13px] w-20" style={{ color: "var(--color-text-primary)" }}>{emo.primary}</span>
              <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-surface-3)" }}>
                <div className="h-full rounded-full" style={{ width: `${emo.score * 100}%`, background: EMOTION_COLORS[emo.primary] || "var(--color-surface-3)" }} />
              </div>
              <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>{(emo.score * 100).toFixed(0)}%</span>
            </div>
            {emo.secondary.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="font-body text-[13px] w-20" style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
                <div className="flex-1 h-1 rounded-full" style={{ background: "var(--color-surface-3)" }}>
                  <div className="h-full rounded-full" style={{ width: `${s.score * 100}%`, background: EMOTION_COLORS[s.label] || "var(--color-surface-3)" }} />
                </div>
                <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>{(s.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── page ─── */
export default function RunTimeline() {
  const { id } = useParams();
  const runId = id || "demo";

  const [zoom, setZoom] = useState<1 | 2 | 4>(1);
  const [layers, setLayers] = useState<Record<string, boolean>>(
    Object.fromEntries(LAYER_TOGGLES.map((l) => [l, true]))
  );
  const [videoOpen, setVideoOpen] = useState(true);
  const [playhead, setPlayhead] = useState(0);
  const [selection, setSelection] = useState<Selection>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pps = PPS_BASE * zoom;
  const totalWidth = VIDEO_DURATION * pps;
  const LABEL_W = 120;

  const toggleLayer = (l: string) => setLayers((p) => ({ ...p, [l]: !p[l] }));

  const selectTurn = (turn: typeof MOCK_SPEAKERS[0]["turns"][0], speakerName: string) => {
    setSelection({ type: "turn", data: turn, speakerName });
    setPanelOpen(true);
  };

  // ruler ticks
  const tickInterval = zoom >= 4 ? 10 : zoom >= 2 ? 15 : 30;
  const ticks = useMemo(() => {
    const arr: number[] = [];
    for (let t = 0; t <= VIDEO_DURATION; t += tickInterval) arr.push(t);
    return arr;
  }, [tickInterval]);

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <RunContextBar
        runId={runId}
        runName="Lex ep. 412 — Sam Altman"
        videoUrl="youtube.com/watch?v=dQw4w9WgXcQ"
        currentPhase={3}
        completedPhases={2}
      />

      {/* toolbar */}
      <div className="flex items-center gap-4 px-5 flex-shrink-0 border-b" style={{ height: 48, background: "var(--color-surface-1)", borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-heading font-semibold text-[14px] truncate" style={{ color: "var(--color-text-primary)", maxWidth: 240 }}>
            Lex ep. 412 — Sam Altman
          </span>
          <span className="font-mono text-[13px] flex-shrink-0" style={{ color: "var(--color-text-muted)" }}>24:31</span>
        </div>

        <div className="flex-1" />

        {/* layer toggles */}
        <div className="flex gap-1">
          {LAYER_TOGGLES.map((l) => (
            <button
              key={l}
              onClick={() => toggleLayer(l)}
              className="font-heading font-medium text-[12px] px-2.5 py-1 rounded transition-colors"
              style={{
                background: layers[l] ? "var(--color-surface-3)" : "transparent",
                color: layers[l] ? "var(--color-text-primary)" : "var(--color-text-muted)",
                border: layers[l] ? "1px solid var(--color-border)" : "1px solid transparent",
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* zoom */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setZoom(1); }}
            className="font-heading font-medium text-[12px] px-2.5 py-1 rounded"
            style={{ background: "transparent", color: "var(--color-text-muted)", border: "1px solid transparent" }}
          >
            Fit
          </button>
          {ZOOM_LEVELS.map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className="font-heading font-medium text-[12px] px-2.5 py-1 rounded transition-colors"
              style={{
                background: zoom === z ? "var(--color-surface-3)" : "transparent",
                color: zoom === z ? "var(--color-text-primary)" : "var(--color-text-muted)",
                border: zoom === z ? "1px solid var(--color-border)" : "1px solid transparent",
              }}
            >
              {z}×
            </button>
          ))}
        </div>

        {/* video toggle */}
        <button
          onClick={() => setVideoOpen(!videoOpen)}
          className="flex items-center gap-1.5 font-heading font-medium text-[13px] px-2 py-1 rounded hover:bg-[var(--color-surface-2)]"
          style={{ color: "var(--color-text-muted)", background: "transparent", border: "none" }}
        >
          {videoOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Video
        </button>
      </div>

      {/* video player */}
      <div
        className="flex-shrink-0 border-b overflow-hidden transition-[height] duration-200"
        style={{
          height: videoOpen ? 160 : 0,
          background: "#000",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-[12px]" style={{ color: "var(--color-text-muted)" }}>Video Player</span>
          </div>
          {/* scrubber */}
          <div className="px-4 pb-2 flex items-center gap-3">
            <span className="font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>{fmtTime(playhead)}</span>
            <div className="flex-1 relative h-3 flex items-center cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                setPlayhead(pct * VIDEO_DURATION);
              }}
            >
              <div className="absolute inset-x-0 h-[3px] rounded-full" style={{ background: "var(--color-surface-3)" }} />
              <div className="absolute left-0 h-[3px] rounded-full" style={{ background: "var(--color-violet)", width: `${(playhead / VIDEO_DURATION) * 100}%` }} />
              <div className="absolute h-2.5 w-2.5 rounded-full -translate-x-1/2" style={{ background: "var(--color-violet)", left: `${(playhead / VIDEO_DURATION) * 100}%` }} />
            </div>
            <span className="font-mono text-[11px]" style={{ color: "var(--color-text-muted)" }}>24:31</span>
          </div>
        </div>
      </div>

      {/* main content: timeline + panel */}
      <div className="flex flex-1 min-h-0">
        {/* timeline scroll area */}
        <div className="flex-1 overflow-x-auto overflow-y-auto" ref={scrollRef}>
          <div style={{ width: LABEL_W + totalWidth, minHeight: "100%" }}>

            {/* ruler */}
            <div className="sticky top-0 z-10 flex border-b" style={{ height: 28, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
              <div className="flex-shrink-0 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }} />
              <div className="relative" style={{ width: totalWidth }}>
                {ticks.map((t) => (
                  <div key={t} className="absolute top-0 h-full flex flex-col items-center" style={{ left: t * pps }}>
                    <div className="w-px h-2" style={{ background: "var(--color-border)" }} />
                    <span className="font-mono text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>{fmtTime(t)}</span>
                  </div>
                ))}
                {/* playhead */}
                <div className="absolute top-0 bottom-0 w-px z-20" style={{ left: playhead * pps, background: "var(--color-violet)" }} />
              </div>
            </div>

            {/* shots lane */}
            {layers["Shots"] && (
              <div className="flex border-b" style={{ height: 32, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Shots</span>
                </div>
                <div className="relative flex" style={{ width: totalWidth }}>
                  {MOCK_SHOTS.map((shot, i) => (
                    <TT key={shot.id} tip={`Shot ${shot.id}: ${fmtTime(shot.start)} → ${fmtTime(shot.end)}`}>
                      <div
                        className="h-8 flex items-center px-1 border-r"
                        style={{
                          width: (shot.end - shot.start) * pps,
                          background: i % 2 === 0 ? "var(--color-surface-2)" : "var(--color-surface-3)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        {(shot.end - shot.start) * pps > 40 && (
                          <span className="font-mono text-[10px] truncate" style={{ color: "var(--color-text-muted)" }}>Shot {shot.id}</span>
                        )}
                      </div>
                    </TT>
                  ))}
                </div>
              </div>
            )}

            {/* tracklets lane */}
            {layers["Tracklets"] && (
              <div className="flex border-b" style={{ height: 28, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Tracklets</span>
                </div>
                <div className="relative" style={{ width: totalWidth, height: 28 }}>
                  {MOCK_TRACKLETS.map((t) => (
                    <TT key={t.id} tip={`${t.id} · Shot ${t.shotId} · ${fmtTime(t.start)} → ${fmtTime(t.end)}`}>
                      <div
                        className="absolute top-1 flex items-center justify-center rounded-sm border"
                        style={{
                          left: t.start * pps,
                          width: Math.max((t.end - t.start) * pps, 8),
                          height: 20,
                          background: "var(--color-surface-3)",
                          borderColor: "var(--color-border)",
                        }}
                      >
                        <span className="font-mono text-[10px]" style={{ color: "var(--color-text-primary)" }}>{t.letter}</span>
                      </div>
                    </TT>
                  ))}
                </div>
              </div>
            )}

            {/* speaker lanes */}
            {layers["Speakers"] && MOCK_SPEAKERS.map((speaker) => (
              <div key={speaker.id} className="flex border-b" style={{ height: 28, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>{speaker.name}</span>
                </div>
                <div className="relative" style={{ width: totalWidth, height: 28 }}>
                  {speaker.turns.map((turn) => {
                    const c = SPEAKER_COLORS[speaker.id % SPEAKER_COLORS.length];
                    return (
                      <TT key={turn.id} tip={`${turn.id} · ${fmtTime(turn.start)} → ${fmtTime(turn.end)} · "${turn.transcript.slice(0, 40)}…"`}>
                        <div
                          className="absolute top-1 rounded-sm border cursor-pointer hover:brightness-125"
                          style={{
                            left: turn.start * pps,
                            width: Math.max((turn.end - turn.start) * pps, 4),
                            height: 20,
                            background: `${c}66`,
                            borderColor: `${c}cc`,
                          }}
                          onClick={() => selectTurn(turn, speaker.name)}
                        />
                      </TT>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* transcript lane */}
            {layers["Transcript"] && (
              <div className="flex border-b" style={{ height: 40, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Transcript</span>
                </div>
                <div className="relative flex items-center gap-0.5 px-1" style={{ width: totalWidth }}>
                  {/* generate word tokens from speaker turns */}
                  {MOCK_SPEAKERS.flatMap((sp) => sp.turns).sort((a, b) => a.start - b.start).slice(0, 60).map((turn, i) => {
                    const words = turn.transcript.split(" ").slice(0, zoom >= 4 ? 6 : 2);
                    return words.map((w, wi) => (
                      <div
                        key={`${turn.id}-${wi}`}
                        className="inline-flex items-center px-1 rounded-sm flex-shrink-0 cursor-pointer hover:bg-[var(--color-surface-3)]"
                        style={{
                          height: 18,
                          background: "var(--color-surface-2)",
                          position: "absolute",
                          left: (turn.start + wi * 1.2) * pps,
                        }}
                        onClick={() => selectTurn(turn, MOCK_SPEAKERS.find(s => s.id === turn.speaker)?.name || "Unknown")}
                      >
                        <span className="font-mono text-[9px] truncate" style={{ color: "var(--color-text-muted)" }}>{w}</span>
                      </div>
                    ));
                  })}
                </div>
              </div>
            )}

            {/* emotion lane */}
            {layers["Emotion"] && (
              <div className="flex border-b" style={{ height: 28, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Emotion</span>
                </div>
                <div className="relative flex" style={{ width: totalWidth }}>
                  {MOCK_EMOTIONS.map((emo, i) => (
                    <TT key={i} tip={`${emo.label} · ${fmtTime(emo.start)} → ${fmtTime(emo.end)}`}>
                      <div
                        className="h-7 flex items-center px-1"
                        style={{
                          width: (emo.end - emo.start) * pps,
                          background: EMOTION_COLORS[emo.label] || "var(--color-surface-2)",
                        }}
                      >
                        {(emo.end - emo.start) * pps > 50 && (
                          <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>{emo.label}</span>
                        )}
                      </div>
                    </TT>
                  ))}
                </div>
              </div>
            )}

            {/* audio events lane */}
            {layers["Audio Events"] && (
              <div className="flex border-b" style={{ height: 32, borderColor: "var(--color-border-subtle)" }}>
                <div className="flex-shrink-0 sticky left-0 z-[5] flex items-center px-3 border-r" style={{ width: LABEL_W, background: "var(--color-surface-1)", borderColor: "var(--color-border-subtle)" }}>
                  <span className="font-heading font-medium text-[12px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)", letterSpacing: "0.04em" }}>Audio</span>
                </div>
                <div className="relative" style={{ width: totalWidth, height: 32 }}>
                  {MOCK_AUDIO_EVENTS.map((ev, i) => (
                    <TT key={i} tip={`${ev.label} · ${(ev.confidence * 100).toFixed(0)}% · ${fmtTime(ev.start)}`}>
                      <div
                        className="absolute top-0 flex flex-col items-center"
                        style={{ left: ev.start * pps, height: 32 }}
                      >
                        <div className="w-[2px] h-full rounded-sm" style={{ background: "var(--color-amber)" }} />
                        <span className="absolute bottom-0.5 left-1 font-mono text-[9px] whitespace-nowrap" style={{ color: "var(--color-amber)" }}>
                          {ev.label}
                        </span>
                      </div>
                    </TT>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* right info panel */}
        {panelOpen && (
          <div className="flex-shrink-0 border-l overflow-y-auto" style={{ width: 320, background: "var(--color-surface-1)", borderColor: "var(--color-border)" }}>
            <InfoPanel selection={selection} onClose={() => { setPanelOpen(false); setSelection(null); }} />
          </div>
        )}
      </div>
    </div>
  );
}
