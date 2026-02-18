/**
 * Keyword Research MCP Server for kanpai-navi.
 *
 * Provides tools for keyword research, search volume estimation, keyword
 * difficulty analysis, trend data, and long-tail keyword suggestions.
 * Uses a pluggable adapter pattern to support different data providers
 * (Google Keyword Planner, Ubersuggest, DataForSEO, etc.).
 *
 * Environment variables:
 *   KEYWORD_API_KEY       - API key for the keyword data provider
 *   KEYWORD_API_PROVIDER  - Provider name: "dataforseo" (default) | "ubersuggest"
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as https from "https";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const KEYWORD_API_KEY = process.env.KEYWORD_API_KEY || "";
const KEYWORD_API_PROVIDER = process.env.KEYWORD_API_PROVIDER || "dataforseo";

// ---------------------------------------------------------------------------
// Keyword data types
// ---------------------------------------------------------------------------

/** Keyword suggestion with associated metrics. */
interface KeywordSuggestion {
  keyword: string;
  searchVolume: number | null;
  competition: string | null;
  cpc: number | null;
  difficulty: number | null;
}

/** Search volume data for a keyword. */
interface SearchVolumeData {
  keyword: string;
  avgMonthlySearches: number | null;
  monthlyBreakdown: Array<{ month: string; volume: number }> | null;
  competition: string | null;
}

/** Keyword difficulty estimation. */
interface KeywordDifficultyData {
  keyword: string;
  difficulty: number | null;
  difficultyLabel: string;
  competitorCount: number | null;
}

/** Monthly trend data point. */
interface TrendDataPoint {
  month: string;
  volume: number;
  change: number | null;
}

/** Keyword trend data with seasonality info. */
interface KeywordTrendData {
  keyword: string;
  months: number;
  dataPoints: TrendDataPoint[];
  peakMonth: string | null;
  lowMonth: string | null;
  yearOverYearChange: number | null;
}

// ---------------------------------------------------------------------------
// Keyword API Adapter interface and implementations
// ---------------------------------------------------------------------------

/**
 * Abstract adapter interface for keyword research API providers.
 * Implement this to support a different provider.
 */
interface KeywordApiAdapter {
  /** Get keyword suggestions for a seed keyword. */
  getSuggestions(
    seedKeyword: string,
    language: string,
    country: string
  ): Promise<KeywordSuggestion[]>;

  /** Get related/similar keywords. */
  getRelatedKeywords(keyword: string): Promise<KeywordSuggestion[]>;

  /** Get keyword difficulty scores. */
  getKeywordDifficulty(keywords: string[]): Promise<KeywordDifficultyData[]>;

  /** Get search volume data. */
  getSearchVolume(keywords: string[]): Promise<SearchVolumeData[]>;

  /** Get keyword trend/seasonality data. */
  getKeywordTrends(keyword: string, months: number): Promise<KeywordTrendData>;

  /** Generate long-tail keyword suggestions. */
  getLongTailSuggestions(
    seedKeyword: string,
    count: number
  ): Promise<KeywordSuggestion[]>;
}

/**
 * DataForSEO adapter implementation.
 * See: https://docs.dataforseo.com/
 */
