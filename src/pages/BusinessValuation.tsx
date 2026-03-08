import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, TrendingUp, BarChart3, Calculator, DollarSign, Layers, Target, Shuffle, Download, Info, Building2, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell, Legend, ComposedChart, Area } from "recharts";
import jsPDF from "jspdf";

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface DCFInputs {
  mode: "simple" | "full" | "directFCF";
  terminalMethod: "gordon" | "exitMultiple";
  companyName: string;
  revenue: number;
  revenueGrowth: number;
  ebitdaMargin: number;
  depreciationPct: number;
  taxRate: number;
  capexPct: number;
  nwcPct: number;
  wacc: number;
  terminalGrowth: number;
  exitMultiple: number;
  projectionYears: number;
  netDebt: number;
  sharesOutstanding: number;
  // Full model extras
  cogs: number;
  sga: number;
  da: number;
  interestExpense: number;
  currentAssets: number;
  currentLiabilities: number;
  totalDebt: number;
  cash: number;
  // Direct FCF mode
  directFCFs: number[];
}

interface CompInput {
  name: string;
  evEbitda: number;
  peRatio: number;
  pbRatio: number;
  evRevenue: number;
}

interface PrecedentDeal {
  target: string;
  acquirer: string;
  evEbitda: number;
  evRevenue: number;
  premium: number;
  year: number;
}

interface LBOInputs {
  entryEbitda: number;
  entryMultiple: number;
  exitMultiple: number;
  holdingPeriod: number;
  debtPct: number;
  interestRate: number;
  ebitdaGrowth: number;
  fcfConversion: number;
}

