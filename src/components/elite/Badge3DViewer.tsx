"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Badge3DViewerProps {
  textureUrl: string;
  accentColor: string;
  name: string;
  size?: number;
}

export function Badge3DViewer({ textureUrl, accentColor, name, size = 380 }: Badge3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const tiltX = useSpring(useTransform(my, [-1, 1], [18, -18]), { stiffness: 200, damping: 25 });
  const tiltY = useSpring(useTransform(mx, [-1, 1], [-18, 18]), { stiffness: 200, damping: 25 });
  const glareX = useTransform(mx, [-1, 1], [20, 80]);
  const glareY = useTransform(my, [-1, 1], [20, 80]);

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  }, [mx, my]);

  const handleLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="select-none cursor-pointer"
      style={{ width: size, height: size + 20, perspective: 600 }}
    >
      <motion.div
        style={{
          width: size,
          height: size,
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        className="relative mx-auto flex items-center justify-center"
      >
        {/* Badge image — full size, no coin wrapper */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={textureUrl}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.4))`,
          }}
        />

      </motion.div>

      {/* Subtle ground reflection */}
      <div
        className="mx-auto rounded-full blur-xl"
        style={{
          width: size * 0.3,
          height: 6,
          marginTop: 8,
          backgroundColor: `${accentColor}18`,
        }}
      />
    </div>
  );
}
