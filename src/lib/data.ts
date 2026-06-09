/* =======================================================================
   data.ts — Jeu de démonstration Structure B
   Programmes réels (Central Baobab, Nayele) + agence lamarana + agent
   ======================================================================= */

/* ---- Photographies réelles (CDN du site structurebsa.com) ---- */
const wx = (id: string, w = 1400, h = 1000) =>
  `https://static.wixstatic.com/media/${id}/v1/fill/w_${w},h_${h},al_c,q_90,enc_auto/${id}`;

const PH = {
  baobabFacade: "752f4a_02d1b4437c994c1ba42a14008ec49cb2~mv2.jpg",
  baobabSalon: "752f4a_ad9e4097b28446c0a7713f92061b8703~mv2.jpeg",
  baobabRuelle: "dea22b_b8a032a7cd9843c6acf3f698244858ce~mv2.jpg",
  baobabJardin: "752f4a_919687fa75c146408a4d413e83e09eeb~mv2.jpg",
  baobabAerial: "752f4a_030565ea5797400494e4dd119c5827e1f000.jpg",
  heroWide: "dea22b_0d23d9d671cf4900888236d6f6bec935f000.jpg",
  team: "752f4a_02cdc9bd797b4268b1efe554d2764fa9~mv2.jpg",
  nayele: "752f4a_26186fdd54f748498eccbf8950a42140~mv2.jpg",
};

export const IMG = {
  hero: wx(PH.heroWide, 1920, 1280),
  baobabFacade: wx(PH.baobabFacade, 1400, 1050),
  baobabSalon: wx(PH.baobabSalon, 1400, 1050),
  baobabRuelle: wx(PH.baobabRuelle, 1400, 1050),
  baobabJardin: wx(PH.baobabJardin, 1400, 1050),
  baobabAerial: wx(PH.baobabAerial, 1400, 1050),
  team: wx(PH.team, 1200, 1500),
  nayele: wx(PH.nayele, 1200, 1500),
};

// ---- Types ------------------------------------------------------------
export type PropertyStatus = "dispo" | "reserve" | "vendu";

export interface Contacts {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
}

export interface Tenant {
  slug: string;
  type: "agence" | "agent";
  name: string;
  short: string;
  role: string;
  tagline: string;
  about: string;
  about2: string;
  verified: boolean;
  isPublic: boolean;
  pattern: string;
  photo: string;
  heroPhoto: string;
  contacts: Contacts;
  stats: { biens: number; programmes: number; scans: number; leads: number };
  propertyIds: string[];
}

export interface Program {
  id: string;
  no: string;
  name: string;
  loc: string;
  tag: string;
  pattern: string;
  cover: string;
  photos: string[];
  desc: string;
  lots: number;
  livraison: string;
}

export interface PropertyDoc {
  id: string;
  name: string;
  kind: string;
  size: string;
}

export interface Property {
  id: string;
  program: string | null;
  no: string;
  title: string;
  type: string;
  status: PropertyStatus;
  price: number;
  priceLabel: string;
  area: number;
  rooms: number;
  baths: number;
  loc: string;
  lat: number;
  lng: number;
  desc: string;
  desc2: string;
  features: string[];
  pattern: string;
  cover: string;
  photos: string[];
  gallery: string[];
  docs: PropertyDoc[];
}

