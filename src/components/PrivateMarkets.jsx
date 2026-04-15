import { useState, useMemo } from 'react'
import { Rocket, Handshake, BarChart3, ArrowRight, TrendingUp, Minus, Filter, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { recentFundraises, recentMA, sectorMultiples } from '../data/privateMarkets'

function RoundBadge({ round }) {
  const lc = round.toLowerCase()
  let color = 'bg-bg-secondary text-text-secondary'
  if (lc.includes('seed')) color = 'bg-emerald-500/10 text-emerald-400'
  else if (lc.includes('a')) color = 'bg-green/10 text-green'
  else if (lc.includes('b')) color = 'bg-cyan/10 text-cyan'
  else if (lc.includes('c')) color = 'bg-accent/10 text-accent-light'
  else if (lc.includes('d')) color = 'bg-amber/10 text-amber'
  else if (lc.includes('e')) color = 'bg-orange-500/10 text-orange-400'
  else if (lc.includes('f')) color = 'bg-red/10 text-red'
  else if (lc.includes('g')) color = 'bg-pink-500/10 text-pink-400'
  else if (lc.includes('h') || lc.includes('i')) color = 'bg-purple-500/10 text-purple-400'
  else if (lc.includes('secondary') || lc.includes('tender')) color = 'bg-bg-secondary text-text-secondary'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{round}</span>
}

function StatusBadge({ status }) {
  const colors = {
    'Closed': 'bg-green/10 text-green',
    'Announced': 'bg-amber/10 text-amber',
    'Pending': 'bg-cyan/10 text-cyan',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] || 'bg-bg-secondary text-text-secondary'}`}>
      {status}
    </span>
  )
}

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green" />
  if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red rotate-180" />
  return <Minus className="w-4 h-4 text-text-muted" />
}

function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FundraiseCard({ deal }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-text-primary group-hover:text-accent-light transition-colors truncate">{deal.company}</h4>
          <p className="text-xs text-text-muted mt-0.5">{deal.sector}</p>
        </div>
        <RoundBadge round={deal.round} />
      </div>
      <div className="text-xs text-text-muted mb-3">{formatDate(deal.date)}</div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-text-muted">Raised</div>
          <div className="text-lg font-semibold text-green">{deal.amount}</div>
        </div>
        <div>
          <div className="text-xs text-text-muted">Valuation</div>
          <div className="text-lg font-semibold text-text-primary">{deal.valuation}</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted truncate pr-2">{deal.leadInvestor}</span>
        {deal.evRevenue && (
          <span className="text-amber font-medium whitespace-nowrap">{deal.evRevenue}</span>
        )}
      </div>
      {deal.notes && (
        <p className="text-xs text-text-muted mt-2 pt-2 border-t border-border/50">{deal.notes}</p>
      )}
      {deal.source && (
        <div className="text-[10px] text-text-muted/70 mt-2 flex items-center gap-1">
          <ExternalLink className="w-2.5 h-2.5" />
          {deal.source}
        </div>
      )}
    </div>
  )
}

function MARow({ deal }) {
  return (
    <tr className="border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors">
      <td className="py-3 px-4">
        <div>
          <div className="font-medium text-text-primary text-sm">{deal.target}</div>
          <div className="text-xs text-text-muted">{deal.sector}</div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <ArrowRight className="w-3 h-3 text-accent-light" />
          {deal.acquirer}
        </div>
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-text-primary text-right">{deal.value}</td>
      <td className="py-3 px-4 text-sm text-amber text-right font-medium">{deal.evRevenue}</td>
      <td className="py-3 px-4 text-sm text-text-muted text-right">{deal.evArr}</td>
      <td className="py-3 px-4 text-sm text-text-muted text-right whitespace-nowrap">{formatDate(deal.date)}</td>
      <td className="py-3 px-4"><StatusBadge status={deal.status} /></td>
      <td className="py-3 px-4 text-xs text-text-muted/70">{deal.source || '—'}</td>
    </tr>
  )
}

// Classify whether a deal matches a sector
function matchesSector(dealSector, targetSector) {
  if (!dealSector) return false
  const s = dealSector.toLowerCase()
  const t = targetSector.toLowerCase()

  // exact match first
  if (s === t) return true

  // keyword mapping
  const map = {
    'foundation models / llms': ['foundation', 'llm'],
    'ai infrastructure / compute': ['ai infrastructure', 'compute', 'inference'],
    'enterprise ai / vertical ai': ['enterprise ai', 'vertical', 'legal', 'cpq'],
    'data infrastructure': ['data infrastructure', 'storage'],
    'ai developer tools': ['developer tools'],
    'cybersecurity / ai security': ['security', 'cybersecurity', 'identity', 'iam'],
    'ai observability': ['observability'],
    'conversational ai / agents': ['conversational', 'agents', 'voice'],
    'ai search': ['search'],
    'genai / media': ['media', 'genai'],
  }
  const keywords = map[t] || []
  return keywords.some(k => s.includes(k))
}

function SectorDealsModal({ sector, onClose }) {
  const fundraises = recentFundraises.filter(d => matchesSector(d.sector, sector.sector))
  const ma = recentMA.filter(d => matchesSector(d.sector, sector.sector))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-bg-card rounded-2xl border border-border max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendIcon trend={sector.trend} />
              <h3 className="text-xl font-semibold text-text-primary">{sector.sector}</h3>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <span className="text-xs text-text-muted">Median EV/Revenue</span>
                <div className="text-2xl font-bold text-accent-light">{sector.median}</div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Range</span>
                <div className="text-sm font-medium text-text-primary">{sector.range}</div>
              </div>
              <div>
                <span className="text-xs text-text-muted">Recent Deals</span>
                <div className="text-sm font-medium text-text-primary">{sector.deals}</div>
              </div>
            </div>
            {sector.note && (
              <p className="text-sm text-text-secondary mt-3 italic">{sector.note}</p>
            )}
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-secondary transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Fundraises */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-green" />
              Recent Fundraises ({fundraises.length})
            </h4>
            {fundraises.length === 0 ? (
              <p className="text-sm text-text-muted italic">No fundraises matched in current data.</p>
            ) : (
              <div className="space-y-2">
                {fundraises.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <RoundBadge round={d.round} />
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary text-sm truncate">{d.company}</div>
                        <div className="text-xs text-text-muted">{formatDate(d.date)} · {d.leadInvestor}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-sm font-semibold text-green">{d.amount}</div>
                      <div className="text-xs text-text-muted">@ {d.valuation}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* M&A */}
          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Handshake className="w-4 h-4 text-amber" />
              Recent M&A ({ma.length})
            </h4>
            {ma.length === 0 ? (
              <p className="text-sm text-text-muted italic">No M&A matched in current data.</p>
            ) : (
              <div className="space-y-2">
                {ma.map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusBadge status={d.status} />
                      <div className="min-w-0">
                        <div className="font-medium text-text-primary text-sm">
                          <span className="truncate">{d.target}</span>
                          <span className="text-text-muted mx-1">→</span>
                          <span className="text-text-secondary">{d.acquirer}</span>
                        </div>
                        <div className="text-xs text-text-muted">{formatDate(d.date)} · {d.source || '—'}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <div className="text-sm font-semibold text-text-primary">{d.value}</div>
                      {d.evRevenue && d.evRevenue !== 'N/A' && (
                        <div className="text-xs text-amber">{d.evRevenue}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PrivateMarkets() {
  const [sectorFilter, setSectorFilter] = useState('all')
  const [showAllFundraises, setShowAllFundraises] = useState(false)
  const [showAllMA, setShowAllMA] = useState(false)
  const [selectedSector, setSelectedSector] = useState(null)

  const sectors = useMemo(() => ['all', ...new Set(recentFundraises.map(d => d.sector))], [])
  const filteredDeals = sectorFilter === 'all'
    ? recentFundraises
    : recentFundraises.filter(d => d.sector === sectorFilter)

  // Sort by date desc for fundraises
  const sortedFundraises = [...filteredDeals].sort((a, b) => b.date.localeCompare(a.date))
  const visibleFundraises = showAllFundraises ? sortedFundraises : sortedFundraises.slice(0, 20)

  // Sort M&A by date desc
  const sortedMA = [...recentMA].sort((a, b) => b.date.localeCompare(a.date))
  const visibleMA = showAllMA ? sortedMA : sortedMA.slice(0, 25)

  const multiplesChartData = sectorMultiples.map(s => ({
    name: s.sector.length > 25 ? s.sector.slice(0, 22) + '...' : s.sector,
    fullName: s.sector,
    median: parseFloat(s.median) || 0,
    raw: s,
  })).filter(d => d.median > 0)

  const barColors = ['#6366f1', '#818cf8', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#f97316']

  return (
    <div className="space-y-6 mt-6">
      {/* Sector Valuation Multiples — clickable */}
      <section className="bg-bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-accent-light" />
          <h2 className="text-lg font-semibold text-text-primary">AI & Data Sector Valuation Multiples</h2>
        </div>
        <p className="text-xs text-text-muted mb-4 ml-7">Median EV/Revenue · Private market · Q1 2026 · <span className="text-accent-light">Click any sector to see the deals behind it</span></p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiplesChartData} layout="vertical" margin={{ left: 140, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `${v}x`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={135} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2235', border: '1px solid #2a2f45', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`${value}x`, 'Median EV/Rev']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="median" radius={[0, 6, 6, 0]} barSize={16} cursor="pointer" onClick={(data) => setSelectedSector(data.raw)}>
                  {multiplesChartData.map((entry, index) => (
                    <Cell key={index} fill={barColors[index % barColors.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sectorMultiples.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSector(s)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary hover:border-accent/40 border border-transparent transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2">
                  <TrendIcon trend={s.trend} />
                  <span className="text-sm text-text-primary group-hover:text-accent-light transition-colors">{s.sector}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-accent-light">{s.median}</span>
                  <span className="text-xs text-text-muted w-24 text-right hidden md:block">{s.range}</span>
                  <span className="text-xs text-text-muted w-16 text-right">{s.deals} deals</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fundraises */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green" />
            <h2 className="text-lg font-semibold text-text-primary">AI & Data Fundraises · $1B+ Valuation</h2>
            <span className="text-xs text-text-muted ml-2">Last ~3 months · Showing {visibleFundraises.length} of {sortedFundraises.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={sectorFilter}
              onChange={(e) => { setSectorFilter(e.target.value); setShowAllFundraises(false) }}
              className="text-sm bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-text-secondary focus:outline-none focus:border-accent"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleFundraises.map((deal, i) => (
            <FundraiseCard key={i} deal={deal} />
          ))}
        </div>
        {sortedFundraises.length > 20 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAllFundraises(!showAllFundraises)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary hover:bg-bg-card-hover hover:border-accent/40 transition-all cursor-pointer"
            >
              {showAllFundraises ? (
                <>Show top 20 <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>See all {sortedFundraises.length} deals <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </section>

      {/* M&A */}
      <section>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Handshake className="w-5 h-5 text-amber" />
          <h2 className="text-lg font-semibold text-text-primary">AI-Related Software M&A</h2>
          <span className="text-xs text-text-muted ml-2">Last ~6 months · Showing {visibleMA.length} of {sortedMA.length}</span>
        </div>
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Target</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Acquirer</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Deal Value</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">EV/Rev</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">EV/ARR</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                  <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Source</th>
                </tr>
              </thead>
              <tbody>
                {visibleMA.map((deal, i) => (
                  <MARow key={i} deal={deal} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {sortedMA.length > 25 && (
          <div className="text-center mt-4">
            <button
              onClick={() => setShowAllMA(!showAllMA)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary hover:bg-bg-card-hover hover:border-accent/40 transition-all cursor-pointer"
            >
              {showAllMA ? (
                <>Show top 25 <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>See all {sortedMA.length} deals <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>
        )}
      </section>

      <div className="text-xs text-text-muted text-center py-4 border-t border-border/50">
        Sources: TechCrunch, CNBC, Bloomberg, Crunchbase, The Information, company press releases, and company blogs (Salesforce, Cisco, OpenAI, Microsoft, Atlassian, etc.).
        Deals reflect public reporting as of April 15, 2026. Multiples are estimates based on publicly available information — treat as directional.
      </div>

      {selectedSector && <SectorDealsModal sector={selectedSector} onClose={() => setSelectedSector(null)} />}
    </div>
  )
}
