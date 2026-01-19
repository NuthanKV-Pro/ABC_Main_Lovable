import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Trophy, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface LoanOffer {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  tenure: number;
  processingFee: number;
  prepaymentPenalty: number;
}

interface LoanAnalysis {
  id: string;
  name: string;
  emi: number;
  totalInterest: number;
  totalPayment: number;
  effectiveCost: number;
  processingFeeAmount: number;
  monthlyRate: number;
}

const LoanComparison = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<LoanOffer[]>([
    { id: "1", name: "Bank A", principal: 1000000, interestRate: 8.5, tenure: 20, processingFee: 0.5, prepaymentPenalty: 2 },
    { id: "2", name: "Bank B", principal: 1000000, interestRate: 8.75, tenure: 20, processingFee: 0, prepaymentPenalty: 0 },
  ]);

  const addLoan = () => {
    const newId = (loans.length + 1).toString();
    setLoans([...loans, {
      id: newId,
      name: `Lender ${String.fromCharCode(65 + loans.length)}`,
      principal: 1000000,
      interestRate: 9,
      tenure: 20,
      processingFee: 0.5,
      prepaymentPenalty: 2
    }]);
  };

  const removeLoan = (id: string) => {
    if (loans.length > 2) {
      setLoans(loans.filter(loan => loan.id !== id));
    }
  };

  const updateLoan = (id: string, field: keyof LoanOffer, value: string | number) => {
    setLoans(loans.map(loan => 
      loan.id === id ? { ...loan, [field]: value } : loan
    ));
  };

  const calculateEMI = (principal: number, rate: number, tenureMonths: number): number => {
    const monthlyRate = rate / 12 / 100;
    if (monthlyRate === 0) return principal / tenureMonths;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
           (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  };

  const analyzeLoan = (loan: LoanOffer): LoanAnalysis => {
    const tenureMonths = loan.tenure * 12;
    const emi = calculateEMI(loan.principal, loan.interestRate, tenureMonths);
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - loan.principal;
    const processingFeeAmount = (loan.principal * loan.processingFee) / 100;
    const effectiveCost = totalPayment + processingFeeAmount;

    return {
      id: loan.id,
      name: loan.name,
      emi,
      totalInterest,
      totalPayment,
      effectiveCost,
      processingFeeAmount,
      monthlyRate: loan.interestRate / 12
    };
  };

  const analyses = loans.map(analyzeLoan);
  
  const bestEMI = analyses.reduce((min, a) => a.emi < min.emi ? a : min, analyses[0]);
  const bestTotalCost = analyses.reduce((min, a) => a.effectiveCost < min.effectiveCost ? a : min, analyses[0]);
  const bestInterest = analyses.reduce((min, a) => a.totalInterest < min.totalInterest ? a : min, analyses[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
              <h1 className="text-2xl font-bold text-primary">Loan Comparison Tool</h1>
              <p className="text-sm text-muted-foreground">Compare multiple loan offers side-by-side</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Loan Input Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan, index) => (
              <Card key={loan.id} className="relative">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <Input
                      value={loan.name}
                      onChange={(e) => updateLoan(loan.id, "name", e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                      placeholder="Lender Name"
                    />
                    {loans.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeLoan(loan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardDescription>Loan Offer {index + 1}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Loan Amount (₹)</Label>
                    <Input
                      type="number"
                      value={loan.principal}
                      onChange={(e) => updateLoan(loan.id, "principal", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Rate (% p.a.)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={loan.interestRate}
                      onChange={(e) => updateLoan(loan.id, "interestRate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tenure (Years)</Label>
                    <Input
                      type="number"
                      value={loan.tenure}
                      onChange={(e) => updateLoan(loan.id, "tenure", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Processing Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={loan.processingFee}
                      onChange={(e) => updateLoan(loan.id, "processingFee", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prepayment Penalty (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={loan.prepaymentPenalty}
                      onChange={(e) => updateLoan(loan.id, "prepaymentPenalty", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {loans.length < 5 && (
              <Card 
                className="flex items-center justify-center min-h-[400px] border-2 border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onClick={addLoan}
              >
                <div className="text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Add Another Loan</p>
                </div>
              </Card>
            )}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Side-by-Side Comparison
              </CardTitle>
              <CardDescription>
                Compare key metrics across all loan offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Metric</TableHead>
                      {analyses.map(analysis => (
                        <TableHead key={analysis.id} className="text-center">
                          {analysis.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Monthly EMI</TableCell>
                      {analyses.map(analysis => (
                        <TableCell key={analysis.id} className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {formatCurrency(analysis.emi)}
                            {analysis.id === bestEMI.id && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Interest</TableCell>
                      {analyses.map(analysis => (
                        <TableCell key={analysis.id} className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {formatCurrency(analysis.totalInterest)}
                            {analysis.id === bestInterest.id && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Processing Fee</TableCell>
                      {analyses.map(analysis => (
                        <TableCell key={analysis.id} className="text-center">
                          {formatCurrency(analysis.processingFeeAmount)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total Payment</TableCell>
                      {analyses.map(analysis => (
                        <TableCell key={analysis.id} className="text-center">
                          {formatCurrency(analysis.totalPayment)}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-bold">Effective Total Cost</TableCell>
                      {analyses.map(analysis => (
                        <TableCell key={analysis.id} className="text-center font-bold">
                          <div className="flex items-center justify-center gap-1">
                            {formatCurrency(analysis.effectiveCost)}
                            {analysis.id === bestTotalCost.id && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Winner Announcement */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/20">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Best Overall: {bestTotalCost.name}</h3>
                  <p className="text-muted-foreground">
                    Lowest effective cost at {formatCurrency(bestTotalCost.effectiveCost)} with EMI of {formatCurrency(bestTotalCost.emi)}/month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Summary */}
          {analyses.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Potential Savings Analysis</CardTitle>
                <CardDescription>
                  How much you could save by choosing the best option
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyses
                    .filter(a => a.id !== bestTotalCost.id)
                    .map(analysis => {
                      const savings = analysis.effectiveCost - bestTotalCost.effectiveCost;
                      return (
                        <div key={analysis.id} className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-1">
                            {bestTotalCost.name} vs {analysis.name}
                          </p>
                          <p className="text-2xl font-bold text-green-600">
                            Save {formatCurrency(savings)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            over the loan tenure
                          </p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Things to Consider
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Look Beyond Interest Rate
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                    <li>• Processing fees can add significant upfront costs</li>
                    <li>• Zero processing fee offers may have higher rates</li>
                    <li>• Check for hidden charges like documentation fees</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Prepayment Flexibility
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                    <li>• Lower prepayment penalty = more flexibility</li>
                    <li>• Some banks offer zero prepayment charges</li>
                    <li>• Consider if you plan to prepay in future</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Fixed vs Floating Rate
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                    <li>• Floating rates may change over tenure</li>
                    <li>• Fixed rates provide payment certainty</li>
                    <li>• Consider current interest rate cycle</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Other Important Factors
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-2 ml-6">
                    <li>• Check the lender's reputation and service quality</li>
                    <li>• Verify all terms in the loan agreement</li>
                    <li>• Understand insurance requirements if any</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-amber-700 dark:text-amber-400">Important Disclaimer</h4>
                  <p className="text-sm text-muted-foreground">
                    This tool provides estimates for comparison purposes only. Actual loan terms, EMIs, and costs may vary based on your credit profile, lender policies, and other factors. Processing fees, prepayment charges, and other terms are subject to change without notice.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Always verify all terms and conditions directly with the lender before making any financial decisions. This calculator does not constitute financial advice. Consult with a qualified financial advisor for personalized guidance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LoanComparison;
