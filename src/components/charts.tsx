"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

export const IMDB = "#f5c518";
const GRID = "#26262f";
const AXIS = "#9aa0ab";

const GENRE_COLORS = [
  "#f5c518", "#4cc9f0", "#f72585", "#43aa8b", "#f8961e",
  "#9b5de5", "#00bbf9", "#ef476f", "#06d6a0", "#ffd166",
];

export function ChartTooltip() {
  return (
    <Tooltip
      cursor={{ fill: "rgba(245,197,24,0.06)" }}
      contentStyle={{
        background: "#12121a",
        border: "1px solid #2a2a35",
        borderRadius: 12,
        fontSize: 12,
        color: "#ececf1",
      }}
      labelStyle={{ color: IMDB, fontWeight: 600 }}
    />
  );
}

export function RatingHistogram({
  data,
  color = IMDB,
}: {
  data: { x: number; count: number; label: string }[];
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" stroke={AXIS} tickLine={false} interval={2} />
        <YAxis stroke={AXIS} tickLine={false} axisLine={false} />
        <ChartTooltip />
        <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NormalFitChart({
  data,
  mu,
  sigma,
}: {
  data: { x: number; count: number; label: string }[];
  mu: number;
  sigma: number;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const width = 0.1;
  const curve = data.map((d) => ({
    ...d,
    density:
      (1 / (sigma * Math.sqrt(2 * Math.PI))) *
      Math.exp(-0.5 * ((d.x - mu) / sigma) ** 2),
    scaled:
      total *
      width *
      ((1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * ((d.x - mu) / sigma) ** 2)),
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={curve} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" stroke={AXIS} tickLine={false} interval={2} />
        <YAxis stroke={AXIS} tickLine={false} axisLine={false} />
        <ChartTooltip />
        <Bar dataKey="count" fill={IMDB} opacity={0.85} radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="scaled" stroke="#f72585" strokeWidth={2.5} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function QQPlot({ points }: { points: { theoretical: number; sample: number }[] }) {
  const t0 = points[0]?.theoretical ?? 0;
  const t1 = points[points.length - 1]?.theoretical ?? 1;
  const s0 = points[0]?.sample ?? 0;
  const s1 = points[points.length - 1]?.sample ?? 1;
  const slope = (s1 - s0) / (t1 - t0);
  const ref = [
    { theoretical: t0, line: s0 },
    { theoretical: t1, line: s0 + slope * (t1 - t0) },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis
          type="number"
          dataKey="theoretical"
          name="Theoretical quantile"
          stroke={AXIS}
          tickLine={false}
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          type="number"
          dataKey="sample"
          name="Sample rating"
          stroke={AXIS}
          tickLine={false}
          axisLine={false}
          domain={["dataMin", "dataMax"]}
        />
        <ChartTooltip />
        <Scatter data={points} fill={IMDB} fillOpacity={0.55} />
        <Scatter data={ref} dataKey="line" fill="#f72585" line shape="cross" legendType="none" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ScatterRating({
  data,
}: {
  data: { log_votes: number; imdb_rating: number; main_genre: string; title: string; votes: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis
          type="number"
          dataKey="log_votes"
          name="log10(votes)"
          stroke={AXIS}
          tickLine={false}
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          type="number"
          dataKey="imdb_rating"
          name="IMDb rating"
          stroke={AXIS}
          tickLine={false}
          axisLine={false}
          domain={["dataMin", "dataMax"]}
        />
        <ZAxis range={[45, 45]} />
        <ChartTooltip />
        <Scatter data={data} fill={IMDB} fillOpacity={0.5} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function GenreRatingScatter({
  data,
}: {
  data: { log_votes: number; imdb_rating: number; main_genre: string }[];
}) {
  const genres = Array.from(new Set(data.map((d) => d.main_genre))).slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis type="number" dataKey="log_votes" name="log10(votes)" stroke={AXIS} tickLine={false} />
        <YAxis
          type="number"
          dataKey="imdb_rating"
          name="rating"
          stroke={AXIS}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip />
        {genres.map((g, i) => (
          <Scatter
            key={g}
            name={g}
            data={data.filter((d) => d.main_genre === g)}
            fill={GENRE_COLORS[i % GENRE_COLORS.length]}
            fillOpacity={0.65}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function SimpleBarChart({
  data,
  xKey,
  yKey,
  color = IMDB,
  vertical = false,
  height = 300,
  domain,
}: {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string | ((d: any) => string);
  vertical?: boolean;
  height?: number;
  domain?: [number, number];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={vertical ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 16, bottom: 4, left: vertical ? 90 : -16 }}
      >
        <CartesianGrid stroke={GRID} vertical={vertical} horizontal={!vertical} />
        {vertical ? (
          <>
            <XAxis type="number" stroke={AXIS} tickLine={false} domain={domain} />
            <YAxis
              type="category"
              dataKey={xKey}
              stroke={AXIS}
              tickLine={false}
              axisLine={false}
              width={90}
            />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} stroke={AXIS} tickLine={false} axisLine={false} />
            <YAxis stroke={AXIS} tickLine={false} axisLine={false} domain={domain} />
          </>
        )}
        <ChartTooltip />
        <Bar dataKey={yKey} radius={vertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={typeof color === "function" ? (color as any)(d) : color}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CorrelationBars({
  data,
}: {
  data: { variable: string; pearson_r: number }[];
}) {
  const sorted = [...data].sort((a, b) => b.pearson_r - a.pearson_r);
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 4, left: 100 }}
      >
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS} tickLine={false} domain={[-0.3, 0.6]} />
        <YAxis
          type="category"
          dataKey="variable"
          stroke={AXIS}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <ChartTooltip />
        <ReferenceLine x={0} stroke="#4b4b57" />
        <Bar dataKey="pearson_r" radius={[0, 4, 4, 0]}>
          {sorted.map((d, i) => (
            <Cell key={i} fill={d.pearson_r >= 0 ? IMDB : "#f72585"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CorrelationHeatmap({
  labels,
  matrix,
}: {
  labels: string[];
  matrix: number[][];
}) {
  const color = (v: number) => {
    const t = (v + 1) / 2;
    const r = Math.round(247 * t + 30 * (1 - t));
    const g = Math.round(37 * t + 70 * (1 - t));
    const b = Math.round(133 * t + 90 * (1 - t));
    return `rgb(${r},${g},${b})`;
  };
  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `110px repeat(${labels.length}, minmax(52px, 1fr))` }}
      >
        <div />
        {labels.map((l) => (
          <div key={l} className="truncate text-center text-[10px] text-muted" title={l}>
            {l}
          </div>
        ))}
        {matrix.map((row, i) => (
          <div key={i} className="contents">
            <div className="pr-2 text-right text-[11px] text-muted">{labels[i]}</div>
            {row.map((v, j) => (
              <div
                key={j}
                className="grid h-12 place-items-center rounded text-[10px] font-medium text-white/90"
                style={{ background: color(v) }}
                title={`${labels[i]} vs ${labels[j]}: ${v.toFixed(2)}`}
              >
                {v.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PredVsActual({
  points,
}: {
  points: { actual: number; predicted: number }[];
}) {
  const min = Math.min(...points.map((p) => Math.min(p.actual, p.predicted)));
  const max = Math.max(...points.map((p) => Math.max(p.actual, p.predicted)));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis type="number" dataKey="actual" name="Actual" stroke={AXIS} tickLine={false} domain={[min, max]} />
        <YAxis type="number" dataKey="predicted" name="Predicted" stroke={AXIS} tickLine={false} axisLine={false} domain={[min, max]} />
        <ChartTooltip />
        <Scatter data={points} fill="#06d6a0" fillOpacity={0.7} />
        <Scatter
          data={[{ actual: min, predicted: min }, { actual: max, predicted: max }]}
          dataKey="predicted"
          fill="#f72585"
          line
          shape="cross"
          legendType="none"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ResidualsPlot({
  points,
}: {
  points: { fitted: number; residual: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
        <CartesianGrid stroke={GRID} />
        <XAxis type="number" dataKey="fitted" name="Fitted" stroke={AXIS} tickLine={false} />
        <YAxis type="number" dataKey="residual" name="Residual" stroke={AXIS} tickLine={false} axisLine={false} />
        <ChartTooltip />
        <ReferenceLine y={0} stroke="#f72585" />
        <Scatter data={points} fill="#4cc9f0" fillOpacity={0.55} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ContributionBars({
  data,
}: {
  data: { label: string; contribution: number }[];
}) {
  const sorted = [...data].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 42)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 8, right: 24, bottom: 4, left: 130 }}
      >
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" stroke={AXIS} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          stroke={AXIS}
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <ChartTooltip />
        <ReferenceLine x={0} stroke="#4b4b57" />
        <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
          {sorted.map((d, i) => (
            <Cell key={i} fill={d.contribution >= 0 ? "#06d6a0" : "#f72585"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DecadeTrend({
  data,
}: {
  data: { decade: number; imdb_rating: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -16 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="decade" stroke={AXIS} tickLine={false} />
        <YAxis stroke={AXIS} tickLine={false} axisLine={false} domain={["dataMin - 0.1", "dataMax + 0.1"]} />
        <ChartTooltip />
        <Line type="monotone" dataKey="imdb_rating" stroke={IMDB} strokeWidth={3} dot={{ r: 4, fill: IMDB }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
