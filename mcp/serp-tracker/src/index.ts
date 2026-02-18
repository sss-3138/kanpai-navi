/**
 * SERP Tracker MCP Server for kanpai-navi.
 *
 * Provides tools to check SERP rankings, compare ranking snapshots, and
 * save ranking data over time. Uses a pluggable adapter pattern so the
 * underlying SERP API provider (ValueSERP, SerpAPI, etc.) can be swapped.
 *
 * Environment variables:
 *   SERP_API_KEY       - API key for the SERP data provider
 *   SERP_API_PROVIDER  - Provider name: "valueserp" (default) | "serpapi"
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SERP_API_KEY = process.env.SERP_API_KEY || "";
const SERP_API_PROVIDER = process.env.SERP_API_PROVIDER || "valueserp";
const DEFAULT_DOMAIN = "kanpai-navi.com";

// ---------------------------------------------------------------------------
// SERP API Adapter interface and implementations
// ---------------------------------------------------------------------------

/** A single SERP result entry. */
interface SerpResult {
  position: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
}

/** Result of a ranking check for one keyword. */
interface RankingResult {
  keyword: string;
  position: number | null;
  url: string | null;
  totalResults: number;
  topResults: SerpResult[];
}

/**
 * Abstract adapter interface for SERP API providers.
 * Implement this to plug in a different provider.
 */
interface SerpApiAdapter {
  /** Fetch SERP results for a keyword. */
  search(keyword: string, limit: number): Promise<SerpResult[]>;
}

/**
 * ValueSERP adapter implementation.
 * See: https://www.valueserp.com/docs
 */
class ValueSerpAdapter implements SerpApiAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(keyword: string, limit: number): Promise<SerpResult[]> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      q: keyword,
      location: "Japan",
      google_domain: "google.co.jp",
      gl: "jp",
      hl: "ja",
      num: String(limit),
      output: "json",
    });

    const url = `https://api.valueserp.com/search?${params.toString()}`;
    const data = await httpGet(url);
    const parsed = JSON.parse(data);

    const organicResults = parsed.organic_results || [];
    return organicResults.map(
      (item: Record<string, unknown>, index: number) => ({
        position: index + 1,
        title: (item.title as string) || "",
        url: (item.link as string) || "",
        domain: extractDomain((item.link as string) || ""),
        snippet: (item.snippet as string) || "",
      })
    );
  }
}

/**
 * SerpAPI adapter implementation.
 * See: https://serpapi.com/search-api
 */
class SerpApiAdapterImpl implements SerpApiAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(keyword: string, limit: number): Promise<SerpResult[]> {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      q: keyword,
      location: "Japan",
      google_domain: "google.co.jp",
      gl: "jp",
      hl: "ja",
      num: String(limit),
    });

    const url = `https://serpapi.com/search.json?${params.toString()}`;
    const data = await httpGet(url);
    const parsed = JSON.parse(data);

    const organicResults = parsed.organic_results || [];
    return organicResults.map(
      (item: Record<string, unknown>, index: number) => ({
        position: index + 1,
        title: (item.title as string) || "",
        url: (item.link as string) || "",
        domain: extractDomain((item.link as string) || ""),
        snippet: (item.snippet as string) || "",
      })
    );
  }
}

/**
 * Create the appropriate SERP API adapter based on the configured provider.
 */
function createSerpAdapter(): SerpApiAdapter {
  if (!SERP_API_KEY) {
    throw new Error(
      "SERP_API_KEY environment variable is not set. " +
        "Please provide an API key for the SERP data provider."
    );
  }

  switch (SERP_API_PROVIDER) {
    case "serpapi":
      return new SerpApiAdapterImpl(SERP_API_KEY);
    case "valueserp":
    default:
      return new ValueSerpAdapter(SERP_API_KEY);
  }
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Make a simple HTTPS GET request and return the response body as a string.
 */
function httpGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => resolve(data));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

