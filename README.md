# Circle AI Agent Payment System 🤖💸

An autonomous AI Agent built on the **Circle Agent Stack** and **Google Gemini** that acts as an API Aggregator and Data Broker. The agent evaluates data requests, queries premium API marketplaces, negotiates pricing against a user-defined budget, and executes on-chain USDC payments to unlock data payloads autonomously.

Built for the **Circle Ecosystem / Hackathons** to demonstrate the power of Machine-to-Machine (M2M) Economy using Circle Developer-Controlled Wallets.

## Features ✨
- **Autonomous Wallet Provisioning**: The agent can create its own Developer-Controlled Wallet on any EVM testnet (e.g., Ethereum Sepolia) via the Circle Web3 Services API.
- **Dynamic Marketplace Discovery**: The agent can search a simulated marketplace of premium API providers (Financial Alpha & Accurate Weather).
- **Smart Budgeting**: Set a `MAX_AUTO_BUY_BUDGET` in your `.env`. 
  - If the API cost is under budget, the agent buys it automatically via an on-chain USDC transfer.
  - If the cost is over budget, the agent pauses execution and requests human approval via the CLI.
- **Cryptographic Security**: Uses Circle's Entity Secret to securely authorize transactions without manual human signature for every transaction.

## Prerequisites 🛠
- [Node.js](https://nodejs.org/en/) (v18+)
- A [Circle Developer Account](https://console.circle.com/) (API Key & Entity Secret)
- A Google Gemini API Key

## Setup & Installation 🚀

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tonqqsd/circle-ai-agent.git
   cd circle-ai-agent
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example config and fill in your credentials.
   ```bash
   cp .env.example .env
   ```
   **Required Keys:**
   - `CIRCLE_API_KEY`: Generate in the Circle Web3 Services Console.
   - `CIRCLE_ENTITY_SECRET`: A 32-byte hex string (generate via Circle's SDK).
   - `GEMINI_API_KEY`: Get this from Google AI Studio.

4. **Fund Your Agent:**
   Once you start the agent and it generates a wallet address, go to the [Circle Faucet](https://faucet.circle.com/) to send testnet USDC to your agent so it can start shopping!

## Usage 💻

Run the CLI chat loop:
```bash
node index.js
```

### Example Interaction
> **User**: *I need the latest financial alpha data. Please get it for me.*
>
> **Agent**: *I am searching the marketplace for financial APIs...*
> *(Agent calls `discoverAPIs` and `getAPIPrice`)*
>
> **Agent**: *The Premium Financial Data API currently costs 1.2 USDC. This is above your auto-buy budget of 1.0 USDC. Do you approve this purchase?*
>
> **User**: *Yes, proceed.*
>
> **Agent**: *Transferring 1.2 USDC to the provider...*
> *(Agent calls `transferUSDC` and gets a Transaction ID)*
> *(Agent calls `purchaseAPI` using the Transaction ID)*
>
> **Agent**: *Payment verified! Here is the data: BTC Signal - STRONG BUY. Target Price: 120,000.*

## Architecture 🏗
- `src/circle-tools.js`: Exposes Circle SDK wrappers (`createWallet`, `getWalletBalance`, `transferUSDC`).
- `src/mock-apis.js`: Simulates premium API endpoints with dynamic pricing.
- `src/agent.js`: Initializes Google Gemini and binds the tools to the LLM via Function Calling.
- `src/config.js`: Centralized configuration.

## License 📄
MIT
