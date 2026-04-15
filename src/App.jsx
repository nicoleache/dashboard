import { useState } from 'react'
import Header from './components/Header'
import PublicMarkets from './components/PublicMarkets'
import PrivateMarkets from './components/PrivateMarkets'

function App() {
  const [activeTab, setActiveTab] = useState('public')

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'public' ? <PublicMarkets /> : <PrivateMarkets />}
      </main>
    </div>
  )
}

export default App
