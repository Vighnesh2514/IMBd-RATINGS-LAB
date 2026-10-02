"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard, Menu, Sparkles, X } from "lucide-react";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/explore", label: "Explore" },
  { href: "/statistics", label: "Statistics" },
  { href: "/correlations", label: "Correlations" },
  { href: "/models", label: "Model & Predict" },
  { href: "/insights", label: "Insights" },
  { href: "/analyst", label: "AI Analyst" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 glass">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-imdb text-black shadow-[0_0_25px_-6px] shadow-imdb/70 transition-transform group-hover:scale-105">
            <Clapperboard className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide text-white">
              IMDb Ratings Lab
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted">
              Statistics &amp; Probability
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-white"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-imdb/15 ring-1 ring-imdb/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={active ? "relative text-imdb" : "relative"}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/figures/fig_06_shap_summary.png"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-imdb px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 md:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            AI Insights
          </a>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-line text-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-line/70 lg:hidden"
          >
            <div className="grid gap-1 px-4 py-3">
              {LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-imdb/15 text-imdb ring-1 ring-imdb/40"
                        : "text-muted hover:bg-surface-2 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
