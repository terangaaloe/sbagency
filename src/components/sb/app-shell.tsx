"use client";
/* app-shell — routeur / shell de démonstration (Structure B) */
import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { PublicSite } from "./public-site";
import { PropertyDetail, LeadModal } from "./detail";
import { BackOffice, Login, type Role } from "./backoffice";
import { TENANTS, propById, type Property, type PropertyDoc, type Tenant } from "@/lib/data";

type View = "public" | "detail" | "bo";
type AnimIntensity = "subtile" | "standard" | "ample";

const ANIM_MAP: Record<AnimIntensity, number> = { subtile: 0.45, standard: 1, ample: 1.55 };

interface TweakState {
  heroDark: boolean;
  animIntensity: AnimIntensity;
  gridCols: number;
  showPattern: boolean;
}

/* ---- DEMO BAR ---- */
function DemoBar({ view, slug, onPick }: { view: View; slug: string; onPick: (v: View, s?: string) => void }) {
  if (view === "detail") return null;
  return (
    <div className="modebar">
      <button aria-current={view === "public" && slug === "lamarana"} onClick={() => onPick("public", "lamarana")}>
        <Icon name="building" size={14} /> Landing · Agence
      </button>
      <button aria-current={view === "public" && slug === "abdoulaye"} onClick={() => onPick("public", "abdoulaye")}>
        <Icon name="users" size={14} /> Landing · Agent
      </button>
      <span className="sep" />
      <button aria-current={view === "bo"} onClick={() => onPick("bo")}>
        <Icon name="dash" size={14} /> Back-office
      </button>
    </div>
  );
}

/* ---- TWEAKS PANEL ---- */
function TweaksPanel({ t, setTweak }: { t: TweakState; setTweak: <K extends keyof TweakState>(k: K, v: TweakState[K]) => void }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="tweaks">
      <div className="tweaks__head" onClick={() => setOpen((v) => !v)}>
        <h4>Tweaks</h4>
        <Icon name={open ? "chevR" : "chevL"} size={14} style={{ color: "var(--sb-gray-400)" }} />
      </div>
      {open && (
        <div className="tweaks__body">
          <div className="tweaks__section">Mouvement</div>
          <div className="tweaks__row">
            <span className="lbl">Animations</span>
            <div className="tweaks__seg">
              {(["subtile", "standard", "ample"] as AnimIntensity[]).map((o) => (
                <button key={o} aria-pressed={t.animIntensity === o} onClick={() => setTweak("animIntensity", o)}>
                  {o.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="tweaks__section">Hero</div>
          <div className="tweaks__row">
            <span className="lbl">Fond sombre</span>
            <div className="tweaks__seg">
              <button aria-pressed={t.heroDark} onClick={() => setTweak("heroDark", true)}>
                On
              </button>
              <button aria-pressed={!t.heroDark} onClick={() => setTweak("heroDark", false)}>
                Off
              </button>
            </div>
          </div>
          <div className="tweaks__row">
            <span className="lbl">Motif géométrique</span>
            <div className="tweaks__seg">
              <button aria-pressed={t.showPattern} onClick={() => setTweak("showPattern", true)}>
                On
              </button>
              <button aria-pressed={!t.showPattern} onClick={() => setTweak("showPattern", false)}>
                Off
              </button>
            </div>
          </div>
          <div className="tweaks__section">Grille des biens</div>
          <div className="tweaks__row">
            <span className="lbl">Colonnes</span>
            <div className="tweaks__seg">
              {[2, 3, 4].map((o) => (
                <button key={o} aria-pressed={t.gridCols === o} onClick={() => setTweak("gridCols", o)}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- APP ---- */
export function SBApp() {
  const [t, setT] = useState<TweakState>({ heroDark: true, animIntensity: "ample", gridCols: 3, showPattern: true });
  const setTweak = <K extends keyof TweakState>(k: K, v: TweakState[K]) => setT((s) => ({ ...s, [k]: v }));

  const [view, setView] = useState<View>("public");
  const [slug, setSlug] = useState("lamarana");
  const [role, setRole] = useState<Role | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [lead, setLead] = useState<{ open: boolean; doc: PropertyDoc | null; property: Property | null }>({ open: false, doc: null, property: null });
  const [tenants, setTenants] = useState<Record<string, Tenant>>(() => JSON.parse(JSON.stringify(TENANTS)));

  const tenant = tenants[slug];
  const tweaks = {
    heroDark: t.heroDark,
    animScale: ANIM_MAP[t.animIntensity] ?? 1,
    gridCols: t.gridCols,
    showPattern: t.showPattern,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view, slug, detailId]);

  const pick = (v: View, s?: string) => {
    if (v === "public" && s) setSlug(s);
    setView(v);
    setDetailId(null);
  };
  const openProperty = (id: string) => {
    setDetailId(id);
    setView("detail");
  };
  const requestDoc = (doc: PropertyDoc, property: Property) => setLead({ open: true, doc, property });
  const toggleLamarana = () => setTenants((tt) => ({ ...tt, lamarana: { ...tt.lamarana, isPublic: !tt.lamarana.isPublic } }));

  let body: React.ReactNode;
  if (view === "bo") {
    body =
      role === null ? (
        <Login onLogin={setRole} />
      ) : (
        <BackOffice
          role={role}
          tenant={tenants.lamarana}
          onLogout={() => setRole(null)}
          onPreview={() => pick("public", "lamarana")}
          onToggleTenant={toggleLamarana}
        />
      );
  } else if (view === "detail") {
    const prop = propById(detailId);
    body = prop ? (
      <PropertyDetail property={prop} tenant={tenant} onBack={() => setView("public")} onRequestDoc={requestDoc} />
    ) : null;
  } else {
    body = <PublicSite tenant={tenant} tweaks={tweaks} onOpenProperty={openProperty} />;
  }

  const showTweaks = false;

  return (
    <div className="app-root">
      {body}
      <LeadModal
        open={lead.open}
        doc={lead.doc}
        property={lead.property}
        tenant={tenant}
        onClose={() => setLead((l) => ({ ...l, open: false }))}
        onDownload={() => {
          /* lead enregistré (démo) */
        }}
      />
      <DemoBar view={view} slug={slug} onPick={pick} />
      {showTweaks && <TweaksPanel t={t} setTweak={setTweak} />}
    </div>
  );
}
