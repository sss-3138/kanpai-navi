/**
 * Google Analytics GA4 MCP Server for kanpai-navi.
 *
 * Provides tools to query traffic, engagement, and user behavior data
 * via the Google Analytics Data API (GA4).
 *
 * Environment variables:
 *   GA_SERVICE_ACCOUNT_PATH - Path to Google service account JSON key file
 *   GA_PROPERTY_ID          - GA4 property ID (e.g. "properties/123456789")
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SERVICE_ACCOUNT_PATH = process.env.GA_SERVICE_ACCOUNT_PATH || "";
const PROPERTY_ID = process.env.GA_PROPERTY_ID || "";

// ---------------------------------------------------------------------------
// Google Analytics Data API client
// ---------------------------------------------------------------------------

let analyticsClient: BetaAnalyticsDataClient | null = null;

function getAnalyticsClient(): BetaAnalyticsDataClient {
  if (analyticsClient) {
    return analyticsClient;
  }

  if (!SERVICE_ACCOUNT_PATH) {
    throw new Error(
      "GA_SERVICE_ACCOUNT_PATH environment variable is not set. " +
        "Please provide the path to a Google service account JSON key file."
    );
  }

  if (!PROPERTY_ID) {
    throw new Error(
      "GA_PROPERTY_ID environment variable is not set. " +
        "Please provide the GA4 property ID (e.g. 'properties/123456789')."
    );
  }

  analyticsClient = new BetaAnalyticsDataClient({
    keyFilename: SERVICE_ACCOUNT_PATH,
  });

  return analyticsClient;
}

/**
 * Ensure property ID has the "properties/" prefix.
 */
function fullPropertyId(): string {
  if (PROPERTY_ID.startsWith("properties/")) {
    return PROPERTY_ID;
  }
  return `properties/${PROPERTY_ID}`;
}

// ---------------------------------------------------------------------------
// Zod schemas for tool parameters
// ---------------------------------------------------------------------------

const GetTrafficOverviewSchema = z.object({
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
});

const GetPagePerformanceSchema = z.object({
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
  limit: z
    .number()
    .default(25)
    .describe("Maximum number of pages to return (default: 25)"),
});

const GetTrafficSourcesSchema = z.object({
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
});

const GetUserDemographicsSchema = z.object({
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
});

const GetPageDetailSchema = z.object({
  pagePath: z.string().describe("Page path to get details for (e.g. /sake/junmai-daiginjo/)"),
  startDate: z.string().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().describe("End date in YYYY-MM-DD format"),
});

