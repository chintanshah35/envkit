import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { env } from '../src/env'

describe('env', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('parses simple schema', () => {
    process.env.PORT = '3000'
    process.env.HOST = 'localhost'

    const result = env({
      PORT: { type: 'number' },
      HOST: { type: 'string' },
    })

    expect(result.PORT).toBe(3000)
    expect(result.HOST).toBe('localhost')
  })

  it('uses default values', () => {
    const result = env({
      PORT: { type: 'number', default: 8080 },
      DEBUG: { type: 'boolean', default: false },
    })

    expect(result.PORT).toBe(8080)
    expect(result.DEBUG).toBe(false)
  })

  it('throws on missing required vars', () => {
    expect(() => env({
      API_KEY: { type: 'string' },
    })).toThrow('Missing required environment variable')
  })

  it('allows optional vars', () => {
    const result = env({
      OPTIONAL: { type: 'string', optional: true },
    })

    expect(result.OPTIONAL).toBeUndefined()
  })

  it('validates all types correctly', () => {
    process.env.STR = 'hello'
    process.env.NUM = '42'
    process.env.BOOL = 'true'
    process.env.URL = 'https://example.com'
    process.env.EMAIL = 'test@example.com'
    process.env.PORT = '3000'

    const result = env({
      STR: { type: 'string' },
      NUM: { type: 'number' },
      BOOL: { type: 'boolean' },
      URL: { type: 'url' },
      EMAIL: { type: 'email' },
      PORT: { type: 'port' },
    })

    expect(result.STR).toBe('hello')
    expect(result.NUM).toBe(42)
    expect(result.BOOL).toBe(true)
    expect(result.URL).toBe('https://example.com')
    expect(result.EMAIL).toBe('test@example.com')
    expect(result.PORT).toBe(3000)
  })

  it('treats empty string as missing', () => {
    process.env.VAR = ''

    const result = env({
      VAR: { type: 'string', default: 'default' },
    })

    expect(result.VAR).toBe('default')
  })

  it('collects multiple errors', () => {
    process.env.NUM = 'not-a-number'
    process.env.EMAIL = 'not-an-email'

    expect(() => env({
      NUM: { type: 'number' },
      EMAIL: { type: 'email' },
      PORT: { type: 'port' }, // missing
    })).toThrow()
  })
})
