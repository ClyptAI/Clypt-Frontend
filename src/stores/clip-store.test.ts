import { describe, it, expect, beforeEach } from 'vitest'
import { useClipStore } from './clip-store'
import type { ClipCandidate } from '../types/clypt'

function makeClip(overrides?: Partial<ClipCandidate>): ClipCandidate {
  return {
    clip_id: 'clip-1',
    node_ids: [],
    start_ms: 0,
    end_ms: 10000,
    score: 0.5,
    rationale: 'test rationale',
    source_prompt_ids: [],
    seed_node_id: null,
    subgraph_id: null,
    query_aligned: null,
    pool_rank: null,
    score_breakdown: null,
    ...overrides,
  }
}

beforeEach(() => {
  useClipStore.setState({
    clips: [],
    activeClipId: null,
    approvalOverrides: {},
    isLoading: false,
    error: null,
  })
})

describe('ClipStore — initial state', () => {
  it('has empty clips array', () => {
    expect(useClipStore.getState().clips).toEqual([])
  })

  it('has activeClipId = null', () => {
    expect(useClipStore.getState().activeClipId).toBeNull()
  })

  it('has empty approvalOverrides', () => {
    expect(useClipStore.getState().approvalOverrides).toEqual({})
  })

  it('has isLoading = false', () => {
    expect(useClipStore.getState().isLoading).toBe(false)
  })

  it('has error = null', () => {
    expect(useClipStore.getState().error).toBeNull()
  })
})

describe('ClipStore — setClips', () => {
  it('populates the clips array', () => {
    const clips = [makeClip({ clip_id: 'a' }), makeClip({ clip_id: 'b' })]
    useClipStore.getState().setClips(clips)
    expect(useClipStore.getState().clips).toHaveLength(2)
    expect(useClipStore.getState().clips[0].clip_id).toBe('a')
    expect(useClipStore.getState().clips[1].clip_id).toBe('b')
  })

  it('replaces existing clips', () => {
    useClipStore.getState().setClips([makeClip({ clip_id: 'old' })])
    useClipStore.getState().setClips([makeClip({ clip_id: 'new1' }), makeClip({ clip_id: 'new2' })])
    expect(useClipStore.getState().clips).toHaveLength(2)
    expect(useClipStore.getState().clips[0].clip_id).toBe('new1')
  })
})

describe('ClipStore — approveClip', () => {
  it('sets approval state to approved', () => {
    useClipStore.getState().setClips([makeClip({ clip_id: 'clip-1' })])
    useClipStore.getState().approveClip('clip-1')
    expect(useClipStore.getState().getApprovalState('clip-1')).toBe('approved')
  })

  it('does not affect other clips', () => {
    useClipStore.getState().approveClip('clip-1')
    expect(useClipStore.getState().getApprovalState('clip-2')).toBe('pending')
  })
})

describe('ClipStore — rejectClip', () => {
  it('sets approval state to rejected', () => {
    useClipStore.getState().rejectClip('clip-1')
    expect(useClipStore.getState().getApprovalState('clip-1')).toBe('rejected')
  })
})

describe('ClipStore — resetApproval', () => {
  it('removes the override so state falls back to pending', () => {
    useClipStore.getState().approveClip('clip-1')
    useClipStore.getState().resetApproval('clip-1')
    expect(useClipStore.getState().getApprovalState('clip-1')).toBe('pending')
  })
})

describe('ClipStore — getApprovalState', () => {
  it('returns pending for unknown clip', () => {
    expect(useClipStore.getState().getApprovalState('nonexistent')).toBe('pending')
  })

  it('returns approved after approveClip', () => {
    useClipStore.getState().approveClip('clip-x')
    expect(useClipStore.getState().getApprovalState('clip-x')).toBe('approved')
  })

  it('returns rejected after rejectClip', () => {
    useClipStore.getState().rejectClip('clip-y')
    expect(useClipStore.getState().getApprovalState('clip-y')).toBe('rejected')
  })
})

describe('ClipStore — getSortedClips', () => {
  it('sorts clips by score descending', () => {
    const clips = [
      makeClip({ clip_id: 'low', score: 0.2 }),
      makeClip({ clip_id: 'high', score: 0.9 }),
      makeClip({ clip_id: 'mid', score: 0.5 }),
    ]
    useClipStore.getState().setClips(clips)
    const sorted = useClipStore.getState().getSortedClips()
    expect(sorted[0].clip_id).toBe('high')
    expect(sorted[1].clip_id).toBe('mid')
    expect(sorted[2].clip_id).toBe('low')
  })

  it('does not mutate the original clips array', () => {
    const clips = [
      makeClip({ clip_id: 'a', score: 0.1 }),
      makeClip({ clip_id: 'b', score: 0.8 }),
    ]
    useClipStore.getState().setClips(clips)
    useClipStore.getState().getSortedClips()
    expect(useClipStore.getState().clips[0].clip_id).toBe('a')
  })
})

describe('ClipStore — getPendingClips', () => {
  it('returns clips without approval overrides', () => {
    const clips = [
      makeClip({ clip_id: 'clip-1' }),
      makeClip({ clip_id: 'clip-2' }),
      makeClip({ clip_id: 'clip-3' }),
    ]
    useClipStore.getState().setClips(clips)
    useClipStore.getState().approveClip('clip-1')
    useClipStore.getState().rejectClip('clip-2')
    const pending = useClipStore.getState().getPendingClips()
    expect(pending).toHaveLength(1)
    expect(pending[0].clip_id).toBe('clip-3')
  })

  it('returns all clips when none are approved or rejected', () => {
    useClipStore.getState().setClips([
      makeClip({ clip_id: 'a' }),
      makeClip({ clip_id: 'b' }),
    ])
    expect(useClipStore.getState().getPendingClips()).toHaveLength(2)
  })
})

describe('ClipStore — getApprovedClips / getRejectedClips', () => {
  it('getApprovedClips returns only approved clips', () => {
    const clips = [
      makeClip({ clip_id: 'clip-1' }),
      makeClip({ clip_id: 'clip-2' }),
    ]
    useClipStore.getState().setClips(clips)
    useClipStore.getState().approveClip('clip-1')
    const approved = useClipStore.getState().getApprovedClips()
    expect(approved).toHaveLength(1)
    expect(approved[0].clip_id).toBe('clip-1')
  })

  it('getRejectedClips returns only rejected clips', () => {
    const clips = [
      makeClip({ clip_id: 'clip-1' }),
      makeClip({ clip_id: 'clip-2' }),
    ]
    useClipStore.getState().setClips(clips)
    useClipStore.getState().rejectClip('clip-2')
    const rejected = useClipStore.getState().getRejectedClips()
    expect(rejected).toHaveLength(1)
    expect(rejected[0].clip_id).toBe('clip-2')
  })
})

describe('ClipStore — reset', () => {
  it('clears all state', () => {
    useClipStore.getState().setClips([makeClip({ clip_id: 'x' })])
    useClipStore.getState().setActiveClipId('x')
    useClipStore.getState().approveClip('x')
    useClipStore.setState({ isLoading: true, error: 'oops' })

    useClipStore.getState().reset()

    const state = useClipStore.getState()
    expect(state.clips).toEqual([])
    expect(state.activeClipId).toBeNull()
    expect(state.approvalOverrides).toEqual({})
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})