interface ScenarioCase {
  label: string;
  probability: number;
  revenueGrowth: number;
  ebitdaMargin: number;
  wacc: number;
  terminalGrowth: number;
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (n: number) => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

const fmtM = (n: number) => `${n.toFixed(1)}x`;

const calcDCF = (inputs: DCFInputs) => {
  const years: { year: number; revenue: number; ebitda: number; fcf: number; pvFCF: number }[] = [];
  let rev = inputs.revenue;
  let totalPV = 0;

  if (inputs.mode === "directFCF") {
    // Direct FCF mode: user provides FCFs directly
    for (let i = 0; i < inputs.directFCFs.length; i++) {
      const fcf = inputs.directFCFs[i];
      const pv = fcf / Math.pow(1 + inputs.wacc / 100, i + 1);
      totalPV += pv;
      years.push({ year: i + 1, revenue: 0, ebitda: 0, fcf, pvFCF: pv });
    }
  } else {
    for (let i = 1; i <= inputs.projectionYears; i++) {
      rev *= 1 + inputs.revenueGrowth / 100;
      const ebitda = rev * (inputs.ebitdaMargin / 100);
      const depreciation = rev * (inputs.depreciationPct / 100);
      const ebit = ebitda - depreciation;
      const nopat = ebit * (1 - inputs.taxRate / 100);
      const capex = rev * (inputs.capexPct / 100);
      const nwcChange = rev * (inputs.nwcPct / 100) * (inputs.revenueGrowth / 100);
      const fcf = nopat + depreciation - capex - nwcChange;
      const pv = fcf / Math.pow(1 + inputs.wacc / 100, i);
      totalPV += pv;
      years.push({ year: i, revenue: rev, ebitda, fcf, pvFCF: pv });
    }
  }

  const projYears = inputs.mode === "directFCF" ? inputs.directFCFs.length : inputs.projectionYears;
  const lastFCF = years[years.length - 1]?.fcf || 0;
  const lastEbitda = years[years.length - 1]?.ebitda || 0;
  const terminalValue = inputs.terminalMethod === "exitMultiple"
    ? (inputs.mode === "directFCF" ? lastFCF * inputs.exitMultiple : lastEbitda * inputs.exitMultiple)
    : (lastFCF * (1 + inputs.terminalGrowth / 100)) / (inputs.wacc / 100 - inputs.terminalGrowth / 100);
  const pvTerminal = terminalValue / Math.pow(1 + inputs.wacc / 100, projYears);
  const enterpriseValue = totalPV + pvTerminal;
  const equityValue = enterpriseValue - inputs.netDebt;
  const sharePrice = inputs.sharesOutstanding > 0 ? equityValue / inputs.sharesOutstanding : 0;

  return { years, terminalValue, pvTerminal, totalPV, enterpriseValue, equityValue, sharePrice };
};

const runMonteCarlo = (baseInputs: DCFInputs, iterations: number = 5000) => {
  const results: number[] = [];
  const randNorm = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  for (let i = 0; i < iterations; i++) {
    const simInputs = {
      ...baseInputs,
      revenueGrowth: baseInputs.revenueGrowth + randNorm() * 3,
      ebitdaMargin: baseInputs.ebitdaMargin + randNorm() * 2,
      wacc: Math.max(4, baseInputs.wacc + randNorm() * 1),
      terminalGrowth: Math.max(0, Math.min(baseInputs.wacc / 100 * 100 - 1, baseInputs.terminalGrowth + randNorm() * 0.5)),
    };
    const r = calcDCF(simInputs);
    if (isFinite(r.equityValue) && r.equityValue > 0) results.push(r.equityValue);
  }

  results.sort((a, b) => a - b);
  const p10 = results[Math.floor(results.length * 0.1)] || 0;
  const p25 = results[Math.floor(results.length * 0.25)] || 0;
  const p50 = results[Math.floor(results.length * 0.5)] || 0;
  const p75 = results[Math.floor(results.length * 0.75)] || 0;
  const p90 = results[Math.floor(results.length * 0.9)] || 0;
  const mean = results.reduce((a, b) => a + b, 0) / results.length;

  // Histogram
  const min = results[0];
  const max = results[results.length - 1];
  const buckets = 30;
  const bucketSize = (max - min) / buckets;
  const histogram = Array.from({ length: buckets }, (_, i) => ({
    range: fmt(min + i * bucketSize),
    value: min + (i + 0.5) * bucketSize,
    count: results.filter(v => v >= min + i * bucketSize && v < min + (i + 1) * bucketSize).length,
  }));

  return { p10, p25, p50, p75, p90, mean, histogram, count: results.length };
};

// ─── INDUSTRY BENCHMARKS ────────────────────────────────────────────────────
const INDUSTRY_BENCHMARKS: Record<string, {
  label: string;
  revenueGrowth: number;
  ebitdaMargin: number;
  depreciationPct: number;
  taxRate: number;
  capexPct: number;
  nwcPct: number;
  beta: number;
  comps: CompInput[];
  precedents: PrecedentDeal[];
}> = {
  it_services: {
    label: "IT Services",
    revenueGrowth: 14, ebitdaMargin: 24, depreciationPct: 2.5, taxRate: 25.17, capexPct: 3.5, nwcPct: 12, beta: 0.95,
    comps: [
      { name: "TCS", evEbitda: 22.5, peRatio: 30.2, pbRatio: 13.5, evRevenue: 5.4 },
      { name: "Infosys", evEbitda: 19.8, peRatio: 27.1, pbRatio: 9.2, evRevenue: 4.8 },
      { name: "Wipro", evEbitda: 14.5, peRatio: 20.3, pbRatio: 3.8, evRevenue: 2.5 },
      { name: "HCL Tech", evEbitda: 16.2, peRatio: 23.5, pbRatio: 7.1, evRevenue: 3.6 },
    ],
    precedents: [
      { target: "Mphasis", acquirer: "Blackstone", evEbitda: 18.0, evRevenue: 3.8, premium: 28, year: 2023 },
      { target: "Mindtree", acquirer: "L&T", evEbitda: 22.5, evRevenue: 4.5, premium: 35, year: 2022 },
      { target: "NIIT Tech", acquirer: "Baring PE", evEbitda: 15.2, evRevenue: 2.8, premium: 25, year: 2023 },
    ],
  },
  fmcg: {
    label: "FMCG",
    revenueGrowth: 10, ebitdaMargin: 22, depreciationPct: 3, taxRate: 25.17, capexPct: 4, nwcPct: 8, beta: 0.65,
    comps: [
      { name: "HUL", evEbitda: 45.0, peRatio: 55.2, pbRatio: 35.0, evRevenue: 10.5 },
      { name: "Nestle India", evEbitda: 42.0, peRatio: 72.1, pbRatio: 50.0, evRevenue: 12.0 },
      { name: "ITC", evEbitda: 13.5, peRatio: 25.8, pbRatio: 7.5, evRevenue: 4.2 },
      { name: "Dabur", evEbitda: 32.0, peRatio: 50.0, pbRatio: 18.0, evRevenue: 7.8 },
    ],
    precedents: [
      { target: "GSK Consumer", acquirer: "HUL", evEbitda: 38.0, evRevenue: 8.5, premium: 32, year: 2023 },
      { target: "Paras Pharma", acquirer: "Reckitt", evEbitda: 25.0, evRevenue: 5.2, premium: 28, year: 2022 },
    ],
  },
  pharma: {
    label: "Pharma",
    revenueGrowth: 12, ebitdaMargin: 26, depreciationPct: 3.5, taxRate: 25.17, capexPct: 6, nwcPct: 15, beta: 0.75,
    comps: [
      { name: "Sun Pharma", evEbitda: 20.0, peRatio: 32.5, pbRatio: 5.8, evRevenue: 5.2 },
      { name: "Dr Reddy's", evEbitda: 15.8, peRatio: 25.0, pbRatio: 4.2, evRevenue: 3.5 },
      { name: "Cipla", evEbitda: 18.5, peRatio: 28.0, pbRatio: 5.0, evRevenue: 4.0 },
      { name: "Divi's Labs", evEbitda: 30.0, peRatio: 52.0, pbRatio: 10.5, evRevenue: 10.2 },
    ],
    precedents: [
      { target: "Gland Pharma", acquirer: "Fosun", evEbitda: 28.0, evRevenue: 8.0, premium: 30, year: 2023 },
      { target: "Piramal Pharma", acquirer: "Carlyle", evEbitda: 18.0, evRevenue: 3.5, premium: 22, year: 2022 },
    ],
  },
  banking: {
    label: "Banking / NBFC",
    revenueGrowth: 16, ebitdaMargin: 35, depreciationPct: 1.5, taxRate: 25.17, capexPct: 2, nwcPct: 5, beta: 1.15,
    comps: [
      { name: "HDFC Bank", evEbitda: 18.0, peRatio: 20.5, pbRatio: 3.2, evRevenue: 6.5 },
      { name: "ICICI Bank", evEbitda: 14.0, peRatio: 18.2, pbRatio: 2.8, evRevenue: 5.0 },
      { name: "Kotak Bank", evEbitda: 22.0, peRatio: 28.0, pbRatio: 4.5, evRevenue: 8.0 },
      { name: "Bajaj Finance", evEbitda: 25.0, peRatio: 35.0, pbRatio: 6.5, evRevenue: 10.0 },
    ],
    precedents: [
      { target: "HDFC Ltd", acquirer: "HDFC Bank", evEbitda: 16.0, evRevenue: 5.5, premium: 18, year: 2024 },
      { target: "Gruh Finance", acquirer: "Bandhan Bank", evEbitda: 20.0, evRevenue: 7.0, premium: 30, year: 2023 },
    ],
  },
  real_estate: {
    label: "Real Estate",
    revenueGrowth: 18, ebitdaMargin: 28, depreciationPct: 4, taxRate: 25.17, capexPct: 8, nwcPct: 25, beta: 1.3,
    comps: [
      { name: "DLF", evEbitda: 22.0, peRatio: 45.0, pbRatio: 3.8, evRevenue: 6.5 },
      { name: "Godrej Properties", evEbitda: 35.0, peRatio: 65.0, pbRatio: 5.5, evRevenue: 10.0 },
      { name: "Oberoi Realty", evEbitda: 18.0, peRatio: 25.0, pbRatio: 3.2, evRevenue: 8.5 },
      { name: "Prestige Estates", evEbitda: 14.0, peRatio: 30.0, pbRatio: 4.0, evRevenue: 3.8 },
    ],
    precedents: [
      { target: "Embassy Office", acquirer: "Blackstone", evEbitda: 20.0, evRevenue: 12.0, premium: 15, year: 2024 },
      { target: "Mindspace REIT", acquirer: "K Raheja", evEbitda: 18.0, evRevenue: 10.0, premium: 12, year: 2023 },
    ],
  },
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────
const BusinessValuation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // DCF State
  const [dcf, setDcf] = useState<DCFInputs>({
    mode: "simple",
    terminalMethod: "gordon",
    companyName: "ABC Corp",
    exitMultiple: 12,
    revenue: 50000000,
    revenueGrowth: 15,
    ebitdaMargin: 22,
    depreciationPct: 3,
    taxRate: 25.17,
    capexPct: 5,
    nwcPct: 10,
    wacc: 12,
    terminalGrowth: 4,
    projectionYears: 5,
    netDebt: 5000000,
    sharesOutstanding: 100000,
    cogs: 60, sga: 12, da: 3, interestExpense: 500000,
    currentAssets: 15000000, currentLiabilities: 10000000,
    totalDebt: 8000000, cash: 3000000,
    directFCFs: [5000000, 5750000, 6600000, 7590000, 8730000],
  });

  // Comps State
  const [targetEbitda, setTargetEbitda] = useState(11000000);
  const [targetEarnings, setTargetEarnings] = useState(7000000);
  const [targetBookValue, setTargetBookValue] = useState(25000000);
  const [targetRevenue, setTargetRevenue] = useState(50000000);
  const [comps, setComps] = useState<CompInput[]>([
    { name: "Peer A", evEbitda: 14.2, peRatio: 28.5, pbRatio: 4.8, evRevenue: 3.2 },
    { name: "Peer B", evEbitda: 11.8, peRatio: 22.1, pbRatio: 3.5, evRevenue: 2.5 },
    { name: "Peer C", evEbitda: 16.5, peRatio: 35.0, pbRatio: 6.2, evRevenue: 4.1 },
    { name: "Peer D", evEbitda: 12.9, peRatio: 25.3, pbRatio: 4.1, evRevenue: 2.9 },
  ]);

  // Precedent Transactions
  const [precedents, setPrecedents] = useState<PrecedentDeal[]>([
    { target: "TechCo", acquirer: "BigCorp", evEbitda: 18.5, evRevenue: 4.2, premium: 32, year: 2024 },
    { target: "DataFirm", acquirer: "CloudInc", evEbitda: 15.2, evRevenue: 3.5, premium: 25, year: 2023 },
    { target: "SaaS Ltd", acquirer: "Enterprise Co", evEbitda: 20.1, evRevenue: 5.0, premium: 40, year: 2023 },
    { target: "DigitalServ", acquirer: "MegaTech", evEbitda: 13.8, evRevenue: 2.8, premium: 22, year: 2024 },
  ]);

  // LBO
  const [lbo, setLbo] = useState<LBOInputs>({
    entryEbitda: 11000000, entryMultiple: 10, exitMultiple: 10,
    holdingPeriod: 5, debtPct: 60, interestRate: 9, ebitdaGrowth: 10, fcfConversion: 50,
  });

  // Scenarios
  const [scenarios, setScenarios] = useState<ScenarioCase[]>([
    { label: "Bear", probability: 20, revenueGrowth: 8, ebitdaMargin: 18, wacc: 14, terminalGrowth: 3 },
    { label: "Base", probability: 50, revenueGrowth: 15, ebitdaMargin: 22, wacc: 12, terminalGrowth: 4 },
    { label: "Bull", probability: 30, revenueGrowth: 22, ebitdaMargin: 26, wacc: 10, terminalGrowth: 5 },
  ]);

  const [monteCarloResults, setMonteCarloResults] = useState<ReturnType<typeof runMonteCarlo> | null>(null);
  const [isRunningMC, setIsRunningMC] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("");

  // WACC Calculator (CAPM)
  const [waccCalc, setWaccCalc] = useState({
    riskFreeRate: 7.1, // 10Y India Gov Bond
    beta: 0.95,
    equityRiskPremium: 6.5,
    costOfDebt: 9.0,
    taxRateDebt: 25.17,
    debtWeight: 30,
    equityWeight: 70,
  });

  const computedCostOfEquity = waccCalc.riskFreeRate + waccCalc.beta * waccCalc.equityRiskPremium;
  const afterTaxCostOfDebt = waccCalc.costOfDebt * (1 - waccCalc.taxRateDebt / 100);
  const computedWACC = (waccCalc.equityWeight / 100) * computedCostOfEquity + (waccCalc.debtWeight / 100) * afterTaxCostOfDebt;

  const applyWACCToDCF = () => {
    updateDCF("wacc", Math.round(computedWACC * 100) / 100);
    toast({ title: "WACC Applied", description: `WACC of ${computedWACC.toFixed(2)}% applied to DCF model.` });
  };

  const applyIndustryBenchmark = (key: string) => {
    setSelectedIndustry(key);
    if (key === "custom") {
      toast({ title: "Custom Mode", description: "Enter your own data in all fields." });
      return;
    }
    const b = INDUSTRY_BENCHMARKS[key];
    if (!b) return;
    setDcf(prev => ({
      ...prev,
      revenueGrowth: b.revenueGrowth,
      ebitdaMargin: b.ebitdaMargin,
      depreciationPct: b.depreciationPct,
      taxRate: b.taxRate,
      capexPct: b.capexPct,
      nwcPct: b.nwcPct,
    }));
    setComps(b.comps);
    setPrecedents(b.precedents);
    setWaccCalc(prev => ({ ...prev, beta: b.beta }));
    toast({ title: `${b.label} Benchmarks Applied`, description: "Margins, multiples, and comps pre-filled with industry data." });
  };

  // ── DCF Calc
  const dcfResult = useMemo(() => calcDCF(dcf), [dcf]);

  // ── Terminal Value Comparison (Gordon vs Exit Multiple side-by-side)
  const tvComparison = useMemo(() => {
    const gordonResult = calcDCF({ ...dcf, terminalMethod: "gordon" });
    const exitResult = calcDCF({ ...dcf, terminalMethod: "exitMultiple" });
    const diff = exitResult.equityValue - gordonResult.equityValue;
    const diffPct = gordonResult.equityValue !== 0 ? (diff / Math.abs(gordonResult.equityValue)) * 100 : 0;
    return { gordon: gordonResult, exit: exitResult, diff, diffPct };
  }, [dcf]);

  // ── Comps Calc
  const compsResult = useMemo(() => {
    const avgEvEbitda = comps.reduce((s, c) => s + c.evEbitda, 0) / comps.length;
    const avgPE = comps.reduce((s, c) => s + c.peRatio, 0) / comps.length;
    const avgPB = comps.reduce((s, c) => s + c.pbRatio, 0) / comps.length;
    const avgEvRev = comps.reduce((s, c) => s + c.evRevenue, 0) / comps.length;
    const medianEvEbitda = [...comps.map(c => c.evEbitda)].sort((a, b) => a - b)[Math.floor(comps.length / 2)];
    return {
      avgEvEbitda, avgPE, avgPB, avgEvRev, medianEvEbitda,
      evByEbitda: avgEvEbitda * targetEbitda,
      eqByPE: avgPE * targetEarnings,
      eqByPB: avgPB * targetBookValue,
      evByRevenue: avgEvRev * targetRevenue,
    };
  }, [comps, targetEbitda, targetEarnings, targetBookValue, targetRevenue]);

  // ── Precedent Calc
  const precedentResult = useMemo(() => {
    const avgEvEbitda = precedents.reduce((s, p) => s + p.evEbitda, 0) / precedents.length;
    const avgEvRev = precedents.reduce((s, p) => s + p.evRevenue, 0) / precedents.length;
    const avgPremium = precedents.reduce((s, p) => s + p.premium, 0) / precedents.length;
    return {
      avgEvEbitda, avgEvRev, avgPremium,
      evByEbitda: avgEvEbitda * targetEbitda,
      evByRevenue: avgEvRev * targetRevenue,
    };
  }, [precedents, targetEbitda, targetRevenue]);

  // ── LBO Calc
  const lboResult = useMemo(() => {
    const ev = lbo.entryEbitda * lbo.entryMultiple;
    const debt = ev * (lbo.debtPct / 100);
    const equity = ev - debt;
    let cumulativeDebtPaydown = 0;
    let ebitda = lbo.entryEbitda;
    const years: { year: number; ebitda: number; fcf: number; debtRemaining: number }[] = [];
    let remainingDebt = debt;

    for (let i = 1; i <= lbo.holdingPeriod; i++) {
      ebitda *= (1 + lbo.ebitdaGrowth / 100);
      const fcf = ebitda * (lbo.fcfConversion / 100) - remainingDebt * (lbo.interestRate / 100);
      const paydown = Math.min(Math.max(fcf, 0), remainingDebt);
      remainingDebt -= paydown;
      cumulativeDebtPaydown += paydown;
      years.push({ year: i, ebitda, fcf, debtRemaining: remainingDebt });
    }

    const exitEV = ebitda * lbo.exitMultiple;
    const exitEquity = exitEV - remainingDebt;
    const moic = exitEquity / equity;
    const irr = (Math.pow(moic, 1 / lbo.holdingPeriod) - 1) * 100;

    return { ev, debt, equity, exitEV, exitEquity, moic, irr, years, cumulativeDebtPaydown };
  }, [lbo]);

  // ── Sensitivity
  const sensitivityTable = useMemo(() => {
    const waccRange = [-2, -1, 0, 1, 2].map(d => dcf.wacc + d);
    const growthRange = [-1.5, -0.75, 0, 0.75, 1.5].map(d => dcf.terminalGrowth + d);
    return waccRange.map(w => ({
      wacc: w,
      values: growthRange.map(g => {
        const r = calcDCF({ ...dcf, wacc: w, terminalGrowth: g });
        return { growth: g, equity: r.equityValue, sharePrice: r.sharePrice };
      }),
    }));
  }, [dcf]);

  // ── Scenario Analysis
  const scenarioResults = useMemo(() => {
    return scenarios.map(s => {
      const r = calcDCF({ ...dcf, revenueGrowth: s.revenueGrowth, ebitdaMargin: s.ebitdaMargin, wacc: s.wacc, terminalGrowth: s.terminalGrowth });
      return { ...s, equityValue: r.equityValue, ev: r.enterpriseValue, sharePrice: r.sharePrice };
    });
  }, [scenarios, dcf]);

  const weightedValue = useMemo(() => {
    const totalProb = scenarioResults.reduce((s, r) => s + r.probability, 0);
    return scenarioResults.reduce((s, r) => s + r.equityValue * (r.probability / totalProb), 0);
  }, [scenarioResults]);

  // ── Football Field
  const footballData = useMemo(() => {
    const dcfEq = dcfResult.equityValue;
    const compsLow = Math.min(compsResult.evByEbitda, compsResult.eqByPE, compsResult.eqByPB) * 0.85;
    const compsHigh = Math.max(compsResult.evByEbitda, compsResult.eqByPE, compsResult.eqByPB) * 1.15;
    const precLow = Math.min(precedentResult.evByEbitda, precedentResult.evByRevenue) * 0.9;
    const precHigh = Math.max(precedentResult.evByEbitda, precedentResult.evByRevenue) * 1.1;
    const lboEq = lboResult.exitEquity;
    const bearVal = scenarioResults.find(s => s.label === "Bear")?.equityValue || dcfEq * 0.7;
    const bullVal = scenarioResults.find(s => s.label === "Bull")?.equityValue || dcfEq * 1.3;

    return [
      { method: "DCF", low: dcfEq * 0.9, mid: dcfEq, high: dcfEq * 1.1 },
      { method: "Comps", low: compsLow, mid: (compsLow + compsHigh) / 2, high: compsHigh },
      { method: "Precedent", low: precLow, mid: (precLow + precHigh) / 2, high: precHigh },
      { method: "LBO", low: lboEq * 0.85, mid: lboEq, high: lboEq * 1.15 },
      { method: "Scenario", low: bearVal, mid: weightedValue, high: bullVal },
    ];
  }, [dcfResult, compsResult, precedentResult, lboResult, scenarioResults, weightedValue]);

  // ── Monte Carlo
  const handleMonteCarlo = useCallback(() => {
    setIsRunningMC(true);
    setTimeout(() => {
      const results = runMonteCarlo(dcf, 5000);
      setMonteCarloResults(results);
      setIsRunningMC(false);
      toast({ title: "Monte Carlo Complete", description: `${results.count} simulations run successfully.` });
    }, 100);
  }, [dcf, toast]);

  // ── Update helpers
  const updateDCF = (field: keyof DCFInputs, value: number | string) => {
    setDcf(prev => ({ ...prev, [field]: value }));
  };

  const updateComp = (index: number, field: keyof CompInput, value: number | string) => {
    setComps(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const updateScenario = (index: number, field: keyof ScenarioCase, value: number | string) => {
    setScenarios(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const updateLBO = (field: keyof LBOInputs, value: number) => {
    setLbo(prev => ({ ...prev, [field]: value }));
  };

  const resetAll = () => {
    setDcf({
      mode: "simple", terminalMethod: "gordon", companyName: "", exitMultiple: 0,
      revenue: 0, revenueGrowth: 0, ebitdaMargin: 0, depreciationPct: 0, taxRate: 0,
      capexPct: 0, nwcPct: 0, wacc: 0, terminalGrowth: 0, projectionYears: 5,
      netDebt: 0, sharesOutstanding: 0, cogs: 0, sga: 0, da: 0, interestExpense: 0,
      currentAssets: 0, currentLiabilities: 0, totalDebt: 0, cash: 0,
      directFCFs: [0],
    });
    setTargetEbitda(0);
    setTargetEarnings(0);
    setTargetBookValue(0);
    setTargetRevenue(0);
    setComps([{ name: "", evEbitda: 0, peRatio: 0, pbRatio: 0, evRevenue: 0 }]);
    setPrecedents([{ target: "", acquirer: "", evEbitda: 0, evRevenue: 0, premium: 0, year: 2025 }]);
    setLbo({ entryEbitda: 0, entryMultiple: 0, exitMultiple: 0, holdingPeriod: 5, debtPct: 0, interestRate: 0, ebitdaGrowth: 0, fcfConversion: 0 });
    setScenarios([
      { label: "Bear", probability: 0, revenueGrowth: 0, ebitdaMargin: 0, wacc: 0, terminalGrowth: 0 },
      { label: "Base", probability: 0, revenueGrowth: 0, ebitdaMargin: 0, wacc: 0, terminalGrowth: 0 },
      { label: "Bull", probability: 0, revenueGrowth: 0, ebitdaMargin: 0, wacc: 0, terminalGrowth: 0 },
    ]);
    setMonteCarloResults(null);
    setSelectedIndustry("");
    setWaccCalc({ riskFreeRate: 0, beta: 0, equityRiskPremium: 0, costOfDebt: 0, taxRateDebt: 0, debtWeight: 0, equityWeight: 0 });
    toast({ title: "All Values Cleared", description: "Enter your own data to begin valuation." });
  };

  // ── PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Business Valuation — ${dcf.companyName}`, 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 28);

    let y = 40;
    const addSection = (title: string, items: [string, string][]) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, 14, y); y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      items.forEach(([k, v]) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`${k}: ${v}`, 18, y); y += 5;
      });
      y += 5;
    };

    addSection("DCF Valuation", [
      ["Enterprise Value", fmt(dcfResult.enterpriseValue)],
      ["Equity Value", fmt(dcfResult.equityValue)],
      ["Share Price", fmt(dcfResult.sharePrice)],
      ["Terminal Value", fmt(dcfResult.terminalValue)],
      ["PV of FCFs", fmt(dcfResult.totalPV)],
      ["PV of Terminal", fmt(dcfResult.pvTerminal)],
    ]);

    addSection("Comparable Company Analysis", [
      ["EV by EV/EBITDA", fmt(compsResult.evByEbitda)],
      ["Equity by P/E", fmt(compsResult.eqByPE)],
      ["Equity by P/B", fmt(compsResult.eqByPB)],
      ["EV by EV/Revenue", fmt(compsResult.evByRevenue)],
    ]);

    addSection("Precedent Transactions", [
      ["EV by EBITDA Multiple", fmt(precedentResult.evByEbitda)],
      ["EV by Revenue Multiple", fmt(precedentResult.evByRevenue)],
      ["Avg Control Premium", `${precedentResult.avgPremium.toFixed(1)}%`],
    ]);

    addSection("LBO Analysis", [
      ["Entry EV", fmt(lboResult.ev)],
      ["Exit EV", fmt(lboResult.exitEV)],
      ["Exit Equity", fmt(lboResult.exitEquity)],
      ["MOIC", `${lboResult.moic.toFixed(2)}x`],
      ["IRR", `${lboResult.irr.toFixed(1)}%`],
    ]);

    addSection("Scenario Analysis", scenarioResults.map(s => [
      `${s.label} (${s.probability}%)`, fmt(s.equityValue)
    ]));
    addSection("Weighted Valuation", [["Probability-Weighted Equity Value", fmt(weightedValue)]]);

    if (monteCarloResults) {
      addSection("Monte Carlo Simulation", [
        ["Simulations", monteCarloResults.count.toString()],
        ["P10", fmt(monteCarloResults.p10)],
        ["P25", fmt(monteCarloResults.p25)],
        ["Median (P50)", fmt(monteCarloResults.p50)],
        ["P75", fmt(monteCarloResults.p75)],
        ["P90", fmt(monteCarloResults.p90)],
        ["Mean", fmt(monteCarloResults.mean)],
      ]);
    }

    doc.save(`Valuation_${dcf.companyName.replace(/\s+/g, "_")}.pdf`);
    toast({ title: "PDF Exported", description: "Valuation report downloaded." });
  };