class DataForSeoAdapter implements KeywordApiAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getSuggestions(
    seedKeyword: string,
    language: string,
    country: string
  ): Promise<KeywordSuggestion[]> {
    const body = JSON.stringify([
      {
        keyword: seedKeyword,
        language_code: language,
        location_code: this.getLocationCode(country),
      },
    ]);

    const data = await this.apiPost(
      "/v3/dataforseo_labs/google/keyword_suggestions/live",
      body
    );
    const results = data?.tasks?.[0]?.result?.[0]?.items || [];

    return results.map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) || "",
      searchVolume: (item.search_volume as number) || null,
      competition: (item.competition as string) || null,
      cpc: (item.cpc as number) || null,
      difficulty: (item.keyword_difficulty as number) || null,
    }));
  }

  async getRelatedKeywords(keyword: string): Promise<KeywordSuggestion[]> {
    const body = JSON.stringify([
      {
        keyword,
        language_code: "ja",
        location_code: 2392, // Japan
      },
    ]);

    const data = await this.apiPost(
      "/v3/dataforseo_labs/google/related_keywords/live",
      body
    );
    const results = data?.tasks?.[0]?.result?.[0]?.items || [];

    return results.map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) || "",
      searchVolume: (item.search_volume as number) || null,
      competition: (item.competition as string) || null,
      cpc: (item.cpc as number) || null,
      difficulty: (item.keyword_difficulty as number) || null,
    }));
  }

  async getKeywordDifficulty(
    keywords: string[]
  ): Promise<KeywordDifficultyData[]> {
    const body = JSON.stringify([
      {
        keywords,
        language_code: "ja",
        location_code: 2392,
      },
    ]);

    const data = await this.apiPost(
      "/v3/dataforseo_labs/google/bulk_keyword_difficulty/live",
      body
    );
    const results = data?.tasks?.[0]?.result || [];

    return keywords.map((kw, index) => {
      const item = results[index] || {};
      const difficulty = (item.keyword_difficulty as number) || null;
      return {
        keyword: kw,
        difficulty,
        difficultyLabel: this.getDifficultyLabel(difficulty),
        competitorCount: (item.competitor_count as number) || null,
      };
    });
  }

  async getSearchVolume(keywords: string[]): Promise<SearchVolumeData[]> {
    const body = JSON.stringify([
      {
        keywords,
        language_code: "ja",
        location_code: 2392,
      },
    ]);

    const data = await this.apiPost(
      "/v3/dataforseo_labs/google/bulk_search_volume/live",
      body
    );
    const results = data?.tasks?.[0]?.result || [];

    return results.map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) || "",
      avgMonthlySearches: (item.search_volume as number) || null,
      monthlyBreakdown:
        (item.monthly_searches as Array<{
          month: string;
          volume: number;
        }>) || null,
      competition: (item.competition as string) || null,
    }));
  }

  async getKeywordTrends(
    keyword: string,
    months: number
  ): Promise<KeywordTrendData> {
    const body = JSON.stringify([
      {
        keywords: [keyword],
        language_code: "ja",
        location_code: 2392,
      },
    ]);

    const data = await this.apiPost(
      "/v3/dataforseo_labs/google/bulk_search_volume/live",
      body
    );
    const item = data?.tasks?.[0]?.result?.[0] || {};
    const monthlySearches: Array<{ year: number; month: number; search_volume: number }> =
      item.monthly_searches || [];

    const dataPoints: TrendDataPoint[] = monthlySearches
      .slice(0, months)
      .map((ms, index, arr) => ({
        month: `${ms.year}-${String(ms.month).padStart(2, "0")}`,
        volume: ms.search_volume || 0,
        change:
          index > 0 && arr[index - 1].search_volume
            ? ((ms.search_volume - arr[index - 1].search_volume) /
                arr[index - 1].search_volume) *
              100
            : null,
      }));

    const volumes = dataPoints.map((dp) => dp.volume);
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);
    const peakPoint = dataPoints.find((dp) => dp.volume === maxVolume);
    const lowPoint = dataPoints.find((dp) => dp.volume === minVolume);

    // Year-over-year change if we have enough data
    let yearOverYearChange: number | null = null;
    if (dataPoints.length >= 12) {
      const recent = dataPoints[0].volume;
      const yearAgo = dataPoints[11].volume;
      if (yearAgo > 0) {
        yearOverYearChange = ((recent - yearAgo) / yearAgo) * 100;
      }
    }

    return {
      keyword,
      months,
      dataPoints,
      peakMonth: peakPoint?.month || null,
      lowMonth: lowPoint?.month || null,
      yearOverYearChange,
    };
  }

  async getLongTailSuggestions(
    seedKeyword: string,
    count: number
  ): Promise<KeywordSuggestion[]> {
    const body = JSON.stringify([
      {
        keyword: seedKeyword,
        language_code: "ja",
        location_code: 2392,
        limit: count,
        filters: ["keyword_info.search_volume", "<", 1000],
      },
    ]);

    const data = await this.apiPost(
      "/v3/dataforseo_labs/google/keyword_suggestions/live",
      body
    );
    const results = data?.tasks?.[0]?.result?.[0]?.items || [];

    return results
      .filter(
        (item: Record<string, unknown>) =>
          ((item.keyword as string) || "").split(/\s+/).length >= 3
      )
      .slice(0, count)
      .map((item: Record<string, unknown>) => ({
        keyword: (item.keyword as string) || "",
        searchVolume: (item.search_volume as number) || null,
        competition: (item.competition as string) || null,
        cpc: (item.cpc as number) || null,
        difficulty: (item.keyword_difficulty as number) || null,
      }));
  }

  /**
   * Make an authenticated POST request to the DataForSEO API.
   */
  private apiPost(
    endpoint: string,
    body: string
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.dataforseo.com",
        path: endpoint,
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(this.apiKey).toString("base64")}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse API response: ${data}`));
          }
        });
        res.on("error", reject);
      });

      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  /**
   * Convert a country code to a DataForSEO location code.
   */
  private getLocationCode(country: string): number {
    const locationMap: Record<string, number> = {
      jp: 2392,
      us: 2840,
      gb: 2826,
      de: 2276,
      fr: 2250,
      kr: 2410,
      cn: 2156,
      tw: 2158,
      hk: 2344,
    };
    return locationMap[country.toLowerCase()] || 2392; // Default to Japan
  }

  /**
   * Convert a numeric difficulty score to a human-readable label.
   */
  private getDifficultyLabel(difficulty: number | null): string {
    if (difficulty === null) return "unknown";
    if (difficulty <= 20) return "very_easy";
    if (difficulty <= 40) return "easy";
    if (difficulty <= 60) return "moderate";
    if (difficulty <= 80) return "hard";
    return "very_hard";
  }
}

/**
 * Ubersuggest-style adapter implementation.
 * This is a placeholder adapter that demonstrates the pluggable pattern.
 * Replace with actual Ubersuggest API calls when API access is available.
 */
class UbersuggestAdapter implements KeywordApiAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getSuggestions(
    seedKeyword: string,
    language: string,
    country: string
  ): Promise<KeywordSuggestion[]> {
    const data = await this.apiGet(
      `/keywords/suggestions?keyword=${encodeURIComponent(seedKeyword)}` +
        `&language=${language}&country=${country}`
    );
    const results = data?.suggestions || [];

    return results.map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) || "",
      searchVolume: (item.vol as number) || null,
      competition: (item.sd as number)
        ? String(item.sd)
        : null,
      cpc: (item.cpc as number) || null,
      difficulty: (item.sd as number) || null,
    }));
  }

  async getRelatedKeywords(keyword: string): Promise<KeywordSuggestion[]> {
    const data = await this.apiGet(
      `/keywords/related?keyword=${encodeURIComponent(keyword)}&language=ja&country=jp`
    );
    const results = data?.related || [];

    return results.map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) || "",
      searchVolume: (item.vol as number) || null,
      competition: (item.sd as number)
        ? String(item.sd)
        : null,
      cpc: (item.cpc as number) || null,
      difficulty: (item.sd as number) || null,
    }));
  }

  async getKeywordDifficulty(
    keywords: string[]
  ): Promise<KeywordDifficultyData[]> {
    const results: KeywordDifficultyData[] = [];
    for (const keyword of keywords) {
      const data = await this.apiGet(
        `/keywords/difficulty?keyword=${encodeURIComponent(keyword)}&language=ja&country=jp`
      );
      const difficulty = (data?.difficulty as number) || null;
      results.push({
        keyword,
        difficulty,
        difficultyLabel: this.getDifficultyLabel(difficulty),
        competitorCount: (data?.competitor_count as number) || null,
      });
    }
    return results;
  }

  async getSearchVolume(keywords: string[]): Promise<SearchVolumeData[]> {
    const results: SearchVolumeData[] = [];
    for (const keyword of keywords) {
      const data = await this.apiGet(
        `/keywords/volume?keyword=${encodeURIComponent(keyword)}&language=ja&country=jp`
      );
      results.push({
        keyword,
        avgMonthlySearches: (data?.vol as number) || null,
        monthlyBreakdown: (data?.monthly as Array<{ month: string; volume: number }>) || null,
        competition: (data?.competition as string) || null,
      });
    }
    return results;
  }

  async getKeywordTrends(
    keyword: string,
    months: number
  ): Promise<KeywordTrendData> {
    const data = await this.apiGet(
      `/keywords/trends?keyword=${encodeURIComponent(keyword)}&months=${months}&language=ja&country=jp`
    );
    const dataPoints: TrendDataPoint[] = (data?.trends || []).map(
      (item: Record<string, unknown>, index: number, arr: Record<string, unknown>[]) => ({
        month: (item.month as string) || "",
        volume: (item.volume as number) || 0,
        change:
          index > 0 && (arr[index - 1].volume as number)
            ? (((item.volume as number) - (arr[index - 1].volume as number)) /
                (arr[index - 1].volume as number)) *
              100
            : null,
      })
    );

    return {
      keyword,
      months,
      dataPoints,
      peakMonth: (data?.peak_month as string) || null,
      lowMonth: (data?.low_month as string) || null,
      yearOverYearChange: (data?.yoy_change as number) || null,
    };
  }

  async getLongTailSuggestions(
    seedKeyword: string,
    count: number
  ): Promise<KeywordSuggestion[]> {
    const data = await this.apiGet(
      `/keywords/longtail?keyword=${encodeURIComponent(seedKeyword)}` +
        `&count=${count}&language=ja&country=jp`
    );
    const results = data?.suggestions || [];

    return results.slice(0, count).map((item: Record<string, unknown>) => ({
      keyword: (item.keyword as string) || "",
      searchVolume: (item.vol as number) || null,
      competition: (item.sd as number)
        ? String(item.sd)
        : null,
      cpc: (item.cpc as number) || null,
      difficulty: (item.sd as number) || null,
    }));
  }

  /**
   * Make an authenticated GET request to the Ubersuggest-style API.
   */
  private apiGet(endpoint: string): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.ubersuggest.com",
        path: endpoint,
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => {
          data += chunk.toString();
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse API response: ${data}`));
          }
        });
        res.on("error", reject);
      });

      req.on("error", reject);
      req.end();
    });
  }

  /**
   * Convert a numeric difficulty score to a human-readable label.
   */
  private getDifficultyLabel(difficulty: number | null): string {
    if (difficulty === null) return "unknown";
    if (difficulty <= 20) return "very_easy";
    if (difficulty <= 40) return "easy";
    if (difficulty <= 60) return "moderate";
    if (difficulty <= 80) return "hard";
    return "very_hard";
  }
}

