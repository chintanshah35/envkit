import { describe, it, expect } from 'vitest'
import {
  formatValidationErrors,
  createMissingError,
  createTypeError,
  createValidationError,
  type ValidationError,
} from '../src/errors'

describe('errors', () => {
  describe('formatValidationErrors', () => {
    it('formats single error', () => {
      const errors: ValidationError[] = [
        {
          key: 'PORT',
          message: 'Missing required environment variable',
          suggestion: 'Add to .env file',
          example: 'PORT=3000',
        },
      ]

      const output = formatValidationErrors(errors)
      expect(output).toContain('Environment validation failed')
      expect(output).toContain('PORT')
      expect(output).toContain('Missing required environment variable')
      expect(output).toContain('Add to .env file')
      expect(output).toContain('PORT=3000')
    })

    it('formats multiple errors', () => {
      const errors: ValidationError[] = [
        {
          key: 'PORT',
          message: 'Missing required environment variable',
          suggestion: 'Add to .env file',
          example: 'PORT=3000',
        },
        {
          key: 'API_KEY',
          message: 'Invalid type',
          suggestion: 'Provide a string value',
        },
      ]

      const output = formatValidationErrors(errors)
      expect(output).toContain('PORT')
      expect(output).toContain('API_KEY')
      expect(output).toContain('Run your app with valid environment variables')
    })

    it('handles errors without suggestion', () => {
      const errors: ValidationError[] = [
        {
          key: 'PORT',
          message: 'Missing required environment variable',
        },
      ]

      const output = formatValidationErrors(errors)
      expect(output).toContain('PORT')
      expect(output).not.toContain('➜ Fix')
    })

    it('handles errors without example', () => {
      const errors: ValidationError[] = [
        {
          key: 'PORT',
          message: 'Missing required environment variable',
          suggestion: 'Add to .env file',
        },
      ]

      const output = formatValidationErrors(errors)
      expect(output).toContain('PORT')
      expect(output).not.toContain('Example')
    })
  })

  describe('createMissingError', () => {
    it('creates error for string type', () => {
      const error = createMissingError('API_KEY', 'string')
      expect(error.key).toBe('API_KEY')
      expect(error.message).toBe('Missing required environment variable')
      expect(error.example).toContain('API_KEY=')
    })

    it('creates error for all types', () => {
      const types = ['string', 'number', 'integer', 'boolean', 'url', 'email', 'port', 'json', 'array', 'enum', 'regex'] as const
      
      types.forEach(type => {
        const error = createMissingError('TEST', type)
        expect(error.key).toBe('TEST')
        expect(error.message).toBe('Missing required environment variable')
        expect(error.example).toBeDefined()
        expect(error.suggestion).toBe('Add to .env file')
      })
    })
  })

  describe('createTypeError', () => {
    it('creates error with suggestion and example', () => {
      const error = createTypeError('PORT', 'invalid', 'port', 'Invalid port number')
      expect(error.key).toBe('PORT')
      expect(error.message).toBe('Invalid port number')
      expect(error.suggestion).toBe('Provide a number between 0-65535')
      expect(error.example).toContain('PORT=')
    })

    it('creates error for all types', () => {
      const types = ['string', 'number', 'integer', 'boolean', 'url', 'email', 'port', 'json', 'array', 'enum', 'regex'] as const
      
      types.forEach(type => {
        const error = createTypeError('TEST', 'invalid', type, 'Invalid value')
        expect(error.key).toBe('TEST')
        expect(error.message).toBe('Invalid value')
        expect(error.suggestion).toBeDefined()
        expect(error.example).toBeDefined()
      })
    })
  })

  describe('createValidationError', () => {
    it('creates validation error', () => {
      const error = createValidationError('PORT', '80')
      expect(error.key).toBe('PORT')
      expect(error.message).toContain('Custom validation failed')
      expect(error.message).toContain('80')
      expect(error.suggestion).toBe('Check the validate function requirements')
    })

    it('handles empty value', () => {
      const error = createValidationError('PORT', '')
      expect(error.message).toContain('Custom validation failed')
      expect(error.message).toContain('""')
    })
  })
})
