/* =======================================================================
   domains.ts — configuration du routing multi-tenant par sous-domaine
   ======================================================================= */

/**
 * Domaine racine de la plateforme.
 *  - Production : `structure-b.sn` (ou le domaine acheté sur Vercel).
 *  - Local : `lvh.me:3000` — `lvh.me` (et `*.lvh.me`) résout vers 127.0.0.1,
 *    ce qui permet de tester les sous-domaines sans configuration DNS.
 *    `*.localhost` (Chrome) fonctionne aussi : remplacer la valeur ci-dessous.
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "lvh.me:3000";

/** Sous-domaines réservés au système : interdits comme slug de tenant. */
export const RESERVED_SUBDOMAINS = new Set(["www", "api", "mail", "cdn", "static", "blog", "assets"]);

/** Sous-domaines routés vers le back-office authentifié. */
export const APP_SUBDOMAINS = new Set(["app", "admin"]);

/**
 * URL publique d'un tenant selon la convention {slug}.{ROOT_DOMAIN}.
 * Local (lvh.me / port) → http ; production → https.
 * Client-safe : `NEXT_PUBLIC_ROOT_DOMAIN` est inliné côté navigateur.
 */
export function tenantUrl(slug: string): string {
  const root = ROOT_DOMAIN;
  const isLocal =
    root.includes("localhost") || root.includes("127.0.0.1") || root.includes("lvh.me") || root.includes(":");
  return `${isLocal ? "http" : "https"}://${slug}.${root}`;
}
