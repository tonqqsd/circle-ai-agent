require('dotenv').config();

module.exports = {
  CIRCLE_API_KEY: process.env.CIRCLE_API_KEY,
  CIRCLE_ENTITY_SECRET: process.env.CIRCLE_ENTITY_SECRET,
  CIRCLE_FEE_POLICY_ID: process.env.CIRCLE_FEE_POLICY_ID,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  MAX_AUTO_BUY_BUDGET: parseFloat(process.env.MAX_AUTO_BUY_BUDGET) || 1.0,
  BLOCKCHAIN: process.env.BLOCKCHAIN || 'ETH-SEPOLIA',
  WALLET_SET_ID: process.env.WALLET_SET_ID
};
