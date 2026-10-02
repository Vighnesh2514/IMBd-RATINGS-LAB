"use client";

import { Award, Crosshair, Layers, Target } from "lucide-react";
import {
  PredVsActual,
  ResidualsPlot,
  SimpleBarChart,
} from "@/components/charts";
import { ChartFrame, KpiCard, PageHeader, Panel, Reveal, SectionHeading } from "@/components/ui";
import { Predictor } from "@/components/Predictor";
import models from "@/data/models.json";
import featureImportance from "@/data/feature_importance.json";
import regression from "@/data/regression.json";
import coefficients from "@/data/regression_coefficients.json";

type ModelRow = { model: string; cv_r2: number; cv_mae: number; cv_rmse: number };
type Reg = typeof regression & {
  holdout_points: { actual: number; predicted: number }[];
  residual_points: { fitted: number; residual: number }[];
};

const MODEL_ROWS = models as unknown as ModelRow[];
const REG = regression as unknown as Reg;
const FEATURES = featureImportance as unknown as { feature: string; mean_abs_shap: number }[];
const COEFS = coefficients as unknown as Record<string, number>[];

const prettyFeature = (f: string) =>
  f
    .replace("num__", "")
    .replace("cat__", "")
    .replace("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function ModelsPage() {
  const best = MODEL_ROWS[0];
  return (
    <div className="pb-10">
      <PageHeader
        badge="Module X · Regression + Machine Learning"
        title="The prediction model"
        description="Six models compared under 5-fold cross-validation, explained with SHAP, and turned into a live predictor you can play with — all running in your browser."
      />

      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Best model" value={0} decimals={0} note={best.model} icon={Award} accent />
          <KpiCard label="Cross-val R²" value={best.cv_r2} decimals={3} icon={Layers} note="5-fold" />
          <KpiCard label="Hold-out MAE" value={REG.holdout.MAE} decimals={3} icon={Target} note="linear regression" />
          <KpiCard label="Multiple OLS R²" value={REG.multiple_r2} decimals={3} icon={Crosshair} note={`adj ${REG.multiple_adj_r2}`} />
        </div>

        <section className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <ChartFrame title="Model comparison" subtitle="Cross-validated R² (higher is better)">
              <SimpleBarChart
                data={[...MODEL_ROWS].sort((a, b) => b.cv_r2 - a.cv_r2)}
                xKey="model"
                yKey="cv_r2"
                vertical
                height={320}
                color={(d: ModelRow) => (d.model === best.model ? "#f5c518" : "#3a3a46")}
              />
            </ChartFrame>
          </Reveal>
          <Reveal delay={0.08}>
            <ChartFrame title="Feature importance (SHAP)" subtitle="Average impact on the prediction">
              <SimpleBarChart
                data={FEATURES.slice(0, 8).map((f) => ({
                  feature: prettyFeature(f.feature),
                  value: f.mean_abs_shap,
                }))}
                xKey="feature"
                yKey="value"
                vertical
                height={320}
                color="#4cc9f0"
              />
            </ChartFrame>
          </Reveal>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Reveal>
            <ChartFrame title="Held-out predictions" subtitle={`R² = ${REG.holdout.R2} on 150 unseen films`}>
              <PredVsActual points={REG.holdout_points} />
            </ChartFrame>
          </Reveal>
          <Reveal delay={0.06}>
            <ChartFrame title="Residual diagnostics" subtitle="Random scatter = good fit">
              <ResidualsPlot points={REG.residual_points} />
            </ChartFrame>
          </Reveal>
          <Reveal delay={0.12}>
            <Panel>
              <h3 className="mb-4 text-sm font-semibold text-white">OLS coefficients</h3>
              <div className="space-y-2 text-sm">
                {COEFS.map((row) => {
                  const key = Object.keys(row)[0];
                  return (
                    <div key={key} className="flex justify-between gap-3 border-b border-line/50 pb-1.5">
                      <span className="text-muted">{prettyFeature(key)}</span>
                      <span className="font-mono text-white/90">{Number(row[key]).toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Each coefficient is the fitted change in rating per one-unit increase, holding
                the others fixed.
              </p>
            </Panel>
          </Reveal>
        </section>

        <section>
          <SectionHeading
            eyebrow="Live demo"
            title="Predict a movie's rating"
            description="Move the sliders and the gradient-boosting ensemble re-scores instantly in the browser. The SHAP-style bars show exactly which factors push the rating up or down."
          />
          <Predictor />
        </section>

        <Reveal>
          <Panel className="border-imdb/20">
            <h3 className="mb-2 text-sm font-semibold text-white">How the explanation works</h3>
            <p className="text-xs leading-relaxed text-muted">
              The model is 100 gradient-boosted decision trees exported to JSON and evaluated in
              JavaScript — no server needed. For each feature we re-run the model with that feature
              set to the dataset average and measure how much the prediction changes. Green bars
              raise the rating, red bars lower it. The AI Analyst button then turns those numbers
              into a written explanation.
            </p>
          </Panel>
        </Reveal>
      </div>
    </div>
  );
}
