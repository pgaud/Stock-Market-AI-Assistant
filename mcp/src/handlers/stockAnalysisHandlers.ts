import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../../.env') });

interface McpResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

const INDIAN_STOCK_API_KEY = process.env.INDIAN_STOCK_API_KEY || '';
const INDIAN_STOCK_API_BASE_URL = process.env.INDIAN_STOCK_BASE_URL || 'https://stock.indianapi.in';

interface StockAnalysisResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

interface StructuredAnalysisMetadata {
  symbol: string;
  timestamp: string;
  analysisType: string;
  dataSource: string;
}

interface AnalysisSummary {
  recommendation?: string;
  confidence?: string;
  riskLevel?: string;
  keyInsights: string[];
}

interface TechnicalAnalysis {
  trend: string;
  signals: string[];
  support?: number;
  resistance?: number;
}

interface FundamentalAnalysis {
  valuation: string;
  financialHealth: string;
  growthProspects: string;
}

interface StructuredAnalysis {
  metadata: StructuredAnalysisMetadata;
  summary: AnalysisSummary;
  metrics: { [key: string]: any };
  technical?: TechnicalAnalysis;
  fundamental?: FundamentalAnalysis;
}

interface InvestmentRecommendation {
  recommendation: string;
  confidence: string;
  riskLevel: string;
}

function formatStructuredAnalysis(data: StructuredAnalysis): string {
  let response = `# 📊 STOCK ANALYSIS: ${data.metadata.symbol}\n\n`;
  
  // Metadata section
  response += `## 📋 Analysis Metadata\n`;
  response += `- **Symbol**: ${data.metadata.symbol}\n`;
  response += `- **Timestamp**: ${data.metadata.timestamp}\n`;
  response += `- **Analysis Type**: ${data.metadata.analysisType}\n`;
  response += `- **Data Source**: ${data.metadata.dataSource}\n\n`;
  
  // Executive Summary
  if (data.summary) {
    response += `## 🎯 Executive Summary\n`;
    if (data.summary.recommendation) response += `- **Recommendation**: ${data.summary.recommendation}\n`;
    if (data.summary.confidence) response += `- **Confidence**: ${data.summary.confidence}\n`;
    if (data.summary.riskLevel) response += `- **Risk Level**: ${data.summary.riskLevel}\n`;
    
    if (data.summary.keyInsights.length > 0) {
      response += `- **Key Insights**:\n`;
      data.summary.keyInsights.forEach(insight => {
        response += `  • ${insight}\n`;
      });
    }
    response += `\n`;
  }
  
  // Technical Analysis
  if (data.technical) {
    response += `## 📈 Technical Analysis\n`;
    response += `- **Trend**: ${data.technical.trend}\n`;
    if (data.technical.support) response += `- **Support**: ₹${data.technical.support.toFixed(2)}\n`;
    if (data.technical.resistance) response += `- **Resistance**: ₹${data.technical.resistance.toFixed(2)}\n`;
    response += `- **Signals**:\n`;
    data.technical.signals.forEach(signal => {
      response += `  • ${signal}\n`;
    });
    response += `\n`;
  }
  
  // Fundamental Analysis
  if (data.fundamental) {
    response += `## 💼 Fundamental Analysis\n`;
    response += `- **Valuation**: ${data.fundamental.valuation}\n`;
    response += `- **Financial Health**: ${data.fundamental.financialHealth}\n`;
    response += `- **Growth Prospects**: ${data.fundamental.growthProspects}\n\n`;
  }
  
  // Detailed Metrics
  response += `## 📊 Detailed Metrics\n`;
  Object.entries(data.metrics).forEach(([key, value]) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (typeof value === 'number' && key.toLowerCase().includes('price') || key.toLowerCase().includes('value')) {
      response += `- **${formattedKey}**: ${formatCurrency(value)}\n`;
    } else {
      response += `- **${formattedKey}**: ${value}\n`;
    }
  });
  
  return response;
}

function generateTechnicalSignals(priceData: any, dma50?: number, dma200?: number): string[] {
  const signals = [];
  
  if (dma50 && dma200 && priceData) {
    const currentPrice = parseFloat(priceData);
    
    if (currentPrice > dma50 && currentPrice > dma200 && dma50 > dma200) {
      signals.push("🟢 Strong Bullish - Price above both moving averages");
      signals.push("📈 Golden Cross Formation - 50 DMA above 200 DMA");
    } else if (currentPrice > dma50 && currentPrice > dma200) {
      signals.push("🟡 Cautiously Bullish - Price above moving averages");
    } else if (currentPrice < dma50 && currentPrice < dma200 && dma50 < dma200) {
      signals.push("🔴 Strong Bearish - Price below both moving averages");
      signals.push("📉 Death Cross Formation - 50 DMA below 200 DMA");
    } else {
      signals.push("🟡 Mixed Signals - Consolidation phase");
    }
    
    // Support and resistance levels
    const resistance = Math.max(dma50, dma200);
    const support = Math.min(dma50, dma200);
    
    if (currentPrice > resistance) {
      signals.push(`🚀 Above key resistance level: ₹${resistance.toFixed(2)}`);
    } else if (currentPrice < support) {
      signals.push(`⚠️ Below key support level: ₹${support.toFixed(2)}`);
    }
  }
  
  return signals;
}

function generateRecommendation(changePercent: number, signals: string[]): {
  recommendation: string;
  confidence: string;
  riskLevel: string;
} {
  const bullishSignals = signals.filter(s => s.includes('🟢') || s.includes('📈') || s.includes('🚀')).length;
  const bearishSignals = signals.filter(s => s.includes('🔴') || s.includes('📉') || s.includes('⚠️')).length;
  
  let recommendation = "HOLD";
  let confidence = "MEDIUM";
  let riskLevel = "MODERATE";
  
  if (changePercent > 15 && bullishSignals > bearishSignals) {
    recommendation = "STRONG BUY";
    confidence = "HIGH";
    riskLevel = "MODERATE";
  } else if (changePercent > 5 && bullishSignals > 0) {
    recommendation = "BUY";
    confidence = "MEDIUM";
    riskLevel = "MODERATE";
  } else if (changePercent < -15 && bearishSignals > bullishSignals) {
    recommendation = "SELL";
    confidence = "HIGH";
    riskLevel = "HIGH";
  } else if (changePercent < -5 && bearishSignals > 0) {
    recommendation = "WEAK SELL";
    confidence = "MEDIUM";
    riskLevel = "HIGH";
  }
  
  return { recommendation, confidence, riskLevel };
}

