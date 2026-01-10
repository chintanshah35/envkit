import type { EnvSchema, EnvType } from './types'

export interface SchemaExport {
  name: string
  type: EnvType
  required: boolean
  default: unknown
}

export function schemaToJSON(schema: EnvSchema): SchemaExport[] {
  return Object.entries(schema).map(([name, config]) => ({
    name,
    type: config.type,
    required: !config.optional,
    default: config.default,
  }))
}

export function schemaToMarkdown(schema: EnvSchema): string {
  const rows = Object.entries(schema).map(([name, config]) => {
    const required = config.optional ? 'No' : 'Yes'
    const defaultValue = config.default !== undefined ? `\`${config.default}\`` : '-'
    return `| \`${name}\` | \`${config.type}\` | ${required} | ${defaultValue} |`
  })

  return [
    '| Variable | Type | Required | Default |',
    '| -------- | ---- | -------- | ------- |',
    ...rows,
  ].join('\n')
}

export function generateDotenvExample(schema: EnvSchema): string {
  const required: string[] = []
  const optional: string[] = []

  for (const [name, config] of Object.entries(schema)) {
    const line = config.default !== undefined 
      ? `${name}=${config.default}`
      : `${name}=`

    if (config.optional) {
      optional.push(line)
    } else {
      required.push(line)
    }
  }

  const sections: string[] = []

  if (required.length > 0) {
    sections.push('# Required', ...required)
  }

  if (optional.length > 0) {
    if (sections.length > 0) sections.push('')
    sections.push('# Optional', ...optional)
  }

  return sections.join('\n')
}

