import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight, BarChart2 } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { INDICES, WATCHLIST, getMockIndexData, getMockStockData, sectorPerformance, marketBreadth } from '../data/markets'

function SparklineChart({ data, positive }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={positive ? '#22c55e' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function IndexCard({ index, data }) {
  const isPositive = data.change >= 0
  const changePercent = ((data.change / data.price) * 100).toFixed(2)

  return (
    <div className="bg-bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-muted">{index.shortName}</span>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          isPositive ? 'bg-green/10 text-green' : 'bg-red/10 text-red'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}{changePercent}%
        </span>
      </div>
      <div className="text-2xl font-semibold text-text-primary mb-1">
        {index.shortName === 'VIX' ? data.price.toFixed(2) : data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </div>
      <div className={`text-sm mb-3 ${isPositive ? 'text-green' : 'text-red'}`}>
        {isPositive ? '+' : ''}{data.change.toFixed(2)}
      </div>
      <SparklineChart data={data.sparkline} positive={isPositive} />
    </div>
  )
}

function StockRow({ stock, data }) {
  const isPositive = data.change >= 0
  const changePercent = ((data.change / data.price) * 100).toFixed(2)

  return (
    <tr className="border-b border-border/50 hover:bg-bg-card-hover/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent-light">
            {stock.symbol.slice(0, 2)}
          </div>
          <div>
            <div className="font-medium text-text-primary text-sm">{stock.symbol}</div>
            <div className="text-xs text-text-muted">{stock.name}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-text-secondary">{stock.sector}</td>
      <td className="py-3 px-4 text-sm font-medium text-text-primary text-right">
        ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </td>
      <td className={`py-3 px-4 text-sm font-medium text-right ${isPositive ? 'text-green' : 'text-red'}`}>
        <div className="flex items-center justify-end gap-1">
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isPositive ? '+' : ''}{changePercent}%
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-text-secondary text-right">{data.marketCap}</td>
      <td className="py-3 px-4 text-sm text-text-muted text-right">{data.pe ? data.pe.toFixed(1) : '—'}</td>
      <td className="py-3 px-4 text-sm text-text-muted text-right">{data.volume}</td>
      <td className="py-3 px-4 w-24">
        <SparklineChart data={data.sparkline} positive={isPositive} />
      </td>
    </tr>
  )
}

export default function PublicMarkets() {
  const [indexData, setIndexData] = useState(getMockIndexData())
  const [stockData, setStockData] = useState(getMockStockData())

  // Simulate live updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndexData(getMockIndexData())
      setStockData(getMockStockData())
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const advancerPct = Math.round((marketBreadth.advancers / (marketBreadth.advancers + marketBreadth.decliners)) * 100)

  return (
    <div className="space-y-6 mt-6">
      {/* Market Indices */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-accent-light" />
          <h2 className="text-lg font-semibold text-text-primary">Market Indices</h2>
          <span className="text-xs text-text-muted ml-2 bg-bg-secondary px-2 py-0.5 rounded-full">Live (mock)</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {INDICES.map(index => (
            <IndexCard key={index.symbol} index={index} data={indexData[index.symbol]} />
          ))}
        </div>
      </section>

      {/* Market Breadth + Sector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Performance */}
        <section className="bg-bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-cyan" />
            <h3 className="text-base font-semibold text-text-primary">S&P 500 Sector Performance</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorPerformance} layout="vertical" margin={{ left: 100, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={95} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e2235', border: '1px solid #2a2f45', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value) => [`${value > 0 ? '+' : ''}${value}%`, 'Change']}
                />
                <Bar dataKey="change" radius={[0, 4, 4, 0]} barSize={14}>
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={index} fill={entry.change >= 0 ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Market Breadth */}
        <section className="bg-bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green" />
            <h3 className="text-base font-semibold text-text-primary">Market Breadth</h3>
          </div>
          <div className="space-y-5">
            {/* Advance/Decline bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green font-medium">Advancers: {marketBreadth.advancers}</span>
                <span className="text-red font-medium">Decliners: {marketBreadth.decliners}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-bg-secondary">
                <div className="bg-green/80 rounded-l-full" style={{ width: `${advancerPct}%` }} />
                <div className="bg-red/80 rounded-r-full" style={{ width: `${100 - advancerPct}%` }} />
              </div>
              <div className="text-center text-xs text-text-muted mt-1">{advancerPct}% advancing</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg-secondary rounded-lg p-3">
                <div className="text-xs text-text-muted mb-1">New 52W Highs</div>
                <div className="text-xl font-semibold text-green">{marketBreadth.newHighs}</div>
              </div>
              <div className="bg-bg-secondary rounded-lg p-3">
                <div className="text-xs text-text-muted mb-1">New 52W Lows</div>
                <div className="text-xl font-semibold text-red">{marketBreadth.newLows}</div>
              </div>
              <div className="bg-bg-secondary rounded-lg p-3 col-span-2">
                <div className="text-xs text-text-muted mb-1">Stocks Above 200-Day MA</div>
                <div className="flex items-center gap-3">
                  <div className="text-xl font-semibold text-accent-light">{marketBreadth.aboveMA200}%</div>
                  <div className="flex-1 h-2 bg-bg-primary rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${marketBreadth.aboveMA200}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Watchlist */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-accent-light" />
          <h2 className="text-lg font-semibold text-text-primary">Watchlist</h2>
          <span className="text-xs text-text-muted ml-2">{WATCHLIST.length} stocks</span>
        </div>
        <div className="bg-bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/50">
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Company</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Sector</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Change</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Mkt Cap</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">P/E</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider">Volume</th>
                  <th className="py-3 px-4 text-xs font-medium text-text-muted uppercase tracking-wider w-24">Trend</th>
                </tr>
              </thead>
              <tbody>
                {WATCHLIST.map(stock => (
                  <StockRow key={stock.symbol} stock={stock} data={stockData[stock.symbol]} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
