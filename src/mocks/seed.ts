/**
 * Seed data for the mock DB. Consolidates what was previously scattered
 * across page files (Library mockRuns, RunClips CLIPS, RunGrounding QUEUE,
 * RunRender CLIPS) into one place. Shapes match the real API types in
 * src/types/clypt.ts so the UI sees the same thing it would see from a
 * backed-by-real-api response.
 */

import type {
  RunDetail,
  ClipCandidate,
  SemanticGraphNode,
  SemanticGraphEdge,
  RenderPreset,
  PhaseStatusEntry,
  PhaseNumber,
  PhaseStatus,
  NodeType,
  EdgeType,
  EmotionLabel,
  TimelineBundle,
  TimelineSpeaker,
  TimelineSpeakerTurn,
  TimelineShot,
  TimelineShotTracklets,
  TimelineEmotionSegment,
  TimelineAudioEvent,
} from '@/types/clypt'
import type { MockDB } from './store'

// ─── Phase helpers ────────────────────────────────────────────────────────────

const PHASE_NAMES: Record<PhaseNumber, string> = {
  1: 'Timeline foundation',
  2: 'Node construction',
  3: 'Graph embedding',
  4: 'Candidate retrieval',
  5: 'Ranking',
  6: 'Render planning',
}

/**
 * Build a full 6-phase status array at a given completion point.
 *
 * @param currentPhase The phase that is currently running (1..6) or 7 for "all done"
 * @param currentStatus Status for the active phase
 */
export function buildPhaseStatus(
  currentPhase: number,
  currentStatus: PhaseStatus = 'running',
): PhaseStatusEntry[] {
  const phases: PhaseStatusEntry[] = []
  for (let i = 1 as PhaseNumber; i <= 6; i = (i + 1) as PhaseNumber) {
    let status: PhaseStatus
    if (i < currentPhase) status = 'completed'
    else if (i === currentPhase) status = currentStatus
    else status = 'pending'
    phases.push({
      phase: i,
      name: PHASE_NAMES[i],
      status,
      elapsed_s: status === 'completed' ? 30 + i * 8 : status === 'running' ? 12 : null,
      summary: null,
      artifact_keys: status === 'completed' ? [`phase_${i}_output.json`] : [],
    })
  }
  return phases
}

// ─── Demo run: "Joe Rogan × Flagrant" (all phases complete) ──────────────────

const DEMO_RUN_ID = 'demo'

const DEMO_RUN: RunDetail = {
  run_id: DEMO_RUN_ID,
  source_url: 'https://youtube.com/watch?v=demo412',
  display_name: 'Joe Rogan × Flagrant',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  phases: buildPhaseStatus(7, 'completed'),
  node_count: 27,
  edge_count: 41,
  clip_count: 8,
}

// The 8 clip candidates that were previously inlined in RunClips.tsx, converted
// to the real ClipCandidate shape.
function ts(m: number, s: number): number {
  return (m * 60 + s) * 1000
}

