import { useState } from 'react';
import { Calculator as CalcIcon, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';
import { Calculator } from '@/components/Calculator';
import { History } from '@/components/History';
import { Settings } from '@/components/Settings';
import { cn } from '@/lib/utils';

type Tab = 'calculator' | 'history' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  const tabs = [
    { id: 'calculator' as const, label: 'Calculator', icon: CalcIcon },
    { id: 'history' as const, label: 'History', icon: HistoryIcon },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-white pb-20">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Bottom Navigation Bar (Mobile-First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-gray-800 backdrop-blur-lg bg-opacity-95 z-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex flex-col items-center justify-center py-3 px-4 transition-all',
                    isActive
                      ? 'text-neon-blue'
                      : 'text-gray-500 hover:text-gray-400'
                  )}
                  style={{ minHeight: '64px' }} // Ensure 44px+ touch target
                >
                  <Icon className={cn('w-6 h-6 mb-1', isActive && 'animate-pulse')} />
                  <span className={cn('text-xs font-medium', isActive && 'font-bold')}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-neon-blue rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
