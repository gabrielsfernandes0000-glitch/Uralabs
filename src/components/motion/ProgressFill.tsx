"use client";

import { useRef, useEffect } from "react";

interface ProgressFillProps {
  value: number;
  duration?: number;
  delay?: number;
  color?: string;
  height?: number;
  className?: string;
}

/**
 * Animated progress bar — pure CSS transition, no GSAP.
 */
export function ProgressFill({
  value,
  duration = 1,
  delay = 0,
  color,
  height = 4,
  className,
}: ProgressFillProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const el = barRef.current;
    el.style.width = "0%";
    el.style.transition = `width ${duration}s ease-out ${delay}s`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = `${Math.min(value, 100)}%`;
      });
    });
  }, [value, duration, delay]);

  return (
    <div className={`w-full bg-white/[0.04] rounded-full overflow-hidden ${className || ""}`} style={{ height }}>
      <div ref={barRef} className="h-full rounded-full" style={{ backgroundColor: color, width: 0 }} />
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  duration?: number;
  delay?: number;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Animated circular progress — pure CSS transition.
 */
export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 3,
  color = "#FF5500",
  duration = 1.2,
  delay = 0,
  className,
  children,
}: ProgressRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    if (!circleRef.current) return;
    const el = circleRef.current;
    const target = circumference - (value / 100) * circumference;
    el.style.strokeDashoffset = String(circumference);
    el.style.transition = `stroke-dashoffset ${duration}s ease-out ${delay}s`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.strokeDashoffset = String(target);
      });
    });
  }, [value, circumference, duration, delay]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className || ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
        <circle
          ref={circleRef}
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={circumference}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
