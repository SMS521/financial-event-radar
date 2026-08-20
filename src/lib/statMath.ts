/**
 * Rigorous statistical math utilities for OLS regression, Pearson correlation,
 * Student's t-distribution two-tailed p-values, and Cook's Distance.
 */

// Accurate numerical approximation of the regularized incomplete beta function for t-distribution CDF
function betacf(a: number, b: number, x: number): number {
  const MAXIT = 100;
  const EPS = 3.0e-7;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
}

function gammln(xx: number): number {
  const cof = [
    76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let x = xx;
  let y = xx;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    ser += cof[j] / ++y;
  }
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

export function incBeta(a: number, b: number, x: number): number {
  if (x < 0.0 || x > 1.0) return 0.0;
  if (x === 0.0) return 0.0;
  if (x === 1.0) return 1.0;

  const bt = Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1.0 - x));
  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
  }
}

/**
 * Compute two-tailed p-value for Student's t-distribution with df degrees of freedom
 */
export function studentTTwoTailedPValue(t: number, df: number): number {
  if (df <= 0) return 1.0;
  const absT = Math.abs(t);
  const x = df / (df + absT * absT);
  const p = incBeta(0.5 * df, 0.5, x);
  return Math.min(1.0, Math.max(0.000001, p));
}

export interface CorrelationTestResult {
  factor: string;
  n: number;
  r: number;
  rSquared: number;
  tStat: number;
  pValue: number;
  cohenD: number;
}

/**
 * Real Pearson Correlation and Two-Tailed t-test on empirical data arrays
 */
export function computePearsonCorrelationTest(factorName: string, x: number[], y: number[]): CorrelationTestResult {
  const n = Math.min(x.length, y.length);
  if (n < 3) {
    return { factor: factorName, n, r: 0, rSquared: 0, tStat: 0, pValue: 1.0, cohenD: 0 };
  }

  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;

  let ssX = 0;
  let ssY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    ssX += dx * dx;
    ssY += dy * dy;
    ssXY += dx * dy;
  }

  if (ssX <= 0 || ssY <= 0) {
    return { factor: factorName, n, r: 0, rSquared: 0, tStat: 0, pValue: 1.0, cohenD: 0 };
  }

  const r = ssXY / Math.sqrt(ssX * ssY);
  const rSquared = r * r;
  const df = n - 2;
  const tStat = df > 0 && rSquared < 0.99999 ? (r * Math.sqrt(df)) / Math.sqrt(1 - rSquared) : 99.0;
  const pValue = studentTTwoTailedPValue(tStat, df);
  const cohenD = Math.abs(rSquared < 1 ? (2 * r) / Math.sqrt(1 - rSquared) : 4.0);

  return {
    factor: factorName,
    n,
    r: +r.toFixed(4),
    rSquared: +rSquared.toFixed(4),
    tStat: +tStat.toFixed(3),
    pValue: +pValue.toFixed(6),
    cohenD: +cohenD.toFixed(3),
  };
}

export interface OLSFitResult {
  n: number;
  beta0: number;
  beta1: number;
  seBeta1: number;
  tStat: number;
  pValue: number;
  rSquared: number;
  fStat: number;
  mse: number;
  residuals: number[];
  fitted: number[];
  leverages: number[];
  cooksDistances: number[];
}

/**
 * Full Ordinary Least Squares Regression with Residuals, Leverage & Cook's Distance
 */
export function computeOLSRegression(x: number[], y: number[]): OLSFitResult {
  const n = Math.min(x.length, y.length);
  if (n < 3) {
    return {
      n,
      beta0: 0,
      beta1: 0,
      seBeta1: 0,
      tStat: 0,
      pValue: 1.0,
      rSquared: 0,
      fStat: 0,
      mse: 0,
      residuals: [],
      fitted: [],
      leverages: [],
      cooksDistances: [],
    };
  }

  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;

  let ssX = 0;
  let ssY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    ssX += dx * dx;
    ssY += dy * dy;
    ssXY += dx * dy;
  }

  const beta1 = ssX > 0 ? ssXY / ssX : 0;
  const beta0 = my - beta1 * mx;

  const fitted = x.map((xi) => beta0 + beta1 * xi);
  const residuals = y.map((yi, i) => yi - fitted[i]);
  const sse = residuals.reduce((s, r) => s + r * r, 0);
  const df = n - 2;
  const mse = df > 0 ? sse / df : 0;

  const seBeta1 = ssX > 0 && mse >= 0 ? Math.sqrt(mse / ssX) : 0;
  const tStat = seBeta1 > 0 ? beta1 / seBeta1 : 0;
  const pValue = studentTTwoTailedPValue(tStat, df);

  const ssReg = ssY - sse;
  const rSquared = ssY > 0 ? Math.max(0, Math.min(1.0, ssReg / ssY)) : 0;
  const fStat = mse > 0 ? ssReg / mse : 0;

  // Leverage hii = 1/n + (xi - mx)^2 / ssX
  const leverages = x.map((xi) => 1 / n + (ssX > 0 ? Math.pow(xi - mx, 2) / ssX : 0));

  // Cook's D_i = (e_i^2 / (2 * MSE)) * (h_i / (1 - h_i)^2)
  const cooksDistances = residuals.map((ri, i) => {
    const hi = Math.min(0.99, leverages[i]);
    const d = mse > 0 ? (ri * ri / (2 * mse)) * (hi / Math.pow(1 - hi, 2)) : 0;
    return +d.toFixed(5);
  });

  return {
    n,
    beta0: +beta0.toFixed(4),
    beta1: +beta1.toFixed(4),
    seBeta1: +seBeta1.toFixed(4),
    tStat: +tStat.toFixed(3),
    pValue: +pValue.toFixed(6),
    rSquared: +rSquared.toFixed(4),
    fStat: +fStat.toFixed(3),
    mse: +mse.toFixed(5),
    residuals: residuals.map((r) => +r.toFixed(4)),
    fitted: fitted.map((f) => +f.toFixed(4)),
    leverages: leverages.map((h) => +h.toFixed(5)),
    cooksDistances,
  };
}
