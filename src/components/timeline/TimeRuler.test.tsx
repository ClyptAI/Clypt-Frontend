import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { TimeRuler } from './TimeRuler'
import { getTickConfig, formatRulerTime } from './TimeRuler'

const defaultProps = {
  duration: 60,
  pixelsPerSecond: 100,
  scrollX: 0,
  viewportWidth: 800,
  onSeek: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TimeRuler', () => {
  it('renders without crashing with valid props', () => {
    const { container } = render(<TimeRuler {...defaultProps} />)
    expect(container.firstChild).toBeTruthy()
  })

  describe('getTickConfig', () => {
    // Boundaries are strict (pps > N), so we use values strictly inside each range

    it('returns minor:0.01 major:0.1 for pps > 500 (e.g. 600)', () => {
      const config = getTickConfig(600)
      expect(config.minor).toBe(0.01)
      expect(config.major).toBe(0.1)
      expect(config.label).toBe(0.5)
    })

    it('returns minor:0.05 major:0.5 for 200 < pps <= 500 (e.g. 300)', () => {
      const config = getTickConfig(300)
      expect(config.minor).toBe(0.05)
      expect(config.major).toBe(0.5)
      expect(config.label).toBe(1)
    })

    it('returns minor:0.1 major:1 for 100 < pps <= 200 (e.g. 150)', () => {
      const config = getTickConfig(150)
      expect(config.minor).toBe(0.1)
      expect(config.major).toBe(1)
      expect(config.label).toBe(1)
    })

    it('returns minor:0.5 major:1 for 50 < pps <= 100 (e.g. 75)', () => {
      const config = getTickConfig(75)
      expect(config.minor).toBe(0.5)
      expect(config.major).toBe(1)
      expect(config.label).toBe(5)
    })

    it('returns minor:1 major:5 for 20 < pps <= 50 (e.g. 30)', () => {
      const config = getTickConfig(30)
      expect(config.minor).toBe(1)
      expect(config.major).toBe(5)
      expect(config.label).toBe(5)
    })

    it('returns minor:5 major:10 for pps <= 20 (e.g. 10)', () => {
      const config = getTickConfig(10)
      expect(config.minor).toBe(5)
      expect(config.major).toBe(10)
      expect(config.label).toBe(10)
    })
  })

  describe('formatRulerTime', () => {
    it('formats seconds under a minute as m:ss', () => {
      expect(formatRulerTime(0)).toBe('0:00')
      expect(formatRulerTime(5)).toBe('0:05')
      expect(formatRulerTime(59)).toBe('0:59')
    })

    it('formats minutes correctly', () => {
      expect(formatRulerTime(60)).toBe('1:00')
      expect(formatRulerTime(90)).toBe('1:30')
      expect(formatRulerTime(125)).toBe('2:05')
    })
  })

  describe('major tick rendering', () => {
    it('renders major ticks at expected positions for pixelsPerSecond=100', () => {
      const { container } = render(
        <TimeRuler {...defaultProps} pixelsPerSecond={100} scrollX={0} viewportWidth={400} duration={10} />
      )
      // pps=100 → major every 1s; 400px / 100pps = 4s visible → ticks at 0,1,2,3,4
      const majorTicks = container.querySelectorAll('.h-4')
      expect(majorTicks.length).toBeGreaterThanOrEqual(4)
    })

    it('renders more major ticks for wider viewport', () => {
      const { container: small } = render(
        <TimeRuler {...defaultProps} pixelsPerSecond={100} scrollX={0} viewportWidth={200} duration={60} />
      )
      const { container: large } = render(
        <TimeRuler {...defaultProps} pixelsPerSecond={100} scrollX={0} viewportWidth={600} duration={60} />
      )
      const smallCount = small.querySelectorAll('.h-4').length
      const largeCount = large.querySelectorAll('.h-4').length
      expect(largeCount).toBeGreaterThan(smallCount)
    })
  })

  describe('seek interaction', () => {
    it('calls onSeek when mouse is pressed', () => {
      const onSeek = vi.fn()
      const { container } = render(
        <TimeRuler {...defaultProps} onSeek={onSeek} pixelsPerSecond={100} scrollX={0} />
      )
      const ruler = container.firstChild as HTMLElement
      // In jsdom, getBoundingClientRect returns zeros, so x = clientX - 0 + scrollX = 200
      // time = 200 / 100 = 2s
      fireEvent.mouseDown(ruler, { clientX: 200, clientY: 10 })
      expect(onSeek).toHaveBeenCalledTimes(1)
      expect(onSeek).toHaveBeenCalledWith(2)
    })

    it('calls onScrubStart when mouse is pressed', () => {
      const onScrubStart = vi.fn()
      const { container } = render(
        <TimeRuler {...defaultProps} onScrubStart={onScrubStart} />
      )
      const ruler = container.firstChild as HTMLElement
      fireEvent.mouseDown(ruler, { clientX: 100, clientY: 10 })
      expect(onScrubStart).toHaveBeenCalledTimes(1)
    })

    it('clamps seek time to [0, duration]', () => {
      const onSeek = vi.fn()
      const { container } = render(
        <TimeRuler {...defaultProps} onSeek={onSeek} duration={10} pixelsPerSecond={100} scrollX={0} />
      )
      const ruler = container.firstChild as HTMLElement
      // clientX=2000 → raw time = 20s, but duration=10 → clamp to 10
      fireEvent.mouseDown(ruler, { clientX: 2000, clientY: 10 })
      expect(onSeek).toHaveBeenCalledWith(10)
    })
  })
})