const DEMO_CLIPS: ClipCandidate[] = [
  {
    clip_id: 'clip_001',
    node_ids: ['node_007', 'node_008', 'node_009'],
    start_ms: ts(0, 38),
    end_ms: ts(1, 4),
    score: 8.4,
    rationale: 'The moose-back story plus the cloth-tent punchline creates an instant bear-country hook.',
    source_prompt_ids: ['meta_prompt_1'],
    seed_node_id: 'node_007',
    subgraph_id: 'sg_014',
    query_aligned: false,
    pool_rank: 1,
    score_breakdown: {
      overall_clip_quality: 8.7,
      query_alignment: 0,
      novelty_within_run: 7.9,
      editorial_usability: 8.1,
      confidence: 8.3,
    },
  },
  {
    clip_id: 'clip_002',
    node_ids: ['node_012', 'node_013'],
    start_ms: ts(1, 40),
    end_ms: ts(2, 5),
    score: 8.1,
    rationale:
      'The polar-bear-box exchange has a clean setup, rebuttal, and quote-ready payoff.',
    source_prompt_ids: ['comment_cluster'],
    seed_node_id: 'node_012',
    subgraph_id: 'sg_018',
    query_aligned: true,
    pool_rank: 2,
    score_breakdown: {
      overall_clip_quality: 8.0,
      query_alignment: 8.5,
      novelty_within_run: 7.6,
      editorial_usability: 8.2,
      confidence: 7.9,
    },
  },
  {
    clip_id: 'clip_003',
    node_ids: ['node_004', 'node_005'],
    start_ms: ts(2, 27),
    end_ms: ts(3, 10),
    score: 7.9,
    rationale: 'The ice-raft story escalates beautifully and lands with a genuine shocked reaction.',
    source_prompt_ids: ['meta_prompt_2'],
    seed_node_id: 'node_004',
    subgraph_id: 'sg_009',
    query_aligned: false,
    pool_rank: 3,
    score_breakdown: {
      overall_clip_quality: 8.2,
      query_alignment: 0,
      novelty_within_run: 7.5,
      editorial_usability: 7.8,
      confidence: 8.0,
    },
  },
  {
    clip_id: 'clip_004',
    node_ids: ['node_021', 'node_022'],
    start_ms: ts(4, 18),
    end_ms: ts(5, 9),
    score: 7.6,
    rationale: 'The elk-camp bear rush is visual, chaotic, and easy to imagine as a short-form story.',
    source_prompt_ids: ['retention_cluster'],
    seed_node_id: 'node_021',
    subgraph_id: 'sg_025',
    query_aligned: false,
    pool_rank: 4,
    score_breakdown: {
      overall_clip_quality: 7.4,
      query_alignment: 0,
      novelty_within_run: 7.8,
      editorial_usability: 7.5,
      confidence: 7.7,
    },
  },
  {
    clip_id: 'clip_005',
    node_ids: ['node_028', 'node_029'],
    start_ms: ts(5, 56),
    end_ms: ts(6, 24),
    score: 7.3,
    rationale: 'The "human reset" explanation turns the bear talk into a broader worldview clip.',
    source_prompt_ids: ['meta_prompt_3'],
    seed_node_id: 'node_028',
    subgraph_id: 'sg_031',
    query_aligned: false,
    pool_rank: 5,
    score_breakdown: {
      overall_clip_quality: 7.5,
      query_alignment: 0,
      novelty_within_run: 7.0,
      editorial_usability: 7.2,
      confidence: 7.4,
    },
  },
  {
    clip_id: 'clip_006',
    node_ids: ['node_035'],
    start_ms: ts(7, 39),
    end_ms: ts(8, 11),
    score: 7.0,
    rationale: 'The macho "what animal could you beat up?" detour is fast, funny, and clip-friendly.',
    source_prompt_ids: ['meta_prompt_1'],
    seed_node_id: 'node_035',
    subgraph_id: 'sg_038',
    query_aligned: false,
    pool_rank: 6,
    score_breakdown: {
      overall_clip_quality: 7.1,
      query_alignment: 0,
      novelty_within_run: 6.8,
      editorial_usability: 7.0,
      confidence: 7.2,
    },
  },
  {
    clip_id: 'clip_007',
    node_ids: ['node_042', 'node_043'],
    start_ms: ts(10, 37),
    end_ms: ts(11, 13),
    score: 6.8,
    rationale:
      'The childhood bear-mask trauma lands as a clean, funny fear story with a strong ending.',
    source_prompt_ids: ['comment_cluster'],
    seed_node_id: 'node_042',
    subgraph_id: 'sg_045',
    query_aligned: true,
    pool_rank: 7,
    score_breakdown: {
      overall_clip_quality: 6.9,
      query_alignment: 7.2,
      novelty_within_run: 6.5,
      editorial_usability: 6.7,
      confidence: 6.8,
    },
  },
  {
    clip_id: 'clip_008',
    node_ids: ['node_050'],
    start_ms: ts(12, 19),
    end_ms: ts(13, 5),
    score: 6.5,
    rationale:
      'Bears-versus-sharks is a simple debate prompt that works well as a social opener.',
    source_prompt_ids: ['meta_prompt_4'],
    seed_node_id: 'node_050',
    subgraph_id: 'sg_052',
    query_aligned: false,
    pool_rank: 8,
    score_breakdown: {
      overall_clip_quality: 6.6,
      query_alignment: 0,
      novelty_within_run: 6.3,
      editorial_usability: 6.4,
      confidence: 6.5,
    },
  },
]

