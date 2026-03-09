import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, CheckCircle, AlertTriangle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const NRITaxCalculator = () => {
  const goBack = useGoBack();
  const [daysInIndia, setDaysInIndia] = useState("");
  const [daysLast4Years, setDaysLast4Years] = useState("");
  const [daysLast7Years, setDaysLast7Years] = useState("");
  const [yearsLast7, setYearsLast7] = useState("");
  const [indianIncome, setIndianIncome] = useState("");
  const [foreignIncome, setForeignIncome] = useState("");

  const days = parseInt(daysInIndia) || 0;
  const days4Years = parseInt(daysLast4Years) || 0;
  const days7Years = parseInt(daysLast7Years) || 0;
  const residentYears = parseInt(yearsLast7) || 0;

  const determineResidency = () => {
    // Basic conditions
    const condition1 = days >= 182;
    const condition2 = days >= 60 && days4Years >= 365;
    const condition3 = days >= 120 && days4Years >= 365; // For Indian citizens abroad

    let status = "Non-Resident (NR)";
    let description = "";

    if (condition1 || condition2) {
      // Check RNOR
      if (days7Years < 730 || residentYears < 2) {
        status = "Resident but Not Ordinarily Resident (RNOR)";
        description = "Taxable on Indian income + foreign income received in India";
      } else {
        status = "Resident and Ordinarily Resident (ROR)";
        description = "Taxable on worldwide income";
      }
    } else if (condition3) {
      status = "Deemed Resident";
      description = "For Indian citizens with Indian income > ₹15L and no foreign tax liability";
    } else {
      description = "Taxable only on Indian income";
    }

    return { status, description };
  };

  const calculateTax = () => {
    const indian = parseFloat(indianIncome) || 0;
    const foreign = parseFloat(foreignIncome) || 0;
    const residency = determineResidency();

    let taxableIncome = indian;
    if (residency.status === "Resident and Ordinarily Resident (ROR)") {
      taxableIncome = indian + foreign;
    }

    // New regime tax calculation
    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = (taxableIncome - 1500000) * 0.30 + 150000;
    } else if (taxableIncome > 1200000) {
      tax = (taxableIncome - 1200000) * 0.20 + 90000;
    } else if (taxableIncome > 900000) {
      tax = (taxableIncome - 900000) * 0.15 + 45000;
    } else if (taxableIncome > 600000) {
      tax = (taxableIncome - 600000) * 0.10 + 15000;
    } else if (taxableIncome > 300000) {
      tax = (taxableIncome - 300000) * 0.05;
    }

    const cess = tax * 0.04;
    return { taxableIncome, tax, cess, total: tax + cess };
  };

  const residency = determineResidency();
  const taxResult = calculateTax();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">NRI Tax Calculator</CardTitle>
              <CardDescription>Determine residential status and calculate applicable taxes</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Residency Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Days in India (Current FY)</Label>
                  <Input
                    type="number"
                    placeholder="0-365"
                    max="365"
                    value={daysInIndia}
                    onChange={(e) => setDaysInIndia(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Days in India (Last 4 FYs)</Label>
                  <Input
                    type="number"
                    placeholder="0-1460"
                    value={daysLast4Years}
                    onChange={(e) => setDaysLast4Years(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Days in India (Last 7 FYs)</Label>
                  <Input
                    type="number"
                    placeholder="0-2555"
                    value={daysLast7Years}
                    onChange={(e) => setDaysLast7Years(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Resident Years in Last 7 FYs</Label>
                  <Input
                    type="number"
                    placeholder="0-7"
                    max="7"
                    value={yearsLast7}
                    onChange={(e) => setYearsLast7(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className={`${residency.status.includes("Non-Resident") ? "bg-blue-500/10 border-blue-500/30" : residency.status.includes("RNOR") ? "bg-amber-500/10 border-amber-500/30" : "bg-green-500/10 border-green-500/30"}`}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  {residency.status.includes("Non-Resident") ? (
                    <CheckCircle className="h-6 w-6 text-blue-500 shrink-0" />
                  ) : residency.status.includes("RNOR") ? (
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                  )}
                  <div>
                    <Badge variant="secondary" className="mb-2">{residency.status}</Badge>
                    <p className="text-sm text-muted-foreground">{residency.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2 text-sm">
                  <h5 className="font-medium">Residency Conditions:</h5>
                  <div className={`flex items-center gap-2 ${days >= 182 ? "text-green-500" : "text-muted-foreground"}`}>
                    {days >= 182 ? <CheckCircle className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    <span>182+ days in India: {days >= 182 ? "Yes" : "No"}</span>
                  </div>
                  <div className={`flex items-center gap-2 ${days >= 60 && days4Years >= 365 ? "text-green-500" : "text-muted-foreground"}`}>
                    {days >= 60 && days4Years >= 365 ? <CheckCircle className="h-4 w-4" /> : <span className="h-4 w-4" />}
                    <span>60+ days + 365 in 4 FYs: {days >= 60 && days4Years >= 365 ? "Yes" : "No"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Income Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Indian Income (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={indianIncome}
                    onChange={(e) => setIndianIncome(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Foreign Income (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={foreignIncome}
                    onChange={(e) => setForeignIncome(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {residency.status === "Resident and Ordinarily Resident (ROR)" 
                      ? "Taxable in India" 
                      : "Not taxable in India"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-4">Tax Calculation (New Regime)</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Taxable Income:</span>
                    <span className="font-mono">₹{taxResult.taxableIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-mono">₹{Math.round(taxResult.tax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cess @ 4%:</span>
                    <span className="font-mono">₹{Math.round(taxResult.cess).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Tax</p>
                    <p className="text-3xl font-bold text-primary">₹{Math.round(taxResult.total).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default NRITaxCalculator;
