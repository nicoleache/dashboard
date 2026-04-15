import { useEffect, useState } from 'react'
import { Globe2, LineChart, Cpu, BookOpen, ExternalLink, RefreshCw, Clock } from 'lucide-react'
import { fetchSection, FEEDS } from '../lib/newsApi'

const SECTIONS = [
  {
    key: 'geopolitical',
    title: 'Geopolitical',
    icon: Globe2,
    color: 'text-red',
    iconBg: 'bg-red/10',
    feeds: FEEDS.geopolitical,
    limit: 12,
  },
  {
    key: 'macro',
    title: 'Macro & Markets',
    icon: LineChart,
    color: 'text-amber',
    iconBg: 'bg-amber/10',
    feeds: FEEDS.macro,
    limit: 12,
  },
  {
    key: 'techAi',
    title: 'Tech & AI',
    icon: Cpu,
    color: 'text-accent-light',
    iconBg: 'bg-accent/10',
    feeds: FEEDS.techAi,
    limit: 14,
  },
  {
    key: 'longform',
    title: 'Long-form · AI + society, philosophy, education',
    icon: BookOpen,
    color: 'text-cyan',
    iconBg: 'bg-cyan/10',
    feeds: FEEDS.longform,
    limit: 10,
  },
]

function timeAgo(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d)) return ''
  const mins = Math.floor((Date.now() - d.getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ArticleRow({ item, variant = 'compact' }) {
  if (variant === 'feature') {
    return (
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary border border-transparent hover:border-accent/30 transition-all group"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-text-primary group-hover:text-accent-light leading-snug mb-2">
              {item.title}
            </h4>
            {item.description && (
              <p className="text-xs text-text-secondary line-clamp-3 mb-2">{item.description}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
              <span className="font-medium text-accent-light/80">{item.sourceName || item.sourceKey}</span>
              {item.pubDate && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.pubDate)}</span>
                </>
              )}
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-light flex-shrink-0 mt-1" />
        </div>
      </a>
    )
  }
  // compact
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2.5 px-3 rounded-lg hover:bg-bg-secondary/70 border border-transparent hover:border-border transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm text-text-primary group-hover:text-accent-light leading-snug">
            {item.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
            <span className="text-accent-light/70">{item.sourceName || item.sourceKey}</span>
            {item.pubDate && (
              <>
                <span>·</span>
                <span>{timeAgo(item.pubDate)}</span>
              </>
            )}
          </div>
        </div>
        <ExternalLink className="w-3 h-3 text-text-muted/40 group-hover:text-accent-light flex-shrink-0 mt-1" />
      </div>
    </a>
  )
}

function SectionCard({ section, items, loading }) {
  const Icon = section.icon
  const [feature, ...rest] = items
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-lg ${section.iconBg} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${section.color}`} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">{section.title}</h3>
            <p className="text-xs text-text-muted">{section.feeds.length} sources · {items.length} stories</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-sm text-text-muted">
          <p>No stories loaded.</p>
          <p className="text-xs mt-1">Feeds may be blocked by CORS or the proxy is rate-limited.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {feature && <ArticleRow item={feature} variant="feature" />}
          <div className="mt-2 space-y-0.5">
            {rest.slice(0, section.limit - 1).map((item, i) => (
              <ArticleRow key={item.link || i} item={item} variant="compact" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function News() {
  const [data, setData] = useState({ geopolitical: [], macro: [], techAi: [], longform: [] })
  const [loading, setLoading] = useState({ geopolitical: true, macro: true, techAi: true, longform: true })
  const [refreshedAt, setRefreshedAt] = useState(null)

  const loadAll = async (force = false) => {
    if (force) {
      // clear cache
      Object.keys(localStorage).filter(k => k.startsWith('rss_')).forEach(k => localStorage.removeItem(k))
    }
    setLoading({ geopolitical: true, macro: true, techAi: true, longform: true })
    await Promise.all(
      SECTIONS.map(async (s) => {
        const items = await fetchSection(s.feeds, s.limit)
        setData(prev => ({ ...prev, [s.key]: items }))
        setLoading(prev => ({ ...prev, [s.key]: false }))
      })
    )
    setRefreshedAt(new Date())
  }

  useEffect(() => {
    loadAll()
  }, [])

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Daily Briefing</h2>
          <p className="text-xs text-text-muted mt-1">
            {refreshedAt ? `Updated ${refreshedAt.toLocaleTimeString()}` : 'Loading feeds...'}
            {' · Cached 15 min · Click any story to open the source'}
          </p>
        </div>
        <button
          onClick={() => loadAll(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary hover:bg-bg-card-hover hover:border-accent/40 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECTIONS.map(section => (
          <SectionCard
            key={section.key}
            section={section}
            items={data[section.key]}
            loading={loading[section.key]}
          />
        ))}
      </div>

      <div className="text-xs text-text-muted text-center py-4 border-t border-border/50">
        Feeds fetched client-side via rss2json.com and api.allorigins.win (no API key required).
        Long-form section curates thought-pieces on AI × society, philosophy, education, and policy.
        <br />
        <span className="text-text-muted/70">
          Want to add a source? Edit <code className="bg-bg-secondary px-1 rounded">src/lib/newsApi.js</code> (or just tell me).
        </span>
      </div>
    </div>
  )
}
