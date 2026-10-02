"use client";

import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import moviesData from "@/data/movies.json";
import { GenreRatingScatter, RatingHistogram } from "@/components/charts";
import { ChartFrame, Badge } from "@/components/ui";
import { histogram } from "@/lib/stats";

type Movie = {
  title: string;
  year: number;
  imdb_rating: number;
  meta_score: number | null;
  runtime_min: number;
  main_genre: string;
  votes: number;
  gross_millions: number | null;
  director: string;
};

const MOVIES = moviesData as unknown as Movie[];
const GENRES = ["All", ...Array.from(new Set(MOVIES.map((m) => m.main_genre))).sort()];
const YEAR_MIN = Math.min(...MOVIES.map((m) => m.year));
const YEAR_MAX = Math.max(...MOVIES.map((m) => m.year));

export function Explorer() {
  const [genre, setGenre] = useState("All");
  const [from, setFrom] = useState(YEAR_MIN);
  const [to, setTo] = useState(YEAR_MAX);
  const [minRating, setMinRating] = useState(7.6);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      MOVIES.filter(
        (m) =>
          (genre === "All" || m.main_genre === genre) &&
          m.year >= from &&
          m.year <= to &&
          m.imdb_rating >= minRating &&
          (query === "" ||
            m.title.toLowerCase().includes(query.toLowerCase()) ||
            m.director.toLowerCase().includes(query.toLowerCase())),
      ),
    [genre, from, to, minRating, query],
  );

  const scatter = filtered.map((m) => ({
    log_votes: Number(Math.log10(Math.max(m.votes, 1)).toFixed(3)),
    imdb_rating: m.imdb_rating,
    main_genre: m.main_genre,
  }));

  const runtimeHist = useMemo(() => {
    const rt = filtered.map((m) => m.runtime_min);
    if (rt.length === 0) return [];
    return histogram(rt, 20, 60, 240);
  }, [filtered]);

  const decadeMeans = useMemo(() => {
    const groups = new Map<number, number[]>();
    filtered.forEach((m) => {
      const d = Math.floor(m.year / 10) * 10;
      if (!groups.has(d)) groups.set(d, []);
      groups.get(d)!.push(m.imdb_rating);
    });
    return Array.from(groups.entries())
      .map(([decade, arr]) => ({
        decade,
        rating: Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(3)),
      }))
      .sort((a, b) => a.decade - b.decade);
  }, [filtered]);

  const table = [...filtered].sort((a, b) => b.imdb_rating - a.imdb_rating).slice(0, 25);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="h-4 w-4 text-imdb" /> Filters
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Main genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-white outline-none focus:border-imdb/50"
            >
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">
              Year range: <span className="font-mono text-imdb">{from}–{to}</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={from}
                min={YEAR_MIN}
                max={to}
                onChange={(e) => setFrom(Math.min(Number(e.target.value), to))}
                className="w-full rounded-lg border border-line bg-surface px-2 py-2 text-sm text-white outline-none focus:border-imdb/50"
              />
              <input
                type="number"
                value={to}
                min={from}
                max={YEAR_MAX}
                onChange={(e) => setTo(Math.max(Number(e.target.value), from))}
                className="w-full rounded-lg border border-line bg-surface px-2 py-2 text-sm text-white outline-none focus:border-imdb/50"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">
              Minimum rating: <span className="font-mono text-imdb">{minRating.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={7.6}
              max={9.3}
              step={0.1}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="mt-2 w-full accent-imdb"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Search title / director</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Nolan"
                className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-white outline-none placeholder:text-muted focus:border-imdb/50"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge>{filtered.length.toLocaleString()} movies match</Badge>
          <button
            onClick={() => {
              setGenre("All");
              setFrom(YEAR_MIN);
              setTo(YEAR_MAX);
              setMinRating(7.6);
              setQuery("");
            }}
            className="rounded-full border border-line px-3 py-0.5 text-xs text-muted transition hover:border-imdb/40 hover:text-white"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Rating vs popularity" subtitle="Each dot is a film, coloured by genre">
          <GenreRatingScatter data={scatter} />
        </ChartFrame>
        <ChartFrame title="Runtime distribution" subtitle="How long top-rated films run">
          <RatingHistogram data={runtimeHist} color="#4cc9f0" />
        </ChartFrame>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Average rating by decade (filtered)">
          <RatingHistogram data={decadeMeans.map((d) => ({ x: d.decade, count: d.rating, label: String(d.decade) }))} color="#f5c518" />
        </ChartFrame>
        <ChartFrame title="Top matches" subtitle="Sorted by rating (max 25 rows)">
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-2 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Genre</th>
                  <th className="px-3 py-2 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {table.map((m) => (
                  <tr key={m.title} className="border-t border-line/60 hover:bg-surface-2/60">
                    <td className="px-3 py-2 text-white/90">
                      {m.title} <span className="text-muted">({m.year})</span>
                    </td>
                    <td className="px-3 py-2 text-muted">{m.main_genre}</td>
                    <td className="px-3 py-2 text-right font-mono font-semibold text-imdb">
                      {m.imdb_rating.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartFrame>
      </div>
    </div>
  );
}
