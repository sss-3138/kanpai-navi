import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReadabilityIssue {
  /** Issue severity */
  severity: "info" | "warning" | "error";
  /** Check that flagged this issue */
  check: string;
  /** Human-readable message */
  message: string;
  /** Optional line number or location hint */
  location?: string;
}

export interface ReadabilityReport {
  /** Total sentence count */
  sentenceCount: number;
  /** Total paragraph count */
  paragraphCount: number;
  /** Average sentence length (in characters) */
  avgSentenceLength: number;
  /** Number of overly long paragraphs (>300 chars) */
  longParagraphCount: number;
  /** Heading distribution: map of heading level to count */
  headingDistribution: Record<string, number>;
  /** Whether bullet/list elements are present */
  hasLists: boolean;
  /** Number of list items found */
  listItemCount: number;
  /** Identified issues and suggestions */
  issues: ReadabilityIssue[];
  /** Overall readability rating */
  rating: "excellent" | "good" | "fair" | "poor";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Remove YAML front-matter from content. */
function stripFrontMatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

/** Remove markdown syntax to get plain-ish text. */
function stripMarkdown(content: string): string {
  return content
    .replace(/^#+\s+.*$/gm, "") // headings
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[(.+?)\]\(.*?\)/g, "$1") // links → text
    .replace(/[*_`~>|]/g, "")
    .replace(/^[-*+]\s+/gm, "") // list markers
    .replace(/^\d+\.\s+/gm, "") // ordered list markers
    .trim();
}

/** Split text into sentences using Japanese and Western punctuation. */
function splitSentences(text: string): string[] {
  // Split on 。！？.!? followed by whitespace or end-of-line
  const sentences = text
    .split(/(?<=[。！？.!?])\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences;
}

/** Split content into paragraphs (blank-line delimited). */
function splitParagraphs(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !p.startsWith("#"));
}

/** Count headings per level. */
function getHeadingDistribution(content: string): Record<string, number> {
  const dist: Record<string, number> = {};
  const matches = content.matchAll(/^(#{1,6})\s+/gm);
  for (const m of matches) {
    const level = `H${m[1].length}`;
    dist[level] = (dist[level] || 0) + 1;
  }
  return dist;
}

/** Count list items (unordered and ordered). */
function countListItems(content: string): number {
  const unordered = content.match(/^[-*+]\s+/gm);
  const ordered = content.match(/^\d+\.\s+/gm);
  return (unordered ? unordered.length : 0) + (ordered ? ordered.length : 0);
}

// ---------------------------------------------------------------------------
// Main checker
// ---------------------------------------------------------------------------

const LONG_PARAGRAPH_THRESHOLD = 300; // characters
const LONG_SENTENCE_THRESHOLD = 100; // characters
const IDEAL_AVG_SENTENCE_LENGTH = 60; // characters

export function checkReadability(filePath: string): ReadabilityReport {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, "utf-8");
  const stripped = stripFrontMatter(content);

  const issues: ReadabilityIssue[] = [];

  // --- Paragraphs ---
  const paragraphs = splitParagraphs(stripped);
  const paragraphCount = paragraphs.length;

  const longParagraphs = paragraphs.filter((p) => stripMarkdown(p).length > LONG_PARAGRAPH_THRESHOLD);
  const longParagraphCount = longParagraphs.length;

  if (longParagraphCount > 0) {
    issues.push({
      severity: longParagraphCount > 3 ? "error" : "warning",
      check: "段落の長さ",
      message: `${longParagraphCount}個の段落が${LONG_PARAGRAPH_THRESHOLD}文字を超えています。読みやすさのために分割を検討してください。`,
    });
  }

  // --- Sentences ---
  const plainText = stripMarkdown(stripped);
  const sentences = splitSentences(plainText);
  const sentenceCount = sentences.length;

  const totalSentenceChars = sentences.reduce((sum, s) => sum + s.length, 0);
  const avgSentenceLength = sentenceCount > 0 ? Math.round(totalSentenceChars / sentenceCount) : 0;

  if (avgSentenceLength > IDEAL_AVG_SENTENCE_LENGTH) {
    issues.push({
      severity: avgSentenceLength > 80 ? "error" : "warning",
      check: "文の平均長",
      message: `平均文長が${avgSentenceLength}文字です（推奨: ${IDEAL_AVG_SENTENCE_LENGTH}文字以下）。短い文を増やしましょう。`,
    });
  }

  // Flag individual long sentences
  const longSentences = sentences.filter((s) => s.length > LONG_SENTENCE_THRESHOLD);
  if (longSentences.length > 0) {
    issues.push({
      severity: "warning",
      check: "長い文",
      message: `${longSentences.length}個の文が${LONG_SENTENCE_THRESHOLD}文字を超えています。`,
    });
  }

  // --- Headings ---
  const headingDistribution = getHeadingDistribution(stripped);
  const h2Count = headingDistribution["H2"] || 0;
  const h3Count = headingDistribution["H3"] || 0;

  if (h2Count < 5) {
    issues.push({
      severity: h2Count < 3 ? "error" : "warning",
      check: "見出し構成",
      message: `H2見出しが${h2Count}個です（推奨: 5〜8個）。記事構成の充実を検討してください。`,
    });
  } else if (h2Count > 8) {
    issues.push({
      severity: "warning",
      check: "見出し構成",
      message: `H2見出しが${h2Count}個です（推奨: 5〜8個）。記事の焦点を絞ることを検討してください。`,
    });
  }

  if (h2Count > 3 && h3Count === 0) {
    issues.push({
      severity: "info",
      check: "見出し階層",
      message: "H3見出しがありません。詳細なサブセクションを追加すると読みやすくなります。",
    });
  }

  // --- Lists ---
  const listItemCount = countListItems(stripped);
  const hasLists = listItemCount > 0;

  if (!hasLists) {
    issues.push({
      severity: "warning",
      check: "リスト要素",
      message: "箇条書きが使われていません。ポイントをリスト化すると読みやすくなります。",
    });
  }

  // --- Overall rating ---
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  let rating: ReadabilityReport["rating"];
  if (errorCount === 0 && warningCount === 0) {
    rating = "excellent";
  } else if (errorCount === 0 && warningCount <= 2) {
    rating = "good";
  } else if (errorCount <= 1) {
    rating = "fair";
  } else {
    rating = "poor";
  }

  return {
    sentenceCount,
    paragraphCount,
    avgSentenceLength,
    longParagraphCount,
    headingDistribution,
    hasLists,
    listItemCount,
    issues,
    rating,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: ts-node readability-checker.ts <article.md>");
    process.exit(1);
  }

  const report = checkReadability(filePath);

  console.log("\n========================================");
  console.log("  読みやすさチェック結果");
  console.log("========================================\n");

  console.log(`  文の数: ${report.sentenceCount}`);
  console.log(`  段落の数: ${report.paragraphCount}`);
  console.log(`  平均文長: ${report.avgSentenceLength}文字`);
  console.log(`  長い段落: ${report.longParagraphCount}個`);
  console.log(`  リスト項目: ${report.listItemCount}個`);
  console.log(`  見出し構成: ${JSON.stringify(report.headingDistribution)}`);
  console.log();

  if (report.issues.length === 0) {
    console.log("  問題は検出されませんでした。\n");
  } else {
    console.log("  検出された問題:\n");
    for (const issue of report.issues) {
      const icon =
        issue.severity === "error" ? "✗" : issue.severity === "warning" ? "△" : "ℹ";
      console.log(`  ${icon} [${issue.severity}] ${issue.check}`);
      console.log(`    ${issue.message}\n`);
    }
  }

  console.log("----------------------------------------");
  console.log(`  総合評価: ${report.rating.toUpperCase()}`);
  console.log("========================================\n");

  process.exit(report.rating === "poor" ? 1 : 0);
}
