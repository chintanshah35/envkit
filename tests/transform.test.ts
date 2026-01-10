import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { env } from '../src/env'

describe('transform', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('transforms string values', () => {
    process.env.TAGS = 'a,b,c'

    const result = env({
      TAGS: {
        type: 'string',
        transform: (value) => value.split(',')
      }
    })

    expect(result.TAGS).toEqual(['a', 'b', 'c'])
  })

  it('transforms number values', () => {
    process.env.PORT = '3000'

    const result = env({
      PORT: {
        type: 'number',
        transform: (value) => value * 2
      }
    })

    expect(result.PORT).toBe(6000)
  })

  it('transforms url values', () => {
    process.env.API_URL = 'https://example.com/'

    const result = env({
      API_URL: {
        type: 'url',
        transform: (value) => value.replace(/\/$/, '')
      }
    })

    expect(result.API_URL).toBe('https://example.com')
  })

  it('applies transform after validation', () => {
    process.env.PORT = 'invalid'

    expect(() => env({
      PORT: {
        type: 'number',
        transform: (value) => value * 2
      }
    })).toThrow()
  })
})

