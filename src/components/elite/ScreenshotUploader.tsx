"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Clipboard, Upload } from "lucide-react";

/**
 * Upload de screenshot do chart com suporte a:
 *  - File picker (click)
 *  - Drag & drop
 *  - Paste (Ctrl+V do clipboard — crucial pro workflow "print → Ctrl+V")
 *
 * Compressão automática:
 *  - Canvas resize pra maxWidth=1280px
 *  - JPEG 0.75 quality
 *  - Tipicamente 80-200KB final
 *
 * Retorna data URL (base64) — simples, sem dependência de storage.
 * Para produção com muitos trades, migrar pra Supabase Storage.
 */

const MAX_WIDTH = 1280;
const JPEG_QUALITY = 0.75;
const MAX_INPUT_BYTES = 8 * 1024 * 1024; // 8MB antes da compressão

export function ScreenshotUploader({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Arquivo não é uma imagem.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("Imagem muito grande (máx 8MB).");
      return;
    }
    setProcessing(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar imagem");
    } finally {
      setProcessing(false);
    }
  };

  // Paste handler — captura Ctrl+V global enquanto o componente tá montado e focado
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  // Drop handler
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Screenshot do trade" className="w-full max-h-[420px] object-contain" />
        <button
          onClick={() => onChange(undefined)}
          className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/70 backdrop-blur flex items-center justify-center text-white/80 hover:bg-black hover:text-white transition-colors"
          title="Remover screenshot"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative rounded-xl border-2 border-dashed transition-colors ${
        dragOver
          ? "border-brand-500/60 bg-brand-500/[0.05]"
          : "border-white/[0.08] hover:border-white/[0.18] bg-white/[0.02]"
      }`}
    >
      <button
        onClick={() => fileRef.current?.click()}
        disabled={processing}
        className="w-full flex flex-col items-center justify-center gap-2 py-7 px-4 text-white/45 hover:text-white/80 disabled:opacity-50 transition-colors"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            <span className="text-[11.5px] font-medium">Comprimindo…</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              <span className="text-[12.5px] font-semibold">Anexar print do chart</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/35">
              <span className="inline-flex items-center gap-1">
                <Upload className="w-2.5 h-2.5" /> clique
              </span>
              <span className="text-white/20">·</span>
              <span>arraste</span>
              <span className="text-white/20">·</span>
              <span className="inline-flex items-center gap-1">
                <Clipboard className="w-2.5 h-2.5" /> Ctrl+V
              </span>
            </div>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) processFile(f);
          e.target.value = "";
        }}
        className="hidden"
      />
      {error && (
        <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-red-400">{error}</p>
      )}
    </div>
  );
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_WIDTH / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas ctx fail"));
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Erro ao decodificar imagem"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}
