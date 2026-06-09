/* =======================================================================
   domains.ts — configuration du routing multi-tenant par sous-domaine
   ======================================================================= */

/**
 * Domaine racine de la plateforme.
 *  - Production (domaine wildcard) : `structure-b.sn` (ou le domaine acheté).
 *  - Production (sans wildcard, ex. *.vercel.app) : l'hôte du déploiement,
 *    ex. `sbagency.vercel.app` — les tenants passent alors par /p/{slug}.
 *  - Local : `lvh.me:3000` — `lvh.me` (et `*.lvh.me`) résout vers 127.0.0.1,
 *    ce qui permet de tester les sous-domaines sans configuration DNS.
 */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "lvh.me:3000";

/** Sous-domaines réservés au système : interdits comme slug de tenant. */
export const RESERVED_SUBDOMAINS = new Set(["www", "api", "mail", "cdn", "static", "blog", "assets"]);

/** Sous-domaines routés vers le back-office authentifié. */
export const APP_SUBDOMAINS = new Set(["app", "admin"]);

/**
 * Le déploiement sert-il les tenants en wildcard `{slug}.{ROOT_DOMAIN}` ?
 *  - Vrai en local (`lvh.me`, `*.localhost` résolvent les sous-domaines).
 *  - Vrai en prod uniquement si un domaine apex avec DNS wildcard `*.domaine`
 *    + SSL est configuré sur Vercel → activer `NEXT_PUBLIC_WILDCARD_DOMAINS=1`.
 *  - Faux par défaut sur `*.vercel.app` (pas de wildcard) → fallback /p/{slug}.
 */
export const WILDCARD_SUBDOMAINS =
  process.env.NEXT_PUBLIC_WILDCARD_DOMAINS === "1" ||
  ROOT_DOMAIN.includes("lvh.me") ||
  ROOT_DOMAIN.includes("localhost") ||
  ROOT_DOMAIN.includes("127.0.0.1");

function isLocal(root: string): boolean {
  return root.includes("localhost") || root.includes("127.0.0.1") || root.includes("lvh.me") || root.includes(":");
}

/** Origine courante : hôte réel côté navigateur, sinon `ROOT_DOMAIN`. */
function currentOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return `${isLocal(ROOT_DOMAIN) ? "http" : "https"}://${ROOT_DOMAIN}`;
}

/** Hôte courant (sans schéma) : pour l'affichage des URLs de tenant. */
function currentHost(): string {
  if (typeof window !== "undefined") return window.location.host;
  return ROOT_DOMAIN;
}

/**
 * URL publique cliquable d'un tenant.
 *  - Wildcard activé : `{schéma}://{slug}.{ROOT_DOMAIN}`.
 *  - Sinon : `{origine}/p/{slug}` (fonctionne sur *.vercel.app et tout hôte
 *    unique, c'est la route de landing dédiée provisionnée à la création).
 */
export function tenantUrl(slug: string): string {
  if (WILDCARD_SUBDOMAINS) {
    return `${isLocal(ROOT_DOMAIN) ? "http" : "https"}://${slug}.${ROOT_DOMAIN}`;
  }
  return `${currentOrigin()}/p/${slug}`;
}

/**
 * Libellé court d'une URL de tenant (sans schéma) — QR codes, aperçus.
 *  - Wildcard : `{slug}.{ROOT_DOMAIN}`.
 *  - Sinon : `{hôte}/p/{slug}`.
 */
export function tenantLabel(slug: string): string {
  if (WILDCARD_SUBDOMAINS) return `${slug}.${ROOT_DOMAIN}`;
  return `${currentHost()}/p/${slug}`;
}