// ─── Demo graph nodes & edges ────────────────────────────────────────────────

// Build a synthetic 27-node semantic graph. Shapes match SemanticGraphNode
// so the RunGraph page and embedding scatter can consume these directly.

const DEMO_NODE_BLUEPRINTS: Array<{
  node_type: NodeType
  summary: string
  transcript_text: string
}> = [
  { node_type: 'claim', summary: 'Joe says fear of grizzlies is the rational default.', transcript_text: 'Everyone should have a fear of grizzly bears.' },
  { node_type: 'explanation', summary: 'A grizzly is framed as a giant unfenced predator roaming open woods.', transcript_text: "It's like a 900-pound predatory wild dog with no fences." },
  { node_type: 'qa_exchange', summary: 'Somebody offers the classic defense: just yell and scare the bear away.', transcript_text: 'But what if you scare them by yelling at them?' },
  { node_type: 'reaction_beat', summary: 'The table laughs at the idea that a tree or a zig-zag solves this problem.', transcript_text: 'Oh, you want to climb a tree and get away?' },
  { node_type: 'setup_payoff', summary: 'A friend spots a grizzly closing on a moose through a long-range scope.', transcript_text: 'My friend watched through a scope while the bear chased the moose.' },
  { node_type: 'reveal', summary: 'The payoff is violent and immediate: the bear snaps the moose\'s back.', transcript_text: 'The bear caught up to the moose and broke its back.' },
  { node_type: 'challenge_exchange', summary: 'The guest tries to call the polar bear curious instead of hungry.', transcript_text: "He's just kind of looking at it." },
  { node_type: 'anecdote', summary: 'Joe rejects that and retells the box footage as a pure hunting sequence.', transcript_text: 'That polar bear smells meat and is trying to get in there.' },
  { node_type: 'transition', summary: 'The talk shifts from grizzlies to polar bears and expedition footage.', transcript_text: 'This is the polar bear. This one is fucked.' },
  { node_type: 'example', summary: 'The box footage becomes the cleanest example of human vulnerability in the segment.', transcript_text: 'He is trying to bite that box to eat that man.' },
  { node_type: 'claim', summary: 'Polar bears are described as the most predatory bear because they only eat meat.', transcript_text: "They don't have any vegetables. All they eat is fucking seals or anything else." },
  { node_type: 'explanation', summary: 'That diet is used to explain why there is no harmless interpretation of the behavior.', transcript_text: "This has nothing to do with curiosity." },
  { node_type: 'qa_exchange', summary: 'Someone asks what you can actually do once a polar bear has you cornered.', transcript_text: 'So what do you do in that situation?' },
  { node_type: 'reaction_beat', summary: 'The room braces for the answer before the story even lands.', transcript_text: 'Oh, fuck.' },
  { node_type: 'setup_payoff', summary: 'Joe sets up the stranded-explorer story on an ice raft.', transcript_text: 'They have to get off the boat onto an ice raft and wait.' },
  { node_type: 'reveal', summary: 'The bear moves from floe to floe, grabs one man, and starts eating him.', transcript_text: 'He comes up onto their ice raft, takes one of the guys, and starts eating him.' },
  { node_type: 'challenge_exchange', summary: 'The table keeps looking for an escape route that never really exists.', transcript_text: 'Where do you think it was heading at?' },
  { node_type: 'anecdote', summary: 'Joe transitions into friends who were charged by grizzlies and brown bears.', transcript_text: 'I do have friends that have been chased by grizzlies and attacked by grizzlies.' },
  { node_type: 'transition', summary: 'The conversation broadens from one-off attacks to what wilderness does to human confidence.', transcript_text: "You gotta worry about everything, man." },
  { node_type: 'example', summary: 'The woods are framed as a place where status disappears and only survival matters.', transcript_text: "It's a human reset because no one gives a fuck who you are." },
  { node_type: 'claim', summary: 'Joe says elk and bulls are already in a constant arms race in the wild.', transcript_text: 'They grow weapons every year.' },
  { node_type: 'explanation', summary: 'Animal conflict is used to underline how normal violence is outside human society.', transcript_text: 'They decided they both want to be the king shit of the herd.' },
  { node_type: 'qa_exchange', summary: 'The macho hypothetical arrives: what animal could a human actually beat up?', transcript_text: "What's the biggest animal you could beat the shit out of?" },
  { node_type: 'reaction_beat', summary: 'Joe immediately undercuts human bravado by saying even a monkey is dangerous.', transcript_text: "I don't think I could beat the shit out of a monkey." },
  { node_type: 'setup_payoff', summary: 'The wolf argument becomes the next mini setup.', transcript_text: 'What about a wolf?' },
  { node_type: 'reveal', summary: 'The payoff is that a wolf is basically a bone-crushing machine, not a dog.', transcript_text: "A wolf's bite is five times stronger than a pit bull's." },
  { node_type: 'anecdote', summary: 'The segment lands in comedy with Florida bear trauma and prank stories.', transcript_text: 'Florida bears are like Florida people. Very, very unpredictable.' },
]

