# Photography API (Cloudflare Worker)

Cloudflare Worker API for managing photography uploads and serving photo metadata. Uses Cloudflare R2 for storage.

## Setup

### 1. Prerequisites

- Cloudflare account with Workers and R2 enabled
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)

### 2. Install Dependencies

```bash
cd cloudflare-worker
npm install
```

### 3. Create R2 Bucket

In Cloudflare Dashboard:

1. Go to R2 > Create bucket
2. Name it something like `your-site-photos`
3. Enable public access (Settings > Public Access > Allow Access)
4. Note the public URL (e.g., `https://pub-xxx.r2.dev`)

### 4. Configure Worker

Update `wrangler.toml`:

```toml
name = "your-photos-api"  # Change this
bucket_name = "your-site-photos"  # Match your bucket name
CORS_ORIGIN = "https://yourdomain.com"  # Your production domain
R2_PUBLIC_URL = "https://pub-xxx.r2.dev"  # Your R2 public URL
```

### 5. Set Admin Password

Generate a SHA-256 hash of your password:

```bash
echo -n "your-secure-password" | shasum -a 256
```

Set the secret in Cloudflare:

```bash
wrangler secret put ADMIN_PASSWORD_HASH
# Paste the hash (without the trailing " -")
```

### 6. Local Development

Copy the example secrets file:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your development password hash.

Start the development server:

```bash
npm run dev
```

### 7. Deploy

```bash
npm run deploy
```

Note the worker URL (e.g., `https://your-photos-api.YOUR-SUBDOMAIN.workers.dev`)

### 8. Update Frontend Config

In your main project, update the environment variables or `src/data/cloudflare-config.ts`:

```typescript
export const WORKER_API_URL = 'https://your-photos-api.YOUR-SUBDOMAIN.workers.dev';
export const R2_PUBLIC_URL = 'https://pub-xxx.r2.dev';
```

Or set via `.env`:

```
VITE_WORKER_API_URL=https://your-photos-api.YOUR-SUBDOMAIN.workers.dev
VITE_R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

## API Endpoints

### Public

- `GET /api/photos` - Get all photos

### Protected (requires Bearer token)

- `POST /api/auth` - Authenticate with password, returns token
- `POST /api/photos` - Upload a photo (multipart form: file + metadata JSON)
- `DELETE /api/photos/:id` - Delete a photo

## Security Notes

- Never commit `.dev.vars` (it's in `.gitignore`)
- Use `wrangler secret` to set production secrets
- The admin password hash is stored securely in Cloudflare
