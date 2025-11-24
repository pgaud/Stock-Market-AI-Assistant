# 🚀 Stock Market AI Assistant

> **Real-Time Stock Market Intelligence for AI Assistants**
> 
> Connect ChatGPT, Claude, and other AI models to live Indian stock market data with powerful financial analysis tools. Get professional-grade stock research, technical analysis, and investment insights through natural language conversations.

![Analysis Tools](https://img.shields.io/badge/🔥-Analysis%20Tools-blue)
![Stocks](https://img.shields.io/badge/📊-310%2B%20Stocks-green)
![Real-time](https://img.shields.io/badge/⚡-Real--time%20Data-orange)
![AI Powered](https://img.shields.io/badge/🤖-AI--Powered-purple)

---

## ✨ **Key Features**

### 📊 **Comprehensive Analysis Tools**
| Feature | Description |
|---------|-------------|
| 📈 **Real-time Data** | Live stock prices, volume, and market data |
| 🔍 **Technical Analysis** | Moving averages, RSI, support/resistance levels |
| 💰 **Fundamentals** | P/E ratios, financial statements, growth metrics |
| 📊 **Historical Data** | Balance sheet yearly and quarterly reports |
| 🏆 **Market Leaders** | Top gainers, losers, sector performance |

### 🎯 **Why Choose Our MCP Server?**

**🧠 Dedicated LLM with Live Market Intelligence**
- Real-time stock data integration for informed AI decisions
- Context-aware prompts with live market conditions
- Enhanced decision-making through continuous data feeds
- AI responses backed by current market reality

**🚀 Production-Ready**
- Built with TypeScript for reliability
- Comprehensive error handling
- RESTful API integration

**🔒 Secure & Private**
- No data storage on our servers
- Secure API key management
- Local deployment for privacy

**⚡ Lightning Fast**
- Optimized queries for speed
- Cached responses where appropriate
- Minimal latency design

---

## 🚀 **What Makes This Special?**

### **🎯 Built for AI Conversations**
Transform complex financial data into natural language insights. Ask questions like:
- *"What's the technical analysis for TCS?"*
- *"Compare INFY and WIPRO fundamentals"*
- *"Show me top IT sector stocks"*

### **📊 Real-time Market Data**
- Live price feeds from NSE/BSE
- Instant market updates
- Professional-grade data quality

### **🎯 Powerful Analysis Tools**

**🔥 Core Stock Analysis**
- **📊 get_stock_data** - Real-time price, volume, and basic metrics
- **📈 get_multiple_stocks** - Compare multiple stocks simultaneously
- **🔍 search_stocks** - Find stocks by name or symbol
- **🏆 get_top_gainers** - Today's best performing stocks
- **📉 get_top_losers** - Biggest decliners of the day

**💰 Financial Deep Dive**
- **💼 get_quarterly_results** - Latest earnings and revenue data
- **📋 get_yearly_results** - Annual financial performance
- **🏛️ get_balance_sheet** - Assets, liabilities, and equity analysis
- **💸 get_cashflow_statement** - Cash flow from operations and investments
- **📊 get_financial_ratios** - P/E, ROE, debt ratios, and more

**🎯 Market Intelligence**
- **🏢 get_stocks_by_sector** - Filter stocks by industry sector
- **💎 get_stocks_by_market_cap** - Large, mid, or small cap analysis
- **👥 get_shareholding_quarterly** - Institutional holdings data
- **📅 get_shareholding_yearly** - Annual shareholding patterns

**🚀 Advanced Analytics**
- **🔬 get_advanced_stock_analysis** - Comprehensive technical and fundamental analysis
- **📈 get_historical_analysis** - Price trends and historical performance
- **📋 get_supported_stocks** - Complete list of available stocks

### **🔧 Developer-Friendly**
- **TypeScript** for type safety and better development experience
- **Modular Architecture** for easy extension and maintenance
- **Comprehensive Error Handling** for robust operation

---

## 🛠️ **Quick Setup**

### **Step 1: Clone & Install**

```bash
git clone <repository-url>
cd "Stock market AI assistant"
cd mcp
npm install
```

### **Step 2: Get API Credentials**

**📋 How to Generate Your API Key:**

1. **Visit** [IndianAPI.in](https://stock.indianapi.in/) 
2. **Sign up** for a free account (no credit card required)
3. **Verify** your email address (check spam folder if needed)
4. **Login** to your dashboard
5. **Click** "Generate API Key" or "API Keys" section
6. **Copy** your API key (format: `api_xxxxxxxxxxxxxxxxxx`)
7. **Save** it securely - you'll paste this in the `.env` file

**🔥 API Key Features:**
- ✅ **Free Tier**: 1,000 requests/month
- ✅ **Real-time Data**: Live stock prices & analysis  
- ✅ **310+ Stocks**: NSE & BSE coverage
- ✅ **No Expiration**: Your key stays active

> 🔒 **Security Note**: Never commit your API key to version control. The `.env` file is already in `.gitignore`.

### **Step 3: Configure Environment**

**🔧 Setup Your Configuration:**

```bash
# Copy the environment template
cp .env.example .env
```

**📝 Edit the `.env` file and add your API key:**

```bash
# Open .env file in your preferred editor
nano .env
# OR
code .env
# OR
vim .env
```

**Replace the placeholder with your actual API key:**

```bash
# 🔑 REQUIRED: Replace with your actual API key from IndianAPI.in
INDIAN_STOCK_API_KEY=api_your_actual_api_key_here

# 🌐 API endpoint (keep as is)
INDIAN_STOCK_BASE_URL=https://stock.indianapi.in

# ⚙️ Server port (change if needed)
PORT=3001
```

> ⚠️ **Important**: Make sure to replace `your_api_key_here` with your actual API key from step 2!

### **Step 4: Build & Deploy**

```bash
# Navigate to MCP server directory
cd mcp

# Build the TypeScript code
npm run build

# Start the server
node dist/mcpServer.js
```

### **Step 5: Connect to AI Client**
Configure your AI client (ChatGPT, Claude) to connect to:
```
http://localhost:3001
```

---

## 🧪 **Testing with VS Code Terminal**

### **💻 Direct MCP Server Testing**

You can test the MCP server functionality directly using JSON-RPC calls:

```bash
# Navigate to MCP directory
cd mcp

# Test with TCS stock data
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_stock_data", "arguments": {"symbol": "TCS"}}}' | node dist/mcpServer.js
```

**💡 Pro Tips:**
- 🔧 Run `npm run build` first
- 🔑 Ensure `.env` has your API key
- 📝 Use proper JSON formatting


## 📁 **Project Structure**

```
Stock market AI assistant/
├── 📄 README.md                    # You are here!
├── ⚙️ .env.example                 # Environment template
├── 🔒 .gitignore                   # Security exclusions
└── 📁 mcp/                         # MCP Server
    ├── 📦 package.json             # Dependencies & scripts
    ├── ⚙️ tsconfig.json            # TypeScript configuration
    ├── 📁 src/                     # Source code
    │   ├── 🚀 mcpServer.ts         # Main MCP server
    │   └── 📁 handlers/
    │       └── 📊 stockAnalysisHandlers.ts # All tool implementations
    └── 📁 dist/                    # Built JavaScript files
```

---

## 🎉 **Ready to Get Started?**

### **🚀 Why Our MCP Server?**

- **🎯 Professional Tools** for comprehensive analysis
- **📊 Real-time Data** from Indian stock exchanges
- **🔒 Secure Setup** with proper API key management
- **⚡ Easy Integration** with popular AI platforms
- **📚 Documentation** with examples and best practices

---

## 📄 License

MIT License - see LICENSE file for details.

---

**🚀 Ready to transform your investment research?**

Start your journey to professional-grade stock market analysis today!

```bash
git clone <repository-url>
cd "Stock market AI assistant"
cp .env.example .env
# Add your API key to .env file
cd mcp
npm install && npm run build && node dist/mcpServer.js
```
