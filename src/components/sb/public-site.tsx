"use client";
/* public-site — Landing page partenaire
   Structure B (charte monochrome) + UX « user-friendly » façon HavenHues :
   barre de recherche, bandeau d'expertise, cartes de biens lisibles. */
import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { Reveal, RevealLines, Magnetic, CountUp, useParallax } from "./primitives";
import { PROGRAMS, propById, type Program, type Property, type Tenant } from "@/lib/data";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

interface Tweaks {
  heroDark: boolean;
  animScale: number;
  gridCols: number;
  showPattern: boolean;
}

/* ---- search criteria ---- */
interface Criteria {
  type: string;
  loc: string;
  rooms: string;
  budget: [number, number] | null;
}

const BUDGETS: { label: string; range: [number, number] | null }[] = [
  { label: "Tous budgets", range: null },
  { label: "Moins de 50 M", range: [0, 50000000] },
  { label: "50 – 100 M", range: [50000000, 100000000] },
  { label: "100 – 200 M", range: [100000000, 200000000] },
  { label: "Plus de 200 M", range: [200000000, Infinity] },
];

function matchCriteria(p: Property, c: Criteria | null): boolean {
  if (!c) return true;
  if (c.type && c.type !== "Tous" && p.type !== c.type) return false;
  if (c.loc && !p.loc.toLowerCase().includes(c.loc.toLowerCase())) return false;
  if (c.rooms) {
    const r = parseInt(c.rooms, 10);
    if (String(c.rooms).includes("+")) {
      if (p.rooms < r) return false;
    } else if (p.rooms < r) return false;
  }
  if (c.budget) {
    if (p.price < c.budget[0] || p.price > c.budget[1]) return false;
  }
  return true;
}

/* ---- sticky header with scroll state ---- */
function PublicHeader({
  heroDark,
  onHome,
  onContact,
}: {
  heroDark: boolean;
  onHome: () => void;
  onContact: () => void;
}) {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const ondark = heroDark && !solid;
  return (
    <header className={`phead ${solid ? "solid" : ""} ${ondark || (heroDark && solid) ? "ondark" : ""}`}>
      <div className="phead__in">
        <div className="phead__logo" onClick={onHome}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-mark-black.png" alt="Structure B" />
          <div className="phead__brand">
            <span className="nm">Structure B SA</span>
            <span className="sl">Votre Plan A</span>
          </div>
        </div>
        <nav className="phead__nav">
          <span className="navlinks">
            <a onClick={() => scrollTo("biens")}>Les biens</a>
            <a onClick={() => scrollTo("programmes")}>Programmes</a>
            <a onClick={() => scrollTo("apropos")}>L&apos;agence</a>
          </span>
          <Magnetic strength={0.3}>
            <button className={`btn btn--sm ${ondark ? "btn--light" : ""}`} onClick={onContact}>
              Nous contacter <Icon name="arrowUR" />
            </button>
          </Magnetic>
        </nav>
      </div>
    </header>
  );
}

