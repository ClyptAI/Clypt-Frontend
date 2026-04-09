// ─── Primitive union types ────────────────────────────────────────────────────

export type NodeType =
  | 'claim'
  | 'explanation'
  | 'example'
  | 'anecdote'
  | 'reaction_beat'
  | 'qa_exchange'
  | 'challenge_exchange'
  | 'setup_payoff'
  | 'reveal'
  | 'transition'

export type NodeFlag =
  | 'topic_pivot'
  | 'callback_candidate'
  | 'high_resonance_candidate'
  | 'backchannel_dense'
  | 'interruption_heavy'
  | 'overlap_heavy'
  | 'resumed_topic'

export type EdgeType =
  | 'next_turn'
  | 'prev_turn'
  | 'overlaps_with'
  | 'answers'
  | 'challenges'
  | 'contradicts'
  | 'supports'
  | 'elaborates'
  | 'setup_for'
  | 'payoff_of'
  | 'reaction_to'
  | 'callback_to'
  | 'topic_recurrence'
  | 'escalates'

export type EmotionLabel =
  | 'angry'
  | 'disgusted'
  | 'fearful'
  | 'happy'
  | 'neutral'
  | 'other'
  | 'sad'
  | 'surprised'
  | 'unknown'

// ─── Phase 1: Timeline Foundation ─────────────────────────────────────────────

export interface TranscriptWord {
  word_id: string
  text: string
  start_ms: number
  end_ms: number
  speaker_id: string | null
}

export interface CanonicalTurn {
  turn_id: string
  speaker_id: string
  start_ms: number
  end_ms: number
  word_ids: string[]
  transcript_text: string
  identification_match: string | null
}

export interface CanonicalTimeline {
  words: TranscriptWord[]
  turns: CanonicalTurn[]
  source_video_url: string | null
  video_gcs_uri: string | null
}

export interface SpeechEmotionEvent {
  turn_id: string
  primary_emotion_label: EmotionLabel
  primary_emotion_score: number
  per_class_scores: Record<EmotionLabel, number>
}

export interface SpeechEmotionTimeline {
  events: SpeechEmotionEvent[]
}

export interface AudioEvent {
  event_label: string
  start_ms: number
  end_ms: number
  confidence: number | null
}

export interface AudioEventTimeline {
  events: AudioEvent[]
}

export interface ShotTrackletDescriptor {
  tracklet_id: string
  shot_id: string
  start_ms: number
  end_ms: number
  representative_thumbnail_uris: string[]
}

export interface ShotTrackletIndex {
  tracklets: ShotTrackletDescriptor[]
}

export interface TrackletGeometryPoint {
  frame_index: number
  timestamp_ms: number
  bbox_xyxy: [number, number, number, number]
}

export interface TrackletGeometryEntry {
  tracklet_id: string
  shot_id: string
  points: TrackletGeometryPoint[]
}

export interface TrackletGeometry {
  tracklets: TrackletGeometryEntry[]
}

// ─── Phase 2: Node Construction ───────────────────────────────────────────────

export interface SemanticNodeEvidence {
  emotion_labels: EmotionLabel[]
  audio_events: string[]
}

export interface SemanticGraphNode {
  node_id: string
  node_type: NodeType
  start_ms: number
  end_ms: number
  source_turn_ids: string[]
  word_ids: string[]
  transcript_text: string
  node_flags: NodeFlag[]
  summary: string
  evidence: SemanticNodeEvidence
  semantic_embedding: number[] | null
  multimodal_embedding: number[] | null
}

// ─── Phase 3: Graph Construction ──────────────────────────────────────────────

export interface SemanticGraphEdge {
  source_node_id: string
  target_node_id: string
  edge_type: EdgeType
  rationale: string | null
  confidence: number | null
  support_count: number | null
  batch_ids: string[]
}

// ─── Phase 4: Candidates ──────────────────────────────────────────────────────

export interface LocalSubgraphNodeEdge {
  edge_type: EdgeType
  target_node_id: string
}

export interface LocalSubgraphNode {
  node_id: string
  start_ms: number
  end_ms: number
  duration_ms: number
  node_type: NodeType
  node_flags: NodeFlag[]
  summary: string
  transcript_excerpt: string
  word_count: number
  emotion_labels: EmotionLabel[]
  audio_events: string[]
  inbound_edges: LocalSubgraphNodeEdge[]
  outbound_edges: LocalSubgraphNodeEdge[]
}

export interface LocalSubgraph {
  subgraph_id: string
  seed_node_id: string
  source_prompt_ids: string[]
  start_ms: number
  end_ms: number
  nodes: LocalSubgraphNode[]
}

export interface ClipCandidate {
  clip_id: string | null
  node_ids: string[]
  start_ms: number
  end_ms: number
  score: number
  rationale: string
  source_prompt_ids: string[]
  seed_node_id: string | null
  subgraph_id: string | null
  query_aligned: boolean | null
  pool_rank: number | null
  score_breakdown: Record<string, number> | null
}

// ─── API / UI utility types ───────────────────────────────────────────────────

export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6

export type PhaseStatus = 'pending' | 'running' | 'completed' | 'failed' | 'needs_action'

export interface PhaseStatusEntry {
  phase: PhaseNumber
  name: string
  status: PhaseStatus
  elapsed_s: number | null
  summary: string | null
  artifact_keys: string[]
}

export interface RunMeta {
  run_id: string
  source_url: string
  created_at: string       // ISO 8601
  display_name: string | null
}

export interface RunDetail extends RunMeta {
  phases: PhaseStatusEntry[]
  node_count: number | null
  edge_count: number | null
  clip_count: number | null
}

export interface RunListItem extends RunMeta {
  latest_phase: PhaseNumber
  latest_status: PhaseStatus
  clip_count: number | null
}

export interface RenderPreset {
  id: string
  platform: string
  label: string
  aspect_ratio: '9:16' | '1:1' | '16:9'
  width: number
  height: number
  frame_rate: number
  max_duration_s: number | null
}

export interface RenderJobStatus {
  clip_id: string
  status: 'queued' | 'rendering' | 'completed' | 'failed'
  progress_pct: number | null
  output_url: string | null
  error: string | null
}
