"use client";
/* backoffice — Espace authentifié (super-admin + agent partenaire) */
import { useState } from "react";
import { Icon } from "./icons";
import { tenantUrl } from "@/lib/domains";
import { Magnetic, QR } from "./primitives";
import { LineChart, BarChart, KPI } from "./charts";
import { Switch } from "@/components/ui/switch";
import {
  ANALYTICS,
  AUDIT,
  LEADS,
  PROGRAMS,
  PROPERTIES,
  RANKING,
  RESERVED,
  TENANTS,
  propById,
  slugify,
  type Property,
  type RankingRow,
  type Tenant,
} from "@/lib/data";

export type Role = "super" | "agent";

/* ===================== LOGIN ===================== */
export function Login({ onLogin }: { onLogin: (r: Role, tenantSlug?: string | null) => void }) {
  const [email, setEmail] = useState("admin@structurebsa.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const quickFill = (kind: "super" | "agent") => {
    setError(null);
    if (kind === "super") {
      setEmail("admin@structurebsa.com");
      setPassword("123456");
    } else {
      setEmail("contact@lamarana.sn");
      setPassword("123456");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Connexion impossible.");
        setLoading(false);
        return;
      }
      onLogin(data.role as Role, data.tenantSlug);
    } catch {
      setError("Erreur réseau — réessayez.");
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__art">
        <div
          className="login__art pat"
          style={{ position: "absolute", inset: 0, opacity: 0.35, filter: "invert(1)", background: "url(/assets/pattern-01-30.png) center/cover" }}
        />
        <div className="row gap12" style={{ position: "relative" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-white.png" style={{ height: 34, filter: "none" }} alt="" />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Structure B SA</span>
        </div>
        <div>
          <h2>
            Plateforme
            <br />
            partenaires
          </h2>
          <p style={{ color: "var(--sb-gray-300)", fontWeight: 300, maxWidth: 360, marginTop: 20 }}>
            Créez, gérez et diffusez vos landing pages immobilières. Suivez scans, vues, téléchargements et leads en temps réel.
          </p>
        </div>
        <div className="tag">— Votre Plan A</div>
      </div>
      <div className="login__form">
        <h1>Connexion</h1>
        <p className="sub">Accédez à votre espace de gestion.</p>
        <div className="login__roles">
          <button type="button" onClick={() => quickFill("super")}>
            Super Admin
          </button>
          <button type="button" onClick={() => quickFill("agent")}>
            Agence / Agent
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label>E-mail</label>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@structurebsa.com" />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && (
            <div className="row gap8" style={{ color: "#000", background: "var(--sb-gray-100)", border: "1px solid var(--sb-black)", padding: "11px 14px", fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
              <Icon name="x" size={15} /> {error}
            </div>
          )}
          <Magnetic strength={0.15} style={{ display: "block" }}>
            <button type="submit" className="btn btn--block" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? "Connexion…" : "Se connecter"} <Icon name="arrowR" />
            </button>
          </Magnetic>
        </form>
        <p style={{ fontSize: 12, color: "var(--sb-gray-500)", marginTop: 22 }}>
          Démo — <b style={{ color: "var(--sb-gray-700)" }}>admin@structurebsa.com</b> / <b style={{ color: "var(--sb-gray-700)" }}>123456</b> (Super Admin).
        </p>
      </div>
    </div>
  );
}

/* ===================== SHELL ===================== */
interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}
const NAVS: Record<Role, NavItem[]> = {
  super: [
    { id: "dash", label: "Tableau de bord", icon: "dash" },
    { id: "agences", label: "Agences & agents", icon: "users", badge: "5" },
    { id: "biens", label: "Catalogue biens", icon: "building", badge: "6" },
    { id: "analytics", label: "Analytics", icon: "bars" },
    { id: "leads", label: "Leads", icon: "list", badge: "7" },
    { id: "audit", label: "Journal d'audit", icon: "shield" },
  ],
  agent: [
    { id: "dash", label: "Tableau de bord", icon: "dash" },
    { id: "mapage", label: "Ma page publique", icon: "globe" },
    { id: "biens", label: "Mes biens", icon: "building", badge: "6" },
    { id: "analytics", label: "Analytics", icon: "bars" },
    { id: "leads", label: "Leads", icon: "list", badge: "7" },
  ],
};

