import { Award, Clock, TrendingDown, TrendingUp, Users } from "lucide-react";
import { DecadeTrend, SimpleBarChart } from "@/components/charts";
import { ChartFrame, PageHeader, Panel, Reveal, SectionHeading } from "@/components/ui";
import meta from "@/data/meta.json";
import moviesData from "@/data/movies.json";

type Movie = {
  title: string;
  year: number;
  imdb_rating: number;
  meta_score: number | null;
  critic_audience_gap: number | null;
  director: string;
  main_genre: string;
};

const movies = moviesData as unknown as Movie[];

const directors = Object.entries(meta.directors)
  .map(([director, count]) => ({ director, count }))
  .sort((a, b) => b.count - a.count);

const decadeTrend = Object.entries(meta.decade_trend)
  .map(([decade, imdb_rating]) => ({ decade: Number(decade), imdb_rating: Number(imdb_rating) }))
  .sort((a, b) => a.decade - b.decade);

const withGap = movies.filter((m) => m.critic_audience_gap !== null);
const audienceFavourites = [...withGap]
  .sort((a, b) => (b.critic_audience_gap ?? 0) - (a.critic_audience_gap ?? 0))
  .slice(0, 8);
const criticsPicks = [...withGap]
  .sort((a, b) => (a.critic_audience_gap ?? 0) - (b.critic_audience_gap ?? 0))
  .slice(0, 8);

function MovieTable({
  rows,
  accent,
}: {
  rows: Movie[];
  accent: "green" | "red";
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-3 py-2">Film</th>
            <th className="px-3 py-2 text-right">IMDb</th>
            <th className="px-3 py-2 text-right">Meta</th>
            <th className="px-3 py-2 text-right">Gap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.title} className="border-t border-line/60">
              <td className="px-3 py-2 text-white/90">
                {m.title} <span className="text-muted">({m.year})</span>
              </td>
              <td className="px-3 py-2 text-right font-mono text-imdb">
                {m.imdb_rating.toFixed(1)}
              </td>
              <td className="px-3 py-2 text-right font-mono text-muted">
                {m.meta_score ?? "—"}
              </td>
              <td
                className={`px-3 py-2 text-right font-mono ${
                  accent === "green" ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {(m.critic_audience_gap ?? 0) >= 0 ? "+" : ""}
                {(m.critic_audience_gap ?? 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InsightsPage() {
  return (
    <div className="pb-10">
      <PageHeader
        badge="Findings"
        title="Insights from the top 1000"
        description="Patterns that emerge once the numbers are in — the directors and decades that dominate, and the films where audiences and critics disagree the most."
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <ChartFrame title="Most frequent directors" subtitle="Films in the top 1000">
              <SimpleBarChart
                data={directors.slice(0, 10)}
                xKey="director"
                yKey="count"
                vertical
                height={340}
                color="#f5c518"
              />
            </ChartFrame>
          </Reveal>
          <Reveal delay={0.08}>
            <ChartFrame title="Average rating by decade" subtitle="Top-film quality over time">
              <DecadeTrend data={decadeTrend} />
            </ChartFrame>
          </Reveal>
        </div>

        <section>
          <SectionHeading
            eyebrow="Critics vs audiences"
            title="Where do they disagree?"
            description="The gap is Metascore (scaled to 10) minus the IMDb rating. Positive gap means audiences loved it more than critics."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <Panel>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <TrendingUp className="h-4 w-4 text-emerald-400" /> Audience favourites
                </h3>
                <MovieTable rows={audienceFavourites} accent="green" />
              </Panel>
            </Reveal>
            <Reveal delay={0.08}>
              <Panel>
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                  <TrendingDown className="h-4 w-4 text-rose-400" /> Critics&apos; picks
                </h3>
                <MovieTable rows={criticsPicks} accent="red" />
              </Panel>
            </Reveal>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, title: "Alfred Hitchcock leads", text: "The most-represented director in the top 1000, with 14 films." },
            { icon: Clock, title: "Longer films score higher", text: "Runtime correlates positively (r ≈ 0.26) — epics are rewarded." },
            { icon: Award, title: "Prestige ages well", text: "Films from the 1970s–90s show some of the highest average ratings." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.06}>
              <div className="card card-hover h-full p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-imdb/10 text-imdb">
                  <c.icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{c.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
