export type EnvType = 'string' | 'number' | 'boolean' | 'url' | 'email' | 'port' | 'integer' | 'json' | 'array' | 'enum' | 'regex'

export interface EnvFieldConfigBase {
  default?: unknown
  optional?: boolean
  transform?: (value: unknown) => unknown
  validate?: (value: unknown) => boolean
  secret?: boolean
}

export interface StringFieldConfig extends EnvFieldConfigBase {
  type: 'string'
  default?: string
}

export interface NumberFieldConfig extends EnvFieldConfigBase {
  type: 'number'
  default?: number
}

export interface IntegerFieldConfig extends EnvFieldConfigBase {
  type: 'integer'
  default?: number
}

export interface BooleanFieldConfig extends EnvFieldConfigBase {
  type: 'boolean'
  default?: boolean
}

export interface UrlFieldConfig extends EnvFieldConfigBase {
  type: 'url'
  default?: string
}

export interface EmailFieldConfig extends EnvFieldConfigBase {
  type: 'email'
  default?: string
}

export interface PortFieldConfig extends EnvFieldConfigBase {
  type: 'port'
  default?: number
}

export interface JsonFieldConfig extends EnvFieldConfigBase {
  type: 'json'
  default?: unknown
}

export interface ArrayFieldConfig extends EnvFieldConfigBase {
  type: 'array'
  separator?: string
  default?: string[]
}

export interface EnumFieldConfig extends EnvFieldConfigBase {
  type: 'enum'
  values: readonly string[]
  default?: string
}

export interface RegexFieldConfig extends EnvFieldConfigBase {
  type: 'regex'
  pattern: RegExp
  default?: string
}

export type EnvFieldConfig = 
  | StringFieldConfig 
  | NumberFieldConfig 
  | IntegerFieldConfig
  | BooleanFieldConfig 
  | UrlFieldConfig 
  | EmailFieldConfig 
  | PortFieldConfig
  | JsonFieldConfig
  | ArrayFieldConfig
  | EnumFieldConfig
  | RegexFieldConfig

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
  : T['type'] extends 'integer'
  ? number
  : T['type'] extends 'boolean'
  ? boolean
  : T['type'] extends 'url'
  ? string
  : T['type'] extends 'email'
  ? string
  : T['type'] extends 'port'
  ? number
  : T['type'] extends 'json'
  ? unknown
  : T['type'] extends 'array'
  ? string[]
  : T['type'] extends 'enum'
  ? T extends EnumFieldConfig ? T['values'][number] : string
  : T['type'] extends 'regex'
  ? string
  : never

