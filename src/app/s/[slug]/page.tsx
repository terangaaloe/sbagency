import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/store";
import { TenantLanding } from "@/components/sb/tenant-landing";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tenant = getTenant(slug);
  if (!tenant || !tenant.isPublic) return { title: "Page indisponible — Structure B" };
  return {
    title: `${tenant.name} — Structure B SA`,
    description: tenant.tagline + " " + tenant.about.split(".")[0] + ".",
    openGraph: { title: tenant.name, description: tenant.tagline, images: [tenant.heroPhoto] },
  };
}

export default async function TenantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tenant = getTenant(slug);
  // Tenant inexistant OU page désactivée → écran neutre (HTTP 404).
  if (!tenant || !tenant.isPublic) notFound();
  return <TenantLanding tenant={tenant} basePath="" />;
}
