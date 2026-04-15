// Stock tickers to track
export const INDICES = [
  { symbol: "^GSPC", name: "S&P 500", shortName: "S&P 500", yearStart: 5881.63 },
  { symbol: "^IXIC", name: "NASDAQ Composite", shortName: "NASDAQ", yearStart: 19310.79 },
  { symbol: "^DJI", name: "Dow Jones", shortName: "DOW", yearStart: 42544.22 },
  { symbol: "^RUT", name: "Russell 2000", shortName: "Russell 2000", yearStart: 2230.16 },
  { symbol: "^VIX", name: "CBOE Volatility", shortName: "VIX", yearStart: 17.35 },
];

export const WATCHLIST = [
  { symbol: "NVDA",  name: "NVIDIA",         sector: "Semiconductors",      yearStart: 134.29 },
  { symbol: "GOOGL", name: "Alphabet (Google)", sector: "Tech / AI",        yearStart: 189.30 },
  { symbol: "NOW",   name: "ServiceNow",     sector: "Enterprise Software", yearStart: 1059.39 },
  { symbol: "CRM",   name: "Salesforce",     sector: "Enterprise Software", yearStart: 334.30 },
  { symbol: "MSFT",  name: "Microsoft",      sector: "Tech / AI",           yearStart: 421.50 },
  { symbol: "AAPL",  name: "Apple",          sector: "Tech / Consumer",     yearStart: 250.42 },
  { symbol: "AMZN",  name: "Amazon",         sector: "Tech / Cloud",        yearStart: 219.39 },
  { symbol: "META",  name: "Meta Platforms", sector: "Tech / AI",           yearStart: 585.25 },
  { symbol: "SNOW",  name: "Snowflake",      sector: "Data Infrastructure", yearStart: 154.76 },
  { symbol: "PLTR",  name: "Palantir",       sector: "AI / Data Analytics", yearStart: 75.63 },
  { symbol: "MDB",   name: "MongoDB",        sector: "Data Infrastructure", yearStart: 232.57 },
  { symbol: "DDOG",  name: "Datadog",        sector: "Observability",       yearStart: 143.29 },
  { symbol: "CRWD",  name: "CrowdStrike",    sector: "Cybersecurity",       yearStart: 342.44 },
  { symbol: "AI",    name: "C3.ai",          sector: "Enterprise AI",       yearStart: 31.02 },
  { symbol: "PATH",  name: "UiPath",         sector: "AI / Automation",     yearStart: 12.45 },
];

// Generate realistic mock data
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

// Current prices (April 2026) — representative values
export function getMockIndexData() {
  return {
    "^GSPC": { price: 5520.40 + randomChange(-20, 20), change: randomChange(-30, 60), sparkline: generateSparkline(5450, 30, 20, 0.5) },
    "^IXIC": { price: 18120.87 + randomChange(-80, 80), change: randomChange(-100, 200), sparkline: generateSparkline(17900, 100, 20, 0.6) },
    "^DJI":  { price: 41022.50 + randomChange(-100, 100), change: randomChange(-100, 200), sparkline: generateSparkline(40700, 150, 20, 0.3) },
    "^RUT":  { price: 2088.45 + randomChange(-12, 12), change: randomChange(-15, 30), sparkline: generateSparkline(2060, 15, 20, 0.4) },
    "^VIX":  { price: 16.92 + randomChange(-1, 1), change: randomChange(-3, 3), sparkline: generateSparkline(17, 1.5, 20, -0.2) },
  };
}

export function getMockStockData() {
  const base = {
    NVDA:  { price: 1122.35, change: randomChange(-15, 25), marketCap: "2.76T", pe: 72.1, volume: "46.3M" },
    GOOGL: { price: 212.48,  change: randomChange(-5, 8),   marketCap: "2.60T", pe: 26.9, volume: "31.2M" },
    NOW:   { price: 985.17,  change: randomChange(-10, 15), marketCap: "203.5B", pe: 62.8, volume: "1.9M"  },
    CRM:   { price: 298.82,  change: randomChange(-5, 8),   marketCap: "288.4B", pe: 47.3, volume: "5.9M"  },
    MSFT:  { price: 472.55,  change: randomChange(-5, 10),  marketCap: "3.51T", pe: 37.8, volume: "24.3M" },
    AAPL:  { price: 226.40,  change: randomChange(-3, 5),   marketCap: "3.44T", pe: 32.2, volume: "52.1M" },
    AMZN:  { price: 243.96,  change: randomChange(-4, 7),   marketCap: "2.56T", pe: 44.1, volume: "36.8M" },
    META:  { price: 672.15,  change: randomChange(-8, 12),  marketCap: "1.69T", pe: 31.2, volume: "17.2M" },
    SNOW:  { price: 185.24,  change: randomChange(-5, 8),   marketCap: "62.1B",  pe: null, volume: "4.6M"  },
    PLTR:  { price: 92.17,   change: randomChange(-1.5, 3), marketCap: "210.4B", pe: 268.0, volume: "52.1M" },
    MDB:   { price: 302.44,  change: randomChange(-8, 12),  marketCap: "22.8B",  pe: null, volume: "2.3M"  },
    DDOG:  { price: 148.88,  change: randomChange(-4, 6),   marketCap: "50.2B",  pe: 298.0, volume: "5.7M"  },
    CRWD:  { price: 389.72,  change: randomChange(-6, 10),  marketCap: "95.1B",  pe: 104.3, volume: "3.6M"  },
    AI:    { price: 33.84,   change: randomChange(-2, 3),   marketCap: "4.3B",   pe: null, volume: "8.5M"  },
    PATH:  { price: 14.85,   change: randomChange(-1, 1.5), marketCap: "8.4B",   pe: null, volume: "7.0M"  },
  };

  Object.keys(base).forEach(symbol => {
    const b = base[symbol].price * 0.95;
    const vol = base[symbol].price * 0.02;
    base[symbol].sparkline = generateSparkline(b, vol, 20, base[symbol].change > 0 ? 0.3 : -0.3);
  });

  return base;
}

// Compute YTD %
export function ytdChange(current, yearStart) {
  return ((current - yearStart) / yearStart) * 100;
}

// S&P 500 sector performance (today's %)
export const sectorPerformance = [
  { name: "Technology",       change: 2.4,  weight: 31.2, ytd: 9.8  },
  { name: "Communication",    change: 1.9,  weight: 9.2,  ytd: 12.3 },
  { name: "Financials",       change: 1.1,  weight: 13.4, ytd: 5.1  },
  { name: "Healthcare",       change: 0.8,  weight: 12.1, ytd: 3.4  },
  { name: "Industrials",      change: 0.5,  weight: 8.7,  ytd: 4.2  },
  { name: "Utilities",        change: 0.3,  weight: 2.5,  ytd: 6.5  },
  { name: "Materials",        change: 0.2,  weight: 2.1,  ytd: 1.8  },
  { name: "Consumer Staples", change: -0.1, weight: 5.9,  ytd: 2.0  },
  { name: "Consumer Disc.",   change: -0.3, weight: 10.8, ytd: -1.2 },
  { name: "Real Estate",      change: -0.4, weight: 2.3,  ytd: -2.3 },
  { name: "Energy",           change: -1.2, weight: 3.8,  ytd: -4.8 },
];

export const marketBreadth = {
  advancers: 312,
  decliners: 189,
  unchanged: 2,
  newHighs: 47,
  newLows: 12,
  aboveMA200: 68,
};
