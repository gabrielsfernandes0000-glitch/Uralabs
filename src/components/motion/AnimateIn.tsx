"use client";

import { useRef, useEffect } from "react";

type Animation = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "fade" | "scale";

interface AnimateInProps {
  children: React.ReactNode;
  animation?: Animation;
  duration?: number;
  delay?: number;
  stagger?: number;
  scroll?: boolean;
  className?: string;
}

/**
 * Lightweight entrance animation using CSS + IntersectionObserver.
 * No GSAP dependency — pure CSS for performance.
 */
export function AnimateIn({
  children,
  animation = "fade-up",
  duration = 0.6,
  delay = 0,
  stagger = 0,
  scroll = false,
  className,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = stagger > 0 ? Array.from(el.children) as HTMLElement[] : [el];

    // Set initial hidden state
    targets.forEach((t, i) => {
      const d = delay + i * stagger;
      t.style.opacity = "0";
      t.style.transition = `opacity ${duration}s ease-out ${d}s, transform ${duration}s ease-out ${d}s, filter ${duration}s ease-out ${d}s`;

      if (animation === "fade-up") t.style.transform = "translateY(24px)";
      else if (animation === "fade-down") t.style.transform = "translateY(-24px)";
      else if (animation === "fade-left") t.style.transform = "translateX(-24px)";
      else if (animation === "fade-right") t.style.transform = "translateX(24px)";
      else if (animation === "scale") t.style.transform = "scale(0.92)";
    });

    const reveal = () => {
      targets.forEach((t) => {
        t.style.opacity = "1";
        t.style.transform = "none";
        t.style.filter = "none";
      });
    };

    if (scroll) {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { reveal(); observer.disconnect(); } },
        { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
      );
      observer.observe(el);
      return () => observer.disconnect();
    } else {
      // Trigger on next frame so CSS transition fires
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    }
  }, [animation, duration, delay, stagger, scroll]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerIn({
  children,
  animation = "fade-up",
  duration = 0.5,
  delay = 0,
  stagger = 0.08,
  scroll = false,
  className,
}: AnimateInProps) {
  return (
    <AnimateIn animation={animation} duration={duration} delay={delay} stagger={stagger} scroll={scroll} className={className}>
      {children}
    </AnimateIn>
  );
}
