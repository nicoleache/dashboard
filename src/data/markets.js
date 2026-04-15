// Stock tickers to track
export const INDICES = [
  { symbol: "^GSPC", name: "S&P 500", shortName: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ Composite", shortName: "NASDAQ" },
  { symbol: "^DJI", name: "Dow Jones", shortName: "DOW" },
  { symbol: "^RUT", name: "Russell 2000", shortName: "Russell 2000" },
  { symbol: "^VIX", name: "CBOE Volatility", shortName: "VIX" },
];

export const WATCHLIST = [
  { symbol: "NVDA", name: "NVIDIA", sector: "Semiconductors" },
  { symbol: "GOOGL", name: "Alphabet (Google)", sector: "Tech / AI" },
  { symbol: "NOW", name: "ServiceNow", sector: "Enterprise Software" },
  { symbol: "CRM", name: "Salesforce", sector: "Enterprise Software" },
  { symbol: "MSFT", name: "Microsoft", sector: "Tech / AI" },
  { symbol: "AAPL", name: "Apple", sector: "Tech / Consumer" },
  { symbol: "AMZN", name: "Amazon", sector: "Tech / Cloud" },
  { symbol: "META", name: "Meta Platforms", sector: "Tech / AI" },
  { symbol: "SNOW", name: "Snowflake", sector: "Data Infrastructure" },
  { symbol: "PLTR", name: "Palantir", sector: "AI / Data Analytics" },
  { symbol: "MDB", name: "MongoDB", sector: "Data Infrastructure" },
  { symbol: "DDOG", name: "Datadog", sector: "Observability" },
  { symbol: "CRWD", name: "CrowdStrike", sector: "Cybersecurity" },
  { symbol: "AI", name: "C3.ai", sector: "Enterprise AI" },
  { symbol: "PATH", name: "UiPath", sector: "AI / Automation" },
];

// Generate realistic mock data for demo purposes
// In production, these would come from Yahoo Finance, Alpha Vantage, or similar APIs
function generateSparkline(base, volatility, points = 20, trend = 0) {
  const data = [];
  let current = base;
  for (let i = 0; i < points; i++) {
    current += (Math.random() - 0.48 + trend * 0.01) * volatility;
    data.push({ value: Math.round(current * 100) / 100 });
  }
  return data;
}

function randomChange(min, max) {
  return (Math.random() * (max - min) + min);
}

export function getMockIndexData() {
  const indexData = {
    "^GSPC": { price: 5282.70, change: randomChange(-30, 60), sparkline: generateSparkline(5200, 30, 20, 0.5) },
    "^IXIC": { price: 16384.47, change: randomChange(-100, 200), sparkline: generateSparkline(16100, 100, 20, 0.6) },
    "^DJI": { price: 39872.99, change: randomChange(-100, 200), sparkline: generateSparkline(39500, 150, 20, 0.3) },
    "^RUT": { price: 2003.17, change: randomChange(-15, 30), sparkline: generateSparkline(1970, 15, 20, 0.4) },
    "^VIX": { price: 18.42, change: randomChange(-3, 3), sparkline: generateSparkline(19, 1.5, 20, -0.2) },
  };
  return indexData;
}

export function getMockStockData() {
  const stockData = {
    NVDA: { price: 877.35, change: randomChange(-15, 25), marketCap: "2.16T", pe: 64.2, volume: "42.1M" },
    GOOGL: { price: 163.48, change: randomChange(-5, 8), marketCap: "2.01T", pe: 25.8, volume: "28.3M" },
    NOW: { price: 892.15, change: randomChange(-10, 15), marketCap: "184.2B", pe: 58.3, volume: "1.8M" },
    CRM: { price: 272.90, change: randomChange(-5, 8), marketCap: "263.1B", pe: 45.7, volume: "6.2M" },
    MSFT: { price: 425.22, change: randomChange(-5, 10), marketCap: "3.16T", pe: 35.1, volume: "22.7M" },
    AAPL: { price: 198.11, change: randomChange(-3, 5), marketCap: "3.04T", pe: 30.4, volume: "55.3M" },
    AMZN: { price: 186.49, change: randomChange(-4, 7), marketCap: "1.94T", pe: 42.6, volume: "38.9M" },
    META: { price: 502.30, change: randomChange(-8, 12), marketCap: "1.27T", pe: 28.9, volume: "18.4M" },
    SNOW: { price: 162.78, change: randomChange(-5, 8), marketCap: "52.8B", pe: null, volume: "4.2M" },
    PLTR: { price: 24.56, change: randomChange(-1, 2), marketCap: "54.1B", pe: 215.0, volume: "45.6M" },
    MDB: { price: 268.43, change: randomChange(-8, 12), marketCap: "19.2B", pe: null, volume: "2.1M" },
    DDOG: { price: 122.67, change: randomChange(-4, 6), marketCap: "39.8B", pe: 285.0, volume: "5.3M" },
    CRWD: { price: 312.45, change: randomChange(-6, 10), marketCap: "74.9B", pe: 92.1, volume: "3.8M" },
    AI: { price: 28.34, change: randomChange(-2, 3), marketCap: "3.6B", pe: null, volume: "8.9M" },
    PATH: { price: 14.22, change: randomChange(-1, 1.5), marketCap: "8.1B", pe: null, volume: "7.2M" },
  };

  // Add sparklines
  Object.keys(stockData).forEach(symbol => {
    const base = stockData[symbol].price * 0.95;
    const volatility = stockData[symbol].price * 0.02;
    stockData[symbol].sparkline = generateSparkline(base, volatility, 20, stockData[symbol].change > 0 ? 0.3 : -0.3);
  });

  return stockData;
}

// S&P 500 sector performance (mock)
export const sectorPerformance = [
  { name: "Technology", change: 2.4, weight: 31.2 },
  { name: "Healthcare", change: 0.8, weight: 12.1 },
  { name: "Financials", change: 1.1, weight: 13.4 },
  { name: "Consumer Disc.", change: -0.3, weight: 10.8 },
  { name: "Communication", change: 1.9, weight: 9.2 },
  { name: "Industrials", change: 0.5, weight: 8.7 },
  { name: "Consumer Staples", change: -0.1, weight: 5.9 },
  { name: "Energy", change: -1.2, weight: 3.8 },
  { name: "Utilities", change: 0.3, weight: 2.5 },
  { name: "Real Estate", change: -0.4, weight: 2.3 },
  { name: "Materials", change: 0.2, weight: 2.1 },
];

// Market breadth data
export const marketBreadth = {
  advancers: 312,
  decliners: 189,
  unchanged: 2,
  newHighs: 47,
  newLows: 12,
  aboveMA200: 68,
};
