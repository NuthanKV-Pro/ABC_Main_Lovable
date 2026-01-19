import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Info, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, Scale, Percent, IndianRupee, Clock, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FactoringTool = () => {
  const navigate = useNavigate();
  
  // Invoice/Receivables Details
  const [invoiceAmount, setInvoiceAmount] = useState<number>(1000000);
  const [numberOfInvoices, setNumberOfInvoices] = useState<number>(10);
  const [averageCreditPeriod, setAverageCreditPeriod] = useState<number>(60); // days
  const [customerCreditRating, setCustomerCreditRating] = useState<string>("good");
  
  // Factoring Terms
  const [factoringType, setFactoringType] = useState<string>("recourse");
  const [advancePercentage, setAdvancePercentage] = useState<number>(80);
  const [factoringCommission, setFactoringCommission] = useState<number>(2);
  const [interestRate, setInterestRate] = useState<number>(12);
  const [adminFees, setAdminFees] = useState<number>(5000);
  
  // Current Financing (for comparison)
  const [currentInterestRate, setCurrentInterestRate] = useState<number>(14);
  const [hasCollectionTeam, setHasCollectionTeam] = useState<boolean>(true);
  const [collectionCostMonthly, setCollectionCostMonthly] = useState<number>(25000);
  const [badDebtPercentage, setBadDebtPercentage] = useState<number>(2);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculate factoring costs
  const calculateFactoring = () => {
    const totalReceivables = invoiceAmount * numberOfInvoices;
    const advanceAmount = totalReceivables * (advancePercentage / 100);
    const retentionAmount = totalReceivables - advanceAmount;
    
    // Factoring commission (flat on total)
    const commissionCost = totalReceivables * (factoringCommission / 100);
    
    // Interest on advance for credit period
    const interestCost = advanceAmount * (interestRate / 100) * (averageCreditPeriod / 365);
    
    // Admin/processing fees
    const processingCost = adminFees * numberOfInvoices;
    
    // Total cost of factoring
    const totalFactoringCost = commissionCost + interestCost + processingCost;
    
    // Effective cost percentage
    const effectiveCostPercentage = (totalFactoringCost / totalReceivables) * 100;
    
    // Annualized cost
    const annualizedCost = (totalFactoringCost / averageCreditPeriod) * 365;
    const annualizedCostPercentage = (annualizedCost / totalReceivables) * 100;
    
    return {
      totalReceivables,
      advanceAmount,
      retentionAmount,
      commissionCost,
      interestCost,
      processingCost,
      totalFactoringCost,
      effectiveCostPercentage,
      annualizedCostPercentage,
      netReceived: advanceAmount - commissionCost - interestCost - processingCost
    };
  };

  // Calculate cost of not factoring
  const calculateWithoutFactoring = () => {
    const totalReceivables = invoiceAmount * numberOfInvoices;
    
    // Cost of capital (opportunity cost of waiting)
    const opportunityCost = totalReceivables * (currentInterestRate / 100) * (averageCreditPeriod / 365);
    
    // Collection costs (annual converted to credit period)
    const collectionCost = hasCollectionTeam ? collectionCostMonthly * (averageCreditPeriod / 30) : 0;
    
    // Bad debt cost
    const badDebtCost = totalReceivables * (badDebtPercentage / 100);
    
    // Total cost without factoring
    const totalCost = opportunityCost + collectionCost + badDebtCost;
    
    return {
      totalReceivables,
      opportunityCost,
      collectionCost,
      badDebtCost,
      totalCost,
      effectiveCostPercentage: (totalCost / totalReceivables) * 100
    };
  };

  const factoringResult = calculateFactoring();
  const withoutFactoringResult = calculateWithoutFactoring();
  
  const savings = withoutFactoringResult.totalCost - factoringResult.totalFactoringCost;
  const shouldFactor = savings > 0;

  // Benefits score
  const getBenefitsScore = () => {
    let score = 0;
    if (averageCreditPeriod > 45) score += 20; // Long credit period benefits from factoring
    if (badDebtPercentage > 1) score += 25; // High bad debt makes non-recourse attractive
    if (!hasCollectionTeam) score += 15; // No collection team = factor handles it
    if (factoringType === 'non-recourse') score += 20; // Risk transfer
    if (currentInterestRate > interestRate) score += 20; // Cheaper than current financing
    return Math.min(100, score);
  };

  const benefitsScore = getBenefitsScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Factoring Decision Tool</h1>
              <p className="text-sm text-muted-foreground">Analyze costs & benefits of invoice factoring</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* What is Factoring */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                What is Factoring?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Factoring is a financial arrangement where a business sells its accounts receivable (invoices) to a third party 
                (factor) at a discount. This provides immediate cash flow instead of waiting for customers to pay.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Recourse Factoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Lower cost, but you bear the risk if customer doesn't pay. Factor can recover from you.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Non-Recourse Factoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Higher cost, but factor assumes credit risk. You're protected from customer default.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="inputs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inputs">Input Details</TabsTrigger>
              <TabsTrigger value="comparison">Cost Comparison</TabsTrigger>
              <TabsTrigger value="decision">Decision Analysis</TabsTrigger>
            </TabsList>

            {/* Input Details Tab */}
            <TabsContent value="inputs" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Invoice Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Average Invoice Amount (₹)</Label>
                      <Input
                        type="number"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Invoices</Label>
                      <Input
                        type="number"
                        value={numberOfInvoices}
                        onChange={(e) => setNumberOfInvoices(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Average Credit Period (Days)</Label>
                      <Input
                        type="number"
                        value={averageCreditPeriod}
                        onChange={(e) => setAverageCreditPeriod(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Customer Credit Rating</Label>
                      <Select value={customerCreditRating} onValueChange={setCustomerCreditRating}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium">Total Receivables</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(invoiceAmount * numberOfInvoices)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-primary" />
                      Factoring Terms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Factoring Type</Label>
                      <Select value={factoringType} onValueChange={setFactoringType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recourse">Recourse Factoring</SelectItem>
                          <SelectItem value="non-recourse">Non-Recourse Factoring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Advance Percentage (%)</Label>
                      <Input
                        type="number"
                        value={advancePercentage}
                        onChange={(e) => setAdvancePercentage(Number(e.target.value))}
                        max={95}
                      />
                      <p className="text-xs text-muted-foreground">Typically 70-90% of invoice value</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Factoring Commission (%)</Label>
                      <Input
                        type="number"
                        value={factoringCommission}
                        onChange={(e) => setFactoringCommission(Number(e.target.value))}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate (% p.a.)</Label>
                      <Input
                        type="number"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        step={0.5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Admin/Processing Fee per Invoice (₹)</Label>
                      <Input
                        type="number"
                        value={adminFees}
                        onChange={(e) => setAdminFees(Number(e.target.value))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Current Situation (Without Factoring)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Cost of Capital / Interest Rate (%)</Label>
                      <Input
                        type="number"
                        value={currentInterestRate}
                        onChange={(e) => setCurrentInterestRate(Number(e.target.value))}
                        step={0.5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bad Debt Percentage (%)</Label>
                      <Input
                        type="number"
                        value={badDebtPercentage}
                        onChange={(e) => setBadDebtPercentage(Number(e.target.value))}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Have Collection Team?</Label>
                        <Switch checked={hasCollectionTeam} onCheckedChange={setHasCollectionTeam} />
                      </div>
                    </div>
                    {hasCollectionTeam && (
                      <div className="space-y-2">
                        <Label>Monthly Collection Cost (₹)</Label>
                        <Input
                          type="number"
                          value={collectionCostMonthly}
                          onChange={(e) => setCollectionCostMonthly(Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cost Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="text-primary">With Factoring</CardTitle>
                    <CardDescription>Cost breakdown if you factor invoices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Total Receivables</span>
                      <span className="font-bold">{formatCurrency(factoringResult.totalReceivables)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-green-500/10 rounded-lg">
                      <span>Advance Received ({advancePercentage}%)</span>
                      <span className="font-bold text-green-500">{formatCurrency(factoringResult.advanceAmount)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Retention (received later)</span>
                      <span className="font-medium">{formatCurrency(factoringResult.retentionAmount)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                      <span>Factoring Commission</span>
                      <span className="font-medium text-red-500">-{formatCurrency(factoringResult.commissionCost)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                      <span>Interest Cost</span>
                      <span className="font-medium text-red-500">-{formatCurrency(factoringResult.interestCost)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                      <span>Processing Fees</span>
                      <span className="font-medium text-red-500">-{formatCurrency(factoringResult.processingCost)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between p-4 bg-primary/10 rounded-lg border border-primary/30">
                      <span className="font-semibold">Total Factoring Cost</span>
                      <span className="font-bold text-primary">{formatCurrency(factoringResult.totalFactoringCost)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Effective Cost %</span>
                      <span className="font-bold">{factoringResult.effectiveCostPercentage.toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Annualized Cost %</span>
                      <span className="font-bold">{factoringResult.annualizedCostPercentage.toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-amber-500">Without Factoring</CardTitle>
                    <CardDescription>Cost of managing receivables yourself</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Total Receivables</span>
                      <span className="font-bold">{formatCurrency(withoutFactoringResult.totalReceivables)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Cash Received</span>
                      <span className="text-muted-foreground">After {averageCreditPeriod} days</span>
                    </div>
                    <hr />
                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                      <span>Opportunity Cost (Interest)</span>
                      <span className="font-medium text-red-500">-{formatCurrency(withoutFactoringResult.opportunityCost)}</span>
                    </div>
                    {hasCollectionTeam && (
                      <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                        <span>Collection Team Cost</span>
                        <span className="font-medium text-red-500">-{formatCurrency(withoutFactoringResult.collectionCost)}</span>
                      </div>
                    )}
                    <div className="flex justify-between p-3 bg-red-500/10 rounded-lg">
                      <span>Expected Bad Debt ({badDebtPercentage}%)</span>
                      <span className="font-medium text-red-500">-{formatCurrency(withoutFactoringResult.badDebtCost)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                      <span className="font-semibold">Total Cost (Without Factoring)</span>
                      <span className="font-bold text-amber-500">{formatCurrency(withoutFactoringResult.totalCost)}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-muted/30 rounded-lg">
                      <span>Effective Cost %</span>
                      <span className="font-bold">{withoutFactoringResult.effectiveCostPercentage.toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Savings/Loss Card */}
              <Card className={`border-2 ${shouldFactor ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <CardContent className="py-6">
                  <div className="text-center">
                    <p className="text-lg text-muted-foreground mb-2">
                      {shouldFactor ? 'Potential Savings with Factoring' : 'Additional Cost with Factoring'}
                    </p>
                    <p className={`text-4xl font-bold ${shouldFactor ? 'text-green-500' : 'text-red-500'}`}>
                      {shouldFactor ? '+' : ''}{formatCurrency(Math.abs(savings))}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {shouldFactor ? 'Factoring is more cost-effective' : 'Self-managing receivables is cheaper'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Decision Analysis Tab */}
            <TabsContent value="decision" className="space-y-6">
              <Card className={`border-2 ${shouldFactor ? 'border-green-500/30' : 'border-amber-500/30'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {shouldFactor ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    )}
                    Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className={`text-3xl font-bold ${shouldFactor ? 'text-green-500' : 'text-amber-500'}`}>
                      {shouldFactor ? 'FACTORING RECOMMENDED' : 'FACTORING NOT RECOMMENDED'}
                    </p>
                    <p className="text-muted-foreground mt-2">
                      {shouldFactor 
                        ? `You can save approximately ${formatCurrency(savings)} by using factoring instead of managing receivables yourself.`
                        : `Self-managing receivables is more cost-effective. You save ${formatCurrency(Math.abs(savings))} by not factoring.`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                      Benefits of Factoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Immediate Cash Flow:</strong> Get {advancePercentage}% of invoice value upfront</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>No Waiting:</strong> Don't wait {averageCreditPeriod} days for payment</span>
                      </li>
                      {factoringType === 'non-recourse' && (
                        <li className="flex items-start gap-2">
                          <Scale className="h-4 w-4 text-green-500 mt-0.5" />
                          <span><strong>Risk Transfer:</strong> Factor bears the credit risk</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Outsourced Collections:</strong> Factor handles payment follow-ups</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IndianRupee className="h-4 w-4 text-green-500 mt-0.5" />
                        <span><strong>Working Capital:</strong> Use funds for growth, not waiting for payments</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="h-5 w-5" />
                      Drawbacks of Factoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Percent className="h-4 w-4 text-red-500 mt-0.5" />
                        <span><strong>Cost:</strong> {factoringResult.effectiveCostPercentage.toFixed(2)}% of receivables as fees</span>
                      </li>
                      {factoringType === 'recourse' && (
                        <li className="flex items-start gap-2">
                          <Scale className="h-4 w-4 text-red-500 mt-0.5" />
                          <span><strong>Credit Risk:</strong> You still bear default risk in recourse factoring</span>
                        </li>
                      )}
                      <li className="flex items-start gap-2">
                        <IndianRupee className="h-4 w-4 text-red-500 mt-0.5" />
                        <span><strong>Retention:</strong> {100 - advancePercentage}% held until customer pays</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-red-500 mt-0.5" />
                        <span><strong>Customer Relationship:</strong> Customers know you're using a factor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span><strong>Selectivity:</strong> Factor may reject high-risk invoices</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* When to Factor */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    When is Factoring Most Beneficial?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-500 mb-3">✅ Good Candidates for Factoring</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• High-growth businesses needing working capital</li>
                        <li>• Long credit periods (&gt;45-60 days)</li>
                        <li>• Difficulty getting traditional bank loans</li>
                        <li>• Seasonal businesses with cash flow gaps</li>
                        <li>• B2B businesses with creditworthy customers</li>
                        <li>• No in-house collection capabilities</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-500 mb-3">❌ Not Ideal for Factoring</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Low-margin businesses (factoring costs eat into profit)</li>
                        <li>• Short credit periods (&lt;30 days)</li>
                        <li>• Access to cheaper financing options</li>
                        <li>• High-risk customers (factor may reject)</li>
                        <li>• Small invoice amounts (fees too high relatively)</li>
                        <li>• Strong cash reserves</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
                This tool provides estimated calculations for educational purposes. Actual factoring terms, rates, and costs 
                vary significantly between factoring companies and depend on your specific business profile.
              </p>
              <p>
                Factors consider multiple factors including invoice quality, customer creditworthiness, industry, 
                and your business history when determining rates and eligibility.
              </p>
              <p>
                Please consult with multiple factoring companies and your financial advisor before making a decision.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default FactoringTool;