// Comprehensive stock database (310 stocks) - embedded for now to avoid module issues
const SUPPORTED_STOCKS = [
  // Major Blue Chips
  'RELIANCE', 'TCS', 'INFY', 'HDFC', 'HDFCBANK', 'ICICIBANK', 'KOTAKBANK',
  'LT', 'SBIN', 'BHARTIARTL', 'ITC', 'BAJFINANCE', 'ASIANPAINT', 'HCLTECH',
  'AXISBANK', 'MARUTI', 'TITAN', 'NESTLEIND', 'ULTRACEMCO', 'SUNPHARMA',
  'WIPRO', 'TATAMOTORS', 'TATASTEEL', 'TECHM', 'POWERGRID', 'NTPC', 'ONGC',
  'COALINDIA', 'GRASIM', 'JSWSTEEL', 'HINDALCO', 'DRREDDY', 'CIPLA',
  'BRITANNIA', 'DIVISLAB', 'BAJAJFINSV', 'EICHERMOT', 'HEROMOTOCO',
  'BAJAJ-AUTO', 'SHREECEM', 'INDUSINDBK', 'ADANIENT', 'ADANIPORTS',
  'BPCL', 'IOC', 'HINDUNILVR', 'TATACONSUM', 'SWIGGY', 'ZOMATO', 'NYKAA', 'PAYTM',
  
  // IT & Technology (Extended)
  'MINDTREE', 'MPHASIS', 'LTTS', 'PERSISTENT', 'COFORGE', 'CYIENT',
  'RAMSONS', 'INTELLECT', 'KPITTECH', 'SONATSOFTW', 'NIITTECH', 'HAPPIESTMINDS',
  'ROUTE', 'NEWGEN', 'AFFLE', 'JUSTDIAL', 'INDIAMART', 'FRESHWORKS',
  
  // Banking & Financial (Extended)
  'FEDERALBNK', 'IDFC', 'IDFCFIRSTB', 'BANDHANBNK', 'RBLBANK', 'YESBANK',
  'PNB', 'BANKBARODA', 'CANFINHOME', 'LICHSGFIN', 'HDFCLIFE',
  'ICICIPRULI', 'SBILIFE', 'STAR', 'POLICYBZR', 'ANGELONE', 'CDSL', 'CAMS',
  
  // Pharmaceuticals (Extended)
  'LUPIN', 'BIOCON', 'TORNTPHARM', 'CADILAHC', 'ZYDUSLIFE', 'MANKIND', 'ALKEM',
  'GLENMARK', 'AUROPHARMA', 'ABBOTINDIA', 'PFIZER', 'GSK', 'NOVARTIS', 'GLAXO',
  
  // Consumer & FMCG (Extended)
  'DABUR', 'GODREJCP', 'MARICO', 'COLPAL', 'EMAMI', 'VBL', 'JUBLFOOD',
  'PAGEIND', 'TRENT', 'SHOPERSTOP', 'RAYMOND', 'ADITYADIREC', 'BATAINDIA',
  
  // Auto & Components (Extended)
  'MAHINDRA', 'ESCORTS', 'MRF', 'APOLLOTYRE', 'CEAT', 'BOSCHLTD', 'MOTHERSUMI',
  'ASHOKLEY', 'BALKRISIND', 'RELAXO', 'EXIDEIND', 'AMARARAJA',
  
  // Metals & Mining (Extended)
  'VEDL', 'HINDZINC', 'NMDC', 'MOIL', 'NATIONALUM', 'TATAMTRDVR', 'JINDALSTEL',
  'WELCORP', 'RATNAMANI', 'APL', 'TIINDIA', 'SAIL',
  
  // Energy & Utilities (Extended)
  'GAIL', 'RELINFRA', 'RPOWER', 'ADANIGREEN', 'ADANIPOWER', 'SUZLON', 'THERMAX',
  'BHEL', 'SIEMENS', 'ABB', 'SCHNEIDER', 'TATAPOWER', 'CESC',
  
  // Cement & Construction (Extended)
  'AMBUJACEM', 'ACC', 'JKCEMENT', 'HEIDELBERGCEM', 'RAMCOCEM', 'IRCON', 'NBCC',
  'RITES', 'BEML', 'HCC', 'PRISM', 'KNR',
  
  // Chemicals (Extended)
  'UPL', 'PIDILITIND', 'BERGEPAINT', 'AKZONOBEL', 'TATACHEM', 'GHCL',
  'DCMSHRIRAM', 'DEEPAKNTR', 'BALRAMCHIN', 'VINATIORG', 'CLEAN', 'ROSSARI',
  
  // Real Estate & Construction
  'DLF', 'GODREJPROP', 'OBEROIRLTY', 'PRESTIGE', 'BRIGADE', 'SOBHA',
  
  // Media & Entertainment
  'ZEEL', 'SUNTV', 'PVRINOX', 'INOXLEISUR', 'NAZARA', 'TIPS', 'SAREGRAMA',
  
  // Logistics & Transportation
  'DELHIVERY', 'MAHLOG', 'GATI', 'ALLCARGO', 'CONTAINERSHIPLN', 'SHREYAS', 'TCI',
  
  // Consumer Electronics & Appliances
  'DIXON', 'AMBER', 'WHIRLPOOL', 'CROMPTON', 'HAVELLS', 'ORIENTELEC',
  'VOLTAS', 'BLUESTARCO', 'CARRIER',
  
  // Textiles & Apparel
  'ARVIND', 'WELSPUNIND', 'TRIDENT', 'VARDHMAN', 'PAGEINDUSTRIES',
  
  // Food & Beverages
  'BIKAJI', 'DEVYANI', 'WESTLIFE', 'SAPPHIRE', 'VARUN', 'KRBL',
  
  // Gems & Jewellery
  'KALYANJEWELL', 'PCJEWELLER', 'RAJESHEXPO', 'THANGAMAYIL',
  
  // Agriculture & Allied
  'RALLIS', 'INSECTICIDES', 'ZUARI', 'COROMANDEL', 'KRIBHCO', 'JKPAPER',
  
  // Recent IPOs & Unicorns
  'IRCTC', 'CARTRADE', 'EASEMYTRIP', 'RATEGAIN', 'LATENTVIEW', 'MOBIKWIK',
  'OLAELECTRIC', 'BROOKFIELD', 'EMBASSY', 'NEXUS', 'CHEMCON', 'BURGERKING',
  'HERANBA', 'GLAND', 'METROPOLIS', 'LAXMIMACHINE', 'SHRIRAMFIN', 'MAHLIFE',
  'EDELWEISS', 'MOTILALOF', 'KFINTECH', 'BSE', 'MCX'
];

const STOCK_ALIASES: Record<string, string> = {
  'RELIANCEIND': 'RELIANCE', 'RIL': 'RELIANCE', 'TATACONSULTANCY': 'TCS',
  'TATACONS': 'TCS', 'INFOSYS': 'INFY', 'LARSENTOUBRO': 'LT', 'LNT': 'LT',
  'BHARTIAIRTEL': 'BHARTIARTL', 'AIRTEL': 'BHARTIARTL', 'MARUTISUZUKI': 'MARUTI',
  'ASIANPAINTS': 'ASIANPAINT', 'HCL': 'HCLTECH', 'TAMO': 'TATAMOTORS',
  'SBIBANK': 'SBIN', 'STATEBANK': 'SBIN', 'KOTAKMAHINDRA': 'KOTAKBANK',
  'KOTAK': 'KOTAKBANK', 'DRREDDYS': 'DRREDDY', 'REDDY': 'DRREDDY',
  'NESTLEINDIA': 'NESTLEIND', 'NESTLE': 'NESTLEIND', 'HINDUSTAN': 'HINDUNILVR',
  'HUL': 'HINDUNILVR', 'UNILEVER': 'HINDUNILVR', 'ITCLTD': 'ITC',
  'PAYTMONEY': 'PAYTM', 'FSNNYKAA': 'NYKAA', 'SWIGGYLIMITED': 'SWIGGY',
  'ZOMATOLTD': 'ZOMATO', 'POLICYBAZAAR': 'POLICYBZR', 'ANGELBROKING': 'ANGELONE'
};

function findStockSymbol(query: string): string | null {
  const upperQuery = query.toUpperCase().trim();
  
  // Direct match
  if (SUPPORTED_STOCKS.includes(upperQuery)) {
    return upperQuery;
  }
  
  // Check aliases
  if (STOCK_ALIASES[upperQuery]) {
    return STOCK_ALIASES[upperQuery];
  }
  
  // Partial match (for user convenience)
  const partialMatch = SUPPORTED_STOCKS.find((stock: string) => 
    stock.includes(upperQuery) || upperQuery.includes(stock)
  );
  
  if (partialMatch) {
    return partialMatch;
  }
  
  return null;
}

function getSupportedStocksList(): string[] {
  return [...SUPPORTED_STOCKS];
}

async function callIndianStockAPI(endpoint: string, params: Record<string, any> = {}): Promise<any> {
  const url = new URL(endpoint, INDIAN_STOCK_API_BASE_URL);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-API-KEY': INDIAN_STOCK_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`❌ API Error:`, error?.message || error);
    throw new Error(`API Error: ${error?.message || error}`);
  }
}

