/**
 * Google Search Console MCP Server for kanpai-navi.
 *
 * Provides tools to query search performance data, indexing status, and
 * keyword analytics via the Google Search Console API.
 *
 * Environment variables:
 *   GSC_SERVICE_ACCOUNT_PATH - Path to Google service account JSON key file
 *   GSC_SITE_URL             - The Search Console property URL (e.g. https://kanpai-navi.com)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { google, type searchconsole_v1 } from "googleapis";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SERVICE_ACCOUNT_PATH = process.env.GSC_SERVICE_ACCOUNT_PATH || "";
const SITE_URL = process.env.GSC_SITE_URL || "";

// ---------------------------------------------------------------------------
// Google Search Console client helpers
// ---------------------------------------------------------------------------

/** Cached Search Console API client instance. */
let searchConsoleClient: searchconsole_v1.Searchconsole | null = null;

/**
 * Return an authenticated Search Console API client.
 * Uses a service account JSON key for authentication.
 */
async function getSearchConsoleClient(): Promise<searchconsole_v1.Searchconsole> {
  if (searchConsoleClient) {
    return searchConsoleClient;
  }

  if (!SERVICE_ACCOUNT_PATH) {
    throw new Error(
      "GSC_SERVICE_ACCOUNT_PATH environment variable is not set. " +
        "Please provide the path to a Google service account JSON key file."
    );
  }

  if (!SITE_URL) {
    throw new Error(
      "GSC_SITE_URL environment variable is not set. " +
        "Please provide the Search Console property URL."
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  searchConsoleClient = google.searchconsole({
    version: "v1",
    auth,
  });

  return searchConsoleClient;
}

// ---------------------------------------------------------------------------
// Zod schemas for tool parameters
// ---------------------------------------------------------------------------

const GetSearchPerformanceSchema = z.object({
  startDate: z
    .string()
    .describe("Start date in YYYY-MM-DD format"),
  endDate: z
    .string()
    .describe("End date in YYYY-MM-DD format"),
  dimensions: z
    .array(z.enum(["query", "page", "country", "device"]))
    .default(["query"])
    .describe("Dimensions to group results by (query, page, country, device)"),
});

const GetPagePerformanceSchema = z.object({
  pageUrl: z
    .string()
    .describe("Full URL of the page to get performance data for"),
  startDate: z
    .string()
    .describe("Start date in YYYY-MM-DD format"),
  endDate: z
    .string()
    .describe("End date in YYYY-MM-DD format"),
});

const GetKeywordPerformanceSchema = z.object({
  keywords: z
    .array(z.string())
    .describe("List of keywords to get performance data for"),
  startDate: z
    .string()
    .describe("Start date in YYYY-MM-DD format"),
  endDate: z
    .string()
    .describe("End date in YYYY-MM-DD format"),
});

const GetIndexingStatusSchema = z.object({
  urls: z
    .array(z.string())
    .describe("List of URLs to check indexing status for"),
});

const GetTopQueriesSchema = z.object({
  limit: z
    .number()
    .default(25)
    .describe("Maximum number of queries to return (default: 25)"),
  startDate: z
    .string()
    .describe("Start date in YYYY-MM-DD format"),
  endDate: z
    .string()
    .describe("End date in YYYY-MM-DD format"),
});

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "get_search_performance",
    description:
      "Get search performance data (clicks, impressions, CTR, position) " +
      "from Google Search Console for a date range, grouped by the specified dimensions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
        dimensions: {
          type: "array",
          items: { type: "string", enum: ["query", "page", "country", "device"] },
          default: ["query"],
          description: "Dimensions to group results by",
        },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "get_page_performance",
    description:
      "Get search performance data for a specific page URL, including " +
      "clicks, impressions, CTR, and average position.",
    inputSchema: {
      type: "object" as const,
      properties: {
        pageUrl: { type: "string", description: "Full URL of the page" },
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["pageUrl", "startDate", "endDate"],
    },
  },
  {
    name: "get_keyword_performance",
    description:
      "Get search performance data for specific keywords, including " +
      "clicks, impressions, CTR, and average position for each keyword.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "List of keywords to query",
        },
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["keywords", "startDate", "endDate"],
    },
  },
  {
    name: "get_indexing_status",
    description:
      "Check the indexing status of one or more URLs using the " +
      "Google Search Console URL Inspection API.",
    inputSchema: {
      type: "object" as const,
      properties: {
        urls: {
          type: "array",
          items: { type: "string" },
          description: "List of URLs to check",
        },
      },
      required: ["urls"],
    },
  },
  {
    name: "get_top_queries",
    description:
      "Get the top search queries by clicks and impressions for a date range.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          default: 25,
          description: "Maximum number of queries to return (default: 25)",
        },
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["startDate", "endDate"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

/**
 * Fetch search performance data from the Search Console API.
 */
async function handleGetSearchPerformance(
  params: z.infer<typeof GetSearchPerformanceSchema>
): Promise<string> {
  const client = await getSearchConsoleClient();
  const { startDate, endDate, dimensions } = params;

  const response = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit: 1000,
    },
  });

  const rows = response.data.rows || [];
  const results = rows.map((row) => ({
    keys: row.keys,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr ? (row.ctr * 100).toFixed(2) + "%" : "0%",
    position: row.position?.toFixed(1),
  }));

  return JSON.stringify(
    {
      siteUrl: SITE_URL,
      startDate,
      endDate,
      dimensions,
      totalRows: results.length,
      rows: results,
    },
    null,
    2
  );
}

/**
 * Fetch performance data for a specific page.
 */
