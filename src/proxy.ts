/* =======================================================================
   proxy.ts — routing multi-tenant par Host (ex-middleware.ts, convention Next 16)
   - {slug}.domaine        → /s/{slug}              (landing publique)
   - app.|admin.domaine    → /app                   (back-office)
   - domaine / www.domaine → apex (aucune réécriture : démo + /p + /app)
   - sous-domaines réservés → laissés passer
   Fallback sous-répertoire /p/{slug} géré par les routes (pas de réécriture).
   ======================================================================= */
import { NextResponse, type NextRequest } from "next/server";
import { ROOT_DOMAIN, RESERVED_SUBDOMAINS, APP_SUBDOMAINS } from "@/lib/domains";

export const config = {
  // Exclut les assets, fichiers statiques et endpoints internes Next.
  matcher: ["/((?!api/|_next/|_static/|assets/|favicon.ico|.*\\..*).*)"],
};

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const host = (req.headers.get("host") || "").toLowerCase();
  const hostNoPort = host.split(":")[0];
  const rootNoPort = ROOT_DOMAIN.split(":")[0];

  // Apex, www, ou localhost « nu » : aucune réécriture (démo + /p/{slug} + /app).
  if (hostNoPort === rootNoPort || hostNoPort === "www." + rootNoPort || hostNoPort === "localhost" || hostNoPort === "127.0.0.1") {
    return NextResponse.next();
  }

  // Convention : un seul label de sous-domaine = {slug}.domaine.
  const sub = hostNoPort.endsWith("." + rootNoPort) ? hostNoPort.slice(0, -(rootNoPort.length + 1)) : "";
  if (!sub) return NextResponse.next();

  // Back-office authentifié : app.domaine / admin.domaine.
  if (APP_SUBDOMAINS.has(sub)) {
    return NextResponse.rewrite(new URL(`/app${url.pathname}${url.search}`, req.url));
  }

  // Sous-domaines système réservés.
  if (RESERVED_SUBDOMAINS.has(sub)) return NextResponse.next();

  // Tenant : réécriture vers la route interne. L'existence et le statut
  // (page activée/désactivée) sont vérifiés côté serveur dans la route.
  return NextResponse.rewrite(new URL(`/s/${sub}${url.pathname}${url.search}`, req.url));
}
