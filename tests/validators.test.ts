import { describe, it, expect } from 'vitest'
import { validators } from '../src/validators'

describe('validators', () => {
  describe('string', () => {
    it('returns the string as-is', () => {
      expect(validators.string('hello')).toBe('hello')
      expect(validators.string('')).toBe('')
    })
  })

  describe('number', () => {
    it('parses valid numbers', () => {
      expect(validators.number('42')).toBe(42)
      expect(validators.number('3.14')).toBe(3.14)
      expect(validators.number('-10')).toBe(-10)
      expect(validators.number('0')).toBe(0)
    })

    it('throws on invalid numbers', () => {
      expect(() => validators.number('abc')).toThrow('Invalid number')
      expect(() => validators.number('')).toThrow('Cannot parse empty string')
      expect(() => validators.number('NaN')).toThrow('Invalid number')
    })
  })

  describe('boolean', () => {
    it('parses truthy values', () => {
      expect(validators.boolean('true')).toBe(true)
      expect(validators.boolean('TRUE')).toBe(true)
      expect(validators.boolean('1')).toBe(true)
      expect(validators.boolean('yes')).toBe(true)
    })

    it('parses falsy values', () => {
      expect(validators.boolean('false')).toBe(false)
      expect(validators.boolean('FALSE')).toBe(false)
      expect(validators.boolean('0')).toBe(false)
      expect(validators.boolean('no')).toBe(false)
    })

    it('throws on invalid values', () => {
      expect(() => validators.boolean('maybe')).toThrow('Invalid boolean')
      expect(() => validators.boolean('2')).toThrow('Invalid boolean')
    })
  })

  describe('url', () => {
    it('accepts valid URLs', () => {
      expect(validators.url('https://example.com')).toBe('https://example.com')
      expect(validators.url('http://localhost:3000')).toBe('http://localhost:3000')
      expect(validators.url('postgres://user:pass@host:5432/db')).toBe('postgres://user:pass@host:5432/db')
    })

    it('accepts localhost URLs', () => {
      expect(validators.url('http://localhost')).toBe('http://localhost')
      expect(validators.url('http://127.0.0.1:3000')).toBe('http://127.0.0.1:3000')
    })

    it('accepts IP addresses', () => {
      expect(validators.url('http://192.168.1.1')).toBe('http://192.168.1.1')
      expect(validators.url('https://8.8.8.8')).toBe('https://8.8.8.8')
    })

    it('accepts URLs with ports', () => {
      expect(validators.url('http://example.com:8080')).toBe('http://example.com:8080')
      expect(validators.url('https://api.example.com:443')).toBe('https://api.example.com:443')
    })

    it('throws on invalid URLs', () => {
      expect(() => validators.url('not-a-url')).toThrow('Invalid URL')
      expect(() => validators.url('example.com')).toThrow('Invalid URL')
    })
  })

  describe('email', () => {
    it('accepts valid emails', () => {
      expect(validators.email('test@example.com')).toBe('test@example.com')
      expect(validators.email('user+tag@domain.co')).toBe('user+tag@domain.co')
    })

    it('throws on invalid emails', () => {
      expect(() => validators.email('not-an-email')).toThrow('Invalid email')
      expect(() => validators.email('@missing.com')).toThrow('Invalid email')
      expect(() => validators.email('missing@')).toThrow('Invalid email')
    })
  })

  describe('port', () => {
    it('accepts valid ports', () => {
      expect(validators.port('3000')).toBe(3000)
      expect(validators.port('0')).toBe(0)
      expect(validators.port('65535')).toBe(65535)
    })

    it('throws on invalid ports', () => {
      expect(() => validators.port('-1')).toThrow('Invalid port')
      expect(() => validators.port('65536')).toThrow('Invalid port')
      expect(() => validators.port('3000.5')).toThrow('Invalid port')
      expect(() => validators.port('abc')).toThrow()
    })
  })

  describe('integer', () => {
    it('parses valid integers', () => {
      expect(validators.integer('42')).toBe(42)
      expect(validators.integer('-10')).toBe(-10)
      expect(validators.integer('0')).toBe(0)
    })

    it('handles large integers', () => {
      expect(validators.integer('2147483647')).toBe(2147483647)
      expect(validators.integer('-2147483648')).toBe(-2147483648)
    })

    it('throws on non-integers', () => {
      expect(() => validators.integer('3.14')).toThrow('Invalid integer')
      expect(() => validators.integer('abc')).toThrow('Invalid integer')
      expect(() => validators.integer('')).toThrow('Cannot parse empty string')
    })
  })

  describe('json', () => {
    it('parses valid JSON', () => {
      expect(validators.json('{"key":"value"}')).toEqual({ key: 'value' })
      expect(validators.json('[1,2,3]')).toEqual([1, 2, 3])
      expect(validators.json('"string"')).toBe('string')
      expect(validators.json('123')).toBe(123)
      expect(validators.json('true')).toBe(true)
    })

    it('parses null', () => {
      expect(validators.json('null')).toBe(null)
    })

    it('parses nested objects', () => {
      expect(validators.json('{"a":{"b":{"c":1}}}')).toEqual({ a: { b: { c: 1 } } })
    })

    it('parses arrays with objects', () => {
      expect(validators.json('[{"id":1},{"id":2}]')).toEqual([{ id: 1 }, { id: 2 }])
    })

    it('throws on invalid JSON', () => {
      expect(() => validators.json('not json')).toThrow('Invalid JSON')
      expect(() => validators.json('{invalid}')).toThrow('Invalid JSON')
    })
  })

  describe('array', () => {
    it('splits comma-separated values', () => {
      expect(validators.array('a,b,c')).toEqual(['a', 'b', 'c'])
      expect(validators.array('one, two, three')).toEqual(['one', 'two', 'three'])
    })

    it('handles empty values', () => {
      expect(validators.array('a,,b')).toEqual(['a', 'b'])
      expect(validators.array('')).toEqual([])
    })

    it('uses custom separator', () => {
      expect(validators.array('a|b|c', { type: 'array', separator: '|' })).toEqual(['a', 'b', 'c'])
    })

    it('handles single value', () => {
      expect(validators.array('single')).toEqual(['single'])
    })

    it('trims whitespace around values', () => {
      expect(validators.array('  a  ,  b  ,  c  ')).toEqual(['a', 'b', 'c'])
    })
  })

  describe('enum', () => {
    const config = { type: 'enum' as const, values: ['dev', 'staging', 'prod'] as const }

    it('accepts valid enum values', () => {
      expect(validators.enum('dev', config)).toBe('dev')
      expect(validators.enum('prod', config)).toBe('prod')
    })

    it('throws on invalid enum values', () => {
      expect(() => validators.enum('invalid', config)).toThrow('Invalid enum value')
      expect(() => validators.enum('DEV', config)).toThrow('Invalid enum value')
    })
  })

  describe('regex', () => {
    const config = { type: 'regex' as const, pattern: /^[A-Z]{3}-\d{4}$/ }

    it('accepts matching values', () => {
      expect(validators.regex('ABC-1234', config)).toBe('ABC-1234')
      expect(validators.regex('XYZ-9999', config)).toBe('XYZ-9999')
    })

    it('throws on non-matching values', () => {
      expect(() => validators.regex('abc-1234', config)).toThrow('does not match pattern')
      expect(() => validators.regex('ABCD-123', config)).toThrow('does not match pattern')
    })

    it('handles empty string', () => {
      expect(() => validators.regex('', config)).toThrow('does not match pattern')
    })

    it('handles special characters in pattern', () => {
      const specialConfig = { type: 'regex' as const, pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ }
      expect(validators.regex('user@example.com', specialConfig)).toBe('user@example.com')
      expect(() => validators.regex('invalid', specialConfig)).toThrow('does not match pattern')
    })
  })
})
