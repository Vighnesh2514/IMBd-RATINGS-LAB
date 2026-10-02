import modelData from "@/data/model.json";

type Leaf = { f: -1; v: number };
type Split = { f: number; t: number; l: number; r: number };
export type TreeNode = Leaf | Split;

export interface ModelPayload {
  model_name: string;
  learning_rate: number;
  init: number;
  trees: TreeNode[][];
  numeric_features: string[];
  categorical_feature: string;
  impute: number[];
  scaler_mean: number[];
  scaler_scale: number[];
  categories: string[];
  baseline_genre: string;
  engineered_column_order: string[];
  n_estimators: number;
  verification_max_abs_diff: number;
}

export interface MovieInput {
  meta_score: number;
  votes: number;
  runtime_min: number;
  year: number;
  num_genres: number;
  gross_millions: number;
  main_genre: string;
}

export interface Contribution {
  feature: string;
  label: string;
  contribution: number;
  value: number;
}

const MODEL = modelData as unknown as ModelPayload;

const LABELS: Record<string, string> = {
  meta_score: "Metascore",
  log_votes: "Popularity (log votes)",
  runtime_min: "Runtime",
  year: "Release year",
  num_genres: "Number of genres",
  gross_millions: "Box office gross",
};

export function toVector(input: MovieInput): number[] {
  const raw = [
    input.meta_score,
    Math.log10(Math.max(input.votes, 1)),
    input.runtime_min,
    input.year,
    input.num_genres,
    input.gross_millions,
  ];
  const scaled = raw.map(
    (v, i) => (v - MODEL.scaler_mean[i]) / MODEL.scaler_scale[i],
  );
  const onehot = MODEL.categories.map((c) => (c === input.main_genre ? 1 : 0));
  return [...scaled, ...onehot];
}

function evalTree(tree: TreeNode[], row: number[]): number {
  let node = 0;
  while (true) {
    const n = tree[node];
    if (n.f === -1) return (n as Leaf).v;
    const s = n as Split;
    node = row[s.f] <= s.t ? s.l : s.r;
  }
}

export function predictVector(vector: number[]): number {
  let sum = MODEL.init;
  for (const tree of MODEL.trees) sum += evalTree(tree, vector);
  return sum;
}

export function predict(input: MovieInput): number {
  return predictVector(toVector(input));
}

function baselineInput(): MovieInput {
  return {
    meta_score: MODEL.impute[0],
    votes: Math.pow(10, MODEL.impute[1]),
    runtime_min: MODEL.impute[2],
    year: MODEL.impute[3],
    num_genres: MODEL.impute[4],
    gross_millions: MODEL.impute[5],
    main_genre: MODEL.baseline_genre,
  };
}

export function explain(input: MovieInput): {
  prediction: number;
  baseline: number;
  contributions: Contribution[];
} {
  const prediction = predict(input);
  const base = baselineInput();
  const basePrediction = predict(base);
  const contributions: Contribution[] = [];

  (Object.keys(LABELS) as (keyof typeof LABELS)[]).forEach((key) => {
    if (key === "log_votes") {
      const changed: MovieInput = {
        ...input,
        votes: Math.pow(10, MODEL.impute[1]),
      };
      contributions.push({
        feature: key,
        label: LABELS[key],
        contribution: prediction - predict(changed),
        value: Math.log10(Math.max(input.votes, 1)),
      });
    } else {
      const k = key as keyof MovieInput;
      const changed = { ...input, [k]: base[k] } as MovieInput;
      contributions.push({
        feature: key,
        label: LABELS[key],
        contribution: prediction - predict(changed),
        value: input[k] as number,
      });
    }
  });

  const changedGenre: MovieInput = { ...input, main_genre: MODEL.baseline_genre };
  contributions.push({
    feature: "main_genre",
    label: "Main genre",
    contribution: prediction - predict(changedGenre),
    value: 0,
  });

  contributions.sort(
    (a, b) => Math.abs(b.contribution) - Math.abs(a.contribution),
  );
  return { prediction, baseline: basePrediction, contributions };
}

export const MODEL_INFO = {
  name: MODEL.model_name,
  nEstimators: MODEL.n_estimators,
  learningRate: MODEL.learning_rate,
};
