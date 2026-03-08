import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { useTaxData } from "@/hooks/useTaxData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, IndianRupee, TrendingDown, PiggyBank, Shield, Flame, Wallet } from "lucide-react";

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

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  progress?: number;
  route: string;
}

const MetricCard = ({ icon: Icon, label, value, sub, warn, progress, route }: MetricCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(route)}>
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={`text-2xl font-bold ${warn ? "text-destructive" : "text-foreground"}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {progress !== undefined && <Progress value={Math.min(100, Math.max(0, progress))} className="h-1.5" />}
      </CardContent>
    </Card>
  );
};

const QuickSummary = () => {
  const goBack = useGoBack();
  const navigate = useNavigate();
  const tax = useTaxData();

  const monthlyIncome = parseFloat(localStorage.getItem("fhs_monthlyIncome") || "0");
  const monthlyExpenses = parseFloat(localStorage.getItem("fhs_monthlyExpenses") || "0");
  const monthlySavings = parseFloat(localStorage.getItem("fhs_monthlySavings") || "0");
  const totalInvestments = parseFloat(localStorage.getItem("fhs_totalInvestments") || "0");
  const totalDebt = parseFloat(localStorage.getItem("fhs_totalDebt") || "0");
  const emergencyFund = parseFloat(localStorage.getItem("fhs_emergencyFund") || "0");
  const retirementCorpus = parseFloat(localStorage.getItem("fhs_retirementCorpus") || "0");

  const annualIncome = tax.salary.total > 0 ? tax.grossTotal : monthlyIncome * 12;
  const taxableIncome = Math.max(0, annualIncome - tax.totalDeductions);
  const estimatedTax = calcNewRegimeTax(taxableIncome);
  const totalTax = Math.round(estimatedTax + estimatedTax * 0.04);

  const netWorth = totalInvestments - totalDebt;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
  const emergencyMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
  const fireTarget = monthlyExpenses * 12 * 25;
  const fireProgress = fireTarget > 0 ? (retirementCorpus / fireTarget) * 100 : 0;

  const hasAnyData = annualIncome > 0 || totalInvestments > 0;

  if (!hasAnyData) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <Button variant="ghost" onClick={goBack} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <Card className="max-w-lg mx-auto text-center p-8">
          <CardContent className="space-y-4 pt-6">
            <p className="text-lg font-semibold text-foreground">No data to summarize yet</p>
            <p className="text-muted-foreground">Enter data in Salary, Financial Health Score, or any calculator to see your quick summary.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate("/salary")}>Salary</Button>
              <Button variant="outline" onClick={() => navigate("/financial-health-score")}>Health Score</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Button variant="ghost" onClick={goBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Quick Summary</h1>
        <Button variant="outline" size="sm" onClick={() => navigate("/my-financial-profile")}>Full Profile →</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {annualIncome > 0 && (
          <MetricCard
            icon={IndianRupee}
            label="Taxable Income"
            value={fmt(taxableIncome)}
            sub={`Gross: ${fmt(annualIncome)} · Ded: ${fmt(tax.totalDeductions)}`}
            route="/total-income-tax"
          />
        )}

        {annualIncome > 0 && (
          <MetricCard
            icon={TrendingDown}
            label="Estimated Tax"
            value={fmt(totalTax)}
            sub={`Effective rate: ${taxableIncome > 0 ? ((totalTax / taxableIncome) * 100).toFixed(1) : 0}%`}
            route="/regime-optimizer"
          />
        )}

        {monthlyIncome > 0 && (
          <MetricCard
            icon={PiggyBank}
            label="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            sub={savingsRate >= 20 ? "On track (≥20%)" : "Below 20% target"}
            warn={savingsRate < 10}
            progress={savingsRate}
            route="/budget-planner"
          />
        )}

        {(totalInvestments > 0 || totalDebt > 0) && (
          <MetricCard
            icon={Wallet}
            label="Net Worth"
            value={fmt(netWorth)}
            sub={`Assets: ${fmt(totalInvestments)} · Debt: ${fmt(totalDebt)}`}
            warn={netWorth < 0}
            route="/net-worth-calculator"
          />
        )}

        {emergencyFund > 0 && (
          <MetricCard
            icon={Shield}
            label="Emergency Readiness"
            value={`${emergencyMonths.toFixed(1)} months`}
            sub={emergencyMonths >= 6 ? "Well covered" : emergencyMonths >= 3 ? "Adequate" : "Build up to 6 months"}
            warn={emergencyMonths < 3}
            progress={(emergencyMonths / 6) * 100}
            route="/emergency-fund"
          />
        )}

        {retirementCorpus > 0 && (
          <MetricCard
            icon={Flame}
            label="FIRE Progress"
            value={`${fireProgress.toFixed(1)}%`}
            sub={`Corpus: ${fmt(retirementCorpus)} / Target: ${fmt(fireTarget)}`}
            progress={fireProgress}
            route="/fire-calculator"
          />
        )}
      </div>
    </div>
  );
};

export default QuickSummary;
