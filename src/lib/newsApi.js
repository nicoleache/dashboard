// Client-side RSS fetching via rss2json (free, no key required for moderate use).
// Falls back to allorigins.win + DOMParser if rss2json fails.

const RSS2JSON = (feedUrl) =>
  `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=12`

const ALLORIGINS = (feedUrl) =>
  `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`

const CACHE_MS = 15 * 60 * 1000 // 15 min
const cacheKey = (url) => `rss_${url}`

function getCached(url) {
  try {
    const raw = localStorage.getItem(cacheKey(url))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts > CACHE_MS) return null
    return parsed.data
  } catch { return null }
}
function setCached(url, data) {
  try { localStorage.setItem(cacheKey(url), JSON.stringify({ ts: Date.now(), data })) } catch {}
}

function stripHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim()
}

async function fetchViaRss2Json(feedUrl) {
  const res = await fetch(RSS2JSON(feedUrl), { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`rss2json ${res.status}`)
  const json = await res.json()
  if (json.status !== 'ok') throw new Error(`rss2json status=${json.status}`)
  return (json.items || []).map(it => ({
    title: it.title,
    link: it.link,
    pubDate: it.pubDate,
    description: stripHtml(it.description || ''),
    author: it.author || json.feed?.title,
    sourceName: json.feed?.title,
  }))
}

async function fetchViaAllOrigins(feedUrl) {
  const res = await fetch(ALLORIGINS(feedUrl), { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`allorigins ${res.status}`)
  const json = await res.json()
  const xml = new DOMParser().parseFromString(json.contents, 'text/xml')
  const channelTitle = xml.querySelector('channel > title, feed > title')?.textContent || ''
  const items = Array.from(xml.querySelectorAll('item, entry')).slice(0, 12)
  return items.map(item => ({
    title: item.querySelector('title')?.textContent?.trim(),
    link: item.querySelector('link')?.getAttribute('href') || item.querySelector('link')?.textContent?.trim(),
    pubDate: item.querySelector('pubDate, published, updated')?.textContent?.trim(),
    description: stripHtml(item.querySelector('description, summary, content')?.textContent || ''),
    author: item.querySelector('author, dc\\:creator')?.textContent?.trim() || channelTitle,
    sourceName: channelTitle,
  }))
}

export async function fetchFeed(feedUrl) {
  const cached = getCached(feedUrl)
  if (cached) return cached
  try {
    const items = await fetchViaRss2Json(feedUrl)
    setCached(feedUrl, items)
    return items
  } catch {
    try {
      const items = await fetchViaAllOrigins(feedUrl)
      setCached(feedUrl, items)
      return items
    } catch (e) {
      console.warn(`[newsApi] all methods failed for`, feedUrl, e)
      return []
    }
  }
}

// Fetch multiple feeds, merge, dedupe by link, sort by date desc
export async function fetchSection(feeds, limit = 20) {
  const results = await Promise.all(feeds.map(f => fetchFeed(f.url).then(items =>
    items.map(it => ({ ...it, sourceName: it.sourceName || f.name, sourceKey: f.name }))
  )))
  const flat = results.flat()
  const seen = new Set()
  const deduped = flat.filter(it => {
    if (!it.link || seen.has(it.link)) return false
    seen.add(it.link)
    return true
  })
  deduped.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0))
  return deduped.slice(0, limit)
}

// ============ Feed definitions ============

export const FEEDS = {
  geopolitical: [
    { name: 'Foreign Affairs',   url: 'https://www.foreignaffairs.com/rss.xml' },
    { name: 'Reuters World',     url: 'https://feeds.reuters.com/Reuters/worldNews' },
    { name: 'The Economist',     url: 'https://www.economist.com/international/rss.xml' },
    { name: 'War on the Rocks',  url: 'https://warontherocks.com/feed/' },
    { name: 'CFR',               url: 'https://www.cfr.org/rss-feeds' },
    { name: 'FT World',          url: 'https://www.ft.com/world?format=rss' },
  ],
  macro: [
    { name: 'Apollo (Slok)',     url: 'https://www.apolloacademy.com/feed/' },
    { name: 'FT Markets',        url: 'https://www.ft.com/markets?format=rss' },
    { name: 'Reuters Business',  url: 'https://feeds.reuters.com/reuters/businessNews' },
    { name: 'The Economist Finance', url: 'https://www.economist.com/finance-and-economics/rss.xml' },
    { name: 'Calculated Risk',   url: 'https://www.calculatedriskblog.com/feeds/posts/default' },
    { name: 'Noahpinion',        url: 'https://www.noahpinion.blog/feed' },
  ],
  techAi: [
    { name: 'TechCrunch AI',     url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'The Verge AI',      url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
    { name: 'VentureBeat AI',    url: 'https://venturebeat.com/category/ai/feed/' },
    { name: 'Simon Willison',    url: 'https://simonwillison.net/atom/everything/' },
    { name: 'Import AI',         url: 'https://jack-clark.net/feed/' },
    { name: 'The Neuron',        url: 'https://www.theneurondaily.com/feed' },
    { name: 'TechCrunch Startups', url: 'https://techcrunch.com/category/startups/feed/' },
  ],
  longform: [
    { name: 'Stratechery',                url: 'https://stratechery.com/feed/' },
    { name: 'One Useful Thing (Mollick)', url: 'https://www.oneusefulthing.org/feed' },
    { name: 'Astral Codex Ten',           url: 'https://www.astralcodexten.com/feed' },
    { name: 'Marginal Revolution',        url: 'https://marginalrevolution.com/feed' },
    { name: 'Noahpinion',                 url: 'https://www.noahpinion.blog/feed' },
    { name: 'Ribbonfarm',                 url: 'https://www.ribbonfarm.com/feed/' },
    { name: 'Gwern',                      url: 'https://gwern.net/doc/index.rss' },
    { name: 'Not Boring (Packy)',         url: 'https://www.notboring.co/feed' },
    { name: 'Ezra Klein Show',            url: 'https://feeds.simplecast.com/82FI35Px' },
    { name: 'The Dispatch',               url: 'https://thedispatch.com/feed/' },
  ],
}
