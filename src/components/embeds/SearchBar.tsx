import { useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  hasResults?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  onClear,
  isSearching = false,
  hasResults = false,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K focuses the bar
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        if (value) onClear();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [value, onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && value.trim()) onSearch(value.trim());
    },
    [value, onSearch],
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        pointerEvents: "auto",
        width: "min(600px, calc(100vw - 48px))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "rgba(18,16,16,0.92)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${hasResults ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 12,
          padding: "10px 14px",
          boxShadow: hasResults
            ? "0 0 0 1px rgba(167,139,250,0.15), 0 8px 32px rgba(0,0,0,0.5)"
            : "0 4px 24px rgba(0,0,0,0.4)",
          transition: "border-color 200ms, box-shadow 200ms",
        }}
      >
        {/* Icon */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {isSearching ? (
            <Loader2 size={16} color="rgba(167,139,250,0.8)" style={{ animation: "spin 0.8s linear infinite" }} />
          ) : (
            <Search size={16} color={value ? "rgba(167,139,250,0.8)" : "rgba(255,255,255,0.3)"} />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search moments in this video…"
          style={{
            flex: 1,
            background: "none",
            border: "none",
            outline: "none",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: "rgba(255,255,255,0.9)",
            caretColor: "#A78BFA",
          }}
        />

        {/* Right side: shortcut hint OR clear button */}
        {value ? (
          <button
            onClick={onClear}
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.5)",
              transition: "background 120ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
          >
            <X size={11} />
          </button>
        ) : (
          <kbd
            style={{
              flexShrink: 0,
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: "rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              padding: "2px 5px",
              whiteSpace: "nowrap",
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>
    </div>
  );
}
