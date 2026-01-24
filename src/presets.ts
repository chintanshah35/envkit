import type { EnvSchema } from './types'

export const presets = {
  server: (prefix = ''): EnvSchema => ({
    [`${prefix}PORT`]: { type: 'port', default: 3000 },
    [`${prefix}HOST`]: { type: 'string', default: 'localhost' },
    [`${prefix}NODE_ENV`]: { 
      type: 'enum', 
      values: ['development', 'staging', 'production', 'test'] as const,
      default: 'development' 
    },
  }),

  database: (prefix = 'DATABASE_'): EnvSchema => ({
    [`${prefix}URL`]: { type: 'url' },
    [`${prefix}HOST`]: { type: 'string', default: 'localhost', optional: true },
    [`${prefix}PORT`]: { type: 'port', default: 5432, optional: true },
    [`${prefix}NAME`]: { type: 'string', optional: true },
    [`${prefix}USER`]: { type: 'string', optional: true },
    [`${prefix}PASSWORD`]: { type: 'string', secret: true, optional: true },
    [`${prefix}SSL`]: { type: 'boolean', default: false, optional: true },
  }),

  redis: (prefix = 'REDIS_'): EnvSchema => ({
    [`${prefix}URL`]: { type: 'url', optional: true },
    [`${prefix}HOST`]: { type: 'string', default: 'localhost', optional: true },
    [`${prefix}PORT`]: { type: 'port', default: 6379, optional: true },
    [`${prefix}PASSWORD`]: { type: 'string', secret: true, optional: true },
    [`${prefix}DB`]: { type: 'integer', default: 0, optional: true },
    [`${prefix}TLS`]: { type: 'boolean', default: false, optional: true },
  }),

  auth: (prefix = 'AUTH_'): EnvSchema => ({
    [`${prefix}JWT_SECRET`]: { type: 'string', secret: true },
    [`${prefix}JWT_EXPIRES_IN`]: { type: 'string', default: '1d', optional: true },
    [`${prefix}BCRYPT_ROUNDS`]: { type: 'integer', default: 10, optional: true },
  }),

  aws: (prefix = 'AWS_'): EnvSchema => ({
    [`${prefix}ACCESS_KEY_ID`]: { type: 'string', secret: true },
    [`${prefix}SECRET_ACCESS_KEY`]: { type: 'string', secret: true },
    [`${prefix}REGION`]: { type: 'string', default: 'us-east-1' },
    [`${prefix}S3_BUCKET`]: { type: 'string', optional: true },
  }),

  smtp: (prefix = 'SMTP_'): EnvSchema => ({
    [`${prefix}HOST`]: { type: 'string' },
    [`${prefix}PORT`]: { type: 'port', default: 587 },
    [`${prefix}USER`]: { type: 'string', optional: true },
    [`${prefix}PASSWORD`]: { type: 'string', secret: true, optional: true },
    [`${prefix}FROM`]: { type: 'email', optional: true },
    [`${prefix}SECURE`]: { type: 'boolean', default: false, optional: true },
  }),

  cors: (prefix = 'CORS_'): EnvSchema => ({
    [`${prefix}ORIGINS`]: { 
      type: 'array', 
      default: ['http://localhost:3000'],
      optional: true 
    },
    [`${prefix}METHODS`]: { 
      type: 'array', 
      default: ['GET', 'POST', 'PUT', 'DELETE'],
      optional: true 
    },
    [`${prefix}CREDENTIALS`]: { type: 'boolean', default: true, optional: true },
  }),
}
