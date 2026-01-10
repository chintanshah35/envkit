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
})

