#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  apiKey: string;
  apiBaseUrl: string;
  wrapperApiUrl: string;
  port: number;
}

const config: Config = {
  apiKey: process.env.INDIAN_STOCK_API_KEY || '',
  apiBaseUrl: process.env.INDIAN_STOCK_BASE_URL || 'https://stock.indianapi.in',
  wrapperApiUrl: process.env.WRAPPER_API_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '3001', 10)
};

import {
  handleGetStockData,
  handleGetMultipleStocks,
  handleSearchStocks,
  handleGetTopGainers,
  handleGetTopLosers,
  handleGetStocksBySector,
  handleGetStocksByMarketCap,
  handleGetSupportedStocks,
  handleGetQuarterlyResults,
  handleGetYearlyResults,
  handleGetBalanceSheet,
  handleGetCashflowStatement,
  handleGetFinancialRatios,
  handleGetShareholdingQuarterly,
  handleGetShareholdingYearly,
  handleGetHistoricalAnalysis,
  handleGetAdvancedStockAnalysis
} from './handlers/stockAnalysisHandlers.js';

class IndianStockMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'indian-stock-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_stock_data',
            description: 'Get detailed information for a specific stock symbol',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS, INFY)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_multiple_stocks',
            description: 'Get data for multiple stock symbols at once',
            inputSchema: {
              type: 'object',
              properties: {
                symbols: {
                  type: 'string',
                  description: 'Comma-separated stock symbols (e.g., "RELIANCE,TCS,INFY") or array of symbols',
                },
              },
              required: ['symbols'],
            },
          },
          {
            name: 'search_stocks',
            description: 'Search for stocks by name or symbol',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query (company name or partial symbol)',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_top_gainers',
            description: 'Get top gaining stocks for the day',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_top_losers',
            description: 'Get top losing stocks for the day',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_stocks_by_sector',
            description: 'Get stocks filtered by sector',
            inputSchema: {
              type: 'object',
              properties: {
                sector: {
                  type: 'string',
                  description: 'Sector name (e.g., IT, Banking, Pharma)',
                },
              },
              required: ['sector'],
            },
          },
          {
            name: 'get_stocks_by_market_cap',
            description: 'Get stocks filtered by market cap category',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Market cap category (large_cap, mid_cap, small_cap)',
                },
              },
              required: ['category'],
            },
          },
          {
            name: 'get_supported_stocks',
            description: 'Get list of all supported stock symbols',
            inputSchema: {
              type: 'object',
              properties: {
                show_all: {
                  type: 'string',
                  description: 'Set to "more" to see all stocks instead of just first 50',
                },
              },
            },
          },
          {
            name: 'get_quarterly_results',
            description: 'Get quarterly financial results for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_yearly_results',
            description: 'Get year-over-year financial results for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_balance_sheet',
            description: 'Get balance sheet data for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_cashflow_statement',
            description: 'Get cash flow statement for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_financial_ratios',
            description: 'Get financial ratios and metrics for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_shareholding_quarterly',
            description: 'Get quarterly shareholding pattern for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_shareholding_yearly',
            description: 'Get yearly shareholding pattern for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_historical_analysis',
            description: 'Get comprehensive historical price and technical analysis for a stock',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS)',
                },
                period: {
                  type: 'string',
                  description: 'Time period: 1m, 6m, 1yr, 3yr, 5yr, 10yr, max (default: 1yr)',
                },
                filter: {
                  type: 'string',
                  description: 'Data filter: price, pe, sm, evebitda, ptb, mcs (default: price)',
                },
              },
              required: ['symbol'],
            },
          },
          {
            name: 'get_advanced_stock_analysis',
            description: 'Get institutional-grade financial analysis using professional LLM framework - provides comprehensive investment insights, entry/exit strategies, and risk assessment',
            inputSchema: {
              type: 'object',
              properties: {
                symbol: {
                  type: 'string',
                  description: 'Stock symbol (e.g., RELIANCE, TCS, INFY)',
                },
              },
              required: ['symbol'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        let result;

        switch (name) {
          // Stock Data Handlers
          case 'get_stock_data':
            result = await handleGetStockData(args || {});
            break;
          case 'get_multiple_stocks':
            result = await handleGetMultipleStocks(args || {});
            break;
          case 'search_stocks':
            result = await handleSearchStocks(args || {});
            break;
          case 'get_top_gainers':
            result = await handleGetTopGainers(args || {});
            break;
          case 'get_top_losers':
            result = await handleGetTopLosers(args || {});
            break;
          case 'get_stocks_by_sector':
            result = await handleGetStocksBySector(args || {});
            break;
          case 'get_stocks_by_market_cap':
            result = await handleGetStocksByMarketCap(args || {});
            break;
          case 'get_supported_stocks':
            result = await handleGetSupportedStocks(args || {});
            break;
          case 'get_quarterly_results':
            result = await handleGetQuarterlyResults(args || {});
            break;
          case 'get_yearly_results':
            result = await handleGetYearlyResults(args || {});
            break;
          case 'get_balance_sheet':
            result = await handleGetBalanceSheet(args || {});
            break;
          case 'get_cashflow_statement':
            result = await handleGetCashflowStatement(args || {});
            break;
          case 'get_financial_ratios':
            result = await handleGetFinancialRatios(args || {});
            break;
          case 'get_shareholding_quarterly':
            result = await handleGetShareholdingQuarterly(args || {});
            break;
          case 'get_shareholding_yearly':
            result = await handleGetShareholdingYearly(args || {});
            break;
          case 'get_historical_analysis':
            result = await handleGetHistoricalAnalysis(args || {});
            break;
          case 'get_advanced_stock_analysis':
            result = await handleGetAdvancedStockAnalysis(args || {});
            break;

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }

        return {
          content: result.content
        };
      } catch (error) {
        console.error(`Error in tool ${name}:`, error);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    if (!config.apiKey) {
      console.error('Error: API_KEY environment variable is required');
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Indian Stock MCP Server running on stdio');
  }
}

const mcpServer = new IndianStockMcpServer();
mcpServer.run().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default IndianStockMcpServer;