// ---- Tenants (agence + agent) -----------------------------------------
export const TENANTS: Record<string, Tenant> = {
  lamarana: {
    slug: "lamarana",
    type: "agence",
    name: "Agence La Marana",
    short: "La Marana",
    role: "Agence partenaire · Dakar",
    tagline: "Votre plan A, sur la Petite Côte.",
    about:
      "La Marana accompagne investisseurs et familles dans l'acquisition de résidences haut de gamme entre Dakar et Saly. Transparence à chaque étape, de l'acquisition à la gestion locative.",
    about2:
      "Partenaire certifié Structure B SA depuis 2021, l'agence a accompagné plus de 80 acquéreurs et affiche une plus-value moyenne livrée de +30 %.",
    verified: true,
    isPublic: true,
    pattern: "/assets/pattern-01-30.png",
    photo: IMG.team,
    heroPhoto: IMG.hero,
    contacts: {
      phone: "+221 33 800 12 12",
      whatsapp: "+221 77 645 00 00",
      email: "contact@lamarana.sn",
      address: "Almadies, Route de Ngor, Dakar",
    },
    stats: { biens: 12, programmes: 4, scans: 3120, leads: 86 },
    propertyIds: ["baobab-villa-a", "baobab-villa-b", "nayele-r2", "nayele-r3", "teranga-terrain", "mamelles-appt"],
  },
  abdoulaye: {
    slug: "abdoulaye-diallo",
    type: "agent",
    name: "Abdoulaye Diallo",
    short: "A. Diallo",
    role: "Conseiller en investissement",
    tagline: "Un seul plan : le vôtre.",
    about:
      "Conseiller immobilier indépendant rattaché à Structure B SA, Abdoulaye Diallo vous guide dans le choix d'un patrimoine durable et rentable, avec un suivi personnalisé du premier rendez-vous à la remise des clés.",
    about2:
      "Spécialiste de la Petite Côte, il sélectionne pour vous les lots offrant le meilleur potentiel de plus-value.",
    verified: true,
    isPublic: true,
    pattern: "/assets/pattern-02-30.png",
    photo: IMG.baobabRuelle,
    heroPhoto: IMG.baobabFacade,
    contacts: {
      phone: "+221 77 123 45 67",
      whatsapp: "+221 77 123 45 67",
      email: "a.diallo@structure-b.sn",
      address: "Plateau, Dakar",
    },
    stats: { biens: 5, programmes: 2, scans: 1480, leads: 34 },
    propertyIds: ["nayele-r2", "baobab-villa-a", "mamelles-appt"],
  },
};

// ---- Programmes --------------------------------------------------------
export const PROGRAMS: Record<string, Program> = {
  baobab: {
    id: "baobab",
    no: "01",
    name: "Central Baobab",
    loc: "Keur Ndiaye Lo",
    tag: "Programme phare",
    pattern: "/assets/pattern-01-30.png",
    cover: IMG.baobabFacade,
    photos: [IMG.baobabFacade, IMG.baobabSalon, IMG.baobabJardin, IMG.baobabRuelle],
    desc: "Cité résidentielle de 33 villas F4 et F5 à 25 minutes de Dakar, à la sortie 10 de l'autoroute. Espaces communs, jardins et sécurité 24/24 — pensée pour la famille comme pour l'investissement.",
    lots: 33,
    livraison: "T4 2026",
  },
  nayele: {
    id: "nayele",
    no: "02",
    name: "Nayele",
    loc: "Ngaparou, Saly",
    tag: "Résidences",
    pattern: "/assets/pattern-02-30.png",
    cover: IMG.nayele,
    photos: [IMG.nayele, IMG.baobabSalon, IMG.baobabJardin],
    desc: "Résidence fermée à Ngaparou : 15 villas de plain-pied et 8 villas R+1, jardins et espaces verts. Conçue pour habiter ou faire fructifier en location saisonnière.",
    lots: 23,
    livraison: "T2 2027",
  },
  teranga: {
    id: "teranga",
    no: "03",
    name: "Téranga Park",
    loc: "Diamniadio",
    tag: "Terrains viabilisés",
    pattern: "/assets/pattern-01-30.png",
    cover: IMG.baobabAerial,
    photos: [IMG.baobabAerial, IMG.baobabRuelle],
    desc: "Parcelles viabilisées au cœur du nouveau pôle urbain de Diamniadio. Titres fonciers sécurisés, idéal investissement.",
    lots: 60,
    livraison: "Disponible",
  },
};

