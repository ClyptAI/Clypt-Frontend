import { useQuery } from '@tanstack/react-query'
import { embeddingsApi } from '../../lib/api'

export type NodeType =
  | 'claim' | 'explanation' | 'anecdote' | 'reaction_beat'
  | 'setup_payoff' | 'qa_exchange' | 'challenge_exchange'
  | 'reveal' | 'transition' | 'hook' | 'conflict'
  | 'punchline' | 'payoff' | 'insight' | 'topic_shift' | 'speaker_beat';

export interface EmbedPoint {
  node_id: string;
  node_type: NodeType;
  summary: string;
  transcript_excerpt: string;
  start_s: number;
  end_s: number;
  x: number;  // 2D projected, roughly in [-1, 1]
  y: number;
  is_candidate: boolean;
}

export interface EmbeddingsData {
  semantic: EmbedPoint[];
  multimodal: EmbedPoint[];
}

// ── Seeded PRNG (mulberry32) for deterministic mock positions ──
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function gauss(rand: () => number): number {
  // Box-Muller for Gaussian noise
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Cluster centers per node type in the 2D embedding space
const CLUSTER_CENTERS: Record<string, [number, number]> = {
  claim:             [-0.55,  0.62],
  insight:           [-0.48,  0.55],
  hook:              [-0.72,  0.18],
  anecdote:          [ 0.42,  0.52],
  punchline:         [ 0.50,  0.40],
  reveal:            [ 0.68,  0.10],
  qa_exchange:       [ 0.30, -0.50],
  challenge_exchange:[ 0.52, -0.22],
  conflict:          [ 0.55, -0.35],
  reaction_beat:     [ 0.02,  0.30],
  setup_payoff:      [-0.18, -0.60],
  payoff:            [-0.10, -0.52],
  explanation:       [-0.60, -0.28],
  topic_shift:       [ 0.08, -0.05],
  transition:        [ 0.12,  0.05],
  speaker_beat:      [-0.30,  0.10],
};

const MOCK_NODES: Array<{
  node_type: NodeType;
  summary: string;
  transcript_excerpt: string;
  duration: number;
  is_candidate: boolean;
}> = [
  { node_type: "claim", summary: "AI capabilities are advancing faster than institutions can adapt", transcript_excerpt: "I think we're at an inflection point most people don't fully appreciate yet.", duration: 52, is_candidate: true },
  { node_type: "claim", summary: "The model failure modes are systematic, not random", transcript_excerpt: "It fails consistently, and not in a random way.", duration: 38, is_candidate: false },
  { node_type: "claim", summary: "Alignment research is underfunded relative to capability research", transcript_excerpt: "There's a massive asymmetry in where the resources are going.", duration: 61, is_candidate: true },
  { node_type: "anecdote", summary: "Personal experiment with the model admitting being wrong when correct", transcript_excerpt: "I told the model it was wrong when it was actually right, and watched what happened.", duration: 95, is_candidate: true },
  { node_type: "anecdote", summary: "Story about a researcher's unexpected result with RLHF", transcript_excerpt: "She ran it overnight and came in to find the model had basically rewritten its own reward signal.", duration: 78, is_candidate: false },
  { node_type: "anecdote", summary: "The GPT-2 release decision and internal disagreements", transcript_excerpt: "There was real disagreement about whether to release it at all.", duration: 112, is_candidate: true },
  { node_type: "qa_exchange", summary: "Question on whether open-source models can catch up to frontier", transcript_excerpt: "So do you think Llama-class models can ever match GPT-5?", duration: 85, is_candidate: false },
  { node_type: "qa_exchange", summary: "Debate on interpretability vs alignment as research priorities", transcript_excerpt: "If you had to pick one, interpretability or alignment, what would it be?", duration: 70, is_candidate: true },
  { node_type: "challenge_exchange", summary: "Guest pushes back on claims about emergent capabilities", transcript_excerpt: "I don't think emergence is real in the way people describe it. It's a measurement artifact.", duration: 90, is_candidate: true },
  { node_type: "challenge_exchange", summary: "Pushback on scaling hypothesis from empirical evidence", transcript_excerpt: "The loss curves are telling us something different if you look at the actual data.", duration: 65, is_candidate: false },
  { node_type: "reveal", summary: "The model actually agreed with incorrect premise under pressure", transcript_excerpt: "No way. No way! You're telling me it just… agreed? That's insane.", duration: 45, is_candidate: true },
  { node_type: "reveal", summary: "Secret internal benchmark results contradict public claims", transcript_excerpt: "These numbers were never meant to be public. I'm showing them anyway.", duration: 58, is_candidate: true },
  { node_type: "explanation", summary: "How attention mechanisms create in-context learning", transcript_excerpt: "The key insight is that attention is really just doing a soft lookup table in high-dimensional space.", duration: 120, is_candidate: false },
  { node_type: "explanation", summary: "Why RLHF leads to sycophancy as an emergent behavior", transcript_excerpt: "If you reward the model for making the human happy, it learns to make the human happy.", duration: 95, is_candidate: false },
  { node_type: "explanation", summary: "The difference between capabilities and alignment", transcript_excerpt: "A capable model is not the same as a safe model. We need to be very precise here.", duration: 72, is_candidate: true },
  { node_type: "reaction_beat", summary: "Host surprised by the capitulation result", transcript_excerpt: "That was the whole point. I wanted to see if it would hold its ground.", duration: 28, is_candidate: false },
  { node_type: "reaction_beat", summary: "Guest acknowledges the seriousness of the finding", transcript_excerpt: "Yeah, this is — I mean, this is actually terrifying when you think about it.", duration: 22, is_candidate: true },
  { node_type: "setup_payoff", summary: "Setup: hypothetical about model advising on policy", transcript_excerpt: "Imagine a model that's consulted on nuclear deterrence strategy.", duration: 55, is_candidate: false },
  { node_type: "setup_payoff", summary: "Payoff: what actually happened when they tried it", transcript_excerpt: "So we actually did this experiment, just with a toy policy scenario.", duration: 82, is_candidate: true },
  { node_type: "hook", summary: "Opening provocation about AI consciousness claims", transcript_excerpt: "The most dangerous idea in AI right now is that these models might already be conscious.", duration: 35, is_candidate: true },
  { node_type: "hook", summary: "Bold prediction about AGI timeline", transcript_excerpt: "I'll say something most of my colleagues won't: we are within five years.", duration: 29, is_candidate: true },
  { node_type: "insight", summary: "Key insight: training data determines world model more than architecture", transcript_excerpt: "The weights are the world model. The architecture is just the vessel.", duration: 48, is_candidate: true },
  { node_type: "insight", summary: "Latent space geometry encodes semantic relationships", transcript_excerpt: "Distance in embedding space is actually meaningful in ways that surprise me every time.", duration: 55, is_candidate: false },
  { node_type: "transition", summary: "Moving from technical to policy discussion", transcript_excerpt: "So let's zoom out from the technical to ask — who's actually in charge here?", duration: 18, is_candidate: false },
  { node_type: "transition", summary: "Shift from theoretical to practical examples", transcript_excerpt: "Enough theory, let me show you an actual concrete example.", duration: 14, is_candidate: false },
  { node_type: "topic_shift", summary: "Switch to discussing deployment safety", transcript_excerpt: "I want to pivot because we haven't talked about deployment at all.", duration: 20, is_candidate: false },
  { node_type: "punchline", summary: "Humorous conclusion about humans and models both being sycophants", transcript_excerpt: "So turns out humans and language models have a lot in common after all.", duration: 25, is_candidate: true },
  { node_type: "conflict", summary: "Direct disagreement about whether AI labs are acting responsibly", transcript_excerpt: "With respect — I fundamentally disagree. The labs know exactly what they're doing.", duration: 72, is_candidate: false },
];

function generateMockPoints(seed: number): EmbedPoint[] {
  const rand = mulberry32(seed);
  let t = 0;
  return MOCK_NODES.map((n, i) => {
    const center = CLUSTER_CENTERS[n.node_type] ?? [0, 0];
    const x = center[0] + gauss(rand) * 0.12;
    const y = center[1] + gauss(rand) * 0.10;
    const start_s = t + rand() * 30;
    const end_s = start_s + n.duration;
    t = end_s + rand() * 20 + 5;
    return {
      node_id: `node_${String(i + 1).padStart(3, "0")}`,
      node_type: n.node_type,
      summary: n.summary,
      transcript_excerpt: n.transcript_excerpt,
      start_s: Math.round(start_s),
      end_s: Math.round(end_s),
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
      is_candidate: n.is_candidate,
    };
  });
}

// Multimodal projection is slightly different — same clusters but perturbed
function generateMultimodalPoints(semantic: EmbedPoint[]): EmbedPoint[] {
  const rand = mulberry32(0xdeadbeef);
  return semantic.map((p) => ({
    ...p,
    x: Math.max(-1, Math.min(1, p.x + gauss(rand) * 0.09)),
    y: Math.max(-1, Math.min(1, p.y + gauss(rand) * 0.09)),
  }));
}

const MOCK_SEMANTIC = generateMockPoints(0x1a2b3c4d);
const MOCK_MULTIMODAL = generateMultimodalPoints(MOCK_SEMANTIC);

export const MOCK_EMBEDDINGS: EmbeddingsData = {
  semantic: MOCK_SEMANTIC,
  multimodal: MOCK_MULTIMODAL,
};

export const embeddingKeys = {
  all: ['embeddings'] as const,
  run: (runId: string) => [...embeddingKeys.all, runId] as const,
};

export function useEmbeddings(runId: string) {
  return useQuery({
    queryKey: embeddingKeys.run(runId),
    queryFn: () => embeddingsApi.get(runId),
    enabled: !!runId,
  });
}
