import { BarChart3, TrendingUp, Building2 } from 'lucide-react'

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-border sticky top-0 z-50 bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-text-primary">Markets Dashboard</span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'public'
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Public Markets
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'private'
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Private Markets
            </button>
          </nav>

          {/* Date */}
          <div className="text-sm text-text-muted">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  )
}
