# Gaurav Warke — Portfolio

> Data & Business Analytics · BI · Supply Chain · FinTech — Melbourne, AU

A single-file, zero-build interactive portfolio with a live **3D data-network** background (Three.js), per-section domain motifs, a fluid morphing shape, and a **Case Study Inspector** that frames every project as Problem → Architecture → Metric.

**Live:** https://gauravwarke.github.io/Portfolio/
**Contact:** gauravwarke8@gmail.com · [LinkedIn](https://www.linkedin.com/in/gaurav-warke-b5493b394) · [GitHub](https://github.com/GauravWarke)

---

## Tech
- **HTML + CSS + vanilla JS** — no build step, one `index.html`
- **Three.js** (r128, via CDN) — 3D data-network, fluid blob, per-section themes
- Fonts: Sora · Inter · JetBrains Mono
- Fully responsive, `prefers-reduced-motion` aware, graceful WebGL fallback

## Run locally
```bash
# any static server works — e.g. Python
python -m http.server 5500
# then open http://localhost:5500
```

## Deploy

### Option A — GitHub Pages (free, github.io URL)
```bash
git init
git add .
git commit -m "Portfolio"
git branch -M main
git remote add origin https://github.com/GauravWarke/Portfolio.git
git push -u origin main
```
Then on GitHub: **Settings → Pages → Source: `main` / root → Save.**
Your site goes live at `https://gauravwarke.github.io/Portfolio/`.

### Option B — Vercel (same repo)
1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the same `portfolio` repo.
2. Framework preset: **Other**. Build command: _none_. Output dir: `./`.
3. Deploy. You get a `*.vercel.app` URL (and can add a custom domain).

> You can run **both** at once — GitHub Pages and Vercel both serve from this one repo. Use the Vercel URL as your primary (it's faster + supports custom domains) and keep Pages as a backup.

## Structure
```
my-portfolio/
├── index.html          # the entire site
├── README.md
├── tailwind.config.js  # design tokens (for the React blueprint version)
├── src/                # optional React/Vite version of the same site
└── github-launch/      # READMEs for the 4 project repos + LinkedIn post (staging)
```

## License
MIT — © 2026 Gaurav Warke
