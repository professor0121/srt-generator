'use client';

import { msToClockDisplay } from '../lib/srt';

interface TimecodeProps {
  ms: number;
  tone?: 'amber' | 'teal';
}

export function Timecode({ ms, tone = 'amber' }: TimecodeProps) {
  const display = msToClockDisplay(ms);
  const [time, millis] = display.split('.');
  const color = tone === 'amber' ? 'text-amber' : 'text-teal';

  return (
    <span className="inline-flex items-baseline font-mono tabular-nums tracking-tight">
      <span className={`text-sm ${color}`}>{time}</span>
      <span className="text-xs text-muted">.{millis}</span>
    </span>
  );
}
