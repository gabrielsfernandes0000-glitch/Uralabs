const WORDS_PER_MINUTE_PT = 220;

export function readingTimeMinutes(text: string | null | undefined): number {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE_PT));
}

export function readingTimeLabel(text: string | null | undefined): string {
  const m = readingTimeMinutes(text);
  return `${m}min leitura`;
}
