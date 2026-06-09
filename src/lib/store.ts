/* =======================================================================
   store.ts — registre des tenants en mémoire (démo)
   ------------------------------------------------------------------------
   Persistance volatile, le temps de vie du process Node. Suffisant pour la
   démo et le dev local (le routing multi-tenant lit ce registre côté serveur).
   ⚠ En production serverless (Vercel), remplacer par une vraie base
   (Postgres/Neon + Prisma/Drizzle) : plusieurs instances ne partagent pas
   cette mémoire. Voir §5/§8 du prompt produit.
   ======================================================================= */
import {
  RANKING,
  RESERVED,
  TENANTS,
  IMG,
  slugify,
  type RankingRow,
  type Tenant,
} from "./data";

interface Store {
  tenants: Map<string, Tenant>; // clé = slug
  ranking: RankingRow[];
}

// Survit au Hot-Module-Reload du dev en s'accrochant au global.
const globalForStore = globalThis as unknown as { __sbStore?: Store };

function init(): Store {
  const tenants = new Map<string, Tenant>();
  Object.values(TENANTS).forEach((t) => tenants.set(t.slug, structuredClone(t)));
  return { tenants, ranking: RANKING.map((r) => ({ ...r })) };
}

const store: Store = globalForStore.__sbStore ?? (globalForStore.__sbStore = init());

/* ---------------- Lecture ---------------- */
export function getAgencies(): RankingRow[] {
  return store.ranking;
}

export function getTenant(slug: string): Tenant | undefined {
  return store.tenants.get(slug);
}

export function isSlugTaken(slug: string): boolean {
  return store.tenants.has(slug) || store.ranking.some((r) => r.slug === slug);
}

/* ---------------- Création ---------------- */
export interface CreateAgencyInput {
  name: string;
  type?: "agence" | "agent";
  slug?: string;
  about?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  propertyIds?: string[];
  isPublic?: boolean;
}

export type CreateAgencyResult =
  | { ok: true; tenant: Tenant; ranking: RankingRow }
  | { ok: false; field: "name" | "slug"; error: string };

export function createAgency(input: CreateAgencyInput): CreateAgencyResult {
  const name = (input.name || "").trim();
  if (name.length < 2) return { ok: false, field: "name", error: "Nom requis." };

  const slug = slugify(input.slug || name);
  if (slug.length < 3) return { ok: false, field: "slug", error: "Sous-domaine trop court (3 caractères min)." };
  if (RESERVED.includes(slug)) return { ok: false, field: "slug", error: `Sous-domaine « ${slug} » réservé.` };
  if (isSlugTaken(slug)) return { ok: false, field: "slug", error: `Sous-domaine « ${slug} » déjà pris.` };

  const type = input.type === "agent" ? "agent" : "agence";
  const propertyIds = input.propertyIds ?? [];
  const isPublic = input.isPublic ?? true;

  const tenant: Tenant = {
    slug,
    type,
    name,
    short: name.length > 18 ? name.split(" ").slice(0, 2).join(" ") : name,
    role: type === "agence" ? "Agence partenaire · Dakar" : "Conseiller en investissement",
    tagline: "Votre plan A.",
    about: input.about?.trim() || `${name} — partenaire Structure B SA.`,
    about2: "Partenaire récemment intégré à la plateforme Structure B SA.",
    verified: false,
    isPublic,
    pattern: "/assets/pattern-01-30.png",
    photo: IMG.team,
    heroPhoto: IMG.hero,
    contacts: {
      phone: input.phone?.trim() || "",
      whatsapp: input.whatsapp?.trim() || input.phone?.trim() || "",
      email: input.email?.trim() || `contact@${slug}.sn`,
      address: input.address?.trim() || "Dakar, Sénégal",
    },
    stats: { biens: propertyIds.length, programmes: 0, scans: 0, leads: 0 },
    propertyIds,
  };

  const ranking: RankingRow = { slug, name, type, scans: 0, views: 0, leads: 0, conv: 0, isPublic };

  store.tenants.set(slug, tenant);
  store.ranking = [ranking, ...store.ranking];

  return { ok: true, tenant, ranking };
}

/* ---------------- Mise à jour ---------------- */
export interface UpdateAgencyInput {
  isPublic?: boolean;
  name?: string;
  about?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  propertyIds?: string[];
}

export type UpdateAgencyResult =
  | { ok: true; ranking: RankingRow; tenant: Tenant | null }
  | { ok: false; error: string };

export function updateAgency(slug: string, patch: UpdateAgencyInput): UpdateAgencyResult {
  const tenant = store.tenants.get(slug) ?? null;
  const idx = store.ranking.findIndex((r) => r.slug === slug);
  if (!tenant && idx === -1) return { ok: false, error: "Partenaire introuvable." };

  // Tenant complet (landing page) — reflète immédiatement sur {slug}.domaine.
  if (tenant) {
    if (typeof patch.isPublic === "boolean") tenant.isPublic = patch.isPublic;
    if (patch.name?.trim()) tenant.name = patch.name.trim();
    if (typeof patch.about === "string") tenant.about = patch.about;
    if (patch.phone !== undefined) tenant.contacts.phone = patch.phone;
    if (patch.whatsapp !== undefined) tenant.contacts.whatsapp = patch.whatsapp;
    if (patch.email !== undefined) tenant.contacts.email = patch.email;
    if (patch.address !== undefined) tenant.contacts.address = patch.address;
    if (patch.propertyIds) {
      tenant.propertyIds = patch.propertyIds;
      tenant.stats = { ...tenant.stats, biens: patch.propertyIds.length };
    }
  }

  // Ligne de classement (back-office).
  let ranking: RankingRow;
  if (idx !== -1) {
    ranking = { ...store.ranking[idx] };
    if (typeof patch.isPublic === "boolean") ranking.isPublic = patch.isPublic;
    if (patch.name?.trim()) ranking.name = patch.name.trim();
    store.ranking[idx] = ranking;
  } else {
    ranking = { slug, name: tenant!.name, type: tenant!.type, scans: 0, views: 0, leads: 0, conv: 0, isPublic: tenant!.isPublic };
    store.ranking = [ranking, ...store.ranking];
  }

  return { ok: true, ranking, tenant };
}
