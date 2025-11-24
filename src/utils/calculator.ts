// Asset class configurations with pip values and contract sizes
export type AssetClass = 'forex' | 'gold' | 'indices' | 'crypto';

interface AssetConfig {
  pipValue: number; // Base value in Quote Currency (usually 10 for most, 1000 for JPY)
  contractSize: number; // Standard contract size
  lotSizes: {
    standard: number;
    mini: number;
    micro: number;
  };
}

const ASSET_CONFIGS: Record<AssetClass, AssetConfig> = {
  forex: {
    pipValue: 10, // Default for 0.0001 pip pairs (10 units of quote currency)
    contractSize: 100000,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
  gold: {
    pipValue: 10, // Fixed for XAUUSD (usually)
    contractSize: 100,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
  indices: {
    pipValue: 1, // Varies by index
    contractSize: 1,
    lotSizes: {
      standard: 1.0,
      mini: 0.1,
      micro: 0.01,
    },
  },
  crypto: {
    pipValue: 10, // Varies
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
  exchangeRate?: number; // Rate of Quote Currency against USD
  isJPY?: boolean; // New flag for JPY pairs
  commissionPerLot?: number; // Commission per standard lot (round trip)
  manualPipValue?: number;
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
 */
export function calculateLotSize(input: CalculationInput): CalculationResult {
  const { accountBalance, riskPercent, stopLossPips, assetClass, exchangeRate, isJPY, commissionPerLot = 0, manualPipValue } = input;

  // Validation
  if (accountBalance <= 0) throw new Error('Account balance must be greater than 0');
  if (riskPercent <= 0 || riskPercent > 100) throw new Error('Risk percentage must be between 0 and 100');
  if (stopLossPips <= 0) throw new Error('Stop loss must be greater than 0');

  const config = ASSET_CONFIGS[assetClass];
  const moneyAtRisk = (accountBalance * riskPercent) / 100;

  // Determine Pip Value in USD
  let pipValue = config.pipValue;

  if (manualPipValue && manualPipValue > 0) {
    pipValue = manualPipValue;
  } else if (assetClass === 'forex') {
    // Base Calculation:
    // Standard Lot (100k) with 0.0001 pip = 10 Units of Quote Currency.
    // Standard Lot (100k) with 0.01 pip (JPY) = 1000 Units of Quote Currency.

    let quoteUnits = 10;
    if (isJPY) {
      quoteUnits = 1000;
    }

    if (exchangeRate) {
      // If we have an exchange rate (Price), calculate value in USD.
      // Logic:
      // Case 1: USD/JPY (Quote=JPY). Price=150. Value = 1000 JPY. In USD = 1000 / 150 = $6.66.
      // Case 2: EUR/USD (Quote=USD). Price=1.1. Value = 10 USD. In USD = 10 / 1 = $10. (Rate is 1 if Quote is USD)
      // Case 3: USD/CAD (Quote=CAD). Price=1.35. Value = 10 CAD. In USD = 10 / 1.35 = $7.40.

      // We assume `exchangeRate` passed here is the "Pair Price" if Quote != USD.
      // Wait, passing "Pair Price" is ambiguous if we don't know the direction.
      // Let's rely on the calling code to pass the conversion factor "QuoteToUSD".
      // But to simplify for the User Input "Exchange Rate", we usually input the Price (e.g. 150.00).

      // Let's refine the input contract:
      // If isJPY is true, we assume the rate input is e.g. 150.00.
      // Pip Value ($) = 1000 / Rate.

      // If NOT JPY:
      // If Quote is USD (EURUSD), Rate should be 1. Pip Value = 10.
      // If Quote is NOT USD (USDCAD), Rate should be 1.35. Pip Value = 10 / 1.35.

      // So universally: Pip Value ($) = BaseQuoteUnits / Rate.
      // (Provided Rate is USD/Quote or Quote/USD appropriately... actually Rate should be "How many Quote units per 1 USD"?? No.)

      // Convention:
      // Rate = Price of the Pair.
      // If pair ends in USD, Rate is effectively 1 for conversion purposes (value is fixed $10).
      // If pair starts with USD (USDJPY, USDCAD), Rate is the Price. Value = Base / Price.

      // We will implement: Pip Value = quoteUnits / exchangeRate.
      // This works for USD/JPY (1000 / 150 = 6.66).
      // This works for USD/CAD (10 / 1.35 = 7.40).
      // This works for EUR/USD IF we pass exchangeRate = 1.0 (since value is fixed $10).

      pipValue = quoteUnits / exchangeRate;
    }
  }

  // Apply Commission Logic
  // Lot Size = Money at Risk / ( (Stop Loss * Pip Value) + Commission )
  // Example: Risk $100. SL 10 pips. PipVal $10. Comm $7.
  // Loss per lot = (10 * 10) + 7 = $107.
  // Lots = 100 / 107 = 0.93.
  const costPerLot = (stopLossPips * pipValue) + commissionPerLot;
  const lotSize = moneyAtRisk / costPerLot;

  // Determine lot size type
  let lotSizeType: 'Standard' | 'Mini' | 'Micro' = 'Micro';
  if (lotSize >= config.lotSizes.standard) {
    lotSizeType = 'Standard';
  } else if (lotSize >= config.lotSizes.mini) {
    lotSizeType = 'Mini';
  }

  // Calculate drawdown (using effective risk including commission)
  // Actual loss = Lots * CostPerLot = Lots * ((SL*PipVal) + Comm) = MoneyAtRisk (approx)
  // But wait, MoneyAtRisk was the input.
  const actualRiskAmount = lotSize * costPerLot;

  const balanceAfterLoss = accountBalance - actualRiskAmount;
  let currentBalance = accountBalance;
  for (let i = 0; i < 5; i++) {
    // For subsequent losses, risk percent is based on new balance?
    // Usually fixed risk % means risk amount decreases.
    const riskAmount = (currentBalance * riskPercent) / 100;
    // We need to calculate lots for this new risk amount to get exact loss, but simplified:
    currentBalance -= riskAmount;
  }
  const balanceAfter5Losses = currentBalance;

  return {
    lotSize: Number(lotSize.toFixed(2)),
    lotSizeType,
    moneyAtRisk: Number(actualRiskAmount.toFixed(2)),
    balanceAfterLoss: Number(balanceAfterLoss.toFixed(2)),
    balanceAfter5Losses: Number(balanceAfter5Losses.toFixed(2)),
    pipValue: Number(pipValue.toFixed(4)),
    riskRewardRatio: 2.0,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function isHighRisk(riskPercent: number): boolean {
  return riskPercent > 2;
}
