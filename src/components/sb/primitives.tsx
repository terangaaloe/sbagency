"use client";
/* primitives — animations Kora (N&B) + QR charte */
import {
  useState,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type ElementType,
} from "react";

/* ---------------- REVEAL (scroll-in) ---------------------------------- */
export function useInView(opts?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px", ...(opts || {}) },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, seen] as const;
}

interface RevealProps {
  children?: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  id?: string;
}
export function Reveal({ children, delay = 0, as, className = "", style = {}, ...rest }: RevealProps) {
  const [ref, seen] = useInView();
  const Tag = (as || "div") as ElementType;
  return (
    <Tag
      ref={ref}
      data-reveal
      className={(seen ? "in " : "") + className}
      style={{ ["--reveal-delay" as string]: delay + "ms", ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* headline whose lines clip-reveal */
export function RevealLines({
  lines,
  className = "",
  as,
  style = {},
}: {
  lines: ReactNode[];
  className?: string;
  as?: ElementType;
  style?: CSSProperties;
}) {
  const [ref, seen] = useInView();
  const Tag = (as || "h1") as ElementType;
  return (
    <Tag ref={ref} className={(seen ? "in " : "") + className} style={style}>
      {lines.map((ln, i) => (
        <span className="line" key={i}>
          <span style={{ ["--reveal-delay" as string]: i * 90 + "ms" }}>{ln}</span>
        </span>
      ))}
    </Tag>
  );
}

/* ---------------- MAGNETIC ------------------------------------------- */
export function Magnetic({
  children,
  strength = 0.4,
  className = "",
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const enabled = useRef(true);
  useEffect(() => {
    enabled.current =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.matchMedia("(hover: none)").matches;
  }, []);
  const move = (e: React.MouseEvent) => {
    if (!enabled.current || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * strength;
    const y = (e.clientY - r.top - r.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  return (
    <span ref={ref} className={"mag " + className} style={style} onMouseMove={move} onMouseLeave={reset}>
      {children}
    </span>
  );
}

/* ---------------- MARQUEE -------------------------------------------- */
export function Marquee({
  items,
  dur = 32,
  variant = "dark",
  outline = false,
  sep = "✕",
}: {
  items: ReactNode[];
  dur?: number;
  variant?: "dark" | "light";
  outline?: boolean;
  sep?: string;
}) {
  const content = items.map((it, i) => (
    <span className="marquee__item" key={i}>
      {it}
      <span className="star">{sep}</span>
    </span>
  ));
  return (
    <div className={`marquee marquee--${variant} ${outline ? "marquee--outline" : ""}`}>
      <div className="marquee__track" style={{ ["--mq-dur" as string]: dur + "s" }}>
        {content}
        {content}
      </div>
    </div>
  );
}

/* ---------------- PARALLAX ------------------------------------------- */
export function useParallax<T extends HTMLElement>(speed = 0.15) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf: number | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        raf = null;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${(-center * speed).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);
  return ref;
}

/* ---------------- COUNT UP ------------------------------------------- */
export function CountUp({
  to,
  dur = 1400,
  suffix = "",
  prefix = "",
  format = false,
}: {
  to: number;
  dur?: number;
  suffix?: string;
  prefix?: string;
  format?: boolean;
}) {
  const [ref, seen] = useInView();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let start: number | null = null;
    let id = 0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, to]);
  const shown = format ? val.toLocaleString("fr-FR") : val;
  return (
    <span ref={ref as React.Ref<HTMLSpanElement>}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* ---------------- QR (stylisé charte, déterministe) ------------------- */
function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function QR({ value, size = 200, mark = true }: { value: string; size?: number; mark?: boolean }) {
  const N = 25,
    cell = size / N;
  const rng = (() => {
    let s = hashStr(value || "structure-b");
    return () => (s = Math.imul(s ^ (s >>> 15), 2246822507) >>> 0) / 4294967296;
  })();
  const cells: ReactNode[] = [];
  const isFinder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return inBox(0, 0) || inBox(N - 7, 0) || inBox(0, N - 7);
  };
  const isQuiet = (x: number, y: number) => x < 1 || y < 1 || x >= N - 1 || y >= N - 1;
  const centerBlock = (x: number, y: number) => mark && x >= 10 && x < 15 && y >= 10 && y < 15;
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (isQuiet(x, y) || isFinder(x, y) || centerBlock(x, y)) continue;
      if (rng() > 0.52)
        cells.push(
          <rect key={x + "_" + y} className="q" x={x * cell} y={y * cell} width={cell * 0.92} height={cell * 0.92} />,
        );
    }
  const finder = (ox: number, oy: number) => (
    <g key={ox + "f" + oy}>
      <rect x={ox * cell} y={oy * cell} width={cell * 7} height={cell * 7} fill="#000" />
      <rect x={(ox + 1) * cell} y={(oy + 1) * cell} width={cell * 5} height={cell * 5} fill="#fff" />
      <rect x={(ox + 2) * cell} y={(oy + 2) * cell} width={cell * 3} height={cell * 3} fill="#000" />
    </g>
  );
  return (
    <svg className="qr" viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <rect x="0" y="0" width={size} height={size} fill="#fff" />
      {cells}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
      {mark && (
        <g>
          <rect x={10 * cell} y={10 * cell} width={cell * 5} height={cell * 5} fill="#fff" />
          <rect
            x={10.4 * cell}
            y={10.4 * cell}
            width={cell * 4.2}
            height={cell * 4.2}
            fill="none"
            stroke="#000"
            strokeWidth={cell * 0.5}
          />
        </g>
      )}
    </svg>
  );
}
