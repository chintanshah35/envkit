# envkit

Type-safe environment variables with fail-fast validation. Zero dependencies.

## Install

```bash
npm install envkit
```

## Quick Start

```typescript
import { env } from 'envkit'

const config = env({
  PORT: { type: 'number', default: 3000 },
  API_KEY: { type: 'string' },
  DEBUG: { type: 'boolean', default: false },
  DATABASE_URL: { type: 'url' },
})

// config.PORT is typed as number
// config.API_KEY is typed as string
// Throws on startup if API_KEY or DATABASE_URL is missing
```

No need for `dotenv` - envkit automatically loads `.env` files.

## License

MIT

