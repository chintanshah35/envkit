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
    delete process.env.PORT
    delete process.env.DEBUG

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

  it('validates with custom validate function', () => {
    process.env.PORT = '80'

    expect(() => env({
      PORT: { 
        type: 'number',
        validate: (value) => (value as number) >= 1024
      },
    })).toThrow('Custom validation failed')
  })

  it('passes custom validate function', () => {
    process.env.PORT = '3000'

    const result = env({
      PORT: { 
        type: 'number',
        validate: (value) => (value as number) >= 1024
      },
    })

    expect(result.PORT).toBe(3000)
  })

  it('masks secret values in errors', () => {
    process.env.API_KEY = 'invalid-json'

    try {
      env({
        API_KEY: { type: 'json', secret: true },
      })
    } catch (error) {
      expect((error as Error).message).toContain('****')
      expect((error as Error).message).not.toContain('invalid-json')
    }
  })

  it('supports enum type', () => {
    process.env.ENV = 'production'

    const result = env({
      ENV: { type: 'enum', values: ['development', 'staging', 'production'] as const },
    })

    expect(result.ENV).toBe('production')
  })

  it('throws on invalid enum value', () => {
    process.env.ENV = 'invalid'

    expect(() => env({
      ENV: { type: 'enum', values: ['development', 'staging', 'production'] as const },
    })).toThrow('Invalid enum value')
  })

  it('supports array type', () => {
    process.env.TAGS = 'one,two,three'

    const result = env({
      TAGS: { type: 'array' },
    })

    expect(result.TAGS).toEqual(['one', 'two', 'three'])
  })

  it('supports json type', () => {
    process.env.CONFIG = '{"debug":true}'

    const result = env({
      CONFIG: { type: 'json' },
    })

    expect(result.CONFIG).toEqual({ debug: true })
  })

  it('supports regex type', () => {
    process.env.CODE = 'ABC-1234'

    const result = env({
      CODE: { type: 'regex', pattern: /^[A-Z]{3}-\d{4}$/ },
    })

    expect(result.CODE).toBe('ABC-1234')
  })

  it('supports integer type', () => {
    process.env.COUNT = '42'

    const result = env({
      COUNT: { type: 'integer' },
    })

    expect(result.COUNT).toBe(42)
  })

  it('masks secrets in type errors', () => {
    process.env.SECRET = 'not-a-number'

    try {
      env({
        SECRET: { type: 'number', secret: true },
      })
    } catch (error) {
      expect((error as Error).message).toContain('****')
      expect((error as Error).message).not.toContain('not-a-number')
    }
  })

  it('masks secrets in missing errors', () => {
    try {
      env({
        SECRET: { type: 'string', secret: true },
      })
    } catch (error) {
      const message = (error as Error).message
      expect(message).toContain('SECRET')
      expect(message).toContain('Missing required environment variable')
    }
  })

  it('respects maskSecrets option = false', () => {
    process.env.SECRET = 'invalid-json'

    try {
      env({
        SECRET: { type: 'json', secret: true },
      }, { maskSecrets: false })
    } catch (error) {
      expect((error as Error).message).toContain('invalid-json')
      expect((error as Error).message).not.toContain('****')
    }
  })

  it('applies transform after validation', () => {
    process.env.PORT = '3000'

    const result = env({
      PORT: {
        type: 'number',
        transform: (value) => (value as number) * 2,
      },
    })

    expect(result.PORT).toBe(6000)
  })

  it('validates after transform', () => {
    process.env.PORT = '3000'

    const result = env({
      PORT: {
        type: 'number',
        transform: (value) => (value as number) * 2,
        validate: (value) => (value as number) >= 5000,
      },
    })

    expect(result.PORT).toBe(6000)
  })

  it('throws validation error after transform', () => {
    process.env.PORT = '3000'

    expect(() => env({
      PORT: {
        type: 'number',
        transform: (value) => (value as number) * 2,
        validate: (value) => (value as number) < 5000,
      },
    })).toThrow('Custom validation failed')
  })

  it('masks secrets in transform validation errors', () => {
    process.env.SECRET = '3000'

    try {
      env({
        SECRET: {
          type: 'number',
          transform: (value) => (value as number) * 2,
          validate: (value) => (value as number) < 5000,
          secret: true,
        },
      })
    } catch (error) {
      expect((error as Error).message).toContain('****')
    }
  })
})
