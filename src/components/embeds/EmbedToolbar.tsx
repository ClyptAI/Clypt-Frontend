import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

export type EmbedType = "semantic" | "multimodal";

interface EmbedToolbarProps {
  embedType: EmbedType;
  onEmbedTypeChange: (t: EmbedType) => void;
  nodeCount: number;
  candidateCount: number;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function Divider() {
  return <div style={{ width: 1, height: 20, background: "var(--color-border)", flexShrink: 0 }} />;
}

function IconBtn({ onClick, children, title }: { onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 4,
        border: "none",
        background: "transparent",
        color: "var(--color-text-secondary)",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export default function EmbedToolbar({
  embedType,
  onEmbedTypeChange,
  nodeCount,
  candidateCount,
  onFitView,
  onZoomIn,
  onZoomOut,
}: EmbedToolbarProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        background: "var(--color-surface-1)",
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        padding: "5px 10px",
        display: "flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {/* Embedding type toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--color-surface-2)",
          borderRadius: 6,
          padding: 2,
          gap: 2,
        }}
      >
        {(["semantic", "multimodal"] as EmbedType[]).map((t) => (
          <button
            key={t}
            onClick={() => onEmbedTypeChange(t)}
            style={{
              padding: "3px 10px",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 500,
              fontSize: 12,
              transition: "all 100ms",
              background: embedType === t ? "var(--color-surface-3)" : "transparent",
              color: embedType === t ? "var(--color-text-primary)" : "var(--color-text-muted)",
              boxShadow: embedType === t ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
            }}
          >
            {t === "semantic" ? "Semantic" : "Multimodal"}
          </button>
        ))}
      </div>

      <Divider />

      {/* Node count chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12,
            color: "var(--color-text-muted)",
          }}
        >
          {nodeCount} nodes
        </span>
        {candidateCount > 0 && (
          <>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-text-muted)", flexShrink: 0 }} />
            <span
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 12,
                color: "#FBB249",
              }}
            >
              {candidateCount} candidates
            </span>
          </>
        )}
      </div>

      <Divider />

      {/* Zoom controls */}
      <IconBtn onClick={onZoomOut} title="Zoom out"><ZoomOut size={14} /></IconBtn>
      <IconBtn onClick={onZoomIn} title="Zoom in"><ZoomIn size={14} /></IconBtn>
      <IconBtn onClick={onFitView} title="Fit to view"><Maximize2 size={14} /></IconBtn>
    </div>
  );
}
