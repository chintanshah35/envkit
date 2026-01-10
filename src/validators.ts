import type { EnvType } from './types'

export const validators: Record<EnvType, (value: string) => any> = {
  string: (value: string) => value,
  
  number: (value: string) => {
    if (value === '') {
      throw new Error('Cannot parse empty string as number')
    }
    const num = Number(value)
    if (isNaN(num)) {
      throw new Error(`Invalid number: "${value}"`)
    }
    return num
  },
  
  boolean: (value: string) => {
    const lower = value.toLowerCase()
    if (lower === 'true' || lower === '1' || lower === 'yes') return true
    if (lower === 'false' || lower === '0' || lower === 'no') return false
    throw new Error(`Invalid boolean: "${value}"`)
  },
  
  url: (value: string) => {
    try {
      new URL(value)
      return value
    } catch {
      throw new Error(`Invalid URL: "${value}"`)
    }
  },
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      throw new Error(`Invalid email: "${value}"`)
    }
    return value
  },
  
  port: (value: string) => {
    const num = Number(value)
    if (isNaN(num) || num < 0 || num > 65535 || !Number.isInteger(num)) {
      throw new Error(`Invalid port: "${value}"`)
    }
    return num
  },
}

