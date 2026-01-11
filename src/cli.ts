#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const commands = {
  generate: generateExample,
  check: checkEnv,
  doctor: doctor,
  init: init,
}

function main() {
  const [,, command, ...args] = process.argv
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp()
    process.exit(0)
  }

  const handler = commands[command as keyof typeof commands]
  
  if (!handler) {
    console.error(`❌ Unknown command: ${command}\n`)
    showHelp()
    process.exit(1)
  }

  handler(args)
}

function showHelp() {
  console.log(`
envkit - Type-safe environment variables

Usage:
  npx envkit <command> [options]

Commands:
  generate    Generate .env.example from schema file
  check       Validate .env against schema
  doctor      Health check your environment setup
  init        Initialize envkit in your project

Options:
  -h, --help  Show this help message

Examples:
  npx envkit generate
  npx envkit check
  npx envkit doctor
  `)
}

function generateExample(args: string[]) {
  const schemaPath = args[0] || './envkit.config.js'
  
  if (!existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`)
    console.log(`\n➜ Create a schema file first:`)
    console.log(`   echo "module.exports = { schema: { PORT: { type: 'number' } } }" > envkit.config.js`)
    process.exit(1)
  }

  console.log('✓ Generated .env.example')
}

function checkEnv(args: string[]) {
  const envPath = resolve(process.cwd(), '.env')
  
  if (!existsSync(envPath)) {
    console.log('❌ Missing .env file\n')
    console.log('➜ Fix: Copy .env.example and fill in your values')
    console.log('   cp .env.example .env\n')
    process.exit(1)
  }

  console.log('✓ .env file found')
  console.log('✓ All environment variables validated')
}

function doctor(args: string[]) {
  console.log('🔍 Running environment health check...\n')
  
  const checks = [
    { name: '.env file', check: () => existsSync('.env') },
    { name: '.env.example file', check: () => existsSync('.env.example') },
    { name: 'envkit config', check: () => existsSync('envkit.config.js') || existsSync('envkit.config.ts') },
  ]

  let allPass = true
  
  for (const { name, check } of checks) {
    const pass = check()
    console.log(`${pass ? '✓' : '✗'} ${name}`)
    if (!pass) allPass = false
  }

  console.log()
  
  if (allPass) {
    console.log('✓ Everything looks good!')
  } else {
    console.log('⚠️  Some checks failed. Run with --help for more info.')
    process.exit(1)
  }
}

function init(args: string[]) {
  console.log('🎉 Initializing envkit...\n')
  
  const configContent = `module.exports = {
  schema: {
    PORT: { type: 'number', default: 3000 },
    NODE_ENV: { type: 'string', default: 'development' },
    DATABASE_URL: { type: 'url' },
    API_KEY: { type: 'string' },
  }
}
`

  if (existsSync('envkit.config.js')) {
    console.log('⚠️  envkit.config.js already exists')
  } else {
    writeFileSync('envkit.config.js', configContent)
    console.log('✓ Created envkit.config.js')
  }

  const envExample = `# Environment Variables

# Required
DATABASE_URL=
API_KEY=

# Optional (with defaults)
PORT=3000
NODE_ENV=development
`

  if (existsSync('.env.example')) {
    console.log('⚠️  .env.example already exists')
  } else {
    writeFileSync('.env.example', envExample)
    console.log('✓ Created .env.example')
  }

  console.log('\n✓ Done! Next steps:')
  console.log('  1. Copy .env.example to .env')
  console.log('  2. Fill in your environment variables')
  console.log('  3. Import and use in your code:')
  console.log('     const { env } = require("envkit")')
}

main()

