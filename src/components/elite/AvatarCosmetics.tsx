"use client";

import React from "react";
import { Avatar } from "./Avatar";

/* ────────────────────────────────────────────────────────────────────────────
   Avatar Cosmetics — Frames + Auras (zerado em 2026-04-20).

   Migração em curso: os SVG frames/auras foram removidos pra abrir espaço
   pros novos assets em imagem (PNG com alpha) gerados no Nano Banana Pro.
   Enquanto não chegam, o wrapper ignora frameSlug/auraSlug e renderiza
   só o Avatar base — callers (Sidebar, MemberProfileModal, PersonalizationSection,
   MembersView) não quebram porque os slots continuam sendo aceitos como props.

   Quando os assets chegarem:
   1. Salvar PNG em `public/cosmetics/frames/<slug>.png` e `public/cosmetics/auras/<slug>.png`
   2. Popular FrameSlug / AuraSlug unions
   3. Renderizar <img> sobre/atrás do Avatar em AvatarWithCosmetics
   ──────────────────────────────────────────────────────────── */

export type FrameSlug = never;
export type AuraSlug = never;

export type AnimMode = "always" | "hover" | "off";

export function normalizeFrameSlug(_s: string | null | undefined): FrameSlug | null {
  return null;
}
export function normalizeAuraSlug(_s: string | null | undefined): AuraSlug | null {
  return null;
}

interface WrapperProps {
  src: string | null | undefined;
  name: string;
  size?: number;
  frameSlug?: string | null;
  auraSlug?: string | null;
  className?: string;
  animated?: AnimMode;
  /** @deprecated legado */
  interactive?: boolean;
}

export function AvatarWithCosmetics({
  src, name, size = 48, className,
}: WrapperProps) {
  return (
    <div
      className={`relative inline-block av-cos-wrap ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Avatar src={src ?? ""} name={name} size={size} className="rounded-full ring-2 ring-[#0e0e10]" />
    </div>
  );
}
