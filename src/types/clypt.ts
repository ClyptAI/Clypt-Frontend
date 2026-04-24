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

export type ClipApprovalStatus = 'pending' | 'approved' | 'rejected'

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
  approval_status: ClipApprovalStatus
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

// ─── Timeline bundle (Phase 1 data surfaced to the editor) ───────────────────
//
// A compact, page-friendly bundle returned by GET /v1/runs/:id/timeline.
// All timestamps are in milliseconds to match the rest of the API.

export interface TimelineSpeakerTurn {
  turn_id: string
  speaker_id: string
  start_ms: number
  end_ms: number
  transcript_text: string
  emotion_primary: EmotionLabel
  emotion_score: number
  emotion_secondary: Array<{ label: EmotionLabel; score: number }>
}

export interface TimelineSpeaker {
  speaker_id: string
  display_name: string
  turns: TimelineSpeakerTurn[]
}

export interface TimelineEmotionSegment {
  start_ms: number
  end_ms: number
  label: EmotionLabel
}

export interface TimelineAudioEvent {
  start_ms: number
  end_ms: number
  label: string
  confidence: number
}

export interface TimelineShotTracklets {
  shot_id: string
  start_ms: number
  end_ms: number
  tracklet_letters: string[]
}

export interface TimelineShot {
  shot_id: string
  start_ms: number
  end_ms: number
}

export interface TimelineBundle {
  duration_ms: number
  shots: TimelineShot[]
  shot_tracklets: TimelineShotTracklets[]
  speakers: TimelineSpeaker[]
  emotions: TimelineEmotionSegment[]
  audio_events: TimelineAudioEvent[]
}

// ─── Grounding (manual bounding box editor) ──────────────────────────────────
//
// Persists the user's edits to the per-shot tracker output on the Grounding
// page: rect overrides, user-added tracklets, and removed originals. Stored
// per (run_id, clip_id) — multiple shots are nested inside `shots`.

export interface BoundingBoxRect {
  x: number      // 0..1, left edge as fraction of container width
  y: number      // 0..1, top edge as fraction of container height
  w: number      // 0..1, width as fraction of container width
  h: number      // 0..1, height as fraction of container height
}

export interface GroundingTracklet {
  id: string
  letter: string
  duration_pct: number
}

export interface GroundingBinding {
  tracklet_id: string
  speaker_id: number
  start_ms: number
  end_ms: number
  method: 'drag' | 'word' | 'range'
}

export type GroundingIntentType = 'Follow' | 'Reaction' | 'Split' | 'Wide' | 'Manual'

export interface GroundingIntent {
  intent: GroundingIntentType
  follow?: number
  react_on?: number
  react_follow?: number
  split_left?: number
  split_right?: number
  wide_includes?: number[]
  crop_set?: boolean
}

export interface GroundingCropPosition {
  x_percent: number
  y_percent: number
  height_percent: number
}

export interface GroundingShotState {
  shot_idx: number
  /** Tracklet id -> rect override (covers both originals the user moved and user-added boxes). */
  rects: Record<string, BoundingBoxRect>
  /** Boxes the user added on top of the original tracker output. */
  user_tracklets: GroundingTracklet[]
  /** Original tracklet ids the user removed via the editor. */
  hidden_tracklet_ids: string[]
  /**
   * Per-shot persisted edits to bindings/intent/manual_crop. **Optional on
   * purpose** — `undefined` means "the user has not touched this aspect of
   * this shot, fall back to the seed default". An explicit empty array (or
   * `null` for the singletons) means "user cleared it".
   */
  bindings?: GroundingBinding[]
  intent?: GroundingIntent
  manual_crop?: GroundingCropPosition
}

export interface GroundingClipState {
  run_id: string
  clip_id: string
  shots: GroundingShotState[]
  updated_at: string  // ISO 8601
}
