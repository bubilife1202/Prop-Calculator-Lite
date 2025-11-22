import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, TrendingUp, AlertTriangle, Save } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateLotSize, formatCurrency, isHighRisk } from '@/utils/calculator';
import { cn } from '@/lib/utils';

export function Calculator() {
  const {
    accountBalance,
    riskPercent,
    stopLossPips,
    assetClass,
    setAccountBalance,
    setRiskPercent,
    setStopLossPips,
    setAssetClass,
    currentResult,
    setCurrentResult,
    addToHistory,
  } = useStore();

  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Calculate on mount if we have valid inputs
  useEffect(() => {
    if (accountBalance > 0 && riskPercent > 0 && stopLossPips > 0) {
      handleCalculate();
    }
  }, []);

  const handleCalculate = () => {
    try {
      const result = calculateLotSize({
        accountBalance,
        riskPercent,
        stopLossPips,
        assetClass,
      });

      setCurrentResult(result);
      setShowResult(true);
      setIsAnimating(true);

      setTimeout(() => setIsAnimating(false), 800);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  const handleSaveToHistory = () => {
    if (currentResult) {
      addToHistory(
        { accountBalance, riskPercent, stopLossPips, assetClass },
        currentResult
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const highRisk = isHighRisk(riskPercent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <CalcIcon className="w-8 h-8 text-neon-blue" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            Risk Calculator
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Calculate optimal position size for your trades
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-bg-secondary border border-gray-800 rounded-2xl p-6 space-y-5">
        {/* Account Balance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Account Balance
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              $
            </span>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              className="w-full bg-bg-tertiary border border-gray-700 rounded-xl pl-10 pr-4 py-3.5 text-white text-lg focus:outline-none focus:border-neon-blue transition-colors"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
              placeholder="10000"
            />
          </div>
        </div>

        {/* Risk Percent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">
              Risk Per Trade
            </label>
            {highRisk && (
              <span className="flex items-center gap-1 text-xs text-neon-red">
                <AlertTriangle className="w-3 h-3" />
                High Risk
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className={cn(
                'w-full bg-bg-tertiary border rounded-xl px-4 pr-10 py-3.5 text-white text-lg focus:outline-none transition-all',
                highRisk
                  ? 'border-neon-red focus:border-neon-red animate-pulse-red'
                  : 'border-gray-700 focus:border-neon-blue'
              )}
              style={{ fontSize: '16px' }}
              placeholder="1.0"
              min="0.1"
              max="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
              %
            </span>
          </div>
          <div className="flex gap-2">
            {[0.5, 1, 2].map((preset) => (
              <button
                key={preset}
                onClick={() => setRiskPercent(preset)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                  riskPercent === preset
                    ? 'bg-neon-blue text-black'
                    : 'bg-bg-tertiary text-gray-400 hover:bg-gray-800'
                )}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Stop Loss (Pips)
          </label>
          <input
            type="number"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(Number(e.target.value))}
            className="w-full bg-bg-tertiary border border-gray-700 rounded-xl px-4 py-3.5 text-white text-lg focus:outline-none focus:border-neon-blue transition-colors"
            style={{ fontSize: '16px' }}
            placeholder="10"
            min="1"
          />
        </div>

        {/* Asset Class */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Asset Class
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['forex', 'gold', 'indices', 'crypto'] as const).map((asset) => (
              <button
                key={asset}
                onClick={() => setAssetClass(asset)}
                className={cn(
                  'py-3 rounded-xl text-sm font-medium capitalize transition-all',
                  assetClass === asset
                    ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white'
                    : 'bg-bg-tertiary text-gray-400 hover:bg-gray-800'
                )}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full bg-gradient-to-r from-neon-green to-emerald-500 hover:from-neon-green/90 hover:to-emerald-500/90 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-6"
        >
          Calculate Position Size
        </button>
      </div>

      {/* Results */}
      {showResult && currentResult && (
        <div className="bg-bg-secondary border border-gray-800 rounded-2xl p-6 space-y-5 animate-count-up">
          {/* Main Result */}
          <div className="text-center space-y-2 pb-5 border-b border-gray-800">
            <p className="text-sm text-gray-400">Position Size</p>
            <div className={cn('text-5xl font-bold', isAnimating && 'animate-count-up')}>
              <span className="bg-gradient-to-r from-neon-green to-emerald-400 bg-clip-text text-transparent">
                {currentResult.lotSize}
              </span>
            </div>
            <p className="text-sm text-gray-500">{currentResult.lotSizeType} Lots</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-tertiary rounded-xl p-4 space-y-1">
              <p className="text-xs text-gray-400">Money at Risk</p>
              <p className="text-lg font-semibold text-neon-red">
                {formatCurrency(currentResult.moneyAtRisk)}
              </p>
            </div>
            <div className="bg-bg-tertiary rounded-xl p-4 space-y-1">
              <p className="text-xs text-gray-400">Pip Value</p>
              <p className="text-lg font-semibold text-neon-blue">
                ${currentResult.pipValue}
              </p>
            </div>
          </div>

          {/* Drawdown Simulator */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-purple" />
              <h3 className="text-sm font-semibold text-gray-300">Drawdown Simulator</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">After 1 loss:</span>
                <span className="text-sm font-medium text-gray-300">
                  {formatCurrency(currentResult.balanceAfterLoss)}
                </span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-neon-red to-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentResult.balanceAfterLoss / accountBalance) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-400">After 5 losses:</span>
                <span className="text-sm font-medium text-neon-red">
                  {formatCurrency(currentResult.balanceAfter5Losses)}
                </span>
              </div>
              <div className="w-full bg-bg-tertiary rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-neon-red to-red-700 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(currentResult.balanceAfter5Losses / accountBalance) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveToHistory}
            className="w-full bg-bg-tertiary hover:bg-gray-800 text-gray-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save to History
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neon-green text-black px-6 py-3 rounded-xl font-medium shadow-lg animate-count-up z-50">
          ✓ Saved to history
        </div>
      )}
    </div>
  );
}