// ---- Biens -------------------------------------------------------------
export const PROPERTIES: Property[] = [
  {
    id: "baobab-villa-a",
    program: "baobab",
    no: "A-04",
    title: "Villa Baobab — Type A",
    type: "Villa",
    status: "dispo",
    price: 185000000,
    priceLabel: "185 000 000",
    area: 320,
    rooms: 5,
    baths: 4,
    loc: "Central Baobab, Keur Ndiaye Lo",
    lat: 38,
    lng: 54,
    desc: "Villa d'angle de 320 m² sur deux niveaux, ouverte sur le parc central. Suite parentale, quatre chambres, double séjour, cuisine équipée et terrasse panoramique.",
    desc2:
      "Finitions haut de gamme : menuiserie aluminium, sols grès cérame grand format, domotique pré-installée.",
    features: ["Parc central privatif", "5 chambres / 4 SDB", "Cuisine équipée", "Garage 2 voitures", "Panneaux solaires", "Titre foncier"],
    pattern: "/assets/pattern-01-30.png",
    cover: IMG.baobabFacade,
    photos: [IMG.baobabFacade, IMG.baobabSalon, IMG.baobabJardin, IMG.baobabRuelle],
    gallery: ["Façade & parvis", "Séjour double hauteur", "Suite parentale", "Terrasse panoramique"],
    docs: [
      { id: "d1", name: "Plan de masse — Villa Type A", kind: "PDF", size: "2,4 Mo" },
      { id: "d2", name: "Brochure commerciale Central Baobab", kind: "PDF", size: "6,1 Mo" },
      { id: "d3", name: "Fiche technique & prestations", kind: "PDF", size: "1,2 Mo" },
    ],
  },
  {
    id: "baobab-villa-b",
    program: "baobab",
    no: "B-11",
    title: "Villa Baobab — Type B",
    type: "Villa",
    status: "reserve",
    price: 162000000,
    priceLabel: "162 000 000",
    area: 285,
    rooms: 4,
    baths: 3,
    loc: "Central Baobab, Keur Ndiaye Lo",
    lat: 44,
    lng: 60,
    desc: "Villa mitoyenne de 285 m², quatre chambres, jardin privatif arboré et double séjour traversant baigné de lumière.",
    desc2: "Orientation optimisée, ventilation naturelle, et accès direct aux espaces communs du programme.",
    features: ["Jardin privatif", "4 chambres / 3 SDB", "Double séjour", "Buanderie", "Place de parking", "Titre foncier"],
    pattern: "/assets/pattern-02-30.png",
    cover: IMG.baobabJardin,
    photos: [IMG.baobabJardin, IMG.baobabSalon, IMG.baobabFacade, IMG.baobabRuelle],
    gallery: ["Façade jardin", "Séjour traversant", "Chambre principale", "Cuisine"],
    docs: [
      { id: "d4", name: "Plan de masse — Villa Type B", kind: "PDF", size: "2,1 Mo" },
      { id: "d5", name: "Brochure commerciale Central Baobab", kind: "PDF", size: "6,1 Mo" },
    ],
  },
  {
    id: "nayele-r2",
    program: "nayele",
    no: "R2-08",
    title: "Appartement Nayele R+2",
    type: "Appartement",
    status: "dispo",
    price: 68000000,
    priceLabel: "68 000 000",
    area: 96,
    rooms: 3,
    baths: 2,
    loc: "Résidence Nayele, Saly",
    lat: 70,
    lng: 30,
    desc: "Appartement de 96 m² au deuxième étage, deux chambres, séjour ouvert sur balcon avec vue dégagée. Résidence sécurisée avec piscine commune.",
    desc2: "À huit minutes de la plage, idéal résidence secondaire ou investissement locatif saisonnier.",
    features: ["Balcon vue mer partielle", "2 chambres / 2 SDB", "Piscine commune", "Sécurité 24/7", "Parking sous-sol", "Ascenseur"],
    pattern: "/assets/pattern-02-30.png",
    cover: IMG.nayele,
    photos: [IMG.nayele, IMG.baobabSalon, IMG.baobabJardin, IMG.baobabRuelle],
    gallery: ["Résidence & piscine", "Séjour & balcon", "Chambre", "Salle d'eau"],
    docs: [
      { id: "d6", name: "Plan d'appartement R+2", kind: "PDF", size: "1,8 Mo" },
      { id: "d7", name: "Brochure Nayele Saly", kind: "PDF", size: "5,4 Mo" },
      { id: "d8", name: "Grille des prix & lots", kind: "PDF", size: "0,9 Mo" },
    ],
  },
  {
    id: "nayele-r3",
    program: "nayele",
    no: "R3-02",
    title: "Penthouse Nayele R+3",
    type: "Appartement",
    status: "dispo",
    price: 112000000,
    priceLabel: "112 000 000",
    area: 148,
    rooms: 4,
    baths: 3,
    loc: "Résidence Nayele, Saly",
    lat: 66,
    lng: 36,
    desc: "Penthouse de 148 m² avec terrasse de 40 m², trois chambres et vue panoramique sur la Petite Côte.",
    desc2: "Le lot le plus prisé de la résidence : double exposition, prestations exclusives.",
    features: ["Terrasse 40 m²", "3 chambres / 3 SDB", "Vue panoramique", "Piscine commune", "Parking double", "Domotique"],
    pattern: "/assets/pattern-01-30.png",
    cover: IMG.nayele,
    photos: [IMG.nayele, IMG.baobabJardin, IMG.baobabSalon, IMG.baobabRuelle],
    gallery: ["Terrasse panoramique", "Séjour", "Suite parentale", "Vue côte"],
    docs: [
      { id: "d9", name: "Plan Penthouse R+3", kind: "PDF", size: "2,0 Mo" },
      { id: "d10", name: "Brochure Nayele Saly", kind: "PDF", size: "5,4 Mo" },
    ],
  },
  {
    id: "teranga-terrain",
    program: "teranga",
    no: "T-118",
    title: "Parcelle viabilisée 300 m²",
    type: "Terrain",
    status: "dispo",
    price: 21000000,
    priceLabel: "21 000 000",
    area: 300,
    rooms: 0,
    baths: 0,
    loc: "Téranga Park, Diamniadio",
    lat: 50,
    lng: 72,
    desc: "Parcelle de 300 m² entièrement viabilisée (eau, électricité, voirie) au sein du pôle urbain de Diamniadio. Titre foncier individuel.",
    desc2: "Accès direct autoroute, proximité TER et zone économique. Plus-value attendue forte.",
    features: ["300 m² viabilisés", "Titre foncier individuel", "Eau & électricité", "Voirie bitumée", "Proximité TER", "Zone résidentielle"],
    pattern: "/assets/pattern-01-30.png",
    cover: IMG.baobabAerial,
    photos: [IMG.baobabAerial, IMG.baobabRuelle, IMG.baobabFacade],
    gallery: ["Vue du lotissement", "Plan de bornage", "Accès voirie"],
    docs: [
      { id: "d11", name: "Plan de bornage T-118", kind: "PDF", size: "1,1 Mo" },
      { id: "d12", name: "Notice Téranga Park", kind: "PDF", size: "3,2 Mo" },
    ],
  },
  {
    id: "mamelles-appt",
    program: null,
    no: "ML-07",
    title: "Appartement Les Mamelles",
    type: "Appartement",
    status: "vendu",
    price: 95000000,
    priceLabel: "95 000 000",
    area: 110,
    rooms: 3,
    baths: 2,
    loc: "Les Mamelles, Dakar",
    lat: 24,
    lng: 20,
    desc: "Appartement de 110 m² proche du phare des Mamelles, trois chambres, séjour lumineux et balcon. Quartier prisé de la corniche ouest.",
    desc2: "Bien vendu — présenté à titre de référence du portefeuille.",
    features: ["3 chambres / 2 SDB", "Balcon", "Proche corniche", "Parking", "Ascenseur", "Sécurité"],
    pattern: "/assets/pattern-02-30.png",
    cover: IMG.baobabSalon,
    photos: [IMG.baobabSalon, IMG.baobabFacade, IMG.baobabJardin],
    gallery: ["Immeuble", "Séjour", "Chambre"],
    docs: [{ id: "d13", name: "Plan d'appartement", kind: "PDF", size: "1,4 Mo" }],
  },
];