/* ---- HERO ---- */
function Hero({
  tenant,
  featured,
  heroDark,
  showPattern,
}: {
  tenant: Tenant;
  featured: Program | Property | undefined;
  heroDark: boolean;
  showPattern: boolean;
}) {
  const patRef = useParallax<HTMLDivElement>(0.1);
  const titleWords = tenant.type === "agence" ? [tenant.short.toUpperCase()] : tenant.name.toUpperCase().split(" ");
  const featuredName = featured ? ("name" in featured ? featured.name : featured.title) : "";
  return (
    <section className={`hero ${heroDark ? "hero--dark" : "hero--light"}`}>
      {heroDark && tenant.heroPhoto && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero__photo" src={tenant.heroPhoto} alt="" />
          <div className="hero__scrim" />
        </>
      )}
      {showPattern && <div ref={patRef} className="hero__pat" style={{ backgroundImage: `url(${tenant.pattern})` }} />}
      <div className="wrap" style={{ position: "relative", width: "100%" }}>
        <Reveal className="hero__kicker">
          <span className="dot" />
          {tenant.role}
        </Reveal>
        <RevealLines as="h1" className="hero__title" lines={[...titleWords]} />
        <Reveal delay={250} className="hero__sub">
          {tenant.tagline} {tenant.about.split(".")[0]}.
        </Reveal>
      </div>
      {featured && (
        <div className="hero__label">
          <span className="k">Programme à la une</span>
          <span className="v">{featuredName}</span>
          <span className="l">
            <Icon name="pin" size={12} /> {featured.loc}
          </span>
        </div>
      )}
      <div className="hero__foot">
        <div className="wrap">
          <span className="hero__scroll">
            Défiler <span className="bar" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---- SEARCH BAR (user-friendly filter) ---- */
function SearchBar({ props, onSearch }: { props: Property[]; onSearch: (c: Criteria) => void }) {
  const types = Array.from(new Set(props.map((p) => p.type)));
  const locs = Array.from(new Set(props.map((p) => p.loc.split(",").pop()!.trim())));
  const [f, setF] = useState({ transaction: "Acheter", type: "", loc: "", rooms: "", budget: "0" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = () => {
    onSearch({
      type: f.type || "Tous",
      loc: f.loc,
      rooms: f.rooms,
      budget: BUDGETS[parseInt(f.budget, 10)]?.range || null,
    });
  };
  return (
    <section className="searchwrap" id="search">
      <div className="wrap">
        <Reveal className="searchbar">
          <div className="searchbar__field">
            <label>Transaction</label>
            <select value={f.transaction} onChange={set("transaction")}>
              <option>Acheter</option>
              <option>Investir</option>
            </select>
          </div>
          <div className="searchbar__field">
            <label>Localisation</label>
            <select value={f.loc} onChange={set("loc")}>
              <option value="">Toutes zones</option>
              {locs.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="searchbar__field">
            <label>Type de bien</label>
            <select value={f.type} onChange={set("type")}>
              <option value="">Tous types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="searchbar__field">
            <label>Chambres</label>
            <select value={f.rooms} onChange={set("rooms")}>
              <option value="">Indifférent</option>
              <option value="2">2 et +</option>
              <option value="3">3 et +</option>
              <option value="4">4 et +</option>
              <option value="5+">5 et +</option>
            </select>
          </div>
          <div className="searchbar__field">
            <label>Budget</label>
            <select value={f.budget} onChange={set("budget")}>
              {BUDGETS.map((b, i) => (
                <option key={i} value={i}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
          <Magnetic strength={0.25}>
            <button className="searchbar__go" onClick={submit}>
              <Icon name="search" /> <span>Rechercher</span>
            </button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

/* ---- EXPERTISE (about + gallery strip) ---- */
function Expertise({ tenant, props, onOpen }: { tenant: Tenant; props: Property[]; onOpen: (id: string) => void }) {
  const shots = props.slice(0, 4);
  const c = tenant.contacts;
  return (
    <section className="sec" id="apropos">
      <div className="wrap">
        <div className="expertise">
          <div className="expertise__head">
            <Reveal className="sechead__eye">— {tenant.type === "agence" ? "L'agence" : "Le conseiller"}</Reveal>
            <RevealLines as="h2" className="sechead__title" lines={["Votre patrimoine,", "notre expertise."]} />
            {tenant.verified && (
              <Reveal delay={120} className="expertise__verif">
                <Icon name="shield" size={15} /> Partenaire Structure B vérifié
              </Reveal>
            )}
          </div>
          <div className="expertise__body">
            <Reveal delay={120}>
              <p>{tenant.about}</p>
            </Reveal>
            <Reveal delay={190}>
              <p>{tenant.about2}</p>
            </Reveal>
            <Reveal delay={260} className="identity__contacts">
              <a className="identity__chip" href={`tel:${c.phone}`}>
                <Icon name="phone" /> {c.phone}
              </a>
              <a className="identity__chip" href={`mailto:${c.email}`}>
                <Icon name="mail" /> {c.email}
              </a>
              <span className="identity__chip">
                <Icon name="pin" /> {c.address}
              </span>
            </Reveal>
          </div>
        </div>

        <div className="exgrid">
          {shots.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <Magnetic strength={0.1} style={{ display: "block" }}>
                <article className="exshot" onClick={() => onOpen(p.id)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.cover || p.pattern} alt="" loading="lazy" />
                  <span className="exshot__tag">{p.type}</span>
                  <span className="exshot__arrow">
                    <Icon name="arrowUR" size={16} />
                  </span>
                </article>
              </Magnetic>
            </Reveal>
          ))}
          <Reveal delay={shots.length * 70}>
            <button className="exmore" onClick={() => scrollTo("biens")}>
              <span className="exmore__ic">
                <Icon name="arrowUR" size={20} />
              </span>
              <span className="exmore__t">
                Tous
                <br />
                les biens
              </span>
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---- STATS ---- */
function StatsBand({ tenant }: { tenant: Tenant }) {
  const items = [
    { n: tenant.stats.biens, l: "Biens disponibles", suffix: "" },
    { n: tenant.stats.programmes, l: "Programmes" },
    { n: 30, l: "Plus-value cible", suffix: " %", prefix: "+" },
    { n: tenant.stats.scans, l: "Scans cette année", format: true },
  ];
  return (
    <section className="sec sec--dark">
      <div className="wrap">
        <Reveal className="stats">
          {items.map((s, i) => (
            <div className="stat" key={i}>
              <div className="stat__num">
                <CountUp to={s.n} suffix={s.suffix || ""} prefix={s.prefix || ""} format={s.format} />
              </div>
              <div className="stat__lbl">{s.l}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---- PROPERTY CARD (HavenHues-style) ---- */
function PCard({ p, onOpen }: { p: Property; onOpen: (id: string) => void }) {
  const statusLabel = p.status === "dispo" ? "À vendre" : p.status === "reserve" ? "Réservé" : "Vendu";
  return (
    <Magnetic strength={0.1} style={{ display: "block" }}>
      <article className="pcard" onClick={() => onOpen(p.id)}>
        <div className="pcard__cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pat" src={p.cover || p.pattern} alt="" loading="lazy" />
          <span className={`pcard__badge ${p.status}`}>{statusLabel}</span>
          <span className="pcard__open">
            <Icon name="arrowUR" size={16} />
          </span>
        </div>
        <div className="pcard__body">
          <div className="pcard__price">
            {p.priceLabel} <small>FCFA</small>
          </div>
          <h3 className="pcard__name">{p.title}</h3>
          <span className="pcard__loc">
            <Icon name="pin" size={13} /> {p.loc}
          </span>
          <div className="pcard__meta">
            {p.rooms > 0 && (
              <span>
                <Icon name="bed" /> {p.rooms} ch.
              </span>
            )}
            {p.baths > 0 && (
              <span>
                <Icon name="bath" /> {p.baths} sdb
              </span>
            )}
            <span>
              <Icon name="maximize" /> {p.area} m²
            </span>
          </div>
        </div>
      </article>
    </Magnetic>
  );
}

/* ---- PROPERTIES GRID ---- */
function Biens({
  tenant,
  props,
  gridCols,
  criteria,
  setCriteria,
  onOpen,
}: {
  tenant: Tenant;
  props: Property[];
  gridCols: number;
  criteria: Criteria;
  setCriteria: React.Dispatch<React.SetStateAction<Criteria>>;
  onOpen: (id: string) => void;
}) {
  const types = ["Tous", ...Array.from(new Set(props.map((p) => p.type)))];
  const list = props.filter((p) => matchCriteria(p, criteria));
  const hasFilters = !!(criteria.loc || criteria.rooms || criteria.budget || (criteria.type && criteria.type !== "Tous"));
  const reset = () => setCriteria({ type: "Tous", loc: "", rooms: "", budget: null });
  return (
    <section className="sec sec--alt" id="biens">
      <div className="wrap">
        <div className="sechead">
          <Reveal className="sechead__eye">— Portefeuille</Reveal>
          <RevealLines as="h2" className="sechead__title" lines={["Découvrez nos", "biens & programmes"]} />
          <Reveal delay={120} className="sechead__aside">
            Une sélection présentée par {tenant.short}. Données et disponibilités mises à jour en temps réel.
          </Reveal>
        </div>
        <Reveal className="filters">
          <div className="filters__chips">
            {types.map((t) => {
              const ct = t === "Tous" ? props.length : props.filter((p) => p.type === t).length;
              const active = (criteria.type || "Tous") === t;
              return (
                <button key={t} className="chip" aria-pressed={active} onClick={() => setCriteria((c) => ({ ...c, type: t }))}>
                  {t} <span className="ct">{ct}</span>
                </button>
              );
            })}
          </div>
          {hasFilters && (
            <button className="filters__reset" onClick={reset}>
              <Icon name="x" size={13} /> Réinitialiser
            </button>
          )}
        </Reveal>
        {list.length > 0 ? (
          <div className="pgrid" style={{ ["--cols" as string]: gridCols }}>
            {list.map((p, i) => (
              <Reveal key={p.id} delay={(i % gridCols) * 80}>
                <PCard p={p} onOpen={onOpen} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="pempty">
            <Icon name="search" size={26} />
            <p>Aucun bien ne correspond à ces critères.</p>
            <button className="btn btn--ghost btn--sm" onClick={reset}>
              Voir tous les biens
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---- SHOWCASE / PROGRAMMES (parallax) ---- */
function ShowRow({ pg }: { pg: Program }) {
  const patRef = useParallax<HTMLImageElement>(0.08);
  return (
    <div className="showrow">
      <Reveal className="showrow__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={patRef} className="pat" src={pg.cover || pg.pattern} alt="" loading="lazy" />
        <span className="tag">{pg.tag}</span>
      </Reveal>
      <div>
        <Reveal className="showrow__no">
          PROGRAMME {pg.no} · {pg.loc}
        </Reveal>
        <RevealLines as="h3" lines={[pg.name]} />
        <Reveal delay={120}>
          <p>{pg.desc}</p>
        </Reveal>
        <Reveal delay={200} className="showrow__specs">
          <div>
            <div className="k">Lots</div>
            <div className="v">{pg.lots}</div>
          </div>
          <div>
            <div className="k">Livraison</div>
            <div className="v">{pg.livraison}</div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Showcase({ programs }: { programs: Program[] }) {
  return (
    <section className="sec" id="programmes">
      <div className="wrap">
        <div className="sechead">
          <Reveal className="sechead__eye">— Programmes Structure B</Reveal>
          <RevealLines as="h2" className="sechead__title" lines={["Des adresses", "qui font référence"]} />
        </div>
        <div className="showcase">
          {programs.map((pg) => (
            <ShowRow key={pg.id} pg={pg} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- MAP ---- */
function MapBlock({ props }: { props: Property[] }) {
  return (
    <section className="sec sec--alt">
      <div className="wrap">
        <div className="sechead">
          <Reveal className="sechead__eye">— Localisation</Reveal>
          <RevealLines as="h2" className="sechead__title" lines={["Sur la carte"]} />
          <Reveal delay={120} className="sechead__aside">
            Biens situés entre Dakar et la Petite Côte.
          </Reveal>
        </div>
        <Reveal className="map">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pat" src="/assets/pattern-01-30.png" alt="" />
          <div className="map__grid" />
          {props.slice(0, 5).map((p) => (
            <div className="map__pin" key={p.id} style={{ left: p.lng + "%", top: p.lat + "%" }}>
              <div className="dot" />
              <div className="lbl">{p.type}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ---- PUBLIC PAGE SHELL ---- */
export function PublicSite({
  tenant,
  tweaks,
  onOpenProperty,
}: {
  tenant: Tenant;
  tweaks: Tweaks;
  onOpenProperty: (id: string) => void;
}) {
  const props = tenant.propertyIds.map((id) => propById(id)).filter(Boolean) as Property[];
  const programIds = Array.from(new Set(props.map((p) => p.program).filter(Boolean))) as string[];
  const programs = programIds.map((id) => PROGRAMS[id]).filter(Boolean);
  const featured: Program | Property | undefined = programs[0] || props[0];
  const heroDark = tweaks.heroDark;
  const [criteria, setCriteria] = useState<Criteria>({ type: "Tous", loc: "", rooms: "", budget: null });
  const onSearch = (c: Criteria) => {
    setCriteria(c);
    setTimeout(() => scrollTo("biens"), 60);
  };
  const scrollContact = () => scrollTo("apropos");

  if (!tenant.isPublic) {
    return (
      <div className="unavail">
        <div>
          <div className="unavail__code">HTTP 404 · PAGE DÉSACTIVÉE</div>
          <h1>
            Page
            <br />
            indisponible
          </h1>
          <p style={{ color: "var(--sb-gray-300)", maxWidth: 420, margin: "0 auto" }}>
            Cette page partenaire n&apos;est pas accessible publiquement pour le moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-public" style={{ ["--anim-scale" as string]: tweaks.animScale }}>
      <PublicHeader heroDark={heroDark} onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })} onContact={scrollContact} />
      <Hero tenant={tenant} featured={featured} heroDark={heroDark} showPattern={tweaks.showPattern} />
      <SearchBar props={props} onSearch={onSearch} />
      <Expertise tenant={tenant} props={props} onOpen={onOpenProperty} />
      <StatsBand tenant={tenant} />
      <Biens tenant={tenant} props={props} gridCols={tweaks.gridCols} criteria={criteria} setCriteria={setCriteria} onOpen={onOpenProperty} />
      {programs.length > 0 && <Showcase programs={programs} />}
      <MapBlock props={props} />
    </div>
  );
}
