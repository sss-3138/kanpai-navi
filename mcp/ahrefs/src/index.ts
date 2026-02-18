/**
 * Ahrefs API MCP Server for kanpai-navi.
 *
 * Provides tools to query backlink data, domain ratings, organic keyword data,
 * and competitor analysis via the Ahrefs API v3.
 *
 * Environment variables:
 *   AHREFS_API_TOKEN - Ahrefs API Bearer token
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

const AHREFS_API_TOKEN = process.env.AHREFS_API_TOKEN || "";
const DEFAULT_TARGET = "kanpai-navi.com";

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

function ahrefsGet(
  endpoint: string,
  params: Record<string, string>
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    if (!AHREFS_API_TOKEN) {
      reject(
        new Error(
          "AHREFS_API_TOKEN environment variable is not set. " +
            "Please provide your Ahrefs API token."
        )
      );
      return;
    }

    const query = new URLSearchParams(params).toString();
    const url = `https://api.ahrefs.com/v3/${endpoint}?${query}`;

    const options = {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${AHREFS_API_TOKEN}`,
      },
    };

    const req = https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Failed to parse Ahrefs API response: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Zod schemas for tool parameters
// ---------------------------------------------------------------------------

const GetDomainOverviewSchema = z.object({
  target: z
    .string()
    .default(DEFAULT_TARGET)
    .describe("Target domain to analyze (default: kanpai-navi.com)"),
});

const GetBacklinksSchema = z.object({
  target: z
    .string()
    .default(DEFAULT_TARGET)
    .describe("Target domain or URL to get backlinks for"),
  limit: z
    .number()
    .default(50)
    .describe("Maximum number of backlinks to return (default: 50)"),
  mode: z
    .enum(["domain", "exact", "prefix"])
    .default("domain")
    .describe("Target matching mode: domain, exact URL, or URL prefix"),
});

const GetOrganicKeywordsSchema = z.object({
  target: z
    .string()
    .default(DEFAULT_TARGET)
    .describe("Target domain to get organic keywords for"),
  country: z
    .string()
    .default("jp")
    .describe("Country code for organic search data (default: jp)"),
  limit: z
    .number()
    .default(100)
    .describe("Maximum number of keywords to return (default: 100)"),
});

const GetCompetingDomainsSchema = z.object({
  target: z
    .string()
    .default(DEFAULT_TARGET)
    .describe("Target domain to find competitors for"),
  country: z
    .string()
    .default("jp")
    .describe("Country code (default: jp)"),
});

const GetTopPagesSchema = z.object({
  target: z
    .string()
    .default(DEFAULT_TARGET)
    .describe("Target domain to get top pages for"),
  country: z
    .string()
    .default("jp")
    .describe("Country code (default: jp)"),
  limit: z
    .number()
    .default(50)
    .describe("Maximum number of pages to return (default: 50)"),
});

const GetReferringDomainsSchema = z.object({
  target: z
    .string()
    .default(DEFAULT_TARGET)
    .describe("Target domain to get referring domains for"),
  limit: z
    .number()
    .default(50)
    .describe("Maximum number of referring domains to return (default: 50)"),
});

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS: Tool[] = [
  {
    name: "get_domain_overview",
    description:
      "Get domain overview metrics from Ahrefs including Domain Rating (DR), " +
      "referring domains count, organic traffic, organic keywords count, and backlink count.",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string",
          default: DEFAULT_TARGET,
          description: "Target domain to analyze",
        },
      },
      required: [],
    },
  },
  {
    name: "get_backlinks",
    description:
      "Get backlink data from Ahrefs for a domain or URL including referring page, " +
      "anchor text, Domain Rating of referring domain, and link type.",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string",
          default: DEFAULT_TARGET,
          description: "Target domain or URL",
        },
        limit: {
          type: "number",
          default: 50,
          description: "Maximum number of backlinks to return",
        },
        mode: {
          type: "string",
          enum: ["domain", "exact", "prefix"],
          default: "domain",
          description: "Target matching mode",
        },
      },
      required: [],
    },
  },
  {
    name: "get_organic_keywords",
    description:
      "Get organic keyword rankings from Ahrefs for a domain including keyword, " +
      "position, search volume, traffic estimate, URL, and keyword difficulty.",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string",
          default: DEFAULT_TARGET,
          description: "Target domain",
        },
        country: {
          type: "string",
          default: "jp",
          description: "Country code (default: jp for Japan)",
        },
        limit: {
          type: "number",
          default: 100,
          description: "Maximum number of keywords to return",
        },
      },
      required: [],
    },
  },
  {
    name: "get_competing_domains",
    description:
      "Get competing domains from Ahrefs that share organic keywords with the " +
      "target domain, including overlap metrics and Domain Rating.",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string",
          default: DEFAULT_TARGET,
          description: "Target domain",
        },
        country: {
          type: "string",
          default: "jp",
          description: "Country code (default: jp for Japan)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_top_pages",
    description:
      "Get top pages by organic traffic from Ahrefs for a domain including " +
      "URL, organic traffic estimate, organic keywords count, and top keyword.",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string",
          default: DEFAULT_TARGET,
          description: "Target domain",
        },
        country: {
          type: "string",
          default: "jp",
          description: "Country code (default: jp for Japan)",
        },
        limit: {
          type: "number",
          default: 50,
          description: "Maximum number of pages to return",
        },
      },
      required: [],
    },
  },
  {
    name: "get_referring_domains",
    description:
      "Get referring domains from Ahrefs for a domain including domain name, " +
      "Domain Rating, backlink count, first seen and last seen dates.",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string",
          default: DEFAULT_TARGET,
          description: "Target domain",
        },
        limit: {
          type: "number",
          default: 50,
          description: "Maximum number of referring domains to return",
        },
      },
      required: [],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

async function handleGetDomainOverview(
  params: z.infer<typeof GetDomainOverviewSchema>
): Promise<string> {
  const { target } = params;

  const data = await ahrefsGet("site-explorer/overview", {
    target,
    output: "json",
    mode: "domain",
  });

  const metrics = data.metrics as Record<string, unknown> | undefined;

  const overview = {
    target,
    domainRating: metrics?.domain_rating ?? data.domain_rating ?? null,
    referringDomains: metrics?.refdomains ?? data.refdomains ?? null,
    backlinks: metrics?.backlinks ?? data.backlinks ?? null,
    organicTraffic: metrics?.org_traffic ?? data.org_traffic ?? null,
    organicKeywords: metrics?.org_keywords ?? data.org_keywords ?? null,
    paidTraffic: metrics?.paid_traffic ?? data.paid_traffic ?? null,
    paidKeywords: metrics?.paid_keywords ?? data.paid_keywords ?? null,
  };

  return JSON.stringify({ target, overview }, null, 2);
}

async function handleGetBacklinks(
  params: z.infer<typeof GetBacklinksSchema>
): Promise<string> {
  const { target, limit, mode } = params;

  const data = await ahrefsGet("site-explorer/all-backlinks", {
    target,
    output: "json",
    mode,
    limit: String(limit),
    order_by: "domain_rating_source:desc",
    select: [
      "url_from",
      "url_to",
      "anchor",
      "domain_rating_source",
      "first_seen",
      "last_seen",
      "link_type",
      "nofollow",
    ].join(","),
  });

  const backlinks = Array.isArray(data.backlinks)
    ? data.backlinks.map((bl: Record<string, unknown>) => ({
        urlFrom: bl.url_from,
        urlTo: bl.url_to,
        anchor: bl.anchor,
        domainRating: bl.domain_rating_source,
        firstSeen: bl.first_seen,
        lastSeen: bl.last_seen,
        linkType: bl.link_type,
        nofollow: bl.nofollow,
      }))
    : [];

  return JSON.stringify(
    { target, mode, totalReturned: backlinks.length, backlinks },
    null,
    2
  );
}

async function handleGetOrganicKeywords(
  params: z.infer<typeof GetOrganicKeywordsSchema>
): Promise<string> {
  const { target, country, limit } = params;

  const data = await ahrefsGet("site-explorer/organic-keywords", {
    target,
    output: "json",
    mode: "domain",
    country,
    limit: String(limit),
    order_by: "volume:desc",
    select: [
      "keyword",
      "position",
      "volume",
      "traffic",
      "url",
      "keyword_difficulty",
      "cpc",
      "serp_features",
    ].join(","),
  });

  const keywords = Array.isArray(data.keywords)
    ? data.keywords.map((kw: Record<string, unknown>) => ({
        keyword: kw.keyword,
        position: kw.position,
        volume: kw.volume,
        traffic: kw.traffic,
        url: kw.url,
        keywordDifficulty: kw.keyword_difficulty,
        cpc: kw.cpc,
        serpFeatures: kw.serp_features,
      }))
    : [];

  return JSON.stringify(
    { target, country, totalReturned: keywords.length, keywords },
    null,
    2
  );
}

async function handleGetCompetingDomains(
  params: z.infer<typeof GetCompetingDomainsSchema>
): Promise<string> {
  const { target, country } = params;

  const data = await ahrefsGet("site-explorer/competing-domains", {
    target,
    output: "json",
    mode: "domain",
    country,
  });

  const competitors = Array.isArray(data.competing_domains)
    ? data.competing_domains.map((c: Record<string, unknown>) => ({
        domain: c.domain,
        domainRating: c.domain_rating,
        commonKeywords: c.keywords_top10_common,
        organicTraffic: c.org_traffic,
        organicKeywords: c.org_keywords,
      }))
    : [];

  return JSON.stringify(
    { target, country, totalCompetitors: competitors.length, competitors },
    null,
    2
  );
}

async function handleGetTopPages(
  params: z.infer<typeof GetTopPagesSchema>
): Promise<string> {
  const { target, country, limit } = params;

  const data = await ahrefsGet("site-explorer/top-pages", {
    target,
    output: "json",
    mode: "domain",
    country,
    limit: String(limit),
    order_by: "org_traffic:desc",
    select: [
      "url",
      "org_traffic",
      "org_keywords",
      "top_keyword",
      "top_keyword_volume",
      "top_keyword_position",
    ].join(","),
  });

  const pages = Array.isArray(data.pages)
    ? data.pages.map((p: Record<string, unknown>, index: number) => ({
        rank: index + 1,
        url: p.url,
        organicTraffic: p.org_traffic,
        organicKeywords: p.org_keywords,
        topKeyword: p.top_keyword,
        topKeywordVolume: p.top_keyword_volume,
        topKeywordPosition: p.top_keyword_position,
      }))
    : [];

  return JSON.stringify(
    { target, country, totalReturned: pages.length, pages },
    null,
    2
  );
}

async function handleGetReferringDomains(
  params: z.infer<typeof GetReferringDomainsSchema>
): Promise<string> {
  const { target, limit } = params;

  const data = await ahrefsGet("site-explorer/refdomains", {
    target,
    output: "json",
    mode: "domain",
    limit: String(limit),
    order_by: "domain_rating:desc",
    select: [
      "domain",
      "domain_rating",
      "backlinks",
      "first_seen",
      "last_seen",
    ].join(","),
  });

  const domains = Array.isArray(data.refdomains)
    ? data.refdomains.map((d: Record<string, unknown>) => ({
        domain: d.domain,
        domainRating: d.domain_rating,
        backlinks: d.backlinks,
        firstSeen: d.first_seen,
        lastSeen: d.last_seen,
      }))
    : [];

  return JSON.stringify(
    { target, totalReturned: domains.length, referringDomains: domains },
    null,
    2
  );
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  {
    name: "ahrefs",
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
      case "get_domain_overview": {
        const parsed = GetDomainOverviewSchema.parse(args);
        result = await handleGetDomainOverview(parsed);
        break;
      }
      case "get_backlinks": {
        const parsed = GetBacklinksSchema.parse(args);
        result = await handleGetBacklinks(parsed);
        break;
      }
      case "get_organic_keywords": {
        const parsed = GetOrganicKeywordsSchema.parse(args);
        result = await handleGetOrganicKeywords(parsed);
        break;
      }
      case "get_competing_domains": {
        const parsed = GetCompetingDomainsSchema.parse(args);
        result = await handleGetCompetingDomains(parsed);
        break;
      }
      case "get_top_pages": {
        const parsed = GetTopPagesSchema.parse(args);
        result = await handleGetTopPages(parsed);
        break;
      }
      case "get_referring_domains": {
        const parsed = GetReferringDomainsSchema.parse(args);
        result = await handleGetReferringDomains(parsed);
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
  console.error("Ahrefs MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
