// Mock API Providers for the API Aggregator Showcase

const APIS = {
  "FINANCIAL_ALPHA": {
    id: "FINANCIAL_ALPHA",
    name: "Premium Financial Data API",
    description: "High-frequency crypto market data and alpha signals.",
    address: "0x1111111111111111111111111111111111111111", // Mock destination address
    basePrice: 1.5,
    dataPayload: {
      symbol: "BTC",
      signal: "STRONG BUY",
      confidence: 0.94,
      targetPrice: 120000,
      timestamp: new Date().toISOString()
    }
  },
  "WEATHER_PREMIUM": {
    id: "WEATHER_PREMIUM",
    name: "Accurate Weather API",
    description: "Hyper-local, highly accurate predictive weather models.",
    address: "0x2222222222222222222222222222222222222222", // Mock destination address
    basePrice: 0.8,
    dataPayload: {
      location: "Global",
      forecast: "Clear skies with a 90% chance of a bull market.",
      temperature: "24°C",
      timestamp: new Date().toISOString()
    }
  }
};

/**
 * Returns a list of available APIs.
 */
function discoverAPIs() {
  console.log("[Mock API Marketplace] Agent is discovering available APIs...");
  return Object.values(APIS).map(api => ({
    id: api.id,
    name: api.name,
    description: api.description,
    address: api.address
  }));
}

/**
 * Returns the current dynamic price of the API in USDC.
 * We add a small random fluctuation to simulate real-world dynamic pricing.
 */
function getAPIPrice(apiId) {
  const api = APIS[apiId];
  if (!api) throw new Error(`API ID ${apiId} not found.`);
  
  // Random fluctuation between -0.2 and +0.5 USDC
  const fluctuation = (Math.random() * 0.7) - 0.2;
  let currentPrice = api.basePrice + fluctuation;
  currentPrice = Math.max(0.1, currentPrice); // Ensure it's never <= 0
  
  const formattedPrice = currentPrice.toFixed(2);
  console.log(`[Mock API Marketplace] Agent checked price for ${apiId}: ${formattedPrice} USDC`);
  
  return formattedPrice;
}

/**
 * Simulates purchasing the API. In a real scenario, the provider's backend
 * would verify the transaction hash on the blockchain before returning the data.
 */
function purchaseAPI(apiId, transactionId) {
  const api = APIS[apiId];
  if (!api) throw new Error(`API ID ${apiId} not found.`);
  if (!transactionId) throw new Error(`Missing transactionId for payment verification.`);

  console.log(`[Mock API Marketplace] Verifying payment transaction ${transactionId} for ${apiId}...`);
  // Simulate network verification delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Mock API Marketplace] Payment Verified! Unlocking premium payload for ${apiId}.`);
      resolve({
        success: true,
        message: "Payment verified successfully.",
        data: api.dataPayload
      });
    }, 1500);
  });
}

module.exports = {
  discoverAPIs,
  getAPIPrice,
  purchaseAPI
};
