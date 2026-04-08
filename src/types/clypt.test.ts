import { describe, it, expect } from 'vitest'
import type {
  ClipCandidate,
  NodeType,
  CanonicalTurn,
  PhaseStatusEntry,
  RenderPreset,
  SemanticGraphEdge,
  SpeechEmotionEvent,
} from './clypt'

describe('ClipCandidate', () => {
  it('accepts valid shape', () => {
    const c: ClipCandidate = {
      clip_id: 'abc',
      node_ids: ['n1'],
      start_ms: 0,
      end_ms: 5000,
      score: 8.4,
      rationale: 'good clip',
      source_prompt_ids: [],
      seed_node_id: null,
      subgraph_id: null,
      query_aligned: false,
      pool_rank: 1,
      score_breakdown: { overall: 8.4 },
    }
    expect(c.score).toBe(8.4)
    expect(c.clip_id).toBe('abc')
  })

  it('accepts null optional fields', () => {
    const c: ClipCandidate = {
      clip_id: null,
      node_ids: ['n1', 'n2'],
      start_ms: 1000,
      end_ms: 6000,
      score: 7.0,
      rationale: 'decent clip',
      source_prompt_ids: ['p1'],
      seed_node_id: null,
      subgraph_id: null,
      query_aligned: null,
      pool_rank: null,
      score_breakdown: null,
    }
    expect(c.clip_id).toBeNull()
    expect(c.node_ids).toHaveLength(2)
  })
})

describe('NodeType', () => {
  it('is one of the expected values', () => {
    const valid: NodeType[] = ['claim', 'anecdote', 'qa_exchange', 'setup_payoff', 'reveal']
    expect(valid).toContain('claim')
  })

  it('covers all defined node types', () => {
    const allTypes: NodeType[] = [
      'claim',
      'explanation',
      'example',
      'anecdote',
      'reaction_beat',
      'qa_exchange',
      'challenge_exchange',
      'setup_payoff',
      'reveal',
      'transition',
    ]
    expect(allTypes).toHaveLength(10)
  })
})

describe('CanonicalTurn', () => {
  it('accepts a valid turn object', () => {
    const turn: CanonicalTurn = {
      turn_id: 't_001',
      speaker_id: 'spk_0',
      start_ms: 0,
      end_ms: 3200,
      word_ids: ['w_0', 'w_1', 'w_2'],
      transcript_text: 'Hello world.',
      identification_match: null,
    }
    expect(turn.turn_id).toBe('t_001')
    expect(turn.word_ids).toHaveLength(3)
    expect(turn.identification_match).toBeNull()
  })

  it('accepts identification_match as a string', () => {
    const turn: CanonicalTurn = {
      turn_id: 't_002',
      speaker_id: 'spk_1',
      start_ms: 3200,
      end_ms: 7000,
      word_ids: [],
      transcript_text: 'Sure, definitely.',
      identification_match: 'Joe Rogan',
    }
    expect(turn.identification_match).toBe('Joe Rogan')
  })
})

describe('PhaseStatusEntry', () => {
  it('accepts valid shape with all fields', () => {
    const entry: PhaseStatusEntry = {
      phase: 2,
      name: 'Node Construction',
      status: 'completed',
      elapsed_s: 12.4,
      summary: '84 nodes built',
      artifact_keys: ['semantics/nodes.json'],
    }
    expect(entry.phase).toBe(2)
    expect(entry.status).toBe('completed')
    expect(entry.artifact_keys).toHaveLength(1)
  })

  it('accepts null elapsed_s and summary', () => {
    const entry: PhaseStatusEntry = {
      phase: 5,
      name: 'Speaker Grounding',
      status: 'pending',
      elapsed_s: null,
      summary: null,
      artifact_keys: [],
    }
    expect(entry.elapsed_s).toBeNull()
    expect(entry.summary).toBeNull()
    expect(entry.status).toBe('pending')
  })
})

describe('RenderPreset', () => {
  it('accepts a vertical short-form preset', () => {
    const preset: RenderPreset = {
      id: 'tiktok_9x16',
      platform: 'TikTok',
      label: 'TikTok / Reels',
      aspect_ratio: '9:16',
      width: 1080,
      height: 1920,
      frame_rate: 30,
      max_duration_s: 60,
    }
    expect(preset.aspect_ratio).toBe('9:16')
    expect(preset.width).toBe(1080)
  })

  it('accepts a square preset with null max_duration_s', () => {
    const preset: RenderPreset = {
      id: 'instagram_1x1',
      platform: 'Instagram',
      label: 'Instagram Square',
      aspect_ratio: '1:1',
      width: 1080,
      height: 1080,
      frame_rate: 24,
      max_duration_s: null,
    }
    expect(preset.aspect_ratio).toBe('1:1')
    expect(preset.max_duration_s).toBeNull()
  })
})

describe('SemanticGraphEdge', () => {
  it('accepts valid edge with all fields', () => {
    const edge: SemanticGraphEdge = {
      source_node_id: 'n_001',
      target_node_id: 'n_002',
      edge_type: 'setup_for',
      rationale: 'n_001 sets up the punchline in n_002',
      confidence: 0.92,
      support_count: 3,
      batch_ids: ['batch_0'],
    }
    expect(edge.edge_type).toBe('setup_for')
    expect(edge.confidence).toBe(0.92)
  })
})

describe('SpeechEmotionEvent', () => {
  it('accepts a valid emotion event', () => {
    const event: SpeechEmotionEvent = {
      turn_id: 't_001',
      primary_emotion_label: 'happy',
      primary_emotion_score: 0.87,
      per_class_scores: {
        angry: 0.01,
        disgusted: 0.01,
        fearful: 0.02,
        happy: 0.87,
        neutral: 0.05,
        other: 0.01,
        sad: 0.01,
        surprised: 0.01,
        unknown: 0.01,
      },
    }
    expect(event.primary_emotion_label).toBe('happy')
    expect(event.per_class_scores.happy).toBe(0.87)
  })
})
