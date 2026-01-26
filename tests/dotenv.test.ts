import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { parseDotenv, loadDotenv } from '../src/dotenv'
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('parseDotenv', () => {
  it('parses simple key-value pairs', () => {
    const content = `KEY1=value1\nKEY2=value2`
    expect(parseDotenv(content)).toEqual({
      KEY1: 'value1',
      KEY2: 'value2',
    })
  })

  it('handles quoted values', () => {
    const content = `KEY1="quoted value"\nKEY2='single quoted'`
    expect(parseDotenv(content)).toEqual({
      KEY1: 'quoted value',
      KEY2: 'single quoted',
    })
  })

  it('ignores comments', () => {
    const content = `# This is a comment\nKEY=value\n# Another comment`
    expect(parseDotenv(content)).toEqual({
      KEY: 'value',
    })
  })

  it('ignores empty lines', () => {
    const content = `KEY1=value1\n\n\nKEY2=value2\n\n`
    expect(parseDotenv(content)).toEqual({
      KEY1: 'value1',
      KEY2: 'value2',
    })
  })

  it('handles values with equals signs', () => {
    const content = `URL=https://example.com?foo=bar&baz=qux`
    expect(parseDotenv(content)).toEqual({
      URL: 'https://example.com?foo=bar&baz=qux',
    })
  })

  it('trims whitespace', () => {
    const content = `  KEY1  =  value1  \n  KEY2=value2`
    expect(parseDotenv(content)).toEqual({
      KEY1: 'value1',
      KEY2: 'value2',
    })
  })

  it('handles empty values', () => {
    const content = `KEY1=\nKEY2=value`
    expect(parseDotenv(content)).toEqual({
      KEY1: '',
      KEY2: 'value',
    })
  })
})

describe('loadDotenv', () => {
  const testDir = resolve(__dirname, '../.test-dotenv')

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      try {
        const files = ['.env', '.env.local', '.env.test']
        files.forEach(file => {
          if (existsSync(resolve(testDir, file))) {
            unlinkSync(resolve(testDir, file))
          }
        })
        rmdirSync(testDir)
      } catch {}
    }
  })

  it('returns empty object when file not found', () => {
    const result = loadDotenv(resolve(testDir, '.env.missing'))
    expect(result).toEqual({})
  })

  it('loads .env file', () => {
    writeFileSync(resolve(testDir, '.env'), 'KEY1=value1\nKEY2=value2')
    const result = loadDotenv(resolve(testDir, '.env'))
    expect(result).toEqual({
      KEY1: 'value1',
      KEY2: 'value2',
    })
  })

  it('handles file read errors gracefully', () => {
    const result = loadDotenv('/nonexistent/path/.env')
    expect(result).toEqual({})
  })

  it('parses quoted values correctly', () => {
    writeFileSync(resolve(testDir, '.env'), 'KEY1="quoted value"\nKEY2=normal')
    const result = loadDotenv(resolve(testDir, '.env'))
    expect(result).toEqual({
      KEY1: 'quoted value',
      KEY2: 'normal',
    })
  })

  it('handles empty file', () => {
    writeFileSync(resolve(testDir, '.env'), '')
    const result = loadDotenv(resolve(testDir, '.env'))
    expect(result).toEqual({})
  })

  it('handles file with only comments', () => {
    writeFileSync(resolve(testDir, '.env'), '# Comment 1\n# Comment 2')
    const result = loadDotenv(resolve(testDir, '.env'))
    expect(result).toEqual({})
  })
})
