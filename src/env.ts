import { resolve } from 'path'
import type { EnvSchema, InferEnvType } from './types'
import { validators } from './validators'
import { loadDotenv } from './dotenv'
import { formatValidationErrors, createMissingError, createTypeError, type ValidationError } from './errors'

export interface EnvOptions {
  maskSecrets?: boolean
}

export const env = <T extends EnvSchema>(schema: T, options: EnvOptions = {}): InferEnvType<T> => {
  const vars = loadEnvFiles()
  const source = { ...vars, ...process.env }

  const result: Record<string, unknown> = {}
  const errors: ValidationError[] = []
  const secrets = new Set(
    Object.entries(schema)
      .filter(([, config]) => config.secret)
      .map(([key]) => key)
  )

  for (const [key, config] of Object.entries(schema)) {
    const rawValue = source[key]

    if (rawValue === undefined || rawValue === '') {
      if (config.default !== undefined) {
        result[key] = config.default
        continue
      }

      if (!config.optional) {
        errors.push(createMissingError(key, config.type))
        continue
      }

      result[key] = undefined
      continue
    }

    try {
      let validated = validators[config.type](rawValue, config)
      
      if (config.transform) {
        validated = config.transform(validated)
      }

      if (config.validate && !config.validate(validated)) {
        const displayValue = shouldMask(key, secrets, options) ? '****' : String(rawValue)
        errors.push({
          key,
          message: `Custom validation failed for value "${displayValue}"`,
          suggestion: 'Check the validate function requirements',
        })
        continue
      }
      
      result[key] = validated
    } catch (error) {
      const isMasked = shouldMask(key, secrets, options)
      const displayValue = isMasked ? '****' : String(rawValue)
      const details = error instanceof Error ? error.message : String(error)
      const maskedDetails = isMasked 
        ? details.replace(new RegExp(escapeRegExp(rawValue), 'g'), '****')
        : details
      
      errors.push(createTypeError(key, displayValue, config.type, maskedDetails))
    }
  }

  if (errors.length > 0) {
    throw new Error(formatValidationErrors(errors))
  }

  return result as InferEnvType<T>
}

const shouldMask = (key: string, secrets: Set<string>, options: EnvOptions): boolean =>
  options.maskSecrets !== false && secrets.has(key)

const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const loadEnvFiles = (): Record<string, string> => {
  const cwd = process.cwd()
  const envName = process.env.NODE_ENV
  
  const paths = [
    resolve(cwd, '.env'),
    envName && resolve(cwd, `.env.${envName}`),
    resolve(cwd, '.env.local'),
  ].filter((path): path is string => Boolean(path))

  return paths.reduce<Record<string, string>>(
    (vars, path) => ({ ...vars, ...loadDotenv(path) }),
    {}
  )
}
