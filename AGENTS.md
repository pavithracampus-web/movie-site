# FLARE - Movie Streaming Platform

## Architecture Overview

```
src/
├── middleware.ts           # Edge middleware: bot detection + cloaking
├── app/
│   ├── layout.tsx          # Pass-through root layout
│   ├── (main)/             # Main site route group
│   │   ├── layout.tsx      # Netflix theme layout (dark)
│   │   ├── page.tsx        # Home page (data orchestrator)
│   │   ├── globals.css     # Netflix-style Tailwind styles
│   │   ├── api/movies/     # TMDB API proxy
│   │   ├── components/     # UI components
│   │   ├── lib/            # Utilities + TMDB helpers
│   │   └── types/          # TypeScript interfaces
│   └── cloak/              # Cloak route group
│       ├── layout.tsx      # Minimal blog layout (light theme)
│       └── page.tsx        # Boring personal blog template
├── .env.local.example      # Environment variable template
├── tailwind.config.js
├── next.config.js
└── package.json
```

## Setup

### 1. Get a TMDB API Key
- Go to https://www.themoviedb.org/settings/api
- Create an account and request a free API key
- You need the "API Read Access Token" (v3 auth)

### 2. Configure Environment
```bash
cp .env.local.example .env.local
# Edit .env.local and set your TMDB_API_KEY
```

### 3. Install & Run
```bash
npm install
npm run dev      # Local dev at http://localhost:3000
npm run build    # Production build
npm run start    # Production server
```

## Cloaking / Anti-Bot Mechanism

### How It Works (middleware.ts)

1. **User-Agent Detection** - Checks for 50+ bot patterns (Googlebot, Bingbot, GPTBot, etc.)
2. **IP Range Verification** - Matches against known Google/AWS datacenter ranges
3. **Reverse DNS Lookup** - For suspicious IPs, resolves PTR records to confirm bot origin
4. **Dual Routing**:
   - **Bot detected** → `NextResponse.rewrite()` to `/cloak` → serves a personal blog
   - **Human detected** → Passes through normally → serves Netflix-style UI
   - **API requests from bots** → Returns 404 JSON

### What Bots See
The cloak page at `/app/cloak/` renders a genuine-looking personal blog titled "Wandering Thoughts" with:
- Blog posts about productivity, cooking, DIY, travel, and tech
- Standard SEO meta tags (`index, follow`)
- Clean semantic HTML with no movie-related content
- Light theme (completely opposite aesthetic from the main site)

### Why This Works
- Middleware runs at the **Edge** (before any page renders)
- Bot detection happens before the main site content is ever served
- Rewrites are transparent - the bot sees `/` but receives the cloak page
- Real users experience zero latency impact

## Deployment (Vercel - Free Tier)

### Steps
1. Push to GitHub
2. Import repo at https://vercel.com/new
3. Add environment variable:
   - `TMDB_API_KEY` → your TMDB key
4. Deploy — that's it

### What Runs Where
| Component | Runtime | Location |
|-----------|---------|----------|
| Middleware | Edge (Vercel Edge) | Global |
| Pages | Serverless (Node.js) | Vercel regions |
| API Routes | Serverless (Node.js) | Vercel regions |
| Static Assets | CDN | Vercel Edge Network |

### Edge Functions Note
The middleware runs on Vercel's Edge Runtime by default. The `dns.google` lookup in the reverse DNS check may have latency implications. If you need to optimize, remove the reverse DNS check and rely solely on User-Agent + IP range detection.

## Streaming Sources
The player modal uses Vidsrc embeds:
- Primary: `https://vidsrc.to/embed/movie/{imdb_id}`
- Fallback: `https://vidsrc.xyz/embed/movie/{imdb_id}`
- Users can toggle between sources in the player modal

## Customization
- **Add more genres** - Edit `GENRES` array in `app/(main)/lib/tmdb.ts`
- **Modify cloak content** - Edit `app/cloak/page.tsx`
- **Change hero rotation** - Adjust `setInterval` in `app/(main)/components/Hero.tsx`
- **Add bot patterns** - Append to `BOT_PATTERNS` in `middleware.ts`
