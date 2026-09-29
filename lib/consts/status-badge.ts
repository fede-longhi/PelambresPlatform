export const STATUS_BADGE_CLASS = {
  neutral:
    'border-transparent bg-slate-200 text-slate-800 hover:bg-slate-200 hover:text-slate-800',
  progress:
    'border-transparent bg-amber-100 text-amber-950 hover:bg-amber-100 hover:text-amber-950',
  info: 'border-transparent bg-sky-100 text-sky-950 hover:bg-sky-100 hover:text-sky-950',
  success:
    'border-transparent bg-emerald-100 text-emerald-950 hover:bg-emerald-100 hover:text-emerald-950',
  danger:
    'border-transparent bg-rose-100 text-rose-950 hover:bg-rose-100 hover:text-rose-950',
  closed:
    'border-transparent bg-zinc-300 text-zinc-900 hover:bg-zinc-300 hover:text-zinc-900',
} as const;

export type StatusBadgeTone = keyof typeof STATUS_BADGE_CLASS;

export function statusBadgeClass(tone: StatusBadgeTone) {
  return STATUS_BADGE_CLASS[tone];
}