// Utility functions
function formatCurrency(value: any): string {
  const num = parseFloat(value);
  if (isNaN(num)) return 'N/A';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getCurrentIST(): string {
  return new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export async function handleGetStockData(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols or try variations like company names.`
        }]
      };
    }
    
    const stockData = await callIndianStockAPI('/stock', { name: normalizedSymbol });
    
    if (stockData && typeof stockData === 'object') {
      // Extract the actual stock details from the response
      const stockDetails = stockData.stockDetailsReusableData || {};
      
      // Create structured analysis
      const changePercent = parseFloat(stockDetails.percentChange) || 0;
      const currentPrice = parseFloat(stockDetails.price) || 0;
      const netChange = parseFloat(stockDetails.netChange) || (currentPrice - parseFloat(stockDetails.close || currentPrice));
      
      // Generate AI recommendation
      const recommendation = generateRecommendation(changePercent, []);
      
      const structuredAnalysis: StructuredAnalysis = {
        metadata: {
          symbol: normalizedSymbol,
          timestamp: getCurrentIST(),
          analysisType: "Real-time Stock Analysis",
          dataSource: "Indian Stock API"
        },
        summary: {
          recommendation: recommendation.recommendation,
          confidence: recommendation.confidence,
          riskLevel: recommendation.riskLevel,
          keyInsights: [
            `Current price trending ${changePercent > 0 ? 'upward' : changePercent < 0 ? 'downward' : 'sideways'}`,
            `${Math.abs(changePercent).toFixed(2)}% ${changePercent > 0 ? 'gain' : 'loss'} in current session`,
            `Market Cap: ₹${stockDetails.marketCap || 'N/A'} crores`,
            `Price range: ${formatCurrency(stockDetails.low || 0)} - ${formatCurrency(stockDetails.high || 0)}`
          ]
        },
        metrics: {
          current_price: currentPrice,
          price_change: netChange || 'N/A',
          percent_change: `${stockDetails.percentChange || 'N/A'}%`,
          day_high: stockDetails.high || 'N/A',
          day_low: stockDetails.low || 'N/A',
          volume: 'N/A', // Volume not available in this response
          company_name: stockDetails.companyName || normalizedSymbol,
          market_cap: stockDetails.marketCap || 'N/A',
          pe_ratio: stockDetails.pPerEBasicExcludingExtraordinaryItemsTTM || 'N/A'
        },
        technical: {
          trend: changePercent > 5 ? "Strong Uptrend" : 
                 changePercent > 0 ? "Positive" : 
                 changePercent > -5 ? "Negative" : "Strong Downtrend",
          signals: [
            changePercent > 0 ? "🟢 Positive momentum" : "🔴 Negative momentum",
            `📊 Trading at ${((currentPrice / (parseFloat(stockDetails.high) || currentPrice)) * 100).toFixed(1)}% of day high`,
            `📈 YTD Performance: ${stockDetails.priceYTDPricePercentChange || 'N/A'}%`
          ]
        },
        fundamental: {
          valuation: stockDetails.pPerEBasicExcludingExtraordinaryItemsTTM ? 
            (parseFloat(stockDetails.pPerEBasicExcludingExtraordinaryItemsTTM) > 25 ? "Expensive" : 
             parseFloat(stockDetails.pPerEBasicExcludingExtraordinaryItemsTTM) > 15 ? "Fair" : "Undervalued") : "N/A",
          financialHealth: "Data pending historical analysis",
          growthProspects: changePercent > 10 ? "Strong growth momentum" : 
                          changePercent > 0 ? "Positive outlook" : "Cautious outlook"
        }
      };
      
      const formattedResponse = formatStructuredAnalysis(structuredAnalysis);
      
      return {
        content: [{
          type: 'text',
          text: formattedResponse
        }]
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: `❌ No data available for symbol: ${normalizedSymbol}`
        }]
      };
    }

  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting stock data: ${error.message}`
      }]
    };
  }
}

export async function handleGetMultipleStocks(params: any): Promise<McpResponse> {
  try {
    const symbols = params.symbols;
    
    if (!symbols) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbols parameter is required'
        }]
      };
    }
    
    const symbolArray = typeof symbols === 'string' ? symbols.split(',') : symbols;
    
    let analysis = `📈 **MULTIPLE STOCKS ANALYSIS**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    for (const symbol of symbolArray.slice(0, 5)) { // Limit to 5 stocks
      try {
        const stockData = await callIndianStockAPI('/stock', { name: symbol.trim() });
        const stockDetails = stockData.stockDetailsReusableData || {};
        const price = stockDetails.price || 'N/A';
        const changePercent = stockDetails.percentChange || 'N/A';
        analysis += `🔹 **${symbol.trim().toUpperCase()}**: ${formatCurrency(price)} `;
        analysis += `(${changePercent}%)\n`;
      } catch {
        analysis += `🔹 **${symbol.trim().toUpperCase()}**: Data not available\n`;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting multiple stocks data: ${error.message}`
      }]
    };
  }
}

export async function handleSearchStocks(params: any): Promise<McpResponse> {
  const query = params.query || '';
  
  if (!query || query.length < 2) {
    return {
      content: [{
        type: 'text',
        text: `🔍 **STOCK SEARCH**\n\n❌ Please provide a search query with at least 2 characters.\n\nExample: "TATA", "Banking", "Pharma", etc.`
      }]
    };
  }
  
  try {
    const allStocks = getSupportedStocksList();
    const searchTerm = query.toUpperCase().trim();
    
    // Smart search: exact match, partial match, and industry keywords
    const matches = allStocks.filter((stock: string) => {
      return stock.includes(searchTerm) || 
             stock.startsWith(searchTerm) || 
             searchTerm.includes(stock);
    });
    
    // Industry-based search
    const industryMatches: Record<string, string[]> = {
      'BANKING': ['HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK', 'FEDERALBNK', 'YESBANK', 'RBLBANK', 'BANDHANBNK'],
      'IT': ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM', 'MINDTREE', 'MPHASIS', 'LTTS', 'PERSISTENT', 'COFORGE'],
      'PHARMA': ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'LUPIN', 'BIOCON', 'TORNTPHARM', 'CADILAHC', 'ZYDUSLIFE', 'AUROPHARMA', 'GLENMARK'],
      'AUTO': ['MARUTI', 'TATAMOTORS', 'MAHINDRA', 'BAJAJ-AUTO', 'HEROMOTOCO', 'EICHERMOT', 'ASHOKLEY', 'ESCORTS', 'MRF', 'APOLLOTYRE'],
      'FMCG': ['HINDUNILVR', 'ITC', 'NESTLEIND', 'BRITANNIA', 'DABUR', 'MARICO', 'GODREJCP', 'EMAMI', 'COLPAL', 'VBL'],
      'ENERGY': ['RELIANCE', 'ONGC', 'IOC', 'BPCL', 'GAIL', 'NTPC', 'POWERGRID', 'COALINDIA', 'ADANIGREEN', 'ADANIPOWER'],
      'METALS': ['TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL', 'HINDZINC', 'COALINDIA', 'NMDC', 'SAIL', 'NATIONALUM', 'JINDALSTEL']
    };
    
    let industryResults: string[] = [];
    for (const [industry, stocks] of Object.entries(industryMatches)) {
      if (industry.includes(searchTerm) || searchTerm.includes(industry.substring(0, 4))) {
        industryResults = [...industryResults, ...stocks];
        break;
      }
    }
    
    const finalMatches = [...new Set([...matches, ...industryResults])].slice(0, 20);
    
    let analysis = `🔍 **STOCK SEARCH**: "${query}"\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (finalMatches.length > 0) {
      analysis += `📊 **Found ${finalMatches.length} matches:**\n\n`;
      finalMatches.forEach((stock, index) => {
        analysis += `${index + 1}. **${stock}**\n`;
      });
      analysis += `\n💡 **Use get_stock_data with any symbol above for detailed analysis**`;
    } else {
      analysis += `❌ No stocks found matching "${query}".\n\n`;
      analysis += `💡 **Try searching for:**\n`;
      analysis += `• Company names: "TATA", "RELIANCE", "HDFC"\n`;
      analysis += `• Sectors: "BANKING", "IT", "PHARMA", "AUTO"\n`;
      analysis += `• Use get_supported_stocks to see all available symbols`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error searching stocks: ${error.message}`
      }]
    };
  }
}

export async function handleGetTopGainers(params: any): Promise<McpResponse> {
  try {
    const trendingData = await callIndianStockAPI('/trending');
    const topGainers = trendingData.trending_stocks?.top_gainers || [];
    
    let analysis = `📈 **TOP GAINERS**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    topGainers.slice(0, 10).forEach((stock: any, index: number) => {
      analysis += `${index + 1}. 📈 **${stock.company_name}**\n`;
      analysis += `   💰 Price: ${formatCurrency(stock.price)} | ✅ Change: +${stock.percent_change}%\n\n`;
    });
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting top gainers: ${error.message}`
      }]
    };
  }
}

export async function handleGetTopLosers(params: any): Promise<McpResponse> {
  try {
    const trendingData = await callIndianStockAPI('/trending');
    const topLosers = trendingData.trending_stocks?.top_losers || [];
    
    let analysis = `📉 **TOP LOSERS**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    topLosers.slice(0, 10).forEach((stock: any, index: number) => {
      analysis += `${index + 1}. 📉 **${stock.company_name}**\n`;
      analysis += `   💰 Price: ${formatCurrency(stock.price)} | ❌ Change: ${stock.percent_change}%\n\n`;
    });
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error getting top losers: ${error.message}`
      }]
    };
  }
}

