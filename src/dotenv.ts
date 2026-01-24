import { readFileSync, existsSync } from 'fs'

export const loadDotenv = (path: string): Record<string, string> => {
  if (!existsSync(path)) return {}

  try {
    const content = readFileSync(path, 'utf-8')
    return parseDotenv(content)
  } catch {
    return {}
  }
}

export const parseDotenv = (content: string): Record<string, string> => {
  const result: Record<string, string> = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = trimmed.match(/^([^=]+)=(.*)$/)
    if (!match) continue

    const key = match[1].trim()
    let value = match[2].trim()

    const isQuoted = (value.startsWith('"') && value.endsWith('"')) || 
                     (value.startsWith("'") && value.endsWith("'"))
    
    if (isQuoted) {
      value = value.slice(1, -1)
    }

    result[key] = value
  }

  return result
}
