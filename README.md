# Heavy Metal Facts

Static-first newsroom website for **heavymetalfacts.com** built with Next.js + TypeScript and MDX content files.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build (static export)

```bash
npm run build
```

This generates static HTML via Next.js export and writes auxiliary publishing files:

- `public/search-index.json`
- `public/rss.xml`
- `public/sitemap.xml`
- `public/robots.txt`

## Lint / format

```bash
npm run lint
npm run format
```

## Deployment

Deploy the exported `out/` directory to any static host (Netlify, Cloudflare Pages, S3+CloudFront, GitHub Pages) and map your custom domain `heavymetalfacts.com`.