export async function handleGetStocksBySector(params: any): Promise<McpResponse> {
  const sector = (params.sector || '').toUpperCase().trim();
  
  if (!sector) {
    return {
      content: [{
        type: 'text',
        text: '❌ Sector parameter is required. Available sectors: BANKING, IT, PHARMA, AUTO, FMCG, ENERGY, METALS, TELECOM'
      }]
    };
  }
  
  // Define sector mappings based on our stock database
  const sectorMappings: { [key: string]: string[] } = {
    'BANKING': [
      'HDFCBANK', 'ICICIBANK', 'SBIN', 'AXISBANK', 'KOTAKBANK', 'INDUSINDBK',
      'FEDERALBNK', 'YESBANK', 'RBLBANK', 'BANDHANBNK', 'PNB', 'BANKBARODA',
      'IDFCFIRSTB', 'IDFC'
    ],
    'IT': [
      'TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM', 'MINDTREE', 'MPHASIS',
      'LTTS', 'PERSISTENT', 'COFORGE', 'CYIENT', 'INTELLECT', 'KPITTECH',
      'SONATSOFTW', 'HAPPIESTMINDS', 'NEWGEN'
    ],
    'PHARMA': [
      'SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB', 'LUPIN', 'BIOCON',
      'TORNTPHARM', 'CADILAHC', 'ZYDUSLIFE', 'MANKIND', 'ALKEM', 'GLENMARK',
      'AUROPHARMA', 'ABBOTINDIA', 'PFIZER'
    ],
    'AUTO': [
      'MARUTI', 'TATAMOTORS', 'MAHINDRA', 'BAJAJ-AUTO', 'EICHERMOT',
      'HEROMOTOCO', 'ESCORTS', 'ASHOKLEY', 'MRF', 'APOLLOTYRE', 'CEAT',
      'BOSCHLTD', 'MOTHERSUMI', 'EXIDEIND', 'AMARARAJA'
    ],
    'FMCG': [
      'HINDUUNILVR', 'ITC', 'BRITANNIA', 'NESTLEIND', 'DABUR', 'GODREJCP',
      'MARICO', 'COLPAL', 'EMAMI', 'VBL', 'TATACONSUM'
    ],
    'ENERGY': [
      'RELIANCE', 'ONGC', 'BPCL', 'IOC', 'POWERGRID', 'NTPC', 'COALINDIA',
      'TATAPOWER', 'ADANIGREEN', 'ADANIENT'
    ],
    'METALS': [
      'TATASTEEL', 'JSWSTEEL', 'HINDALCO', 'VEDL', 'HINDZINC', 'NMDC',
      'JINDALSTEL', 'SAIL', 'NATIONALUM', 'WELCORP', 'RATNAMANI'
    ],
    'TELECOM': [
      'BHARTIARTL', 'JIOTELECOM', 'VODAIDEACELL'
    ],
    'FINANCIAL': [
      'BAJFINANCE', 'BAJAJFINSV', 'HDFCLIFE', 'ICICIPRULI', 'SBILIFE',
      'LICHSGFIN', 'CANFINHOME', 'STAR', 'ANGELONE', 'CDSL', 'CAMS'
    ]
  };
  
  const matchingSector = Object.keys(sectorMappings).find(s => 
    s === sector || s.includes(sector) || sector.includes(s)
  );
  
  if (!matchingSector) {
    return {
      content: [{
        type: 'text',
        text: `❌ Sector "${sector}" not found. Available sectors:\n• BANKING - Banking and Financial Services\n• IT - Information Technology\n• PHARMA - Pharmaceuticals\n• AUTO - Automotive\n• FMCG - Fast Moving Consumer Goods\n• ENERGY - Energy and Oil & Gas\n• METALS - Metals and Mining\n• TELECOM - Telecommunications\n• FINANCIAL - Non-Banking Financial Services`
      }]
    };
  }
  
  const sectorStocks = sectorMappings[matchingSector];
  const availableStocks = sectorStocks.filter(stock => SUPPORTED_STOCKS.includes(stock));
  
  let analysis = `🏭 **${matchingSector} SECTOR STOCKS**\n`;
  analysis += `⏰ **Updated**: ${getCurrentIST()}\n`;
  analysis += `📊 **Found**: ${availableStocks.length} stocks\n\n`;
  
  if (availableStocks.length > 0) {
    analysis += `📋 **STOCKS IN ${matchingSector} SECTOR:**\n\n`;
    
    availableStocks.forEach((stock, index) => {
      analysis += `${index + 1}. **${stock}**\n`;
    });
    
    analysis += `\n💡 **Use get_stock_data with any symbol above for detailed analysis**\n`;
    analysis += `💡 **Use get_historical_analysis for price trends and technical analysis**`;
    
    // Add sector insights
    if (matchingSector === 'BANKING') {
      analysis += `\n\n📈 **Sector Insights**: Banking sector is interest-rate sensitive. Monitor RBI policy changes.`;
    } else if (matchingSector === 'IT') {
      analysis += `\n\n📈 **Sector Insights**: IT sector benefits from digital transformation and export revenues.`;
    } else if (matchingSector === 'PHARMA') {
      analysis += `\n\n📈 **Sector Insights**: Pharma sector driven by domestic demand and export opportunities.`;
    } else if (matchingSector === 'AUTO') {
      analysis += `\n\n📈 **Sector Insights**: Auto sector influenced by rural demand, fuel prices, and EV transition.`;
    } else if (matchingSector === 'ENERGY') {
      analysis += `\n\n📈 **Sector Insights**: Energy sector tied to oil prices, renewable energy policies, and global demand.`;
    }
  } else {
    analysis += `❌ **No stocks found in ${matchingSector} sector in current database**`;
  }
  
  return {
    content: [{
      type: 'text',
      text: analysis
    }]
  };
}

export async function handleGetStocksByMarketCap(params: any): Promise<McpResponse> {
  const category = (params.category || '').toLowerCase().trim();
  
  if (!category) {
    return {
      content: [{
        type: 'text',
        text: '❌ Category parameter is required. Available categories: large_cap, mid_cap, small_cap'
      }]
    };
  }
  
  // Define market cap mappings based on typical classifications
  const marketCapMappings: { [key: string]: string[] } = {
    'large_cap': [
      // Top 100 stocks by market cap
      'RELIANCE', 'TCS', 'INFY', 'HDFC', 'HDFCBANK', 'ICICIBANK', 'KOTAKBANK',
      'LT', 'SBIN', 'BHARTIARTL', 'ITC', 'BAJFINANCE', 'ASIANPAINT', 'HCLTECH',
      'AXISBANK', 'MARUTI', 'TITAN', 'NESTLEIND', 'ULTRACEMCO', 'SUNPHARMA',
      'WIPRO', 'TATAMOTORS', 'TATASTEEL', 'TECHM', 'POWERGRID', 'NTPC',
      'ONGC', 'COALINDIA', 'HINDALCO', 'DRREDDY', 'CIPLA', 'BRITANNIA',
      'BAJAJFINSV', 'EICHERMOT', 'HEROMOTOCO', 'BAJAJ-AUTO', 'ADANIENT'
    ],
    'mid_cap': [
      // 101-250 rank stocks
      'INDUSINDBK', 'FEDERALBNK', 'YESBANK', 'BANDHANBNK', 'LUPIN', 'BIOCON',
      'TORNTPHARM', 'MAHINDRA', 'ESCORTS', 'DABUR', 'GODREJCP', 'MARICO',
      'MINDTREE', 'MPHASIS', 'LTTS', 'PERSISTENT', 'COFORGE', 'VEDL',
      'JSWSTEEL', 'HINDZINC', 'NMDC', 'BPCL', 'IOC', 'TATAPOWER'
    ],
    'small_cap': [
      // Below 250 rank stocks
      'RBLBANK', 'PNB', 'BANKBARODA', 'CADILAHC', 'ZYDUSLIFE', 'MANKIND',
      'ALKEM', 'GLENMARK', 'AUROPHARMA', 'CEAT', 'BOSCHLTD', 'MOTHERSUMI',
      'ASHOKLEY', 'EXIDEIND', 'AMARARAJA', 'COLPAL', 'EMAMI', 'VBL',
      'CYIENT', 'INTELLECT', 'KPITTECH', 'SONATSOFTW', 'HAPPIESTMINDS'
    ]
  };
  
  const validCategories = ['large_cap', 'mid_cap', 'small_cap'];
  
  if (!validCategories.includes(category)) {
    return {
      content: [{
        type: 'text',
        text: `❌ Invalid category "${category}". Available categories: large_cap, mid_cap, small_cap`
      }]
    };
  }
  
  const categoryStocks = marketCapMappings[category];
  const availableStocks = categoryStocks.filter(stock => SUPPORTED_STOCKS.includes(stock));
  
  let analysis = `💰 **${category.toUpperCase().replace('_', '-')} STOCKS**\n`;
  analysis += `⏰ **Updated**: ${getCurrentIST()}\n`;
  analysis += `📊 **Found**: ${availableStocks.length} stocks\n\n`;
  
  if (availableStocks.length > 0) {
    analysis += `📋 **${category.toUpperCase().replace('_', '-')} STOCKS:**\n\n`;
    
    // Show first 20 stocks for readability
    const displayStocks = availableStocks.slice(0, 20);
    
    displayStocks.forEach((stock, index) => {
      analysis += `${index + 1}. **${stock}**\n`;
    });
    
    if (availableStocks.length > 20) {
      analysis += `\n... and ${availableStocks.length - 20} more stocks!\n`;
      analysis += `💡 Use search_stocks to find specific stocks in this category\n`;
    }
    
    analysis += `\n💡 **Use get_stock_data with any symbol above for detailed analysis**\n`;
    
    // Add market cap insights
    if (category === 'large_cap') {
      analysis += `\n📈 **Investment Profile**: Large-cap stocks offer stability, lower volatility, and steady dividend yields. Suitable for conservative investors.`;
    } else if (category === 'mid_cap') {
      analysis += `\n📈 **Investment Profile**: Mid-cap stocks offer growth potential with moderate risk. Good balance of growth and stability.`;
    } else if (category === 'small_cap') {
      analysis += `\n📈 **Investment Profile**: Small-cap stocks offer high growth potential but with higher volatility and risk. Suitable for aggressive investors.`;
    }
  } else {
    analysis += `❌ **No stocks found in ${category} category in current database**`;
  }
  
  return {
    content: [{
      type: 'text',
      text: analysis
    }]
  };
}

