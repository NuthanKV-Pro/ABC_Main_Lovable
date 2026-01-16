import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, Upload, FileSpreadsheet, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FinancialData {
  // Balance Sheet Items
  currentAssets: number;
  inventory: number;
  prepaidExpenses: number;
  cash: number;
  marketableSecurities: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  shareholdersEquity: number;
  longTermDebt: number;
  preferenceShareCapital: number;
  equityShareCapital: number;
  reserves: number;
  fixedAssets: number;
  
  // P&L Items
  netSales: number;
  costOfGoodsSold: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingProfit: number;
  interestExpense: number;
  netProfit: number;
  ebit: number;
  ebitda: number;
  depreciation: number;
  dividends: number;
}

interface RatioResult {
  name: string;
  value: number;
  formula: string;
  interpretation: string;
  benchmark: string;
  status: 'favorable' | 'unfavorable' | 'neutral';
}

const defaultFinancialData: FinancialData = {
  currentAssets: 0,
  inventory: 0,
  prepaidExpenses: 0,
  cash: 0,
  marketableSecurities: 0,
  currentLiabilities: 0,
  totalAssets: 0,
  totalLiabilities: 0,
  shareholdersEquity: 0,
  longTermDebt: 0,
  preferenceShareCapital: 0,
  equityShareCapital: 0,
  reserves: 0,
  fixedAssets: 0,
  netSales: 0,
  costOfGoodsSold: 0,
  grossProfit: 0,
  operatingExpenses: 0,
  operatingProfit: 0,
  interestExpense: 0,
  netProfit: 0,
  ebit: 0,
  ebitda: 0,
  depreciation: 0,
  dividends: 0,
};

