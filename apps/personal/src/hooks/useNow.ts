import { useEffect, useRef, useState } from "react";

export default function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  const timer = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [intervalMs]);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return { now, tz, iso: now.toISOString() };
}
