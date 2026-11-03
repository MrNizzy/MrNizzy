export interface TextSegment {
  text: string;
  /** True for a percentage such as `~50%` or `>40%`. */
  metric: boolean;
}

// Optional `~`, `>`, `<` or `+` prefix, a number and a percent sign.
const METRIC = /[~<>+]?\d+(?:[.,]\d+)?%/g;

/** Splits a sentence into plain-text and metric segments, in order. */
export function splitMetrics(value: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let last = 0;

  for (const match of value.matchAll(METRIC)) {
    if (match.index > last) {
      segments.push({ text: value.slice(last, match.index), metric: false });
    }
    segments.push({ text: match[0], metric: true });
    last = match.index + match[0].length;
  }

  if (last < value.length) {
    segments.push({ text: value.slice(last), metric: false });
  }
  return segments;
}
