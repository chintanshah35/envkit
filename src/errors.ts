import type { EnvType } from './types'

export interface ValidationError {
  key: string
  message: string
  suggestion?: string
  example?: string
}

export function formatValidationErrors(errors: ValidationError[]): string {
  const lines = ['❌ Environment validation failed:\n']

  for (const error of errors) {
    lines.push(`  ${error.key}: ${error.message}`)
    
    if (error.suggestion) {
      lines.push(`  ➜ Fix: ${error.suggestion}`)
    }
    
    if (error.example) {
      lines.push(`    Example: ${error.example}`)
    }
    
    lines.push('')
  }

  lines.push('  Run your app with valid environment variables or add them to .env')
  
  return lines.join('\n')
}

export function createMissingError(key: string, type: EnvType): ValidationError {
  const examples: Record<EnvType, string> = {
    string: `${key}=your-value-here`,
    number: `${key}=3000`,
    boolean: `${key}=true`,
    url: `${key}=https://example.com`,
    email: `${key}=user@example.com`,
    port: `${key}=3000`,
  }

  return {
    key,
    message: 'Missing required environment variable',
    suggestion: `Add to .env file`,
    example: examples[type],
  }
}

export function createTypeError(key: string, value: string, type: EnvType, details: string): ValidationError {
  const suggestions: Record<EnvType, string> = {
    string: 'Provide a string value',
    number: 'Provide a valid number',
    boolean: 'Use true/false, 1/0, yes/no',
    url: 'Provide a valid URL with protocol',
    email: 'Provide a valid email address',
    port: 'Provide a number between 0-65535',
  }

  const examples: Record<EnvType, string> = {
    string: `${key}=hello`,
    number: `${key}=42`,
    boolean: `${key}=true`,
    url: `${key}=https://example.com`,
    email: `${key}=user@example.com`,
    port: `${key}=3000`,
  }

  return {
    key,
    message: details,
    suggestion: suggestions[type],
    example: examples[type],
  }
}

