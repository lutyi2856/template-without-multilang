---
name: nextjs-production-build
description: Production Docker build for Next.js with image optimization. Use when building Next.js for production Docker, debugging "url parameter is not allowed", slow image loading, or configuring remotePatterns for VPS deployment.
---

# Next.js Production Build (Docker)

## When to Use

- Use Context7 (resolve-library-id → query-docs) for latest API before relying on examples.
- Building Next.js Docker image for production
- Debugging `400: "url" parameter is not allowed` from image optimizer
- Images load extremely slowly (5-15+ seconds each)
- Configuring `remotePatterns` for VPS/production host
- Next.js build warns about missing `sharp`

## Critical: Dockerfile Must Copy next.config.js

The most common production image optimizer failure. Multi-stage Dockerfile must explicitly copy `next.config.js` into the runner stage:

```dockerfile
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js  # REQUIRED
```

Without this line, Next.js cannot read `remotePatterns` at runtime. The image optimizer rejects every external URL with:

```
HTTP/1.1 400 Bad Request
"url" parameter is not allowed
```

### How to Verify

Check that `next.config.js` exists in the running container:

```bash
docker exec CONTAINER cat /app/next.config.js | head -5
```

Check compiled config in `.next/required-server-files.json`:

```bash
docker exec CONTAINER cat /app/.next/required-server-files.json | grep -o '"remotePatterns":\[[^]]*\]'
```

## Critical: Install sharp

Without `sharp`, Next.js uses a pure JavaScript fallback for image processing — 10-20x slower.

```bash
npm install sharp
```

Verify in `package.json`:

```json
"sharp": "^0.33.5"
```

### Symptoms of Missing sharp

- Build warning: `For production Image Optimization with Next.js, the optional 'sharp' package is strongly recommended.`
- First image request takes 5-15+ seconds
- Subsequent requests may be faster (cached), but cold starts are terrible

### Verify sharp Works in Container

```bash
docker exec CONTAINER ls node_modules/sharp/
# Should show: LICENSE, README.md, install, lib, ...
```

## remotePatterns for VPS

When deploying to a VPS with WordPress on a different port, add the VPS IP to `remotePatterns` in `next.config.js`:

```js
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "VPS_IP",
      port: "8002",
      pathname: "/wp-content/**",
    },
    // Keep existing patterns for local dev
    {
      protocol: "http",
      hostname: "localhost",
      port: "8002",
      pathname: "/wp-content/**",
    },
  ],
},
```

After changing `next.config.js`, rebuild the Docker image (the config is baked in at build time).

## Diagnostics

### Test Image Optimizer Endpoint

```bash
# On VPS (inside the server)
curl -sI 'http://localhost:3000/_next/image?url=http://VPS_IP:8002/wp-content/uploads/2026/02/photo.jpg&w=640&q=75'
```

Expected responses:

| Response | Meaning | Fix |
|---|---|---|
| `200 OK` | Working correctly | None needed |
| `400 "url" parameter is not allowed` | `next.config.js` not in container or `remotePatterns` missing | Copy `next.config.js` in Dockerfile, add host to `remotePatterns` |
| `404 Not Found` | Image file does not exist at that path | Check `wp-content/uploads/` files, verify URL path |
| `500 Internal Server Error` | sharp or other processing error | Check container logs: `docker logs CONTAINER` |

### Measure Response Time

```bash
time curl -sI 'http://localhost:3000/_next/image?url=...&w=640&q=75'
```

| Time | Status |
|---|---|
| < 1s | Normal (with sharp) |
| 5-15s | Missing sharp (JS fallback) |
| > 30s | Network issue fetching source image |

### Check Next.js Logs

```bash
docker logs --tail 50 CONTAINER 2>&1 | grep -i "image\|sharp\|optim"
```

## Full Dockerfile Example

```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_GRAPHQL_ENDPOINT
ARG NEXT_PUBLIC_WP_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GRAPHQL_ENDPOINT=$NEXT_PUBLIC_GRAPHQL_ENDPOINT
ENV NEXT_PUBLIC_WP_URL=$NEXT_PUBLIC_WP_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
```

## Rebuild Workflow

After any change to `next.config.js`, `package.json`, or Dockerfile:

```bash
# 1. Upload changed files to VPS
scp -i ~/.ssh/id_ed25519 nextjs/package.json nextjs/package-lock.json nextjs/next.config.js nextjs/Dockerfile root@VPS_IP:/opt/wp-nextjs/nextjs/

# 2. Clean space if needed
ssh root@VPS_IP "docker system prune -af && docker builder prune -af"

# 3. Rebuild
ssh root@VPS_IP "cd /opt/wp-nextjs && docker compose -f docker-compose.production.yml -f override.yml build --no-cache nextjs"

# 4. Restart
ssh root@VPS_IP "cd /opt/wp-nextjs && docker compose -f docker-compose.production.yml -f override.yml up -d nextjs"

# 5. Verify
ssh root@VPS_IP "curl -sI 'http://localhost:3000/_next/image?url=http://VPS_IP:8002/wp-content/uploads/2026/02/test.jpg&w=640&q=75'"
```

## Common Errors

### Error: "url" parameter is not allowed (400)

**Cause:** `next.config.js` not copied to runner stage in Dockerfile, or `remotePatterns` does not include the image host.
**Fix:** Add `COPY --from=builder /app/next.config.js ./next.config.js` to Dockerfile. Add VPS IP to `remotePatterns`.

### Error: Images load in 5-15 seconds

**Cause:** `sharp` package not installed.
**Fix:** `npm install sharp`, rebuild Docker image.

### Error: ENOSPC: no space left on device (during build)

**Cause:** VPS disk full from Docker build cache and old images.
**Fix:** `docker system prune -af && docker builder prune -af` (frees 5-15 GB typically).

### Error: Next.js hangs after build on full disk (corrupted image)

**Cause:** Docker image was built when VPS disk was full or nearly full. The build may "succeed" but the resulting image is corrupted or incomplete.

**Symptoms:**
- Container starts, logs show `Ready in X.Xs`
- `curl localhost:3000` connects but receives 0 bytes, then times out
- Pages never load, no error in logs (just fetch warnings)

**Fix:**

```bash
# 1. Free disk space first
docker system prune -af && docker builder prune -af
df -h /  # Verify at least 5GB free

# 2. Rebuild from scratch
docker compose -f docker-compose.production.yml -f override.yml build --no-cache nextjs

# 3. Restart
docker compose -f docker-compose.production.yml -f override.yml up -d nextjs
sleep 15
curl -sf http://localhost:3000 > /dev/null && echo "OK" || echo "FAIL"
```

Always rebuild with `--no-cache` after a disk-full incident.

### Error: ECONNREFUSED ::1:8002 (during build)

**Cause:** `generateStaticParams` tries to fetch from WordPress during build, but WordPress is not accessible from the builder container via IPv6 loopback.
**Fix:** This is a build-time warning, not a runtime error. Static pages for those routes will be generated on first request instead. Safe to ignore unless all pages must be pre-rendered.
