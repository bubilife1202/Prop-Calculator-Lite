import { describe, it, expect } from 'vitest';
import { calculateLotSize, formatCurrency, formatPercent, isHighRisk } from './calculator';

describe('calculateLotSize', () => {
  it('should calculate correct lot size for EURUSD with 100k account, 1% risk, 10 pip SL', () => {
    const result = calculateLotSize({
      accountBalance: 100000,
      riskPercent: 1,
      stopLossPips: 10,
      assetClass: 'forex',
    });

    // Money at risk: 100,000 * 0.01 = 1,000
    // Lot size: 1,000 / (10 pips * $10 per pip) = 1,000 / 100 = 10 lots
    expect(result.lotSize).toBe(10);
    expect(result.lotSizeType).toBe('Standard');
    expect(result.moneyAtRisk).toBe(1000);
    expect(result.balanceAfterLoss).toBe(99000);
  });

  it('should calculate correct lot size for small account', () => {
    const result = calculateLotSize({
      accountBalance: 1000,
      riskPercent: 2,
      stopLossPips: 20,
      assetClass: 'forex',
    });

    // Money at risk: 1,000 * 0.02 = 20
    // Lot size: 20 / (20 pips * $10 per pip) = 20 / 200 = 0.1 lots
    expect(result.lotSize).toBe(0.1);
    expect(result.lotSizeType).toBe('Mini');
    expect(result.moneyAtRisk).toBe(20);
  });

  it('should calculate correct lot size for Gold', () => {
    const result = calculateLotSize({
      accountBalance: 50000,
      riskPercent: 1.5,
      stopLossPips: 15,
      assetClass: 'gold',
    });

    // Money at risk: 50,000 * 0.015 = 750
    // Lot size: 750 / (15 pips * $10 per pip) = 750 / 150 = 5 lots
    expect(result.lotSize).toBe(5);
    expect(result.lotSizeType).toBe('Standard');
    expect(result.moneyAtRisk).toBe(750);
  });

  it('should throw error for invalid account balance', () => {
    expect(() =>
      calculateLotSize({
        accountBalance: 0,
        riskPercent: 1,
        stopLossPips: 10,
        assetClass: 'forex',
      })
    ).toThrow('Account balance must be greater than 0');
  });

  it('should throw error for invalid risk percent', () => {
    expect(() =>
      calculateLotSize({
        accountBalance: 10000,
        riskPercent: 0,
        stopLossPips: 10,
        assetClass: 'forex',
      })
    ).toThrow('Risk percentage must be between 0 and 100');

    expect(() =>
      calculateLotSize({
        accountBalance: 10000,
        riskPercent: 101,
        stopLossPips: 10,
        assetClass: 'forex',
      })
    ).toThrow('Risk percentage must be between 0 and 100');
  });

  it('should throw error for invalid stop loss', () => {
    expect(() =>
      calculateLotSize({
        accountBalance: 10000,
        riskPercent: 1,
        stopLossPips: 0,
        assetClass: 'forex',
      })
    ).toThrow('Stop loss must be greater than 0');
  });

  it('should calculate correct drawdown after 5 consecutive losses', () => {
    const result = calculateLotSize({
      accountBalance: 10000,
      riskPercent: 2,
      stopLossPips: 10,
      assetClass: 'forex',
    });

    // Each loss is 2% of current balance
    // After 1 loss: 10,000 - 200 = 9,800
    // After 2 losses: 9,800 - 196 = 9,604
    // After 3 losses: 9,604 - 192.08 = 9,411.92
    // After 4 losses: 9,411.92 - 188.24 = 9,223.68
    // After 5 losses: 9,223.68 - 184.47 = 9,039.21

    expect(result.balanceAfter5Losses).toBeCloseTo(9039.21, 1);
  });
});

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatPercent', () => {
  it('should format percentage correctly', () => {
    expect(formatPercent(1.5)).toBe('1.50%');
    expect(formatPercent(10)).toBe('10.00%');
    expect(formatPercent(0.5)).toBe('0.50%');
  });
});

describe('isHighRisk', () => {
  it('should identify high risk correctly', () => {
    expect(isHighRisk(1)).toBe(false);
    expect(isHighRisk(2)).toBe(false);
    expect(isHighRisk(2.01)).toBe(true);
    expect(isHighRisk(3)).toBe(true);
  });
});
