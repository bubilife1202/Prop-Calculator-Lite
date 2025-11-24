
export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

const API_URL = 'https://api.frankfurter.app/latest?from=USD';
const CACHE_KEY = 'forex_rates_cache';
const CACHE_DURATION = 3600 * 1000; // 1 hour

interface CachedData {
  timestamp: number;
  data: ExchangeRates;
}

export async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as CachedData;
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    // Fetch new data
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data: ExchangeRates = await response.json();

    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data
    }));

    return data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

// Helper to get price for a specific pair (simple approximation)
// Returns the rate of Quote Currency against USD.
// If we trade USD/JPY, we need JPY/USD rate (which is 1 / USD/JPY).
// But Frankfurter gives us USD based rates.
// rates['JPY'] = 150 means 1 USD = 150 JPY.
export function getQuoteCurrencyToUSDRate(quoteCurrency: string, rates: Record<string, number>): number {
  if (quoteCurrency === 'USD') return 1;

  const rateAgainstUSD = rates[quoteCurrency]; // e.g., JPY = 150
  if (!rateAgainstUSD) return 1; // Fallback

  // If 1 USD = 150 JPY, then 1 JPY = 1/150 USD.
  return 1 / rateAgainstUSD;
}
