import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AssetClass, CalculationInput, CalculationResult } from '@/utils/calculator';

export interface TradeHistory {
  id: string;
  timestamp: number;
  input: CalculationInput;
  result: CalculationResult;
}

interface StoreState {
  // Calculator inputs (persisted)
  accountBalance: number;
  riskPercent: number;
  stopLossPips: number;
  assetClass: AssetClass;

  // Trade history (persisted)
  history: TradeHistory[];

  // Current calculation result (not persisted)
  currentResult: CalculationResult | null;

  // Actions
  setAccountBalance: (balance: number) => void;
  setRiskPercent: (percent: number) => void;
  setStopLossPips: (pips: number) => void;
  setAssetClass: (asset: AssetClass) => void;
  setCurrentResult: (result: CalculationResult | null) => void;
  addToHistory: (input: CalculationInput, result: CalculationResult) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
  restoreFromHistory: (item: TradeHistory) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Default values
      accountBalance: 10000,
      riskPercent: 1,
      stopLossPips: 10,
      assetClass: 'forex',
      history: [],
      currentResult: null,

      // Actions
      setAccountBalance: (balance) => set({ accountBalance: balance }),
      setRiskPercent: (percent) => set({ riskPercent: percent }),
      setStopLossPips: (pips) => set({ stopLossPips: pips }),
      setAssetClass: (asset) => set({ assetClass: asset }),
      setCurrentResult: (result) => set({ currentResult: result }),

      addToHistory: (input, result) =>
        set((state) => ({
          history: [
            {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              input,
              result,
            },
            ...state.history.slice(0, 9), // Keep only last 10
          ],
        })),

      removeFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        })),

      clearHistory: () => set({ history: [] }),

      restoreFromHistory: (item) =>
        set({
          accountBalance: item.input.accountBalance,
          riskPercent: item.input.riskPercent,
          stopLossPips: item.input.stopLossPips,
          assetClass: item.input.assetClass,
          currentResult: item.result,
        }),
    }),
    {
      name: 'risk-sniper-storage',
      // Only persist these fields
      partialize: (state) => ({
        accountBalance: state.accountBalance,
        riskPercent: state.riskPercent,
        stopLossPips: state.stopLossPips,
        assetClass: state.assetClass,
        history: state.history,
      }),
    }
  )
);
