"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

export function Reveal({
  children,
  delay = 0,
  y = 24,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  decimals = 1,
  prefix = "",
  suffix = "",
  note,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  note?: string;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div
      className={`card card-hover relative overflow-hidden p-5 ${
        accent ? "ring-1 ring-imdb/40" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
          {label}
        </p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-imdb/10 text-imdb">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        <AnimatedNumber
          value={value}
          decimals={decimals}
          prefix={prefix}
          suffix={suffix}
        />
      </p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
      <div className="absolute -right-6 -bottom-6 h-16 w-16 rounded-full bg-imdb/5 blur-xl" />
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <span className="mb-2 inline-block rounded-full border border-imdb/30 bg-imdb/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-imdb">
          {eyebrow}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

export function PageHeader({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-imdb/30 bg-imdb/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-imdb">
          <span className="h-1.5 w-1.5 rounded-full bg-imdb" />
          {badge}
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      </motion.div>
    </section>
  );
}

export function Badge({
  children,
  tone = "imdb",
}: {
  children: React.ReactNode;
  tone?: "imdb" | "muted" | "green" | "red";
}) {
  const tones: Record<string, string> = {
    imdb: "border-imdb/30 bg-imdb/10 text-imdb",
    muted: "border-line bg-surface-2 text-muted",
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function ChartFrame({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