const GetRealTimeSchema = z.object({});

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "get_traffic_overview",
    description:
      "Get a traffic overview from Google Analytics GA4 including sessions, users, " +
      "page views, bounce rate, and average session duration for a date range.",
    inputSchema: {
      type: "object" as const,
      properties: {
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "get_page_performance",
    description:
      "Get per-page performance metrics including page views, users, average " +
      "engagement time, bounce rate, and conversions ranked by page views.",
    inputSchema: {
      type: "object" as const,
      properties: {
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
        limit: {
          type: "number",
          default: 25,
          description: "Maximum number of pages to return (default: 25)",
        },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "get_traffic_sources",
    description:
      "Get traffic source breakdown including organic search, direct, referral, " +
      "social, and other channels with session counts and engagement metrics.",
    inputSchema: {
      type: "object" as const,
      properties: {
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "get_user_demographics",
    description:
      "Get user demographic data including device category, country, and city " +
      "breakdowns with session and user counts.",
    inputSchema: {
      type: "object" as const,
      properties: {
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["startDate", "endDate"],
    },
  },
  {
    name: "get_page_detail",
    description:
      "Get detailed analytics for a specific page path including traffic sources, " +
      "user engagement, and referral data.",
    inputSchema: {
      type: "object" as const,
      properties: {
        pagePath: {
          type: "string",
          description: "Page path (e.g. /sake/junmai-daiginjo/)",
        },
        startDate: { type: "string", description: "Start date in YYYY-MM-DD format" },
        endDate: { type: "string", description: "End date in YYYY-MM-DD format" },
      },
      required: ["pagePath", "startDate", "endDate"],
    },
  },
  {
    name: "get_realtime",
    description:
      "Get real-time active user data from Google Analytics GA4 including " +
      "current active users and top active pages.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

async function handleGetTrafficOverview(
  params: z.infer<typeof GetTrafficOverviewSchema>
): Promise<string> {
  const client = getAnalyticsClient();
  const { startDate, endDate } = params;

  const [response] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "bounceRate" },
      { name: "averageSessionDuration" },
      { name: "engagedSessions" },
      { name: "engagementRate" },
      { name: "sessionsPerUser" },
      { name: "screenPageViewsPerSession" },
    ],
  });

  const row = response.rows?.[0];
  const metricValues = row?.metricValues || [];

  const summary = {
    sessions: metricValues[0]?.value || "0",
    totalUsers: metricValues[1]?.value || "0",
    newUsers: metricValues[2]?.value || "0",
    pageViews: metricValues[3]?.value || "0",
    bounceRate: parseFloat(metricValues[4]?.value || "0").toFixed(2) + "%",
    avgSessionDuration: parseFloat(metricValues[5]?.value || "0").toFixed(1) + "s",
    engagedSessions: metricValues[6]?.value || "0",
    engagementRate: parseFloat(metricValues[7]?.value || "0").toFixed(2) + "%",
    sessionsPerUser: parseFloat(metricValues[8]?.value || "0").toFixed(2),
    pageViewsPerSession: parseFloat(metricValues[9]?.value || "0").toFixed(2),
  };

  return JSON.stringify(
    { propertyId: PROPERTY_ID, startDate, endDate, summary },
    null,
    2
  );
}

async function handleGetPagePerformance(
  params: z.infer<typeof GetPagePerformanceSchema>
): Promise<string> {
  const client = getAnalyticsClient();
  const { startDate, endDate, limit } = params;

  const [response] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "totalUsers" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
      { name: "engagementRate" },
    ],
    orderBys: [
      { metric: { metricName: "screenPageViews" }, desc: true },
    ],
    limit,
  });

  const rows = response.rows || [];
  const pages = rows.map((row, index) => ({
    rank: index + 1,
    pagePath: row.dimensionValues?.[0]?.value || "",
    pageTitle: row.dimensionValues?.[1]?.value || "",
    pageViews: row.metricValues?.[0]?.value || "0",
    users: row.metricValues?.[1]?.value || "0",
    avgSessionDuration:
      parseFloat(row.metricValues?.[2]?.value || "0").toFixed(1) + "s",
    bounceRate:
      parseFloat(row.metricValues?.[3]?.value || "0").toFixed(2) + "%",
    engagementRate:
      parseFloat(row.metricValues?.[4]?.value || "0").toFixed(2) + "%",
  }));

  return JSON.stringify(
    { propertyId: PROPERTY_ID, startDate, endDate, totalPages: pages.length, pages },
    null,
    2
  );
}

async function handleGetTrafficSources(
  params: z.infer<typeof GetTrafficSourcesSchema>
): Promise<string> {
  const client = getAnalyticsClient();
  const { startDate, endDate } = params;

  const [response] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "sessionDefaultChannelGroup" },
      { name: "sessionSource" },
      { name: "sessionMedium" },
    ],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "engagementRate" },
      { name: "averageSessionDuration" },
      { name: "screenPageViewsPerSession" },
    ],
    orderBys: [
      { metric: { metricName: "sessions" }, desc: true },
    ],
  });

  const rows = response.rows || [];
  const sources = rows.map((row) => ({
    channel: row.dimensionValues?.[0]?.value || "",
    source: row.dimensionValues?.[1]?.value || "",
    medium: row.dimensionValues?.[2]?.value || "",
    sessions: row.metricValues?.[0]?.value || "0",
    users: row.metricValues?.[1]?.value || "0",
    engagementRate:
      parseFloat(row.metricValues?.[2]?.value || "0").toFixed(2) + "%",
    avgSessionDuration:
      parseFloat(row.metricValues?.[3]?.value || "0").toFixed(1) + "s",
    pagesPerSession:
      parseFloat(row.metricValues?.[4]?.value || "0").toFixed(2),
  }));

  return JSON.stringify(
    { propertyId: PROPERTY_ID, startDate, endDate, sources },
    null,
    2
  );
}