  // ── Number input helper
  const numInput = (label: string, value: number, onChange: (v: number) => void, suffix?: string, step?: number) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-1">
        <Input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} step={step || 1} className="h-8 text-sm" />
        {suffix && <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>}
      </div>
    </div>
  );

  // ── Metric card
  const metricCard = (label: string, value: string, sub?: string) => (
    <div className="bg-muted/30 rounded-lg p-3 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-primary">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-7 w-7 text-primary" />
                Business Valuation
              </h1>
              <p className="text-muted-foreground text-sm">McKinsey-grade DCF, Comps, Precedent Transactions & LBO Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={resetAll} variant="destructive" size="sm" className="gap-1.5">
              <Shuffle className="h-4 w-4" /> Reset / Clear
            </Button>
            <Button onClick={exportPDF} variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Company Name */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs">Company / Project Name</Label>
                <Input value={dcf.companyName} onChange={e => updateDCF("companyName", e.target.value)} className="h-9" />
              </div>
              <div className="min-w-[180px]">
                <Label className="text-xs flex items-center gap-1"><Building2 className="h-3 w-3" /> Industry Benchmark</Label>
                <Select value={selectedIndustry} onValueChange={applyIndustryBenchmark}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select industry…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom (My Data)</SelectItem>
                    {Object.entries(INDUSTRY_BENCHMARKS).map(([key, b]) => (
                      <SelectItem key={key} value={key}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">DCF Mode:</Label>
                <ToggleGroup type="single" value={dcf.mode} onValueChange={v => { if (v) updateDCF("mode", v); }} className="justify-start">
                  <ToggleGroupItem value="simple" className="text-xs h-8 px-3">Simple</ToggleGroupItem>
                  <ToggleGroupItem value="full" className="text-xs h-8 px-3">Full 3-Stmt</ToggleGroupItem>
                  <ToggleGroupItem value="directFCF" className="text-xs h-8 px-3">Direct FCF</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="dcf" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
            <TabsTrigger value="dcf" className="text-xs gap-1"><Calculator className="h-3 w-3" />DCF</TabsTrigger>
            <TabsTrigger value="comps" className="text-xs gap-1"><BarChart3 className="h-3 w-3" />Comps</TabsTrigger>
            <TabsTrigger value="precedent" className="text-xs gap-1"><Layers className="h-3 w-3" />Precedent</TabsTrigger>
            <TabsTrigger value="lbo" className="text-xs gap-1"><DollarSign className="h-3 w-3" />LBO</TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs gap-1"><Target className="h-3 w-3" />Analysis</TabsTrigger>
            <TabsTrigger value="football" className="text-xs gap-1"><Shuffle className="h-3 w-3" />Summary</TabsTrigger>
          </TabsList>

          {/* ═══════════════ DCF TAB ═══════════════ */}
          <TabsContent value="dcf" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Inputs */}
              <Card className="border-border/50 lg:col-span-1">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">DCF Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {dcf.mode === "directFCF" ? (
                    <>
                      <p className="text-xs text-muted-foreground">Enter Free Cash Flows for each projection year:</p>
                      {dcf.directFCFs.map((fcf, i) => (
                        <div key={i} className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Year {i + 1} FCF (₹)</Label>
                          <div className="flex items-center gap-1">
                            <Input type="number" value={fcf} onChange={e => {
                              const newFCFs = [...dcf.directFCFs];
                              newFCFs[i] = parseFloat(e.target.value) || 0;
                              setDcf(prev => ({ ...prev, directFCFs: newFCFs }));
                            }} className="h-8 text-sm" />
                            {dcf.directFCFs.length > 1 && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => {
                                setDcf(prev => ({ ...prev, directFCFs: prev.directFCFs.filter((_, j) => j !== i) }));
                              }}>×</Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => {
                        setDcf(prev => ({ ...prev, directFCFs: [...prev.directFCFs, prev.directFCFs[prev.directFCFs.length - 1] * 1.15] }));
                      }}>+ Add Year</Button>
                      <Separator />
                    </>
                  ) : (
                    <>
                      {numInput("Base Revenue (₹)", dcf.revenue, v => updateDCF("revenue", v))}
                      {numInput("Revenue Growth", dcf.revenueGrowth, v => updateDCF("revenueGrowth", v), "%", 0.5)}
                      {numInput("EBITDA Margin", dcf.ebitdaMargin, v => updateDCF("ebitdaMargin", v), "%", 0.5)}
                      {numInput("Depreciation (% Rev)", dcf.depreciationPct, v => updateDCF("depreciationPct", v), "%", 0.5)}
                      {numInput("Tax Rate", dcf.taxRate, v => updateDCF("taxRate", v), "%", 0.5)}
                      {numInput("Capex (% Rev)", dcf.capexPct, v => updateDCF("capexPct", v), "%", 0.5)}
                      {numInput("NWC (% Rev)", dcf.nwcPct, v => updateDCF("nwcPct", v), "%", 0.5)}
                      <Separator />
                      {numInput("Projection Years", dcf.projectionYears, v => updateDCF("projectionYears", v), "yrs", 1)}
                    </>
                  )}
                  {numInput("WACC", dcf.wacc, v => updateDCF("wacc", v), "%", 0.25)}
                  <Separator />
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Terminal Value Method</Label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${dcf.terminalMethod === "gordon" ? "text-primary font-semibold" : "text-muted-foreground"}`}>Gordon Growth</span>
                      <Switch checked={dcf.terminalMethod === "exitMultiple"} onCheckedChange={v => updateDCF("terminalMethod", v ? "exitMultiple" : "gordon")} />
                      <span className={`text-xs ${dcf.terminalMethod === "exitMultiple" ? "text-primary font-semibold" : "text-muted-foreground"}`}>Exit Multiple</span>
                    </div>
                  </div>
                  {dcf.terminalMethod === "gordon"
                    ? numInput("Terminal Growth Rate", dcf.terminalGrowth, v => updateDCF("terminalGrowth", v), "%", 0.25)
                    : numInput("Exit EV/EBITDA Multiple", dcf.exitMultiple, v => updateDCF("exitMultiple", v), "x", 0.5)
                  }
                  <Separator />
                  {numInput("Net Debt (₹)", dcf.netDebt, v => updateDCF("netDebt", v))}
                  {numInput("Shares Outstanding", dcf.sharesOutstanding, v => updateDCF("sharesOutstanding", v))}
                </CardContent>
              </Card>

              {/* WACC Calculator */}
              <Card className="border-border/50 lg:col-span-3">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> WACC Calculator (CAPM)
                  </CardTitle>
                  <CardDescription className="text-xs">Cost of Equity = Rf + β × ERP | WACC = E/V × Ke + D/V × Kd × (1-t)</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {numInput("Risk-Free Rate (Rf)", waccCalc.riskFreeRate, v => setWaccCalc(p => ({ ...p, riskFreeRate: v })), "%", 0.1)}
                    {numInput("Beta (β)", waccCalc.beta, v => setWaccCalc(p => ({ ...p, beta: v })), "", 0.05)}
                    {numInput("Equity Risk Premium", waccCalc.equityRiskPremium, v => setWaccCalc(p => ({ ...p, equityRiskPremium: v })), "%", 0.1)}
                    {numInput("Cost of Debt (Kd)", waccCalc.costOfDebt, v => setWaccCalc(p => ({ ...p, costOfDebt: v })), "%", 0.25)}
                    {numInput("Tax Rate (Debt Shield)", waccCalc.taxRateDebt, v => setWaccCalc(p => ({ ...p, taxRateDebt: v })), "%", 0.5)}
                    {numInput("Equity Weight (E/V)", waccCalc.equityWeight, v => setWaccCalc(p => ({ ...p, equityWeight: v, debtWeight: 100 - v })), "%", 5)}
                    {numInput("Debt Weight (D/V)", waccCalc.debtWeight, v => setWaccCalc(p => ({ ...p, debtWeight: v, equityWeight: 100 - v })), "%", 5)}
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {metricCard("Cost of Equity (Ke)", `${computedCostOfEquity.toFixed(2)}%`, `${waccCalc.riskFreeRate}% + ${waccCalc.beta} × ${waccCalc.equityRiskPremium}%`)}
                    {metricCard("After-Tax Kd", `${afterTaxCostOfDebt.toFixed(2)}%`, `${waccCalc.costOfDebt}% × (1 − ${waccCalc.taxRateDebt}%)`)}
                    {metricCard("Computed WACC", `${computedWACC.toFixed(2)}%`, `${waccCalc.equityWeight}% Eq + ${waccCalc.debtWeight}% Debt`)}
                    <div className="flex items-end">
                      <Button onClick={applyWACCToDCF} className="w-full h-auto py-3 text-xs gap-1.5">
                        <Target className="h-3.5 w-3.5" /> Apply {computedWACC.toFixed(2)}% to DCF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="border-border/50 lg:col-span-2">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">DCF Output</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {metricCard("Enterprise Value", fmt(dcfResult.enterpriseValue))}
                    {metricCard("Equity Value", fmt(dcfResult.equityValue))}
                    {metricCard("Price / Share", fmt(dcfResult.sharePrice))}
                    {metricCard("PV of FCFs", fmt(dcfResult.totalPV), `${((dcfResult.totalPV / dcfResult.enterpriseValue) * 100).toFixed(0)}% of EV`)}
                    {metricCard("PV of Terminal", fmt(dcfResult.pvTerminal), `${((dcfResult.pvTerminal / dcfResult.enterpriseValue) * 100).toFixed(0)}% of EV`)}
                    {metricCard("Terminal Value", fmt(dcfResult.terminalValue))}
                  </div>

                  {/* FCF Chart */}
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={dcfResult.years}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="year" tickFormatter={v => `Y${v}`} className="text-xs" />
                        <YAxis tickFormatter={v => fmt(v)} className="text-xs" />
                        <RechartsTooltip formatter={(v: number) => fmt(v)} labelFormatter={v => `Year ${v}`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" opacity={0.3} />
                        <Bar dataKey="ebitda" name="EBITDA" fill="hsl(var(--primary))" opacity={0.6} />
                        <Line type="monotone" dataKey="fcf" name="FCF" stroke="hsl(var(--chart-2))" strokeWidth={2} dot />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Projection Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2 font-medium text-muted-foreground">Year</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Revenue</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">EBITDA</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">FCF</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">PV of FCF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dcfResult.years.map(y => (
                          <tr key={y.year} className="border-b border-border/30">
                            <td className="p-2">Year {y.year}</td>
                            <td className="p-2 text-right">{fmt(y.revenue)}</td>
                            <td className="p-2 text-right">{fmt(y.ebitda)}</td>
                            <td className="p-2 text-right">{fmt(y.fcf)}</td>
                            <td className="p-2 text-right">{fmt(y.pvFCF)}</td>
                          </tr>
                        ))}
                        <tr className="font-bold">
                          <td className="p-2">Terminal</td>
                          <td className="p-2 text-right" colSpan={2}></td>
                          <td className="p-2 text-right">{fmt(dcfResult.terminalValue)}</td>
                          <td className="p-2 text-right">{fmt(dcfResult.pvTerminal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Terminal Value Comparison */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Terminal Value Method Comparison — Gordon Growth vs Exit Multiple
                </CardTitle>
                <CardDescription className="text-xs">
                  Gordon Growth: g = {dcf.terminalGrowth}% perpetuity | Exit Multiple: {dcf.exitMultiple}x EV/EBITDA on terminal year
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gordon Side */}
                  <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-muted/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={dcf.terminalMethod === "gordon" ? "default" : "secondary"} className="text-[10px]">
                        {dcf.terminalMethod === "gordon" ? "● Active" : "○ Inactive"}
                      </Badge>
                      <span className="text-sm font-semibold">Gordon Growth Model</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">TV = FCF₁ × (1+g) / (WACC − g)</p>
                    {metricCard("Terminal Value", fmt(tvComparison.gordon.terminalValue), `g = ${dcf.terminalGrowth}%`)}
                    {metricCard("PV of Terminal", fmt(tvComparison.gordon.pvTerminal), `${((tvComparison.gordon.pvTerminal / tvComparison.gordon.enterpriseValue) * 100).toFixed(0)}% of EV`)}
                    {metricCard("Enterprise Value", fmt(tvComparison.gordon.enterpriseValue))}
                    {metricCard("Equity Value", fmt(tvComparison.gordon.equityValue))}
                    {metricCard("Price / Share", fmt(tvComparison.gordon.sharePrice))}
                  </div>

                  {/* Exit Multiple Side */}
                  <div className="space-y-2 p-3 rounded-lg border border-border/50 bg-muted/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={dcf.terminalMethod === "exitMultiple" ? "default" : "secondary"} className="text-[10px]">
                        {dcf.terminalMethod === "exitMultiple" ? "● Active" : "○ Inactive"}
                      </Badge>
                      <span className="text-sm font-semibold">Exit Multiple Method</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">TV = EBITDA_n × Exit Multiple</p>
                    {metricCard("Terminal Value", fmt(tvComparison.exit.terminalValue), `${dcf.exitMultiple}x EBITDA`)}
                    {metricCard("PV of Terminal", fmt(tvComparison.exit.pvTerminal), `${((tvComparison.exit.pvTerminal / tvComparison.exit.enterpriseValue) * 100).toFixed(0)}% of EV`)}
                    {metricCard("Enterprise Value", fmt(tvComparison.exit.enterpriseValue))}
                    {metricCard("Equity Value", fmt(tvComparison.exit.equityValue))}
                    {metricCard("Price / Share", fmt(tvComparison.exit.sharePrice))}
                  </div>
                </div>

                {/* Difference Summary */}
                <div className={`p-3 rounded-lg border ${tvComparison.diff >= 0 ? "border-chart-2/30 bg-chart-2/5" : "border-destructive/30 bg-destructive/5"}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Valuation Difference (Exit Multiple − Gordon Growth)</p>
                      <p className="text-lg font-bold">{tvComparison.diff >= 0 ? "+" : ""}{fmt(tvComparison.diff)} <span className="text-sm font-normal text-muted-foreground">({tvComparison.diffPct >= 0 ? "+" : ""}{tvComparison.diffPct.toFixed(1)}%)</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Implied Exit Multiple from Gordon</p>
                      <p className="text-sm font-semibold">
                        {tvComparison.gordon.years.length > 0
                          ? `${(tvComparison.gordon.terminalValue / (tvComparison.gordon.years[tvComparison.gordon.years.length - 1]?.ebitda || 1)).toFixed(1)}x EV/EBITDA`
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Bar Comparison */}
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { metric: "Terminal Value", gordon: tvComparison.gordon.terminalValue, exit: tvComparison.exit.terminalValue },
                      { metric: "Enterprise Value", gordon: tvComparison.gordon.enterpriseValue, exit: tvComparison.exit.enterpriseValue },
                      { metric: "Equity Value", gordon: tvComparison.gordon.equityValue, exit: tvComparison.exit.equityValue },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="metric" className="text-xs" />
                      <YAxis tickFormatter={v => fmt(v)} className="text-xs" />
                      <RechartsTooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="gordon" name="Gordon Growth" fill="hsl(var(--primary))" opacity={0.7} />
                      <Bar dataKey="exit" name="Exit Multiple" fill="hsl(var(--chart-2))" opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ═══════════════ COMPS TAB ═══════════════ */}
          <TabsContent value="comps" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-border/50 lg:col-span-2">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Comparable Companies</CardTitle>
                  <CardDescription className="text-xs">Edit peer multiples directly</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-2">Company</th>
                          <th className="text-right p-2">EV/EBITDA</th>
                          <th className="text-right p-2">P/E</th>
                          <th className="text-right p-2">P/B</th>
                          <th className="text-right p-2">EV/Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comps.map((c, i) => (
                          <tr key={i} className="border-b border-border/30">
                            <td className="p-1"><Input value={c.name} onChange={e => updateComp(i, "name", e.target.value)} className="h-7 text-xs" /></td>
                            <td className="p-1"><Input type="number" value={c.evEbitda} onChange={e => updateComp(i, "evEbitda", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right" step={0.1} /></td>
                            <td className="p-1"><Input type="number" value={c.peRatio} onChange={e => updateComp(i, "peRatio", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right" step={0.1} /></td>
                            <td className="p-1"><Input type="number" value={c.pbRatio} onChange={e => updateComp(i, "pbRatio", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right" step={0.1} /></td>
                            <td className="p-1"><Input type="number" value={c.evRevenue} onChange={e => updateComp(i, "evRevenue", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right" step={0.1} /></td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-muted/30">
                          <td className="p-2">Average</td>
                          <td className="p-2 text-right">{fmtM(compsResult.avgEvEbitda)}</td>
                          <td className="p-2 text-right">{fmtM(compsResult.avgPE)}</td>
                          <td className="p-2 text-right">{fmtM(compsResult.avgPB)}</td>
                          <td className="p-2 text-right">{fmtM(compsResult.avgEvRev)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setComps(prev => [...prev, { name: `Peer ${prev.length + 1}`, evEbitda: 12, peRatio: 25, pbRatio: 4, evRevenue: 3 }])}>
                    + Add Peer
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">Target Financials & Implied Value</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {numInput("Target EBITDA (₹)", targetEbitda, setTargetEbitda)}
                  {numInput("Target Net Income (₹)", targetEarnings, setTargetEarnings)}
                  {numInput("Target Book Value (₹)", targetBookValue, setTargetBookValue)}
                  {numInput("Target Revenue (₹)", targetRevenue, setTargetRevenue)}
                  <Separator />
                  <div className="space-y-2">
                    {metricCard("EV (EV/EBITDA)", fmt(compsResult.evByEbitda), `${fmtM(compsResult.avgEvEbitda)} avg multiple`)}
                    {metricCard("Equity (P/E)", fmt(compsResult.eqByPE), `${fmtM(compsResult.avgPE)} avg multiple`)}
                    {metricCard("Equity (P/B)", fmt(compsResult.eqByPB), `${fmtM(compsResult.avgPB)} avg multiple`)}
                    {metricCard("EV (EV/Rev)", fmt(compsResult.evByRevenue), `${fmtM(compsResult.avgEvRev)} avg multiple`)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ PRECEDENT TAB ═══════════════ */}
          <TabsContent value="precedent" className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Precedent M&A Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Target</th>
                        <th className="text-left p-2">Acquirer</th>
                        <th className="text-right p-2">EV/EBITDA</th>
                        <th className="text-right p-2">EV/Revenue</th>
                        <th className="text-right p-2">Premium %</th>
                        <th className="text-right p-2">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {precedents.map((p, i) => (
                        <tr key={i} className="border-b border-border/30">
                          <td className="p-1"><Input value={p.target} onChange={e => setPrecedents(prev => prev.map((x, j) => j === i ? { ...x, target: e.target.value } : x))} className="h-7 text-xs" /></td>
                          <td className="p-1"><Input value={p.acquirer} onChange={e => setPrecedents(prev => prev.map((x, j) => j === i ? { ...x, acquirer: e.target.value } : x))} className="h-7 text-xs" /></td>
                          <td className="p-1"><Input type="number" value={p.evEbitda} onChange={e => setPrecedents(prev => prev.map((x, j) => j === i ? { ...x, evEbitda: parseFloat(e.target.value) || 0 } : x))} className="h-7 text-xs text-right" step={0.1} /></td>
                          <td className="p-1"><Input type="number" value={p.evRevenue} onChange={e => setPrecedents(prev => prev.map((x, j) => j === i ? { ...x, evRevenue: parseFloat(e.target.value) || 0 } : x))} className="h-7 text-xs text-right" step={0.1} /></td>
                          <td className="p-1"><Input type="number" value={p.premium} onChange={e => setPrecedents(prev => prev.map((x, j) => j === i ? { ...x, premium: parseFloat(e.target.value) || 0 } : x))} className="h-7 text-xs text-right" step={1} /></td>
                          <td className="p-1"><Input type="number" value={p.year} onChange={e => setPrecedents(prev => prev.map((x, j) => j === i ? { ...x, year: parseInt(e.target.value) || 2024 } : x))} className="h-7 text-xs text-right" /></td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-muted/30">
                        <td className="p-2" colSpan={2}>Average</td>
                        <td className="p-2 text-right">{fmtM(precedentResult.avgEvEbitda)}</td>
                        <td className="p-2 text-right">{fmtM(precedentResult.avgEvRev)}</td>
                        <td className="p-2 text-right">{precedentResult.avgPremium.toFixed(1)}%</td>
                        <td className="p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setPrecedents(prev => [...prev, { target: "NewCo", acquirer: "Buyer", evEbitda: 14, evRevenue: 3, premium: 25, year: 2024 }])}>
                  + Add Deal
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metricCard("Implied EV (EBITDA)", fmt(precedentResult.evByEbitda), `${fmtM(precedentResult.avgEvEbitda)} avg`)}
              {metricCard("Implied EV (Revenue)", fmt(precedentResult.evByRevenue), `${fmtM(precedentResult.avgEvRev)} avg`)}
              {metricCard("Avg Control Premium", `${precedentResult.avgPremium.toFixed(1)}%`, "Over market price")}
            </div>
          </TabsContent>

          {/* ═══════════════ LBO TAB ═══════════════ */}
          <TabsContent value="lbo" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-border/50">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">LBO Assumptions</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  {numInput("Entry EBITDA (₹)", lbo.entryEbitda, v => updateLBO("entryEbitda", v))}
                  {numInput("Entry Multiple", lbo.entryMultiple, v => updateLBO("entryMultiple", v), "x", 0.5)}
                  {numInput("Exit Multiple", lbo.exitMultiple, v => updateLBO("exitMultiple", v), "x", 0.5)}
                  {numInput("Holding Period", lbo.holdingPeriod, v => updateLBO("holdingPeriod", v), "yrs", 1)}
                  {numInput("Debt %", lbo.debtPct, v => updateLBO("debtPct", v), "%", 5)}
                  {numInput("Interest Rate", lbo.interestRate, v => updateLBO("interestRate", v), "%", 0.5)}
                  {numInput("EBITDA Growth", lbo.ebitdaGrowth, v => updateLBO("ebitdaGrowth", v), "%", 1)}
                  {numInput("FCF Conversion", lbo.fcfConversion, v => updateLBO("fcfConversion", v), "%", 5)}
                </CardContent>
              </Card>

              <Card className="border-border/50 lg:col-span-2">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">LBO Returns</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {metricCard("Entry EV", fmt(lboResult.ev))}
                    {metricCard("Equity Invested", fmt(lboResult.equity), `${(100 - lbo.debtPct).toFixed(0)}% of EV`)}
                    {metricCard("Debt", fmt(lboResult.debt), `${lbo.debtPct}% of EV`)}
                    {metricCard("Exit EV", fmt(lboResult.exitEV))}
                    {metricCard("Exit Equity", fmt(lboResult.exitEquity))}
                    {metricCard("MOIC", `${lboResult.moic.toFixed(2)}x`, `IRR: ${lboResult.irr.toFixed(1)}%`)}
                  </div>

                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={lboResult.years}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="year" tickFormatter={v => `Y${v}`} />
                        <YAxis tickFormatter={v => fmt(v)} className="text-xs" />
                        <RechartsTooltip formatter={(v: number) => fmt(v)} />
                        <Legend />
                        <Bar dataKey="ebitda" name="EBITDA" fill="hsl(var(--primary))" opacity={0.5} />
                        <Line type="monotone" dataKey="debtRemaining" name="Debt Outstanding" stroke="hsl(var(--destructive))" strokeWidth={2} />
                        <Line type="monotone" dataKey="fcf" name="FCF (post-interest)" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════════════ ANALYSIS TAB ═══════════════ */}
          <TabsContent value="analysis" className="space-y-6">
            {/* Sensitivity Table */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" /> Sensitivity Analysis — Equity Value by WACC vs Terminal Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-2 text-left bg-muted/30">WACC ↓ \ Tg →</th>
                      {sensitivityTable[0]?.values.map(v => (
                        <th key={v.growth} className={`p-2 text-right ${v.growth === dcf.terminalGrowth ? "bg-primary/10 font-bold" : ""}`}>
                          {v.growth.toFixed(1)}%
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sensitivityTable.map(row => (
                      <tr key={row.wacc} className="border-b border-border/30">
                        <td className={`p-2 font-medium ${row.wacc === dcf.wacc ? "bg-primary/10 font-bold" : "bg-muted/30"}`}>
                          {row.wacc.toFixed(1)}%
                        </td>
                        {row.values.map(v => (
                          <td key={v.growth} className={`p-2 text-right ${row.wacc === dcf.wacc && v.growth === dcf.terminalGrowth ? "bg-primary/20 font-bold text-primary" : ""}`}>
                            {fmt(v.equity)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Scenario Analysis */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Scenario Analysis — Bear / Base / Bull</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="p-2 text-left">Scenario</th>
                        <th className="p-2 text-right">Probability</th>
                        <th className="p-2 text-right">Rev Growth</th>
                        <th className="p-2 text-right">EBITDA Margin</th>
                        <th className="p-2 text-right">WACC</th>
                        <th className="p-2 text-right">Terminal G</th>
                        <th className="p-2 text-right font-bold">Equity Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarioResults.map((s, i) => (
                        <tr key={s.label} className="border-b border-border/30">
                          <td className="p-1"><Badge variant={s.label === "Bear" ? "destructive" : s.label === "Bull" ? "default" : "secondary"} className="text-[10px]">{s.label}</Badge></td>
                          <td className="p-1"><Input type="number" value={s.probability} onChange={e => updateScenario(i, "probability", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right w-16" /></td>
                          <td className="p-1"><Input type="number" value={s.revenueGrowth} onChange={e => updateScenario(i, "revenueGrowth", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right w-16" step={0.5} /></td>
                          <td className="p-1"><Input type="number" value={s.ebitdaMargin} onChange={e => updateScenario(i, "ebitdaMargin", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right w-16" step={0.5} /></td>
                          <td className="p-1"><Input type="number" value={s.wacc} onChange={e => updateScenario(i, "wacc", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right w-16" step={0.25} /></td>
                          <td className="p-1"><Input type="number" value={s.terminalGrowth} onChange={e => updateScenario(i, "terminalGrowth", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right w-16" step={0.25} /></td>
                          <td className="p-2 text-right font-bold">{fmt(s.equityValue)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-primary/10">
                        <td className="p-2" colSpan={6}>Probability-Weighted Value</td>
                        <td className="p-2 text-right text-primary">{fmt(weightedValue)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scenarioResults} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tickFormatter={v => fmt(v)} className="text-xs" />
                      <YAxis dataKey="label" type="category" className="text-xs" width={50} />
                      <RechartsTooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="equityValue" name="Equity Value" fill="hsl(var(--primary))">
                        {scenarioResults.map((s, i) => (
                          <Cell key={i} fill={s.label === "Bear" ? "hsl(var(--destructive))" : s.label === "Bull" ? "hsl(var(--chart-2))" : "hsl(var(--primary))"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monte Carlo */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Monte Carlo Simulation (5,000 iterations)</CardTitle>
                  <Button onClick={handleMonteCarlo} size="sm" disabled={isRunningMC} className="text-xs gap-1.5">
                    <Shuffle className="h-3 w-3" />
                    {isRunningMC ? "Running..." : "Run Simulation"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {monteCarloResults ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {metricCard("P10", fmt(monteCarloResults.p10))}
                      {metricCard("P25", fmt(monteCarloResults.p25))}
                      {metricCard("Median", fmt(monteCarloResults.p50))}
                      {metricCard("Mean", fmt(monteCarloResults.mean))}
                      {metricCard("P75", fmt(monteCarloResults.p75))}
                      {metricCard("P90", fmt(monteCarloResults.p90))}
                    </div>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monteCarloResults.histogram}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="range" interval={4} className="text-[9px]" angle={-30} textAnchor="end" height={50} />
                          <YAxis className="text-xs" />
                          <RechartsTooltip formatter={(v: number) => v} labelFormatter={l => `Equity Value: ${l}`} />
                          <Bar dataKey="count" name="Frequency" fill="hsl(var(--primary))" opacity={0.7} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shuffle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Click "Run Simulation" to generate probabilistic valuation distribution</p>
                    <p className="text-xs mt-1">Varies revenue growth, EBITDA margin, WACC, and terminal growth across 5,000 scenarios</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════ FOOTBALL FIELD / SUMMARY ═══════════════ */}
          <TabsContent value="football" className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Football Field Chart — Valuation Range Summary</CardTitle>
                <CardDescription className="text-xs">Composite view across all methodologies</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={footballData} layout="vertical" barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" tickFormatter={v => fmt(v)} className="text-xs" />
                      <YAxis dataKey="method" type="category" className="text-xs" width={70} />
                      <RechartsTooltip formatter={(v: number) => fmt(v)} />
                      <Legend />
                      <Bar dataKey="low" name="Low" stackId="range" fill="hsl(var(--destructive))" opacity={0.3} />
                      <Bar dataKey="mid" name="Mid" stackId="val" fill="hsl(var(--primary))" opacity={0.8} />
                      <Bar dataKey="high" name="High" stackId="range2" fill="hsl(var(--chart-2))" opacity={0.3} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Table */}
            <Card className="border-border/50">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Valuation Summary — {dcf.companyName}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-medium">Method</th>
                        <th className="text-right p-3 font-medium">Low</th>
                        <th className="text-right p-3 font-medium text-primary">Mid / Base</th>
                        <th className="text-right p-3 font-medium">High</th>
                      </tr>
                    </thead>
                    <tbody>
                      {footballData.map(row => (
                        <tr key={row.method} className="border-b border-border/30">
                          <td className="p-3 font-medium">{row.method}</td>
                          <td className="p-3 text-right text-muted-foreground">{fmt(row.low)}</td>
                          <td className="p-3 text-right font-bold text-primary">{fmt(row.mid)}</td>
                          <td className="p-3 text-right text-muted-foreground">{fmt(row.high)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {monteCarloResults && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Monte Carlo Range (P10–P90)</p>
                    <p className="text-sm font-bold">{fmt(monteCarloResults.p10)} — {fmt(monteCarloResults.p90)}</p>
                    <p className="text-xs text-muted-foreground">Median: {fmt(monteCarloResults.p50)} | Mean: {fmt(monteCarloResults.mean)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessValuation;