function generateDemoNodes(runId: string): SemanticGraphNode[] {
  const out: SemanticGraphNode[] = []
  let cursor = 0
  for (let i = 0; i < DEMO_NODE_BLUEPRINTS.length; i++) {
    const duration = 6000 + (i % 5) * 1500
    const blueprint = DEMO_NODE_BLUEPRINTS[i]
    out.push({
      node_id: `node_${String(i + 1).padStart(3, '0')}`,
      node_type: blueprint.node_type,
      start_ms: cursor,
      end_ms: cursor + duration,
      source_turn_ids: [`turn_${i + 1}`],
      word_ids: [],
      transcript_text: `${blueprint.transcript_text} [demo ${runId}]`,
      node_flags: [],
      summary: blueprint.summary,
      evidence: {
        emotion_labels: ['neutral'],
        audio_events: [],
      },
      semantic_embedding: null,
      multimodal_embedding: null,
    })
    cursor += duration + 500
  }
  return out
}

function generateDemoEdges(nodes: SemanticGraphNode[]): SemanticGraphEdge[] {
  const out: SemanticGraphEdge[] = []
  // Sequential next_turn edges
  for (let i = 0; i < nodes.length - 1; i++) {
    out.push({
      source_node_id: nodes[i].node_id,
      target_node_id: nodes[i + 1].node_id,
      edge_type: 'next_turn',
      rationale: null,
      confidence: 0.9,
      support_count: 1,
      batch_ids: ['seed'],
    })
  }
  // A few stronger rhetorical links
  const rhetoricalEdges: Array<[number, number, EdgeType]> = [
    [2, 5, 'setup_for'],
    [5, 7, 'payoff_of'],
    [3, 6, 'challenges'],
    [8, 11, 'callback_to'],
    [12, 15, 'elaborates'],
    [16, 19, 'reaction_to'],
    [20, 24, 'contradicts'],
  ]
  for (const [from, to, type] of rhetoricalEdges) {
    if (from < nodes.length && to < nodes.length) {
      out.push({
        source_node_id: nodes[from].node_id,
        target_node_id: nodes[to].node_id,
        edge_type: type,
        rationale: `Demo rhetorical ${type} link`,
        confidence: 0.75,
        support_count: 1,
        batch_ids: ['seed'],
      })
    }
  }
  return out
}

// ─── Secondary runs (to populate the Library list) ───────────────────────────

const SECONDARY_RUNS: RunDetail[] = [
  {
    run_id: 'run_quit_job',
    source_url: 'https://youtube.com/watch?v=xK3j2',
    display_name: 'Why I Quit My $300K Job to Build a Startup',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    phases: buildPhaseStatus(4, 'running'),
    node_count: null,
    edge_count: null,
    clip_count: null,
  },
  {
    run_id: 'run_mrbeast',
    source_url: 'https://youtube.com/watch?v=aB3nQ',
    display_name: 'How MrBeast Engineers Retention (and What You Can Steal)',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    phases: buildPhaseStatus(6, 'running'),
    node_count: 32,
    edge_count: 48,
    clip_count: 6,
  },
]