/**
 * Extract the domain from a URL string.
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Ensure a directory exists, creating it recursively if necessary.
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Zod schemas for tool parameters
// ---------------------------------------------------------------------------

const CheckRankingSchema = z.object({
  keyword: z.string().describe("The keyword to check SERP ranking for"),
  domain: z
    .string()
    .default(DEFAULT_DOMAIN)
    .describe("The domain to find in results (default: kanpai-navi.com)"),
});

const CheckRankingsBatchSchema = z.object({
  keywords: z
    .array(z.string())
    .describe("List of keywords to check rankings for"),
  domain: z
    .string()
    .default(DEFAULT_DOMAIN)
    .describe("The domain to find in results (default: kanpai-navi.com)"),
});

const GetSerpResultsSchema = z.object({
  keyword: z.string().describe("The keyword to get SERP results for"),
  limit: z
    .number()
    .default(10)
    .describe("Number of results to return (default: 10)"),
});

const CompareRankingsSchema = z.object({
  currentFile: z
    .string()
    .describe("Path to JSON file with current rankings data"),
  previousFile: z
    .string()
    .describe("Path to JSON file with previous rankings data"),
});

const SaveRankingSnapshotSchema = z.object({
  rankings: z
    .record(z.unknown())
    .describe("Rankings data object to save"),
  date: z
    .string()
    .describe("Date label for the snapshot in YYYY-MM-DD format"),
});

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "check_ranking",
    description:
      "Check the current SERP ranking for a single keyword. Returns the " +
      "position of the target domain in the search results, along with the " +
      "top results for context.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword: { type: "string", description: "The keyword to check" },
        domain: {
          type: "string",
          default: DEFAULT_DOMAIN,
          description: "Target domain (default: kanpai-navi.com)",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "check_rankings_batch",
    description:
      "Check SERP rankings for multiple keywords at once. Returns the " +
      "position of the target domain for each keyword.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "List of keywords to check",
        },
        domain: {
          type: "string",
          default: DEFAULT_DOMAIN,
          description: "Target domain (default: kanpai-navi.com)",
        },
      },
      required: ["keywords"],
    },
  },
  {
    name: "get_serp_results",
    description:
      "Get the top SERP results for a keyword, including titles, URLs, " +
      "domains, and snippets.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword: { type: "string", description: "The keyword to search" },
        limit: {
          type: "number",
          default: 10,
          description: "Number of results to return (default: 10)",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "compare_rankings",
    description:
      "Compare current rankings against previous rankings from JSON files. " +
      "Shows position changes (improved, declined, new, lost) for each keyword.",
    inputSchema: {
      type: "object" as const,
      properties: {
        currentFile: {
          type: "string",
          description: "Path to current rankings JSON file",
        },
        previousFile: {
          type: "string",
          description: "Path to previous rankings JSON file",
        },
      },
      required: ["currentFile", "previousFile"],
    },
  },
  {
    name: "save_ranking_snapshot",
    description:
      "Save a ranking snapshot to the data/rankings/ directory for " +
      "historical tracking.",
    inputSchema: {
      type: "object" as const,
      properties: {
        rankings: {
          type: "object",
          description: "Rankings data object to save",
        },
        date: {
          type: "string",
          description: "Date label in YYYY-MM-DD format",
        },
      },
      required: ["rankings", "date"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

/**
 * Check the SERP ranking for a single keyword.
 */
async function handleCheckRanking(
  params: z.infer<typeof CheckRankingSchema>
): Promise<string> {
  const adapter = createSerpAdapter();
  const { keyword, domain } = params;

  const results = await adapter.search(keyword, 100);
  const match = results.find((r) => r.domain.includes(domain));

  const ranking: RankingResult = {
    keyword,
    position: match ? match.position : null,
    url: match ? match.url : null,
    totalResults: results.length,
    topResults: results.slice(0, 10),
  };

  return JSON.stringify(
    {
      domain,
      ...ranking,
      found: match !== undefined,
      message: match
        ? `${domain} ranks #${match.position} for "${keyword}"`
        : `${domain} not found in top ${results.length} results for "${keyword}"`,
    },
    null,
    2
  );
}

/**
 * Check SERP rankings for multiple keywords.
 */
