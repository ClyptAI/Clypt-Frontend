import { X, TrendingUp, MessageSquare, BarChart2 } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";

const NODE_TYPE_COLORS: Record<string, string> = {
  claim: "#A78BFA", explanation: "#60A5FA", example: "#2DD4BF", anecdote: "#FBB249",
  reaction_beat: "#FB7185", qa_exchange: "#4ADE80", challenge_exchange: "#FB923C",
  setup_payoff: "#E879F9", reveal: "#FACC15", transition: "#71717A",
};

const EDGE_COLORS: Record<string, string> = {
  structural: "#302D35", strong: "#A78BFA", moderate: "#60A5FA", longrange: "#FBB249",
};

interface InspectPanelProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  allEdges: Edge[];
  onClose: () => void;
}

function Section({ label, extra, children }: { label: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span className="label-caps">{label}</span>
        {extra && <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, color: "var(--color-text-muted)" }}>{extra}</span>}
      </div>
      {children}
    </div>
  );
}

function EmotionBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)", width: 70, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--color-surface-3)", overflow: "hidden" }}>
        <div style={{ width: `${score * 100}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)", width: 32, textAlign: "right" }}>{score.toFixed(2)}</span>
    </div>
  );
}

// Mock enrichment data per node
const MOCK_ENRICHMENT: Record<string, {
  transcript?: string;
  sourceTurns?: string[];
  emotions?: { label: string; score: number; color: string }[];
  audioEvents?: { label: string; time: string }[];
  signalTags?: ("trend" | "comment" | "retention")[];
  clipCandidates?: { id: string; rank: number; score: number }[];
}> = {
  "001": {
    transcript: "Everyone should have a fear of grizzly bears. If there was only one grizzly bear and it only existed in a movie, you'd still think it was one of the scariest things ever imagined.",
    sourceTurns: ["t_001", "t_002"],
    emotions: [
      { label: "confident", score: 0.84, color: "#4ADE80" },
      { label: "fearful", score: 0.46, color: "#FBB249" },
    ],
    signalTags: ["trend"],
  },
  "003": {
    transcript: "This is him just being curious. No, that's a polar bear. He smells meat. He's trying to get in there and eat that dude.",
    sourceTurns: ["t_025", "t_028", "t_033"],
    emotions: [
      { label: "tense", score: 0.67, color: "#71717A" },
      { label: "amused", score: 0.25, color: "#FBB249" },
    ],
    signalTags: ["comment"],
  },
  "007": {
    transcript: "They came back to the elk, noticed bear sign, ignored it, sat down for lunch, and then heard the noise that meant the whole situation had changed.",
    sourceTurns: ["t_060", "t_061", "t_063"],
    emotions: [
      { label: "tense", score: 0.81, color: "#22D3EE" },
      { label: "focused", score: 0.59, color: "#FBB249" },
    ],
    audioEvents: [{ label: "shouting", time: "4:44 → 4:52" }],
    signalTags: ["trend", "retention"],
    clipCandidates: [{ id: "clip_003", rank: 1, score: 9.2 }],
  },
  "008": {
    transcript: "There was this giant beast running through the camp. One guy wound up on top of the bear as it sprinted downhill before falling off.",
    sourceTurns: ["t_063", "t_065"],
    emotions: [
      { label: "surprised", score: 0.92, color: "#22D3EE" },
      { label: "fearful", score: 0.71, color: "#FBB249" },
    ],
    audioEvents: [{ label: "laughter", time: "5:09 → 5:10" }, { label: "shouting", time: "4:50 → 4:58" }],
    signalTags: ["comment", "retention"],
    clipCandidates: [{ id: "clip_003", rank: 1, score: 9.2 }],
  },
  "009": {
    transcript: "The bear had claimed the elk. At that point the humans were just trying to leave the situation alive.",
    sourceTurns: ["t_067", "t_071"],
    emotions: [
      { label: "grim", score: 0.74, color: "#4ADE80" },
    ],
    signalTags: ["trend"],
  },
};

function NodeInspect({ node, allEdges, onClose }: { node: Node; allEdges: Edge[]; onClose: () => void }) {
  const d = node.data as any;
  const color = NODE_TYPE_COLORS[d.node_type] ?? "#71717A";
  const enrich = MOCK_ENRICHMENT[node.id] ?? {};

  const outgoing = allEdges.filter((e) => e.source === node.id && e.type !== "structural");
  const incoming = allEdges.filter((e) => e.target === node.id && e.type !== "structural");

  return (
    <>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label-caps">Node</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>node_{node.id}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}><X size={16} /></button>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Type + flags */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <span style={{ background: `${color}1f`, border: `1px solid ${color}4d`, fontFamily: "'Geist Mono', monospace", fontSize: 10, color, padding: "2px 6px", borderRadius: 3 }}>
            {d.node_type}
          </span>
          {d.flags && d.flags.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {d.flags.map((f: string) => (
                <span key={f} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-text-muted)" }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, color: "var(--color-text-muted)" }}>{f}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timestamps */}
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: "var(--color-text-secondary)" }}>
          {d.timeStart} → {d.timeEnd}
        </span>

        {/* Summary */}
        <Section label="Summary">
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>{d.summary}</p>
        </Section>

        {/* Transcript */}
        {enrich.transcript && (
          <Section label="Transcript">
            <div style={{ maxHeight: 120, overflowY: "auto", background: "var(--color-surface-2)", borderRadius: 6, padding: 10 }}>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>{enrich.transcript}</p>
            </div>
          </Section>
        )}

        {/* Source turns */}
        {enrich.sourceTurns && (
          <div style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: 16 }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>
              Source turns: {enrich.sourceTurns.join(", ")}
            </span>
          </div>
        )}

        {/* Emotions */}
        {enrich.emotions && (
          <Section label="Emotion evidence">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {enrich.emotions.map((em) => (
                <EmotionBar key={em.label} {...em} />
              ))}
            </div>
          </Section>
        )}

        {/* Audio events */}
        {enrich.audioEvents && enrich.audioEvents.length > 0 && (
          <Section label="Audio events">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {enrich.audioEvents.map((ev, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-amber)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)" }}>{ev.label}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>{ev.time}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Edges */}
        {(outgoing.length > 0 || incoming.length > 0) && (
          <Section label="Edges" extra={`${outgoing.length} outgoing · ${incoming.length} incoming`}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {outgoing.map((e) => (
                <div key={e.id} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--color-border-subtle)", alignItems: "center" }}>
                  <span style={{ color: EDGE_COLORS[e.type ?? "structural"], fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>→</span>
                  <span style={{ color: EDGE_COLORS[e.type ?? "structural"], fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{String(e.label ?? e.type)}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-primary)" }}>node_{e.target}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>[0.91]</span>
                </div>
              ))}
              {incoming.map((e) => (
                <div key={e.id} style={{ display: "flex", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--color-border-subtle)", alignItems: "center" }}>
                  <span style={{ color: EDGE_COLORS[e.type ?? "structural"], fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>←</span>
                  <span style={{ color: EDGE_COLORS[e.type ?? "structural"], fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{String(e.label ?? e.type)}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-primary)" }}>node_{e.source}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>[0.87]</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Clip candidates */}
        {enrich.clipCandidates && enrich.clipCandidates.length > 0 && (
          <Section label="In clip candidates">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {enrich.clipCandidates.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-amber)", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-primary)" }}>{c.id}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>rank {c.rank}</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)" }}>score {c.score}</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-violet)", cursor: "pointer", marginLeft: "auto" }}>View →</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Signal sources */}
        {enrich.signalTags && enrich.signalTags.length > 0 && (
          <Section label="Signal sources">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {enrich.signalTags.includes("trend") && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <TrendingUp size={14} color="#FB923C" />
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Trend</span>
                  </div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>
                    Query: "polar bear attack"<br />Relevance: 0.91
                  </div>
                </div>
              )}
              {enrich.signalTags.includes("comment") && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <MessageSquare size={14} color="#60A5FA" />
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Comment</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--color-comment)" }}>▸</span>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "var(--color-text-primary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>The "he smells meat" line instantly sold me on never getting near a polar bear.</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>2.4k</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: "var(--color-comment)" }}>▸</span>
                      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, color: "var(--color-text-primary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>The camp story is the clip I keep replaying. It escalates so fast.</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: "var(--color-text-muted)", flexShrink: 0 }}>1.1k</span>
                    </div>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: 12, color: "var(--color-violet)", cursor: "pointer" }}>Show all →</span>
                  </div>
                </div>
              )}
              {enrich.signalTags.includes("retention") && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <BarChart2 size={14} color="#4ADE80" />
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Retention</span>
                  </div>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
                    Peak at 5:09.3 · 94th percentile
                  </div>
                  <svg width={200} height={36} style={{ display: "block" }}>
                    <path
                      d="M0,30 C20,28 40,25 60,20 C80,15 100,8 120,5 C140,3 150,4 160,10 C180,18 190,24 200,28"
                      fill="none"
                      stroke="#4ADE80"
                      strokeWidth={1.5}
                    />
                    <circle cx={120} cy={5} r={5} fill="#4ADE80" />
                    <text x={120} y={-2} textAnchor="middle" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 9, fill: "var(--color-text-muted)" }}>peak</text>
                  </svg>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>
    </>
  );
}

function EdgeInspect({ edge, onClose }: { edge: Edge; onClose: () => void }) {
  const color = EDGE_COLORS[edge.type ?? "structural"] ?? "#302D35";
  return (
    <>
      <div style={{ padding: 16, borderBottom: "1px solid var(--color-border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="label-caps">Edge</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{edge.id}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}><X size={16} /></button>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 15, color }}>{String(edge.label ?? edge.type)}</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-primary)" }}>node_{edge.source} → node_{edge.target}</span>
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: "var(--color-text-secondary)" }}>Confidence: 0.87</span>
        <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: 12 }}>
          <span className="label-caps" style={{ marginBottom: 6, display: "block" }}>Rationale</span>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-primary)", lineHeight: 1.6, margin: 0 }}>
            The source node provides foundational reasoning that the target node directly builds upon, creating a strong rhetorical dependency.
          </p>
        </div>
      </div>
    </>
  );
}

export default function InspectPanel(props: InspectPanelProps) {
  const isOpen = props.selectedNode !== null || props.selectedEdge !== null;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 360,
        zIndex: 30,
        pointerEvents: "auto",
        background: "var(--color-surface-1)",
        borderLeft: "1px solid var(--color-border)",
        overflowY: "auto",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 200ms ease-in-out",
      }}
    >
      {props.selectedNode && <NodeInspect node={props.selectedNode} allEdges={props.allEdges} onClose={props.onClose} />}
      {props.selectedEdge && !props.selectedNode && <EdgeInspect edge={props.selectedEdge} onClose={props.onClose} />}
    </div>
  );
}
