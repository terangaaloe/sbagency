"use client";
/* tenant-landing — wrapper route : landing publique pilotée par le router Next */
import { useRouter } from "next/navigation";
import { PublicSite } from "./public-site";
import type { Tenant } from "@/lib/data";

export function TenantLanding({ tenant, basePath = "" }: { tenant: Tenant; basePath?: string }) {
  const router = useRouter();
  const tweaks = { heroDark: true, animScale: 1.55, gridCols: 3, showPattern: true };
  return (
    <div className="app-root">
      <PublicSite tenant={tenant} tweaks={tweaks} onOpenProperty={(id) => router.push(`${basePath}/biens/${id}`)} />
    </div>
  );
}
