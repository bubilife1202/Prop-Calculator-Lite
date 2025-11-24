import { useState, useEffect } from 'react';
import { Calculator as CalcIcon, TrendingUp, AlertTriangle, Save, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { calculateLotSize, formatCurrency, isHighRisk } from '@/utils/calculator';
import { cn } from '@/lib/utils';
import { fetchExchangeRates } from '@/lib/forex-api';

export function Calculator() {
  const {
    accountBalance,
    riskPercent,
    stopLossPips,
    assetClass,
    manualPipValue,
    commissionPerLot,
    isJPY,
    setAccountBalance,
    setRiskPercent,
    setStopLossPips,
    setAssetClass,
    setManualPipValue,
    setCommissionPerLot,
    setIsJPY,
    currentResult,
    setCurrentResult,
    addToHistory,
  } = useStore();

  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Calculate on mount if we have valid inputs
  useEffect(() => {
    if (accountBalance > 0 && riskPercent > 0 && stopLossPips > 0) {
      handleCalculate();
    }
  }, []);

  const handleFetchRates = async () => {
    setIsLoadingRates(true);
    const rates = await fetchExchangeRates();
    setIsLoadingRates(false);

    // In a real app, we would match the pair.
    // Here we will just simulate a fetch success or let user know.
    // For now, if we had a pair selector, we would pick the right rate.
    // Since we don't, we can just say "Rates Updated" or pre-fill if we had a selection.
    // But wait, the previous code didn't update state!

    // New Logic: If isJPY is true, try to find USDJPY rate.
    if (rates && rates.rates) {
      if (isJPY) {
        // We want Rate = USD/JPY price.
        // Frankfurter gives base USD if we asked ?from=USD.
        // My API wrapper `fetchExchangeRates` does `?from=USD`.
        // So rates.rates['JPY'] is the Price.
        if (rates.rates['JPY']) {
            setExchangeRate(rates.rates['JPY']);
        }
      } else {
         // Default to 1.0 (EURUSD behavior) or do nothing?
         // Maybe set to 1.0 to be safe.
         setExchangeRate(1.0);
      }
    }
  };

  const handleCalculate = () => {
    try {
      const result = calculateLotSize({
        accountBalance,
        riskPercent,
        stopLossPips,
        assetClass,
        exchangeRate: exchangeRate,
        isJPY,
        commissionPerLot,
        manualPipValue
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
        { accountBalance, riskPercent, stopLossPips, assetClass, manualPipValue, commissionPerLot, isJPY, exchangeRate },
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
          <CalcIcon className="w-8 h-8 text-accent-primary" />
          <h1 className="text-3xl font-bold text-text-primary">
            Risk Sniper
          </h1>
        </div>
        <p className="text-text-muted text-sm uppercase tracking-wider font-medium">
          Professional Position Sizing
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-bg-secondary border border-bg-tertiary rounded-sm p-6 space-y-5 shadow-xl">
        {/* Account Balance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary uppercase tracking-wide">
            Account Balance
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">
              $
            </span>
            <input
              type="number"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
              className="w-full bg-bg-primary border border-bg-tertiary rounded-sm pl-10 pr-4 py-3 text-text-primary text-lg focus:outline-none focus:border-accent-primary transition-colors"
              style={{ fontSize: '16px' }}
              placeholder="10000"
            />
          </div>
        </div>

        {/* Risk Percent */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-text-secondary uppercase tracking-wide">
              Risk Per Trade
            </label>
            {highRisk && (
              <span className="flex items-center gap-1 text-xs text-status-error font-bold">
                <AlertTriangle className="w-3 h-3" />
                HIGH EXPOSURE
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
                'w-full bg-bg-primary border rounded-sm px-4 pr-10 py-3 text-text-primary text-lg focus:outline-none transition-all',
                highRisk
                  ? 'border-status-error focus:border-status-error'
                  : 'border-bg-tertiary focus:border-accent-primary'
              )}
              style={{ fontSize: '16px' }}
              placeholder="1.0"
              min="0.1"
              max="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-lg">
              %
            </span>
          </div>
          <div className="flex gap-2">
            {[0.5, 1, 2].map((preset) => (
              <button
                key={preset}
                onClick={() => setRiskPercent(preset)}
                className={cn(
                  'flex-1 py-2 rounded-sm text-xs font-bold transition-colors',
                  riskPercent === preset
                    ? 'bg-accent-primary text-white'
                    : 'bg-bg-tertiary text-text-muted hover:bg-bg-primary hover:text-text-secondary'
                )}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Stop Loss */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary uppercase tracking-wide">
            Stop Loss (Pips)
          </label>
          <input
            type="number"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(Number(e.target.value))}
            className="w-full bg-bg-primary border border-bg-tertiary rounded-sm px-4 py-3 text-text-primary text-lg focus:outline-none focus:border-accent-primary transition-colors"
            style={{ fontSize: '16px' }}
            placeholder="10"
            min="1"
          />
        </div>

        {/* Asset Class */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-secondary uppercase tracking-wide">
            Asset Class
          </label>
          <div className="grid grid-cols-4 gap-1">
            {(['forex', 'gold', 'indices', 'crypto'] as const).map((asset) => (
              <button
                key={asset}
                onClick={() => setAssetClass(asset)}
                className={cn(
                  'py-2 rounded-sm text-xs font-bold uppercase transition-all',
                  assetClass === asset
                    ? 'bg-accent-secondary text-white'
                    : 'bg-bg-tertiary text-text-muted hover:bg-bg-primary hover:text-text-secondary'
                )}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced: Commission, JPY, Rate */}
        <div className="pt-4 border-t border-bg-tertiary space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-muted uppercase">Advanced Settings</label>
            </div>

             <div className="space-y-2">
                 <label className="block text-xs text-text-secondary">
                        Commission per Lot ($)
                </label>
                <input
                    type="number"
                    value={commissionPerLot}
                    onChange={(e) => setCommissionPerLot(Number(e.target.value))}
                    className="w-full bg-bg-primary border border-bg-tertiary rounded-sm px-3 py-2 text-text-primary text-sm focus:border-accent-primary outline-none"
                    placeholder="0.00"
                />
            </div>

            {assetClass === 'forex' && (
                <>
                <div className="flex items-center gap-2 pt-2">
                    <input
                        type="checkbox"
                        id="is-jpy"
                        checked={isJPY}
                        onChange={(e) => {
                            setIsJPY(e.target.checked);
                            // Reset rate if toggling
                            if (e.target.checked) setExchangeRate(150);
                            else setExchangeRate(1);
                        }}
                        className="rounded border-gray-600 bg-bg-primary text-accent-primary focus:ring-accent-primary"
                    />
                    <label htmlFor="is-jpy" className="text-sm text-text-secondary">JPY Pair (USD/JPY, etc.)</label>
                </div>

                <div className="space-y-2">
                    <label className="block text-xs text-text-secondary">
                        {isJPY ? 'Pair Price (e.g., 150.00)' : 'Exchange Rate (Quote/USD)'}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={exchangeRate}
                            onChange={(e) => setExchangeRate(Number(e.target.value))}
                            className="flex-1 bg-bg-primary border border-bg-tertiary rounded-sm px-3 py-2 text-text-primary text-sm focus:border-accent-primary outline-none"
                        />
                        <button
                            onClick={handleFetchRates}
                            disabled={isLoadingRates}
                            className="px-3 bg-bg-tertiary hover:bg-bg-primary text-text-secondary rounded-sm transition-colors"
                            title="Refresh Rates"
                        >
                            <RefreshCw className={cn("w-4 h-4", isLoadingRates && "animate-spin")} />
                        </button>
                    </div>
                    <p className="text-[10px] text-text-muted">
                        {isJPY
                            ? "* Enter the actual price (e.g. 152.50)"
                            : "* 1.0 for EURUSD. For USDCAD (1.35), calculate 1/1.35 or wait for V2."}
                    </p>
                </div>
                </>
            )}

            <div className="space-y-2">
                 <label className="block text-xs text-text-secondary">
                        Manual Pip Value Override ($)
                </label>
                <input
                    type="number"
                    placeholder="Auto"
                    value={manualPipValue || ''}
                    onChange={(e) => setManualPipValue(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-bg-primary border border-bg-tertiary rounded-sm px-3 py-2 text-text-primary text-sm focus:border-accent-primary outline-none placeholder:text-text-muted"
                />
            </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          className="w-full bg-accent-primary hover:bg-blue-600 text-white font-bold py-4 rounded-sm transition-all shadow-lg shadow-blue-900/20 mt-4 uppercase tracking-widest"
        >
          Calculate Risk
        </button>
      </div>

      {/* Results */}
      {showResult && currentResult && (
        <div className="bg-bg-secondary border border-bg-tertiary rounded-sm p-6 space-y-5 animate-slide-up shadow-xl">
          {/* Main Result */}
          <div className="text-center space-y-2 pb-5 border-b border-bg-tertiary">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Recommended Position Size</p>
            <div className={cn('text-5xl font-bold text-text-primary', isAnimating && 'animate-pulse')}>
              {currentResult.lotSize}
            </div>
            <p className="text-sm text-text-secondary font-medium">{currentResult.lotSizeType} Lots</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-primary rounded-sm p-4 border border-bg-tertiary">
              <p className="text-xs text-text-muted uppercase font-bold">Risk Amount</p>
              <p className="text-lg font-bold text-status-error mt-1">
                {formatCurrency(currentResult.moneyAtRisk)}
              </p>
            </div>
            <div className="bg-bg-primary rounded-sm p-4 border border-bg-tertiary">
              <p className="text-xs text-text-muted uppercase font-bold">Pip Value (1 Lot)</p>
              <p className="text-lg font-bold text-accent-primary mt-1">
                ${currentResult.pipValue}
              </p>
            </div>
          </div>

          {/* Drawdown Simulator */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-secondary" />
              <h3 className="text-xs font-bold text-text-secondary uppercase">Drawdown Projection</h3>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">After 1 loss</span>
                <span className="text-sm font-mono text-text-primary">
                  {formatCurrency(currentResult.balanceAfterLoss)}
                </span>
              </div>
              <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-status-warning h-full"
                  style={{
                    width: `${(currentResult.balanceAfterLoss / accountBalance) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-text-muted">After 5 losses</span>
                <span className="text-sm font-mono text-status-error">
                  {formatCurrency(currentResult.balanceAfter5Losses)}
                </span>
              </div>
              <div className="w-full bg-bg-primary rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-status-error h-full"
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
            className="w-full bg-bg-primary hover:bg-bg-tertiary text-text-secondary font-medium py-3 rounded-sm transition-colors flex items-center justify-center gap-2 text-sm border border-bg-tertiary"
          >
            <Save className="w-4 h-4" />
            Save Record
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-status-success text-white px-6 py-3 rounded-sm font-bold shadow-lg animate-fade-in z-50 text-sm uppercase tracking-wide">
          Record Saved
        </div>
      )}
    </div>
  );
}
