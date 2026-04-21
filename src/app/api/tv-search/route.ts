import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Proxy pro symbol-search público do TradingView. Chamar direto do browser falha
// por CORS — o endpoint não envia Access-Control-Allow-Origin.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json([]);

  // Sem `domain=production` (TV rejeita server-side) e sem `search_type=undefined`
  // (erro forbidden_set_search_type_without_search_type_api). Apenas hl+lang.
  const url =
    `https://symbol-search.tradingview.com/symbol_search/` +
    `?text=${encodeURIComponent(q)}` +
    `&hl=1&lang=pt`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        Referer: "https://www.tradingview.com/",
        Origin: "https://www.tradingview.com",
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: `tv_search_${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "tv_search_failed" }, { status: 502 });
  }
}
