"use client";
/* tenant-detail — wrapper route : fiche bien + modale lead, pilotées par le router */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyDetail, LeadModal } from "./detail";
import type { Property, PropertyDoc, Tenant } from "@/lib/data";

export function TenantDetail({
  tenant,
  property,
  basePath = "",
}: {
  tenant: Tenant;
  property: Property;
  basePath?: string;
}) {
  const router = useRouter();
  const [lead, setLead] = useState<{ open: boolean; doc: PropertyDoc | null; property: Property | null }>({
    open: false,
    doc: null,
    property: null,
  });
  return (
    <div className="app-root">
      <PropertyDetail
        property={property}
        tenant={tenant}
        onBack={() => router.push(basePath || "/")}
        onRequestDoc={(doc, p) => setLead({ open: true, doc, property: p })}
      />
      <LeadModal
        open={lead.open}
        doc={lead.doc}
        property={lead.property}
        tenant={tenant}
        onClose={() => setLead((l) => ({ ...l, open: false }))}
      />
    </div>
  );
}
