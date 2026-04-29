import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Disc3,
  MoreVertical,
  Play,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Twitter,
  Youtube,
} from "lucide-react";
import {
  BaseEdge,
  getBezierPath,
  ReactFlow,
  ReactFlowProvider,
  type Edge,
  type EdgeProps,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import SemanticNode from "@/components/graph/SemanticNode";
import {
  LongRangeEdge,
  ModerateRhetoricalEdge,
  StrongRhetoricalEdge,
} from "@/components/graph/edges";
import { getLandingClipPosterSrc, landingHeroImageSrc, landingPosterSrc } from "./landingMedia";

type HeroPhase = "idle" | "analysis" | "generation" | "fanout" | "ranking" | "settled";
type ClipPlatform = "youtube" | "tiktok" | "x";

interface GeneratedClip {
  id: string;
  score: number;
  platform: ClipPlatform;
  image: string;
  isTopMatch: boolean;
}

const analysisScanDuration = 1250;
const graphPreviewDuration = 1500;
const rankingLiftDuration = 1800;

const phaseTimeline: Array<{ phase: HeroPhase; duration: number }> = [
  { phase: "idle", duration: 1000 },
  { phase: "analysis", duration: analysisScanDuration },
  { phase: "generation", duration: graphPreviewDuration },
  { phase: "fanout", duration: 800 },
  { phase: "ranking", duration: rankingLiftDuration },
];

const generatedClips: GeneratedClip[] = [
  {
    id: "clip-1",
    score: 88,
    platform: "youtube",
    image: getLandingClipPosterSrc("sg_0002_cand_01_vertical_rfdetr_karaoke"),
    isTopMatch: false,
  },
  {
    id: "clip-2",
    score: 94,
    platform: "youtube",
    image: getLandingClipPosterSrc("sg_0003_cand_01_vertical_rfdetr_karaoke"),
    isTopMatch: false,
  },
  {
    id: "clip-3",
    score: 99,
    platform: "youtube",
    image: landingPosterSrc.heroFanoutCenter,
    isTopMatch: true,
  },
  {
    id: "clip-4",
    score: 91,
    platform: "youtube",
    image: getLandingClipPosterSrc("sg_0005_cand_01_vertical_rfdetr_karaoke"),
    isTopMatch: false,
  },
  {
    id: "clip-5",
    score: 85,
    platform: "youtube",
    image: landingPosterSrc.heroFanoutSide,
    isTopMatch: false,
  },
];

const graphNodes: Node[] = [
  {
    id: "1",
    type: "semantic",
    position: { x: 18, y: 150 },
    data: {
      node_type: "claim",
      summary: "Fear grizzlies by default",
      signalTags: ["trend"],
      timeStart: "00:18",
      timeEnd: "00:42",
    },
  },
  {
    id: "2",
    type: "semantic",
    position: { x: 238, y: 62 },
    data: {
      node_type: "explanation",
      summary: "A 900-pound wild dog",
      signalTags: [],
      timeStart: "00:43",
      timeEnd: "01:06",
    },
  },
  {
    id: "3",
    type: "semantic",
    position: { x: 238, y: 262 },
    data: {
      node_type: "setup_payoff",
      summary: "Fresh bear sign by the elk",
      signalTags: ["trend", "retention"],
      timeStart: "01:07",
      timeEnd: "01:34",
    },
  },
  {
    id: "4",
    type: "semantic",
    position: { x: 486, y: 162 },
    data: {
      node_type: "anecdote",
      summary: "Ice-raft story turns fatal",
      signalTags: ["retention"],
      timeStart: "01:35",
      timeEnd: "02:05",
    },
  },
  {
    id: "5",
    type: "semantic",
    position: { x: 734, y: 262 },
    data: {
      node_type: "reaction_beat",
      summary: "Camp erupts when it charges",
      signalTags: ["comment", "retention"],
      clipWorthy: true,
      timeStart: "02:06",
      timeEnd: "02:28",
    },
  },
  {
    id: "7",
    type: "semantic",
    position: { x: 734, y: 62 },
    data: {
      node_type: "insight",
      summary: "Not top of the food chain",
      signalTags: ["retention"],
      timeStart: "02:29",
      timeEnd: "02:58",
    },
  },
  {
    id: "8",
    type: "semantic",
    position: { x: 976, y: 162 },
    data: {
      node_type: "topic_shift",
      summary: "Back to elk hunting",
      signalTags: ["trend"],
      timeStart: "02:59",
      timeEnd: "03:17",
    },
  },
];

const heroGraphNodes: Node[] = graphNodes.map((node) => ({
  ...node,
  data: {
    ...node.data,
    surfaceOpacity: 0.78,
    tintOpacity: 0.24,
    tintFadeOpacity: 0.1,
    backdropBlur: 2,
  },
}));

const graphEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "structural",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "elaborates",
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "structural",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "grounds",
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    type: "moderate",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "escalates",
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "longrange",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "sets_up",
    data: { dashed: true },
  },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    type: "structural",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "reaction_to",
  },
  {
    id: "e4-7",
    source: "4",
    target: "7",
    type: "strong",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "reframes",
  },
  {
    id: "e5-8",
    source: "5",
    target: "8",
    type: "strong",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "transitions",
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    type: "moderate",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "pays_off",
  },
  {
    id: "e7-8",
    source: "7",
    target: "8",
    type: "structural",
    sourceHandle: "source-right",
    targetHandle: "target-left",
    label: "narrows",
  },
];

