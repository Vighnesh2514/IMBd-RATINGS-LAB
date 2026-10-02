"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import meta from "@/data/meta.json";
import { ContributionBars } from "@/components/charts";
import { explain, MODEL_INFO, type MovieInput } from "@/lib/model";
import { Badge } from "@/components/ui";

const GENRES = (meta.genres as string[]).filter((g) => g !== "All");

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-mono font-semibold text-imdb">
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-imdb [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-imdb [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,197,24,0.7)]"
      />
    </div>
  );
}

export function Predictor() {
  const [input, setInput] = useState<MovieInput>({
    meta_score: 82,
    votes: 750000,
    runtime_min: 130,
    year: 2005,
    num_genres: 2,
    gross_millions: 150,
    main_genre: "Drama",
  });
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const result = useMemo(() => explain(input), [input]);

  const askAI = async () => {
    setLoading(true);
    setExplanation(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "explain-prediction",
          prediction: result.prediction,
          movie: input,
          contributions: result.contributions.map((c) => ({
            name: c.label,
            value: c.contribution,
          })),
        }),
      });
      const data = await res.json();
      setExplanation(data.answer ?? data.error ?? "No response");
    } catch {
      setExplanation("Could not reach the AI service.");
    } finally {
      setLoading(false);
    }
  };

  const ratingColor =
    result.prediction >= 8.5
      ? "text-emerald-400"
      : result.prediction >= 8
        ? "text-imdb"
        : "text-orange-400";

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card p-6 lg:col-span-3">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Wand2 className="h-4 w-4 text-imdb" /> Design a hypothetical movie
          </h3>
          <Badge tone="muted">{MODEL_INFO.name}</Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Slider
            label="Metascore (critics)"
            value={input.meta_score}
            min={28}
            max={100}
            step={1}
            onChange={(v) => setInput({ ...input, meta_score: v })}
          />
          <Slider
            label="Runtime"
            value={input.runtime_min}
            min={60}
            max={240}
            step={1}
            suffix=" min"
            onChange={(v) => setInput({ ...input, runtime_min: v })}
          />
          <Slider
            label="Number of votes"
            value={input.votes}
            min={1000}
            max={2500000}
            step={1000}
            onChange={(v) => setInput({ ...input, votes: v })}
          />
          <Slider
            label="Release year"
            value={input.year}
            min={1920}
            max={2020}
            step={1}
            onChange={(v) => setInput({ ...input, year: v })}
          />
          <Slider
            label="Number of genres"
            value={input.num_genres}
            min={1}
            max={3}
            step={1}
            onChange={(v) => setInput({ ...input, num_genres: v })}
          />
          <Slider
            label="Box office gross"
            value={input.gross_millions}
            min={0}
            max={1000}
            step={5}
            suffix=" M"
            onChange={(v) => setInput({ ...input, gross_millions: v })}
          />
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs text-muted">Main genre</p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setInput({ ...input, main_genre: g })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    input.main_genre === g
                      ? "border-imdb/50 bg-imdb/15 text-imdb"
                      : "border-line text-muted hover:border-imdb/30 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-2">
        <motion.div
          key={result.prediction.toFixed(2)}
          initial={{ scale: 0.96, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="card relative overflow-hidden p-6 text-center ring-1 ring-imdb/30"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            Predicted IMDb rating
          </p>
          <p className={`mt-2 text-6xl font-black tracking-tight ${ratingColor}`}>
            {result.prediction.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Dataset baseline: {result.baseline.toFixed(2)} · ensemble of{" "}
            {MODEL_INFO.nEstimators} trees
          </p>
          <div className="glow-imdb pointer-events-none absolute inset-x-0 -bottom-10 h-24" />
        </motion.div>

        <div className="card p-5">
          <h4 className="mb-3 text-sm font-semibold text-white">
            Why? Feature contributions
          </h4>
          <ContributionBars
            data={result.contributions.map((c) => ({
              label: c.label,
              contribution: Number(c.contribution.toFixed(3)),
            }))}
          />
          <p className="mt-2 text-[11px] text-muted">
            Green pushes the rating up, red pulls it down (measured against the
            dataset average).
          </p>
        </div>

        <button
          onClick={askAI}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-imdb px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Asking the AI analyst..." : "Explain this prediction with AI"}
        </button>

        {explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-imdb/30 p-5 text-sm leading-relaxed text-white/90"
          >
            {explanation}
          </motion.div>
        )}
      </div>
    </div>
  );
}
