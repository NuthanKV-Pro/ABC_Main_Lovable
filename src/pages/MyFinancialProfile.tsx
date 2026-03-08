import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { useTaxData } from "@/hooks/useTaxData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, IndianRupee, TrendingUp, Shield, PiggyBank, Landmark, Heart, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const fmt = (n: number) =>
  n >= 10000000 ? `₹${(n / 10000000).toFixed(2)} Cr` :
  n >= 100000 ? `₹${(n / 100000).toFixed(2)} L` :
  `₹${n.toLocaleString("en-IN")}`;

const calcNewRegimeTax = (income: number): number => {
  if (income <= 300000) return 0;
  if (income <= 700000) return (income - 300000) * 0.05;
  if (income <= 1000000) return 20000 + (income - 700000) * 0.1;
  if (income <= 1200000) return 50000 + (income - 1000000) * 0.15;
  if (income <= 1500000) return 80000 + (income - 1200000) * 0.2;
  return 140000 + (income - 1500000) * 0.3;
};

const Metric = ({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`text-lg font-bold ${warn ? "text-destructive" : "text-foreground"}`}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const MyFinancialProfile = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const tax = useTaxData();
  const [synced, setSynced] = useState(false);

  const handleSyncAll = () => {
    const salaryTotal = parseFloat(localStorage.getItem("salary_total") || "0");
    const fhsIncome = parseFloat(localStorage.getItem("fhs_monthlyIncome") || "0");
    const fhsAge = parseFloat(localStorage.getItem("fhs_age") || "0");
    const fhsExpenses = parseFloat(localStorage.getItem("fhs_monthlyExpenses") || "0");
    const fhsSavings = parseFloat(localStorage.getItem("fhs_monthlySavings") || "0");
    const fhsInvestments = parseFloat(localStorage.getItem("fhs_totalInvestments") || "0");
    const fhsDebt = parseFloat(localStorage.getItem("fhs_totalDebt") || "0");
    const fhsDebtPayment = parseFloat(localStorage.getItem("fhs_monthlyDebtPayment") || "0");
    const fhsEmergency = parseFloat(localStorage.getItem("fhs_emergencyFund") || "0");

    // Compute the canonical monthly income
    const canonicalIncome = salaryTotal > 0 ? Math.round(salaryTotal / 12) : fhsIncome;

    // Write a unified sync snapshot that tools can read
    const syncData: Record<string, number> = {};
    if (canonicalIncome > 0) syncData["sync_monthlyIncome"] = canonicalIncome;
    if (fhsAge > 0) syncData["sync_age"] = fhsAge;
    if (fhsExpenses > 0) syncData["sync_monthlyExpenses"] = fhsExpenses;
    if (fhsSavings > 0) syncData["sync_monthlySavings"] = fhsSavings;
    if (fhsInvestments > 0) syncData["sync_totalInvestments"] = fhsInvestments;
    if (fhsDebt > 0) syncData["sync_totalDebt"] = fhsDebt;
    if (fhsDebtPayment > 0) syncData["sync_monthlyDebtPayment"] = fhsDebtPayment;
    if (fhsEmergency > 0) syncData["sync_emergencyFund"] = fhsEmergency;

    // Also write fhs_ keys from salary if FHS is empty
    if (canonicalIncome > 0 && !fhsIncome) {
      localStorage.setItem("fhs_monthlyIncome", String(canonicalIncome));
    }

    Object.entries(syncData).forEach(([k, v]) => localStorage.setItem(k, String(v)));
    localStorage.setItem("sync_timestamp", new Date().toISOString());

    setSynced(true);
    toast({
      title: "All tools synced",
      description: `${Object.keys(syncData).length} data points pushed. Open any tool to see pre-filled values.`,
    });
  };

  // FHS data
  const monthlyIncome = parseFloat(localStorage.getItem("fhs_monthlyIncome") || "0");
  const monthlyExpenses = parseFloat(localStorage.getItem("fhs_monthlyExpenses") || "0");
  const monthlySavings = parseFloat(localStorage.getItem("fhs_monthlySavings") || "0");
  const totalInvestments = parseFloat(localStorage.getItem("fhs_totalInvestments") || "0");
  const totalDebt = parseFloat(localStorage.getItem("fhs_totalDebt") || "0");
  const monthlyDebtPayment = parseFloat(localStorage.getItem("fhs_monthlyDebtPayment") || "0");
  const emergencyFund = parseFloat(localStorage.getItem("fhs_emergencyFund") || "0");
  const insuranceCoverage = parseFloat(localStorage.getItem("fhs_insuranceCoverage") || "0");
  const retirementCorpus = parseFloat(localStorage.getItem("fhs_retirementCorpus") || "0");

  const annualIncome = tax.salary.total > 0 ? tax.grossTotal : monthlyIncome * 12;
  const estimatedTax = calcNewRegimeTax(Math.max(0, annualIncome - tax.totalDeductions));
  const cess = Math.round(estimatedTax * 0.04);
  const totalTaxPayable = Math.round(estimatedTax + cess);

  const netWorth = totalInvestments - totalDebt;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const dtiRatio = monthlyIncome > 0 ? (monthlyDebtPayment / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
  const insuranceMultiple = annualIncome > 0 ? insuranceCoverage / annualIncome : 0;
  const fireTarget = monthlyExpenses * 12 * 25;
  const fireProgress = fireTarget > 0 ? Math.min(100, (retirementCorpus / fireTarget) * 100) : 0;

  const hasAnyData = tax.grossTotal > 0 || monthlyIncome > 0;

  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Button variant="ghost" onClick={goBack} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <Card className="max-w-lg mx-auto text-center p-8">
          <CardHeader><CardTitle>No Data Yet</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Start by entering data in any tool to see your unified profile here.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate("/salary")}>Salary</Button>
              <Button variant="outline" onClick={() => navigate("/financial-health-score")}>Health Score</Button>
              <Button variant="outline" onClick={() => navigate("/budget-planner")}>Budget</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" onClick={goBack}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <div className="flex items-center gap-2">
          <Button onClick={handleSyncAll} variant={synced ? "secondary" : "default"} className="gap-2">
            {synced ? <CheckCircle className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            {synced ? "Synced" : "Sync All Tools"}
          </Button>
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">My Financial Profile</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Income & Tax */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><IndianRupee className="h-4 w-4 text-primary" />Income & Tax</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Metric label="Gross Income" value={fmt(annualIncome)} />
            <Metric label="Deductions" value={fmt(tax.totalDeductions)} />
            <Metric label="Taxable Income" value={fmt(Math.max(0, annualIncome - tax.totalDeductions))} />
            <Metric label="Est. Tax (New)" value={fmt(totalTaxPayable)} />
            {tax.salary.hasData && <Metric label="Salary" value={fmt(tax.salary.total)} />}
            {tax.capitalGains.hasData && <Metric label="Capital Gains" value={fmt(tax.capitalGains.total)} />}
            {tax.business.hasData && <Metric label="Business" value={fmt(tax.business.total)} />}
            {tax.houseProperty.hasData && <Metric label="House Property" value={fmt(tax.houseProperty.total)} />}
            {tax.otherSources.hasData && <Metric label="Other Sources" value={fmt(tax.otherSources.total)} />}
          </CardContent>
        </Card>

        {/* Financial Health */}
        {monthlyIncome > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Heart className="h-4 w-4 text-primary" />Financial Health</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Metric label="Monthly Income" value={fmt(monthlyIncome)} />
              <Metric label="Monthly Expenses" value={fmt(monthlyExpenses)} />
              <Metric label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} sub={savingsRate < 20 ? "Below 20% target" : "On track"} warn={savingsRate < 10} />
              <Metric label="DTI Ratio" value={`${dtiRatio.toFixed(1)}%`} sub={dtiRatio > 40 ? "High debt burden" : "Healthy"} warn={dtiRatio > 40} />
            </CardContent>
          </Card>
        )}

        {/* Investments & Net Worth */}
        {(totalInvestments > 0 || totalDebt > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4 text-primary" />Net Worth</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Metric label="Investments" value={fmt(totalInvestments)} />
              <Metric label="Total Debt" value={fmt(totalDebt)} warn={totalDebt > annualIncome} />
              <Metric label="Net Worth" value={fmt(netWorth)} warn={netWorth < 0} />
              {monthlyIncome > 0 && (
                <Metric label="Invest / Income" value={`${((totalInvestments / (monthlyIncome * 12)) * 100).toFixed(0)}%`} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Safety Net */}
        {(emergencyFund > 0 || insuranceCoverage > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" />Safety Net</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Metric label="Emergency Fund" value={fmt(emergencyFund)} sub={`${emergencyMonths.toFixed(1)} months`} warn={emergencyMonths < 3} />
              <Metric label="Insurance Cover" value={fmt(insuranceCoverage)} sub={`${insuranceMultiple.toFixed(1)}x income`} warn={insuranceMultiple < 10} />
            </CardContent>
          </Card>
        )}

        {/* Retirement / FIRE */}
        {retirementCorpus > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Landmark className="h-4 w-4 text-primary" />Retirement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Metric label="Retirement Corpus" value={fmt(retirementCorpus)} />
              {fireTarget > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>FIRE Progress</span>
                    <span>{fireProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={fireProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Target: {fmt(fireTarget)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><PiggyBank className="h-4 w-4 text-primary" />Explore</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/smart-action-plan")}>Action Plan</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/financial-health-score")}>Health Score</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/regime-optimizer")}>Regime Optimizer</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/fire-calculator")}>FIRE Calculator</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/budget-planner")}>Budget</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyFinancialProfile;
