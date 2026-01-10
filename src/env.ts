import { resolve } from 'path'
import type { EnvSchema, InferEnvType } from './types'
import { validators } from './validators'
import { loadDotenv } from './dotenv'
import { formatValidationErrors, createMissingError, createTypeError, type ValidationError } from './errors'

export function env<T extends EnvSchema>(schema: T): InferEnvType<T> {
  const vars = loadEnvFiles()
  const source = { ...vars, ...process.env }

  const result: Record<string, unknown> = {}
  const errors: ValidationError[] = []

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
      let validated = validators[config.type](rawValue)
      
      if (config.transform) {
        validated = config.transform(validated)
      }
      
      result[key] = validated
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      errors.push(createTypeError(key, rawValue, config.type, details))
    }
  }

  if (errors.length > 0) {
    throw new Error(formatValidationErrors(errors))
  }

  return result as InferEnvType<T>
}

function loadEnvFiles(): Record<string, string> {
  const cwd = process.cwd()
  const envName = process.env.NODE_ENV
  
  const paths = [
    resolve(cwd, '.env'),
    envName ? resolve(cwd, `.env.${envName}`) : null,
    resolve(cwd, '.env.local'),
  ].filter((path): path is string => path !== null)

  let vars: Record<string, string> = {}
  
  for (const path of paths) {
    const loaded = loadDotenv(path)
    vars = { ...vars, ...loaded }
  }

  return vars
}

