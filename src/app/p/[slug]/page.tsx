import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/store";
import { TenantLanding } from "@/components/sb/tenant-landing";

/* Fallback en sous-répertoire : domaine.com/p/{slug}
   (utile pour QR, tests, environnements sans wildcard). */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant || !tenant.isPublic) return { title: "Page indisponible — Structure B" };
  return { title: `${tenant.name} — Structure B SA`, description: tenant.tagline };
}

export default async function TenantFallbackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant || !tenant.isPublic) notFound();
  return <TenantLanding tenant={tenant} basePath={`/p/${slug}`} />;
}
