const { GoogleGenAI } = require('@google/genai');
const config = require('./config');
const circleTools = require('./circle-tools');
const mockApis = require('./mock-apis');

let ai;

function getAIClient() {
  if (!ai) {
    if (!config.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY");
    }
    ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  }
  return ai;
}

const tools = [
  {
    name: 'createWallet',
    description: 'Creates a new Developer Controlled Wallet for the AI agent.',
    parameters: {
      type: 'OBJECT',
      properties: {},
      required: []
    }
  },
  {
    name: 'getWalletBalance',
    description: 'Gets the current token balances of a specified wallet.',
    parameters: {
      type: 'OBJECT',
      properties: {
        walletId: {
          type: 'STRING',
          description: 'The UUID of the wallet to check the balance of.'
        }
      },
      required: ['walletId']
    }
  },
  {
    name: 'transferUSDC',
    description: 'Transfers tokens (like USDC) to a destination address. Used to pay for services.',
    parameters: {
      type: 'OBJECT',
      properties: {
        walletId: {
          type: 'STRING',
          description: 'The UUID of the source wallet.'
        },
        destinationAddress: {
          type: 'STRING',
          description: 'The blockchain address to send funds to.'
        },
        amount: {
          type: 'STRING',
          description: 'The amount of tokens to send.'
        },
        tokenId: {
          type: 'STRING',
          description: 'Optional. The token ID for USDC on the specific blockchain. Omit to send native gas tokens.'
        }
      },
      required: ['walletId', 'destinationAddress', 'amount']
    }
  },
  {
    name: 'discoverAPIs',
    description: 'Discovers available premium API services in the marketplace.',
    parameters: { type: 'OBJECT', properties: {} }
  },
  {
    name: 'getAPIPrice',
    description: 'Gets the current price in USDC for a specific API.',
    parameters: {
      type: 'OBJECT',
      properties: {
        apiId: { type: 'STRING', description: 'The ID of the API.' }
      },
      required: ['apiId']
    }
  },
  {
    name: 'purchaseAPI',
    description: 'Unlocks the premium API data payload using a successful transaction ID.',
    parameters: {
      type: 'OBJECT',
      properties: {
        apiId: { type: 'STRING', description: 'The ID of the API.' },
        transactionId: { type: 'STRING', description: 'The transaction ID (txHash/id) of the payment.' }
      },
      required: ['apiId', 'transactionId']
    }
  }
];

const SYSTEM_INSTRUCTION = `
You are an autonomous AI Agent equipped with a Circle Developer-Controlled Wallet.
Your job is to act as an API Aggregator and Data Broker. You can discover available APIs, check their prices, and purchase them using USDC.
You have a strict maximum auto-buy budget of ${config.MAX_AUTO_BUY_BUDGET} USDC per API.

WORKFLOW:
1. When asked for data, use 'discoverAPIs' to find the relevant API.
2. Use 'getAPIPrice' to check its current price.
3. Compare the price against your auto-buy budget (${config.MAX_AUTO_BUY_BUDGET} USDC).
   - If the price is LESS THAN or EQUAL to the budget: Automatically proceed to purchase. Use 'transferUSDC' to pay the API's address, then use 'purchaseAPI' with the resulting transaction ID to get the data, and present the data to the user.
   - If the price is GREATER THAN the budget: STOP. Do not buy it. Reply to the user explaining the price and asking for explicit approval to proceed.
4. If the user replies with approval (e.g. "Yes, proceed" or "Buy it"), execute the purchase flow.

Always explain what you are doing before calling a tool.
`;

let chatSession = null;

async function chatWithAgent(message) {
  const client = getAIClient();

  if (!chatSession) {
    chatSession = client.chats.create({
      model: 'gemini-2.5-pro',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: tools }]
      }
    });
  }

  console.log(`\nUser: ${message}`);
  try {
    let response = await chatSession.sendMessage({ message });

    while (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      console.log(`[Agent called tool: ${call.name}(${JSON.stringify(call.args)})]`);
      
      let functionResult;
      try {
        if (call.name === 'createWallet') {
          functionResult = await circleTools.createWallet();
        } else if (call.name === 'getWalletBalance') {
          functionResult = await circleTools.getWalletBalance(call.args.walletId);
        } else if (call.name === 'transferUSDC') {
          functionResult = await circleTools.transferUSDC(
            call.args.walletId, 
            call.args.destinationAddress, 
            call.args.amount, 
            call.args.tokenId
          );
        } else if (call.name === 'discoverAPIs') {
          functionResult = mockApis.discoverAPIs();
        } else if (call.name === 'getAPIPrice') {
          functionResult = mockApis.getAPIPrice(call.args.apiId);
        } else if (call.name === 'purchaseAPI') {
          functionResult = await mockApis.purchaseAPI(call.args.apiId, call.args.transactionId);
        } else {
          throw new Error("Unknown function call");
        }
      } catch (err) {
        functionResult = { error: err.message || err.toString() };
      }

      console.log(`[Tool returned: ${JSON.stringify(functionResult)}]`);
      
      // Send the tool result back to the model
      response = await chatSession.sendMessage({
        message: [{
          functionResponse: {
            name: call.name,
            response: functionResult
          }
        }]
      });
    }

    if (response.text) {
      console.log(`\nAgent: ${response.text}`);
      return response.text;
    }
  } catch (error) {
    console.error("Agent Error:", error);
    return "Error communicating with the agent.";
  }
}

module.exports = {
  chatWithAgent
};
