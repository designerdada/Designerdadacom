# AutoSend Skill

Email API integration skill for AI coding agents. Send transactional emails, manage contacts, and use templates through the [REST API](SKILL.md) or [TypeScript SDK](references/sdk-guide.md).

## Prerequisites

- An [AutoSend](https://autosend.com) account with a verified sending domain
- An API key (Settings > API Keys > Generate API Key)
- Environment variable set: `export AUTOSEND_API_KEY=as_your_key_here`

## Installation

```bash
npx skills add autosendhq/skills
```

## Quick Start

```bash
npm install autosendjs
```

```typescript
import { Autosend } from 'autosendjs';

const autosend = new Autosend(process.env.AUTOSEND_API_KEY);

await autosend.emails.send({
  from: { email: 'hello@yourdomain.com', name: 'Your Company' },
  to: { email: 'user@example.com', name: 'Test User' },
  subject: 'Hello from AutoSend!',
  html: '<h1>It works!</h1><p>Your AutoSend integration is ready.</p>',
});
```

## Features

- **Single email** — Send transactional emails with HTML and plain text support
- **Bulk send** — Send to multiple recipients with shared sender, subject, and optional per-recipient dynamic data
- **Templates** — Use pre-built templates with dynamic data (order confirmations, welcome emails, password resets, etc.)
- **Contact management** — Create, get, upsert, and delete contacts with custom fields and list assignments
- **TypeScript support** — Full type definitions for all SDK methods and options
- **Error handling** — Structured error codes (`UNAUTHORIZED`, `RATE_LIMIT_EXCEEDED`, `VALIDATION_FAILED`) for reliable integrations
- **Configurable SDK** — Custom timeouts, retries, debug logging, and base URL options

## Documentation

- [SKILL.md](SKILL.md) — REST API endpoints, parameter tables, and response formats
- [SDK Guide](references/sdk-guide.md) — TypeScript SDK examples for all features
- [API Guide](references/api-guide.md) — AutoSend API overview and concepts
- [API Reference](https://docs.autosend.com/api-reference/introduction) — Official AutoSend API reference

## License

MIT