async function handleGetPagePerformance(
  params: z.infer<typeof GetPagePerformanceSchema>
): Promise<string> {
  const client = await getSearchConsoleClient();
  const { pageUrl, startDate, endDate } = params;

  const response = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      dimensionFilterGroups: [
        {
          filters: [
            {
              dimension: "page",
              operator: "equals",
              expression: pageUrl,
            },
          ],
        },
      ],
      rowLimit: 1000,
    },
  });

  const rows = response.data.rows || [];
  const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
  const totalImpressions = rows.reduce(
    (sum, row) => sum + (row.impressions || 0),
    0
  );
  const avgPosition =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + (row.position || 0), 0) / rows.length
      : 0;
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;

  const queries = rows.map((row) => ({
    query: row.keys?.[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr ? (row.ctr * 100).toFixed(2) + "%" : "0%",
    position: row.position?.toFixed(1),
  }));

  return JSON.stringify(
    {
      pageUrl,
      startDate,
      endDate,
      summary: {
        totalClicks,
        totalImpressions,
        averageCtr: (avgCtr * 100).toFixed(2) + "%",
        averagePosition: avgPosition.toFixed(1),
      },
      queries,
    },
    null,
    2
  );
}

/**
 * Fetch performance data for specific keywords.
 */
async function handleGetKeywordPerformance(
  params: z.infer<typeof GetKeywordPerformanceSchema>
): Promise<string> {
  const client = await getSearchConsoleClient();
  const { keywords, startDate, endDate } = params;

  const results: Record<string, unknown>[] = [];

  for (const keyword of keywords) {
    const response = await client.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["query", "page"],
        dimensionFilterGroups: [
          {
            filters: [
              {
                dimension: "query",
                operator: "contains",
                expression: keyword,
              },
            ],
          },
        ],
        rowLimit: 100,
      },
    });

    const rows = response.data.rows || [];
    const totalClicks = rows.reduce((sum, row) => sum + (row.clicks || 0), 0);
    const totalImpressions = rows.reduce(
      (sum, row) => sum + (row.impressions || 0),
      0
    );

    results.push({
      keyword,
      totalClicks,
      totalImpressions,
      matchingQueries: rows.map((row) => ({
        query: row.keys?.[0],
        page: row.keys?.[1],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr ? (row.ctr * 100).toFixed(2) + "%" : "0%",
        position: row.position?.toFixed(1),
      })),
    });
  }

  return JSON.stringify(
    { startDate, endDate, keywords: results },
    null,
    2
  );
}

/**
 * Check indexing status of URLs using the URL Inspection API.
 */
async function handleGetIndexingStatus(
  params: z.infer<typeof GetIndexingStatusSchema>
): Promise<string> {
  const client = await getSearchConsoleClient();
  const { urls } = params;

  const results: Record<string, unknown>[] = [];

  for (const url of urls) {
    try {
      const response = await client.urlInspection.index.inspect({
        requestBody: {
          inspectionUrl: url,
          siteUrl: SITE_URL,
        },
      });

      const result = response.data.inspectionResult;
      results.push({
        url,
        indexingState: result?.indexStatusResult?.coverageState || "UNKNOWN",
        robotsTxtState: result?.indexStatusResult?.robotsTxtState || "UNKNOWN",
        pageFetchState: result?.indexStatusResult?.pageFetchState || "UNKNOWN",
        lastCrawlTime: result?.indexStatusResult?.lastCrawlTime || null,
        verdict: result?.indexStatusResult?.verdict || "UNKNOWN",
        mobileUsability: result?.mobileUsabilityResult?.verdict || "UNKNOWN",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      results.push({
        url,
        error: `Failed to inspect URL: ${errorMessage}`,
      });
    }
  }

  return JSON.stringify({ siteUrl: SITE_URL, results }, null, 2);
}

/**
 * Fetch top queries ranked by clicks.
 */
async function handleGetTopQueries(
  params: z.infer<typeof GetTopQueriesSchema>
): Promise<string> {
  const client = await getSearchConsoleClient();
  const { limit, startDate, endDate } = params;

  const response = await client.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: limit,
    },
  });

  const rows = response.data.rows || [];
  const queries = rows.map((row, index) => ({
    rank: index + 1,
    query: row.keys?.[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr ? (row.ctr * 100).toFixed(2) + "%" : "0%",
    position: row.position?.toFixed(1),
  }));

  return JSON.stringify(
    {
      siteUrl: SITE_URL,
      startDate,
      endDate,
      limit,
      totalQueries: queries.length,
      queries,
    },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "search-console",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/** Handle tool listing requests. */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

/** Handle tool call requests. */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case "get_search_performance": {
        const parsed = GetSearchPerformanceSchema.parse(args);
        result = await handleGetSearchPerformance(parsed);
        break;
      }
      case "get_page_performance": {
        const parsed = GetPagePerformanceSchema.parse(args);
        result = await handleGetPagePerformance(parsed);
        break;
      }
      case "get_keyword_performance": {
        const parsed = GetKeywordPerformanceSchema.parse(args);
        result = await handleGetKeywordPerformance(parsed);
        break;
      }
      case "get_indexing_status": {
        const parsed = GetIndexingStatusSchema.parse(args);
        result = await handleGetIndexingStatus(parsed);
        break;
      }
      case "get_top_queries": {
        const parsed = GetTopQueriesSchema.parse(args);
        result = await handleGetTopQueries(parsed);
        break;
      }
      default:
        return {
          content: [
            {
              type: "text" as const,
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the MCP server using stdio transport.
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Search Console MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
