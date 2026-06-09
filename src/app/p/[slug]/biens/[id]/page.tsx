import { notFound } from "next/navigation";
import { propById } from "@/lib/data";
import { getTenant } from "@/lib/store";
import { TenantDetail } from "@/components/sb/tenant-detail";

export default async function TenantFallbackPropertyPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const tenant = getTenant(slug);
  if (!tenant || !tenant.isPublic) notFound();
  const property = propById(id);
  if (!property || !tenant.propertyIds.includes(id)) notFound();
  return <TenantDetail tenant={tenant} property={property} basePath={`/p/${slug}`} />;
}