async function handleGetUserDemographics(
  params: z.infer<typeof GetUserDemographicsSchema>
): Promise<string> {
  const client = getAnalyticsClient();
  const { startDate, endDate } = params;

  // Device breakdown
  const [deviceResponse] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "deviceCategory" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
    ],
    orderBys: [
      { metric: { metricName: "sessions" }, desc: true },
    ],
  });

  const devices = (deviceResponse.rows || []).map((row) => ({
    device: row.dimensionValues?.[0]?.value || "",
    sessions: row.metricValues?.[0]?.value || "0",
    users: row.metricValues?.[1]?.value || "0",
  }));

  // Country breakdown
  const [countryResponse] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "country" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
    ],
    orderBys: [
      { metric: { metricName: "sessions" }, desc: true },
    ],
    limit: 20,
  });

  const countries = (countryResponse.rows || []).map((row) => ({
    country: row.dimensionValues?.[0]?.value || "",
    sessions: row.metricValues?.[0]?.value || "0",
    users: row.metricValues?.[1]?.value || "0",
  }));

  return JSON.stringify(
    { propertyId: PROPERTY_ID, startDate, endDate, devices, countries },
    null,
    2
  );
}

async function handleGetPageDetail(
  params: z.infer<typeof GetPageDetailSchema>
): Promise<string> {
  const client = getAnalyticsClient();
  const { pagePath, startDate, endDate } = params;

  // Page metrics
  const [metricsResponse] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "pagePath" }],
    metrics: [
      { name: "screenPageViews" },
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
      { name: "engagementRate" },
    ],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "EXACT" as const, value: pagePath },
      },
    },
  });

  const row = metricsResponse.rows?.[0];
  const metrics = row
    ? {
        pageViews: row.metricValues?.[0]?.value || "0",
        users: row.metricValues?.[1]?.value || "0",
        newUsers: row.metricValues?.[2]?.value || "0",
        avgSessionDuration:
          parseFloat(row.metricValues?.[3]?.value || "0").toFixed(1) + "s",
        bounceRate:
          parseFloat(row.metricValues?.[4]?.value || "0").toFixed(2) + "%",
        engagementRate:
          parseFloat(row.metricValues?.[5]?.value || "0").toFixed(2) + "%",
      }
    : null;

  // Traffic sources for this page
  const [sourcesResponse] = await client.runReport({
    property: fullPropertyId(),
    dateRanges: [{ startDate, endDate }],
    dimensions: [
      { name: "pagePath" },
      { name: "sessionDefaultChannelGroup" },
    ],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "EXACT" as const, value: pagePath },
      },
    },
    orderBys: [
      { metric: { metricName: "sessions" }, desc: true },
    ],
  });

  const sources = (sourcesResponse.rows || []).map((r) => ({
    channel: r.dimensionValues?.[1]?.value || "",
    sessions: r.metricValues?.[0]?.value || "0",
    users: r.metricValues?.[1]?.value || "0",
  }));

  return JSON.stringify(
    { propertyId: PROPERTY_ID, pagePath, startDate, endDate, metrics, sources },
    null,
    2
  );
}

async function handleGetRealTime(): Promise<string> {
  const client = getAnalyticsClient();

  const [response] = await client.runRealtimeReport({
    property: fullPropertyId(),
    dimensions: [{ name: "unifiedScreenName" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [
      { metric: { metricName: "activeUsers" }, desc: true },
    ],
    limit: 10,
  });

  const totalActiveUsers = (response.rows || []).reduce(
    (sum, row) => sum + parseInt(row.metricValues?.[0]?.value || "0", 10),
    0
  );

  const activePages = (response.rows || []).map((row) => ({
    page: row.dimensionValues?.[0]?.value || "",
    activeUsers: row.metricValues?.[0]?.value || "0",
  }));

  return JSON.stringify(
    { propertyId: PROPERTY_ID, totalActiveUsers, activePages },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "google-analytics",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case "get_traffic_overview": {
        const parsed = GetTrafficOverviewSchema.parse(args);
        result = await handleGetTrafficOverview(parsed);
        break;
      }
      case "get_page_performance": {
        const parsed = GetPagePerformanceSchema.parse(args);
        result = await handleGetPagePerformance(parsed);
        break;
      }
      case "get_traffic_sources": {
        const parsed = GetTrafficSourcesSchema.parse(args);
        result = await handleGetTrafficSources(parsed);
        break;
      }
      case "get_user_demographics": {
        const parsed = GetUserDemographicsSchema.parse(args);
        result = await handleGetUserDemographics(parsed);
        break;
      }
      case "get_page_detail": {
        const parsed = GetPageDetailSchema.parse(args);
        result = await handleGetPageDetail(parsed);
        break;
      }
      case "get_realtime": {
        GetRealTimeSchema.parse(args);
        result = await handleGetRealTime();
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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Analytics MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
