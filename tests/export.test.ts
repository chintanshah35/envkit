import { describe, it, expect } from 'vitest'
import { schemaToJSON, schemaToMarkdown, generateDotenvExample } from '../src/export'

describe('schemaToJSON', () => {
  it('exports schema as JSON array', () => {
    const schema = {
      PORT: { type: 'number' as const, default: 3000 },
      API_KEY: { type: 'string' as const },
      DEBUG: { type: 'boolean' as const, optional: true },
    }

    const result = schemaToJSON(schema)

    expect(result).toEqual([
      { name: 'PORT', type: 'number', required: true, default: 3000 },
      { name: 'API_KEY', type: 'string', required: true, default: undefined },
      { name: 'DEBUG', type: 'boolean', required: false, default: undefined },
    ])
  })
})

describe('schemaToMarkdown', () => {
  it('generates markdown table', () => {
    const schema = {
      PORT: { type: 'number' as const, default: 3000 },
      API_KEY: { type: 'string' as const },
    }

    const result = schemaToMarkdown(schema)

    expect(result).toContain('| Variable | Type | Required | Default |')
    expect(result).toContain('| `PORT` | `number` | Yes | `3000` |')
    expect(result).toContain('| `API_KEY` | `string` | Yes | - |')
  })
})

describe('generateDotenvExample', () => {
  it('generates .env.example content', () => {
    const schema = {
      PORT: { type: 'number' as const, default: 3000 },
      API_KEY: { type: 'string' as const },
      DEBUG: { type: 'boolean' as const, optional: true },
    }

    const result = generateDotenvExample(schema)

    expect(result).toContain('# Required')
    expect(result).toContain('API_KEY=')
    expect(result).toContain('# Optional')
    expect(result).toContain('PORT=3000')
    expect(result).toContain('DEBUG=')
  })
})