export async function handleGetSupportedStocks(params: any): Promise<McpResponse> {
  const allStocks = getSupportedStocksList();
  const limit = params.limit || 50; // Show first 50 by default, user can ask for more
  
  let analysis = `📋 **SUPPORTED STOCKS** (${allStocks.length} symbols total)\n`;
  analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
  
  analysis += `🔥 **Showing first ${Math.min(limit, allStocks.length)} stocks:**\n\n`;
  
  allStocks.slice(0, limit).forEach((symbol: string, index: number) => {
    analysis += `${index + 1}. ${symbol}\n`;
  });
  
  if (allStocks.length > limit) {
    analysis += `\n... and ${allStocks.length - limit} more stocks!\n`;
    analysis += `💡 Use search_stocks with industry keywords for targeted search:\n`;
    analysis += `• "BANKING" - Banking sector stocks\n`;
    analysis += `• "IT" - Technology stocks\n`;
    analysis += `• "PHARMA" - Pharmaceutical stocks\n`;
    analysis += `• "AUTO" - Automotive stocks\n`;
    analysis += `• Or search by company name like "TATA", "RELIANCE"\n`;
  }
  
  analysis += `\n💡 **Use get_stock_data with any symbol above for detailed analysis**`;
  
  return {
    content: [{
      type: 'text',
      text: analysis
    }]
  };
}

// Historical Data Handlers

export async function handleGetQuarterlyResults(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const quarterlyData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'quarter_results' });
    
    let analysis = `📈 **QUARTERLY RESULTS: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (quarterlyData && typeof quarterlyData === 'object') {
      const sales = quarterlyData.Sales || {};
      const netProfit = quarterlyData['Net Profit'] || {};
      const eps = quarterlyData['EPS in Rs'] || {};
      const opm = quarterlyData['OPM %'] || {};
      
      const quarters = Object.keys(sales).slice(-8); // Get last 8 quarters
      
      if (quarters.length > 0) {
        quarters.forEach((quarter: string, index: number) => {
          analysis += `📊 **${quarter}**\n`;
          analysis += `💰 **Revenue**: ${formatCurrency(sales[quarter] * 10000000 || 0)} (₹${sales[quarter]?.toFixed(0)} Cr)\n`; // Convert to actual amount
          analysis += `💵 **Net Profit**: ${formatCurrency(netProfit[quarter] * 10000000 || 0)} (₹${netProfit[quarter]?.toFixed(0)} Cr)\n`;
          analysis += `📈 **EPS**: ₹${eps[quarter] || 'N/A'}\n`;
          analysis += `📊 **OPM**: ${opm[quarter] || 'N/A'}%\n`;
          
          // Calculate growth if previous quarter exists
          const prevQuarterIndex = quarters.indexOf(quarter) - 1;
          if (prevQuarterIndex >= 0) {
            const prevQuarter = quarters[prevQuarterIndex];
            const currentRevenue = sales[quarter] || 0;
            const prevRevenue = sales[prevQuarter] || 0;
            const growth = prevRevenue > 0 ? (((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(2) : 'N/A';
            analysis += `🔄 **QoQ Growth**: ${growth}%\n`;
          }
          
          analysis += `\n`;
        });
        
        // Add summary insights
        const latestQuarter = quarters[quarters.length - 1];
        const latestRevenue = sales[latestQuarter];
        const latestProfit = netProfit[latestQuarter];
        const latestEPS = eps[latestQuarter];
        
        analysis += `📝 **Key Insights**:\n`;
        analysis += `• Latest Quarter Revenue: ₹${latestRevenue?.toFixed(0)} Crores\n`;
        analysis += `• Latest Quarter Profit: ₹${latestProfit?.toFixed(0)} Crores\n`;
        analysis += `• Latest EPS: ₹${latestEPS}\n`;
        analysis += `• Showing ${quarters.length} quarters of financial performance`;
      } else {
        analysis += `❌ **No quarterly data available for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No quarterly data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching quarterly results**: ${error.message}`
      }]
    };
  }
}

export async function handleGetYearlyResults(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const yearlyData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'yoy_results' });
    
    let analysis = `📊 **YEARLY RESULTS (YOY): ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (yearlyData && typeof yearlyData === 'object' && !Array.isArray(yearlyData)) {
      // Extract sales data to get periods
      const salesData = yearlyData.Sales || {};
      const netProfitData = yearlyData['Net Profit'] || {};
      const epsData = yearlyData['EPS in Rs'] || {};
      const expensesData = yearlyData.Expenses || {};
      const opProfitData = yearlyData['Operating Profit'] || {};
      const opmData = yearlyData['OPM %'] || {};
      
      const periods = Object.keys(salesData);
      const recentPeriods = periods.slice(-6); // Last 6 years
      
      if (recentPeriods.length > 0) {
        recentPeriods.forEach((period, index) => {
          const sales = salesData[period] || 0;
          const netProfit = netProfitData[period] || 0;
          const eps = epsData[period] || 0;
          const expenses = expensesData[period] || 0;
          const opProfit = opProfitData[period] || 0;
          const opm = opmData[period] || 0;
          
          // Calculate YoY growth if previous year exists
          const prevPeriodIndex = periods.indexOf(period) - 1;
          const prevPeriod = prevPeriodIndex >= 0 ? periods[prevPeriodIndex] : null;
          const prevSales = prevPeriod ? salesData[prevPeriod] : 0;
          const yoyGrowth = prevSales > 0 ? (((sales - prevSales) / prevSales) * 100).toFixed(2) : 'N/A';
          
          analysis += `📈 **${period}**\n`;
          analysis += `💰 **Revenue**: ${formatCurrency(sales)}\n`;
          analysis += `💵 **Net Profit**: ${formatCurrency(netProfit)}\n`;
          analysis += `📈 **EPS**: ₹${eps}\n`;
          analysis += `📊 **Operating Profit**: ${formatCurrency(opProfit)}\n`;
          analysis += `⚡ **OPM**: ${opm}%\n`;
          analysis += `� **YoY Revenue Growth**: ${yoyGrowth}%\n\n`;
        });
        
        // Calculate recent trends
        const latestPeriod = recentPeriods[recentPeriods.length - 1];
        const prevPeriod = recentPeriods[recentPeriods.length - 2];
        const latestSales = salesData[latestPeriod];
        const prevSales = prevPeriod ? salesData[prevPeriod] : 0;
        const recentGrowth = prevSales > 0 ? (((latestSales - prevSales) / prevSales) * 100).toFixed(2) : 'N/A';
        
        analysis += `📝 **Key Insights**:\n`;
        analysis += `🔹 Latest Revenue Growth: ${recentGrowth}%\n`;
        analysis += `🔹 Current EPS: ₹${epsData[latestPeriod] || 'N/A'}\n`;
        analysis += `🔹 Operating Margin: ${opmData[latestPeriod] || 'N/A'}%\n`;
        analysis += `🔹 Years of Data: ${recentPeriods.length}\n`;
      } else {
        analysis += `❌ **No yearly data periods found for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No yearly data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching yearly results**: ${error.message}`
      }]
    };
  }
}

