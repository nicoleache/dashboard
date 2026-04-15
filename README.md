# Markets Dashboard

A personal dashboard for tracking public and private markets, with a focus on AI and data companies.

![Dashboard](https://img.shields.io/badge/status-first%20draft-6366f1) ![React](https://img.shields.io/badge/React-19-61dafb) ![Vite](https://img.shields.io/badge/Vite-8-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## What it tracks

### Public Markets
- **Major Indices:** S&P 500, NASDAQ, Dow Jones, Russell 2000, VIX — with live sparklines
- **Watchlist:** NVIDIA, Alphabet, ServiceNow, Salesforce, Microsoft, Apple, Amazon, Meta, Snowflake, Palantir, MongoDB, Datadog, CrowdStrike, C3.ai, UiPath
- **Sector Performance:** S&P 500 sector heatmap
- **Market Breadth:** Advance/decline, new 52W highs/lows, % above 200-day MA

### Private Markets (AI & Data focus)
- **Recent Fundraises (Series A-F+):** Anthropic, Databricks, CoreWeave, xAI, Scale AI, Glean, Mistral, Cohere, Perplexity, Harvey, Cursor, Fivetran, Writer, Sierra, and more
- **M&A Activity:** Wiz/Google, Hashicorp/IBM, Moveworks/ServiceNow, Informatica/Salesforce, etc.
- **Sector Valuation Multiples:** Median EV/Revenue by category (Foundation Models, AI Infra, Enterprise AI, Data Infra, etc.)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Tech stack
- React 19 + Vite 8
- Tailwind CSS v4
- Recharts for charts
- Lucide for icons

## Notes on data

This first draft uses mock data that updates every 8 seconds for indices/stocks to demonstrate the live-update feel. Private markets deals are curated from Crunchbase, PitchBook, TechCrunch, and The Information (as of April 2026).

To wire up real-time public-market data, plug in one of:
- Yahoo Finance (via `yahoo-finance2` proxy)
- Alpha Vantage (free tier, 25 req/day)
- Financial Modeling Prep (free tier, 250 req/day)
- Polygon.io (free tier)

## Roadmap ideas
- [ ] Real-time stock API integration
- [ ] Editable watchlist (add/remove tickers)
- [ ] Saved filters for private markets
- [ ] Auto-refreshing private deals via Crunchbase/PitchBook APIs
- [ ] News feed integration
- [ ] Export to CSV / PDF
- [ ] Dark/light mode toggle

---

Built for Nicole Chen — Corp Dev (M&A/Ventures), covering AI & Data.
