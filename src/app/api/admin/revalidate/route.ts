import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/* Admin endpoint pra bustar o unstable_cache de tags específicas.
   Útil quando uma mutação no DB (ex: paleta dos módulos) não aparece
   no client porque o Next Data Cache ainda tá segurando a versão antiga.
   Autenticação simples via header `x-cron-secret`. */
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const tag = url.searchParams.get("tag");
  if (!tag) {
    return NextResponse.json({ ok: false, error: "missing ?tag=" }, { status: 400 });
  }

  // Next 16 exige 2º arg "max" no revalidateTag (deprecated sem).
  revalidateTag(tag, "max");
  return NextResponse.json({ ok: true, tag, revalidated_at: Date.now() });
}
