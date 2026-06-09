/* Icons — Lucide-style, square caps per charte Structure B */
import type { CSSProperties } from "react";

const PATHS: Record<string, string> = {
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  whatsapp: "M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1",
  mail: "M4 4h16v16H4zM4 6l8 6 8-6",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  arrowUR: "M7 17 17 7M7 7h10v10",
  arrowR: "M5 12h14M13 6l6 6-6 6",
  arrowL: "M19 12H5M11 18l-6-6 6-6",
  chevR: "M9 6l6 6-6 6",
  chevL: "M15 6l-6 6 6 6",
  download: "M12 3v12M7 10l5 5 5-5M5 21h14",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  bed: "M3 7v11M3 12h18v6M21 18v-6a3 3 0 0 0-3-3H9",
  bath: "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0",
  ruler: "M3 21 21 3M3 21H8M3 21V16M7 13l2 2M11 9l2 2M15 5l2 2",
  home: "M3 11l9-8 9 8M5 10v10h14V10",
  building: "M4 21V4h12v17M16 9h4v12M8 8h2M8 12h2M8 16h2",
  users: "M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.87M16 2.13A4 4 0 0 1 16 10",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  scan: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M3 12h18",
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M8 9h2",
  calendar: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  car: "M4 14l2-6h12l2 6M4 14h16v4H4zM7 18v1M17 18v1M7 14h.01M17 14h.01",
  video: "M15 10l6-3v10l-6-3zM3 6h12v12H3z",
  image: "M3 4h18v16H3zM8.5 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4M21 15l-5-5-9 9",
  calc: "M5 2h14v20H5zM8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01",
  chevD: "M6 9l6 6 6-6",
  chevU: "M18 15l-6-6-6 6",
  maximize: "M4 4h6M4 4v6M4 4l7 7M20 20h-6M20 20v-6M20 20l-7-7",
  waves: "M2 6c2 0 2 1.6 4 1.6S8 6 10 6s2 1.6 4 1.6S16 6 18 6s2 1.6 4 1.6M2 12c2 0 2 1.6 4 1.6s2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6M2 18c2 0 2 1.6 4 1.6s2-1.6 4-1.6 2 1.6 4 1.6 2-1.6 4-1.6 2 1.6 4 1.6",
  dash: "M3 3h8v8H3zM13 3h8v5h-8zM13 12h8v9h-8zM3 13h8v8H3z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.81 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 13a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 7 1.65 1.65 0 0 0 4.27 5.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 2.6 1.65 1.65 0 0 0 10 1.09V1a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 2.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21.4 7H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bars: "M3 3v18h18M8 17V9M13 17V5M18 17v-6",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  plus: "M12 5v14M5 12h14",
  ext: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  star: "M12 2l3 6.5 7 .5-5.3 4.6 1.7 6.9L12 17l-6.1 3.5 1.7-6.9L2 9l7-.5z",
  shield: "M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z",
  trend: "M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6",
  menu: "M3 6h18M3 12h18M3 18h18",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z",
  layers: "M12 2 2 7l10 5 10-5zM2 12l10 5 10-5M2 17l10 5 10-5",
  refresh: "M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  edit: "M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z",
  filter: "M3 4h18l-7 8v6l-4 2v-8z",
};

export function Icon({
  name,
  className,
  style,
  size,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
  size?: number;
}) {
  const d = PATHS[name];
  const s = size ? { width: size, height: size } : null;
  return (
    <svg
      className={"ic " + (className || "")}
      style={{ ...style, ...s }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      width="1em"
      height="1em"
      aria-hidden="true"
    >
      {d
        .split("M")
        .filter(Boolean)
        .map((seg, i) => (
          <path key={i} d={"M" + seg} />
        ))}
    </svg>
  );
}
