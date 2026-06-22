'use client';

import type { SubtitleCue } from '../lib/srt';
import { Timecode } from './Timecode';

interface SubtitleCardProps {
  cue: SubtitleCue;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  charLimit: number;
}

export function SubtitleCard({ cue, onTextChange, onDelete, charLimit }: SubtitleCardProps) {
  const overLimit = cue.text.length > charLimit;
  const durationMs = cue.endMs - cue.startMs;

  return (
    <div className="group relative rounded-lg border border-line bg-panel px-4 py-3 transition-colors hover:border-muted/60">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-7 shrink-0 font-mono text-xs text-muted">
          {String(cue.index).padStart(2, '0')}
        </span>

        <div className="flex-1 min-w-0">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <Timecode ms={cue.startMs} tone="amber" />
            <span className="text-muted text-xs">→</span>
            <Timecode ms={cue.endMs} tone="teal" />
            <span className="ml-auto font-mono text-[11px] text-muted">
              {(durationMs / 1000).toFixed(2)}s
            </span>
          </div>

          <textarea
            value={cue.text}
            onChange={(e) => onTextChange(cue.id, e.target.value)}
            rows={2}
            className="focus-glow w-full resize-none rounded-md border border-line bg-ink/60 px-3 py-2 text-sm leading-relaxed text-paper placeholder:text-muted/60"
            placeholder="Subtitle text…"
          />

          <div className="mt-1 flex items-center justify-between">
            <span className={`font-mono text-[11px] ${overLimit ? 'text-rose' : 'text-muted'}`}>
              {cue.text.length} / {charLimit} chars
              {overLimit && ' · long line, may wrap on screen'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(cue.id)}
          aria-label={`Delete cue ${cue.index}`}
          className="shrink-0 rounded-md p-1.5 text-muted opacity-0 transition-opacity hover:bg-rose/10 hover:text-rose group-hover:opacity-100 focus-glow"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
