const { initiateDeveloperControlledWalletsClient } = require('@circle-fin/developer-controlled-wallets');
const config = require('./config');

let client;

function getClient() {
  if (!client) {
    if (!config.CIRCLE_API_KEY || !config.CIRCLE_ENTITY_SECRET) {
      throw new Error("Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET");
    }
    client = initiateDeveloperControlledWalletsClient({
      apiKey: config.CIRCLE_API_KEY,
      entitySecret: config.CIRCLE_ENTITY_SECRET,
    });
  }
  return client;
}

/**
 * Creates a new Developer Controlled Wallet on the configured blockchain
 */
async function createWallet() {
  const c = getClient();
  let walletSetId = config.WALLET_SET_ID;
  
  if (!walletSetId) {
    console.log("No WALLET_SET_ID found. Creating a new WalletSet...");
    const wsRes = await c.createWalletSet({ name: 'Agent Wallet Set' });
    walletSetId = wsRes.data.walletSet.id;
    console.log(`Created WalletSet: ${walletSetId}. Add this to your .env to reuse.`);
  }

  console.log(`Creating wallet on ${config.BLOCKCHAIN}...`);
  const response = await c.createWallets({
    blockchains: [config.BLOCKCHAIN],
    count: 1,
    walletSetId: walletSetId
  });

  const wallet = response.data.wallets[0];
  console.log(`Wallet created successfully!`);
  console.log(`Wallet ID: ${wallet.id}`);
  console.log(`Address: ${wallet.address}`);
  return wallet;
}

/**
 * Gets the USDC balance of a given wallet
 * @param {string} walletId 
 */
async function getWalletBalance(walletId) {
  const c = getClient();
  try {
    const response = await c.listWalletBalance(walletId);
    // balances is an array, let's filter for USDC if possible, or just return the token balances
    return response.data.tokenBalances || [];
  } catch (error) {
    console.error("Error fetching balance:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Transfers tokens from the agent's wallet to a destination
 * @param {string} walletId 
 * @param {string} destinationAddress 
 * @param {string} amount 
 * @param {string} tokenId (Optional: USDC token ID for the blockchain)
 */
async function transferUSDC(walletId, destinationAddress, amount, tokenId = null) {
  const c = getClient();
  console.log(`Initiating transfer of ${amount} to ${destinationAddress}...`);
  
  const payload = {
    walletId,
    destinationAddress,
    amounts: [amount.toString()]
  };

  if (config.CIRCLE_FEE_POLICY_ID) {
    console.log(`[Gas Station] Sponsoring transaction with Fee Policy ID: ${config.CIRCLE_FEE_POLICY_ID}`);
    payload.feePolicyId = config.CIRCLE_FEE_POLICY_ID;
  } else {
    payload.feeLevel = "MEDIUM";
  }

  if (tokenId) {
    payload.tokenId = tokenId;
  }

  try {
    const response = await c.createTransaction(payload);
    console.log(`Transaction successfully created. ID: ${response.data.id}`);
    return {
      transactionId: response.data.id,
      state: response.data.state
    };
  } catch (error) {
    console.error("Error creating transaction:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Checks the status of a specific transaction
 * @param {string} transactionId 
 */
async function getTransactionStatus(transactionId) {
  const c = getClient();
  try {
    const response = await c.getTransaction({ id: transactionId });
    const state = response.data.transaction.state;
    console.log(`[Transaction Status] ID: ${transactionId} - State: ${state}`);
    return {
      transactionId: response.data.transaction.id,
      state: state
    };
  } catch (error) {
    console.error("Error fetching transaction status:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getClient,
  createWallet,
  getWalletBalance,
  transferUSDC,
  getTransactionStatus
};
