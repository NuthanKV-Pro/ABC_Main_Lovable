import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calculator, CheckCircle, XCircle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const PresumptiveTaxCalculator = () => {
  const goBack = useGoBack();
  const [businessType, setBusinessType] = useState<"44AD" | "44ADA">("44AD");
  const [turnover, setTurnover] = useState("");
  const [digitalReceipts, setDigitalReceipts] = useState("");
  const [cashReceipts, setCashReceipts] = useState("");
  const [grossReceipts, setGrossReceipts] = useState("");

  const calculate44AD = () => {
    const digital = parseFloat(digitalReceipts) || 0;
    const cash = parseFloat(cashReceipts) || 0;
    const total = digital + cash;
    
    const digitalIncome = digital * 0.06; // 6% for digital
    const cashIncome = cash * 0.08; // 8% for cash
    const presumptiveIncome = digitalIncome + cashIncome;
    
    const isEligible = total <= 30000000; // 3 crore limit for digital
    
    return { total, digitalIncome, cashIncome, presumptiveIncome, isEligible };
  };

  const calculate44ADA = () => {
    const receipts = parseFloat(grossReceipts) || 0;
    const presumptiveIncome = receipts * 0.50; // 50% deemed income
    const isEligible = receipts <= 7500000; // 75 lakh limit
    
    return { receipts, presumptiveIncome, isEligible };
  };

  const result44AD = calculate44AD();
  const result44ADA = calculate44ADA();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Presumptive Tax Calculator</CardTitle>
              <CardDescription>Section 44AD (Business) & 44ADA (Profession) eligibility and calculation</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={businessType} onValueChange={(v) => setBusinessType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="44AD">Section 44AD (Business)</TabsTrigger>
              <TabsTrigger value="44ADA">Section 44ADA (Profession)</TabsTrigger>
            </TabsList>

            <TabsContent value="44AD" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <Label>Digital/Banking Receipts (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={digitalReceipts}
                      onChange={(e) => setDigitalReceipts(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">UPI, NEFT, card payments (6% deemed profit)</p>
                  </div>
                  <div>
                    <Label>Cash Receipts (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cashReceipts}
                      onChange={(e) => setCashReceipts(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Cash payments (8% deemed profit)</p>
                  </div>
                </div>

                <Card className={`${result44AD.isEligible ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      {result44AD.isEligible ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {result44AD.isEligible ? "Eligible for 44AD" : "Not Eligible (Turnover > ₹3 Cr)"}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Turnover:</span>
                        <span className="font-mono">₹{result44AD.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Digital Income (6%):</span>
                        <span className="font-mono">₹{result44AD.digitalIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cash Income (8%):</span>
                        <span className="font-mono">₹{result44AD.cashIncome.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                        <span>Presumptive Income:</span>
                        <span className="text-primary font-mono">₹{result44AD.presumptiveIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">Section 44AD Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Turnover limit: ₹3 Crore (if 95%+ digital receipts) or ₹2 Crore otherwise</li>
                    <li>• Deemed profit: 6% on digital, 8% on cash receipts</li>
                    <li>• No books of accounts required if presumptive income offered</li>
                    <li>• Cannot claim additional deductions except partner salary/interest</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="44ADA" className="space-y-6 mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label>Gross Professional Receipts (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={grossReceipts}
                    onChange={(e) => setGrossReceipts(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total receipts from profession</p>
                </div>

                <Card className={`${result44ADA.isEligible ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      {result44ADA.isEligible ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {result44ADA.isEligible ? "Eligible for 44ADA" : "Not Eligible (Receipts > ₹75L)"}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Gross Receipts:</span>
                        <span className="font-mono">₹{result44ADA.receipts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                        <span>Presumptive Income (50%):</span>
                        <span className="text-primary font-mono">₹{result44ADA.presumptiveIncome.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">Section 44ADA Rules</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Applicable to: Doctors, Lawyers, CAs, Engineers, Architects, Interior Decorators</li>
                    <li>• Gross receipts limit: ₹75 Lakhs</li>
                    <li>• Deemed profit: 50% of gross receipts</li>
                    <li>• No books of accounts required if presumptive income offered</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PresumptiveTaxCalculator;
