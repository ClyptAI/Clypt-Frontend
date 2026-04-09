import { useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import RunContextBar from "@/components/app/RunContextBar";
import { EmbedScatter, EmbedToolbar, EmbedInspectPanel } from "@/components/embeds";
import type { EmbedType } from "@/components/embeds";
import { useEmbeddings } from "@/hooks/api/useEmbeddings";
import type { EmbedPoint } from "@/hooks/api/useEmbeddings";
import { useRunDetail } from "@/hooks/api/useRuns";

// Legend type list
const LEGEND_TYPES: Array<{ type: string; color: string }> = [
  { type: "claim",             color: "#A78BFA" },
  { type: "anecdote",          color: "#FBB249" },
  { type: "reveal",            color: "#FACC15" },
  { type: "qa_exchange",       color: "#38BDF8" },
  { type: "challenge_exchange",color: "#FB923C" },
  { type: "explanation",       color: "#60A5FA" },
  { type: "reaction_beat",     color: "#4ADE80" },
  { type: "setup_payoff",      color: "#FB923C" },
  { type: "hook",              color: "#4ADE80" },
  { type: "insight",           color: "#A78BFA" },
  { type: "conflict",          color: "#EF4444" },
  { type: "transition",        color: "#71717A" },
];

export default function RunEmbeds() {
  const { id: runId = "" } = useParams<{ id: string }>();
  const { data: runDetail } = useRunDetail(runId);
  const { data: embedData, isLoading } = useEmbeddings(runId);

  const [embedType, setEmbedType] = useState<EmbedType>("semantic");
  const [selectedNode, setSelectedNode] = useState<EmbedPoint | null>(null);

  // Toolbar → scatter communication
  const [fitSignal, setFitSignal] = useState(0);
  const zoomDeltaRef = useRef<number>(0);
  const [zoomDelta, setZoomDelta] = useState<number>(0);

  const handleFitView = useCallback(() => setFitSignal((n) => n + 1), []);
  const handleZoomIn = useCallback(() => setZoomDelta(0.25), []);
  const handleZoomOut = useCallback(() => setZoomDelta(-0.25), []);
  const handleZoomHandled = useCallback(() => setZoomDelta(0), []);

  const points = embedData?.[embedType] ?? [];
  const candidateCount = points.filter((p) => p.is_candidate).length;

  const typesPresent = new Set(points.map((p) => p.node_type));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        background: "#0A0909",
      }}
    >
      {/* Context bar */}
      <RunContextBar
        runId={runId}
        runName={runDetail?.display_name ?? "Run"}
        videoUrl={runDetail?.source_url ?? ""}
        currentPhase={runDetail?.current_phase ?? 2}
        completedPhases={runDetail?.completed_phases ?? 0}
      />

      {/* Main area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {isLoading ? (
          <LoadingState />
        ) : points.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Toolbar */}
            <EmbedToolbar
              embedType={embedType}
              onEmbedTypeChange={(t) => { setEmbedType(t); setFitSignal((n) => n + 1); }}
              nodeCount={points.length}
              candidateCount={candidateCount}
              onFitView={handleFitView}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />

            {/* Scatter plot */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                right: selectedNode ? 340 : 0,
                transition: "right 200ms ease-in-out",
              }}
            >
              <EmbedScatter
                points={points}
                selectedId={selectedNode?.node_id ?? null}
                onSelect={setSelectedNode}
                fitSignal={fitSignal}
                zoomDelta={zoomDelta}
                onZoomHandled={handleZoomHandled}
              />
            </div>

            {/* Legend — bottom left */}
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                zIndex: 20,
                background: "rgba(10,9,9,0.85)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {LEGEND_TYPES.filter((l) => typesPresent.has(l.type)).map((l) => (
                <div key={l.type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: l.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {l.type}
                  </span>
                </div>
              ))}
              {/* Candidate indicator */}
              {candidateCount > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginTop: 3, paddingTop: 5, display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      border: "1px solid rgba(251,178,73,0.6)",
                      background: "transparent",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: 10,
                      color: "rgba(251,178,73,0.6)",
                    }}
                  >
                    clip candidate
                  </span>
                </div>
              )}
            </div>

            {/* Inspect panel */}
            <EmbedInspectPanel
              node={selectedNode}
              runId={runId}
              onClose={() => setSelectedNode(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: "2px solid var(--color-border)",
          borderTopColor: "var(--color-violet)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <span
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 12,
          color: "var(--color-text-muted)",
        }}
      >
        Loading embeddings…
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(167,139,250,0.1)",
          border: "1px solid rgba(167,139,250,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Sparkles size={20} color="#A78BFA" />
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--color-text-primary)",
            margin: "0 0 6px 0",
          }}
        >
          Embeddings not yet available
        </p>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 13,
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          The embedding space will appear once Phase 2 completes.
        </p>
      </div>
    </div>
  );
}