export const propById = (id: string | null) => PROPERTIES.find((p) => p.id === id);

/** Résout un tenant par la valeur publique de son `slug` (sous-domaine). */
export const tenantBySlug = (slug: string): Tenant | undefined =>
  Object.values(TENANTS).find((t) => t.slug === slug);

// ---- Analytics (séries temporelles, 14 jours) -------------------------
const seedSeries = (base: number, spread: number, n = 14) => {
  let v = base;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    v = Math.max(0, v + Math.round(Math.sin(i / 2) * spread + (i % 3 === 0 ? spread : -spread / 2) + (i * spread) / 8));
    out.push(v);
  }
  return out;
};

export const ANALYTICS = {
  days: Array.from({ length: 14 }, (_, i) => {
    const d = new Date(2026, 4, 20 + i); // mai 2026
    return d.getDate() + "/" + (d.getMonth() + 1);
  }),
  scans: seedSeries(140, 26),
  views: seedSeries(220, 40),
  downloads: seedSeries(48, 12),
};

// ---- Leads -------------------------------------------------------------
export interface Lead {
  id: number;
  nom: string;
  email: string;
  phone: string;
  property: string;
  doc: string;
  source: "qr" | "direct";
  consent: boolean;
  date: string;
}

export const LEADS: Lead[] = [
  { id: 1, nom: "Fatou Sarr", email: "f.sarr@email.com", phone: "+221 77 555 11 22", property: "Villa Baobab — Type A", doc: "Brochure commerciale", source: "qr", consent: true, date: "02/06/2026 14:32" },
  { id: 2, nom: "Moussa Ndiaye", email: "moussa.n@email.com", phone: "+221 76 222 33 44", property: "Penthouse Nayele R+3", doc: "Plan Penthouse R+3", source: "direct", consent: true, date: "02/06/2026 11:08" },
  { id: 3, nom: "Aïssatou Ba", email: "aissatou.ba@email.com", phone: "+221 78 909 80 70", property: "Appartement Nayele R+2", doc: "Grille des prix & lots", source: "qr", consent: true, date: "01/06/2026 18:45" },
  { id: 4, nom: "Cheikh Fall", email: "c.fall@email.com", phone: "+221 77 410 50 60", property: "Parcelle viabilisée 300 m²", doc: "Plan de bornage T-118", source: "qr", consent: true, date: "01/06/2026 09:12" },
  { id: 5, nom: "Mariama Diop", email: "m.diop@email.com", phone: "+221 70 330 22 10", property: "Villa Baobab — Type A", doc: "Fiche technique", source: "direct", consent: true, date: "31/05/2026 16:20" },
  { id: 6, nom: "Ibrahima Sow", email: "i.sow@email.com", phone: "+221 77 880 90 00", property: "Appartement Nayele R+2", doc: "Brochure Nayele Saly", source: "qr", consent: true, date: "30/05/2026 13:55" },
  { id: 7, nom: "Ndeye Gueye", email: "ndeye.g@email.com", phone: "+221 76 145 67 89", property: "Villa Baobab — Type B", doc: "Plan de masse Type B", source: "direct", consent: true, date: "29/05/2026 10:30" },
];

