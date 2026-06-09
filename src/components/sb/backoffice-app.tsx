"use client";
/* backoffice-app — entrée du back-office authentifié (app./admin.domaine → /app) */
import { useEffect, useState } from "react";
import { Login, BackOffice, type Role } from "./backoffice";
import { tenantUrl } from "@/lib/domains";
import { TENANTS, type Tenant } from "@/lib/data";

export function BackOfficeApp() {
  const [role, setRole] = useState<Role | null>(null);
  const [ready, setReady] = useState(false);
  // Copie locale modifiable du tenant géré (toggle activation page publique).
  const [tenant, setTenant] = useState<Tenant>(() => JSON.parse(JSON.stringify(TENANTS.lamarana)));

  // Restaure la session (cookie httpOnly) + synchronise l'état de la page
  // (activée/désactivée) depuis le registre serveur au chargement.
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()).catch(() => null),
      fetch("/api/agencies").then((r) => r.json()).catch(() => null),
    ])
      .then(([sess, ag]) => {
        if (!active) return;
        if (sess?.authenticated) setRole(sess.role as Role);
        const row = ag?.agencies?.find((a: { slug: string }) => a.slug === "lamarana");
        if (row) setTenant((t) => ({ ...t, isPublic: row.isPublic }));
      })
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    setRole(null);
  };

  // Active / désactive la page publique du tenant (persisté côté serveur).
  const toggleTenant = async () => {
    const next = !tenant.isPublic;
    setTenant((t) => ({ ...t, isPublic: next })); // optimiste
    try {
      await fetch(`/api/agencies/${encodeURIComponent(tenant.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
    } catch {
      /* état optimiste conservé */
    }
  };

  if (!ready) {
    return <div className="app-root" style={{ minHeight: "100vh", background: "var(--sb-desert-storm)" }} />;
  }

  if (role === null) {
    return (
      <div className="app-root">
        <Login onLogin={(r) => setRole(r)} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <BackOffice
        role={role}
        tenant={tenant}
        onLogout={logout}
        onPreview={() => window.open(tenantUrl(tenant.slug), "_blank", "noopener")}
        onToggleTenant={toggleTenant}
      />
    </div>
  );
}
