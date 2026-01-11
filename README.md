# envkit

Type-safe environment variables with fail-fast validation. Zero dependencies.

## Why envkit?

- ✅ **Built-in .env loading** - No need for dotenv
- ✅ **Type-safe** - Full TypeScript inference
- ✅ **Zero dependencies** - 3KB minified
- ✅ **Fail-fast validation** - Catches errors at startup
- ✅ **Actionable error messages** - Know exactly how to fix issues
- ✅ **CLI tools** - Generate .env.example, validate, health checks
- ✅ **Transform support** - Parse and sanitize values
- ✅ **Multi-environment** - Load .env.development, .env.production, etc.

## Install

```bash
npm install envkit
```

## Quick Start

```typescript
import { env } from 'envkit'

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

No need for `dotenv` - envkit automatically loads `.env` files.

## Features

### Built-in .env Loading

envkit automatically loads environment variables from:
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

### Supported Types

| Type | Validates | Example |
|------|-----------|---------|
| `string` | Any string | `"hello"` |
| `number` | Valid number | `"3000"` → `3000` |
| `boolean` | true/false, 1/0, yes/no | `"true"` → `true` |
| `url` | Valid URL with protocol | `"https://api.example.com"` |
| `email` | Valid email format | `"user@example.com"` |
| `port` | Number between 0-65535 | `"3000"` → `3000` |

### Schema Options

```typescript
env({
  // Required by default
  API_KEY: { type: 'string' },
  
  // With default value
  PORT: { type: 'number', default: 3000 },
  
  // Optional (can be undefined)
  OPTIONAL_VAR: { type: 'string', optional: true },
  
  // Transform values
  TAGS: { 
    type: 'string',
    transform: (value) => value.split(',') 
  },
})
```

### Actionable Error Messages

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

### CLI Tools

```bash
# Initialize envkit in your project
npx envkit init

# Validate .env file
npx envkit check

# Generate .env.example
npx envkit generate

# Health check
npx envkit doctor
```

### Transform Values

```typescript
const config = env({
  // Parse CSV into array
  ALLOWED_ORIGINS: {
    type: 'string',
    transform: (value) => value.split(',')
  },
  
  // Remove trailing slashes
  API_URL: {
    type: 'url',
    transform: (value) => value.replace(/\/$/, '')
  }
})
```

### Export Schema

```typescript
import { schemaToMarkdown, schemaToJSON, generateDotenvExample } from 'envkit'

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
import { env } from 'envkit'

const config = env({
  // Required variables
  DATABASE_URL: { type: 'url' },
  API_KEY: { type: 'string' },
  
  // Optional with defaults
  PORT: { type: 'number', default: 3000 },
  HOST: { type: 'string', default: 'localhost' },
  DEBUG: { type: 'boolean', default: false },
  
  // Optional without defaults
  REDIS_URL: { type: 'url', optional: true },
  
  // With transforms
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

## Author

Chintan Shah
