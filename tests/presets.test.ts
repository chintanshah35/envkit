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

  describe('aws', () => {
    it('requires access key and secret', () => {
      expect(() => env(presets.aws())).toThrow('AWS_ACCESS_KEY_ID')
    })

    it('accepts AWS config', () => {
      process.env.AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
      process.env.AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'

      const result = env(presets.aws())
      
      expect(result.AWS_ACCESS_KEY_ID).toBe('AKIAIOSFODNN7EXAMPLE')
      expect(result.AWS_SECRET_ACCESS_KEY).toBe('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY')
      expect(result.AWS_REGION).toBe('us-east-1')
    })

    it('accepts optional S3 bucket', () => {
      process.env.AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
      process.env.AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      process.env.AWS_S3_BUCKET = 'my-bucket'

      const result = env(presets.aws())
      expect(result.AWS_S3_BUCKET).toBe('my-bucket')
    })

    it('accepts custom prefix', () => {
      process.env.CUSTOM_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
      process.env.CUSTOM_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'

      const result = env(presets.aws('CUSTOM_'))
      expect(result.CUSTOM_ACCESS_KEY_ID).toBe('AKIAIOSFODNN7EXAMPLE')
    })
  })

  describe('smtp', () => {
    it('requires host', () => {
      expect(() => env(presets.smtp())).toThrow('SMTP_HOST')
    })

    it('accepts SMTP config', () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_PORT = '587'

      const result = env(presets.smtp())
      
      expect(result.SMTP_HOST).toBe('smtp.example.com')
      expect(result.SMTP_PORT).toBe(587)
      expect(result.SMTP_SECURE).toBe(false)
    })

    it('accepts optional credentials', () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_USER = 'user@example.com'
      process.env.SMTP_PASSWORD = 'password123'

      const result = env(presets.smtp())
      expect(result.SMTP_USER).toBe('user@example.com')
      expect(result.SMTP_PASSWORD).toBe('password123')
    })

    it('accepts optional from email', () => {
      process.env.SMTP_HOST = 'smtp.example.com'
      process.env.SMTP_FROM = 'noreply@example.com'

      const result = env(presets.smtp())
      expect(result.SMTP_FROM).toBe('noreply@example.com')
    })

    it('accepts custom prefix', () => {
      process.env.MAIL_HOST = 'smtp.example.com'

      const result = env(presets.smtp('MAIL_'))
      expect(result.MAIL_HOST).toBe('smtp.example.com')
    })
  })

  describe('cors', () => {
    it('uses default values', () => {
      const result = env(presets.cors())
      
      expect(result.CORS_ORIGINS).toEqual(['http://localhost:3000'])
      expect(result.CORS_METHODS).toEqual(['GET', 'POST', 'PUT', 'DELETE'])
      expect(result.CORS_CREDENTIALS).toBe(true)
    })

    it('accepts custom origins', () => {
      process.env.CORS_ORIGINS = 'https://example.com,https://app.example.com'

      const result = env(presets.cors())
      expect(result.CORS_ORIGINS).toEqual(['https://example.com', 'https://app.example.com'])
    })

    it('accepts custom methods', () => {
      process.env.CORS_METHODS = 'GET,POST'

      const result = env(presets.cors())
      expect(result.CORS_METHODS).toEqual(['GET', 'POST'])
    })

    it('accepts custom credentials', () => {
      process.env.CORS_CREDENTIALS = 'false'

      const result = env(presets.cors())
      expect(result.CORS_CREDENTIALS).toBe(false)
    })

    it('accepts custom prefix', () => {
      process.env.API_CORS_ORIGINS = 'https://api.example.com'

      const result = env(presets.cors('API_CORS_'))
      expect(result.API_CORS_ORIGINS).toEqual(['https://api.example.com'])
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

    it('merges all presets together', () => {
      process.env.DATABASE_URL = 'postgres://localhost:5432/mydb'
      process.env.AUTH_JWT_SECRET = 'secret'
      process.env.AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE'
      process.env.AWS_SECRET_ACCESS_KEY = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      process.env.SMTP_HOST = 'smtp.example.com'

      const result = env({
        ...presets.server(),
        ...presets.database(),
        ...presets.auth(),
        ...presets.aws(),
        ...presets.smtp(),
        ...presets.cors(),
      })
      
      expect(result.PORT).toBe(3000)
      expect(result.DATABASE_URL).toBe('postgres://localhost:5432/mydb')
      expect(result.AUTH_JWT_SECRET).toBe('secret')
      expect(result.AWS_ACCESS_KEY_ID).toBe('AKIAIOSFODNN7EXAMPLE')
      expect(result.SMTP_HOST).toBe('smtp.example.com')
      expect(result.CORS_ORIGINS).toEqual(['http://localhost:3000'])
    })
  })
})
