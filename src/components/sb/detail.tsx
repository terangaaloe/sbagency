"use client";
/* detail — Détail d'un bien + galerie + documents + modale lead RGPD */
import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { Reveal, Magnetic } from "./primitives";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROGRAMS, PROPERTIES, type Property, type PropertyDoc, type Tenant } from "@/lib/data";

const statusLabelOf = (s: Property["status"]) =>
  s === "dispo" ? "Disponible" : s === "reserve" ? "Réservé" : "Vendu";

/* ---- LEAD CAPTURE MODAL ---- */
export function LeadModal({
  open,
  doc,
  property,
  tenant,
  onClose,
  onDownload,
}: {
  open: boolean;
  doc: PropertyDoc | null;
  property: Property | null;
  tenant: Tenant | undefined;
  onClose: () => void;
  onDownload?: (payload: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", phone: "", interet: "" });
  const [consent, setConsent] = useState(false);
  const [errs, setErrs] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setDone(false);
      setErrs({});
    }
  }, [open]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, number> = {};
    if (!form.prenom.trim()) er.prenom = 1;
    if (!form.nom.trim()) er.nom = 1;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) er.email = 1;
    if (!/[0-9]{6,}/.test(form.phone.replace(/\s/g, ""))) er.phone = 1;
    if (!consent) er.consent = 1;
    setErrs(er);
    if (Object.keys(er).length) return;
    setDone(true);
    onDownload?.({ ...form, source: "qr", doc: doc?.name, property: property?.title });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent showCloseButton={false} className="sb-dialog">
        {!done ? (
          <>
            <div className="modal__head">
              <div>
                <div className="modal__eye">Téléchargement sécurisé</div>
                <DialogTitle className="modal__title">Recevez le document</DialogTitle>
              </div>
              <button className="modal__close" onClick={onClose} aria-label="Fermer">
                <Icon name="x" />
              </button>
            </div>
            <DialogDescription className="sr-only">
              Formulaire de consentement RGPD à compléter avant le téléchargement du document.
            </DialogDescription>
            {doc && (
              <div className="modal__doc">
                <Icon name="file" className="ic" />
                <div>
                  <div className="nm">{doc.name}</div>
                  <div className="meta">
                    {doc.kind} · {doc.size}
                    {property ? " · " + property.title : ""}
                  </div>
                </div>
              </div>
            )}
            <form className="modal__body" onSubmit={submit} noValidate>
              <div className="field-row">
                <div className="field">
                  <label>Prénom</label>
                  <input className={errs.prenom ? "field-err" : ""} value={form.prenom} onChange={set("prenom")} placeholder="Fatou" />
                </div>
                <div className="field">
                  <label>Nom</label>
                  <input className={errs.nom ? "field-err" : ""} value={form.nom} onChange={set("nom")} placeholder="Sarr" />
                </div>
              </div>
              <div className="field">
                <label>E-mail</label>
                <input className={errs.email ? "field-err" : ""} value={form.email} onChange={set("email")} placeholder="vous@email.com" />
                {errs.email && <div className="errmsg">E-mail valide requis</div>}
              </div>
              <div className="field">
                <label>Téléphone</label>
                <input className={errs.phone ? "field-err" : ""} value={form.phone} onChange={set("phone")} placeholder="+221 77 000 00 00" />
                {errs.phone && <div className="errmsg">Numéro valide requis</div>}
              </div>
              <div className="field">
                <label>Bien qui vous intéresse (optionnel)</label>
                <select value={form.interet} onChange={set("interet")}>
                  <option value="">— Aucun en particulier —</option>
                  {PROPERTIES.filter((p) => p.status !== "vendu").map((p) => (
                    <option key={p.id} value={p.title}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <label className={`consent ${errs.consent ? "field-err" : ""}`}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  J&apos;accepte que {tenant?.short || "l'agence"} et Structure B SA conservent ces données pendant 24 mois afin de me
                  recontacter au sujet de ce bien. <a>Politique de confidentialité</a>.
                </span>
              </label>
              <Magnetic strength={0.2} style={{ display: "block" }}>
                <button type="submit" className="btn btn--block">
                  <Icon name="download" /> Télécharger le document
                </button>
              </Magnetic>
              <p style={{ fontSize: 11, color: "var(--sb-gray-500)", marginTop: 14, textAlign: "center" }}>
                Le téléchargement démarre après validation du formulaire.
              </p>
            </form>
          </>
        ) : (
          <div className="modal__body">
            <div className="modal__done">
              <div className="ico">
                <Icon name="check" size={26} />
              </div>
              <DialogTitle className="modal__done-title">Merci, {form.prenom} !</DialogTitle>
              <DialogDescription className="modal__done-desc">
                Votre téléchargement a démarré. Un conseiller {tenant?.short} pourra vous recontacter.
              </DialogDescription>
            </div>
            <div className="modal__doc" style={{ margin: "8px 0 18px" }}>
              <Icon name="file" className="ic" />
              <div>
                <div className="nm">{doc?.name}</div>
                <div className="meta">Téléchargement en cours…</div>
              </div>
              <Icon name="download" style={{ marginLeft: "auto", width: 18, height: 18 }} />
            </div>
            <button className="btn btn--ghost btn--block" onClick={onClose}>
              Fermer
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---- DETAIL HEADER (light, minimal) ---- */
function DetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="phead solid">
      <div className="phead__in">
        <div className="phead__logo" onClick={onBack}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-mark-black.png" alt="Structure B" />
          <div className="phead__brand">
            <span className="nm">Structure B SA</span>
            <span className="sl">Votre Plan A</span>
          </div>
        </div>
        <nav className="phead__nav">
          <Magnetic strength={0.3}>
            <button className="btn btn--sm btn--ghost" onClick={onBack}>
              <Icon name="arrowL" /> Retour
            </button>
          </Magnetic>
        </nav>
      </div>
    </header>
  );
}

/* ---- GALLERY (main + thumbs) ---- */
function DetailGallery({ p }: { p: Property }) {
  const photos = (p.photos && p.photos.length ? p.photos : [p.cover]).filter(Boolean);
  const main = photos[0];
  const thumbs = photos.slice(1, 5);
  const extra = Math.max(0, photos.length - 5);
  return (
    <Reveal className="dgallery">
      <div className="dgallery__main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={main} alt={p.gallery?.[0] || p.title} loading="lazy" />
        <span className="gtag">{p.gallery?.[0] || "Vue principale"}</span>
      </div>
      <div className="dgallery__thumbs">
        {thumbs.map((src, i) => (
          <div className="dgallery__thumb" key={i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={p.gallery?.[i + 1] || ""} loading="lazy" />
            {i === thumbs.length - 1 && extra > 0 && (
              <span className="dgallery__more">
                <Icon name="image" size={18} /> +{extra} photos
              </span>
            )}
          </div>
        ))}
      </div>
    </Reveal>
  );
}

/* ---- FAQ accordion ---- */
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`faq ${open ? "open" : ""}`}>
      <button className="faq__q" onClick={onToggle}>
        <span>{q}</span>
        <Icon name={open ? "chevU" : "chevD"} size={18} />
      </button>
      <div className="faq__a">
        <p>{a}</p>
      </div>
    </div>
  );
}

/* ---- PROPERTY DETAIL (light, user-friendly) ---- */
export function PropertyDetail({
  property,
  tenant,
  onBack,
  onRequestDoc,
}: {
  property: Property;
  tenant: Tenant;
  onBack: () => void;
  onRequestDoc: (doc: PropertyDoc, property: Property) => void;
}) {
  const p = property;
  const program = p.program ? PROGRAMS[p.program] : null;
  const statusLabel = statusLabelOf(p.status);
  const [calc, setCalc] = useState(false);
  const [faq, setFaq] = useState(0);

  // payment estimate: 20% apport, 15 ans, 7%
  const r = 0.07 / 12,
    n = 180,
    principal = p.price * 0.8;
  const monthly = Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
  const fmt = (v: number) => v.toLocaleString("fr-FR");

  const hasGarage = p.features.some((f) => /garage|parking|stationnement/i.test(f));
  const hasPool = p.features.some((f) => /piscine/i.test(f));
  const specs: { ic: string; k: string; v: string | number }[] = [];
  if (p.rooms > 0) specs.push({ ic: "bed", k: "Chambres", v: p.rooms });
  if (p.baths > 0) specs.push({ ic: "bath", k: "Salles d'eau", v: p.baths });
  specs.push({ ic: "maximize", k: "Surface", v: p.area + " m²" });
  if (hasGarage) specs.push({ ic: "car", k: "Stationnement", v: "Inclus" });
  if (hasPool) specs.push({ ic: "waves", k: "Piscine", v: "Commune" });
  specs.push({ ic: "calendar", k: "Livraison", v: program ? program.livraison : "Disponible" });

  const FAQS = [
    {
      q: "Comment financer ce bien ?",
      a: `Structure B SA et ${tenant.short} vous orientent vers nos banques partenaires. Le simulateur ci-contre donne une mensualité indicative sur 15 ans avec 20 % d'apport.`,
    },
    {
      q: "Le titre foncier est-il sécurisé ?",
      a: "Oui. Chaque bien dispose d'un titre foncier individuel vérifié. Les documents officiels sont remis lors de la signature chez le notaire.",
    },
    {
      q: "Puis-je visiter avant d'acheter ?",
      a: "Bien sûr. Réservez une visite sur place ou en visio depuis l'encart ci-contre — un conseiller vous répond sous 24 h.",
    },
    {
      q: "Quelle plus-value puis-je espérer ?",
      a: "Nos programmes visent une plus-value moyenne de +30 % à la livraison, selon l'emplacement et le stade de commercialisation.",
    },
  ];

  return (
    <div className="detail">
      <DetailHeader onBack={onBack} />

      <section className="dwrap">
        <div className="wrap">
          <Reveal className="dtop">
            <div className="dcrumb" onClick={onBack}>
              <span>{tenant.short}</span>
              <Icon name="chevR" size={13} /> <span>{p.type}</span>
              <Icon name="chevR" size={13} /> <b>{p.no}</b>
            </div>
            <div className="dtop__row">
              <div>
                <h1 className="dtitle">{p.title}</h1>
                <div className="dloc">
                  <Icon name="pin" size={16} /> {p.loc}
                </div>
              </div>
              <span className={`dstatus ${p.status}`}>{statusLabel}</span>
            </div>
          </Reveal>

          <DetailGallery p={p} />

          <div className="dbody">
            <div className="dbody__main">
              <Reveal as="div" className="overview">
                {specs.map((s, i) => (
                  <div className="overview__item" key={i}>
                    <Icon name={s.ic} className="ic" />
                    <div>
                      <div className="v">{s.v}</div>
                      <div className="k">{s.k}</div>
                    </div>
                  </div>
                ))}
              </Reveal>

              <Reveal style={{ marginTop: 48 }}>
                <h3>Description</h3>
              </Reveal>
              <Reveal delay={80}>
                <p>{p.desc}</p>
              </Reveal>
              <Reveal delay={140}>
                <p>{p.desc2}</p>
              </Reveal>

              <Reveal style={{ marginTop: 44 }}>
                <h3>Caractéristiques</h3>
              </Reveal>
              <Reveal delay={80} className="featurelist">
                {p.features.map((f, i) => (
                  <div key={i}>
                    <Icon name="check" className="ic" /> {f}
                  </div>
                ))}
              </Reveal>

              <Reveal style={{ marginTop: 44 }}>
                <h3>Localisation</h3>
              </Reveal>
              <Reveal delay={80} className="dmap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="pat" src="/assets/pattern-01-30.png" alt="" />
                <div className="map__grid" />
                <div className="map__pin" style={{ left: "50%", top: "50%" }}>
                  <div className="dot" />
                  <div className="lbl">{p.loc.split(",").pop()!.trim()}</div>
                </div>
              </Reveal>

              <Reveal style={{ marginTop: 44 }}>
                <h3>Documents</h3>
              </Reveal>
              <Reveal delay={80} className="docs">
                {p.docs.map((d) => (
                  <button className="doc" key={d.id} onClick={() => onRequestDoc(d, p)}>
                    <Icon name="file" className="ic" />
                    <div>
                      <div className="nm">{d.name}</div>
                      <div className="meta">
                        {d.kind} · {d.size}
                      </div>
                    </div>
                    <Icon name="download" className="ic dl" />
                  </button>
                ))}
              </Reveal>
              <Reveal delay={120}>
                <p className="rgpd">
                  <Icon name="shield" size={14} /> Un formulaire de consentement précède chaque téléchargement (RGPD).
                </p>
              </Reveal>

              <Reveal style={{ marginTop: 44 }}>
                <h3>Questions fréquentes</h3>
              </Reveal>
              <Reveal delay={80} className="faqlist">
                {FAQS.map((f, i) => (
                  <FaqItem key={i} q={f.q} a={f.a} open={faq === i} onToggle={() => setFaq(faq === i ? -1 : i)} />
                ))}
              </Reveal>
            </div>

            <aside className="dside">
              <Reveal className="dcard dcard--price">
                <div className="dcard__eye">Prix de vente</div>
                <div className="price">
                  {p.priceLabel} <small>FCFA</small>
                </div>
                <button className="calcbtn" aria-expanded={calc} onClick={() => setCalc((v) => !v)}>
                  <Icon name="calc" size={16} /> Simuler le financement
                  <Icon name={calc ? "chevU" : "chevD"} size={15} style={{ marginLeft: "auto" }} />
                </button>
                {calc && (
                  <div className="calcout">
                    <div className="calcout__row">
                      <span>Mensualité estimée</span>
                      <b>
                        {fmt(monthly)} <small>FCFA</small>
                      </b>
                    </div>
                    <div className="calcout__meta">Apport 20 % · 15 ans · 7 % / an · à titre indicatif</div>
                  </div>
                )}
              </Reveal>

              <Reveal className="dcard" delay={80}>
                <h4>Envie d&apos;acheter&nbsp;?</h4>
                <div className="buyopts">
                  <a className="buyopt" href={`tel:${tenant.contacts.phone}`}>
                    <Icon name="home" /> <span>Visite sur place</span>
                  </a>
                  <a
                    className="buyopt"
                    href={`https://wa.me/${tenant.contacts.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Icon name="video" /> <span>Visite en visio</span>
                  </a>
                </div>
                <Magnetic strength={0.18} style={{ display: "block" }}>
                  <button className="btn btn--block" onClick={() => onRequestDoc(p.docs[0], p)}>
                    Demander une visite <Icon name="arrowR" />
                  </button>
                </Magnetic>
                <div style={{ height: 10 }} />
                <button className="btn btn--ghost btn--block" onClick={() => onRequestDoc(p.docs[0], p)}>
                  Faire une offre
                </button>
              </Reveal>

              <Reveal className="dcard dcard--agent" delay={140}>
                <div className="dcard__eye">Votre conseiller</div>
                <div className="agentmini">
                  <div className="av">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tenant.photo || tenant.pattern} alt="" />
                  </div>
                  <div>
                    <div className="nm">{tenant.short}</div>
                    <div className="rl">{tenant.type === "agence" ? "Agence partenaire" : "Conseiller agréé"}</div>
                  </div>
                </div>
                <div className="agentbtns">
                  <a className="btn btn--ghost btn--sm" href={`mailto:${tenant.contacts.email}`}>
                    <Icon name="mail" /> Message
                  </a>
                  <a className="btn btn--sm" href={`tel:${tenant.contacts.phone}`}>
                    <Icon name="phone" /> Appeler
                  </a>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