export async function handleGetBalanceSheet(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const balanceSheetData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'balancesheet' });
    
    let analysis = `💼 **BALANCE SHEET: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (balanceSheetData && typeof balanceSheetData === 'object') {
      const totalAssets = balanceSheetData['Total Assets'] || {};
      const totalLiabilities = balanceSheetData['Total Liabilities'] || {};
      const equityCapital = balanceSheetData['Equity Capital'] || {};
      const reserves = balanceSheetData['Reserves'] || {};
      const borrowings = balanceSheetData['Borrowings'] || {};
      const fixedAssets = balanceSheetData['Fixed Assets'] || {};
      const investments = balanceSheetData['Investments'] || {};
      
      const periods = Object.keys(totalAssets).slice(-3); // Get last 3 periods
      
      if (periods.length > 0) {
        const latestPeriod = periods[periods.length - 1];
        const latestAssets = totalAssets[latestPeriod];
        const latestLiabilities = totalLiabilities[latestPeriod];
        const latestEquity = equityCapital[latestPeriod];
        const latestReserves = reserves[latestPeriod];
        const latestBorrowings = borrowings[latestPeriod];
        const latestFixedAssets = fixedAssets[latestPeriod];
        const latestInvestments = investments[latestPeriod];
        
        analysis += `🏦 **ASSETS (${latestPeriod})**\n`;
        analysis += `💰 **Total Assets**: ${formatCurrency(latestAssets * 10000000)} (₹${latestAssets} Cr)\n`;
        analysis += `🏭 **Fixed Assets**: ${formatCurrency(latestFixedAssets * 10000000)} (₹${latestFixedAssets} Cr)\n`;
        analysis += `� **Investments**: ${formatCurrency(latestInvestments * 10000000)} (₹${latestInvestments} Cr)\n\n`;
        
        analysis += `📋 **LIABILITIES & EQUITY**\n`;
        analysis += `💳 **Total Liabilities**: ${formatCurrency(latestLiabilities * 10000000)} (₹${latestLiabilities} Cr)\n`;
        analysis += `�️ **Equity Capital**: ${formatCurrency(latestEquity * 10000000)} (₹${latestEquity} Cr)\n`;
        analysis += `📊 **Reserves**: ${formatCurrency(latestReserves * 10000000)} (₹${latestReserves} Cr)\n`;
        analysis += `� **Borrowings**: ${formatCurrency(latestBorrowings * 10000000)} (₹${latestBorrowings} Cr)\n\n`;
        
        // Calculate key ratios
        const totalEquity = (latestEquity || 0) + (latestReserves || 0);
        const debtEquityRatio = latestBorrowings && totalEquity ? (latestBorrowings / totalEquity).toFixed(2) : 'N/A';
        const assetGrowth = periods.length > 1 ? 
          (((latestAssets - totalAssets[periods[periods.length - 2]]) / totalAssets[periods[periods.length - 2]]) * 100).toFixed(2) : 'N/A';
        
        analysis += `📈 **KEY METRICS**\n`;
        analysis += `🎯 **Debt-to-Equity**: ${debtEquityRatio}\n`;
        analysis += `📈 **Asset Growth**: ${assetGrowth}% YoY\n`;
        analysis += `💪 **Equity Ratio**: ${totalEquity && latestAssets ? ((totalEquity / latestAssets) * 100).toFixed(2) : 'N/A'}%\n`;
        analysis += `📅 **Period**: ${latestPeriod}\n\n`;
        
        // Add trend analysis
        if (periods.length > 1) {
          analysis += `📊 **TREND ANALYSIS**:\n`;
          analysis += `• Assets grew from ₹${totalAssets[periods[0]]} Cr to ₹${latestAssets} Cr\n`;
          analysis += `• Borrowings: ₹${borrowings[latestPeriod]} Cr\n`;
          analysis += `• Strong balance sheet with ${((totalEquity / latestAssets) * 100).toFixed(1)}% equity ratio\n`;
        }
        
        analysis += `\n📝 **Analysis**: Balance sheet shows ${assetGrowth !== 'N/A' && parseFloat(assetGrowth) > 0 ? 'growing' : 'stable'} financial position and capital structure health.`;
      } else {
        analysis += `❌ **No balance sheet data available for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No balance sheet data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching balance sheet**: ${error.message}`
      }]
    };
  }
}

export async function handleGetCashflowStatement(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const cashflowData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'cashflow' });
    
    let analysis = `💰 **CASH FLOW STATEMENT: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (cashflowData && typeof cashflowData === 'object' && !Array.isArray(cashflowData)) {
      const operatingData = cashflowData['Cash from Operating Activity'] || {};
      const investingData = cashflowData['Cash from Investing Activity'] || {};
      const financingData = cashflowData['Cash from Financing Activity'] || {};
      const netCashData = cashflowData['Net Cash Flow'] || {};
      
      const periods = Object.keys(operatingData);
      const recentPeriods = periods.slice(-4); // Last 4 years
      
      if (recentPeriods.length > 0) {
        recentPeriods.forEach((period) => {
          const operatingCash = operatingData[period] || 0;
          const investingCash = investingData[period] || 0;
          const financingCash = financingData[period] || 0;
          const netCash = netCashData[period] || 0;
          
          analysis += `📅 **${period}**\n`;
          analysis += `🏭 **Operating Cash Flow**: ${formatCurrency(operatingCash)}\n`;
          analysis += `� **Investing Cash Flow**: ${formatCurrency(investingCash)}\n`;
          analysis += `🏦 **Financing Cash Flow**: ${formatCurrency(financingCash)}\n`;
          analysis += `� **Net Cash Flow**: ${formatCurrency(netCash)}\n\n`;
        });
        
        // Latest period analysis
        const latestPeriod = recentPeriods[recentPeriods.length - 1];
        const latestOperating = operatingData[latestPeriod];
        const latestInvesting = investingData[latestPeriod];
        const latestFinancing = financingData[latestPeriod];
        const latestNet = netCashData[latestPeriod];
        
        analysis += `📊 **KEY INSIGHTS**\n`;
        analysis += `� Latest Operating Cash Flow: ${formatCurrency(latestOperating)}\n`;
        analysis += `� Free Cash Flow: ${formatCurrency(latestOperating + latestInvesting)}\n`;
        analysis += `� Cash Generation: ${latestOperating > 0 ? '✅ Positive' : '❌ Negative'}\n`;
        analysis += `� Investment Activity: ${latestInvesting < 0 ? '📈 Expanding' : '💰 Divesting'}\n`;
        analysis += `� Overall Cash Position: ${latestNet > 0 ? '📈 Improving' : '📉 Declining'}\n`;
      } else {
        analysis += `❌ **No cash flow periods found for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No cash flow data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching cash flow statement**: ${error.message}`
      }]
    };
  }
}

