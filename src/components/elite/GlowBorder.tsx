"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas-based glowing light that travels around a rounded rectangle border.
 * Place inside a `relative overflow-hidden rounded-2xl` container.
 */
export function GlowBorder({
  color = "#FF5500",
  duration = 8,
  lineWidth = 2,
  glowSize = 20,
  radius = 16,
}: {
  color?: string;
  duration?: number;
  lineWidth?: number;
  glowSize?: number;
  radius?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const durationMs = duration * 1000;

    function resize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = rect.width + "px";
      canvas!.style.height = rect.height + "px";
      ctx!.scale(dpr, dpr);
    }

    // Get point along rounded rect perimeter at t (0..1)
    function getPointOnRoundedRect(t: number, w: number, h: number, r: number): [number, number] {
      const clampedR = Math.min(r, w / 2, h / 2);
      const straightH = w - 2 * clampedR; // top & bottom straight
      const straightV = h - 2 * clampedR; // left & right straight
      const cornerLen = (Math.PI / 2) * clampedR; // quarter circle
      const perimeter = 2 * straightH + 2 * straightV + 4 * cornerLen;

      let d = ((t % 1) + 1) % 1 * perimeter;

      // Top edge (left to right)
      if (d < straightH) {
        return [clampedR + d, 0];
      }
      d -= straightH;

      // Top-right corner
      if (d < cornerLen) {
        const angle = -Math.PI / 2 + (d / cornerLen) * (Math.PI / 2);
        return [w - clampedR + Math.cos(angle) * clampedR, clampedR + Math.sin(angle) * clampedR];
      }
      d -= cornerLen;

      // Right edge (top to bottom)
      if (d < straightV) {
        return [w, clampedR + d];
      }
      d -= straightV;

      // Bottom-right corner
      if (d < cornerLen) {
        const angle = 0 + (d / cornerLen) * (Math.PI / 2);
        return [w - clampedR + Math.cos(angle) * clampedR, h - clampedR + Math.sin(angle) * clampedR];
      }
      d -= cornerLen;

      // Bottom edge (right to left)
      if (d < straightH) {
        return [w - clampedR - d, h];
      }
      d -= straightH;

      // Bottom-left corner
      if (d < cornerLen) {
        const angle = Math.PI / 2 + (d / cornerLen) * (Math.PI / 2);
        return [clampedR + Math.cos(angle) * clampedR, h - clampedR + Math.sin(angle) * clampedR];
      }
      d -= cornerLen;

      // Left edge (bottom to top)
      if (d < straightV) {
        return [0, h - clampedR - d];
      }
      d -= straightV;

      // Top-left corner
      if (d < cornerLen) {
        const angle = Math.PI + (d / cornerLen) * (Math.PI / 2);
        return [clampedR + Math.cos(angle) * clampedR, clampedR + Math.sin(angle) * clampedR];
      }

      return [clampedR, 0];
    }

    function draw(timestamp: number) {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx!.clearRect(0, 0, w, h);

      const t = (timestamp % durationMs) / durationMs;
      const [x, y] = getPointOnRoundedRect(t, w, h, radius);

      // Get a second point slightly behind to calculate direction
      const tBehind = ((t - 0.002) % 1 + 1) % 1;
      const [xb, yb] = getPointOnRoundedRect(tBehind, w, h, radius);
      const angle = Math.atan2(y - yb, x - xb);

      // Draw the trail — a series of fading points behind the head
      const trailSteps = 30;
      const trailLength = 0.04; // 4% of perimeter
      for (let i = trailSteps; i >= 0; i--) {
        const tt = ((t - (i / trailSteps) * trailLength) % 1 + 1) % 1;
        const [tx, ty] = getPointOnRoundedRect(tt, w, h, radius);
        const fade = 1 - (i / trailSteps);
        const alpha = Math.round(fade * fade * 60).toString(16).padStart(2, "0");
        const sz = lineWidth * (0.3 + fade * 0.7);

        ctx!.beginPath();
        ctx!.arc(tx, ty, sz, 0, Math.PI * 2);
        ctx!.fillStyle = color + alpha;
        ctx!.fill();
      }

      // Draw soft glow at the head
      ctx!.save();
      ctx!.translate(x, y);
      ctx!.rotate(angle);
      ctx!.scale(2.5, 1); // stretch along direction of travel
      const gradient = ctx!.createRadialGradient(0, 0, 0, 0, 0, glowSize * 0.6);
      gradient.addColorStop(0, color + "50");
      gradient.addColorStop(0.5, color + "15");
      gradient.addColorStop(1, color + "00");
      ctx!.beginPath();
      ctx!.arc(0, 0, glowSize * 0.6, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();
      ctx!.restore();

      // Draw bright core — small and tight
      const coreGradient = ctx!.createRadialGradient(x, y, 0, x, y, lineWidth);
      coreGradient.addColorStop(0, "#ffffff");
      coreGradient.addColorStop(0.6, color);
      coreGradient.addColorStop(1, color + "00");
      ctx!.beginPath();
      ctx!.arc(x, y, lineWidth, 0, Math.PI * 2);
      ctx!.fillStyle = coreGradient;
      ctx!.fill();

      animationId = requestAnimationFrame(draw);
    }

    resize();
    animationId = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [color, duration, lineWidth, glowSize, radius]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
}
