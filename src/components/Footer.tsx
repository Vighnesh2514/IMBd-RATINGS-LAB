import Link from "next/link";
import { Clapperboard, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-imdb text-black">
              <Clapperboard className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-white">IMDb Ratings Lab</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            What makes a movie highly rated? A statistical and machine-learning
            study of 1,000 top-rated IMDb films.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Modules covered
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>Module I — Descriptive Statistics</li>
            <li>Module VI — Probability Distributions</li>
            <li>Module VII — Sampling &amp; Hypothesis Testing</li>
            <li>Module IX — Correlation</li>
            <li>Module X — Regression</li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li><Link href="/explore" className="transition hover:text-imdb">Explore the data</Link></li>
            <li><Link href="/statistics" className="transition hover:text-imdb">Statistics lab</Link></li>
            <li><Link href="/models" className="transition hover:text-imdb">Prediction model</Link></li>
            <li><Link href="/analyst" className="transition hover:text-imdb">AI analyst</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6">
          <p>B.Tech Statistics &amp; Probability project · Built with Next.js</p>
          <p className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            Dataset: IMDb Top 1000 (public, CC0)
          </p>
        </div>
      </div>
    </footer>
  );
}
