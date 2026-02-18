import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoreBreakdown {
  /** Name of the check */
  name: string;
  /** Maximum possible points */
  maxPoints: number;
  /** Earned points */
  points: number;
  /** Human-readable detail */
  detail: string;
}

export interface ContentScore {
  /** Overall score 0-100 */
  total: number;
  /** Maximum achievable score */
  maxTotal: number;
  /** Individual check results */
  breakdown: ScoreBreakdown[];
  /** Whether the article passes the minimum quality threshold */
  pass: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the first H1 / title line from the markdown (# Title). */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

/** Extract the description front-matter value or first paragraph. */
function extractDescription(content: string): string {
  // Check YAML front-matter first
  const fmMatch = content.match(/^---\n[\s\S]*?description:\s*["']?(.+?)["']?\n[\s\S]*?---/);
  if (fmMatch) return fmMatch[1].trim();

  // Fallback: first non-heading, non-empty paragraph
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
      return trimmed;
    }
  }
  return "";
}

/** Count headings at a given level (e.g. 2 for H2). */
function countHeadings(content: string, level: number): number {
  const regex = new RegExp(`^${"#".repeat(level)}\\s+`, "gm");
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

/** Very basic keyword density: frequency of each word normalised by total. */
function getKeywordDensity(content: string): Map<string, number> {
  // Strip markdown syntax, keep Japanese & ASCII words
  const cleaned = content
    .replace(/^#+\s+/gm, "")
    .replace(/[*_`~\[\]()>|]/g, "")
    .replace(/https?:\/\/\S+/g, "");

  // Split on whitespace and punctuation suitable for Japanese mixed text
  const words = cleaned
    .split(/[\s、。！？・\n\r\t]+/)
    .map((w) => w.toLowerCase().trim())
    .filter((w) => w.length > 0);

  const totalWords = words.length;
  const freq = new Map<string, number>();

  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  // Convert counts to density percentages
  const density = new Map<string, number>();
  for (const [word, count] of freq) {
    density.set(word, (count / totalWords) * 100);
  }

  return density;
}

/** Count markdown internal links (links starting with / ). */
function countInternalLinks(content: string): number {
  const matches = content.match(/\[.+?\]\(\/.+?\)/g);
  return matches ? matches.length : 0;
}

/** Detect whether a FAQ section exists. */
function hasFaqSection(content: string): boolean {
  return /##\s*.*(FAQ|よくある質問|Q&A|faq).*/im.test(content);
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

const PASS_THRESHOLD = 60; // out of 100

export function scoreContent(filePath: string): ContentScore {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf-8");

  const breakdown: ScoreBreakdown[] = [];

  // 1. Title length check (max 20 pts)
  const title = extractTitle(content);
  const titleLen = title.length;
  let titlePoints = 0;
  let titleDetail: string;
  if (titleLen > 0 && titleLen <= 32) {
    titlePoints = 20;
    titleDetail = `タイトル「${title}」は${titleLen}文字（32文字以内 OK）`;
  } else if (titleLen > 32) {
    titlePoints = 10;
    titleDetail = `タイトルが${titleLen}文字で32文字を超過しています`;
  } else {
    titlePoints = 0;
    titleDetail = "タイトル（H1）が検出されませんでした";
  }
  breakdown.push({ name: "タイトル長", maxPoints: 20, points: titlePoints, detail: titleDetail });

  // 2. Description length check (max 15 pts)
  const description = extractDescription(content);
  const descLen = description.length;
  let descPoints = 0;
  let descDetail: string;
  if (descLen > 0 && descLen <= 120) {
    descPoints = 15;
    descDetail = `ディスクリプションは${descLen}文字（120文字以内 OK）`;
  } else if (descLen > 120) {
    descPoints = 8;
    descDetail = `ディスクリプションが${descLen}文字で120文字を超過しています`;
  } else {
    descPoints = 0;
    descDetail = "ディスクリプションが検出されませんでした";
  }
  breakdown.push({ name: "ディスクリプション長", maxPoints: 15, points: descPoints, detail: descDetail });

  // 3. Heading count (max 20 pts)
  const h2Count = countHeadings(content, 2);
  let headingPoints = 0;
  let headingDetail: string;
  if (h2Count >= 5 && h2Count <= 8) {
    headingPoints = 20;
    headingDetail = `H2見出しが${h2Count}個（5〜8個の範囲内 OK）`;
  } else if (h2Count >= 3 && h2Count <= 10) {
    headingPoints = 12;
    headingDetail = `H2見出しが${h2Count}個（推奨は5〜8個）`;
  } else if (h2Count > 0) {
    headingPoints = 5;
    headingDetail = `H2見出しが${h2Count}個（推奨は5〜8個）`;
  } else {
    headingPoints = 0;
    headingDetail = "H2見出しが検出されませんでした";
  }
  breakdown.push({ name: "見出し構成", maxPoints: 20, points: headingPoints, detail: headingDetail });

  // 4. Keyword density – check that at least some words appear 2%+ (max 15 pts)
  const density = getKeywordDensity(content);
  const highDensityWords = [...density.entries()]
    .filter(([, d]) => d >= 1.0 && d <= 5.0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  let kwPoints = 0;
  let kwDetail: string;
  if (highDensityWords.length >= 3) {
    kwPoints = 15;
    kwDetail = `主要キーワード: ${highDensityWords.map(([w, d]) => `${w}(${d.toFixed(1)}%)`).join(", ")}`;
  } else if (highDensityWords.length >= 1) {
    kwPoints = 8;
    kwDetail = `キーワード少なめ: ${highDensityWords.map(([w, d]) => `${w}(${d.toFixed(1)}%)`).join(", ")}`;
  } else {
    kwPoints = 0;
    kwDetail = "適切な頻度のキーワードが検出されませんでした";
  }
  breakdown.push({ name: "キーワード密度", maxPoints: 15, points: kwPoints, detail: kwDetail });

  // 5. Internal links (max 15 pts)
  const linkCount = countInternalLinks(content);
  let linkPoints = 0;
  let linkDetail: string;
  if (linkCount >= 3) {
    linkPoints = 15;
    linkDetail = `内部リンクが${linkCount}本（3本以上 OK）`;
  } else if (linkCount >= 1) {
    linkPoints = 8;
    linkDetail = `内部リンクが${linkCount}本（推奨は3本以上）`;
  } else {
    linkPoints = 0;
    linkDetail = "内部リンクが検出されませんでした";
  }
  breakdown.push({ name: "内部リンク", maxPoints: 15, points: linkPoints, detail: linkDetail });

  // 6. FAQ section (max 15 pts)
  const faq = hasFaqSection(content);
  const faqPoints = faq ? 15 : 0;
  const faqDetail = faq ? "FAQセクションあり" : "FAQセクションが見つかりませんでした";
  breakdown.push({ name: "FAQセクション", maxPoints: 15, points: faqPoints, detail: faqDetail });

  // Totals
  const maxTotal = breakdown.reduce((sum, b) => sum + b.maxPoints, 0);
  const total = breakdown.reduce((sum, b) => sum + b.points, 0);
  const normalised = Math.round((total / maxTotal) * 100);

  return {
    total: normalised,
    maxTotal: 100,
    breakdown,
    pass: normalised >= PASS_THRESHOLD,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: ts-node content-scorer.ts <article.md>");
    process.exit(1);
  }

  const score = scoreContent(filePath);

  console.log("\n========================================");
  console.log("  コンテンツスコア結果");
  console.log("========================================\n");

  for (const item of score.breakdown) {
    const status = item.points === item.maxPoints ? "✓" : item.points > 0 ? "△" : "✗";
    console.log(`  ${status} ${item.name}: ${item.points}/${item.maxPoints}pt`);
    console.log(`    ${item.detail}\n`);
  }

  console.log("----------------------------------------");
  console.log(`  合計スコア: ${score.total}/100`);
  console.log(`  判定: ${score.pass ? "PASS" : "FAIL"}`);
  console.log("========================================\n");

  process.exit(score.pass ? 0 : 1);
}
