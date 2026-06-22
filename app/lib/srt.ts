export interface SubtitleCue {
  id: string;
  index: number;
  startMs: number;
  endMs: number;
  text: string;
}

export interface SplitOptions {
  /** Total duration of the source audio/video, in seconds */
  totalDurationSec: number;
  /** Max characters allowed per subtitle card (typical YouTube readability target) */
  maxCharsPerCue: number;
  /** Minimum time a cue stays on screen, in seconds */
  minCueDurationSec: number;
  /** Gap left between consecutive cues, in milliseconds (avoids overlap on some players) */
  gapMs: number;
}

export const DEFAULT_SPLIT_OPTIONS: SplitOptions = {
  totalDurationSec: 60,
  maxCharsPerCue: 84,
  minCueDurationSec: 1,
  gapMs: 80,
};

function msToSrtTimestamp(ms: number): string {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  const millis = clamped % 1000;
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

export function msToClockDisplay(ms: number): string {
  const clamped = Math.max(0, Math.round(ms));
  const hours = Math.floor(clamped / 3_600_000);
  const minutes = Math.floor((clamped % 3_600_000) / 60_000);
  const seconds = Math.floor((clamped % 60_000) / 1000);
  const millis = clamped % 1000;
  const pad = (n: number, len = 2) => n.toString().padStart(len, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millis, 3)}`;
}

/** Splits raw transcript text into sentence-ish chunks, respecting maxChars. */
function chunkText(rawText: string, maxChars: number): string[] {
  const normalized = rawText.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  // First split on sentence boundaries, keeping punctuation.
  const sentences = normalized.match(/[^.!?]+[.!?]*(\s+|$)/g) ?? [normalized];

  const chunks: string[] = [];
  let current = '';

  for (const rawSentence of sentences) {
    const sentence = rawSentence.trim();
    if (!sentence) continue;

    if (sentence.length > maxChars) {
      // Break long sentences on word boundaries.
      const words = sentence.split(' ');
      let line = current;
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length > maxChars) {
          if (line) chunks.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      current = line;
      continue;
    }

    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length > maxChars) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Auto-splits a transcript into evenly-paced subtitle cues across the given
 * total duration, weighting each cue's screen time by its character length
 * so longer lines get proportionally more time.
 */
export function autoSplitTranscript(
  rawText: string,
  options: SplitOptions
): SubtitleCue[] {
  const chunks = chunkText(rawText, options.maxCharsPerCue);
  if (chunks.length === 0) return [];

  const totalMs = Math.max(0, options.totalDurationSec * 1000);
  const minDurationMs = Math.max(0, options.minCueDurationSec * 1000);
  const gapMs = Math.max(0, options.gapMs);

  const totalChars = chunks.reduce((sum, c) => sum + c.length, 0) || 1;
  const availableMs = Math.max(0, totalMs - gapMs * (chunks.length - 1));

  // First pass: proportional allocation by character count, floored at minDurationMs.
  const rawDurations = chunks.map((c) =>
    Math.max(minDurationMs, (c.length / totalChars) * availableMs)
  );
  const rawTotal = rawDurations.reduce((a, b) => a + b, 0);
  const scale = rawTotal > 0 ? availableMs / rawTotal : 1;
  const durations = rawDurations.map((d) => d * scale);

  const cues: SubtitleCue[] = [];
  let cursor = 0;
  chunks.forEach((text, i) => {
    const startMs = cursor;
    const endMs = startMs + durations[i];
    cues.push({
      id: `cue-${i}`,
      index: i + 1,
      startMs,
      endMs,
      text,
    });
    cursor = endMs + gapMs;
  });

  return cues;
}

/**
 * Returns true if the given options would force cues below minCueDurationSec
 * to fit inside totalDurationSec (i.e. there isn't enough time for every
 * chunk to get its minimum screen time).
 */
export function wouldViolateMinDuration(
  rawText: string,
  options: SplitOptions
): boolean {
  const chunks = chunkText(rawText, options.maxCharsPerCue);
  if (chunks.length === 0) return false;
  const totalMs = Math.max(0, options.totalDurationSec * 1000);
  const minDurationMs = Math.max(0, options.minCueDurationSec * 1000);
  const gapMs = Math.max(0, options.gapMs);
  const availableMs = Math.max(0, totalMs - gapMs * (chunks.length - 1));
  return chunks.length * minDurationMs > availableMs;
}

export function buildSrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue, i) => {
      const index = i + 1;
      const start = msToSrtTimestamp(cue.startMs);
      const end = msToSrtTimestamp(cue.endMs);
      return `${index}\n${start} --> ${end}\n${cue.text}\n`;
    })
    .join('\n');
}

export function reindexCues(cues: SubtitleCue[]): SubtitleCue[] {
  return cues.map((cue, i) => ({ ...cue, index: i + 1 }));
}