const nodeTypes = { semantic: SemanticNode };
const HeroStructuralEdge = memo(function HeroStructuralEdge(props: EdgeProps) {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.24,
  });

  return (
    <BaseEdge
      {...props}
      path={path}
      style={{
        stroke: "rgba(214,211,220,0.5)",
        strokeWidth: 1.35,
        filter: "drop-shadow(0 0 3px rgba(214,211,220,0.16))",
      }}
    />
  );
});

const edgeTypes = {
  structural: HeroStructuralEdge,
  strong: StrongRhetoricalEdge,
  moderate: ModerateRhetoricalEdge,
  longrange: LongRangeEdge,
};

const stageWidth = 1152;
const stageHeight = 1100;
const graphTop = 262;
const graphHeight = 500;
const graphHorizontalBleed = 150;

function useSequencedPhase(reducedMotion: boolean | null): HeroPhase {
  const [phase, setPhase] = useState<HeroPhase>(reducedMotion ? "settled" : "idle");

  useEffect(() => {
    if (reducedMotion) {
      setPhase("settled");
      return;
    }

    setPhase("idle");

    const timeoutIds: Array<ReturnType<typeof window.setTimeout>> = [];
    let elapsed = 0;

    phaseTimeline.forEach(({ duration }, index) => {
      elapsed += duration;
      const nextPhase = phaseTimeline[index + 1]?.phase ?? "settled";
      timeoutIds.push(window.setTimeout(() => setPhase(nextPhase), elapsed));
    });

    return () => {
      timeoutIds.forEach(window.clearTimeout);
    };
  }, [reducedMotion]);

  return phase;
}

