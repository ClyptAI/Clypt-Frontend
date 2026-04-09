import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateRun } from "@/hooks/api/useRuns";

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]{11}/;

type Quality = "fast" | "balanced" | "high";

interface NewRunLocationState {
  url?: string;
}

export default function NewRun() {
  const navigate = useNavigate();
  const location = useLocation();
  const createRun = useCreateRun();

  // Let callers (e.g., the onboarding "Analyze" step) prefill the URL via
  // router state so the first run kicks off without retyping.
  const prefilledUrl = (location.state as NewRunLocationState | null)?.url ?? "";
  const [url, setUrl] = useState(prefilledUrl);
  const [urlTouched, setUrlTouched] = useState(false);
  const [runName, setRunName] = useState("");
  const [runNameTouched, setRunNameTouched] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [commentClusters, setCommentClusters] = useState(true);
  const [retention, setRetention] = useState(false);
  const [trends, setTrends] = useState(false);
  const [quality, setQuality] = useState<Quality>("balanced");
  const [videoMeta, setVideoMeta] = useState<{ title: string; duration: string } | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);

  const isValid = YOUTUBE_REGEX.test(url.trim());
  const showError = urlTouched && url.trim().length > 0 && !isValid;
  const showPreview = urlTouched && isValid;

  async function fetchVideoMeta(videoUrl: string) {
    setMetaLoading(true);
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
      const res = await fetch(oembedUrl);
      if (!res.ok) throw new Error("oEmbed failed");
      const data = await res.json();
      setVideoMeta({ title: data.title ?? "", duration: "" });
      if (!runNameTouched && data.title) setRunName(data.title);
    } catch {
      setVideoMeta(null);
    } finally {
      setMetaLoading(false);
    }
  }

  const handleUrlBlur = useCallback(() => {
    setUrlTouched(true);
    if (YOUTUBE_REGEX.test(url.trim())) {
      fetchVideoMeta(url.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, runNameTouched]);

  // If the URL came in via router state, treat it as already "touched" so the
  // preview/validation renders immediately without waiting for a blur event.
  useEffect(() => {
    if (prefilledUrl && YOUTUBE_REGEX.test(prefilledUrl.trim())) {
      setUrlTouched(true);
      fetchVideoMeta(prefilledUrl.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilledUrl]);

  const handleSubmit = () => {
    if (!isValid || createRun.isPending) return;
    createRun.mutate(
      { sourceUrl: url.trim(), displayName: runName.trim() || undefined },
      {
        onSuccess: (run) => {
          toast.success("Run started!");
          navigate(`/runs/${run.run_id}`);
        },
        onError: () => {
          toast.error("Failed to start run. Check the URL and try again.");
        },
      }
    );
  };

  const qualities: { key: Quality; label: string }[] = [
    { key: "fast", label: "Fast draft" },
    { key: "balanced", label: "Balanced" },
    { key: "high", label: "High quality" },
  ];

  return (
    <div className="max-w-[600px] mx-auto" style={{ padding: "48px 24px" }}>
      {/* Header */}
      <h1 className="font-heading font-bold text-[28px] text-[var(--color-text-primary)]">
        New run
      </h1>
      <p className="font-sans text-[15px] text-[var(--color-text-secondary)] mt-[6px]">
        Analyze any YouTube video and extract its best moments.
      </p>

      {/* Form */}
      <div className="flex flex-col gap-[28px] mt-[32px]">
        {/* Field 1 — YouTube URL */}
        <div>
          <label className="block font-heading font-medium text-[13px] text-[var(--color-text-primary)] mb-[8px]">
            YouTube video URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={handleUrlBlur}
            placeholder="youtube.com/watch?v=..."
            className="w-full h-[48px] px-[14px] rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[15px] font-sans text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-violet)] focus:outline-none transition-colors"
          />
          {showError && (
            <p className="font-sans text-[13px] text-[var(--color-rose)] mt-[6px]">
              Please enter a valid YouTube video URL.
            </p>
          )}
          {showPreview && (
            <div className="flex items-center gap-[10px] mt-[10px]">
              <div className="w-[48px] h-[27px] rounded-[4px] bg-[var(--color-surface-3)] shrink-0" />
              <div className="flex-1 min-w-0">
                {metaLoading ? (
                  <div className="h-3 w-32 rounded animate-pulse" style={{ background: "var(--color-surface-2)" }} />
                ) : (
                  <p className="font-heading font-medium text-[14px] text-[var(--color-text-primary)] truncate">
                    {videoMeta?.title ?? url}
                  </p>
                )}
              </div>
              {!metaLoading && <Check size={14} className="text-[var(--color-green)] shrink-0" />}
            </div>
          )}
          {urlTouched && isValid && !metaLoading && !videoMeta && (
            <p className="font-mono text-[11px] mt-[6px]" style={{ color: "var(--color-text-muted)" }}>
              Could not fetch video info — the URL looks valid, continuing anyway.
            </p>
          )}
        </div>

        {/* Field 2 — Run name */}
        <div>
          <div className="flex items-center justify-between mb-[8px]">
            <label className="font-heading font-medium text-[13px] text-[var(--color-text-primary)]">
              Run name
            </label>
            <span className="label-caps">Optional</span>
          </div>
          <input
            type="text"
            value={runName}
            onChange={(e) => {
              setRunName(e.target.value);
              setRunNameTouched(true);
            }}
            placeholder="e.g. Lex ep. 412 — Sam Altman"
            className="w-full h-[40px] px-[14px] rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[15px] font-sans text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-violet)] focus:outline-none transition-colors"
          />
          <p className="font-sans text-[12px] text-[var(--color-text-muted)] mt-[6px]">
            Pre-filled from the video title. Edit to something shorter.
          </p>
        </div>

        {/* Field 3 — User query (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setQueryOpen(!queryOpen)}
            className="flex items-center gap-[8px] w-full"
          >
            <ChevronRight
              size={16}
              className="text-[var(--color-text-muted)] transition-transform shrink-0"
              style={{ transform: queryOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            />
            <span className="font-heading font-medium text-[14px] text-[var(--color-text-secondary)]">
              Add a specific request
            </span>
            <span className="ml-auto font-heading font-medium text-[10px] text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[4px] px-[6px] py-[2px]">
              Optional
            </span>
          </button>
          {queryOpen && (
            <div className="mt-[12px]">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find moments where the host pushes back on the guest's claim"
                className="w-full h-[80px] px-[14px] py-[10px] rounded-[6px] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[14px] font-sans text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-violet)] focus:outline-none resize-none transition-colors"
              />
              <p className="font-sans text-[12px] text-[var(--color-text-muted)] mt-[6px]">
                This guides clip retrieval in Phase 4. Leave blank for automatic discovery.
              </p>
            </div>
          )}
        </div>

        {/* Field 4 — Advanced source signals (collapsible) */}
        <div>
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-[8px] w-full"
          >
            <ChevronRight
              size={16}
              className="text-[var(--color-text-muted)] transition-transform shrink-0"
              style={{ transform: advancedOpen ? "rotate(90deg)" : "rotate(0deg)" }}
            />
            <span className="font-heading font-medium text-[14px] text-[var(--color-text-secondary)]">
              Advanced — source signals
            </span>
          </button>
          {advancedOpen && (
            <div className="flex flex-col gap-[12px] mt-[12px]">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <span className="font-heading font-medium text-[14px] text-[var(--color-text-primary)]">
                    Comment clusters
                  </span>
                  <span className="font-sans text-[12px] text-[var(--color-text-muted)]">
                    Seed retrieval from high-engagement comment regions
                  </span>
                </div>
                <Switch checked={commentClusters} onCheckedChange={setCommentClusters} />
              </div>
              {/* Toggle 2 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <span className="font-heading font-medium text-[14px] text-[var(--color-text-primary)]">
                    Retention data
                  </span>
                  <span className="font-sans text-[12px] text-[var(--color-text-muted)]">
                    Surface peaks from YouTube Analytics if connected ·{" "}
                    <span className="text-[var(--color-violet)] cursor-pointer hover:underline">
                      Connect in Settings →
                    </span>
                  </span>
                </div>
                <Switch checked={retention} onCheckedChange={setRetention} disabled />
              </div>
              {/* Toggle 3 */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-[2px]">
                  <span className="font-heading font-medium text-[14px] text-[var(--color-text-primary)]">
                    Trend signals
                  </span>
                  <span className="font-sans text-[12px] text-[var(--color-text-muted)]">
                    Boost nodes aligned to current trends
                  </span>
                </div>
                <Switch checked={trends} onCheckedChange={setTrends} />
              </div>
            </div>
          )}
        </div>

        {/* Field 5 — Quality target */}
        <div>
          <label className="block font-heading font-medium text-[13px] text-[var(--color-text-primary)] mb-[8px]">
            Processing quality
          </label>
          <div className="flex rounded-[6px] border border-[var(--color-border)] overflow-hidden">
            {qualities.map((q, i) => (
              <button
                key={q.key}
                type="button"
                onClick={() => setQuality(q.key)}
                className={`flex-1 h-[40px] font-heading text-[14px] transition-colors ${
                  i > 0 ? "border-l border-[var(--color-border)]" : ""
                } ${
                  quality === q.key
                    ? "bg-[var(--color-violet)] text-[#0A0909] font-semibold"
                    : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-3)]"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || createRun.isPending}
          className="w-full h-[48px] font-heading font-semibold text-[16px]"
          variant="default"
        >
          {createRun.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Starting…
            </>
          ) : (
            "Start run →"
          )}
        </Button>
      </div>
    </div>
  );
}
