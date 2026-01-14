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
- **Zero dependencies** - 3KB minified
- **Fail-fast validation** - catches errors at startup
- **Actionable error messages** - tells you exactly how to fix issues
- **CLI tools** - generate .env.example, validate, health checks
- **Transform support** - parse and sanitize values
- **Multi-environment** - .env.development, .env.production, etc.

## Install

```bash
npm install envconfig-kit
```

## Quick Start

```typescript
import { env } from 'envconfig-kit'

const config = env({
  PORT: { type: 'number', default: 3000 },
  API_KEY: { type: 'string' },
  DEBUG: { type: 'boolean', default: false },
  DATABASE_URL: { type: 'url' },
})

// config.PORT is typed as number
// config.API_KEY is typed as string
// Throws on startup if API_KEY or DATABASE_URL is missing
```

No need for `dotenv` - envconfig-kit automatically loads `.env` files.

## Built-in .env Loading

envconfig-kit automatically loads environment variables from:
- `.env`
- `.env.local`
- `.env.development` (based on NODE_ENV)
- `.env.production` (based on NODE_ENV)

```typescript
const config = env({ 
  PORT: { type: 'number' } 
})
// Automatically loads from .env files
```

## Supported Types

| Type | Validates | Example |
|------|-----------|---------|
| `string` | Any string | `"hello"` |
| `number` | Valid number | `"3000"` → `3000` |
| `boolean` | true/false, 1/0, yes/no | `"true"` → `true` |
| `url` | Valid URL with protocol | `"https://api.example.com"` |
| `email` | Valid email format | `"user@example.com"` |
| `port` | Number between 0-65535 | `"3000"` → `3000` |

## Schema Options

```typescript
env({
  API_KEY: { type: 'string' },
  PORT: { type: 'number', default: 3000 },
  OPTIONAL_VAR: { type: 'string', optional: true },
  TAGS: { 
    type: 'string',
    transform: (value) => value.split(',') 
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

  PORT: Expected number, got "abc"
  ➜ Fix: Provide a valid number
    Example: PORT=3000

  Run your app with valid environment variables or add them to .env
```

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

## Built-in .env Loading

envconfig-kit automatically loads environment variables from:
- `.env`
- `.env.local`
- `.env.development` (based on NODE_ENV)
- `.env.production` (based on NODE_ENV)

Priority order:
1. `process.env` (highest)
2. `.env.local`
3. `.env.${NODE_ENV}`
4. `.env` (lowest)

## Transform Values

```typescript
const config = env({
  ALLOWED_ORIGINS: {
    type: 'string',
    transform: (value) => value.split(',')
  },
  API_URL: {
    type: 'url',
    transform: (value) => value.replace(/\/$/, '')
  }
})
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

## Advanced Usage

```typescript
import { env } from 'envconfig-kit'

const config = env({
  DATABASE_URL: { type: 'url' },
  API_KEY: { type: 'string' },
  PORT: { type: 'number', default: 3000 },
  HOST: { type: 'string', default: 'localhost' },
  DEBUG: { type: 'boolean', default: false },
  REDIS_URL: { type: 'url', optional: true },
  CORS_ORIGINS: {
    type: 'string',
    default: 'http://localhost:3000',
    transform: (value) => value.split(',').map(s => s.trim())
  },
})

// TypeScript knows the exact types
config.PORT // number
config.API_KEY // string
config.DEBUG // boolean
config.REDIS_URL // string | undefined
config.CORS_ORIGINS // string[] (after transform)
```

## License

MIT


