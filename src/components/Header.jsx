import { BarChart3, TrendingUp, Building2, Newspaper } from 'lucide-react'

const TABS = [
  { key: 'public',  label: 'Public Markets',  icon: TrendingUp },
  { key: 'private', label: 'Private Markets', icon: Building2 },
  { key: 'news',    label: 'News',            icon: Newspaper },
]

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="border-b border-border sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-text-primary hidden sm:inline">Markets Dashboard</span>
          </div>

          <nav className="flex items-center gap-1 bg-bg-secondary rounded-lg p-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === key
                    ? 'bg-accent text-white shadow-lg shadow-accent/25'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>

          <div className="text-sm text-text-muted hidden lg:block flex-shrink-0">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  )
}
