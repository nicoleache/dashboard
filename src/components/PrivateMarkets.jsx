import { useState } from 'react'
import { Rocket, Handshake, BarChart3, ArrowUpRight, ArrowRight, TrendingUp, Minus, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { recentFundraises, recentMA, sectorMultiples } from '../data/privateMarkets'

function RoundBadge({ round }) {
  const colors = {
    'Series A': 'bg-green/10 text-green',
    'Series B': 'bg-cyan/10 text-cyan',
    'Series C': 'bg-accent/10 text-accent-light',
    'Series D': 'bg-amber/10 text-amber',
    'Series E': 'bg-red/10 text-red',
    'Series F': 'bg-purple-500/10 text-purple-400',
    'Series J': 'bg-pink-500/10 text-pink-400',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[round] || 'bg-bg-secondary text-text-secondary'}`}>
      {round}
    </span>
  )
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

function FundraiseCard({ deal }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-text-primary group-hover:text-accent-light transition-colors">{deal.company}</h4>
          <p className="text-xs text-text-muted mt-0.5">{deal.sector}</p>
        </div>
        <RoundBadge round={deal.round} />
      </div>
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
        <span className="text-text-muted">{deal.leadInvestor}</span>
        {deal.evRevenue && (
          <span className="text-amber font-medium">EV/Rev: {deal.evRevenue}</span>
        )}
      </div>
      {deal.notes && (
        <p className="text-xs text-text-muted mt-2 pt-2 border-t border-border/50">{deal.notes}</p>
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
      <td className="py-3 px-4 text-sm text-text-muted text-right">{deal.date}</td>
      <td className="py-3 px-4"><StatusBadge status={deal.status} /></td>
    </tr>
  )
}

export default function PrivateMarkets() {
  const [sectorFilter, setSectorFilter] = useState('all')

  const sectors = ['all', ...new Set(recentFundraises.map(d => d.sector))]
  const filteredDeals = sectorFilter === 'all'
    ? recentFundraises
    : recentFundraises.filter(d => d.sector === sectorFilter)

  const multiplesChartData = sectorMultiples.map(s => ({
    name: s.sector.length > 25 ? s.sector.slice(0, 22) + '...' : s.sector,
    fullName: s.sector,
    median: parseFloat(s.median) || 0,
    trend: s.trend,
  })).filter(d => d.median > 0)

  const barColors = ['#6366f1', '#818cf8', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7', '#ec4899']

  return (
    <div className="space-y-6 mt-6">
      {/* Sector Valuation Multiples */}
      <section className="bg-bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-accent-light" />
          <h2 className="text-lg font-semibold text-text-primary">AI & Data Sector Valuation Multiples</h2>
          <span className="text-xs text-text-muted ml-2">(Median EV/Revenue — Private, Q1 2025)</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiplesChartData} layout="vertical" margin={{ left: 140, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `${v}x`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={135} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2235', border: '1px solid #2a2f45', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`${value}x`, 'Median EV/Revenue']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="median" radius={[0, 6, 6, 0]} barSize={16}>
                  {multiplesChartData.map((entry, index) => (
                    <Cell key={index} fill={barColors[index % barColors.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {sectorMultiples.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-secondary/50 hover:bg-bg-secondary transition-colors">
                <div className="flex items-center gap-2">
                  <TrendIcon trend={s.trend} />
                  <span className="text-sm text-text-primary">{s.sector}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-accent-light">{s.median}</span>
                  <span className="text-xs text-text-muted w-24 text-right">{s.range}</span>
                  <span className="text-xs text-text-muted w-16 text-right">{s.deals} deals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Fundraises */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-green" />
            <h2 className="text-lg font-semibold text-text-primary">Recent AI & Data Fundraises</h2>
            <span className="text-xs text-text-muted ml-2">Series A-F+</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="text-sm bg-bg-secondary border border-border rounded-lg px-3 py-1.5 text-text-secondary focus:outline-none focus:border-accent"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s === 'all' ? 'All Sectors' : s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal, i) => (
            <FundraiseCard key={i} deal={deal} />
          ))}
        </div>
      </section>

      {/* M&A Activity */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Handshake className="w-5 h-5 text-amber" />
          <h2 className="text-lg font-semibold text-text-primary">Recent M&A Activity</h2>
          <span className="text-xs text-text-muted ml-2">AI, Data & Cloud Infrastructure</span>
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
                </tr>
              </thead>
              <tbody>
                {recentMA.map((deal, i) => (
                  <MARow key={i} deal={deal} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Data Sources Note */}
      <div className="text-xs text-text-muted text-center py-4 border-t border-border/50">
        Data sourced from Crunchbase, PitchBook, TechCrunch, The Information, and public filings.
        Multiples are estimates based on publicly available information. Last updated: April 2026.
      </div>
    </div>
  )
}
