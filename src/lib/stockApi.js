// Real-time stock data via Yahoo Finance (public chart endpoint)
// proxied through corsproxy.io since Yahoo doesn't serve CORS headers to browsers.
// No API key required. Free and rate-limited — we cache + fallback to mock on error.

const CORS_PROXIES = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
]

const YAHOO_CHART = (symbol, range = '1y', interval = '1d') =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`

// localStorage cache: keep data for 5 minutes to avoid hammering proxies
const CACHE_MS = 5 * 60 * 1000
const cacheKey = (symbol) => `yfq_${symbol}`

function getCached(symbol) {
  try {
    const raw = localStorage.getItem(cacheKey(symbol))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_MS) return null
    return parsed.data
  } catch { return null }
}

function setCached(symbol, data) {
  try {
    localStorage.setItem(cacheKey(symbol), JSON.stringify({ ts: Date.now(), data }))
  } catch { /* quota exceeded, ignore */ }
}

async function tryFetch(url) {
  // Try each proxy in order
  for (const proxy of CORS_PROXIES) {
    try {
      const res = await fetch(proxy(url), { signal: AbortSignal.timeout(6000) })
      if (res.ok) {
        const json = await res.json()
        return json
      }
    } catch { /* try next proxy */ }
  }
  throw new Error('All proxies failed')
}

// Normalize Yahoo chart response → clean shape
function parseChart(json) {
  const result = json?.chart?.result?.[0]
  if (!result) return null
  const meta = result.meta
  const timestamps = result.timestamp || []
  const closes = result.indicators?.quote?.[0]?.close || []

  // Build [{ date, close }] — skip nulls (non-trading days)
  const series = timestamps.map((t, i) => ({
    date: new Date(t * 1000),
    close: closes[i],
  })).filter(p => p.close != null)

  const price = meta.regularMarketPrice
  const prevClose = meta.chartPreviousClose
  const change = price - prevClose
  const changePct = (change / prevClose) * 100

  // Find first trading day of current calendar year as YTD baseline
  const thisYear = new Date().getFullYear()
  const ytdBase = series.find(p => p.date.getFullYear() === thisYear)?.close ?? prevClose
  const ytdPct = ((price - ytdBase) / ytdBase) * 100

  // Sparkline: last ~30 closes, normalized to {value}
  const sparkline = series.slice(-30).map(p => ({ value: p.close }))

  return {
    price,
    prevClose,
    change,
    changePct,
    ytdBase,
    ytdPct,
    sparkline,
    currency: meta.currency,
    exchange: meta.exchangeName,
    marketCap: meta.marketCap, // sometimes missing for indices
    timestamp: meta.regularMarketTime,
  }
}

export async function fetchQuote(symbol) {
  const cached = getCached(symbol)
  if (cached) return cached

  try {
    const json = await tryFetch(YAHOO_CHART(symbol, '1y', '1d'))
    const parsed = parseChart(json)
    if (parsed) {
      setCached(symbol, parsed)
      return parsed
    }
  } catch (e) {
    console.warn(`[stockApi] fetch failed for ${symbol}`, e)
  }
  return null
}

export async function fetchQuotes(symbols) {
  const results = await Promise.all(symbols.map(s => fetchQuote(s).then(d => [s, d])))
  return Object.fromEntries(results)
}

// Format helpers
export function formatMarketCap(num) {
  if (num == null) return null
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`
  return String(num)
}

export function formatVolume(num) {
  if (num == null) return '—'
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return String(num)
}
