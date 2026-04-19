"use client";

import { Users } from "lucide-react";
import { MembersView } from "@/components/elite/MembersView";

export default function MembrosPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="animate-in-up flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-brand-500/60" />
        <div>
          <h1 className="flex items-center gap-2 text-[22px] md:text-[26px] font-bold text-white tracking-tight leading-tight">
            Membros
          </h1>
          <p className="text-[12px] text-white/40 mt-0.5">Elite + VIP · abra qualquer perfil pra ver tier, conquistas e streak</p>
        </div>
      </div>

      <div className="animate-in-up delay-1"><MembersView /></div>
    </div>
  );
}
