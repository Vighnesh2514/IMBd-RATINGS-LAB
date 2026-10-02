// Statistical helpers that run in the browser (Student t-test, Normal PDF, histograms).

function gammaLn(x: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betaCf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

function betaInc(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(
    gammaLn(a + b) - gammaLn(a) - gammaLn(b) + a * Math.log(x) + b * Math.log(1 - x),
  );
  if (x < (a + 1) / (a + b + 2)) return (bt * betaCf(a, b, x)) / a;
  return 1 - (bt * betaCf(b, a, 1 - x)) / b;
}

export function tTestTwoSided(a: number[], b: number[]) {
  const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const variance = (arr: number[], m: number) =>
    arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1);
  const na = a.length;
  const nb = b.length;
  const ma = mean(a);
  const mb = mean(b);
  const va = variance(a, ma);
  const vb = variance(b, mb);
  const se = Math.sqrt(va / na + vb / nb);
  const t = (ma - mb) / se;
  const df =
    (va / na + vb / nb) ** 2 /
    ((va / na) ** 2 / (na - 1) + (vb / nb) ** 2 / (nb - 1));
  const p = betaInc(df / 2, 0.5, df / (df + t * t));
  return { t, p, df, meanA: ma, meanB: mb, nA: na, nB: nb };
}

export function normalPdf(x: number, mu: number, sigma: number): number {
  return (
    (1 / (sigma * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
  );
}

export function histogram(
  values: number[],
  bins: number,
  min: number,
  max: number,
): { x: number; count: number; label: string }[] {
  const width = (max - min) / bins;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx < 0) idx = 0;
    if (idx >= bins) idx = bins - 1;
    counts[idx] += 1;
  }
  return counts.map((count, i) => {
    const lo = min + i * width;
    const hi = lo + width;
    return {
      x: Number((lo + width / 2).toFixed(3)),
      count,
      label: `${lo.toFixed(1)}–${hi.toFixed(1)}`,
    };
  });
}

export function quantile(sorted: number[], q: number): number {
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }
  return sorted[base];
}

export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let sa = 0;
  let sb = 0;
  for (let i = 0; i < n; i++) {
    sa += a[i];
    sb += b[i];
  }
  const ma = sa / n;
  const mb = sb / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma;
    const y = b[i] - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return num / Math.sqrt(da * db);
}

export function correlationMatrix(
  columns: { name: string; values: (number | null)[] }[],
): number[][] {
  return columns.map((row) =>
    columns.map((col) => {
      const a: number[] = [];
      const b: number[] = [];
      for (let i = 0; i < row.values.length; i++) {
        const x = row.values[i];
        const y = col.values[i];
        if (x !== null && y !== null && !Number.isNaN(x) && !Number.isNaN(y)) {
          a.push(x);
          b.push(y);
        }
      }
      return Number(pearson(a, b).toFixed(3));
    }),
  );
}
