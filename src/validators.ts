import type { EnvType, EnvFieldConfig, EnumFieldConfig, RegexFieldConfig, ArrayFieldConfig } from './types'

type ValidatorFn = (value: string, config?: EnvFieldConfig) => unknown

const TRUTHY_VALUES = new Set(['true', '1', 'yes'])
const FALSY_VALUES = new Set(['false', '0', 'no'])
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validators: Record<EnvType, ValidatorFn> = {
  string: (value) => value,
  
  number: (value) => {
    if (!value) throw new Error('Cannot parse empty string as number')
    const num = Number(value)
    if (Number.isNaN(num)) throw new Error(`Invalid number: "${value}"`)
    return num
  },

  integer: (value) => {
    if (!value) throw new Error('Cannot parse empty string as integer')
    const num = Number(value)
    if (Number.isNaN(num) || !Number.isInteger(num)) {
      throw new Error(`Invalid integer: "${value}"`)
    }
    return num
  },
  
  boolean: (value) => {
    const lower = value.toLowerCase()
    if (TRUTHY_VALUES.has(lower)) return true
    if (FALSY_VALUES.has(lower)) return false
    throw new Error(`Invalid boolean: "${value}"`)
  },
  
  url: (value) => {
    try {
      new URL(value)
      return value
    } catch {
      throw new Error(`Invalid URL: "${value}"`)
    }
  },
  
  email: (value) => {
    if (!EMAIL_REGEX.test(value)) throw new Error(`Invalid email: "${value}"`)
    return value
  },
  
  port: (value) => {
    const num = Number(value)
    const isValidPort = !Number.isNaN(num) && Number.isInteger(num) && num >= 0 && num <= 65535
    if (!isValidPort) throw new Error(`Invalid port: "${value}"`)
    return num
  },

  json: (value) => {
    try {
      return JSON.parse(value)
    } catch {
      throw new Error(`Invalid JSON: "${value}"`)
    }
  },

  array: (value, config) => {
    const separator = (config as ArrayFieldConfig)?.separator ?? ','
    return value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean)
  },

  enum: (value, config) => {
    const values = (config as EnumFieldConfig)?.values
    if (!values) throw new Error('Enum type requires "values" array')
    if (!values.includes(value)) {
      throw new Error(`Invalid enum value: "${value}". Expected one of: ${values.join(', ')}`)
    }
    return value
  },

  regex: (value, config) => {
    const pattern = (config as RegexFieldConfig)?.pattern
    if (!pattern) throw new Error('Regex type requires "pattern"')
    if (!pattern.test(value)) {
      throw new Error(`Value "${value}" does not match pattern ${pattern}`)
    }
    return value
  },
}
