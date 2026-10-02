"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  Boxes,
  BrainCircuit,
  Database,
  Flame,
  Gauge,
  Star,
  TrendingUp,
} from "lucide-react";
import meta from "@/data/meta.json";
import descriptive from "@/data/descriptive.json";
import models from "@/data/models.json";
import regression from "@/data/regression.json";
import moviesData from "@/data/movies.json";
import { DecadeTrend, RatingHistogram } from "@/components/charts";
import { Reveal, KpiCard, SectionHeading, Badge, ChartFrame } from "@/components/ui";
import { histogram } from "@/lib/stats";

type Movie = {
  title: string;
  year: number;
  imdb_rating: number;
  main_genre: string;
  votes: number;
  director: string;
};

const movies = moviesData as unknown as Movie[];
const ratings = movies.map((m) => m.imdb_rating);
const hist = histogram(ratings, 18, 7.5, 9.4);
const topMovies = [...movies].sort((a, b) => b.imdb_rating - a.imdb_rating).slice(0, 5);
const bestModel = (models as { model: string; cv_r2: number }[])[0];
const decadeTrend = Object.entries(meta.decade_trend)
  .map(([decade, imdb_rating]) => ({ decade: Number(decade), imdb_rating: Number(imdb_rating) }))
  .sort((a, b) => a.decade - b.decade);

const OBJECTIVES = [
  { icon: BarChart3, text: "Describe the distribution of IMDb ratings and movie characteristics." },
  { icon: Gauge, text: "Fit probability distributions and estimate population quantities." },
  { icon: Flame, text: "Test hypotheses about ratings across critic and genre groups." },
  { icon: TrendingUp, text: "Quantify associations with Pearson and Spearman correlation." },
  { icon: BrainCircuit, text: "Build and evaluate linear and machine-learning prediction models." },
];

const FLOW = [
  { icon: Database, title: "Collect & clean", text: "1,000 movies, parsed and feature-engineered." },
  { icon: BarChart3, title: "Statistics", text: "Descriptive, distributions, hypothesis tests." },
  { icon: TrendingUp, title: "Relationships", text: "Correlation with rating." },
  { icon: Boxes, title: "Model", text: "Regression, boosting, cross-validation." },
  { icon: BrainCircuit, title: "Explain with AI", text: "SHAP and an LLM analyst." },
];

export default function OverviewPage() {
  return (
    <div>
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <Badge>
                <Star className="h-3 w-3" /> B.Tech · Statistics &amp; Probability
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                What makes a movie <span className="text-gradient">highly rated?</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
                A statistical and machine-learning study of{" "}
                <span className="text-white">{meta.n_movies.toLocaleString()} top-rated IMDb films</span> —
                from descriptive statistics and probability to explainable AI that predicts a
                movie&apos;s rating and tells you why.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/models"
                  className="inline-flex items-center gap-2 rounded-xl bg-imdb px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  Try the predictor <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-sm font-semibold text-white transition hover:border-imdb/40 hover:text-imdb"
                >
                  Explore the data
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <div>
                  <p className="text-2xl font-bold text-white">{meta.mean_rating}</p>
                  <p className="text-xs text-muted">mean rating</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-xs text-muted">stat modules</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{bestModel.cv_r2.toFixed(2)}</p>
                  <p className="text-xs text-muted">best CV R²</p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-imdb/5 blur-2xl" />
              <div className="relative space-y-3">
                {topMovies.map((m, i) => (
                  <div
                    key={m.title}
                    className="card card-hover flex items-center gap-4 p-4"
                    style={{ marginLeft: i * 10 }}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-imdb/15 text-lg font-black text-imdb">
                      {m.imdb_rating.toFixed(1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{m.title}</p>
                      <p className="truncate text-xs text-muted">
                        {m.year} · {m.main_genre} · {m.director}
                      </p>
                    </div>
                    <Star className="h-4 w-4 shrink-0 fill-imdb text-imdb" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal><KpiCard label="Movies analysed" value={meta.n_movies} decimals={0} icon={Database} note="IMDb Top 1000" accent /></Reveal>
          <Reveal delay={0.05}><KpiCard label="Mean rating" value={descriptive.mean_rating} decimals={2} icon={Star} note={`SD ${descriptive.std_rating}`} /></Reveal>
          <Reveal delay={0.1}><KpiCard label="Mean runtime" value={meta.mean_runtime} decimals={0} suffix=" min" icon={Gauge} note="per film" /></Reveal>
          <Reveal delay={0.15}><KpiCard label="Hold-out R²" value={regression.holdout.R2} decimals={3} icon={Award} note="linear regression" /></Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeading
          eyebrow="Methodology"
          title="From raw data to explainable prediction"
          description="The complete statistical workflow, implemented in Python and reproduced live in this dashboard."
        />
        <div className="grid gap-4 md:grid-cols-5">
          {FLOW.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <div className="card card-hover h-full p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-imdb/10 text-imdb">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-mono text-muted">0{i + 1}</span>
                </div>
                <p className="text-sm font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <ChartFrame title="Distribution of IMDb ratings" subtitle="18 bins across the 1,000 films">
            <RatingHistogram data={hist} />
          </ChartFrame>
        </Reveal>
        <Reveal delay={0.08}>
          <ChartFrame title="Average rating by decade" subtitle="How top-film quality shifted over time">
            <DecadeTrend data={decadeTrend} />
          </ChartFrame>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <SectionHeading eyebrow="Objectives" title="What this project set out to do" />
            <div className="space-y-3">
              {OBJECTIVES.map((o, i) => (
                <div key={i} className="card flex items-start gap-3 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-imdb/10 text-imdb">
                    <o.icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-white/90">{o.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading eyebrow="At a glance" title="Headline findings" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: "Popularity drives ratings", v: "r = 0.46", d: "log(votes) is the strongest correlate." },
                { k: "Critics agree with fans", v: "p ≈ 0", d: "High-Metascore films rate higher." },
                { k: "Genre barely matters", v: "p = 0.058", d: "ANOVA across genres is borderline." },
                { k: "Boosted model wins", v: bestModel.cv_r2.toFixed(2), d: "Gradient boosting CV R² vs 0.26 linear." },
              ].map((f) => (
                <div key={f.k} className="card p-4">
                  <p className="text-xl font-bold text-imdb">{f.v}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{f.k}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{f.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
