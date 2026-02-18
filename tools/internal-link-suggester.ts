import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArticleInventoryItem {
  /** Article slug */
  slug: string;
  /** Article title */
  title: string;
  /** Category slug */
  category: string;
  /** URL path */
  url: string;
  /** Primary keywords */
  keywords: string[];
  /** Article status */
  status: "published" | "draft";
}

export interface LinkSuggestion {
  /** Suggested anchor text */
  anchorText: string;
  /** Target URL to link to */
  targetUrl: string;
  /** Target article title */
  targetTitle: string;
  /** Relevance score 0-100 */
  relevance: number;
  /** Reason for the suggestion */
  reason: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INVENTORY_PATH = path.resolve(__dirname, "../data/articles/inventory.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Load the article inventory. */
function loadInventory(): ArticleInventoryItem[] {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.warn(`Warning: inventory file not found at ${INVENTORY_PATH}`);
    return [];
  }
  const raw = fs.readFileSync(INVENTORY_PATH, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : data.articles || [];
}

/** Extract keywords / meaningful phrases from the article text. */
function extractArticleKeywords(content: string): string[] {
  // Remove markdown formatting
  const cleaned = content
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`~\[\]()>|]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "");

  // Split on whitespace / Japanese punctuation
  const words = cleaned
    .split(/[\s、。！？・\n\r\t]+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 2);

  // Count frequency
  const freq = new Map<string, number>();
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // Return top words by frequency (min 2 occurrences)
  return [...freq.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([word]) => word);
}

/** Extract existing internal link targets from the article. */
function extractExistingLinks(content: string): Set<string> {
  const links = new Set<string>();
  const matches = content.matchAll(/\[.+?\]\((\/[^)]+)\)/g);
  for (const m of matches) {
    links.add(m[1]);
  }
  return links;
}

/** Calculate keyword overlap between article keywords and an inventory item. */
function calculateOverlap(articleKeywords: string[], inventoryItem: ArticleInventoryItem): number {
  if (inventoryItem.keywords.length === 0) return 0;

  let matches = 0;
  for (const invKw of inventoryItem.keywords) {
    const lower = invKw.toLowerCase();
    for (const artKw of articleKeywords) {
      if (artKw.includes(lower) || lower.includes(artKw)) {
        matches++;
        break;
      }
    }
  }

  return Math.round((matches / inventoryItem.keywords.length) * 100);
}

// ---------------------------------------------------------------------------
// Main function
// ---------------------------------------------------------------------------

export function suggestLinks(articlePath: string): LinkSuggestion[] {
  const absolutePath = path.resolve(articlePath);
  const content = fs.readFileSync(absolutePath, "utf-8");

  const inventory = loadInventory();
  if (inventory.length === 0) {
    console.warn("No articles found in inventory. Returning empty suggestions.");
    return [];
  }

  const articleKeywords = extractArticleKeywords(content);
  const existingLinks = extractExistingLinks(content);

  // Determine current article slug to exclude self-links
  const currentSlug = path.basename(absolutePath, path.extname(absolutePath));

  const suggestions: LinkSuggestion[] = [];

  for (const item of inventory) {
    // Skip self
    if (item.slug === currentSlug) continue;

    // Skip already linked articles
    if (existingLinks.has(item.url)) continue;

    // Skip draft articles
    if (item.status !== "published") continue;

    // Calculate relevance
    const overlap = calculateOverlap(articleKeywords, item);

    if (overlap >= 20) {
      // Find the best matching keyword for anchor text
      const matchingKeywords = item.keywords.filter((kw) =>
        articleKeywords.some(
          (artKw) => artKw.includes(kw.toLowerCase()) || kw.toLowerCase().includes(artKw)
        )
      );

      const anchorText = matchingKeywords.length > 0 ? matchingKeywords[0] : item.title;

      const reason =
        matchingKeywords.length > 0
          ? `キーワード「${matchingKeywords.join("、")}」が共通しています`
          : `カテゴリ「${item.category}」の関連記事です`;

      suggestions.push({
        anchorText,
        targetUrl: item.url,
        targetTitle: item.title,
        relevance: overlap,
        reason,
      });
    }
  }

  // Sort by relevance descending
  suggestions.sort((a, b) => b.relevance - a.relevance);

  return suggestions;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: ts-node internal-link-suggester.ts <article.md>");
    process.exit(1);
  }

  const suggestions = suggestLinks(filePath);

  console.log("\n========================================");
  console.log("  内部リンク提案");
  console.log("========================================\n");

  if (suggestions.length === 0) {
    console.log("  提案はありません。\n");
  } else {
    for (let i = 0; i < suggestions.length; i++) {
      const s = suggestions[i];
      console.log(`  ${i + 1}. ${s.targetTitle}`);
      console.log(`     URL: ${s.targetUrl}`);
      console.log(`     アンカーテキスト: ${s.anchorText}`);
      console.log(`     関連度: ${s.relevance}%`);
      console.log(`     理由: ${s.reason}\n`);
    }
  }

  console.log("========================================\n");
}
