import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { env, presets } from '../src'

describe('presets', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('server', () => {
    it('uses default values', () => {
      delete process.env.NODE_ENV
      
      const result = env(presets.server())
      
      expect(result.PORT).toBe(3000)
      expect(result.HOST).toBe('localhost')
      expect(result.NODE_ENV).toBe('development')
    })

    it('accepts custom prefix', () => {
      process.env.APP_PORT = '8080'
      process.env.APP_HOST = '0.0.0.0'
      process.env.APP_NODE_ENV = 'production'

      const result = env(presets.server('APP_'))
      
      expect(result.APP_PORT).toBe(8080)
      expect(result.APP_HOST).toBe('0.0.0.0')
      expect(result.APP_NODE_ENV).toBe('production')
    })
  })

  describe('database', () => {
    it('requires URL', () => {
      expect(() => env(presets.database())).toThrow('DATABASE_URL')
    })

    it('accepts database URL', () => {
      process.env.DATABASE_URL = 'postgres://localhost:5432/mydb'

      const result = env(presets.database())
      
      expect(result.DATABASE_URL).toBe('postgres://localhost:5432/mydb')
      expect(result.DATABASE_HOST).toBe('localhost')
      expect(result.DATABASE_PORT).toBe(5432)
    })

    it('accepts custom prefix', () => {
      process.env.DB_URL = 'postgres://localhost:5432/mydb'

      const result = env(presets.database('DB_'))
      
      expect(result.DB_URL).toBe('postgres://localhost:5432/mydb')
    })
  })

  describe('redis', () => {
    it('uses defaults when no URL provided', () => {
      const result = env(presets.redis())
      
      expect(result.REDIS_HOST).toBe('localhost')
      expect(result.REDIS_PORT).toBe(6379)
      expect(result.REDIS_DB).toBe(0)
    })

    it('accepts redis URL', () => {
      process.env.REDIS_URL = 'redis://localhost:6379/1'

      const result = env(presets.redis())
      
      expect(result.REDIS_URL).toBe('redis://localhost:6379/1')
    })
  })

  describe('auth', () => {
    it('requires JWT secret', () => {
      expect(() => env(presets.auth())).toThrow('AUTH_JWT_SECRET')
    })

    it('accepts auth config', () => {
      process.env.AUTH_JWT_SECRET = 'super-secret-key'

      const result = env(presets.auth())
      
      expect(result.AUTH_JWT_SECRET).toBe('super-secret-key')
      expect(result.AUTH_JWT_EXPIRES_IN).toBe('1d')
      expect(result.AUTH_BCRYPT_ROUNDS).toBe(10)
    })
  })

  describe('combining presets', () => {
    it('merges multiple presets', () => {
      process.env.DATABASE_URL = 'postgres://localhost:5432/mydb'
      process.env.AUTH_JWT_SECRET = 'secret'

      const result = env({
        ...presets.server(),
        ...presets.database(),
        ...presets.auth(),
      })
      
      expect(result.PORT).toBe(3000)
      expect(result.DATABASE_URL).toBe('postgres://localhost:5432/mydb')
      expect(result.AUTH_JWT_SECRET).toBe('secret')
    })
  })
})
