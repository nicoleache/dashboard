// Client-side RSS fetching via rss2json (free, no key required).
// IMPORTANT: the free tier does NOT support the `&count=` parameter —
// including it silently returns {status:'error'}. Always omit it.

const RSS2JSON = (feedUrl) =>
  `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`

const ALLORIGINS = (feedUrl) =>
  `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`

const CORSPROXY = (feedUrl) =>
  `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`

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
  const res = await fetch(RSS2JSON(feedUrl), { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`rss2json ${res.status}`)
  const json = await res.json()
  if (json.status !== 'ok') throw new Error(`rss2json ${json.status}: ${json.message || ''}`)
  return (json.items || []).map(it => ({
    title: it.title,
    link: it.link,
    pubDate: it.pubDate,
    description: stripHtml(it.description || ''),
    author: it.author || json.feed?.title,
    sourceName: json.feed?.title,
  }))
}

async function fetchXmlAndParse(fetchUrl) {
  const res = await fetch(fetchUrl, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`proxy ${res.status}`)
  const text = await res.text()
  if (text.trim().startsWith('{') && text.includes('error')) throw new Error('proxy returned JSON error')
  const xml = new DOMParser().parseFromString(text, 'text/xml')
  const parseError = xml.querySelector('parsererror')
  if (parseError) throw new Error('invalid XML')
  const channelTitle = xml.querySelector('channel > title, feed > title')?.textContent?.trim() || ''
  const items = Array.from(xml.querySelectorAll('item, entry'))
  if (items.length === 0) throw new Error('no items in feed')
  return items.map(item => {
    const linkEl = item.querySelector('link')
    const link = linkEl?.getAttribute('href') || linkEl?.textContent?.trim()
    return {
      title: item.querySelector('title')?.textContent?.trim(),
      link,
      pubDate: item.querySelector('pubDate, published, updated')?.textContent?.trim(),
      description: stripHtml(
        item.querySelector('description')?.textContent ||
        item.querySelector('summary')?.textContent ||
        item.querySelector('content')?.textContent || ''
      ),
      author: item.querySelector('author, creator')?.textContent?.trim() || channelTitle,
      sourceName: channelTitle,
    }
  })
}

export async function fetchFeed(feedUrl) {
  const cached = getCached(feedUrl)
  if (cached) return cached
  // Try methods in order
  const methods = [
    () => fetchViaRss2Json(feedUrl),
    () => fetchXmlAndParse(CORSPROXY(feedUrl)),
    () => fetchXmlAndParse(ALLORIGINS(feedUrl)),
  ]
  for (const method of methods) {
    try {
      const items = await method()
      if (items && items.length > 0) {
        setCached(feedUrl, items)
        return items
      }
    } catch (e) {
      // continue to next method
    }
  }
  console.warn(`[newsApi] all methods failed for`, feedUrl)
  return []
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

// ============ Feed definitions (verified working on rss2json) ============

export const FEEDS = {
  geopolitical: [
    { name: 'Foreign Affairs',  url: 'https://www.foreignaffairs.com/rss.xml' },
    { name: 'FT World',         url: 'https://www.ft.com/world?format=rss' },
    { name: 'Reuters World',    url: 'https://feeds.feedburner.com/reuters/worldNews' },
    { name: 'Economist Intl',   url: 'https://www.economist.com/international/rss.xml' },
    { name: 'War on the Rocks', url: 'https://warontherocks.com/feed/' },
  ],
  macro: [
    { name: 'Apollo (Slok)',     url: 'https://www.apolloacademy.com/feed/' },
    { name: 'FT Markets',        url: 'https://www.ft.com/markets?format=rss' },
    { name: 'Economist Finance', url: 'https://www.economist.com/finance-and-economics/rss.xml' },
    { name: 'Calculated Risk',   url: 'https://www.calculatedriskblog.com/feeds/posts/default' },
    { name: 'Noahpinion',        url: 'https://noahpinion.substack.com/feed' },
  ],
  techAi: [
    { name: 'TechCrunch AI',   url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'The Verge AI',    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml' },
    { name: 'VentureBeat AI',  url: 'https://venturebeat.com/category/ai/feed/' },
    { name: 'Simon Willison',  url: 'https://simonwillison.net/atom/everything/' },
    { name: 'Import AI',       url: 'https://importai.substack.com/feed' },
    { name: 'Latent Space',    url: 'https://www.latent.space/feed' },
  ],
  longform: [
    { name: 'Stratechery',                url: 'https://stratechery.com/feed/' },
    { name: 'One Useful Thing (Mollick)', url: 'https://www.oneusefulthing.org/feed' },
    { name: 'Astral Codex Ten',           url: 'https://www.astralcodexten.com/feed' },
    { name: 'Marginal Revolution',        url: 'https://marginalrevolution.com/feed' },
    { name: 'Noahpinion',                 url: 'https://noahpinion.substack.com/feed' },
    // AI × society / philosophy / growing up in AI — these may or may not work
    // depending on proxy/rate-limit; fallback to the above five works reliably.
    { name: 'The Convivial Society',      url: 'https://theconvivialsociety.substack.com/feed' },
    { name: 'After Babel (Haidt)',        url: 'https://www.afterbabel.com/feed' },
    { name: 'Gary Marcus',                url: 'https://garymarcus.substack.com/feed' },
    { name: 'Zvi Mowshowitz',             url: 'https://thezvi.substack.com/feed' },
  ],
}