export async function handleGetFinancialRatios(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const ratiosData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'ratios' });
    
    let analysis = `📊 **FINANCIAL RATIOS: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (ratiosData && typeof ratiosData === 'object' && !Array.isArray(ratiosData)) {
      // Extract ratio data
      const debtorDaysData = ratiosData['Debtor Days'] || {};
      const inventoryDaysData = ratiosData['Inventory Days'] || {};
      const payableDaysData = ratiosData['Days Payable'] || {};
      const cashConversionData = ratiosData['Cash Conversion Cycle'] || {};
      const workingCapitalData = ratiosData['Working Capital Days'] || {};
      const roceData = ratiosData['ROCE %'] || {};
      
      const periods = Object.keys(debtorDaysData);
      const recentPeriods = periods.slice(-4); // Last 4 years
      
      if (recentPeriods.length > 0) {
        recentPeriods.forEach((period) => {
          const debtorDays = debtorDaysData[period] || 0;
          const inventoryDays = inventoryDaysData[period] || 0;
          const payableDays = payableDaysData[period] || 0;
          const cashCycle = cashConversionData[period] || 0;
          const workingCapDays = workingCapitalData[period] || 0;
          const roce = roceData[period] || 0;
          
          analysis += `� **${period}**\n`;
          analysis += `📈 **ROCE**: ${roce}%\n`;
          analysis += `� **Debtor Days**: ${debtorDays}\n`;
          analysis += `📦 **Inventory Days**: ${inventoryDays}\n`;
          analysis += `� **Payable Days**: ${payableDays}\n`;
          analysis += `� **Cash Conversion Cycle**: ${cashCycle} days\n`;
          analysis += `📊 **Working Capital Days**: ${workingCapDays}\n\n`;
        });
        
        // Latest period insights
        const latestPeriod = recentPeriods[recentPeriods.length - 1];
        const latestROCE = roceData[latestPeriod];
        const latestCashCycle = cashConversionData[latestPeriod];
        const latestDebtorDays = debtorDaysData[latestPeriod];
        
        analysis += `� **KEY INSIGHTS**:\n`;
        analysis += `� Current ROCE: ${latestROCE}%\n`;
        analysis += `🔹 Cash Conversion: ${latestCashCycle} days\n`;
        analysis += `� Collection Period: ${latestDebtorDays} days\n`;
        analysis += `� Efficiency: ${latestCashCycle < 0 ? '✅ Excellent' : latestCashCycle < 30 ? '✅ Good' : '⚠️ Needs Improvement'}\n`;
      } else {
        analysis += `❌ **No financial ratios periods found for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No financial ratios data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching financial ratios**: ${error.message}`
      }]
    };
  }
}

export async function handleGetShareholdingQuarterly(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const shareholdingData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'shareholding_pattern_quarterly' });
    
    let analysis = `📊 **QUARTERLY SHAREHOLDING PATTERN: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (shareholdingData && typeof shareholdingData === 'object' && !Array.isArray(shareholdingData)) {
      const promotersData = shareholdingData.Promoters || {};
      const fiiData = shareholdingData.FIIs || {};
      const diiData = shareholdingData.DIIs || {};
      const governmentData = shareholdingData.Government || {};
      const publicData = shareholdingData.Public || {};
      const shareholdersData = shareholdingData['No. of Shareholders'] || {};
      
      const periods = Object.keys(promotersData);
      const recentPeriods = periods.slice(-6); // Last 6 quarters
      
      if (recentPeriods.length > 0) {
        recentPeriods.forEach((period) => {
          const promoters = promotersData[period] || 0;
          const fii = fiiData[period] || 0;
          const dii = diiData[period] || 0;
          const government = governmentData[period] || 0;
          const publicShare = publicData[period] || 0;
          const shareholders = shareholdersData[period] || 0;
          
          analysis += `📅 **${period}**\n`;
          analysis += `🏛️ **Promoters**: ${promoters}%\n`;
          analysis += `🌍 **FIIs**: ${fii}%\n`;
          analysis += `🇮🇳 **DIIs**: ${dii}%\n`;
          analysis += `🏛️ **Government**: ${government}%\n`;
          analysis += `👥 **Public**: ${publicShare}%\n`;
          analysis += `📊 **Total Shareholders**: ${shareholders.toLocaleString()}\n\n`;
        });
        
        // Calculate trends
        const latestPeriod = recentPeriods[recentPeriods.length - 1];
        const prevPeriod = recentPeriods[recentPeriods.length - 2];
        
        if (prevPeriod) {
          const promoterChange = promotersData[latestPeriod] - promotersData[prevPeriod];
          const fiiChange = fiiData[latestPeriod] - fiiData[prevPeriod];
          const diiChange = diiData[latestPeriod] - diiData[prevPeriod];
          
          analysis += `📈 **QUARTERLY CHANGES**:\n`;
          analysis += `� Promoter Change: ${promoterChange > 0 ? '+' : ''}${promoterChange}%\n`;
          analysis += `� FII Change: ${fiiChange > 0 ? '+' : ''}${fiiChange}%\n`;
          analysis += `🔹 DII Change: ${diiChange > 0 ? '+' : ''}${diiChange}%\n`;
          analysis += `� Current Shareholding Quality: ${diiData[latestPeriod] > 15 && promotersData[latestPeriod] > 45 ? '✅ Strong' : '⚠️ Monitor'}\n`;
        }
      } else {
        analysis += `❌ **No quarterly shareholding periods found for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No quarterly shareholding data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching quarterly shareholding pattern**: ${error.message}`
      }]
    };
  }
}

export async function handleGetShareholdingYearly(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const shareholdingData = await callIndianStockAPI('/historical_stats', { stock_name: normalizedSymbol, stats: 'shareholding_pattern_yearly' });
    
    let analysis = `📈 **YEARLY SHAREHOLDING PATTERN: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n\n`;
    
    if (shareholdingData && typeof shareholdingData === 'object' && !Array.isArray(shareholdingData)) {
      const promotersData = shareholdingData.Promoters || {};
      const fiiData = shareholdingData.FIIs || {};
      const diiData = shareholdingData.DIIs || {};
      const governmentData = shareholdingData.Government || {};
      const publicData = shareholdingData.Public || {};
      const shareholdersData = shareholdingData['No. of Shareholders'] || {};
      
      const periods = Object.keys(promotersData);
      const recentPeriods = periods.slice(-5); // Last 5 years
      
      if (recentPeriods.length > 0) {
        recentPeriods.forEach((period) => {
          const promoters = promotersData[period] || 0;
          const fii = fiiData[period] || 0;
          const dii = diiData[period] || 0;
          const government = governmentData[period] || 0;
          const publicShare = publicData[period] || 0;
          const shareholders = shareholdersData[period] || 0;
          
          analysis += `📅 **${period}**\n`;
          analysis += `🏛️ **Promoters**: ${promoters}%\n`;
          analysis += `🌍 **FIIs**: ${fii}%\n`;
          analysis += `�🇳 **DIIs**: ${dii}%\n`;
          analysis += `🏛️ **Government**: ${government}%\n`;
          analysis += `� **Public**: ${publicShare}%\n`;
          analysis += `📊 **Shareholders**: ${shareholders.toLocaleString()}\n\n`;
        });
        
        // Calculate long-term trends
        const earliestPeriod = recentPeriods[0];
        const latestPeriod = recentPeriods[recentPeriods.length - 1];
        
        const promoterTrend = promotersData[latestPeriod] - promotersData[earliestPeriod];
        const fiiTrend = fiiData[latestPeriod] - fiiData[earliestPeriod];
        const diiTrend = diiData[latestPeriod] - diiData[earliestPeriod];
        
        analysis += `� **LONG-TERM TRENDS** (${recentPeriods.length} Years):\n`;
        analysis += `🔹 Promoter Trend: ${promoterTrend > 0 ? '+' : ''}${promoterTrend.toFixed(2)}%\n`;
        analysis += `🔹 FII Trend: ${fiiTrend > 0 ? '+' : ''}${fiiTrend.toFixed(2)}%\n`;
        analysis += `🔹 DII Trend: ${diiTrend > 0 ? '+' : ''}${diiTrend.toFixed(2)}%\n`;
        analysis += `� Ownership Stability: ${Math.abs(promoterTrend) < 2 ? '✅ Stable' : '⚠️ Changing'}\n`;
      } else {
        analysis += `❌ **No yearly shareholding periods found for ${normalizedSymbol}**`;
      }
    } else {
      analysis += `❌ **No yearly shareholding data available for ${normalizedSymbol}**`;
    }
    
    return {
      content: [{
        type: 'text',
        text: analysis
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching yearly shareholding pattern**: ${error.message}`
      }]
    };
  }
}

export async function handleGetHistoricalAnalysis(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    const period = params.period || '1yr';
    const filter = params.filter || 'price';
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }
    
    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }
    
    const historicalData = await callIndianStockAPI('/historical_data', { 
      stock_name: normalizedSymbol, 
      period: period,
      filter: filter 
    });
    
    let analysis = `📈 **HISTORICAL ANALYSIS: ${normalizedSymbol}**\n`;
    analysis += `⏰ **Updated**: ${getCurrentIST()}\n`;
    analysis += `📊 **Period**: ${period.toUpperCase()} | **Filter**: ${filter.toUpperCase()}\n\n`;
    
    if (historicalData && historicalData.datasets && Array.isArray(historicalData.datasets)) {
      const datasets = historicalData.datasets;
      
      // Extract key metrics for structured analysis
      const priceData = datasets.find((d: any) => d.metric === 'Price');
      const dma50Data = datasets.find((d: any) => d.metric === 'DMA50');
      const dma200Data = datasets.find((d: any) => d.metric === 'DMA200');
      const volumeData = datasets.find((d: any) => d.metric === 'Volume');
      
      if (priceData && priceData.values.length > 0) {
        const latestValue = priceData.values[priceData.values.length - 1];
        const oldestValue = priceData.values[0];
        const currentPrice = parseFloat(latestValue[1]);
        const oldPrice = parseFloat(oldestValue[1]);
        const change = currentPrice - oldPrice;
        const changePercent = ((change / oldPrice) * 100);
        
        const dma50 = dma50Data?.values[dma50Data.values.length - 1]?.[1];
        const dma200 = dma200Data?.values[dma200Data.values.length - 1]?.[1];
        
        // Generate technical signals
        const signals = generateTechnicalSignals(currentPrice, parseFloat(dma50), parseFloat(dma200));
        const recommendation = generateRecommendation(changePercent, signals);
        
        // Create structured historical analysis
        const structuredAnalysis: StructuredAnalysis = {
          metadata: {
            symbol: normalizedSymbol,
            timestamp: getCurrentIST(),
            analysisType: `Historical Technical Analysis (${period})`,
            dataSource: "Indian Stock API - Historical Data"
          },
          summary: {
            recommendation: recommendation.recommendation,
            confidence: recommendation.confidence,
            riskLevel: recommendation.riskLevel,
            keyInsights: [
              `${period} performance: ${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}% (${change > 0 ? '+' : ''}${formatCurrency(change)})`,
              `Current trading at ₹${currentPrice.toFixed(2)}`,
              `Price range: ${oldestValue[0]} to ${latestValue[0]}`,
              `Technical setup: ${signals.length > 0 ? signals[0].split(' ').slice(0, 3).join(' ') : 'Neutral'}`
            ]
          },
          metrics: {
            current_price: currentPrice,
            period_start_price: oldPrice,
            absolute_change: change,
            percent_change: `${changePercent.toFixed(2)}%`,
            dma_50: dma50 ? parseFloat(dma50) : 'N/A',
            dma_200: dma200 ? parseFloat(dma200) : 'N/A',
            period_range: `${oldestValue[0]} to ${latestValue[0]}`,
            data_points: priceData.values.length,
            average_volume: volumeData ? Math.round(volumeData.values.reduce((sum: number, val: any) => sum + (val[1] || 0), 0) / volumeData.values.length) : 'N/A'
          },
          technical: {
            trend: changePercent > 10 ? "Strong Uptrend" : 
                   changePercent > 0 ? "Uptrend" : 
                   changePercent > -10 ? "Downtrend" : "Strong Downtrend",
            signals: signals,
            support: dma200 ? parseFloat(dma200) : undefined,
            resistance: dma50 && dma200 ? Math.max(parseFloat(dma50), parseFloat(dma200)) : undefined
          },
          fundamental: {
            valuation: changePercent > 20 ? "Potentially Overvalued" : 
                      changePercent < -20 ? "Potentially Undervalued" : "Fair Value Range",
            financialHealth: "Based on price performance - detailed analysis pending",
            growthProspects: changePercent > 15 ? "Strong growth trajectory" : 
                            changePercent > 0 ? "Positive momentum" : 
                            changePercent > -15 ? "Challenging phase" : "Significant concerns"
          }
        };
        
        const formattedResponse = formatStructuredAnalysis(structuredAnalysis);
        
        return {
          content: [{
            type: 'text',
            text: formattedResponse
          }]
        };
      }
    }
    
    // Fallback for no data
    return {
      content: [{
        type: 'text',
        text: `❌ **No historical data available for ${normalizedSymbol}**\nTry different period: 1m, 6m, 1yr, 3yr, 5yr, 10yr, max`
      }]
    };
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ **Error fetching historical analysis**: ${error.message}`
      }]
    };
  }
}