async function handleCheckRankingsBatch(
  params: z.infer<typeof CheckRankingsBatchSchema>
): Promise<string> {
  const adapter = createSerpAdapter();
  const { keywords, domain } = params;

  const results: Record<string, unknown>[] = [];

  for (const keyword of keywords) {
    try {
      const serpResults = await adapter.search(keyword, 100);
      const match = serpResults.find((r) => r.domain.includes(domain));

      results.push({
        keyword,
        position: match ? match.position : null,
        url: match ? match.url : null,
        found: match !== undefined,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      results.push({
        keyword,
        position: null,
        url: null,
        found: false,
        error: errorMessage,
      });
    }
  }

  const found = results.filter((r) => r.found).length;
  const avgPosition =
    found > 0
      ? results
          .filter((r) => r.position !== null)
          .reduce((sum, r) => sum + (r.position as number), 0) / found
      : null;

  return JSON.stringify(
    {
      domain,
      totalKeywords: keywords.length,
      foundInResults: found,
      notFound: keywords.length - found,
      averagePosition: avgPosition?.toFixed(1) || "N/A",
      rankings: results,
    },
    null,
    2
  );
}

/**
 * Get the top SERP results for a keyword.
 */
async function handleGetSerpResults(
  params: z.infer<typeof GetSerpResultsSchema>
): Promise<string> {
  const adapter = createSerpAdapter();
  const { keyword, limit } = params;

  const results = await adapter.search(keyword, limit);

  return JSON.stringify(
    {
      keyword,
      limit,
      totalResults: results.length,
      results,
    },
    null,
    2
  );
}

/**
 * Compare current rankings against previous rankings.
 */
async function handleCompareRankings(
  params: z.infer<typeof CompareRankingsSchema>
): Promise<string> {
  const { currentFile, previousFile } = params;

  if (!fs.existsSync(currentFile)) {
    throw new Error(`Current rankings file not found: ${currentFile}`);
  }
  if (!fs.existsSync(previousFile)) {
    throw new Error(`Previous rankings file not found: ${previousFile}`);
  }

  const currentData = JSON.parse(fs.readFileSync(currentFile, "utf-8"));
  const previousData = JSON.parse(fs.readFileSync(previousFile, "utf-8"));

  const currentRankings: Record<string, number | null> =
    currentData.rankings || currentData;
  const previousRankings: Record<string, number | null> =
    previousData.rankings || previousData;

  const allKeywords = new Set([
    ...Object.keys(currentRankings),
    ...Object.keys(previousRankings),
  ]);

  const comparisons: Record<string, unknown>[] = [];
  let improved = 0;
  let declined = 0;
  let newKeywords = 0;
  let lostKeywords = 0;
  let unchanged = 0;

  for (const keyword of allKeywords) {
    const current = currentRankings[keyword] ?? null;
    const previous = previousRankings[keyword] ?? null;

    let change: string;
    let delta: number | null = null;

    if (current !== null && previous !== null) {
      delta = previous - current; // positive = improved (lower position is better)
      if (delta > 0) {
        change = "improved";
        improved++;
      } else if (delta < 0) {
        change = "declined";
        declined++;
      } else {
        change = "unchanged";
        unchanged++;
      }
    } else if (current !== null && previous === null) {
      change = "new";
      newKeywords++;
    } else {
      change = "lost";
      lostKeywords++;
    }

    comparisons.push({
      keyword,
      currentPosition: current,
      previousPosition: previous,
      change,
      delta,
    });
  }

  // Sort by absolute delta descending (biggest movers first)
  comparisons.sort((a, b) => {
    const aDelta = Math.abs((a.delta as number) || 0);
    const bDelta = Math.abs((b.delta as number) || 0);
    return bDelta - aDelta;
  });

  return JSON.stringify(
    {
      summary: {
        totalKeywords: allKeywords.size,
        improved,
        declined,
        unchanged,
        newKeywords,
        lostKeywords,
      },
      comparisons,
    },
    null,
    2
  );
}

/**
 * Save a ranking snapshot to disk.
 */
async function handleSaveRankingSnapshot(
  params: z.infer<typeof SaveRankingSnapshotSchema>
): Promise<string> {
  const { rankings, date } = params;

  // Resolve the rankings directory relative to the project root
  const projectRoot = path.resolve(__dirname, "..", "..", "..");
  const rankingsDir = path.join(projectRoot, "data", "rankings");
  ensureDir(rankingsDir);

  const filename = `rankings-${date}.json`;
  const filepath = path.join(rankingsDir, filename);

  const snapshot = {
    date,
    savedAt: new Date().toISOString(),
    rankings,
  };

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf-8");

  return JSON.stringify(
    {
      success: true,
      filepath,
      filename,
      date,
      message: `Rankings snapshot saved to ${filepath}`,
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
    name: "serp-tracker",
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
      case "check_ranking": {
        const parsed = CheckRankingSchema.parse(args);
        result = await handleCheckRanking(parsed);
        break;
      }
      case "check_rankings_batch": {
        const parsed = CheckRankingsBatchSchema.parse(args);
        result = await handleCheckRankingsBatch(parsed);
        break;
      }
      case "get_serp_results": {
        const parsed = GetSerpResultsSchema.parse(args);
        result = await handleGetSerpResults(parsed);
        break;
      }
      case "compare_rankings": {
        const parsed = CompareRankingsSchema.parse(args);
        result = await handleCompareRankings(parsed);
        break;
      }
      case "save_ranking_snapshot": {
        const parsed = SaveRankingSnapshotSchema.parse(args);
        result = await handleSaveRankingSnapshot(parsed);
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
  console.error("SERP Tracker MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
