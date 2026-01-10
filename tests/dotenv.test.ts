import { describe, it, expect } from 'vitest'
import { parseDotenv } from '../src/dotenv'

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

