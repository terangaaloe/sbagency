/* =======================================================================
   auth.ts — authentification du back-office (démo)
   ------------------------------------------------------------------------
   Comptes en dur + session signée (HMAC) stockée dans un cookie httpOnly.
   ⚠ Démo : mots de passe en clair, comptes statiques. En production →
   table `users` (hash bcrypt/argon2) + fournisseur d'auth serverless,
   avec gestion des rôles super-admin / agent (cf. §3/§8 du prompt produit).
   ======================================================================= */
import crypto from "crypto";

export type Role = "super" | "agent";

export interface Account {
  email: string;
  password: string;
  role: Role;
  name: string;
  tenantSlug?: string;
}

export const SESSION_COOKIE = "sb_session";
const SECRET = process.env.AUTH_SECRET || "sb-dev-secret-change-me-in-prod";
const MAX_AGE = 60 * 60 * 8; // 8 h

/** Comptes de la plateforme (démo). */
export const ACCOUNTS: Account[] = [
  { email: "admin@structurebsa.com", password: "123456", role: "super", name: "Admin Structure B" },
  { email: "contact@lamarana.sn", password: "123456", role: "agent", name: "Agence La Marana", tenantSlug: "lamarana" },
];

export function findAccount(email: string): Account | undefined {
  const e = email.trim().toLowerCase();
  return ACCOUNTS.find((a) => a.email.toLowerCase() === e);
}

export function verifyCredentials(email: string, password: string): Account | null {
  const acc = findAccount(email);
  return acc && acc.password === password ? acc : null;
}

/* ---- Jeton de session signé (email + HMAC) ---- */
function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

export function createToken(email: string): string {
  const v = email.toLowerCase();
  return `${Buffer.from(v).toString("base64url")}.${sign(v)}`;
}

export function readToken(token: string | undefined): Account | null {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const email = Buffer.from(b64, "base64url").toString();
  // Comparaison à temps constant pour éviter les attaques temporelles.
  const expected = sign(email);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return findAccount(email) ?? null;
}

export const SESSION_MAX_AGE = MAX_AGE;