// ---- Classement agences (super admin) ---------------------------------
export interface RankingRow {
  slug: string;
  name: string;
  type: "agence" | "agent";
  scans: number;
  views: number;
  leads: number;
  conv: number;
  isPublic: boolean;
}

export const RANKING: RankingRow[] = [
  { slug: "lamarana", name: "Agence La Marana", type: "agence", scans: 3120, views: 8740, leads: 86, conv: 2.8, isPublic: true },
  { slug: "abdoulaye-diallo", name: "Abdoulaye Diallo", type: "agent", scans: 1480, views: 4120, leads: 34, conv: 2.3, isPublic: true },
  { slug: "teranga-immo", name: "Téranga Immobilier", type: "agence", scans: 980, views: 3010, leads: 22, conv: 2.2, isPublic: true },
  { slug: "saly-invest", name: "Saly Invest", type: "agence", scans: 640, views: 1890, leads: 15, conv: 2.4, isPublic: false },
  { slug: "khadim-ndiaye", name: "Khadim Ndiaye", type: "agent", scans: 410, views: 1240, leads: 9, conv: 2.2, isPublic: true },
];

export interface AuditEntry {
  t: string;
  who: string;
  act: string;
  det: string;
}

export const AUDIT: AuditEntry[] = [
  { t: "02/06 14:40", who: "La Marana", act: "Bien modifié", det: "Villa Baobab Type A — prix 178M → 185M" },
  { t: "02/06 09:15", who: "Super Admin", act: "Page activée", det: "abdoulaye-diallo.structure-b.sn" },
  { t: "01/06 17:02", who: "Saly Invest", act: "Page désactivée", det: "saly-invest.structure-b.sn" },
  { t: "31/05 11:20", who: "La Marana", act: "Bien ajouté", det: "Penthouse Nayele R+3 attribué" },
  { t: "30/05 08:48", who: "Super Admin", act: "Agence créée", det: "khadim-ndiaye (agent)" },
];

// ---- Helpers ----------------------------------------------------------
export const fcfa = (n: number) => n.toLocaleString("fr-FR") + " FCFA";
export const compact = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(".", ",") + "K" : "" + n;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const RESERVED = ["app", "admin", "www", "api", "mail", "cdn", "static", "blog"];