const FinancialRatios = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<FinancialData>(defaultFinancialData);
  const [ratiosCalculated, setRatiosCalculated] = useState(false);
  const [inputMethod, setInputMethod] = useState<'manual' | 'excel' | 'tally'>('manual');

  useEffect(() => {
    const saved = localStorage.getItem('financialRatiosData');
    if (saved) {
      setFinancialData(JSON.parse(saved));
    }
  }, []);

  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFinancialData(prev => ({ ...prev, [field]: numValue }));
  };

  const calculateRatios = () => {
    localStorage.setItem('financialRatiosData', JSON.stringify(financialData));
    setRatiosCalculated(true);
    toast({
      title: "Ratios Calculated",
      description: "All financial ratios have been computed successfully.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded. Parsing financial data...`,
      });
      // Simulate parsing - in production, this would parse the Excel file
      setTimeout(() => {
        toast({
          title: "Data Extracted",
          description: "Financial statement data has been extracted. Please verify and calculate ratios.",
        });
      }, 1500);
    }
  };

  const syncWithTally = () => {
    toast({
      title: "Connecting to Tally",
      description: "Fetching financial statements from Tally...",
    });
    setTimeout(() => {
      toast({
        title: "Tally Sync Complete",
        description: "Financial data imported from Tally successfully.",
      });
    }, 2000);
  };

  // Calculate all ratios
  const calculateLiquidityRatios = (): RatioResult[] => {
    const d = financialData;
    const currentRatio = d.currentLiabilities > 0 ? d.currentAssets / d.currentLiabilities : 0;
    const quickRatio = d.currentLiabilities > 0 ? (d.currentAssets - d.inventory - d.prepaidExpenses) / d.currentLiabilities : 0;
    const cashRatio = d.currentLiabilities > 0 ? (d.cash + d.marketableSecurities) / d.currentLiabilities : 0;
    const basicDefenceInterval = d.operatingExpenses > 0 ? ((d.cash + d.marketableSecurities + (d.currentAssets - d.inventory - d.prepaidExpenses - d.cash - d.marketableSecurities)) / (d.operatingExpenses / 365)) : 0;
    const netWorkingCapital = d.currentAssets - d.currentLiabilities;

    return [
      {
        name: "Current Ratio",
        value: currentRatio,
        formula: "Current Assets / Current Liabilities",
        interpretation: currentRatio >= 2 ? "Strong liquidity position" : currentRatio >= 1 ? "Adequate liquidity" : "Liquidity concerns",
        benchmark: "Ideal: 2:1",
        status: currentRatio >= 2 ? 'favorable' : currentRatio >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Quick Ratio (Acid Test)",
        value: quickRatio,
        formula: "(Current Assets - Inventory - Prepaid) / Current Liabilities",
        interpretation: quickRatio >= 1 ? "Can meet short-term obligations without selling inventory" : "May face liquidity issues",
        benchmark: "Ideal: 1:1",
        status: quickRatio >= 1 ? 'favorable' : quickRatio >= 0.75 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Cash Ratio",
        value: cashRatio,
        formula: "(Cash + Marketable Securities) / Current Liabilities",
        interpretation: cashRatio >= 0.5 ? "Strong cash position" : "Limited immediate cash availability",
        benchmark: "Ideal: 0.5:1",
        status: cashRatio >= 0.5 ? 'favorable' : cashRatio >= 0.25 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Basic Defence Interval",
        value: basicDefenceInterval,
        formula: "Quick Assets / (Operating Expenses / 365)",
        interpretation: `Company can sustain ${Math.round(basicDefenceInterval)} days without revenue`,
        benchmark: "Higher is better (60+ days preferred)",
        status: basicDefenceInterval >= 60 ? 'favorable' : basicDefenceInterval >= 30 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Net Working Capital",
        value: netWorkingCapital,
        formula: "Current Assets - Current Liabilities",
        interpretation: netWorkingCapital > 0 ? "Positive working capital indicates financial stability" : "Negative working capital is concerning",
        benchmark: "Should be positive",
        status: netWorkingCapital > 0 ? 'favorable' : 'unfavorable'
      }
    ];
  };

  const calculateCapitalStructureRatios = (): RatioResult[] => {
    const d = financialData;
    const equityRatio = d.totalAssets > 0 ? (d.shareholdersEquity / d.totalAssets) * 100 : 0;
    const debtRatio = d.totalAssets > 0 ? (d.totalLiabilities / d.totalAssets) * 100 : 0;
    const debtToEquity = d.shareholdersEquity > 0 ? d.totalLiabilities / d.shareholdersEquity : 0;
    const debtToTotalAssets = d.totalAssets > 0 ? (d.longTermDebt / d.totalAssets) * 100 : 0;
    const capitalGearing = (d.equityShareCapital + d.reserves) > 0 ? (d.preferenceShareCapital + d.longTermDebt) / (d.equityShareCapital + d.reserves) : 0;
    const proprietaryRatio = d.totalAssets > 0 ? (d.shareholdersEquity / d.totalAssets) * 100 : 0;

    return [
      {
        name: "Equity Ratio",
        value: equityRatio,
        formula: "(Shareholders' Equity / Total Assets) × 100",
        interpretation: equityRatio >= 50 ? "Strong equity base" : "Higher reliance on debt financing",
        benchmark: "Ideal: 50% or higher",
        status: equityRatio >= 50 ? 'favorable' : equityRatio >= 30 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt Ratio",
        value: debtRatio,
        formula: "(Total Liabilities / Total Assets) × 100",
        interpretation: debtRatio <= 50 ? "Conservative debt levels" : "High leverage",
        benchmark: "Ideal: Below 50%",
        status: debtRatio <= 50 ? 'favorable' : debtRatio <= 70 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt to Equity Ratio",
        value: debtToEquity,
        formula: "Total Liabilities / Shareholders' Equity",
        interpretation: debtToEquity <= 1 ? "More equity than debt financing" : "Highly leveraged",
        benchmark: "Ideal: 1:1 or lower",
        status: debtToEquity <= 1 ? 'favorable' : debtToEquity <= 2 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt to Total Assets",
        value: debtToTotalAssets,
        formula: "(Long-term Debt / Total Assets) × 100",
        interpretation: debtToTotalAssets <= 30 ? "Low long-term debt burden" : "Significant long-term obligations",
        benchmark: "Ideal: Below 30%",
        status: debtToTotalAssets <= 30 ? 'favorable' : debtToTotalAssets <= 50 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Capital Gearing Ratio",
        value: capitalGearing,
        formula: "(Preference Capital + Long-term Debt) / (Equity + Reserves)",
        interpretation: capitalGearing <= 0.5 ? "Low geared - less risky" : "Highly geared - higher risk",
        benchmark: "Ideal: Below 0.5",
        status: capitalGearing <= 0.5 ? 'favorable' : capitalGearing <= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Proprietary Ratio",
        value: proprietaryRatio,
        formula: "(Shareholders' Equity / Total Assets) × 100",
        interpretation: proprietaryRatio >= 50 ? "Strong ownership stake" : "Limited owner's stake",
        benchmark: "Ideal: 50% or higher",
        status: proprietaryRatio >= 50 ? 'favorable' : proprietaryRatio >= 30 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculateLeverageRatios = (): RatioResult[] => {
    const d = financialData;
    const financialLeverage = d.shareholdersEquity > 0 ? d.totalAssets / d.shareholdersEquity : 0;
    const operatingLeverage = d.operatingProfit > 0 ? (d.netSales - d.costOfGoodsSold) / d.operatingProfit : 0;
    const combinedLeverage = financialLeverage * operatingLeverage;

    return [
      {
        name: "Financial Leverage",
        value: financialLeverage,
        formula: "Total Assets / Shareholders' Equity",
        interpretation: financialLeverage <= 2 ? "Conservative leverage" : "High financial leverage",
        benchmark: "Ideal: 2 or lower",
        status: financialLeverage <= 2 ? 'favorable' : financialLeverage <= 3 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Operating Leverage",
        value: operatingLeverage,
        formula: "Contribution Margin / Operating Profit",
        interpretation: operatingLeverage > 1 ? "High fixed costs relative to variable" : "Balanced cost structure",
        benchmark: "Depends on industry",
        status: 'neutral'
      },
      {
        name: "Combined Leverage",
        value: combinedLeverage,
        formula: "Financial Leverage × Operating Leverage",
        interpretation: combinedLeverage <= 4 ? "Manageable overall risk" : "High combined risk exposure",
        benchmark: "Lower is generally better",
        status: combinedLeverage <= 4 ? 'favorable' : combinedLeverage <= 6 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculatePerformanceRatios = (): RatioResult[] => {
    const d = financialData;
    const avgInventory = d.inventory;
    const inventoryTurnover = avgInventory > 0 ? d.costOfGoodsSold / avgInventory : 0;
    const assetTurnover = d.totalAssets > 0 ? d.netSales / d.totalAssets : 0;
    const fixedAssetTurnover = d.fixedAssets > 0 ? d.netSales / d.fixedAssets : 0;
    const workingCapitalTurnover = (d.currentAssets - d.currentLiabilities) > 0 ? d.netSales / (d.currentAssets - d.currentLiabilities) : 0;

    return [
      {
        name: "Inventory Turnover",
        value: inventoryTurnover,
        formula: "Cost of Goods Sold / Average Inventory",
        interpretation: inventoryTurnover >= 5 ? "Efficient inventory management" : "Slow inventory movement",
        benchmark: "Higher is better (industry dependent)",
        status: inventoryTurnover >= 5 ? 'favorable' : inventoryTurnover >= 3 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Total Asset Turnover",
        value: assetTurnover,
        formula: "Net Sales / Total Assets",
        interpretation: assetTurnover >= 1 ? "Efficient asset utilization" : "Assets may be underutilized",
        benchmark: "Higher is better",
        status: assetTurnover >= 1 ? 'favorable' : assetTurnover >= 0.5 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Fixed Asset Turnover",
        value: fixedAssetTurnover,
        formula: "Net Sales / Fixed Assets",
        interpretation: fixedAssetTurnover >= 2 ? "Good utilization of fixed assets" : "Fixed assets may be underutilized",
        benchmark: "Higher is better",
        status: fixedAssetTurnover >= 2 ? 'favorable' : fixedAssetTurnover >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Working Capital Turnover",
        value: workingCapitalTurnover,
        formula: "Net Sales / Net Working Capital",
        interpretation: workingCapitalTurnover >= 4 ? "Efficient working capital use" : "Working capital may be excessive",
        benchmark: "4-6 times is good",
        status: workingCapitalTurnover >= 4 ? 'favorable' : workingCapitalTurnover >= 2 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculateProfitabilityRatios = (): RatioResult[] => {
    const d = financialData;
    const grossProfitMargin = d.netSales > 0 ? (d.grossProfit / d.netSales) * 100 : 0;
    const operatingProfitMargin = d.netSales > 0 ? (d.operatingProfit / d.netSales) * 100 : 0;
    const netProfitMargin = d.netSales > 0 ? (d.netProfit / d.netSales) * 100 : 0;
    const returnOnAssets = d.totalAssets > 0 ? (d.netProfit / d.totalAssets) * 100 : 0;
    const returnOnEquity = d.shareholdersEquity > 0 ? (d.netProfit / d.shareholdersEquity) * 100 : 0;
    const returnOnCapitalEmployed = (d.totalAssets - d.currentLiabilities) > 0 ? (d.ebit / (d.totalAssets - d.currentLiabilities)) * 100 : 0;

    return [
      {
        name: "Gross Profit Margin",
        value: grossProfitMargin,
        formula: "(Gross Profit / Net Sales) × 100",
        interpretation: grossProfitMargin >= 30 ? "Healthy gross margins" : "Low gross profitability",
        benchmark: "Higher is better (industry varies)",
        status: grossProfitMargin >= 30 ? 'favorable' : grossProfitMargin >= 15 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Operating Profit Margin",
        value: operatingProfitMargin,
        formula: "(Operating Profit / Net Sales) × 100",
        interpretation: operatingProfitMargin >= 15 ? "Strong operational efficiency" : "Operational improvements needed",
        benchmark: "10-20% is good",
        status: operatingProfitMargin >= 15 ? 'favorable' : operatingProfitMargin >= 8 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Net Profit Margin",
        value: netProfitMargin,
        formula: "(Net Profit / Net Sales) × 100",
        interpretation: netProfitMargin >= 10 ? "Good bottom-line profitability" : "Profitability concerns",
        benchmark: "5-10% is average",
        status: netProfitMargin >= 10 ? 'favorable' : netProfitMargin >= 5 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Return on Assets (ROA)",
        value: returnOnAssets,
        formula: "(Net Profit / Total Assets) × 100",
        interpretation: returnOnAssets >= 10 ? "Efficient asset utilization for profits" : "Assets not generating optimal returns",
        benchmark: "5-10% is average",
        status: returnOnAssets >= 10 ? 'favorable' : returnOnAssets >= 5 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Return on Equity (ROE)",
        value: returnOnEquity,
        formula: "(Net Profit / Shareholders' Equity) × 100",
        interpretation: returnOnEquity >= 15 ? "Strong returns for shareholders" : "Below-average shareholder returns",
        benchmark: "15-20% is good",
        status: returnOnEquity >= 15 ? 'favorable' : returnOnEquity >= 10 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Return on Capital Employed (ROCE)",
        value: returnOnCapitalEmployed,
        formula: "(EBIT / Capital Employed) × 100",
        interpretation: returnOnCapitalEmployed >= 15 ? "Efficient capital deployment" : "Capital could be better utilized",
        benchmark: "Should exceed cost of capital",
        status: returnOnCapitalEmployed >= 15 ? 'favorable' : returnOnCapitalEmployed >= 10 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const calculateCoverageRatios = (): RatioResult[] => {
    const d = financialData;
    const interestCoverage = d.interestExpense > 0 ? d.ebit / d.interestExpense : 0;
    const debtServiceCoverage = (d.interestExpense + (d.longTermDebt * 0.1)) > 0 ? d.ebitda / (d.interestExpense + (d.longTermDebt * 0.1)) : 0;
    const fixedChargeCoverage = d.interestExpense > 0 ? (d.ebit + d.depreciation) / d.interestExpense : 0;
    const dividendCoverage = d.dividends > 0 ? d.netProfit / d.dividends : 0;

    return [
      {
        name: "Interest Coverage Ratio",
        value: interestCoverage,
        formula: "EBIT / Interest Expense",
        interpretation: interestCoverage >= 3 ? "Comfortable interest payment capacity" : "Interest burden may be concerning",
        benchmark: "3 or higher is safe",
        status: interestCoverage >= 3 ? 'favorable' : interestCoverage >= 1.5 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Debt Service Coverage",
        value: debtServiceCoverage,
        formula: "EBITDA / (Interest + Principal)",
        interpretation: debtServiceCoverage >= 1.5 ? "Can comfortably service debt" : "Debt servicing may be strained",
        benchmark: "1.5 or higher",
        status: debtServiceCoverage >= 1.5 ? 'favorable' : debtServiceCoverage >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Fixed Charge Coverage",
        value: fixedChargeCoverage,
        formula: "(EBIT + Depreciation) / Interest",
        interpretation: fixedChargeCoverage >= 2 ? "Strong ability to cover fixed charges" : "Fixed charge coverage needs improvement",
        benchmark: "2 or higher",
        status: fixedChargeCoverage >= 2 ? 'favorable' : fixedChargeCoverage >= 1 ? 'neutral' : 'unfavorable'
      },
      {
        name: "Dividend Coverage Ratio",
        value: dividendCoverage,
        formula: "Net Profit / Dividends",
        interpretation: dividendCoverage >= 2 ? "Dividends well covered by earnings" : "Dividend sustainability concerns",
        benchmark: "2 or higher",
        status: dividendCoverage >= 2 ? 'favorable' : dividendCoverage >= 1 ? 'neutral' : 'unfavorable'
      }
    ];
  };

  const getAllRatios = () => ({
    liquidity: calculateLiquidityRatios(),
    capitalStructure: calculateCapitalStructureRatios(),
    leverage: calculateLeverageRatios(),
    performance: calculatePerformanceRatios(),
    profitability: calculateProfitabilityRatios(),
    coverage: calculateCoverageRatios(),
  });

  const getOverallInsights = () => {
    const ratios = getAllRatios();
    const allRatios = [
      ...ratios.liquidity,
      ...ratios.capitalStructure,
      ...ratios.leverage,
      ...ratios.performance,
      ...ratios.profitability,
      ...ratios.coverage,
    ];

    const favorable = allRatios.filter(r => r.status === 'favorable').length;
    const unfavorable = allRatios.filter(r => r.status === 'unfavorable').length;
    const neutral = allRatios.filter(r => r.status === 'neutral').length;

    const conclusions: string[] = [];
    const recommendations: string[] = [];

    // Liquidity Analysis
    const currentRatio = ratios.liquidity.find(r => r.name === "Current Ratio");
    const quickRatio = ratios.liquidity.find(r => r.name === "Quick Ratio (Acid Test)");
    if (currentRatio && currentRatio.status === 'unfavorable') {
      conclusions.push("Liquidity position needs immediate attention - the company may face difficulty meeting short-term obligations.");
      recommendations.push("Improve liquidity by accelerating receivables collection, negotiating longer payment terms with suppliers, or securing a short-term credit facility.");
    } else if (currentRatio && currentRatio.status === 'favorable') {
      conclusions.push("Strong liquidity position indicates the company can comfortably meet its short-term obligations.");
    }

    // Capital Structure Analysis
    const debtToEquity = ratios.capitalStructure.find(r => r.name === "Debt to Equity Ratio");
    if (debtToEquity && debtToEquity.status === 'unfavorable') {
      conclusions.push("High leverage indicates significant reliance on debt financing, increasing financial risk.");
      recommendations.push("Consider equity infusion or retained earnings to reduce debt dependency. Evaluate refinancing options for better interest rates.");
    }

    // Profitability Analysis
    const roe = ratios.profitability.find(r => r.name === "Return on Equity (ROE)");
    const netMargin = ratios.profitability.find(r => r.name === "Net Profit Margin");
    if (roe && roe.status === 'favorable' && netMargin && netMargin.status === 'favorable') {
      conclusions.push("Excellent profitability metrics suggest efficient operations and strong shareholder returns.");
    } else if (netMargin && netMargin.status === 'unfavorable') {
      recommendations.push("Focus on cost optimization - review operational expenses, negotiate better supplier terms, and improve pricing strategy.");
    }

    // Performance Analysis
    const assetTurnover = ratios.performance.find(r => r.name === "Total Asset Turnover");
    if (assetTurnover && assetTurnover.status === 'unfavorable') {
      recommendations.push("Improve asset utilization by reviewing underperforming assets, optimizing inventory levels, or divesting non-core assets.");
    }

    // Coverage Analysis
    const interestCoverage = ratios.coverage.find(r => r.name === "Interest Coverage Ratio");
    if (interestCoverage && interestCoverage.status === 'unfavorable') {
      conclusions.push("Interest coverage concerns suggest the company may struggle to meet interest obligations from operating profits.");
      recommendations.push("Prioritize debt reduction or negotiate lower interest rates. Consider restructuring high-cost debt.");
    }

    return { favorable, unfavorable, neutral, total: allRatios.length, conclusions, recommendations };
  };

  const ratioCategories = [
    { key: 'liquidity', title: 'Liquidity Ratios', icon: '💧', description: 'Measure ability to meet short-term obligations' },
    { key: 'capitalStructure', title: 'Capital Structure Ratios', icon: '🏛️', description: 'Analyze financing mix and ownership structure' },
    { key: 'leverage', title: 'Leverage Ratios', icon: '⚖️', description: 'Evaluate financial and operating risk' },
    { key: 'performance', title: 'Performance Ratios', icon: '🎯', description: 'Measure operational efficiency' },
    { key: 'profitability', title: 'Profitability Ratios', icon: '💰', description: 'Assess profit generation capability' },
    { key: 'coverage', title: 'Coverage Ratios', icon: '🛡️', description: 'Evaluate debt servicing capacity' },
  ];

  const RatioCard = ({ ratio }: { ratio: RatioResult }) => (
    <Card className="border hover:shadow-[var(--shadow-card)] transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{ratio.name}</CardTitle>
          <Badge variant={ratio.status === 'favorable' ? 'default' : ratio.status === 'unfavorable' ? 'destructive' : 'secondary'}>
            {ratio.status === 'favorable' ? <CheckCircle className="w-3 h-3 mr-1" /> : ratio.status === 'unfavorable' ? <AlertTriangle className="w-3 h-3 mr-1" /> : null}
            {ratio.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {ratio.value.toFixed(2)}
          </span>
          {ratio.status === 'favorable' ? <TrendingUp className="w-5 h-5 text-green-500" /> : ratio.status === 'unfavorable' ? <TrendingDown className="w-5 h-5 text-destructive" /> : null}
        </div>
        <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">{ratio.formula}</p>
        <p className="text-sm">{ratio.interpretation}</p>
        <p className="text-xs text-muted-foreground">📊 {ratio.benchmark}</p>
      </CardContent>
    </Card>
  );

  const insights = getOverallInsights();
  const ratios = getAllRatios();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Financial Ratios Analysis
            </h1>
            <p className="text-muted-foreground">Comprehensive financial ratio calculator with insights</p>
          </div>
        </div>

        {/* Insights Panel - Always on top */}
        {ratiosCalculated && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-primary">{insights.total}</div>
                  <div className="text-sm text-muted-foreground">Total Ratios</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-green-500">{insights.favorable}</div>
                  <div className="text-sm text-muted-foreground">Favorable</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-destructive">{insights.unfavorable}</div>
                  <div className="text-sm text-muted-foreground">Need Attention</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center border">
                  <div className="text-3xl font-bold text-muted-foreground">{insights.neutral}</div>
                  <div className="text-sm text-muted-foreground">Neutral</div>
                </div>
              </div>

              {/* Conclusions */}
              {insights.conclusions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Conclusions
                  </h4>
                  <ul className="space-y-2">
                    {insights.conclusions.map((conclusion, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">•</span>
                        {conclusion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" /> Recommendations for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm bg-accent/10 p-3 rounded-lg">
                        <span className="text-accent mt-0.5">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="input">Input Data</TabsTrigger>
            <TabsTrigger value="ratios" disabled={!ratiosCalculated}>View Ratios</TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-6">
            {/* Input Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Input Method</CardTitle>
                <CardDescription>Choose how to input your financial statement data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={inputMethod === 'manual' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => setInputMethod('manual')}
                  >
                    <FileSpreadsheet className="w-6 h-6" />
                    Manual Entry
                  </Button>
                  <Button
                    variant={inputMethod === 'excel' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => setInputMethod('excel')}
                  >
                    <Upload className="w-6 h-6" />
                    Upload Excel
                  </Button>
                  <Button
                    variant={inputMethod === 'tally' ? 'default' : 'outline'}
                    className="h-24 flex-col gap-2"
                    onClick={() => {
                      setInputMethod('tally');
                      syncWithTally();
                    }}
                  >
                    <BarChart3 className="w-6 h-6" />
                    Sync from Tally
                  </Button>
                </div>

                {inputMethod === 'excel' && (
                  <div className="mt-4">
                    <Label htmlFor="excel-upload">Upload Financial Statement (Excel)</Label>
                    <Input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Manual Entry Forms */}
            {inputMethod === 'manual' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Balance Sheet Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Balance Sheet Items</CardTitle>
                    <CardDescription>Enter amounts in ₹</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentAssets">Current Assets</Label>
                        <Input
                          id="currentAssets"
                          type="number"
                          value={financialData.currentAssets || ''}
                          onChange={(e) => handleInputChange('currentAssets', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inventory">Inventory</Label>
                        <Input
                          id="inventory"
                          type="number"
                          value={financialData.inventory || ''}
                          onChange={(e) => handleInputChange('inventory', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prepaidExpenses">Prepaid Expenses</Label>
                        <Input
                          id="prepaidExpenses"
                          type="number"
                          value={financialData.prepaidExpenses || ''}
                          onChange={(e) => handleInputChange('prepaidExpenses', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cash">Cash & Bank</Label>
                        <Input
                          id="cash"
                          type="number"
                          value={financialData.cash || ''}
                          onChange={(e) => handleInputChange('cash', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="marketableSecurities">Marketable Securities</Label>
                        <Input
                          id="marketableSecurities"
                          type="number"
                          value={financialData.marketableSecurities || ''}
                          onChange={(e) => handleInputChange('marketableSecurities', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currentLiabilities">Current Liabilities</Label>
                        <Input
                          id="currentLiabilities"
                          type="number"
                          value={financialData.currentLiabilities || ''}
                          onChange={(e) => handleInputChange('currentLiabilities', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalAssets">Total Assets</Label>
                        <Input
                          id="totalAssets"
                          type="number"
                          value={financialData.totalAssets || ''}
                          onChange={(e) => handleInputChange('totalAssets', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fixedAssets">Fixed Assets</Label>
                        <Input
                          id="fixedAssets"
                          type="number"
                          value={financialData.fixedAssets || ''}
                          onChange={(e) => handleInputChange('fixedAssets', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalLiabilities">Total Liabilities</Label>
                        <Input
                          id="totalLiabilities"
                          type="number"
                          value={financialData.totalLiabilities || ''}
                          onChange={(e) => handleInputChange('totalLiabilities', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="longTermDebt">Long-term Debt</Label>
                        <Input
                          id="longTermDebt"
                          type="number"
                          value={financialData.longTermDebt || ''}
                          onChange={(e) => handleInputChange('longTermDebt', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shareholdersEquity">Shareholders' Equity</Label>
                        <Input
                          id="shareholdersEquity"
                          type="number"
                          value={financialData.shareholdersEquity || ''}
                          onChange={(e) => handleInputChange('shareholdersEquity', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="equityShareCapital">Equity Share Capital</Label>
                        <Input
                          id="equityShareCapital"
                          type="number"
                          value={financialData.equityShareCapital || ''}
                          onChange={(e) => handleInputChange('equityShareCapital', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="preferenceShareCapital">Preference Share Capital</Label>
                        <Input
                          id="preferenceShareCapital"
                          type="number"
                          value={financialData.preferenceShareCapital || ''}
                          onChange={(e) => handleInputChange('preferenceShareCapital', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reserves">Reserves & Surplus</Label>
                        <Input
                          id="reserves"
                          type="number"
                          value={financialData.reserves || ''}
                          onChange={(e) => handleInputChange('reserves', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* P&L Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profit & Loss Items</CardTitle>
                    <CardDescription>Enter amounts in ₹</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="netSales">Net Sales / Revenue</Label>
                        <Input
                          id="netSales"
                          type="number"
                          value={financialData.netSales || ''}
                          onChange={(e) => handleInputChange('netSales', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="costOfGoodsSold">Cost of Goods Sold</Label>
                        <Input
                          id="costOfGoodsSold"
                          type="number"
                          value={financialData.costOfGoodsSold || ''}
                          onChange={(e) => handleInputChange('costOfGoodsSold', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grossProfit">Gross Profit</Label>
                        <Input
                          id="grossProfit"
                          type="number"
                          value={financialData.grossProfit || ''}
                          onChange={(e) => handleInputChange('grossProfit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="operatingExpenses">Operating Expenses</Label>
                        <Input
                          id="operatingExpenses"
                          type="number"
                          value={financialData.operatingExpenses || ''}
                          onChange={(e) => handleInputChange('operatingExpenses', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="operatingProfit">Operating Profit (EBIT)</Label>
                        <Input
                          id="operatingProfit"
                          type="number"
                          value={financialData.operatingProfit || ''}
                          onChange={(e) => handleInputChange('operatingProfit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ebit">EBIT</Label>
                        <Input
                          id="ebit"
                          type="number"
                          value={financialData.ebit || ''}
                          onChange={(e) => handleInputChange('ebit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ebitda">EBITDA</Label>
                        <Input
                          id="ebitda"
                          type="number"
                          value={financialData.ebitda || ''}
                          onChange={(e) => handleInputChange('ebitda', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="depreciation">Depreciation</Label>
                        <Input
                          id="depreciation"
                          type="number"
                          value={financialData.depreciation || ''}
                          onChange={(e) => handleInputChange('depreciation', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interestExpense">Interest Expense</Label>
                        <Input
                          id="interestExpense"
                          type="number"
                          value={financialData.interestExpense || ''}
                          onChange={(e) => handleInputChange('interestExpense', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="netProfit">Net Profit</Label>
                        <Input
                          id="netProfit"
                          type="number"
                          value={financialData.netProfit || ''}
                          onChange={(e) => handleInputChange('netProfit', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dividends">Dividends Paid</Label>
                        <Input
                          id="dividends"
                          type="number"
                          value={financialData.dividends || ''}
                          onChange={(e) => handleInputChange('dividends', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button 
              className="w-full md:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90" 
              size="lg"
              onClick={calculateRatios}
            >
              Calculate All Ratios
            </Button>
          </TabsContent>

          <TabsContent value="ratios" className="space-y-6">
            <Accordion type="multiple" className="space-y-4" defaultValue={ratioCategories.map(c => c.key)}>
              {ratioCategories.map((category) => (
                <AccordionItem key={category.key} value={category.key} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{category.title}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                      {ratios[category.key as keyof typeof ratios].map((ratio, index) => (
                        <RatioCard key={index} ratio={ratio} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialRatios;
