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

// ─── Demo run: "Lex ep. 412 — Sam Altman" (all phases complete) ──────────────

const DEMO_RUN_ID = 'demo'

const DEMO_RUN: RunDetail = {
  run_id: DEMO_RUN_ID,
  source_url: 'https://youtube.com/watch?v=demo412',
  display_name: 'Lex ep. 412 — Sam Altman',
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
    start_ms: ts(0, 42),
    end_ms: ts(1, 18),
    score: 8.4,
    rationale: 'Strong hook-to-payoff arc with audience laughter at the peak.',
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
    start_ms: ts(3, 22),
    end_ms: ts(4, 5),
    score: 8.1,
    rationale:
      'Direct answer to query with a surprising reveal that creates a natural clip boundary.',
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
    start_ms: ts(1, 50),
    end_ms: ts(2, 31),
    score: 7.9,
    rationale: 'High-tension pushback moment with clear rhetorical structure.',
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
    start_ms: ts(6, 10),
    end_ms: ts(6, 48),
    score: 7.6,
    rationale: 'Personal story lands with genuine emotional reaction from the host.',
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
    start_ms: ts(8, 5),
    end_ms: ts(8, 44),
    score: 7.3,
    rationale: 'Clean setup with a technical explanation payoff — good educational clip.',
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
    start_ms: ts(11, 22),
    end_ms: ts(12, 0),
    score: 7.0,
    rationale: 'Surprise reveal followed by a bold claim — strong standalone moment.',
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
    start_ms: ts(14, 33),
    end_ms: ts(15, 10),
    score: 6.8,
    rationale:
      'Addresses the query with a concrete example — slightly lower energy than top clips.',
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
    start_ms: ts(17, 2),
    end_ms: ts(17, 38),
    score: 6.5,
    rationale:
      'Solid transition into a new topic with useful context — works as a segment opener.',
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

const NODE_TYPE_ROTATION: NodeType[] = [
  'claim',
  'explanation',
  'qa_exchange',
  'reaction_beat',
  'setup_payoff',
  'reveal',
  'challenge_exchange',
  'anecdote',
  'transition',
  'example',
]

function generateDemoNodes(runId: string): SemanticGraphNode[] {
  const out: SemanticGraphNode[] = []
  let cursor = 0
  for (let i = 0; i < 27; i++) {
    const duration = 6000 + (i % 5) * 1500
    const nodeType = NODE_TYPE_ROTATION[i % NODE_TYPE_ROTATION.length]
    out.push({
      node_id: `node_${String(i + 1).padStart(3, '0')}`,
      node_type: nodeType,
      start_ms: cursor,
      end_ms: cursor + duration,
      source_turn_ids: [`turn_${i + 1}`],
      word_ids: [],
      transcript_text: `Synthetic node ${i + 1}: ${nodeType} beat for demo run ${runId}.`,
      node_flags: [],
      summary: `Demo ${nodeType} node — position ${i + 1} of 27.`,
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
        rationale: `Mock rhetorical ${type} link`,
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
}
