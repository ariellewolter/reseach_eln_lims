import { CalendarEvent } from "@research/types";

export function roundUp(date: Date, stepMin = 15) {
  const ms = stepMin * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

export function addMinutes(d: Date, m: number) {
  const x = new Date(d);
  x.setMinutes(x.getMinutes() + m);
  return x;
}

/** Return the next free window today between work hours, given existing events */
export function nextFreeWindowToday(
  allEvents: CalendarEvent[],
  stepMin = 15,
  dayStartHour = 9,
  dayEndHour = 18
): { start: Date; end: Date } | null {
  const now = new Date();
  const day = new Date(now); day.setHours(0,0,0,0);

  const startOfDay = new Date(day); startOfDay.setHours(dayStartHour, 0, 0, 0);
  const endOfDay   = new Date(day); endOfDay.setHours(dayEndHour,   0, 0, 0);

  // Build today's busy ranges
  const busy = allEvents
    .map(ev => ({ s: new Date(ev.start), e: new Date(ev.end) }))
    .filter(({ s, e }) => e > startOfDay && s < endOfDay)
    .sort((a, b) => a.s.getTime() - b.s.getTime());

  const cursor = roundUp(new Date(Math.max(now.getTime(), startOfDay.getTime())), stepMin);

  // Walk gaps
  let t = cursor;
  for (let i = 0; i <= busy.length; i++) {
    const s = i < busy.length ? busy[i].s : endOfDay;
    if (t < s) {
      // found a gap
      const gapEnd = new Date(Math.min(s.getTime(), endOfDay.getTime()));
      if (gapEnd > t) return { start: t, end: gapEnd };
    }
    const next = i < busy.length ? busy[i].e : endOfDay;
    t = roundUp(new Date(Math.max(t.getTime(), next.getTime())), stepMin);
  }
  return null;
}
