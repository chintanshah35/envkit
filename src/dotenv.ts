import { readFileSync, existsSync } from 'fs'

export function loadDotenv(path: string): Record<string, string> {
  if (!existsSync(path)) {
    return {}
  }

  try {
    const content = readFileSync(path, 'utf-8')
    return parseDotenv(content)
  } catch {
    return {}
  }
}

export function parseDotenv(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (!match) continue

    const key = match[1].trim()
    let value = match[2].trim()

    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}

