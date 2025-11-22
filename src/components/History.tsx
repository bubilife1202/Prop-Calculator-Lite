import { History as HistoryIcon, Trash2, RotateCcw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatCurrency, formatPercent } from '@/utils/calculator';

export function History() {
  const { history, removeFromHistory, clearHistory, restoreFromHistory } = useStore();

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <HistoryIcon className="w-16 h-16 text-gray-700" />
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-400">No History Yet</h3>
          <p className="text-sm text-gray-600">
            Your saved calculations will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-neon-purple" />
          <h2 className="text-2xl font-bold text-white">Trade History</h2>
        </div>
        <button
          onClick={clearHistory}
          className="text-sm text-gray-500 hover:text-neon-red transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-bg-secondary border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-neon-blue/20 text-neon-blue text-xs font-medium rounded capitalize">
                    {item.input.assetClass}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-0.5">
                  <div>Balance: {formatCurrency(item.input.accountBalance)}</div>
                  <div>Risk: {formatPercent(item.input.riskPercent)} | SL: {item.input.stopLossPips} pips</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-neon-green">
                  {item.result.lotSize}
                </div>
                <div className="text-xs text-gray-500">{item.result.lotSizeType}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => restoreFromHistory(item)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-bg-tertiary hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore
              </button>
              <button
                onClick={() => removeFromHistory(item.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-bg-tertiary hover:bg-neon-red/20 text-gray-400 hover:text-neon-red text-sm font-medium rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
