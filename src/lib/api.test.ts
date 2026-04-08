import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClyptApiError, runsApi, clipsApi } from './api'

function mockFetch(data: unknown, ok = true, status = 200, statusText = 'OK') {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText,
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('ClyptApiError', () => {
  it('stores status and statusText', () => {
    const err = new ClyptApiError(404, 'Not Found')
    expect(err.status).toBe(404)
    expect(err.statusText).toBe('Not Found')
    expect(err.message).toBe('404 Not Found')
    expect(err.name).toBe('ClyptApiError')
  })

  it('accepts a custom message', () => {
    const err = new ClyptApiError(500, 'Internal Server Error', 'custom')
    expect(err.message).toBe('custom')
  })
})

describe('runsApi.list', () => {
  it('calls GET /v1/runs and returns array', async () => {
    const payload = [{ run_id: 'r1' }]
    vi.stubGlobal('fetch', mockFetch(payload))

    const result = await runsApi.list()

    expect(fetch).toHaveBeenCalledOnce()
    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toMatch(/\/v1\/runs$/)
    expect(result).toEqual(payload)
  })
})

describe('runsApi.get', () => {
  it('calls GET /v1/runs/run1', async () => {
    const payload = { run_id: 'run1' }
    vi.stubGlobal('fetch', mockFetch(payload))

    await runsApi.get('run1')

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toMatch(/\/v1\/runs\/run1$/)
  })
})

describe('runsApi.create', () => {
  it('sends source_url in POST body', async () => {
    vi.stubGlobal('fetch', mockFetch({ run_id: 'new' }))

    await runsApi.create('https://example.com/video', 'My Video')

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body as string)
    expect(body.source_url).toBe('https://example.com/video')
    expect(body.display_name).toBe('My Video')
  })

  it('sends source_url without display_name when omitted', async () => {
    vi.stubGlobal('fetch', mockFetch({ run_id: 'new' }))

    await runsApi.create('https://example.com/video')

    const [, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(init.body as string)
    expect(body.source_url).toBe('https://example.com/video')
  })
})

describe('clipsApi.approve', () => {
  it('calls POST /v1/runs/run1/clips/clip1/approve', async () => {
    vi.stubGlobal('fetch', mockFetch({ clip_id: 'clip1' }))

    await clipsApi.approve('run1', 'clip1')

    const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toMatch(/\/v1\/runs\/run1\/clips\/clip1\/approve$/)
    expect(init.method).toBe('POST')
  })
})

describe('apiFetch error handling', () => {
  it('throws ClyptApiError on non-ok response', async () => {
    vi.stubGlobal('fetch', mockFetch(null, false, 404, 'Not Found'))

    await expect(runsApi.list()).rejects.toThrow(ClyptApiError)
    await expect(runsApi.list()).rejects.toMatchObject({ status: 404, statusText: 'Not Found' })
  })
})