/**
 * Create the appropriate keyword API adapter based on the configured provider.
 */
function createKeywordAdapter(): KeywordApiAdapter {
  if (!KEYWORD_API_KEY) {
    throw new Error(
      "KEYWORD_API_KEY environment variable is not set. " +
        "Please provide an API key for the keyword data provider."
    );
  }

  switch (KEYWORD_API_PROVIDER) {
    case "ubersuggest":
      return new UbersuggestAdapter(KEYWORD_API_KEY);
    case "dataforseo":
    default:
      return new DataForSeoAdapter(KEYWORD_API_KEY);
  }
}

// ---------------------------------------------------------------------------
// Zod schemas for tool parameters
// ---------------------------------------------------------------------------

const ResearchKeywordsSchema = z.object({
  seedKeyword: z
    .string()
    .describe("The seed keyword to generate suggestions from"),
  language: z
    .string()
    .default("ja")
    .describe("Language code (default: ja for Japanese)"),
  country: z
    .string()
    .default("jp")
    .describe("Country code (default: jp for Japan)"),
});

const GetRelatedKeywordsSchema = z.object({
  keyword: z
    .string()
    .describe("The keyword to find related keywords for"),
});

const GetKeywordDifficultySchema = z.object({
  keywords: z
    .array(z.string())
    .describe("List of keywords to estimate difficulty for"),
});

