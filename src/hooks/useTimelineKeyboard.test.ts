import { renderHook, act } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useTimelineKeyboard } from './useTimelineKeyboard'
import { useTimelineStore } from '@/stores/timeline-store'

const INITIAL_PPS = 50
const INITIAL_POSITION = 10
const SEEK_STEP = 5

function resetStore(overrides: Partial<Parameters<typeof useTimelineStore.setState>[0]> = {}) {
  useTimelineStore.setState(
    {
      playbackState: 'paused',
      playheadPosition: INITIAL_POSITION,
      pixelsPerSecond: INITIAL_PPS,
      ...overrides,
    },
    false,
  )
}

function getState() {
  return useTimelineStore.getState()
}

describe('useTimelineKeyboard', () => {
  beforeEach(() => {
    resetStore()
  })

  afterEach(() => {
    // Clean up any stray input elements added during tests
    document.querySelectorAll('input[data-test]').forEach(el => el.remove())
  })

  it('Space key starts playback when paused', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: ' ' }) })
    expect(getState().playbackState).toBe('playing')
  })

  it('Space key pauses when playing', () => {
    resetStore({ playbackState: 'playing' })
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: ' ' }) })
    expect(getState().playbackState).toBe('paused')
  })

  it('K key toggles play when paused', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'k' }) })
    expect(getState().playbackState).toBe('playing')
  })

  it('K key toggles pause when playing', () => {
    resetStore({ playbackState: 'playing' })
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'K' }) })
    expect(getState().playbackState).toBe('paused')
  })

  it('ArrowRight seeks forward by seekStep', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'ArrowRight' }) })
    expect(getState().playheadPosition).toBe(INITIAL_POSITION + SEEK_STEP)
  })

  it('ArrowLeft seeks backward by seekStep', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'ArrowLeft' }) })
    expect(getState().playheadPosition).toBe(INITIAL_POSITION - SEEK_STEP)
  })

  it('ArrowLeft clamps to 0 when seek would go negative', () => {
    resetStore({ playheadPosition: 2 })
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'ArrowLeft' }) })
    expect(getState().playheadPosition).toBe(0)
  })

  it('Shift+ArrowRight seeks forward by seekStep * 5', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'ArrowRight', shiftKey: true }) })
    expect(getState().playheadPosition).toBe(INITIAL_POSITION + SEEK_STEP * 5)
  })

  it('Shift+ArrowLeft seeks backward by seekStep * 5', () => {
    resetStore({ playheadPosition: 100 })
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'ArrowLeft', shiftKey: true }) })
    expect(getState().playheadPosition).toBe(100 - SEEK_STEP * 5)
  })

  it('0 key seeks to start', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: '0' }) })
    expect(getState().playheadPosition).toBe(0)
  })

  it('Home key seeks to start', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: 'Home' }) })
    expect(getState().playheadPosition).toBe(0)
  })

  it('+ key calls zoomIn', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: '+' }) })
    expect(getState().pixelsPerSecond).toBeGreaterThan(INITIAL_PPS)
  })

  it('= key calls zoomIn', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: '=' }) })
    expect(getState().pixelsPerSecond).toBeGreaterThan(INITIAL_PPS)
  })

  it('] key calls zoomIn', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: ']' }) })
    expect(getState().pixelsPerSecond).toBeGreaterThan(INITIAL_PPS)
  })

  it('- key calls zoomOut', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: '-' }) })
    expect(getState().pixelsPerSecond).toBeLessThan(INITIAL_PPS)
  })

  it('[ key calls zoomOut', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))
    act(() => { fireEvent.keyDown(document, { key: '[' }) })
    expect(getState().pixelsPerSecond).toBeLessThan(INITIAL_PPS)
  })

  it('Space does NOT toggle playback when an input element is focused', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))

    const input = document.createElement('input')
    input.setAttribute('data-test', 'true')
    document.body.appendChild(input)
    input.focus()

    act(() => { fireEvent.keyDown(input, { key: ' ' }) })

    expect(getState().playbackState).toBe('paused')

    input.remove()
  })

  it('Space does NOT toggle playback when a textarea is focused', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP }))

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()

    act(() => { fireEvent.keyDown(textarea, { key: ' ' }) })

    expect(getState().playbackState).toBe('paused')

    textarea.remove()
  })

  it('enabled: false disables all shortcuts', () => {
    renderHook(() => useTimelineKeyboard({ seekStep: SEEK_STEP, enabled: false }))
    act(() => { fireEvent.keyDown(document, { key: ' ' }) })
    act(() => { fireEvent.keyDown(document, { key: 'ArrowRight' }) })
    act(() => { fireEvent.keyDown(document, { key: '+' }) })

    expect(getState().playbackState).toBe('paused')
    expect(getState().playheadPosition).toBe(INITIAL_POSITION)
    expect(getState().pixelsPerSecond).toBe(INITIAL_PPS)
  })
})
