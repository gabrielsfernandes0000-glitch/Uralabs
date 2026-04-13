"use client";

import { useRef, useEffect } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animated counter — pure JS, no GSAP.
 */
export function CountUp({
  end,
  duration = 1200,
  delay = 0,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const timeout = setTimeout(() => {
      const start = performance.now();
      const durationMs = duration;

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / durationMs, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = eased * end;
        el.textContent = prefix + current.toFixed(decimals) + suffix;

        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay, decimals, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
