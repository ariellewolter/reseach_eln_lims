import { useEffect, useRef } from "react";

export interface UseAutoSaveOptions {
  delay?: number;
}

export function useAutoSave<T>(
  value: T, 
  onSave: (value: T) => Promise<void> | void, 
  options: UseAutoSaveOptions = {}
) {
  const { delay = 800 } = options;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef<string>('');

  useEffect(() => {
    const current = JSON.stringify(value);
    if (current === last.current) return;
    
    clearTimeout(timer.current!);
    timer.current = setTimeout(async () => {
      try {
        await onSave(value);
        last.current = current;
      } catch (e) {
        console.error("AutoSave error:", e);
      }
    }, delay);
    
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [value, onSave, delay]);
}
