import * as fs from "fs";
import * as path from "path";
import { scoreContent, ContentScore } from "../tools/content-scorer";
import { checkReadability, ReadabilityReport } from "../tools/readability-checker";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SeoRules {
  title: {
    maxLength: number;
    requireKeyword: boolean;
  };
  description: {
    maxLength: number;
    requireKeyword: boolean;
  };
  headings: {
    minH2: number;
    maxH2: number;
  };
  content: {
    minWordCount: number;
    maxWordCount: number;
  };
  internalLinks: {
    min: number;
  };
  faq: {
    required: boolean;
    minItems: number;
    maxItems: number;
  };
}

interface ValidationResult {
  articlePath: string;
  contentScore: ContentScore;
  readability: ReadabilityReport;
  seoValidation: SeoValidationItem[];
  overallPass: boolean;
}

interface SeoValidationItem {
  rule: string;
  pass: boolean;
  detail: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEO_RULES_PATH = path.resolve(__dirname, "../data/seo-rules.json");

function loadSeoRules(): SeoRules | null {
  if (!fs.existsSync(SEO_RULES_PATH)) {
    console.warn(`Warning: seo-rules.json not found at ${SEO_RULES_PATH}`);
    return null;
  }
  const raw = fs.readFileSync(SEO_RULES_PATH, "utf-8");
  return JSON.parse(raw) as SeoRules;
}

/** Extract title from markdown. */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

/** Extract description from front-matter or first paragraph. */
function extractDescription(content: string): string {
  const fmMatch = content.match(/^---\n[\s\S]*?description:\s*["']?(.+?)["']?\n[\s\S]*?---/);
  if (fmMatch) return fmMatch[1].trim();
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
      return trimmed;
    }
  }
  return "";
}

/** Count H2 headings. */
function countH2(content: string): number {
  const matches = content.match(/^##\s+/gm);
  return matches ? matches.length : 0;
}

/** Approximate character count of body text. */
function countBodyChars(content: string): number {
  const stripped = content
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .replace(/^#+\s+.*$/gm, "")
    .replace(/[*_`~\[\]()>|]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, "")
    .trim();
  return stripped.length;
}

/** Count internal links. */
function countInternalLinks(content: string): number {
  const matches = content.match(/\[.+?\]\(\/.+?\)/g);
  return matches ? matches.length : 0;
}

/** Detect FAQ section and count Q&A items. */
function countFaqItems(content: string): number {
  const faqMatch = content.match(/##\s*.*(FAQ|よくある質問|Q&A).*([\s\S]*?)(?=\n##\s|\n$|$)/im);
  if (!faqMatch) return 0;
  const faqSection = faqMatch[0];
  const h3Matches = faqSection.match(/^###\s+/gm);
  return h3Matches ? h3Matches.length : 0;
}

// ---------------------------------------------------------------------------
// Validation against SEO rules
// ---------------------------------------------------------------------------

function validateSeoRules(content: string, rules: SeoRules): SeoValidationItem[] {
  const results: SeoValidationItem[] = [];

  // Title length
  const title = extractTitle(content);
  const titleOk = title.length > 0 && title.length <= rules.title.maxLength;
  results.push({
    rule: "タイトル長",
    pass: titleOk,
    detail: titleOk
      ? `タイトル「${title}」は${title.length}文字（${rules.title.maxLength}文字以内）`
      : `タイトルが${title.length}文字（上限: ${rules.title.maxLength}文字）`,
  });

  // Description length
  const desc = extractDescription(content);
  const descOk = desc.length > 0 && desc.length <= rules.description.maxLength;
  results.push({
    rule: "ディスクリプション長",
    pass: descOk,
    detail: descOk
      ? `ディスクリプションは${desc.length}文字（${rules.description.maxLength}文字以内）`
      : `ディスクリプションが${desc.length}文字（上限: ${rules.description.maxLength}文字）`,
  });

  // H2 count
  const h2 = countH2(content);
  const h2Ok = h2 >= rules.headings.minH2 && h2 <= rules.headings.maxH2;
  results.push({
    rule: "H2見出し数",
    pass: h2Ok,
    detail: h2Ok
      ? `H2見出しが${h2}個（${rules.headings.minH2}〜${rules.headings.maxH2}個の範囲内）`
      : `H2見出しが${h2}個（推奨: ${rules.headings.minH2}〜${rules.headings.maxH2}個）`,
  });

  // Word count (character count for Japanese)
  const charCount = countBodyChars(content);
  const charOk = charCount >= rules.content.minWordCount && charCount <= rules.content.maxWordCount;
  results.push({
    rule: "文字数",
    pass: charOk,
    detail: charOk
      ? `本文が${charCount}文字（${rules.content.minWordCount}〜${rules.content.maxWordCount}文字の範囲内）`
      : `本文が${charCount}文字（推奨: ${rules.content.minWordCount}〜${rules.content.maxWordCount}文字）`,
  });

  // Internal links
  const linkCount = countInternalLinks(content);
  const linkOk = linkCount >= rules.internalLinks.min;
  results.push({
    rule: "内部リンク数",
    pass: linkOk,
    detail: linkOk
      ? `内部リンクが${linkCount}本（${rules.internalLinks.min}本以上）`
      : `内部リンクが${linkCount}本（最低${rules.internalLinks.min}本必要）`,
  });

  // FAQ
  if (rules.faq.required) {
    const faqCount = countFaqItems(content);
    const faqOk = faqCount >= rules.faq.minItems && faqCount <= rules.faq.maxItems;
    results.push({
      rule: "FAQセクション",
      pass: faqOk,
      detail: faqOk
        ? `FAQ項目が${faqCount}個（${rules.faq.minItems}〜${rules.faq.maxItems}個の範囲内）`
        : faqCount === 0
        ? "FAQセクションが見つかりません"
        : `FAQ項目が${faqCount}個（推奨: ${rules.faq.minItems}〜${rules.faq.maxItems}個）`,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main validation
// ---------------------------------------------------------------------------

function validateArticle(articlePath: string): ValidationResult {
  const absolutePath = path.resolve(articlePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`ERROR: ファイルが見つかりません: ${absolutePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(absolutePath, "utf-8");

  // Run content scoring
  const contentScore = scoreContent(absolutePath);

  // Run readability check
  const readability = checkReadability(absolutePath);

  // Run SEO validation
  const seoRules = loadSeoRules();
  const seoValidation = seoRules ? validateSeoRules(content, seoRules) : [];

  // Overall pass: content score passes AND readability is not poor AND SEO rules all pass
  const seoAllPass = seoValidation.every((v) => v.pass);
  const overallPass = contentScore.pass && readability.rating !== "poor" && (seoValidation.length === 0 || seoAllPass);

  return {
    articlePath: absolutePath,
    contentScore,
    readability,
    seoValidation,
    overallPass,
  };
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

function main(): void {
  const articlePath = process.argv[2];

  if (!articlePath) {
    console.error("Usage: ts-node scripts/validate-article.ts <article.md>");
    console.error("Example: npm run validate -- output/articles/sake-beginner-guide.md");
    process.exit(1);
  }

  const result = validateArticle(articlePath);

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║     記事バリデーション結果               ║");
  console.log("╚══════════════════════════════════════════╝\n");
  console.log(`  ファイル: ${result.articlePath}\n`);

  // --- Content Score ---
  console.log("──────────────────────────────────────────");
  console.log("  [1] コンテンツスコア");
  console.log("──────────────────────────────────────────\n");
  for (const item of result.contentScore.breakdown) {
    const icon = item.points === item.maxPoints ? "PASS" : item.points > 0 ? "WARN" : "FAIL";
    console.log(`  [${icon}] ${item.name}: ${item.points}/${item.maxPoints}pt`);
    console.log(`         ${item.detail}`);
  }
  console.log(`\n  合計: ${result.contentScore.total}/100 (${result.contentScore.pass ? "PASS" : "FAIL"})\n`);

  // --- Readability ---
  console.log("──────────────────────────────────────────");
  console.log("  [2] 読みやすさチェック");
  console.log("──────────────────────────────────────────\n");
  console.log(`  文の数: ${result.readability.sentenceCount}`);
  console.log(`  段落の数: ${result.readability.paragraphCount}`);
  console.log(`  平均文長: ${result.readability.avgSentenceLength}文字`);
  console.log(`  リスト項目: ${result.readability.listItemCount}個`);
  console.log(`  見出し構成: ${JSON.stringify(result.readability.headingDistribution)}`);

  if (result.readability.issues.length > 0) {
    console.log("\n  指摘事項:");
    for (const issue of result.readability.issues) {
      const icon =
        issue.severity === "error" ? "FAIL" : issue.severity === "warning" ? "WARN" : "INFO";
      console.log(`  [${icon}] ${issue.check}: ${issue.message}`);
    }
  }
  console.log(`\n  総合評価: ${result.readability.rating.toUpperCase()}\n`);

  // --- SEO Rules ---
  if (result.seoValidation.length > 0) {
    console.log("──────────────────────────────────────────");
    console.log("  [3] SEOルールバリデーション");
    console.log("──────────────────────────────────────────\n");
    for (const item of result.seoValidation) {
      console.log(`  [${item.pass ? "PASS" : "FAIL"}] ${item.rule}`);
      console.log(`         ${item.detail}`);
    }
    console.log();
  }

  // --- Overall ---
  console.log("══════════════════════════════════════════");
  console.log(`  最終判定: ${result.overallPass ? "PASS - 記事は品質基準を満たしています" : "FAIL - 改善が必要です"}`);
  console.log("══════════════════════════════════════════\n");

  process.exit(result.overallPass ? 0 : 1);
}

main();
