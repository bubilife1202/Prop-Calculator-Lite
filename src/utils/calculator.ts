// Asset class configurations with pip values and contract sizes
export type AssetClass = 'forex' | 'gold' | 'indices' | 'crypto';

interface AssetConfig {
  pipValue: number; // Value of 1 pip for 1 standard lot
  contractSize: number; // Standard contract size
  lotSizes: {
    standard: number;
    mini: number;
    micro: number;
  };
}

const ASSET_CONFIGS: Record<AssetClass, AssetConfig> = {
  forex: {
    pipValue: 10, // $10 per pip for 1 standard lot (most pairs)
    contractSize: 100000,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
  gold: {
    pipValue: 10, // $10 per pip for 1 standard lot (XAUUSD)
    contractSize: 100,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
  indices: {
    pipValue: 1, // Varies by index, using average
    contractSize: 1,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
  crypto: {
    pipValue: 10, // $10 per pip for 1 standard lot
    contractSize: 1,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
};

export interface CalculationInput {
  accountBalance: number;
  riskPercent: number;
  stopLossPips: number;
  assetClass: AssetClass;
}

export interface CalculationResult {
  lotSize: number;
  lotSizeType: 'Standard' | 'Mini' | 'Micro';
  moneyAtRisk: number;
  balanceAfterLoss: number;
  balanceAfter5Losses: number;
  pipValue: number;
  riskRewardRatio: number;
}

/**
 * Calculate position size based on risk parameters
 * Formula: Lot Size = (Account Balance × Risk %) / (Stop Loss in Pips × Pip Value)
 */
export function calculateLotSize(input: CalculationInput): CalculationResult {
  const { accountBalance, riskPercent, stopLossPips, assetClass } = input;

  // Validation
  if (accountBalance <= 0) {
    throw new Error('Account balance must be greater than 0');
  }
  if (riskPercent <= 0 || riskPercent > 100) {
    throw new Error('Risk percentage must be between 0 and 100');
  }
  if (stopLossPips <= 0) {
    throw new Error('Stop loss must be greater than 0');
  }

  const config = ASSET_CONFIGS[assetClass];
  const moneyAtRisk = (accountBalance * riskPercent) / 100;

  // Calculate lot size
  // Lot Size = Money at Risk / (Stop Loss Pips × Pip Value per Lot)
  const lotSize = moneyAtRisk / (stopLossPips * config.pipValue);

  // Determine lot size type
  let lotSizeType: 'Standard' | 'Mini' | 'Micro' = 'Micro';
  if (lotSize >= config.lotSizes.standard) {
    lotSizeType = 'Standard';
  } else if (lotSize >= config.lotSizes.mini) {
    lotSizeType = 'Mini';
  }

  // Calculate drawdown simulation
  const balanceAfterLoss = accountBalance - moneyAtRisk;
  let currentBalance = accountBalance;
  for (let i = 0; i < 5; i++) {
    const riskAmount = (currentBalance * riskPercent) / 100;
    currentBalance -= riskAmount;
  }
  const balanceAfter5Losses = currentBalance;

  // Risk reward ratio (assuming 2:1 by default)
  const riskRewardRatio = 2.0;

  return {
    lotSize: Number(lotSize.toFixed(2)),
    lotSizeType,
    moneyAtRisk: Number(moneyAtRisk.toFixed(2)),
    balanceAfterLoss: Number(balanceAfterLoss.toFixed(2)),
    balanceAfter5Losses: Number(balanceAfter5Losses.toFixed(2)),
    pipValue: config.pipValue,
    riskRewardRatio,
  };
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage values
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Check if risk is above recommended threshold (2%)
 */
export function isHighRisk(riskPercent: number): boolean {
  return riskPercent > 2;
}
