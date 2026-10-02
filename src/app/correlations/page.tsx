import { PageHeader, Panel, ChartFrame } from "@/components/ui";
import { CorrelationBars, CorrelationHeatmap } from "@/components/charts";
import correlationTable from "@/data/correlation_table.json";
import moviesData from "@/data/movies.json";
import { correlationMatrix } from "@/lib/stats";

type Row = {
  variable: string;
  pearson_r: number;
  pearson_p: number;
  spearman_rho: number;
  spearman_p: number;
};

type Movie = {
  imdb_rating: number;
  meta_score: number | null;
  runtime_min: number;
  year: number;
  votes: number;
  gross_millions: number | null;
  critic_audience_gap: number | null;
};

const table = correlationTable as unknown as Row[];
const movies = moviesData as unknown as Movie[];

const FEATURES: { name: string; get: (m: Movie) => number | null }[] = [
  { name: "imdb_rating", get: (m) => m.imdb_rating },
  { name: "meta_score", get: (m) => m.meta_score },
  { name: "log_votes", get: (m) => Math.log10(Math.max(m.votes, 1)) },
  { name: "runtime_min", get: (m) => m.runtime_min },
  { name: "year", get: (m) => m.year },
  { name: "gross_millions", get: (m) => m.gross_millions },
  { name: "critic_gap", get: (m) => m.critic_audience_gap },
];

const matrix = correlationMatrix(
  FEATURES.map((f) => ({ name: f.name, values: movies.map(f.get) })),
);

function fmtP(p: number) {
  if (p < 0.001) return "< 0.001";
  return p.toFixed(4);
}

export default function CorrelationsPage() {
  return (
    <div className="pb-10">
      <PageHeader
        badge="Module IX · Correlation"
        title="What moves together?"
        description="Pearson correlation captures linear association; Spearman captures any monotonic association. Both are shown for every variable against the IMDb rating."
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 pt-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartFrame
            title="Pearson correlation with IMDb rating"
            subtitle="Bars to the right are positive, left are negative"
          >
            <CorrelationBars data={table} />
          </ChartFrame>

          <Panel>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Correlation table (with p-values)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2">Variable</th>
                    <th className="px-3 py-2 text-right">Pearson r</th>
                    <th className="px-3 py-2 text-right">p</th>
                    <th className="px-3 py-2 text-right">Spearman ρ</th>
                    <th className="px-3 py-2 text-right">p</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.variable} className="border-t border-line/60">
                      <td className="px-3 py-2 text-white/90">{r.variable}</td>
                      <td className={`px-3 py-2 text-right font-mono ${r.pearson_r >= 0 ? "text-imdb" : "text-rose-400"}`}>
                        {r.pearson_r.toFixed(3)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted">{fmtP(r.pearson_p)}</td>
                      <td className="px-3 py-2 text-right font-mono text-white/80">
                        {r.spearman_rho.toFixed(3)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-muted">{fmtP(r.spearman_p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Popularity (log votes) is the strongest correlate of rating (r ≈ 0.46).
              Release year is weakly negative — newer films in this elite set tend to score
              slightly lower. Correlation is not causation.
            </p>
          </Panel>
        </div>

        <Panel>
          <h3 className="mb-4 text-sm font-semibold text-white">
            Full correlation heatmap
          </h3>
          <CorrelationHeatmap labels={FEATURES.map((f) => f.name)} matrix={matrix} />
          <p className="mt-3 text-xs text-muted">
            Green cells = strong positive, red = strong negative, pale = weak.
          </p>
        </Panel>
      </div>
    </div>
  );
}