// ─── Render presets ──────────────────────────────────────────────────────────

const RENDER_PRESETS: RenderPreset[] = [
  {
    id: 'preset_tiktok',
    platform: 'TikTok',
    label: 'TikTok 9:16 · 1080p',
    aspect_ratio: '9:16',
    width: 1080,
    height: 1920,
    frame_rate: 30,
    max_duration_s: 180,
  },
  {
    id: 'preset_reels',
    platform: 'Instagram Reels',
    label: 'Instagram Reels 9:16 · 1080p',
    aspect_ratio: '9:16',
    width: 1080,
    height: 1920,
    frame_rate: 30,
    max_duration_s: 90,
  },
  {
    id: 'preset_shorts',
    platform: 'YouTube Shorts',
    label: 'YouTube Shorts 9:16 · 1080p',
    aspect_ratio: '9:16',
    width: 1080,
    height: 1920,
    frame_rate: 60,
    max_duration_s: 60,
  },
  {
    id: 'preset_square',
    platform: 'Square',
    label: 'Square 1:1 · 1080p',
    aspect_ratio: '1:1',
    width: 1080,
    height: 1080,
    frame_rate: 30,
    max_duration_s: null,
  },
]

// ─── Timeline seed ────────────────────────────────────────────────────────────

/** Tiny deterministic PRNG (mulberry32) so timeline data is stable across reloads. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VIDEO_DURATION_MS = (24 * 60 + 31) * 1000 // 24:31

export function generateTimeline(_runId: string): TimelineBundle {
  const rng = mulberry32(0xdeadbeef)

  // 42 shots evenly distributed
  const shots: TimelineShot[] = Array.from({ length: 42 }, (_, i) => ({
    shot_id: `shot_${String(i + 1).padStart(3, '0')}`,
    start_ms: Math.round((VIDEO_DURATION_MS / 42) * i),
    end_ms: Math.round((VIDEO_DURATION_MS / 42) * (i + 1)),
  }))

  // Tracklets: first 20 shots get 1-3 tracklets
  const shot_tracklets: TimelineShotTracklets[] = shots.slice(0, 20).map((shot, si) => {
    const count = si % 3 === 0 ? 3 : si % 2 === 0 ? 2 : 1
    return {
      shot_id: shot.shot_id,
      start_ms: shot.start_ms,
      end_ms: shot.end_ms,
      tracklet_letters: Array.from({ length: count }, (_, ti) => String.fromCharCode(65 + ti)),
    }
  })

  const EMOTIONS: EmotionLabel[] = ['neutral', 'happy', 'surprised', 'angry', 'sad', 'fearful', 'disgusted']
  const TRANSCRIPTS = [
    'Everyone should have a fear of grizzly bears.',
    "That polar bear smells meat. He's not curious.",
    "There's no zagging with bears.",
    "The woods are a human reset because no one gives a fuck who you are.",
    "A wolf's bite is five times stronger than a pit bull's.",
  ]

  function buildSpeaker(speakerId: string, displayName: string, turnCount: number): TimelineSpeaker {
    const speakerIndex = parseInt(speakerId.split('_')[1]) - 1
    const gap = VIDEO_DURATION_MS / (turnCount + 1)
    const turns: TimelineSpeakerTurn[] = Array.from({ length: turnCount }, (_, i) => {
      const startMs = Math.min(
        Math.round(gap * (i + 0.5) + speakerIndex * 3000),
        VIDEO_DURATION_MS - 30000,
      )
      const durationMs = Math.round((8 + rng() * 28) * 1000)
      const endMs = Math.min(startMs + durationMs, VIDEO_DURATION_MS)
      const primaryEmotion = EMOTIONS[Math.floor(rng() * EMOTIONS.length)] as EmotionLabel
      const score = 0.6 + rng() * 0.3
      return {
        turn_id: `turn_${speakerId}_${i + 1}`,
        speaker_id: speakerId,
        start_ms: startMs,
        end_ms: endMs,
        transcript_text: TRANSCRIPTS[Math.floor(rng() * TRANSCRIPTS.length)],
        emotion_primary: primaryEmotion,
        emotion_score: score,
        emotion_secondary: [{ label: 'surprised' as EmotionLabel, score: 0.2 }],
      }
    })
    return { speaker_id: speakerId, display_name: displayName, turns }
  }

  const speakers: TimelineSpeaker[] = [
    buildSpeaker('spk_001', 'Joe Rogan', 18),
    buildSpeaker('spk_002', 'Andrew Schulz', 14),
    buildSpeaker('spk_003', 'Akaash Singh', 9),
  ]

  const emotions: TimelineEmotionSegment[] = [
    { start_ms: 0,       end_ms: 120000,  label: 'neutral' },
    { start_ms: 120000,  end_ms: 280000,  label: 'happy' },
    { start_ms: 280000,  end_ms: 420000,  label: 'surprised' },
    { start_ms: 420000,  end_ms: 600000,  label: 'neutral' },
    { start_ms: 600000,  end_ms: 780000,  label: 'angry' },
    { start_ms: 780000,  end_ms: 1000000, label: 'happy' },
    { start_ms: 1000000, end_ms: 1200000, label: 'neutral' },
    { start_ms: 1200000, end_ms: VIDEO_DURATION_MS, label: 'sad' },
  ]

  const audio_events: TimelineAudioEvent[] = [
    { start_ms: 45000,   end_ms: 46000,   label: 'laughter',  confidence: 0.92 },
    { start_ms: 190000,  end_ms: 191000,  label: 'applause',  confidence: 0.78 },
    { start_ms: 380000,  end_ms: 381000,  label: 'music',     confidence: 0.85 },
    { start_ms: 540000,  end_ms: 541000,  label: 'laughter',  confidence: 0.88 },
    { start_ms: 720000,  end_ms: 721000,  label: 'silence',   confidence: 0.95 },
    { start_ms: 890000,  end_ms: 891000,  label: 'laughter',  confidence: 0.81 },
    { start_ms: 1100000, end_ms: 1101000, label: 'applause',  confidence: 0.73 },
    { start_ms: 1300000, end_ms: 1301000, label: 'music',     confidence: 0.69 },
  ]

  return { duration_ms: VIDEO_DURATION_MS, shots, shot_tracklets, speakers, emotions, audio_events }
}

// ─── Master seed function ────────────────────────────────────────────────────

export function seedMockDB(db: MockDB): void {
  // Primary demo run — fully complete, has nodes/edges/clips
  const demoNodes = generateDemoNodes(DEMO_RUN_ID)
  const demoEdges = generateDemoEdges(demoNodes)

  db.runs[DEMO_RUN_ID] = DEMO_RUN
  db.clips[DEMO_RUN_ID] = DEMO_CLIPS
  db.nodes[DEMO_RUN_ID] = demoNodes
  db.edges[DEMO_RUN_ID] = demoEdges
  db.approvals[DEMO_RUN_ID] = {}
  db.runOrder.push(DEMO_RUN_ID)

  // Secondary runs — each gets a graph so the pages still work if clicked
  for (const run of SECONDARY_RUNS) {
    const nodes = generateDemoNodes(run.run_id)
    const edges = generateDemoEdges(nodes)
    db.runs[run.run_id] = run
    db.nodes[run.run_id] = nodes
    db.edges[run.run_id] = edges
    // Give the mrbeast run 6 clips sampled from the demo clip pool
    if (run.run_id === 'run_mrbeast') {
      db.clips[run.run_id] = DEMO_CLIPS.slice(0, 6).map((c, i) => ({
        ...c,
        clip_id: `mrbeast_clip_${i + 1}`,
      }))
    } else {
      db.clips[run.run_id] = []
    }
    db.approvals[run.run_id] = {}
    db.runOrder.push(run.run_id)
  }

  db.presets = RENDER_PRESETS
  // Grounding state is created lazily on first PUT — start empty.
  db.grounding = {}

  // Timeline data — seeded for every run so the editor always has something to render.
  db.timelines = {}
  for (const runId of [DEMO_RUN_ID, ...SECONDARY_RUNS.map((r) => r.run_id)]) {
    db.timelines[runId] = generateTimeline(runId)
  }
}
