export type WhenInfo = { scheduled?: string; dueDate?: string; durationMin?: number };

export default function quickWhen(input: string, stepMin = 15): { cleanTitle: string; when: WhenInfo } {
  let title = input.trim();
  const now = new Date();

  const pick = (re: RegExp) => {
    const m = title.match(re);
    if (!m) return null;
    title = (title.replace(re, "").replace(/\s{2,}/g, " ")).trim();
    return m;
  };

  const roundUp = (d: Date) => {
    const ms = stepMin * 60 * 1000;
    return new Date(Math.ceil(d.getTime() / ms) * ms);
  };

  let scheduled: Date | undefined;
  let due: Date | undefined;

  // now
  if (pick(/\bnow\b/i)) scheduled = roundUp(now);

  // in 30m / 45m
  const mRel = pick(/\bin\s+(\d{1,3})m(in)?\b/i);
  if (mRel) {
    const d = parseInt(mRel[1], 10);
    scheduled = roundUp(now);
    due = new Date(scheduled); due.setMinutes(due.getMinutes() + d);
  }

  // for 25m
  const dur = pick(/\bfor\s+(\d{1,3})m(in)?\b/i);
  if (dur) {
    const d = parseInt(dur[1], 10);
    if (!scheduled) scheduled = roundUp(now);
    due = new Date(scheduled); due.setMinutes(due.getMinutes() + d);
  }

  // today 3pm / tmr 9am
  const t1 = pick(/\b(today|tmr|tomorrow)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (t1) {
    const [, word, hh, mm, ap] = t1;
    const base = new Date(now);
    if (/tmr|tomorrow/i.test(word)) base.setDate(base.getDate() + 1);
    base.setHours(((ap && /pm/i.test(ap)) ? (parseInt(hh,10)%12)+12 : parseInt(hh,10)%12), mm ? parseInt(mm,10) : 0, 0, 0);
    scheduled = roundUp(base);
  }

  // duration fallback
  const durationMin = due && scheduled ? Math.max(5, Math.round((due.getTime()-scheduled.getTime())/60000)) : undefined;

  return {
    cleanTitle: title,
    when: { scheduled: scheduled?.toISOString(), dueDate: due?.toISOString(), durationMin }
  };
}
