import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { execSync } from 'child_process'
import { existsSync, writeFileSync, unlinkSync, mkdirSync, rmdirSync, readFileSync } from 'fs'
import { resolve } from 'path'

describe('CLI', () => {
  const testDir = resolve(__dirname, '../.test-cli')
  const cliPath = resolve(__dirname, '../dist/cli.cjs')

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      try {
        const files = ['envconfig-kit.config.js', '.env', '.env.example']
        files.forEach(file => {
          const filePath = resolve(testDir, file)
          if (existsSync(filePath)) {
            unlinkSync(filePath)
          }
        })
        rmdirSync(testDir)
      } catch {}
    }
  })

  const runCLI = (args: string[]): string => {
    try {
      return execSync(`node ${cliPath} ${args.join(' ')}`, {
        encoding: 'utf-8',
        cwd: testDir,
        stdio: ['pipe', 'pipe', 'pipe'],
      })
    } catch (error: any) {
      return (error.stdout || '') + (error.stderr || '') || error.message || String(error)
    }
  }

  describe('help', () => {
    it('shows help with --help', () => {
      const output = runCLI(['--help'])
      expect(output).toContain('envconfig-kit')
      expect(output).toContain('generate')
      expect(output).toContain('check')
      expect(output).toContain('doctor')
      expect(output).toContain('init')
    })

    it('shows help with -h', () => {
      const output = runCLI(['-h'])
      expect(output).toContain('envconfig-kit')
    })

    it('shows help with no command', () => {
      const output = runCLI([])
      expect(output).toContain('envconfig-kit')
    })

    it('shows error for unknown command', () => {
      const output = runCLI(['unknown'])
      expect(output).toContain('Unknown command')
      expect(output).toContain('unknown')
    })
  })

  describe('generate', () => {
    it('errors when schema file not found', () => {
      const output = runCLI(['generate'])
      expect(output).toContain('Schema file not found')
      expect(output).toContain('envconfig-kit.config.js')
    })

    it('succeeds when schema file exists', () => {
      writeFileSync(resolve(testDir, 'envconfig-kit.config.js'), 'module.exports = { schema: {} }')
      const output = runCLI(['generate'])
      expect(output).toContain('Generated .env.example')
    })
  })

  describe('check', () => {
    it('errors when .env file not found', () => {
      const output = runCLI(['check'])
      expect(output).toContain('Missing .env file')
      expect(output).toContain('.env.example')
    })

    it('succeeds when .env file exists', () => {
      writeFileSync(resolve(testDir, '.env'), 'PORT=3000')
      const output = runCLI(['check'])
      expect(output).toContain('.env file found')
      expect(output).toContain('All environment variables validated')
    })
  })

  describe('doctor', () => {
    it('reports missing files', () => {
      const output = runCLI(['doctor'])
      expect(output).toContain('Running environment health check')
      expect(output).toContain('.env file')
      expect(output).toContain('.env.example file')
      expect(output).toContain('envconfig-kit config')
    })

    it('reports all checks passing', () => {
      writeFileSync(resolve(testDir, '.env'), 'PORT=3000')
      writeFileSync(resolve(testDir, '.env.example'), 'PORT=3000')
      writeFileSync(resolve(testDir, 'envconfig-kit.config.js'), 'module.exports = { schema: {} }')
      
      const output = runCLI(['doctor'])
      expect(output).toContain('Everything looks good')
    })

    it('reports some checks failing', () => {
      writeFileSync(resolve(testDir, '.env'), 'PORT=3000')
      
      const output = runCLI(['doctor'])
      expect(output).toContain('Some checks failed')
    })
  })

  describe('init', () => {
    it('creates config and example files', () => {
      const output = runCLI(['init'])
      
      expect(existsSync(resolve(testDir, 'envconfig-kit.config.js'))).toBe(true)
      expect(existsSync(resolve(testDir, '.env.example'))).toBe(true)
      expect(output).toContain('Created envconfig-kit.config.js')
      expect(output).toContain('Created .env.example')
    })

    it('warns when files already exist', () => {
      writeFileSync(resolve(testDir, 'envconfig-kit.config.js'), 'module.exports = {}')
      writeFileSync(resolve(testDir, '.env.example'), 'PORT=3000')
      
      const output = runCLI(['init'])
      expect(output).toContain('already exists')
    })

    it('creates valid config file', () => {
      runCLI(['init'])
      const configContent = readFileSync(resolve(testDir, 'envconfig-kit.config.js'), 'utf-8')
      expect(configContent).toContain('schema')
      expect(configContent).toContain('PORT')
      expect(configContent).toContain('DATABASE_URL')
    })

    it('creates valid .env.example file', () => {
      runCLI(['init'])
      const example = readFileSync(resolve(testDir, '.env.example'), 'utf-8')
      expect(example).toContain('DATABASE_URL')
      expect(example).toContain('API_KEY')
      expect(example).toContain('PORT=3000')
    })
  })
})
