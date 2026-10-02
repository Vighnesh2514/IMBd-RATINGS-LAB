"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, FlaskConical, LineChart as LineIcon, Sigma } from "lucide-react";
import descriptive from "@/data/descriptive.json";
import distribution from "@/data/distribution.json";
import hypothesis from "@/data/hypothesis.json";
import descriptiveTable from "@/data/descriptive_table.json";
import qq from "@/data/qq.json";
import moviesData from "@/data/movies.json";
import { NormalFitChart, QQPlot } from "@/components/charts";
import { Badge, Panel } from "@/components/ui";
import { histogram, tTestTwoSided } from "@/lib/stats";

type Movie = { imdb_rating: number; main_genre: string };
const MOVIES = moviesData as unknown as Movie[];
const RATINGS = MOVIES.map((m) => m.imdb_rating);
const GENRES = Array.from(new Set(MOVIES.map((m) => m.main_genre))).sort();
const HIST = histogram(RATINGS, 18, 7.5, 9.4);

function pFormat(p: number) {
  if (p < 0.001) return "< 0.001";
  return p.toFixed(4);
}

const TABS = [
  { id: "descriptive", label: "Descriptive", icon: Sigma },
  { id: "distribution", label: "Distribution", icon: LineIcon },
  { id: "hypothesis", label: "Hypothesis tests", icon: FlaskConical },
] as const;

type TableRow = Record<string, string | number>;

