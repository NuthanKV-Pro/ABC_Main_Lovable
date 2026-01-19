import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Info, TrendingUp, Lightbulb, Scale, Percent, IndianRupee, BookOpen, AlertTriangle, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const DividendDecisionTool = () => {
  const navigate = useNavigate();
  
  // Company Financial Details
  const [earnings, setEarnings] = useState<number>(10000000); // EPS or Total Earnings
  const [currentDividend, setCurrentDividend] = useState<number>(4000000);
  const [retainedEarnings, setRetainedEarnings] = useState<number>(6000000);
  const [numberOfShares, setNumberOfShares] = useState<number>(100000);
  const [marketPrice, setMarketPrice] = useState<number>(250);
  
  // Cost of Capital
  const [costOfEquity, setCostOfEquity] = useState<number>(15);
  const [returnOnInvestment, setReturnOnInvestment] = useState<number>(18);
  
  // Gordon's Model Inputs
  const [growthRate, setGrowthRate] = useState<number>(8);
  
  // Walter's Model Inputs
  const [expectedReturn, setExpectedReturn] = useState<number>(20);
  
  // Lintner's Model Inputs
  const [targetPayoutRatio, setTargetPayoutRatio] = useState<number>(40);
  const [adjustmentFactor, setAdjustmentFactor] = useState<number>(0.5);
  const [previousDividend, setPreviousDividend] = useState<number>(3500000);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate per share values
  const eps = earnings / numberOfShares;
  const dps = currentDividend / numberOfShares;
  const retentionRatio = (earnings - currentDividend) / earnings;
  const payoutRatio = currentDividend / earnings;

  // ========== DIVIDEND THEORIES CALCULATIONS ==========

  // 1. WALTER'S MODEL
  // P = (D + (r/Ke) * (E - D)) / Ke
  // Where: P = Market Price, D = Dividend, r = Return on Investment, Ke = Cost of Equity, E = Earnings
  const walterPrice = () => {
    const r = expectedReturn / 100;
    const ke = costOfEquity / 100;
    const d = dps;
    const e = eps;
    return (d + (r / ke) * (e - d)) / ke;
  };

  const walterOptimalDividend = () => {
    const r = expectedReturn / 100;
    const ke = costOfEquity / 100;
    // If r > ke: Retain all earnings (D = 0)
    // If r < ke: Distribute all earnings (D = E)
    // If r = ke: Indifferent
    if (r > ke) return 0;
    if (r < ke) return eps;
    return dps; // Current dividend if indifferent
  };

  // 2. GORDON'S MODEL (Dividend Growth Model)
  // P0 = D1 / (Ke - g)
  // Where: D1 = Expected Dividend, g = Growth Rate
  const gordonPrice = () => {
    const d1 = dps * (1 + growthRate / 100);
    const ke = costOfEquity / 100;
    const g = growthRate / 100;
    if (ke <= g) return Infinity;
    return d1 / (ke - g);
  };

  const gordonDividendYield = () => {
    const price = gordonPrice();
    if (price === Infinity || price === 0) return 0;
    return (dps / price) * 100;
  };

  // 3. MODIGLIANI-MILLER IRRELEVANCE THEORY
  // Value of firm is independent of dividend policy
  // P0 = (D1 + P1) / (1 + Ke)
  const mmValue = () => {
    // Assumes value is based on investment decisions, not dividend
    const ke = costOfEquity / 100;
    const totalValue = earnings / ke; // Capitalized earnings
    return totalValue / numberOfShares;
  };

  // 4. LINTNER'S MODEL
  // Dt = Dt-1 + α(τEt - Dt-1)
  // Where: α = adjustment factor, τ = target payout ratio
  const lintnerDividend = () => {
    const targetDividend = earnings * (targetPayoutRatio / 100);
    const newDividend = previousDividend + adjustmentFactor * (targetDividend - previousDividend);
    return newDividend;
  };

  // 5. RESIDUAL DIVIDEND MODEL
  // Dividend = Earnings - Retained earnings for investment
  const residualDividend = () => {
    // Assume company needs certain amount for investment
    const investmentNeeds = earnings * retentionRatio;
    return Math.max(0, earnings - investmentNeeds);
  };

  // 6. BIRD-IN-HAND THEORY (Gordon & Lintner)
  // Investors prefer certain dividends over uncertain capital gains
  // Higher dividend = Higher stock price due to lower risk premium
  const birdInHandPremium = () => {
    // Risk premium reduction with higher payout
    const basePremium = 5; // Assumed risk premium without dividends
    const reductionFactor = payoutRatio * 2; // Higher payout reduces premium
    return basePremium - reductionFactor;
  };

  // 7. TAX PREFERENCE THEORY
  // Lower taxes on capital gains may favor low dividends
  const taxPreferenceValue = () => {
    const dividendTaxRate = 25; // Assumed dividend tax
    const capitalGainsTaxRate = 12.5; // LTCG tax
    const afterTaxDividend = dps * (1 - dividendTaxRate / 100);
    const retainedValue = (eps - dps) * (1 - capitalGainsTaxRate / 100);
    return { afterTaxDividend, retainedValue, totalAfterTax: afterTaxDividend + retainedValue };
  };

  // Decision Summary
  const getWalterDecision = () => {
    const r = expectedReturn / 100;
    const ke = costOfEquity / 100;
    if (r > ke) return { action: "Retain All Earnings", reason: "Return on investment exceeds cost of equity" };
    if (r < ke) return { action: "Distribute All Earnings", reason: "Cost of equity exceeds return on investment" };
    return { action: "Indifferent", reason: "Return equals cost of equity" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Dividend Decision Tool</h1>
              <p className="text-sm text-muted-foreground">Analyze dividend policies using prominent theories</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Company Financial Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Total Earnings (₹)</Label>
                  <Input type="number" value={earnings} onChange={(e) => setEarnings(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Current Dividend (₹)</Label>
                  <Input type="number" value={currentDividend} onChange={(e) => setCurrentDividend(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Number of Shares</Label>
                  <Input type="number" value={numberOfShares} onChange={(e) => setNumberOfShares(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Market Price (₹)</Label>
                  <Input type="number" value={marketPrice} onChange={(e) => setMarketPrice(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Cost of Equity (Ke) %</Label>
                  <Input type="number" value={costOfEquity} onChange={(e) => setCostOfEquity(Number(e.target.value))} step={0.5} />
                </div>
                <div className="space-y-2">
                  <Label>Return on Investment (r) %</Label>
                  <Input type="number" value={returnOnInvestment} onChange={(e) => setReturnOnInvestment(Number(e.target.value))} step={0.5} />
                </div>
                <div className="space-y-2">
                  <Label>Expected Return (Walter) %</Label>
                  <Input type="number" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} step={0.5} />
                </div>
                <div className="space-y-2">
                  <Label>Growth Rate (g) %</Label>
                  <Input type="number" value={growthRate} onChange={(e) => setGrowthRate(Number(e.target.value))} step={0.5} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Target Payout Ratio %</Label>
                  <Input type="number" value={targetPayoutRatio} onChange={(e) => setTargetPayoutRatio(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Adjustment Factor (0-1)</Label>
                  <Input type="number" value={adjustmentFactor} onChange={(e) => setAdjustmentFactor(Number(e.target.value))} step={0.1} min={0} max={1} />
                </div>
                <div className="space-y-2">
                  <Label>Previous Year Dividend (₹)</Label>
                  <Input type="number" value={previousDividend} onChange={(e) => setPreviousDividend(Number(e.target.value))} />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">EPS</p>
                  <p className="text-lg font-bold text-primary">₹{eps.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">DPS</p>
                  <p className="text-lg font-bold text-green-500">₹{dps.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Payout Ratio</p>
                  <p className="text-lg font-bold text-amber-500">{(payoutRatio * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Retention Ratio</p>
                  <p className="text-lg font-bold text-blue-500">{(retentionRatio * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="relevance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="relevance">Relevance Theories</TabsTrigger>
              <TabsTrigger value="irrelevance">Irrelevance Theory</TabsTrigger>
              <TabsTrigger value="other">Other Models</TabsTrigger>
            </TabsList>

            {/* Relevance Theories Tab */}
            <TabsContent value="relevance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Walter's Model */}
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      Walter's Model
                    </CardTitle>
                    <CardDescription>Dividend policy affects firm value</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-mono mb-2">P = (D + (r/Ke) × (E - D)) / Ke</p>
                      <p className="text-xs text-muted-foreground">
                        Where: P = Price, D = Dividend, r = Return on Investment, Ke = Cost of Equity, E = Earnings
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Calculated Price</p>
                        <p className="text-xl font-bold text-primary">₹{walterPrice().toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Optimal DPS</p>
                        <p className="text-xl font-bold text-green-500">₹{walterOptimalDividend().toFixed(2)}</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      expectedReturn > costOfEquity ? 'bg-blue-500/10 border-blue-500/30' :
                      expectedReturn < costOfEquity ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-muted/30 border-muted'
                    }`}>
                      <p className="font-semibold">{getWalterDecision().action}</p>
                      <p className="text-sm text-muted-foreground">{getWalterDecision().reason}</p>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• <strong>r &gt; Ke:</strong> Firm should retain earnings (growth firm)</p>
                      <p>• <strong>r &lt; Ke:</strong> Firm should distribute earnings (declining firm)</p>
                      <p>• <strong>r = Ke:</strong> Dividend policy irrelevant (normal firm)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Gordon's Model */}
                <Card className="border-green-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Gordon's Growth Model
                    </CardTitle>
                    <CardDescription>Dividend Growth Model (DGM)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-mono mb-2">P₀ = D₁ / (Ke - g)</p>
                      <p className="text-xs text-muted-foreground">
                        Where: P₀ = Current Price, D₁ = Next Year Dividend, Ke = Cost of Equity, g = Growth Rate
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Calculated Price</p>
                        <p className="text-xl font-bold text-green-500">
                          {gordonPrice() === Infinity ? '∞' : `₹${gordonPrice().toFixed(2)}`}
                        </p>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Dividend Yield</p>
                        <p className="text-xl font-bold text-amber-500">{gordonDividendYield().toFixed(2)}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="font-semibold">Key Insight</p>
                      <p className="text-sm text-muted-foreground">
                        Higher dividend payout leads to higher stock price as investors prefer certain dividends
                        ("Bird in Hand" argument)
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Assumes constant growth rate forever</p>
                      <p>• Ke must be greater than g for valid price</p>
                      <p>• Dividends reduce investor uncertainty</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Bird in Hand Theory */}
                <Card className="border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-amber-500" />
                      Bird-in-Hand Theory
                    </CardTitle>
                    <CardDescription>Gordon & Lintner's Argument</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        Investors prefer the certainty of dividend income over the uncertainty of future capital gains.
                        A "bird in the hand is worth more than two in the bush."
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Risk Premium Impact</p>
                        <p className="text-xl font-bold text-green-500">{birdInHandPremium().toFixed(2)}%</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Current Payout</p>
                        <p className="text-xl font-bold text-primary">{(payoutRatio * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Higher dividends → Lower required return</p>
                      <p>• Dividends reduce perceived risk</p>
                      <p>• Favors high dividend payout policy</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Preference Theory */}
                <Card className="border-red-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-red-500" />
                      Tax Preference Theory
                    </CardTitle>
                    <CardDescription>Litzenberger & Ramaswamy</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        Investors may prefer low/no dividends if capital gains are taxed at lower rates 
                        or can be deferred until sale.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-red-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">After-Tax DPS</p>
                        <p className="text-lg font-bold text-red-500">₹{taxPreferenceValue().afterTaxDividend.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Retained Value</p>
                        <p className="text-lg font-bold text-green-500">₹{taxPreferenceValue().retainedValue.toFixed(2)}</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Total After Tax</p>
                        <p className="text-lg font-bold text-primary">₹{taxPreferenceValue().totalAfterTax.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Lower dividends → Lower tax liability</p>
                      <p>• Capital gains can be deferred</p>
                      <p>• Favors low dividend payout policy</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Irrelevance Theory Tab */}
            <TabsContent value="irrelevance" className="space-y-6">
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-blue-500" />
                    Modigliani-Miller (MM) Dividend Irrelevance Theory
                  </CardTitle>
                  <CardDescription>Nobel Prize Winning Theory (1961)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="font-semibold text-lg mb-2">Core Proposition</p>
                    <p className="text-muted-foreground">
                      Under perfect market conditions, the dividend policy of a firm is irrelevant to its value. 
                      The value of the firm is determined solely by its earning power and risk of underlying assets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Assumptions</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Perfect capital markets (no transaction costs)</li>
                        <li>• No taxes or tax neutrality</li>
                        <li>• No flotation costs for new issues</li>
                        <li>• Symmetric information (all investors have same info)</li>
                        <li>• Fixed investment policy</li>
                        <li>• No agency costs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Implications</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Investors are indifferent between dividends and capital gains</li>
                        <li>• Value = Present value of future earnings</li>
                        <li>• Dividend policy is a "mere detail"</li>
                        <li>• Home-made dividends: Investors can create own dividend</li>
                        <li>• Stock price drops by dividend amount on ex-date</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="font-semibold text-amber-600 mb-2">Real World Critique</p>
                    <p className="text-sm text-muted-foreground">
                      In reality, MM assumptions rarely hold. Taxes, transaction costs, information asymmetry, 
                      and behavioral factors make dividend policy relevant in practice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Models Tab */}
            <TabsContent value="other" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lintner's Model */}
                <Card className="border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      Lintner's Model (1956)
                    </CardTitle>
                    <CardDescription>Dividend Smoothing / Partial Adjustment</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-mono mb-2">Dt = Dt-1 + α(τEt - Dt-1)</p>
                      <p className="text-xs text-muted-foreground">
                        Where: α = adjustment factor, τ = target payout ratio
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Suggested Dividend</p>
                        <p className="text-xl font-bold text-purple-500">{formatCurrency(lintnerDividend())}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Target Dividend</p>
                        <p className="text-xl font-bold">{formatCurrency(earnings * targetPayoutRatio / 100)}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Firms have target payout ratios</p>
                      <p>• Dividends adjust gradually to earnings changes</p>
                      <p>• Managers reluctant to cut dividends</p>
                      <p>• Speed of adjustment varies (α typically 0.3-0.5)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Residual Dividend Model */}
                <Card className="border-teal-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IndianRupee className="h-5 w-5 text-teal-500" />
                      Residual Dividend Model
                    </CardTitle>
                    <CardDescription>Investment-First Approach</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        Dividends are paid only after all profitable investment opportunities are funded.
                        Dividend = Earnings - Investment Needs
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-teal-500/10 rounded-lg">
                        <p className="text-xs text-muted-foreground">Residual Dividend</p>
                        <p className="text-xl font-bold text-teal-500">{formatCurrency(residualDividend())}</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Retained for Investment</p>
                        <p className="text-xl font-bold">{formatCurrency(earnings - residualDividend())}</p>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Investment decisions come first</p>
                      <p>• Maintain optimal capital structure</p>
                      <p>• Dividends are residual, hence variable</p>
                      <p>• Avoids costly external financing</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Signaling Theory */}
                <Card className="border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-orange-500" />
                      Signaling Theory
                    </CardTitle>
                    <CardDescription>Information Asymmetry Approach</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        Dividend changes convey information about management's expectations of future earnings.
                        Dividend increases signal confidence in future performance.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-green-500/10 border-l-4 border-green-500 rounded-r-lg">
                        <p className="font-semibold text-green-500">Dividend Increase</p>
                        <p className="text-sm text-muted-foreground">Positive signal - management expects higher future earnings</p>
                      </div>
                      <div className="p-3 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg">
                        <p className="font-semibold text-red-500">Dividend Decrease</p>
                        <p className="text-sm text-muted-foreground">Negative signal - often causes significant stock price drop</p>
                      </div>
                      <div className="p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-r-lg">
                        <p className="font-semibold text-amber-500">Dividend Initiation</p>
                        <p className="text-sm text-muted-foreground">Strong positive signal - company has matured</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Agency Theory */}
                <Card className="border-pink-500/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-pink-500" />
                      Agency Theory
                    </CardTitle>
                    <CardDescription>Jensen's Free Cash Flow Hypothesis</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">
                        Dividends reduce agency costs by limiting free cash flow available to managers,
                        preventing wasteful investments and empire building.
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>• Higher dividends = Less cash for managers to waste</p>
                      <p>• Forces discipline on management</p>
                      <p>• Shareholders prefer high dividends to control agency costs</p>
                      <p>• More relevant for mature firms with excess cash</p>
                    </div>

                    <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                      <p className="text-sm">
                        <strong>Your Payout:</strong> {(payoutRatio * 100).toFixed(1)}% - 
                        {payoutRatio > 0.5 
                          ? " Good control on free cash flow agency problems"
                          : " Consider higher payout to reduce agency costs"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Summary Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Theory Comparison Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Theory</th>
                      <th className="text-left p-3">Key Proponent</th>
                      <th className="text-left p-3">Dividend Policy Recommendation</th>
                      <th className="text-left p-3">Main Argument</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Walter's Model</td>
                      <td className="p-3">James E. Walter</td>
                      <td className="p-3">{getWalterDecision().action}</td>
                      <td className="p-3">r vs Ke determines policy</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Gordon's Model</td>
                      <td className="p-3">Myron Gordon</td>
                      <td className="p-3">High Dividends</td>
                      <td className="p-3">Dividends reduce uncertainty</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">MM Irrelevance</td>
                      <td className="p-3">Miller & Modigliani</td>
                      <td className="p-3">Doesn't Matter</td>
                      <td className="p-3">Value from investment, not dividends</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Bird-in-Hand</td>
                      <td className="p-3">Gordon & Lintner</td>
                      <td className="p-3">High Dividends</td>
                      <td className="p-3">Certain dividends preferred</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Tax Preference</td>
                      <td className="p-3">Litzenberger</td>
                      <td className="p-3">Low/No Dividends</td>
                      <td className="p-3">Capital gains taxed less</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Lintner's Model</td>
                      <td className="p-3">John Lintner</td>
                      <td className="p-3">Stable, Gradual Changes</td>
                      <td className="p-3">Dividend smoothing</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 font-medium">Residual</td>
                      <td className="p-3">-</td>
                      <td className="p-3">Variable (After Investment)</td>
                      <td className="p-3">Investment first approach</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Signaling</td>
                      <td className="p-3">Bhattacharya</td>
                      <td className="p-3">Consistent/Increasing</td>
                      <td className="p-3">Dividends convey information</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This tool is for educational purposes to understand dividend theories. The calculations are simplified 
                versions of complex financial models and may not reflect real-world conditions.
              </p>
              <p>
                Actual dividend decisions should consider multiple factors including regulatory requirements, 
                shareholder expectations, cash availability, investment opportunities, and market conditions.
              </p>
              <p>
                Please consult financial experts and refer to academic literature for comprehensive understanding.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DividendDecisionTool;