const GetSearchVolumeSchema = z.object({
  keywords: z
    .array(z.string())
    .describe("List of keywords to get search volume for"),
});

const GetKeywordTrendsSchema = z.object({
  keyword: z
    .string()
    .describe("The keyword to get trend data for"),
  months: z
    .number()
    .default(12)
    .describe("Number of months of trend data to retrieve (default: 12)"),
});

const SuggestLongTailSchema = z.object({
  seedKeyword: z
    .string()
    .describe("The seed keyword to generate long-tail suggestions from"),
  count: z
    .number()
    .default(20)
    .describe("Number of long-tail suggestions to generate (default: 20)"),
});

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "research_keywords",
    description:
      "Get keyword suggestions and metrics (search volume, competition, CPC, " +
      "difficulty) based on a seed keyword. Targets the Japanese market by default.",
    inputSchema: {
      type: "object" as const,
      properties: {
        seedKeyword: {
          type: "string",
          description: "The seed keyword to generate suggestions from",
        },
        language: {
          type: "string",
          default: "ja",
          description: "Language code (default: ja)",
        },
        country: {
          type: "string",
          default: "jp",
          description: "Country code (default: jp)",
        },
      },
      required: ["seedKeyword"],
    },
  },
  {
    name: "get_related_keywords",
    description:
      "Get related and semantically similar keywords for a given keyword, " +
      "including their search metrics.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword: {
          type: "string",
          description: "The keyword to find related keywords for",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "get_keyword_difficulty",
    description:
      "Estimate the SEO difficulty of ranking for one or more keywords. " +
      "Returns a difficulty score (0-100) and a human-readable label.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "List of keywords to estimate difficulty for",
        },
      },
      required: ["keywords"],
    },
  },
  {
    name: "get_search_volume",
    description:
      "Get estimated monthly search volume for one or more keywords, " +
      "including monthly breakdown and competition level.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keywords: {
          type: "array",
          items: { type: "string" },
          description: "List of keywords to get search volume for",
        },
      },
      required: ["keywords"],
    },
  },
  {
    name: "get_keyword_trends",
    description:
      "Get keyword trend and seasonality data over a specified number of " +
      "months. Identifies peak and low months, and year-over-year change.",
    inputSchema: {
      type: "object" as const,
      properties: {
        keyword: {
          type: "string",
          description: "The keyword to get trend data for",
        },
        months: {
          type: "number",
          default: 12,
          description: "Number of months of data (default: 12)",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "suggest_long_tail",
    description:
      "Generate long-tail keyword suggestions (3+ words) based on a seed " +
      "keyword. Long-tail keywords typically have lower competition and " +
      "higher conversion intent.",
    inputSchema: {
      type: "object" as const,
      properties: {
        seedKeyword: {
          type: "string",
          description: "The seed keyword to generate long-tail suggestions from",
        },
        count: {
          type: "number",
          default: 20,
          description: "Number of suggestions to generate (default: 20)",
        },
      },
      required: ["seedKeyword"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

/**
 * Research keywords based on a seed keyword.
 */
async function handleResearchKeywords(
  params: z.infer<typeof ResearchKeywordsSchema>
): Promise<string> {
  const adapter = createKeywordAdapter();
  const { seedKeyword, language, country } = params;

  const suggestions = await adapter.getSuggestions(
    seedKeyword,
    language,
    country
  );

  return JSON.stringify(
    {
      seedKeyword,
      language,
      country,
      totalSuggestions: suggestions.length,
      suggestions: suggestions.sort(
        (a, b) => (b.searchVolume || 0) - (a.searchVolume || 0)
      ),
    },
    null,
    2
  );
}

/**
 * Get related keywords for a given keyword.
 */
async function handleGetRelatedKeywords(
  params: z.infer<typeof GetRelatedKeywordsSchema>
): Promise<string> {
  const adapter = createKeywordAdapter();
  const { keyword } = params;

  const related = await adapter.getRelatedKeywords(keyword);

  return JSON.stringify(
    {
      keyword,
      totalRelated: related.length,
      relatedKeywords: related.sort(
        (a, b) => (b.searchVolume || 0) - (a.searchVolume || 0)
      ),
    },
    null,
    2
  );
}

/**
 * Get keyword difficulty estimates.
 */
async function handleGetKeywordDifficulty(
  params: z.infer<typeof GetKeywordDifficultySchema>
): Promise<string> {
  const adapter = createKeywordAdapter();
  const { keywords } = params;

  const difficulties = await adapter.getKeywordDifficulty(keywords);

  return JSON.stringify(
    {
      totalKeywords: keywords.length,
      results: difficulties,
      summary: {
        veryEasy: difficulties.filter((d) => d.difficultyLabel === "very_easy")
          .length,
        easy: difficulties.filter((d) => d.difficultyLabel === "easy").length,
        moderate: difficulties.filter((d) => d.difficultyLabel === "moderate")
          .length,
        hard: difficulties.filter((d) => d.difficultyLabel === "hard").length,
        veryHard: difficulties.filter(
          (d) => d.difficultyLabel === "very_hard"
        ).length,
      },
    },
    null,
    2
  );
}

/**
 * Get search volume data for keywords.
 */
async function handleGetSearchVolume(
  params: z.infer<typeof GetSearchVolumeSchema>
): Promise<string> {
  const adapter = createKeywordAdapter();
  const { keywords } = params;

  const volumes = await adapter.getSearchVolume(keywords);

  return JSON.stringify(
    {
      totalKeywords: keywords.length,
      results: volumes.sort(
        (a, b) =>
          (b.avgMonthlySearches || 0) - (a.avgMonthlySearches || 0)
      ),
    },
    null,
    2
  );
}

/**
 * Get keyword trend and seasonality data.
 */
async function handleGetKeywordTrends(
  params: z.infer<typeof GetKeywordTrendsSchema>
): Promise<string> {
  const adapter = createKeywordAdapter();
  const { keyword, months } = params;

  const trends = await adapter.getKeywordTrends(keyword, months);

  return JSON.stringify(trends, null, 2);
}

/**
 * Generate long-tail keyword suggestions.
 */
async function handleSuggestLongTail(
  params: z.infer<typeof SuggestLongTailSchema>
): Promise<string> {
  const adapter = createKeywordAdapter();
  const { seedKeyword, count } = params;

  const suggestions = await adapter.getLongTailSuggestions(seedKeyword, count);

  return JSON.stringify(
    {
      seedKeyword,
      requestedCount: count,
      totalSuggestions: suggestions.length,
      suggestions: suggestions.sort(
        (a, b) => (b.searchVolume || 0) - (a.searchVolume || 0)
      ),
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
    name: "keyword-research",
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
      case "research_keywords": {
        const parsed = ResearchKeywordsSchema.parse(args);
        result = await handleResearchKeywords(parsed);
        break;
      }
      case "get_related_keywords": {
        const parsed = GetRelatedKeywordsSchema.parse(args);
        result = await handleGetRelatedKeywords(parsed);
        break;
      }
      case "get_keyword_difficulty": {
        const parsed = GetKeywordDifficultySchema.parse(args);
        result = await handleGetKeywordDifficulty(parsed);
        break;
      }
      case "get_search_volume": {
        const parsed = GetSearchVolumeSchema.parse(args);
        result = await handleGetSearchVolume(parsed);
        break;
      }
      case "get_keyword_trends": {
        const parsed = GetKeywordTrendsSchema.parse(args);
        result = await handleGetKeywordTrends(parsed);
        break;
      }
      case "suggest_long_tail": {
        const parsed = SuggestLongTailSchema.parse(args);
        result = await handleSuggestLongTail(parsed);
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
  console.error("Keyword Research MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