export function StatsLab() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("descriptive");
  const [groupA, setGroupA] = useState("Drama");
  const [groupB, setGroupB] = useState("Comedy");

  const rows = descriptiveTable as unknown as TableRow[];
  const columns = rows.length ? Object.keys(rows[0]) : [];

  const live = useMemo(() => {
    const a = MOVIES.filter((m) => m.main_genre === groupA).map((m) => m.imdb_rating);
    const b = MOVIES.filter((m) => m.main_genre === groupB).map((m) => m.imdb_rating);
    if (a.length < 2 || b.length < 2) return null;
    return tTestTwoSided(a, b);
  }, [groupA, groupB]);

  const h = hypothesis as {
    one_sample_ttest: Record<string, unknown>;
    two_sample_ttest: Record<string, unknown>;
    anova_genre: { genres: string[]; f: number; p: number };
    chi_square: { chi2: number; dof: number; p: number };
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-imdb/50 bg-imdb/15 text-imdb"
                : "border-line text-muted hover:border-imdb/30 hover:text-white"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {tab === "descriptive" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { l: "Mean rating", v: descriptive.mean_rating.toFixed(3) },
                { l: "Median rating", v: descriptive.median_rating.toFixed(3) },
                { l: "Skewness", v: descriptive.skew_rating.toFixed(3) },
                { l: "Excess kurtosis", v: descriptive.kurtosis_rating.toFixed(3) },
              ].map((k) => (
                <Panel key={k.l}>
                  <p className="text-xs uppercase tracking-[0.15em] text-muted">{k.l}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{k.v}</p>
                </Panel>
              ))}
            </div>
            <Panel>
              <h3 className="mb-4 text-sm font-semibold text-white">
                Summary statistics table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-muted">
                    <tr>
                      {columns.map((c) => (
                        <th key={c} className="whitespace-nowrap px-3 py-2">
                          {c === "Unnamed: 0" ? "variable" : c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t border-line/60">
                        {columns.map((c) => (
                          <td key={c} className="whitespace-nowrap px-3 py-2 text-white/85">
                            {typeof r[c] === "number" ? (r[c] as number).toFixed(3) : r[c]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {tab === "distribution" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Panel>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">Fitted Normal</p>
                <p className="mt-2 text-xl font-bold text-white">
                  μ {distribution.mean}, σ {distribution.std}
                </p>
              </Panel>
              <Panel>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">KS / Shapiro p</p>
                <p className="mt-2 text-xl font-bold text-rose-400">
                  {pFormat(distribution.ks_p)} / {pFormat(distribution.shapiro_p)}
                </p>
              </Panel>
              <Panel>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">P(rating &gt; 8.5)</p>
                <p className="mt-2 text-xl font-bold text-imdb">{distribution.p_rating_gt_8_5}</p>
              </Panel>
              <Panel>
                <p className="text-xs uppercase tracking-[0.15em] text-muted">P(7.8 &lt; r &lt; 8.2)</p>
                <p className="mt-2 text-xl font-bold text-imdb">{distribution.p_rating_7_8_to_8_2}</p>
              </Panel>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Empirical vs fitted Normal
                </h3>
                <NormalFitChart data={HIST} mu={distribution.mean} sigma={distribution.std} />
              </Panel>
              <Panel>
                <h3 className="mb-4 text-sm font-semibold text-white">Q-Q plot</h3>
                <QQPlot points={qq as { theoretical: number; sample: number }[]} />
              </Panel>
            </div>
            <Panel className="border-rose-500/20">
              <p className="flex items-center gap-2 text-sm text-white">
                <Activity className="h-4 w-4 text-rose-400" />
                <span>
                  Both tests reject normality — the ratings are left-skewed because IMDb only
                  lists the highest-rated films. The fitted Normal is a useful approximation, not
                  a perfect model.
                </span>
              </p>
            </Panel>
          </div>
        )}

        {tab === "hypothesis" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "One-sample t-test",
                  sub: "H₀: population mean = 8.0",
                  rows: [
                    ["Sample mean", h.one_sample_ttest.sample_mean],
                    ["t statistic", h.one_sample_ttest.t],
                    ["p-value", `< 0.001`],
                    ["95% CI", (h.one_sample_ttest.ci_95 as number[])?.join(" – ")],
                  ],
                  verdict: "Reject H₀",
                },
                {
                  title: "Two-sample Welch t-test",
                  sub: "Metascore ≥ median vs below",
                  rows: [
                    ["High-critic mean", h.two_sample_ttest.mean_high],
                    ["Low-critic mean", h.two_sample_ttest.mean_low],
                    ["t statistic", h.two_sample_ttest.t],
                    ["p-value", "< 0.001"],
                  ],
                  verdict: "Significant difference",
                },
                {
                  title: "One-way ANOVA",
                  sub: "Rating across genres",
                  rows: [
                    ["Genres", h.anova_genre.genres.join(", ")],
                    ["F statistic", h.anova_genre.f],
                    ["p-value", h.anova_genre.p],
                  ],
                  verdict: h.anova_genre.p < 0.05 ? "Significant" : "Borderline (p ≈ 0.06)",
                },
                {
                  title: "Chi-square test",
                  sub: "Genre vs rating tier",
                  rows: [
                    ["χ²", h.chi_square.chi2],
                    ["dof", h.chi_square.dof],
                    ["p-value", h.chi_square.p],
                  ],
                  verdict: h.chi_square.p < 0.05 ? "Dependent" : "Independent",
                },
              ].map((card) => (
                <Panel key={card.title}>
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                      <p className="text-xs text-muted">{card.sub}</p>
                    </div>
                    <Badge tone={String(card.verdict).includes("Independ") || String(card.verdict).includes("Borderline") ? "muted" : "green"}>
                      {card.verdict as string}
                    </Badge>
                  </div>
                  <dl className="space-y-1.5 text-sm">
                    {card.rows.map(([k, v], i) => (
                      <div key={i} className="flex justify-between gap-4">
                        <dt className="text-muted">{k as string}</dt>
                        <dd className="text-right font-mono text-white/90">
                          {typeof v === "number" ? v.toFixed(4) : (v as string)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Panel>
              ))}
            </div>

            <Panel className="border-imdb/30">
              <h3 className="mb-1 text-sm font-semibold text-white">
                Run your own two-group t-test
              </h3>
              <p className="mb-4 text-xs text-muted">
                Pick two genres and the test recomputes instantly in your browser.
              </p>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <select
                  value={groupA}
                  onChange={(e) => setGroupA(e.target.value)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-white outline-none focus:border-imdb/50"
                >
                  {GENRES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
                <span className="text-muted">vs</span>
                <select
                  value={groupB}
                  onChange={(e) => setGroupB(e.target.value)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-white outline-none focus:border-imdb/50"
                >
                  {GENRES.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </div>
              {live && (
                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted">{groupA} mean (n={live.nA})</p>
                    <p className="text-lg font-bold text-white">{live.meanA.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">{groupB} mean (n={live.nB})</p>
                    <p className="text-lg font-bold text-white">{live.meanB.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">t statistic</p>
                    <p className="text-lg font-bold text-white">{live.t.toFixed(3)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted">p-value</p>
                    <p className={`text-lg font-bold ${live.p < 0.05 ? "text-emerald-400" : "text-muted"}`}>
                      {pFormat(live.p)}
                    </p>
                  </div>
                </div>
              )}
              {live && (
                <p className="mt-3 text-xs text-muted">
                  {live.p < 0.05
                    ? "The difference is statistically significant at the 5% level."
                    : "No statistically significant difference at the 5% level."}
                </p>
              )}
            </Panel>
          </div>
        )}
      </motion.div>
    </div>
  );
}
