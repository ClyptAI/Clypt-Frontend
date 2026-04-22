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
  { node_type: "claim", summary: "Grizzlies deserve a baseline level of fear, not romanticism", transcript_excerpt: "Everyone should have a fear of grizzly bears.", duration: 44, is_candidate: true },
  { node_type: "claim", summary: "A tent is not meaningful protection in real bear country", transcript_excerpt: "You're gonna have a little cloth house that you sleep in.", duration: 31, is_candidate: false },
  { node_type: "claim", summary: "Big cats may still beat bears in the all-time fear rankings", transcript_excerpt: "Big cats might be even scarier.", duration: 26, is_candidate: true },
  { node_type: "anecdote", summary: "A friend watched a bear catch a moose and break its back", transcript_excerpt: "The bear caught up to the moose and broke its back.", duration: 82, is_candidate: true },
  { node_type: "anecdote", summary: "Ice-raft survival story where the polar bear keeps closing the distance", transcript_excerpt: "He pops up on the next one next to them until he's right there.", duration: 96, is_candidate: true },
  { node_type: "anecdote", summary: "Steve Rinella's elk camp gets rushed by a giant brown bear", transcript_excerpt: "They turned and there was this giant beast just running through the camp.", duration: 88, is_candidate: true },
  { node_type: "qa_exchange", summary: "What do you actually do when a polar bear has found you?", transcript_excerpt: "So what do you do in that situation?", duration: 48, is_candidate: false },
  { node_type: "qa_exchange", summary: "Bears or sharks: which fear is worse depends entirely on where you are", transcript_excerpt: "More afraid of bears or sharks?", duration: 43, is_candidate: true },
  { node_type: "challenge_exchange", summary: "The guest tries to call the polar bear curious instead of predatory", transcript_excerpt: "So this is him just being curious. He's just kind of looking at it.", duration: 40, is_candidate: true },
  { node_type: "challenge_exchange", summary: "Someone argues a bear feels more escapable than a tiger", transcript_excerpt: "With a tiger or a lion, I feel like there's nothing.", duration: 52, is_candidate: false },
  { node_type: "reveal", summary: "The famous turn: Joe says the polar bear smells meat, full stop", transcript_excerpt: "He smells meat. That's 100% what's going on.", duration: 33, is_candidate: true },
  { node_type: "reveal", summary: "Polar bears don't just kill you, they start eating immediately", transcript_excerpt: "They eat you alive. They don't bother killing you.", duration: 42, is_candidate: true },
  { node_type: "explanation", summary: "Polar bears are uniquely predatory because they don't have non-meat options", transcript_excerpt: "They don't have any vegetables. All they eat is seals or anything else.", duration: 63, is_candidate: false },
  { node_type: "explanation", summary: "The woods are a human reset because nature doesn't care who you are", transcript_excerpt: "No one gives a fuck who you are. Everything here is trying to do their thing.", duration: 71, is_candidate: true },
  { node_type: "explanation", summary: "A wolf is not a bigger dog; it's a machine built to crush bone", transcript_excerpt: "A wolf's bite is five times stronger than a pit bull's.", duration: 58, is_candidate: true },
  { node_type: "reaction_beat", summary: "The room reacts in horror to the ice-raft bear story", transcript_excerpt: "Holy shit.", duration: 18, is_candidate: false },
  { node_type: "reaction_beat", summary: "The hard laugh line is that there is no heroic zig-zag against a bear", transcript_excerpt: "There's no zagging with bears.", duration: 21, is_candidate: true },
  { node_type: "setup_payoff", summary: "Setup: the box or tent looks like protection from the outside", transcript_excerpt: "Oh, you want to climb a tree and get away?", duration: 39, is_candidate: false },
  { node_type: "payoff", summary: "Payoff: the box just turns into a container full of meat to a polar bear", transcript_excerpt: "He's trying to bite that box to eat that man.", duration: 51, is_candidate: true },
  { node_type: "hook", summary: "The opening hook reframes a bear as a giant wild dog with no fences", transcript_excerpt: "It's a 900-pound predatory wild dog.", duration: 34, is_candidate: true },
  { node_type: "hook", summary: "The episode's second hook is the dumbest macho question possible: what animal could you fight?", transcript_excerpt: "What's the biggest animal you could beat the shit out of?", duration: 24, is_candidate: true },
  { node_type: "insight", summary: "Wilderness strips away social status and puts humans back into the food chain", transcript_excerpt: "It's a human reset.", duration: 45, is_candidate: true },
  { node_type: "insight", summary: "Humans are basically jelly donuts compared with orangutans, wolves, or bears", transcript_excerpt: "We're made out of jelly donuts.", duration: 36, is_candidate: false },
  { node_type: "transition", summary: "The conversation moves from bears to wolves, monkeys, and other animals that would ruin a person", transcript_excerpt: "What about a wolf?", duration: 18, is_candidate: false },
  { node_type: "transition", summary: "The back half pivots from wilderness terror to sharks, alligators, and smoking habits", transcript_excerpt: "Way more afraid of sharks. Way more afraid of alligators.", duration: 20, is_candidate: false },
  { node_type: "topic_shift", summary: "After the danger stories, the room slides into travel stories and weed banter", transcript_excerpt: "Yo, give us a blunt because we're in New York.", duration: 22, is_candidate: false },
  { node_type: "punchline", summary: "Florida bears get the funniest comparison of the whole segment", transcript_excerpt: "Florida bears are like Florida people.", duration: 19, is_candidate: true },
  { node_type: "conflict", summary: "The direct disagreement is over whether the bear is investigating or hunting", transcript_excerpt: "No, no, no. Incorrect.", duration: 27, is_candidate: false },
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
