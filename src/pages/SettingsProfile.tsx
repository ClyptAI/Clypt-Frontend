import { useState } from "react";
import { Upload, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SettingsProfile() {
  const [name, setName] = useState("Rithvik");
  const [email, setEmail] = useState("rithvik@example.com");

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

  return (
    <div>
      <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 24, color: "var(--color-text-primary)", margin: 0, marginBottom: 32 }}>
        Profile
      </h1>

      {/* Account section */}
      <span className="label-caps" style={{ display: "block", marginBottom: 16 }}>Account</span>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
        {/* Display name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)" }}>Display name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)" }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        </div>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)" }}>Profile photo</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-surface-3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--color-text-secondary)" }}>R</span>
            </div>
            <button
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6,
                border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer",
                fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-secondary)",
              }}
            >
              <Upload size={14} />Upload photo
            </button>
          </div>
        </div>

        <button
          onClick={() => toast.success("Changes saved")}
          style={{
            padding: "10px 24px", borderRadius: 6, border: "none", background: "var(--color-violet)",
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "#0A0909",
            cursor: "pointer", alignSelf: "flex-start", marginTop: 8,
          }}
        >Save changes</button>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--color-border-subtle)", margin: "32px 0" }} />

      {/* Connected channels */}
      <span className="label-caps" style={{ display: "block", marginBottom: 16 }}>YouTube channels</span>

      <div style={{ border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-surface-1)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--color-surface-3)", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>The Rithvik Show</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)" }}>@therithvikshow</span>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-green)" }} />
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-green)" }}>Connected</span>
            </div>
          </div>
        </div>
        <button
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-muted)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >Disconnect</button>
      </div>

      <button
        style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 6,
          border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer",
          fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, fontSize: 13, color: "var(--color-text-primary)",
          marginTop: 12,
        }}
      >+ Add another channel</button>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--color-border-subtle)", margin: "32px 0" }} />

      {/* API key */}
      <span className="label-caps" style={{ display: "block", marginBottom: 16 }}>API key</span>

      <div style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 480 }}>
        <input
          readOnly
          type="password"
          value="clypt_sk_••••••••••••••••••1a2b"
          style={{ ...inputStyle, flex: 1, fontFamily: "'Geist Mono', monospace", fontSize: 13, background: "var(--color-surface-2)" }}
        />
        <button
          onClick={() => toast.success("API key copied")}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "var(--color-text-muted)" }}
        ><Copy size={14} /></button>
        <button
          style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-rose)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        ><RefreshCw size={14} /></button>
      </div>
      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}>
        Keep this key secret. It grants full API access to your account.
      </p>
    </div>
  );
}
