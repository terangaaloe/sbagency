"use client";
/* bo-charts — graphiques & widgets monochromes pour le back-office */
import { useState } from "react";
import { Icon } from "./icons";
import { CountUp } from "./primitives";

interface Series {
  name: string;
  data: number[];
}

/* ---- Multi-series line chart (grayscale) ---- */
export function LineChart({ series, labels, height = 240 }: { series: Series[]; labels: string[]; height?: number }) {
  const W = 720,
    H = height,
    padL = 8,
    padR = 8,
    padT = 16,
    padB = 26;
  const allMax = Math.max(...series.flatMap((s) => s.data));
  const max = Math.ceil(allMax / 50) * 50;
  const n = labels.length;
  const xOf = (i: number) => padL + (i / (n - 1)) * (W - padL - padR);
  const yOf = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const strokes = [
    { dash: "", w: 2.4, c: "#000" },
    { dash: "6 5", w: 1.8, c: "#808080" },
    { dash: "2 4", w: 1.8, c: "#b3b3b3" },
  ];
  const [hover, setHover] = useState<number | null>(null);
  const gridY = [0, 0.25, 0.5, 0.75, 1];
  return (
    <div className="chartwrap">
      <div className="legend">
        {series.map((s, i) => (
          <span key={i}>
            <i
              style={{
                background: strokes[i].c,
                borderTop: strokes[i].dash ? `2px dashed ${strokes[i].c}` : "none",
                height: strokes[i].dash ? 0 : 3,
              }}
            />
            {s.name}
          </span>
        ))}
      </div>
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((x - padL) / (W - padL - padR)) * (n - 1));
          setHover(Math.max(0, Math.min(n - 1, i)));
        }}
      >
        {gridY.map((g, i) => (
          <line
            key={i}
            className="gridln"
            x1={padL}
            x2={W - padR}
            y1={padT + g * (H - padT - padB)}
            y2={padT + g * (H - padT - padB)}
          />
        ))}
        {series.map((s, si) => {
          const dd = s.data.map((v, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`).join(" ");
          return (
            <path
              key={si}
              d={dd}
              fill="none"
              stroke={strokes[si].c}
              strokeWidth={strokes[si].w}
              strokeDasharray={strokes[si].dash}
              strokeLinecap="round"
            />
          );
        })}
        {hover !== null && (
          <g>
            <line className="axis" x1={xOf(hover)} x2={xOf(hover)} y1={padT} y2={H - padB} />
            {series.map((s, si) => (
              <circle key={si} cx={xOf(hover)} cy={yOf(s.data[hover])} r="3.5" fill="#fff" stroke={strokes[si].c} strokeWidth="2" />
            ))}
          </g>
        )}
        {labels.map(
          (l, i) =>
            (i % 2 === 0 || i === n - 1) && (
              <text key={i} className="lbl" x={xOf(i)} y={H - 8} textAnchor="middle">
                {l}
              </text>
            ),
        )}
      </svg>
      {hover !== null && (
        <div
          style={{ display: "flex", gap: 18, padding: "0 22px", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--sb-gray-600)" }}
        >
          <b style={{ color: "#000" }}>{labels[hover]}</b>
          {series.map((s, i) => (
            <span key={i}>
              {s.name}: {s.data[hover]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Bar chart ---- */
export function BarChart({ data, labels, height = 220 }: { data: number[]; labels: string[]; height?: number }) {
  const W = 720,
    H = height,
    padB = 26,
    padT = 12,
    gap = 10;
  const max = Math.ceil(Math.max(...data) / 50) * 50;
  const bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <div className="chartwrap">
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {[0.5, 1].map((g, i) => (
          <line key={i} className="gridln" x1="0" x2={W} y1={padT + (1 - g) * (H - padT - padB)} y2={padT + (1 - g) * (H - padT - padB)} />
        ))}
        {data.map((v, i) => {
          const h = (v / max) * (H - padT - padB);
          return (
            <rect
              key={i}
              x={i * (bw + gap)}
              y={H - padB - h}
              width={bw}
              height={h}
              fill={i === data.length - 1 ? "#000" : "#1a1a1a"}
              opacity={0.55 + 0.45 * (i / data.length)}
            />
          );
        })}
        {labels.map((l, i) => (
          <text key={i} className="lbl" x={i * (bw + gap) + bw / 2} y={H - 8} textAnchor="middle">
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ---- sparkline ---- */
export function Spark({ data, color = "#000" }: { data: number[]; color?: string }) {
  const W = 84,
    H = 34,
    max = Math.max(...data),
    min = Math.min(...data);
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => H - 2 - ((v - min) / (max - min || 1)) * (H - 4);
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg className="kpi__spark" viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
      <path d={`${d} L${W},${H} L0,${H} Z`} fill={color} opacity="0.06" />
    </svg>
  );
}

/* ---- KPI ---- */
export function KPI({
  label,
  icon,
  value,
  delta,
  deltaDir,
  spark,
  format,
  suffix,
}: {
  label: string;
  icon: string;
  value: number;
  delta?: string;
  deltaDir?: string;
  spark?: number[];
  format?: boolean;
  suffix?: string;
}) {
  return (
    <div className="kpi">
      <div className="kpi__lbl">
        <Icon name={icon} className="ic" /> {label}
      </div>
      <div className="kpi__num">
        <CountUp to={value} format={format} suffix={suffix || ""} />
      </div>
      {delta && <div className={"kpi__delta " + (deltaDir || "")}>{delta}</div>}
      {spark && <Spark data={spark} />}
    </div>
  );
}
