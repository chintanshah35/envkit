# envconfig-kit

> Type-safe environment variables with fail-fast validation. Zero dependencies.

[![npm version](https://img.shields.io/npm/v/envconfig-kit.svg)](https://www.npmjs.com/package/envconfig-kit)
[![npm downloads](https://img.shields.io/npm/dm/envconfig-kit.svg)](https://www.npmjs.com/package/envconfig-kit)
[![build](https://github.com/chintanshah35/envconfig-kit/actions/workflows/test-suite.yml/badge.svg)](https://github.com/chintanshah35/envconfig-kit/actions)
[![node](https://img.shields.io/node/v/envconfig-kit.svg)](https://nodejs.org)
[![bundle size](https://img.shields.io/bundlephobia/minzip/envconfig-kit)](https://bundlephobia.com/package/envconfig-kit)
[![license](https://img.shields.io/npm/l/envconfig-kit.svg)](https://github.com/chintanshah35/envconfig-kit/blob/master/LICENSE)

## Why?

- **Built-in .env loading** - no need for dotenv
- **Type-safe** - full TypeScript inference
- **Zero dependencies** - ~3KB minified
- **Fail-fast validation** - catches errors at startup
- **Actionable error messages** - tells you exactly how to fix issues
- **Framework presets** - common patterns for database, redis, auth
- **Secret masking** - hide sensitive values in error messages
- **Custom validation** - add your own validation logic

## Install

```bash
npm install envconfig-kit
```

## Quick Start

```typescript
import { env } from 'envconfig-kit'

const config = env({
  PORT: { type: 'number', default: 3000 },
  API_KEY: { type: 'string', secret: true },
  DEBUG: { type: 'boolean', default: false },
  DATABASE_URL: { type: 'url' },
})

// config.PORT is typed as number
// config.API_KEY is typed as string
// Throws on startup if API_KEY or DATABASE_URL is missing
```

No need for `dotenv` - envconfig-kit automatically loads `.env` files.

## Supported Types

| Type | Validates | Example |
|------|-----------|---------|
| `string` | Any string | `"hello"` |
| `number` | Valid number | `"3.14"` → `3.14` |
| `integer` | Whole numbers only | `"42"` → `42` |
| `boolean` | true/false, 1/0, yes/no | `"true"` → `true` |
| `url` | Valid URL with protocol | `"https://api.example.com"` |
| `email` | Valid email format | `"user@example.com"` |
| `port` | Number between 0-65535 | `"3000"` → `3000` |
| `json` | Valid JSON string | `'{"key":"value"}'` → `{key: "value"}` |
| `array` | Comma-separated values | `"a,b,c"` → `["a", "b", "c"]` |
| `enum` | One of allowed values | `"production"` |
| `regex` | Matches pattern | `"ABC-123"` |

## New in v0.2.0

### Enum Type

```typescript
const config = env({
  NODE_ENV: { 
    type: 'enum', 
    values: ['development', 'staging', 'production'] as const,
    default: 'development'
  },
})
// config.NODE_ENV is typed as 'development' | 'staging' | 'production'
```

### Array Type

```typescript
const config = env({
  ALLOWED_HOSTS: { type: 'array' },  // comma-separated by default
  TAGS: { type: 'array', separator: '|' },  // custom separator
})
// config.ALLOWED_HOSTS is string[]
```

### JSON Type

```typescript
const config = env({
  FEATURE_FLAGS: { type: 'json' },
})
// Parse JSON from env var: FEATURE_FLAGS='{"darkMode":true}'
```

### Regex Type

```typescript
const config = env({
  API_VERSION: { 
    type: 'regex', 
    pattern: /^v\d+\.\d+$/ 
  },
})
// Only accepts values like "v1.0", "v2.1"
```

### Secret Masking

```typescript
const config = env({
  API_KEY: { type: 'string', secret: true },
  DATABASE_PASSWORD: { type: 'string', secret: true },
})
// Error messages show **** instead of actual values
```

### Custom Validation

```typescript
const config = env({
  PORT: { 
    type: 'number',
    validate: (value) => value >= 1024 && value <= 65535
  },
})
// Throws if PORT is not in valid range
```

### Framework Presets

```typescript
import { env, presets } from 'envconfig-kit'

const config = env({
  ...presets.server(),      // PORT, HOST, NODE_ENV
  ...presets.database(),    // DATABASE_URL, DATABASE_HOST, etc.
  ...presets.redis(),       // REDIS_URL, REDIS_HOST, etc.
  ...presets.auth(),        // AUTH_JWT_SECRET, etc.
  ...presets.aws(),         // AWS_ACCESS_KEY_ID, etc.
  ...presets.smtp(),        // SMTP_HOST, SMTP_PORT, etc.
})
```

Custom prefixes:

```typescript
const config = env({
  ...presets.database('DB_'),  // DB_URL, DB_HOST, etc.
  ...presets.redis('CACHE_'),  // CACHE_URL, CACHE_HOST, etc.
})
```

## Schema Options

```typescript
env({
  // Required string
  API_KEY: { type: 'string' },
  
  // With default value
  PORT: { type: 'number', default: 3000 },
  
  // Optional (can be undefined)
  OPTIONAL_VAR: { type: 'string', optional: true },
  
  // Secret (masked in errors)
  PASSWORD: { type: 'string', secret: true },
  
  // With transform
  TAGS: { 
    type: 'array',
    transform: (arr) => arr.map(s => s.toUpperCase())
  },
  
  // With custom validation
  COUNT: { 
    type: 'integer',
    validate: (n) => n > 0 && n < 100
  },
})
```

## Error Messages

When validation fails, you get clear errors with fix suggestions:

```
❌ Environment validation failed:

  API_KEY: Missing required environment variable
  ➜ Fix: Add to .env file
    Example: API_KEY=your-value-here

  PORT: Invalid number: "abc"
  ➜ Fix: Provide a valid number
    Example: PORT=3000

  Run your app with valid environment variables or add them to .env
```

## Built-in .env Loading

envconfig-kit automatically loads environment variables from:
- `.env`
- `.env.local`
- `.env.${NODE_ENV}` (e.g., `.env.development`, `.env.production`)

Priority order (highest to lowest):
1. `process.env`
2. `.env.local`
3. `.env.${NODE_ENV}`
4. `.env`

## CLI Tools

```bash
# Initialize envconfig-kit in your project
npx envconfig-kit init

# Validate .env file
npx envconfig-kit check

# Generate .env.example
npx envconfig-kit generate

# Health check
npx envconfig-kit doctor
```

## Export Schema

```typescript
import { schemaToMarkdown, schemaToJSON, generateDotenvExample } from 'envconfig-kit'

const schema = {
  PORT: { type: 'number', default: 3000 },
  API_KEY: { type: 'string' },
}

// Generate markdown table for docs
console.log(schemaToMarkdown(schema))

// Generate .env.example
console.log(generateDotenvExample(schema))

// Export as JSON
console.log(schemaToJSON(schema))
```

## License

MIT