export function BackOffice({
  role,
  onLogout,
  onPreview,
  tenant,
  onToggleTenant,
}: {
  role: Role;
  onLogout: () => void;
  onPreview: () => void;
  tenant: Tenant;
  onToggleTenant: () => void;
}) {
  const [active, setActive] = useState("dash");
  const [navopen, setNavopen] = useState(false);
  const [editing, setEditing] = useState<RankingRow | null>(null);
  const [creating, setCreating] = useState(false);
  // Liste réactive des partenaires (seed = RANKING ; les créations s'y ajoutent).
  const [agencies, setAgencies] = useState<RankingRow[]>(() => RANKING.map((r) => ({ ...r })));
  const nav = NAVS[role];
  const titles: Record<string, string> = {
    dash: "Tableau de bord",
    agences: "Agences & agents",
    biens: role === "super" ? "Catalogue des biens" : "Mes biens",
    analytics: "Analytics",
    leads: "Leads",
    audit: "Journal d'audit",
    mapage: "Ma page publique",
  };
  const heading = creating ? "Nouvelle agence / agent" : editing ? "Fiche agence / agent" : titles[active];
  const go = (id: string) => {
    setActive(id);
    setEditing(null);
    setCreating(false);
    setNavopen(false);
  };
  // Ajoute le partenaire à la liste réactive ; la vue de création garde la main
  // pour afficher l'écran de succès (« Voir la page » / « Retour à la liste »).
  const onCreated = (row: RankingRow) => setAgencies((a) => [row, ...a]);

  return (
    <div className={"bo " + (navopen ? "navopen" : "")}>
      <aside className="bo__side noscroll">
        <div className="bo__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-mark-black.png" alt="" />
          <div>
            <div className="nm">Structure B</div>
            <div className="sl">PLATEFORME</div>
          </div>
        </div>
        <div className="bo__role">
          {role === "super" ? "Super Admin" : tenant.short}
          <Icon name={role === "super" ? "shield" : "globe"} size={14} />
        </div>
        <nav className="bo__nav">
          {nav.map((n) => (
            <button key={n.id} className={"bo__navitem " + (active === n.id ? "active" : "")} onClick={() => go(n.id)}>
              <Icon name={n.icon} className="ic" /> {n.label}
              {n.badge && <span className="badge">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="bo__user">
          <div className="av">{role === "super" ? "SB" : "LM"}</div>
          <div className="grow">
            <div className="nm">{role === "super" ? "Admin Structure B" : tenant.name}</div>
            <div className="em">{role === "super" ? "admin@structure-b.sn" : tenant.contacts.email}</div>
          </div>
          <button
            style={{ background: "none", border: 0, cursor: "pointer", padding: 0 }}
            onClick={onLogout}
            title="Déconnexion"
          >
            <Icon name="logout" size={18} style={{ color: "var(--sb-gray-400)" }} />
          </button>
        </div>
      </aside>

      <div className="bo__main">
        <div className="bo__top">
          <div className="row gap12">
            <button
              style={{ background: "none", border: 0, cursor: "pointer", padding: 8, display: "none" }}
              onClick={() => setNavopen((v) => !v)}
            >
              <Icon name="menu" />
            </button>
            <div>
              <div className="crumb">
                {role === "super" ? "Structure B" : tenant.short} / {titles[active]}
              </div>
              <h1>{heading}</h1>
            </div>
          </div>
          <div className="row gap12">
            {active !== "dash" && active !== "audit" && (
              <div className="bo__search">
                <Icon name="search" className="ic" />
                <input placeholder="Rechercher…" />
              </div>
            )}
            <Magnetic strength={0.2}>
              <button className="btn btn--sm btn--ghost" onClick={onPreview}>
                <Icon name="ext" /> Voir une page
              </button>
            </Magnetic>
          </div>
        </div>

        <div className="bo__content">
          {creating ? (
            <AgencyCreate
              existingSlugs={agencies.map((a) => a.slug)}
              onBack={() => setCreating(false)}
              onCreated={onCreated}
            />
          ) : editing ? (
            <AgencyEditor
              row={editing}
              onBack={() => setEditing(null)}
              onPreview={onPreview}
              onSaved={(r) => {
                setAgencies((a) => a.map((x) => (x.slug === r.slug ? r : x)));
                setEditing(r);
              }}
            />
          ) : (
            <Screen
              role={role}
              active={active}
              tenant={tenant}
              agencies={agencies}
              onEdit={setEditing}
              onCreate={() => setCreating(true)}
              onPreview={onPreview}
              onToggleTenant={onToggleTenant}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ===================== SCREEN ROUTER ===================== */
function Screen({
  role,
  active,
  tenant,
  agencies,
  onEdit,
  onCreate,
  onPreview,
  onToggleTenant,
}: {
  role: Role;
  active: string;
  tenant: Tenant;
  agencies: RankingRow[];
  onEdit: (r: RankingRow) => void;
  onCreate: () => void;
  onPreview: () => void;
  onToggleTenant: () => void;
}) {
  if (active === "dash") return role === "super" ? <SuperDash agencies={agencies} onEdit={onEdit} /> : <AgentDash tenant={tenant} onPreview={onPreview} />;
  if (active === "agences") return <AgencesScreen agencies={agencies} onEdit={onEdit} onCreate={onCreate} />;
  if (active === "biens") return <BiensScreen role={role} tenant={tenant} />;
  if (active === "analytics") return <AnalyticsScreen role={role} />;
  if (active === "leads") return <LeadsScreen />;
  if (active === "audit") return <AuditScreen />;
  if (active === "mapage") return <MaPageScreen tenant={tenant} onPreview={onPreview} onToggleTenant={onToggleTenant} />;
  return null;
}

/* ===================== SUPER DASHBOARD ===================== */
function SuperDash({ agencies, onEdit }: { agencies: RankingRow[]; onEdit: (r: RankingRow) => void }) {
  const totalScans = agencies.reduce((a, r) => a + r.scans, 0);
  const totalViews = agencies.reduce((a, r) => a + r.views, 0);
  const totalLeads = agencies.reduce((a, r) => a + r.leads, 0);
  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="kpis">
        <KPI label="Scans QR" icon="scan" value={totalScans} format delta="+12,4 % vs. 14 j" deltaDir="up" spark={ANALYTICS.scans} />
        <KPI label="Vues de page" icon="eye" value={totalViews} format delta="+8,1 %" deltaDir="up" spark={ANALYTICS.views} />
        <KPI label="Leads capturés" icon="users" value={totalLeads} delta="+5 cette semaine" deltaDir="up" spark={ANALYTICS.downloads} />
        <KPI label="Pages actives" icon="globe" value={agencies.filter((r) => r.isPublic).length} suffix={"/" + agencies.length} delta={agencies.filter((r) => !r.isPublic).length + " désactivée(s)"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }} className="dashgrid">
        <div className="panel">
          <div className="panel__head">
            <div>
              <h3>Activité — 14 derniers jours</h3>
            </div>
            <span className="sub">Scans · Vues · Téléchargements</span>
          </div>
          <LineChart
            labels={ANALYTICS.days}
            series={[
              { name: "Scans QR", data: ANALYTICS.scans },
              { name: "Vues", data: ANALYTICS.views },
              { name: "Téléch.", data: ANALYTICS.downloads },
            ]}
          />
        </div>
        <div className="panel">
          <div className="panel__head">
            <h3>Journal récent</h3>
          </div>
          <div className="panel__body" style={{ paddingTop: 6 }}>
            {AUDIT.slice(0, 5).map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 4 ? "1px solid var(--sb-gray-100)" : "0" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--sb-gray-500)", whiteSpace: "nowrap" }}>{a.t}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.act}</div>
                  <div style={{ fontSize: 12, color: "var(--sb-gray-500)" }}>{a.det}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel__head">
          <div>
            <h3>Classement des partenaires</h3>
          </div>
          <span className="sub">Par scans QR</span>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Partenaire</th>
              <th>Type</th>
              <th>Scans</th>
              <th>Vues</th>
              <th>Leads</th>
              <th>Conv.</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((r, i) => (
              <tr key={r.slug}>
                <td className="mono">{String(i + 1).padStart(2, "0")}</td>
                <td style={{ fontWeight: 500 }}>
                  {r.name}
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--sb-gray-500)" }}>{r.slug}.structure-b.sn</div>
                </td>
                <td>
                  <span className="tag-pill">{r.type}</span>
                </td>
                <td className="mono">{r.scans.toLocaleString("fr-FR")}</td>
                <td className="mono">{r.views.toLocaleString("fr-FR")}</td>
                <td className="mono">{r.leads}</td>
                <td className="mono">{r.conv} %</td>
                <td>
                  <span className={"tag-pill " + (r.isPublic ? "on" : "vendu")}>{r.isPublic ? "Active" : "Désactivée"}</span>
                </td>
                <td>
                  <button className="btn btn--sm btn--ghost" onClick={() => onEdit(r)}>
                    Gérer <Icon name="chevR" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== AGENT DASHBOARD ===================== */
function AgentDash({ tenant, onPreview }: { tenant: Tenant; onPreview: () => void }) {
  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="kpis">
        <KPI label="Scans QR" icon="scan" value={tenant.stats.scans} format delta="+9,2 % vs. 14 j" deltaDir="up" spark={ANALYTICS.scans} />
        <KPI label="Vues de page" icon="eye" value={8740} format delta="+6,4 %" deltaDir="up" spark={ANALYTICS.views} />
        <KPI label="Leads" icon="users" value={tenant.stats.leads} delta="+3 cette semaine" deltaDir="up" spark={ANALYTICS.downloads} />
        <KPI label="Biens en ligne" icon="building" value={tenant.stats.biens} delta="Tous à jour" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }} className="dashgrid">
        <div className="panel">
          <div className="panel__head">
            <h3>Mon activité — 14 jours</h3>
            <span className="sub">Scans · Vues · Téléch.</span>
          </div>
          <LineChart
            labels={ANALYTICS.days}
            series={[
              { name: "Scans", data: ANALYTICS.scans.map((v) => Math.round(v * 0.5)) },
              { name: "Vues", data: ANALYTICS.views.map((v) => Math.round(v * 0.5)) },
              { name: "Téléch.", data: ANALYTICS.downloads.map((v) => Math.round(v * 0.5)) },
            ]}
          />
        </div>
        <div className="panel">
          <div className="panel__head">
            <h3>Ma page</h3>
          </div>
          <div className="panel__body">
            <div className="qrcard" style={{ border: "1px solid var(--sb-gray-200)", margin: "0 auto", maxWidth: 220 }}>
              <QR value={tenant.slug + ".structure-b.sn"} size={150} />
              <span className="url">{tenant.slug}.structure-b.sn</span>
            </div>
            <button className="btn btn--block mt16" onClick={onPreview}>
              <Icon name="ext" /> Voir ma page publique
            </button>
          </div>
        </div>
      </div>
      <RecentLeads />
    </div>
  );
}

function RecentLeads() {
  return (
    <div className="panel">
      <div className="panel__head">
        <h3>Leads récents</h3>
        <span className="sub">Capturés avant téléchargement</span>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Contact</th>
            <th>Bien</th>
            <th>Document</th>
            <th>Source</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {LEADS.slice(0, 5).map((l) => (
            <tr key={l.id}>
              <td style={{ fontWeight: 500 }}>{l.nom}</td>
              <td className="mono" style={{ fontSize: 12 }}>
                {l.phone}
              </td>
              <td>{l.property}</td>
              <td style={{ color: "var(--sb-gray-600)", fontSize: 13 }}>{l.doc}</td>
              <td>
                <span className={"tag-pill " + (l.source === "qr" ? "src-qr" : "")}>{l.source}</span>
              </td>
              <td className="mono" style={{ fontSize: 12 }}>
                {l.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ===================== AGENCES (super) ===================== */
function AgencesScreen({ agencies, onEdit, onCreate }: { agencies: RankingRow[]; onEdit: (r: RankingRow) => void; onCreate: () => void }) {
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="toolbar">
        <div className="bo__search" style={{ width: 320 }}>
          <Icon name="search" className="ic" />
          <input placeholder="Rechercher une agence ou un agent…" />
        </div>
        <span className="spacer" />
        <Magnetic strength={0.2}>
          <button className="btn" onClick={onCreate}>
            <Icon name="plus" /> Créer une agence / un agent
          </button>
        </Magnetic>
      </div>
      <div className="agcards">
        {agencies.map((r) => (
          <button className="agcard" key={r.slug} onClick={() => onEdit(r)}>
            <div className="agcard__top">
              <div className="agcard__av">
                {r.name
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="grow">
                <div className="agcard__nm">{r.name}</div>
                <div className="agcard__slug">{r.slug}.structure-b.sn</div>
              </div>
              <span className={"tag-pill " + (r.isPublic ? "on" : "vendu")}>{r.isPublic ? "Active" : "Off"}</span>
            </div>
            <div className="agcard__stats">
              <div>
                <div className="n">{r.scans.toLocaleString("fr-FR")}</div>
                <div className="l">Scans</div>
              </div>
              <div>
                <div className="n">{r.leads}</div>
                <div className="l">Leads</div>
              </div>
              <div>
                <div className="n">{r.conv}%</div>
                <div className="l">Conv.</div>
              </div>
            </div>
            <div className="agcard__foot">
              <span className="tag-pill">{r.type}</span>
              <span className="btn btn--sm btn--ghost">
                Gérer <Icon name="chevR" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===================== AGENCY EDITOR ===================== */
function AgencyEditor({
  row,
  onBack,
  onPreview,
  onSaved,
}: {
  row: RankingRow;
  onBack: () => void;
  onPreview: () => void;
  onSaved: (r: RankingRow) => void;
}) {
  const seed =
    TENANTS[row.slug === "lamarana" ? "lamarana" : row.slug === "abdoulaye-diallo" ? "abdoulaye" : ""] || {
      name: row.name,
      slug: row.slug,
      type: row.type,
      isPublic: row.isPublic,
      contacts: { phone: "", email: "", whatsapp: "", address: "" },
      about: "",
    };
  const [name, setName] = useState(seed.name);
  const [slug, setSlug] = useState(seed.slug);
  const [slugEdited, setSlugEdited] = useState(true);
  const [isPublic, setIsPublic] = useState(seed.isPublic);
  const taken = ["teranga-immo", "saly-invest"].filter((s) => s !== seed.slug);
  const norm = slugify(slug);
  const conflict = RESERVED.includes(norm) ? "réservé" : taken.includes(norm) ? "déjà pris" : norm.length < 3 ? "trop court" : null;

  const assignable = PROPERTIES;
  const [assigned, setAssigned] = useState<string[]>(("propertyIds" in seed && seed.propertyIds) || ["nayele-r2", "baobab-villa-a"]);
  const toggleAssign = (id: string) => setAssigned((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Enregistre les modifications (dont l'activation/désactivation de la page)
  // dans le registre serveur via PATCH. Cible le slug d'origine du tenant.
  const save = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      const res = await fetch(`/api/agencies/${encodeURIComponent(row.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic, name, propertyIds: assigned }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setSaveError(data?.error || "Enregistrement impossible.");
      } else {
        onSaved(data.ranking as RankingRow);
        setSaved(true);
      }
    } catch {
      setSaveError("Erreur réseau — réessayez.");
    }
    setSaving(false);
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="toolbar">
        <button className="btn btn--sm btn--ghost" onClick={onBack}>
          <Icon name="arrowL" /> Toutes les agences
        </button>
        <span className="spacer" />
        <div className="row gap12">
          <span style={{ fontSize: 12, color: "var(--sb-gray-500)", letterSpacing: ".1em", textTransform: "uppercase" }}>Page publique</span>
          <Switch
            className="sb-switch"
            checked={isPublic}
            onCheckedChange={(v) => {
              setIsPublic(v);
              setSaved(false);
            }}
            aria-label="Activer la page publique"
          />
          {saved && (
            <span className="row gap8" style={{ fontSize: 11, color: "var(--sb-gray-600)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              <Icon name="check" size={14} /> Enregistré
            </span>
          )}
          {saveError && <span style={{ fontSize: 11, color: "#000", fontWeight: 500 }}>{saveError}</span>}
          <Magnetic strength={0.2}>
            <button className="btn btn--sm btn--ghost" onClick={onPreview}>
              <Icon name="ext" /> Aperçu
            </button>
          </Magnetic>
          <Magnetic strength={0.2}>
            <button className="btn btn--sm" onClick={save} disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </Magnetic>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="editgrid">
        <div className="boform">
          <div className="boform__section">
            <h4>Identité</h4>
            <p className="desc">Nom, type et description affichés en en-tête de la landing page.</p>
            <div className="field-row">
              <div className="field">
                <label>Nom</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugEdited) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="field">
                <label>Type</label>
                <select defaultValue={seed.type}>
                  <option value="agence">Agence</option>
                  <option value="agent">Agent individuel</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea defaultValue={("about" in seed && seed.about) || "Partenaire Structure B SA."} />
            </div>
          </div>

          <div className="boform__section">
            <h4>Sous-domaine</h4>
            <p className="desc">Normalisé automatiquement (minuscules, sans accents). Provisionné en wildcard à l&apos;enregistrement.</p>
            <div className="field">
              <label>Slug</label>
              <div className="slugbox" style={{ borderColor: conflict ? "#000" : "var(--sb-gray-200)" }}>
                <input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                />
                <span className="suffix">.structure-b.sn</span>
                <span className="ok">{conflict ? <Icon name="x" size={18} /> : <Icon name="check" size={18} />}</span>
              </div>
              <div className="errmsg" style={{ color: conflict ? "#000" : "var(--sb-gray-500)" }}>
                {conflict ? `Sous-domaine ${conflict} — choisissez-en un autre.` : `Disponible · ${norm}.structure-b.sn · fallback /p/${norm}`}
              </div>
            </div>
          </div>

          <div className="boform__section">
            <h4>Coordonnées</h4>
            <div className="field-row">
              <div className="field">
                <label>Téléphone</label>
                <input defaultValue={seed.contacts.phone} />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input defaultValue={seed.contacts.whatsapp} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>E-mail</label>
                <input defaultValue={seed.contacts.email} />
              </div>
              <div className="field">
                <label>Adresse</label>
                <input defaultValue={seed.contacts.address} />
              </div>
            </div>
          </div>

          <div className="boform__section">
            <h4>
              Biens attribués <span style={{ color: "var(--sb-gray-500)", fontWeight: 400 }}>· {assigned.length}</span>
            </h4>
            <p className="desc">Sélectionnez les biens diffusés sur cette page. Mise à jour temps réel.</p>
            <div className="assignlist">
              {assignable.map((p) => (
                <label className="assignrow" key={p.id} style={{ cursor: "pointer", borderColor: assigned.includes(p.id) ? "#000" : "var(--sb-gray-200)" }}>
                  <input type="checkbox" checked={assigned.includes(p.id)} onChange={() => toggleAssign(p.id)} style={{ width: 18, height: 18, accentColor: "#000" }} />
                  <div className="av">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.pattern} alt="" />
                  </div>
                  <div>
                    <div className="nm">{p.title}</div>
                    <div className="meta">
                      {p.type} · {p.loc}
                    </div>
                  </div>
                  <span className="pr">{p.priceLabel} F</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 16 }}>
          <div className="panel">
            <div className="panel__head">
              <h3>QR code</h3>
            </div>
            <div className="panel__body" style={{ textAlign: "center" }}>
              <div className="qrcard" style={{ border: "1px solid var(--sb-gray-200)" }}>
                <QR value={norm + ".structure-b.sn"} size={170} />
                <span className="url">{norm}.structure-b.sn</span>
              </div>
              <div className="row gap8 mt16" style={{ justifyContent: "center" }}>
                <button className="btn btn--sm btn--ghost">
                  <Icon name="download" /> PNG
                </button>
                <button className="btn btn--sm btn--ghost">
                  <Icon name="download" /> SVG
                </button>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel__head">
              <h3>État</h3>
            </div>
            <div className="panel__body stack" style={{ gap: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>Page publique</span>
                <span className={"tag-pill " + (isPublic ? "on" : "vendu")}>{isPublic ? "Active" : "Désactivée"}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>SSL wildcard</span>
                <span className="tag-pill on">Émis</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>Biens en ligne</span>
                <span className="mono">{assigned.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== AGENCY CREATE ===================== */
function AgencyCreate({
  existingSlugs,
  onBack,
  onCreated,
}: {
  existingSlugs: string[];
  onBack: () => void;
  onCreated: (r: RankingRow) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"agence" | "agent">("agence");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ slug: string; name: string } | null>(null);

  const norm = slugify(slug || name);
  const conflict =
    norm.length < 3 ? "trop court" : RESERVED.includes(norm) ? "réservé" : existingSlugs.includes(norm) ? "déjà pris" : null;
  const canSubmit = name.trim().length >= 2 && !conflict && !submitting;

  const toggleAssign = (id: string) => setAssigned((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, slug: norm, about, phone, whatsapp, email, address, propertyIds: assigned, isPublic }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data?.error || "Création impossible.");
        setSubmitting(false);
        return;
      }
      onCreated(data.ranking as RankingRow);
      setCreated({ slug: data.tenant.slug, name: data.tenant.name });
    } catch {
      setError("Erreur réseau — réessayez.");
    }
    setSubmitting(false);
  };

  if (created) {
    return (
      <div className="boform" style={{ maxWidth: 560, textAlign: "center", margin: "0 auto" }}>
        <div className="modal__done" style={{ paddingTop: 8 }}>
          <div className="ico">
            <Icon name="check" size={26} />
          </div>
          <h3 style={{ fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: 24, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            {created.name} créé{type === "agence" ? "e" : ""} !
          </h3>
          <p style={{ color: "var(--sb-gray-600)", fontWeight: 300, fontSize: 15, margin: 0 }}>
            Sous-domaine provisionné — la landing page est en ligne.
          </p>
        </div>
        <div className="qrcard" style={{ border: "1px solid var(--sb-gray-200)", margin: "22px auto", maxWidth: 240 }}>
          <QR value={created.slug + ".structure-b.sn"} size={160} />
          <span className="url">{created.slug}.structure-b.sn</span>
        </div>
        <div className="row gap12" style={{ justifyContent: "center" }}>
          <Magnetic strength={0.2}>
            <button className="btn" onClick={() => window.open(tenantUrl(created.slug), "_blank", "noopener")}>
              <Icon name="ext" /> Voir la page
            </button>
          </Magnetic>
          <button className="btn btn--ghost" onClick={onBack}>
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="toolbar">
        <button className="btn btn--sm btn--ghost" onClick={onBack}>
          <Icon name="arrowL" /> Toutes les agences
        </button>
        <span className="spacer" />
        <div className="row gap12">
          <span style={{ fontSize: 12, color: "var(--sb-gray-500)", letterSpacing: ".1em", textTransform: "uppercase" }}>Page publique</span>
          <Switch className="sb-switch" checked={isPublic} onCheckedChange={setIsPublic} aria-label="Activer la page publique à la création" />
          <Magnetic strength={0.2}>
            <button className="btn btn--sm" onClick={submit} disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.5 }}>
              {submitting ? "Création…" : "Créer le partenaire"}
            </button>
          </Magnetic>
        </div>
      </div>

      {error && (
        <div className="row gap8" style={{ color: "#000", background: "var(--sb-gray-100)", border: "1px solid var(--sb-black)", padding: "12px 16px", fontSize: 13, fontWeight: 500 }}>
          <Icon name="x" size={16} /> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }} className="editgrid">
        <div className="boform">
          <div className="boform__section">
            <h4>Identité</h4>
            <p className="desc">Nom, type et description affichés en en-tête de la landing page.</p>
            <div className="field-row">
              <div className="field">
                <label>Nom</label>
                <input
                  value={name}
                  placeholder="Agence Téranga"
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slugEdited) setSlug(slugify(e.target.value));
                  }}
                />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value as "agence" | "agent")}>
                  <option value="agence">Agence</option>
                  <option value="agent">Agent individuel</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Description</label>
              <textarea value={about} placeholder="Présentation affichée sur la landing page…" onChange={(e) => setAbout(e.target.value)} />
            </div>
          </div>

          <div className="boform__section">
            <h4>Sous-domaine</h4>
            <p className="desc">Normalisé automatiquement (minuscules, sans accents). Provisionné en wildcard à l&apos;enregistrement.</p>
            <div className="field">
              <label>Slug</label>
              <div className="slugbox" style={{ borderColor: conflict ? "#000" : "var(--sb-gray-200)" }}>
                <input
                  value={slug}
                  placeholder="teranga"
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                />
                <span className="suffix">.structure-b.sn</span>
                <span className="ok">{conflict ? <Icon name="x" size={18} /> : <Icon name="check" size={18} />}</span>
              </div>
              <div className="errmsg" style={{ color: conflict ? "#000" : "var(--sb-gray-500)" }}>
                {conflict ? `Sous-domaine ${conflict} — choisissez-en un autre.` : `Disponible · ${norm || "—"}.structure-b.sn · fallback /p/${norm || "—"}`}
              </div>
            </div>
          </div>

          <div className="boform__section">
            <h4>Coordonnées</h4>
            <div className="field-row">
              <div className="field">
                <label>Téléphone</label>
                <input value={phone} placeholder="+221 33 000 00 00" onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input value={whatsapp} placeholder="+221 77 000 00 00" onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>E-mail</label>
                <input value={email} placeholder="contact@…" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="field">
                <label>Adresse</label>
                <input value={address} placeholder="Dakar, Sénégal" onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="boform__section">
            <h4>
              Biens attribués <span style={{ color: "var(--sb-gray-500)", fontWeight: 400 }}>· {assigned.length}</span>
            </h4>
            <p className="desc">Sélectionnez les biens diffusés sur cette page. Mise à jour temps réel.</p>
            <div className="assignlist">
              {PROPERTIES.map((p) => (
                <label className="assignrow" key={p.id} style={{ cursor: "pointer", borderColor: assigned.includes(p.id) ? "#000" : "var(--sb-gray-200)" }}>
                  <input type="checkbox" checked={assigned.includes(p.id)} onChange={() => toggleAssign(p.id)} style={{ width: 18, height: 18, accentColor: "#000" }} />
                  <div className="av">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.pattern} alt="" />
                  </div>
                  <div>
                    <div className="nm">{p.title}</div>
                    <div className="meta">
                      {p.type} · {p.loc}
                    </div>
                  </div>
                  <span className="pr">{p.priceLabel} F</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="stack" style={{ gap: 16 }}>
          <div className="panel">
            <div className="panel__head">
              <h3>Aperçu QR</h3>
            </div>
            <div className="panel__body" style={{ textAlign: "center" }}>
              <div className="qrcard" style={{ border: "1px solid var(--sb-gray-200)" }}>
                <QR value={(norm || "structure-b") + ".structure-b.sn"} size={170} />
                <span className="url">{norm || "—"}.structure-b.sn</span>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel__head">
              <h3>État à la création</h3>
            </div>
            <div className="panel__body stack" style={{ gap: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>Page publique</span>
                <span className={"tag-pill " + (isPublic ? "on" : "vendu")}>{isPublic ? "Active" : "Désactivée"}</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>SSL wildcard</span>
                <span className="tag-pill on">Auto</span>
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 13 }}>Biens à diffuser</span>
                <span className="mono">{assigned.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== BIENS ===================== */
function BiensScreen({ role, tenant }: { role: Role; tenant: Tenant }) {
  const list = role === "super" ? PROPERTIES : (tenant.propertyIds.map((id) => propById(id)).filter(Boolean) as Property[]);
  const [vis, setVis] = useState<Record<string, boolean>>(Object.fromEntries(list.map((p) => [p.id, p.status !== "vendu"])));
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="toolbar">
        <div className="bo__search" style={{ width: 300 }}>
          <Icon name="search" className="ic" />
          <input placeholder="Rechercher un bien…" />
        </div>
        <span className="spacer" />
        {role === "super" && (
          <Magnetic strength={0.2}>
            <button className="btn">
              <Icon name="plus" /> Nouveau bien
            </button>
          </Magnetic>
        )}
      </div>
      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Réf.</th>
              <th>Bien</th>
              <th>Type</th>
              <th>Programme</th>
              <th>Prix (FCFA)</th>
              <th>Statut</th>
              <th>Vues</th>
              <th>En ligne</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, i) => (
              <tr key={p.id}>
                <td className="mono">{p.no}</td>
                <td style={{ fontWeight: 500 }}>
                  {p.title}
                  <div style={{ fontSize: 12, color: "var(--sb-gray-500)" }}>
                    {p.area} m²{p.rooms ? " · " + p.rooms + " pièces" : ""}
                  </div>
                </td>
                <td>
                  <span className="tag-pill">{p.type}</span>
                </td>
                <td style={{ color: "var(--sb-gray-600)" }}>{p.program ? PROGRAMS[p.program].name : "—"}</td>
                <td className="mono">{p.priceLabel}</td>
                <td>
                  <span className={"tag-pill " + p.status}>
                    {p.status === "dispo" ? "Disponible" : p.status === "reserve" ? "Réservé" : "Vendu"}
                  </span>
                </td>
                <td className="mono">{420 - i * 47}</td>
                <td>
                  <Switch className="sb-switch" checked={!!vis[p.id]} onCheckedChange={(v) => setVis((s) => ({ ...s, [p.id]: v }))} aria-label={`Mettre en ligne ${p.title}`} />
                </td>
                <td>
                  <button className="btn btn--sm btn--ghost">
                    <Icon name="edit" size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== ANALYTICS ===================== */
function AnalyticsScreen({ role }: { role: Role }) {
  const f = role === "super" ? 1 : 0.5;
  const byProp = PROPERTIES.slice(0, 5).map((p, i) => ({ name: p.title, v: Math.round((520 - i * 80) * f) }));
  return (
    <div className="stack" style={{ gap: 22 }}>
      <div className="kpis">
        <KPI label="Scans QR" icon="scan" value={Math.round(ANALYTICS.scans.reduce((a, b) => a + b, 0) * f)} format delta="+12,4 %" deltaDir="up" />
        <KPI label="Vues" icon="eye" value={Math.round(ANALYTICS.views.reduce((a, b) => a + b, 0) * f)} format delta="+8,1 %" deltaDir="up" />
        <KPI label="Téléchargements" icon="download" value={Math.round(ANALYTICS.downloads.reduce((a, b) => a + b, 0) * f)} delta="+5,5 %" deltaDir="up" />
        <KPI label="Taux conversion" icon="trend" value={3} suffix=",1 %" delta="lead / vue" />
      </div>
      <div className="panel">
        <div className="panel__head">
          <h3>Scans vs. visites directes</h3>
          <span className="sub">14 derniers jours</span>
        </div>
        <LineChart
          labels={ANALYTICS.days}
          series={[
            { name: "Scans QR", data: ANALYTICS.scans.map((v) => Math.round(v * f)) },
            { name: "Visites directes", data: ANALYTICS.views.map((v) => Math.round(v * f * 0.6)) },
          ]}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }} className="dashgrid">
        <div className="panel">
          <div className="panel__head">
            <h3>Téléchargements / jour</h3>
          </div>
          <BarChart
            labels={ANALYTICS.days.filter((_, i) => i % 2 === 0)}
            data={ANALYTICS.downloads.filter((_, i) => i % 2 === 0).map((v) => Math.round(v * f))}
          />
        </div>
        <div className="panel">
          <div className="panel__head">
            <h3>Vues par bien</h3>
          </div>
          <div className="panel__body stack" style={{ gap: 14 }}>
            {byProp.map((b, i) => (
              <div key={i}>
                <div className="row" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{b.name}</span>
                  <span className="mono">{b.v}</span>
                </div>
                <div style={{ height: 6, background: "var(--sb-gray-100)" }}>
                  <div style={{ height: "100%", width: (b.v / byProp[0].v) * 100 + "%", background: "#000" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== LEADS ===================== */
function LeadsScreen() {
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="toolbar">
        <div className="bo__search" style={{ width: 300 }}>
          <Icon name="search" className="ic" />
          <input placeholder="Rechercher un lead…" />
        </div>
        <span className="spacer" />
        <span className="row gap8" style={{ fontSize: 12, color: "var(--sb-gray-500)" }}>
          <Icon name="shield" size={14} /> Consentement RGPD enregistré
        </span>
        <Magnetic strength={0.2}>
          <button className="btn btn--ghost btn--sm">
            <Icon name="download" /> Export CSV
          </button>
        </Magnetic>
      </div>
      <div className="panel">
        <table className="tbl">
          <thead>
            <tr>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Téléphone</th>
              <th>Bien</th>
              <th>Document</th>
              <th>Source</th>
              <th>Consent.</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {LEADS.map((l) => (
              <tr key={l.id}>
                <td style={{ fontWeight: 500 }}>{l.nom}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {l.email}
                </td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {l.phone}
                </td>
                <td style={{ fontSize: 13 }}>{l.property}</td>
                <td style={{ fontSize: 13, color: "var(--sb-gray-600)" }}>{l.doc}</td>
                <td>
                  <span className={"tag-pill " + (l.source === "qr" ? "src-qr" : "")}>{l.source}</span>
                </td>
                <td>{l.consent ? <Icon name="check" size={16} /> : <Icon name="x" size={16} />}</td>
                <td className="mono" style={{ fontSize: 12 }}>
                  {l.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== AUDIT ===================== */
function AuditScreen() {
  return (
    <div className="panel">
      <div className="panel__head">
        <h3>Journal d&apos;audit</h3>
        <span className="sub">Activations, désactivations, modifications</span>
      </div>
      <div className="panel__body">
        {AUDIT.map((a, i) => (
          <div
            key={i}
            style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 18, padding: "16px 0", borderBottom: i < AUDIT.length - 1 ? "1px solid var(--sb-gray-100)" : "0" }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--sb-gray-500)" }}>{a.t}</span>
            <div className="row gap12" style={{ alignItems: "flex-start" }}>
              <span className="tag-pill">{a.who}</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{a.act}</div>
                <div style={{ fontSize: 13, color: "var(--sb-gray-600)", marginTop: 2 }}>{a.det}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== MA PAGE (agent) ===================== */
function MaPageScreen({ tenant, onPreview, onToggleTenant }: { tenant: Tenant; onPreview: () => void; onToggleTenant: () => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }} className="editgrid">
      <div className="boform">
        <div className="boform__section">
          <h4>Statut de la page</h4>
          <p className="desc">Activez ou désactivez la consultation publique de votre landing page.</p>
          <div className="assignrow" style={{ borderColor: tenant.isPublic ? "#000" : "var(--sb-gray-200)" }}>
            <Icon name="globe" />
            <div>
              <div className="nm">{tenant.slug}.structure-b.sn</div>
              <div className="meta">{tenant.isPublic ? "Visible publiquement · SSL actif" : "Désactivée — écran « Page indisponible »"}</div>
            </div>
            <Switch className="sb-switch" style={{ marginLeft: "auto" }} checked={tenant.isPublic} onCheckedChange={onToggleTenant} aria-label="Activer la page publique" />
          </div>
        </div>
        <div className="boform__section">
          <h4>Profil affiché</h4>
          <div className="field-row">
            <div className="field">
              <label>Nom affiché</label>
              <input defaultValue={tenant.name} />
            </div>
            <div className="field">
              <label>Accroche</label>
              <input defaultValue={tenant.tagline} />
            </div>
          </div>
          <div className="field">
            <label>Présentation</label>
            <textarea defaultValue={tenant.about} />
          </div>
        </div>
        <div className="boform__section">
          <h4>Coordonnées & CTA</h4>
          <div className="field-row">
            <div className="field">
              <label>Téléphone</label>
              <input defaultValue={tenant.contacts.phone} />
            </div>
            <div className="field">
              <label>WhatsApp</label>
              <input defaultValue={tenant.contacts.whatsapp} />
            </div>
          </div>
          <div className="field">
            <label>E-mail</label>
            <input defaultValue={tenant.contacts.email} />
          </div>
        </div>
      </div>
      <div className="stack" style={{ gap: 16 }}>
        <div className="panel">
          <div className="panel__head">
            <h3>QR code</h3>
          </div>
          <div className="panel__body" style={{ textAlign: "center" }}>
            <div className="qrcard" style={{ border: "1px solid var(--sb-gray-200)" }}>
              <QR value={tenant.slug + ".structure-b.sn"} size={180} />
              <span className="url">{tenant.slug}.structure-b.sn</span>
            </div>
            <button className="btn btn--block mt16" onClick={onPreview}>
              <Icon name="ext" /> Voir ma page
            </button>
            <div className="row gap8 mt16" style={{ justifyContent: "center" }}>
              <button className="btn btn--sm btn--ghost">
                <Icon name="download" /> PNG
              </button>
              <button className="btn btn--sm btn--ghost">
                <Icon name="download" /> SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