function InputCluster({ phase }: { phase: HeroPhase }) {
  const isAnalysis = phase === "analysis";

  return (
    <div className="relative z-30 mx-auto mt-0 flex w-full max-w-2xl flex-col items-center px-4">
      <div className="relative w-full max-w-[480px]">
        <motion.div
          className="relative z-20 aspect-video w-full overflow-hidden rounded-xl border bg-[var(--color-surface-2)] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            boxShadow: isAnalysis
              ? "0 0 50px color-mix(in srgb, var(--color-violet) 25%, transparent)"
              : "0 8px 30px rgba(0,0,0,0.5)",
            borderColor: isAnalysis
              ? "color-mix(in srgb, var(--color-violet) 52%, transparent)"
              : "var(--color-border)",
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img
            src={landingHeroImageSrc.groundedRogan}
            alt=""
            className="h-full w-full object-cover opacity-80"
            draggable={false}
          />
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md">
              <Play className="ml-1 h-6 w-6 fill-white text-white" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 z-10 rounded border border-white/10 bg-black/70 px-2 py-1 font-mono text-[13px] tracking-wide text-[var(--color-text-primary)] backdrop-blur-md">
            13:08
          </div>

          <AnimatePresence>
            {isAnalysis && (
              <motion.div
                className="absolute inset-0 z-20 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="absolute left-0 right-0 h-[2px] bg-[var(--color-violet)] shadow-[0_0_20px_4px_rgba(167,139,250,0.6)]"
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: analysisScanDuration / 1000, ease: "linear" }}
                />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                  <div className="flex h-3 items-end gap-1">
                    <motion.div
                      className="w-1 origin-bottom rounded-sm bg-[var(--color-violet)]"
                      animate={{ height: ["40%", "100%", "40%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    />
                    <motion.div
                      className="w-1 origin-bottom rounded-sm bg-[var(--color-violet)]"
                      animate={{ height: ["70%", "30%", "70%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-1 origin-bottom rounded-sm bg-[var(--color-violet)]"
                      animate={{ height: ["30%", "100%", "30%"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    />
                  </div>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-[var(--color-violet)]">
                    Analyzing Signals...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute -left-[10%] top-1/2 z-30 flex w-[120%] -translate-y-1/2 justify-between">
        <motion.div
          initial={{ opacity: 0, x: -120, y: 0, rotate: -5 }}
          animate={{
            opacity: 1,
            x: -60,
            y: 30,
            rotate: -4,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.3 }}
        >
          <div className="relative flex w-[260px] flex-col gap-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-2)_90%,transparent)] p-4 shadow-xl backdrop-blur-xl">
            <div className="absolute left-0 top-0 h-full w-1 bg-[var(--color-comment)]" />
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={landingHeroImageSrc.jayVenturaAvatar}
                  alt=""
                  className="h-7 w-7 flex-shrink-0 rounded-full border border-white/10 object-cover"
                  draggable={false}
                />
                <div className="flex flex-col">
                  <span className="font-sans text-[12px] font-semibold leading-none text-[var(--color-text-primary)]">
                    @JayVentura
                  </span>
                  <span className="mt-1 text-[10px] text-[var(--color-text-secondary)]">3 yrs ago</span>
                </div>
              </div>
            </div>
            <p className="mt-0.5 font-sans text-[13px] leading-relaxed text-[var(--color-text-primary)]">
              "Joe's animal impressions should be stored in a time capsule so future generations can really understand what it was like during this era"
            </p>
            <div className="mt-1 flex items-center gap-3 text-[var(--color-text-secondary)]">
              <div className="flex items-center gap-1 text-[11px]">
                <ThumbsUp className="h-3.5 w-3.5" />
                1.4k
              </div>
              <ThumbsDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 120, y: 0, rotate: 5 }}
          animate={{
            opacity: 1,
            x: 60,
            y: 50,
            rotate: 4,
          }}
          transition={{ type: "spring", stiffness: 180, damping: 20, delay: 0.5 }}
        >
          <div className="relative flex w-[240px] flex-col gap-2 overflow-hidden rounded-xl bg-white p-4 text-[rgb(32,33,36)] shadow-xl">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-sans text-xs font-medium tracking-wide text-[rgb(60,64,67)]">Google Trends</span>
              <MoreVertical className="ml-auto h-4 w-4 text-[rgb(112,117,122)]" />
            </div>
            <h3 className="font-sans text-[15px] font-medium leading-tight text-[rgb(32,33,36)]">
              Interest over time
            </h3>
            <div className="flex items-center gap-2 font-sans text-[22px] font-semibold text-[rgb(32,33,36)]">
              Bears
              <div className="flex items-center gap-1 rounded-md bg-[rgb(230,244,234)] px-1.5 py-0.5 text-[11px] font-bold text-[rgb(30,142,62)]">
                <TrendingUp className="h-3 w-3" />
                +350%
              </div>
            </div>
            <div className="relative mt-2 h-10 w-full">
              <svg viewBox="0 0 100 30" className="h-full w-full overflow-visible" preserveAspectRatio="none">
                <path
                  d="M 0 25 L 10 28 L 20 20 L 30 22 L 40 15 L 50 18 L 60 5 L 70 8 L 80 2 L 90 4 L 100 0"
                  fill="none"
                  stroke="rgb(66 133 244)"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M 0 25 L 10 28 L 20 20 L 30 22 L 40 15 L 50 18 L 60 5 L 70 8 L 80 2 L 90 4 L 100 0 L 100 30 L 0 30 Z"
                  fill="url(#hero-sparkline-grad)"
                  opacity="0.2"
                />
                <defs>
                  <linearGradient id="hero-sparkline-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgb(66 133 244)" />
                    <stop offset="100%" stopColor="rgb(66 133 244)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute right-0 top-0 h-2 w-2 translate-x-1 -translate-y-1 rounded-full border-2 border-white bg-[rgb(66,133,244)]" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function HeroSemanticGraph({ phase }: { phase: HeroPhase }) {
  const isVisible =
    phase === "generation" || phase === "fanout" || phase === "ranking" || phase === "settled";

  return (
    <div
      className="relative h-full w-full transition-all duration-700"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-20px)",
      }}
    >
      <ReactFlow
        nodes={heroGraphNodes}
        edges={graphEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.08 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnScroll={false}
        panOnDrag={false}
        preventScrolling={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      />
    </div>
  );
}

function getPlatformIcon(platform: ClipPlatform) {
  switch (platform) {
    case "tiktok":
      return <Disc3 className="h-4 w-4 text-white" />;
    case "youtube":
      return <Youtube className="h-4 w-4 text-[var(--color-rose)]" />;
    case "x":
      return <Twitter className="h-4 w-4 fill-white text-white" />;
    default:
      return null;
  }
}

function ClipFan({ phase }: { phase: HeroPhase }) {
  const isFanoutOrLater = phase === "fanout" || phase === "ranking" || phase === "settled";
  const isTopMatchVisible = phase === "ranking" || phase === "settled";
  const isTopMatchLifted = phase === "ranking";

  return (
    <div className="relative z-40 mt-28 flex min-h-[300px] w-full flex-grow items-end justify-center pb-8">
      {generatedClips.map((clip, index) => {
        const centerIndex = Math.floor(generatedClips.length / 2);
        const offset = index - centerIndex;
        const rotate = offset * 14;
        const xTranslate = offset * 90;
        const yTranslate = Math.abs(offset) * 20 - 36;
        const zIndex = 50 - Math.abs(offset);
        const isTopMatchMode = isTopMatchVisible && clip.isTopMatch;
        const shouldLiftTopMatch = isTopMatchLifted && clip.isTopMatch;
        const nonMatchDimmed = isTopMatchVisible && !clip.isTopMatch;

        return (
          <motion.div
            key={clip.id}
            className="absolute bottom-0 origin-bottom"
            style={{
              zIndex: isTopMatchMode ? 60 : zIndex,
              willChange: "transform, opacity",
            }}
            initial={{ opacity: 0, y: 150, x: 0, rotate: 0, scale: 0.8 }}
            animate={
              isFanoutOrLater
                ? {
                    opacity: nonMatchDimmed ? 0.62 : 1,
                    y: shouldLiftTopMatch ? -24 + yTranslate : yTranslate,
                    x: xTranslate,
                    rotate,
                    scale: isTopMatchMode ? 1 : 0.95,
                  }
                : { opacity: 0, y: 150, x: 0, rotate: 0, scale: 0.8 }
            }
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: isFanoutOrLater ? index * 0.1 : 0,
            }}
          >
            <div
              className={`relative aspect-[9/16] w-[190px] overflow-hidden rounded-[20px] border bg-[var(--color-surface-2)] shadow-2xl transition-colors duration-500 ${
                isTopMatchMode
                  ? "border-[var(--color-violet)] ring-4 ring-[var(--color-violet)]/20 shadow-[0_0_40px_rgba(167,139,250,0.5)]"
                  : "border-[var(--color-border)]"
              }`}
            >
              <img
                src={clip.image}
                alt=""
                className="h-full w-full object-cover opacity-90"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <div className="absolute inset-x-3 top-3 z-20 flex h-10 items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-md transition-all duration-500">
                  {getPlatformIcon(clip.platform)}
                </div>

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 justify-center">
                  <AnimatePresence>
                    {isTopMatchMode && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="whitespace-nowrap rounded-full border border-[var(--color-violet)]/50 bg-[var(--color-violet-dim)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_4px_12px_rgba(124,58,237,0.5)]">
                          Top Hit
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div
                  className={`rounded-full border px-2.5 py-1 font-mono text-[13px] font-bold leading-none shadow-lg backdrop-blur-xl ${
                    isTopMatchMode
                      ? "border-white/10 bg-black/70 text-[var(--color-violet)]"
                      : "border-white/10 bg-black/60 text-[var(--color-green)]"
                  }`}
                >
                  {clip.score}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ClyptHeroAnimation({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  const phase = useSequencedPhase(reducedMotion);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative z-20 isolate mx-auto w-full overflow-visible [--hero-animation-scale:0.31] sm:[--hero-animation-scale:0.47] lg:[--hero-animation-scale:0.56] xl:[--hero-animation-scale:0.63] 2xl:[--hero-animation-scale:0.7] ${className}`}
      style={{
        maxWidth: `calc(${stageWidth}px * var(--hero-animation-scale))`,
        height: `calc(${stageHeight}px * var(--hero-animation-scale))`,
        transform: "translateY(18px)",
      }}
    >
      <div
        className="pointer-events-none absolute z-20 transition-all duration-700"
        style={{
          left: `calc(-${graphHorizontalBleed}px * var(--hero-animation-scale))`,
          width: `calc(100% + ${graphHorizontalBleed * 2}px * var(--hero-animation-scale))`,
          top: `calc(${graphTop}px * var(--hero-animation-scale))`,
          height: `calc(${graphHeight}px * var(--hero-animation-scale))`,
        }}
      >
        <ReactFlowProvider>
          <HeroSemanticGraph phase={phase} />
        </ReactFlowProvider>
      </div>

      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: stageWidth,
          height: stageHeight,
          transform: "translate(-50%, -50%) scale(var(--hero-animation-scale))",
          transformOrigin: "center",
        }}
      >
        <motion.div
          className="relative flex h-full w-full flex-col items-center overflow-visible px-4 pt-6"
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--color-violet-muted),transparent_60%)]" />
          <div className="absolute inset-x-20 top-8 h-64 rounded-full bg-[color-mix(in_srgb,var(--color-violet)_16%,transparent)] blur-3xl" />

          <InputCluster phase={phase} />
          <div className="relative z-20 -mt-[64px] h-[500px] w-full transition-all duration-700" />
          <ClipFan phase={phase} />
        </motion.div>
      </div>
    </div>
  );
}
