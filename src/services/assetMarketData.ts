/**
 * Asset Market Data Service
 * Connects to the Asset Dashboard Cloudflare Worker for prices and exchange rates.
 */

const priceCache: Record<string, { price: number, timestamp: number }> = {};
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const WORKER_URL = 'https://asset-dashboard.poisonapple1203.workers.dev';

export const fetchMarketPrices = async (tickers: string[]): Promise<Record<string, number>> => {
  if (!tickers.length) return {};
  
  const results: Record<string, number> = {};
  const now = Date.now();
  
  const missingTickers = tickers.filter(t => {
    const cached = priceCache[t];
    if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      results[t] = cached.price;
      return false;
    }
    return true;
  });

  if (missingTickers.length === 0) return results;

  try {
    const res = await fetch(`${WORKER_URL}/api/prices?tickers=${missingTickers.join(',')}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[AssetMarketData] Worker Error:", errorText);
      throw new Error("Worker price API failed");
    }
    
    const workerResults = await res.json() as Record<string, number>;
    
    Object.entries(workerResults).forEach(([ticker, price]) => {
      results[ticker] = price;
      priceCache[ticker] = { price, timestamp: now };
    });
  } catch (err) {
    console.error("[AssetMarketData] Error fetching from Worker:", err);
  }

  return results;
};

export const getTickerInfo = async (ticker: string): Promise<{ name: string, price: number } | null> => {
  if (!ticker) return null;
  try {
    const res = await fetch(`${WORKER_URL}/api/ticker-info?ticker=${ticker.trim().toUpperCase()}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.warn("[AssetMarketData] Worker returned error for ticker:", ticker, errorData);
      return null;
    }
    const data = await res.json();
    return data.name ? data : null;
  } catch (err) {
    console.error("[AssetMarketData] Error fetching ticker info:", err);
    return null;
  }
};

let exchangeRateCache: { rate: number, timestamp: number } | null = null;

export const fetchExchangeRate = async (): Promise<number> => {
  const now = Date.now();
  if (exchangeRateCache && (now - exchangeRateCache.timestamp < CACHE_DURATION)) {
    return exchangeRateCache.rate;
  }

  try {
    const res = await fetch(`${WORKER_URL}/api/exchange-rate`);
    if (!res.ok) throw new Error("Failed to fetch exchange rate");
    const data = await res.json();
    const rate = data.rate || 1400.0;
    exchangeRateCache = { rate, timestamp: now };
    return rate;
  } catch (err) {
    console.error("[AssetMarketData] Error fetching exchange rate:", err);
    return 1400.0; // Fallback
  }
};

export const normalizeTicker = (ticker: string): string => ticker.trim().toUpperCase();
