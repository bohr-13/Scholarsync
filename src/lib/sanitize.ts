/**
 * Strip `<script>` tags and their content from strings.
 * This prevents React 19 from detecting script-tag-like content
 * in AI-generated text that gets rendered via JSX expressions.
 */

const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi;
const SCRIPT_OPEN_RE = /<script\b[^>]*>/gi;
const SCRIPT_CLOSE_RE = /<\/script\s*>/gi;

export function sanitize(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(SCRIPT_TAG_RE, '')
    .replace(SCRIPT_OPEN_RE, '')
    .replace(SCRIPT_CLOSE_RE, '');
}

/** Sanitize all string fields in an object (e.g. ExtractionResult, StudyPlan) */
export function sanitizeExtraction<T>(data: T): T {
  const out: Record<string, unknown> = { ...data } as Record<string, unknown>;
  for (const key of Object.keys(out)) {
    if (typeof out[key] === 'string') {
      out[key] = sanitize(out[key] as string);
    } else if (Array.isArray(out[key])) {
      out[key] = (out[key] as unknown[]).map((item: unknown) => {
        if (typeof item === 'string') return sanitize(item);
        if (item && typeof item === 'object') return sanitizeExtraction(item);
        return item;
      });
    }
  }
  return out as T;
}
