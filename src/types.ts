export type EnvType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'port'

export interface EnvFieldConfig {
  type: EnvType
  default?: string | number | boolean
  optional?: boolean
  transform?: (value: string) => any
}

export type EnvSchema = Record<string, EnvFieldConfig>

export type InferEnvType<T extends EnvSchema> = {
  [K in keyof T]: T[K]['optional'] extends true
    ? InferFieldType<T[K]> | undefined
    : InferFieldType<T[K]>
}

type InferFieldType<T extends EnvFieldConfig> = T['type'] extends 'string'
  ? string
  : T['type'] extends 'number'
  ? number
  : T['type'] extends 'boolean'
  ? boolean
  : T['type'] extends 'url'
  ? string
  : T['type'] extends 'email'
  ? string
  : T['type'] extends 'port'
  ? number
  : never

