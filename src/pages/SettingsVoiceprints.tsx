import { useState } from "react";
import { Mic, Upload, Play, Trash2 } from "lucide-react";

interface Voiceprint {
  id: string;
  name: string;
  source: string;
  added: string;
}

const MOCK: Voiceprint[] = [
  { id: "1", name: "Rithvik — Host", source: "Recorded sample", added: "3 Apr 2026" },
  { id: "2", name: "Guest (unnamed)", source: "Confirmed in run 20260328", added: "28 Mar 2026" },
];

export default function SettingsVoiceprints() {
  const [voiceprints, setVoiceprints] = useState(MOCK);
  const [vpName, setVpName] = useState("");
  const [recorded, setRecorded] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    padding: "0 12px",
    borderRadius: 6,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface-2)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 400,
    fontSize: 14,
    color: "var(--color-text-primary)",
    outline: "none",
  };

  const colHeader: React.CSSProperties = {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 500,
    fontSize: 11,
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 24, color: "var(--color-text-primary)", margin: 0, marginBottom: 6 }}>
        Voiceprint Registry
      </h1>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 15, color: "var(--color-text-secondary)", margin: 0, marginBottom: 32, maxWidth: 640 }}>
        Registered voiceprints help Clypt auto-identify recurring speakers in future runs. Identification suggestions are always opt-in — you review and approve matches before they apply.
      </p>

      {/* Add voiceprint card */}
      <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 15, color: "var(--color-text-primary)", margin: 0, marginBottom: 16 }}>Add a voiceprint</h3>

        <div style={{ display: "flex", gap: 12 }}>
          {/* Record card */}
          <button
            onClick={() => setRecorded(true)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16,
              background: recorded ? "var(--color-violet-muted)" : "var(--color-surface-2)",
              border: recorded ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--color-border)",
              borderRadius: 6, cursor: "pointer", transition: "border-color 100ms",
            }}
          >
            <Mic size={22} style={{ color: "var(--color-violet)" }} />
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>Record sample</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>15–30s</span>
          </button>

          {/* Upload card */}
          <button
            onClick={() => setRecorded(true)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16,
              background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: 6, cursor: "pointer",
            }}
          >
            <Upload size={22} style={{ color: "var(--color-violet)" }} />
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)" }}>Upload clip</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>MP3 or WAV</span>
          </button>
        </div>

        <div style={{ marginTop: 16, maxWidth: 280, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)" }}>Name</label>
          <input placeholder="e.g. Rithvik — Host" value={vpName} onChange={(e) => setVpName(e.target.value)} style={inputStyle} />
        </div>

        <button
          disabled={!vpName || !recorded}
          style={{
            marginTop: 16, padding: "10px 24px", borderRadius: 6, border: "none",
            background: vpName && recorded ? "var(--color-violet)" : "var(--color-surface-3)",
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14,
            color: vpName && recorded ? "#0A0909" : "var(--color-text-muted)",
            cursor: vpName && recorded ? "pointer" : "not-allowed",
          }}
        >Save voiceprint</button>
      </div>

      {/* Voiceprint table */}
      {voiceprints.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "60px 0" }}>
          <Mic size={40} style={{ color: "var(--color-surface-3)" }} />
          <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--color-text-primary)" }}>No voiceprints registered yet</span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 14, color: "var(--color-text-muted)" }}>Record or upload a voice sample to get started.</span>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div style={{ display: "flex", padding: "8px 12px", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <span style={{ ...colHeader, flex: 1 }}>Name</span>
            <span style={{ ...colHeader, width: 180 }}>Source</span>
            <span style={{ ...colHeader, width: 120 }}>Added</span>
            <span style={{ ...colHeader, width: 100 }}>Actions</span>
          </div>

          {/* Rows */}
          {voiceprints.map((vp) => (
            <div
              key={vp.id}
              style={{
                display: "flex", padding: "12px 12px", borderBottom: "1px solid var(--color-border-subtle)",
                alignItems: "center", transition: "background 100ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-violet-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Mic size={14} style={{ color: "var(--color-violet)" }} />
                </div>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{vp.name}</span>
              </div>
              <span style={{ width: 180, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 13, color: "var(--color-text-secondary)" }}>{vp.source}</span>
              <span style={{ width: 120, fontFamily: "'Geist Mono', monospace", fontSize: 12, color: "var(--color-text-muted)" }}>{vp.added}</span>
              <div style={{ width: 100, display: "flex", gap: 8 }}>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--color-text-muted)" }}>
                  <Play size={13} />
                </button>
                <button
                  onClick={() => setVoiceprints((prev) => prev.filter((v) => v.id !== vp.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", color: "var(--color-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
