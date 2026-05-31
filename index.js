const readline = require('readline');
const { chatWithAgent } = require('./src/agent');
const config = require('./src/config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("==========================================");
console.log("   Circle AI Agent Payment System");
console.log("==========================================\n");

if (!config.CIRCLE_API_KEY || !config.GEMINI_API_KEY) {
  console.log("⚠️  WARNING: Missing API keys in .env file.");
  console.log("Please copy .env.example to .env and fill in your credentials.");
  process.exit(1);
}

console.log("Agent initialized. You can now chat with the agent.");
console.log("Type 'exit' to quit.\n");

function askQuestion() {
  rl.question('> ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    if (input.trim() === '') {
      askQuestion();
      return;
    }

    await chatWithAgent(input);
    askQuestion();
  });
}

// Start the loop
askQuestion();
