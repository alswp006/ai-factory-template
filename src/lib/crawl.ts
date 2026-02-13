import { TIMEOUT_MS } from "./constants";

export interface CrawlResult {
  ok: true;
  text: string;
}

export interface CrawlError {
  ok: false;
  error: string;
  code: "TIMEOUT" | "NETWORK" | "INVALID_CONTENT" | "UNKNOWN";
}

/**
 * Fetch and extract text from a URL with timeout
 */
export async function crawlUrl(url: string): Promise<CrawlResult | CrawlError> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BlogWriter/1.0 (Tone Training Bot)",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        ok: false,
        error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
        code: "NETWORK",
      };
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return {
        ok: false,
        error: "URL must return HTML or plain text content",
        code: "INVALID_CONTENT",
      };
    }

    const html = await response.text();
    const text = extractTextFromHtml(html);

    if (!text || text.trim().length === 0) {
      return {
        ok: false,
        error: "No text content found in the URL",
        code: "INVALID_CONTENT",
      };
    }

    return { ok: true, text };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        error: `Request timed out after ${TIMEOUT_MS / 1000} seconds`,
        code: "TIMEOUT",
      };
    }

    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to fetch URL",
      code: "NETWORK",
    };
  }
}

/**
 * Extract text content from HTML
 * Strips scripts, styles, and HTML tags
 */
function extractTextFromHtml(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, " ");

  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ");
  text = text.trim();

  return text;
}