export async function handleGetAdvancedStockAnalysis(params: any): Promise<McpResponse> {
  try {
    const symbol = params.symbol;
    
    if (!symbol) {
      return {
        content: [{
          type: 'text',
          text: '❌ Symbol parameter is required'
        }]
      };
    }

    const normalizedSymbol = findStockSymbol(symbol);
    
    if (!normalizedSymbol) {
      return {
        content: [{
          type: 'text',
          text: `❌ Stock "${symbol}" not found. Use get_supported_stocks to see available symbols.`
        }]
      };
    }

    const stockData = await callIndianStockAPI('/stock', { name: normalizedSymbol });
    
    if (stockData && typeof stockData === 'object') {
      const analysisPrompt = formatDataForLLMAnalysis(stockData, `COMPREHENSIVE STOCK ANALYSIS FOR ${normalizedSymbol}`);
      
      // For now, return the prompt - in a full implementation this would go to an LLM
      return {
        content: [{
          type: 'text',
          text: `# 🎯 ADVANCED STOCK ANALYSIS: ${normalizedSymbol}

## 📊 Raw Data for LLM Analysis

${analysisPrompt}

---

**Note**: This handler demonstrates the professional LLM analysis framework from our utilities. 
In a full implementation, this prompt would be sent to a financial LLM for sophisticated analysis.

The prompt includes:
- 🎯 Market Context Analysis
- 📊 Comprehensive Stock Evaluation  
- 💰 Fundamental Strength Assessment
- 📈 Precise Entry/Exit Strategy
- ⚠️ Risk Assessment
- 🔥 Actionable Recommendations

This represents a significant upgrade from basic analysis to institutional-grade financial intelligence.`
        }]
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: `❌ Unable to fetch data for ${normalizedSymbol}`
        }]
      };
    }
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error in advanced analysis: ${error.message}`
      }]
    };
  }
}

/**
 * Utility function to format data for LLM analysis
 * Imported from responseHelpers.ts functionality
 */
function formatDataForLLMAnalysis(data: any, context?: string): string {
  const contextText = context ? `${context}:\n\n` : '';
  return `${contextText}${JSON.stringify(data, null, 2)}

FINANCIAL EXPERT ANALYSIS PROMPT:

You are a SENIOR INVESTMENT ANALYST with 20+ years of experience in Indian stock markets. Your expertise spans:
- Technical Analysis (Moving Averages, Support/Resistance, Chart Patterns)
- Fundamental Analysis (P/E, P/B, ROE, Debt-to-Equity, Cash Flow)
- Market Sentiment Analysis (Sector trends, Peer comparison, News impact)
- Risk Management (Stop-loss, Position sizing, Risk-reward ratios)

ANALYSIS FRAMEWORK - Apply ALL these steps systematically:

🎯 MARKET CONTEXT ANALYSIS:
- Extract overall market sentiment from the data
- Identify sector-specific trends affecting this stock
- Compare with peer performance and industry benchmarks
- Assess macroeconomic factors impacting the stock

📊 COMPREHENSIVE STOCK EVALUATION:
- Current price vs 52-week high/low (position in range)
- Technical indicators: All moving averages (5,10,20,50,100,300 day)
- Volume analysis and price momentum
- Support and resistance levels identification

💰 FUNDAMENTAL STRENGTH ASSESSMENT:
- Financial health: Revenue growth, profit margins, cash flow
- Valuation metrics: P/E ratio vs industry average, P/B ratio
- Balance sheet strength: Debt levels, working capital
- Management quality indicators from recent news/developments

📈 PRECISE ENTRY/EXIT STRATEGY:
- Provide 3 specific entry points with rationale:
  * Aggressive entry (current levels)
  * Conservative entry (support levels)  
  * Deep value entry (major correction levels)
- Define 3 target levels with profit booking percentages
- Set strict stop-loss levels with risk percentages
- Specify timeline for each strategy (days/weeks/months)

⚠️ RISK ASSESSMENT:
- Identify top 3 risks (technical, fundamental, market)
- Calculate risk-reward ratios for each strategy
- Provide position sizing recommendations
- Include worst-case scenario planning

🔥 ACTIONABLE RECOMMENDATIONS:
- Clear BUY/SELL/HOLD recommendation with confidence level
- Specific investment amount allocation strategy
- Daily/weekly monitoring checklist
- Key trigger points for strategy modification

PRESENTATION REQUIREMENTS:
- Use relevant emojis for visual clarity
- Provide specific price levels (not ranges)
- Include percentage calculations for all targets
- Add timeline expectations for each recommendation
- Structure as: Executive Summary → Detailed Analysis → Action Plan

CRITICAL: Base ALL recommendations on actual data provided. Avoid generic advice. Be specific with numbers, dates, and actionable steps.`;
}
