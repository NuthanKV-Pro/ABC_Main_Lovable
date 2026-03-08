import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Building2, TrendingUp, IndianRupee } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import ExportButton from "@/components/ExportButton";
import { ExportConfig } from "@/utils/unifiedExport";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const RealEstateROICalculator = () => {
  const goBack = useGoBack();
  const [purchasePrice, setPurchasePrice] = useState(5000000);
  const [stampDutyPct, setStampDutyPct] = useState(7);
  const [registrationPct, setRegistrationPct] = useState(1);
  const [annualMaintenance, setAnnualMaintenance] = useState(24000);
  const [monthlyRent, setMonthlyRent] = useState(15000);
  const [vacancyPct, setVacancyPct] = useState(8);
  const [appreciationPct, setAppreciationPct] = useState(6);
  const [holdingYears, setHoldingYears] = useState(10);
  const [loanPct, setLoanPct] = useState(80);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);

  // Calculations
  const stampDuty = purchasePrice * stampDutyPct / 100;
  const registration = purchasePrice * registrationPct / 100;
  const totalCost = purchasePrice + stampDuty + registration;
  const loanAmount = purchasePrice * loanPct / 100;
  const downPayment = totalCost - loanAmount;

  // EMI
  const monthlyRate = loanRate / 100 / 12;
  const months = loanTenure * 12;
  const emi = loanAmount > 0 ? loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1) : 0;
  const totalInterest = emi * months - loanAmount;
  const interestInHolding = Math.min(totalInterest, emi * holdingYears * 12 - loanAmount * (1 - Math.pow(1 + monthlyRate, -holdingYears * 12) / (holdingYears * 12 * monthlyRate)));

  // Rental
  const effectiveRent = monthlyRent * 12 * (1 - vacancyPct / 100);
  const totalRental = effectiveRent * holdingYears; // simplified, no escalation
  const rentalYield = purchasePrice > 0 ? (effectiveRent / purchasePrice * 100) : 0;

  // Appreciation
  const futureValue = purchasePrice * Math.pow(1 + appreciationPct / 100, holdingYears);
  const capitalGain = futureValue - purchasePrice;

  // Tax on LTCG (property > 2 years = 20% with indexation, simplified)
  const ltcgTax = capitalGain > 0 ? capitalGain * 0.20 : 0;

  // Sec 24 benefit (max 2L per year on self-occupied, unlimited on let-out)
  const sec24Benefit = Math.min(200000, totalInterest / loanTenure) * holdingYears * 0.30; // approx 30% tax bracket

  // Total costs
  const totalMaintenance = annualMaintenance * holdingYears;
  const totalEMI = emi * Math.min(holdingYears, loanTenure) * 12;

  // Net profit
  const totalInflows = futureValue + totalRental + sec24Benefit;
  const totalOutflows = totalCost + totalMaintenance + totalEMI + ltcgTax;
  const netProfit = totalInflows - totalOutflows;

  // Annualized ROI
  const totalInvested = downPayment + totalMaintenance + totalEMI;
  const annualizedROI = totalInvested > 0 ? (Math.pow((totalInflows - ltcgTax) / totalInvested, 1 / holdingYears) - 1) * 100 : 0;

  // Alternatives
  const fdReturn = totalInvested * Math.pow(1 + 0.07, holdingYears) - totalInvested;
  const mfReturn = totalInvested * Math.pow(1 + 0.12, holdingYears) - totalInvested;

  const getExportConfig = (): ExportConfig => ({
    title: "Real Estate ROI Report", fileNamePrefix: "real-estate-roi",
    sections: [
      { title: "Property Details", keyValues: [["Purchase Price", fmt(purchasePrice)], ["Stamp Duty + Reg.", fmt(stampDuty + registration)], ["Total Cost", fmt(totalCost)]] },
      { title: "Returns", keyValues: [["Capital Appreciation", fmt(capitalGain)], ["Total Rental", fmt(totalRental)], ["LTCG Tax", fmt(ltcgTax)], ["Sec 24 Benefit", fmt(sec24Benefit)], ["Net Profit", fmt(netProfit)], ["Annualized ROI", `${annualizedROI.toFixed(1)}%`]] },
      { title: "Vs Alternatives", keyValues: [["Real Estate Profit", fmt(netProfit)], ["FD @7% Profit", fmt(fdReturn)], ["MF @12% Profit", fmt(mfReturn)]] },
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" /> Real Estate ROI Calculator</h1>
              <p className="text-sm text-muted-foreground">True returns on property investment with tax impact</p>
            </div>
          </div>
          <ExportButton getConfig={getExportConfig} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Property Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Purchase Price (₹)</Label><Input type="number" value={purchasePrice || ""} onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Stamp Duty (%)</Label><Input type="number" value={stampDutyPct} onChange={e => setStampDutyPct(parseFloat(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Registration (%)</Label><Input type="number" value={registrationPct} onChange={e => setRegistrationPct(parseFloat(e.target.value) || 0)} /></div>
                </div>
                <div className="space-y-2"><Label>Annual Maintenance (₹)</Label><Input type="number" value={annualMaintenance || ""} onChange={e => setAnnualMaintenance(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Holding Period</Label><span className="text-sm font-medium">{holdingYears} years</span></div>
                  <Slider value={[holdingYears]} onValueChange={v => setHoldingYears(v[0])} min={1} max={30} step={1} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Rental Income</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Monthly Rent (₹)</Label><Input type="number" value={monthlyRent || ""} onChange={e => setMonthlyRent(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Vacancy Rate</Label><span className="text-sm font-medium">{vacancyPct}%</span></div>
                  <Slider value={[vacancyPct]} onValueChange={v => setVacancyPct(v[0])} min={0} max={30} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Capital Appreciation</Label><span className="text-sm font-medium">{appreciationPct}%</span></div>
                  <Slider value={[appreciationPct]} onValueChange={v => setAppreciationPct(v[0])} min={0} max={15} step={0.5} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Loan Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between"><Label>Loan %</Label><span className="text-sm font-medium">{loanPct}%</span></div>
                  <Slider value={[loanPct]} onValueChange={v => setLoanPct(v[0])} min={0} max={90} step={5} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Interest Rate (%)</Label><Input type="number" value={loanRate} onChange={e => setLoanRate(parseFloat(e.target.value) || 0)} /></div>
                  <div className="space-y-2"><Label>Tenure (years)</Label><Input type="number" value={loanTenure} onChange={e => setLoanTenure(parseInt(e.target.value) || 1)} /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Rental Yield</p><p className="text-xl font-bold text-primary">{rentalYield.toFixed(1)}%</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Annualized ROI</p><p className="text-xl font-bold text-primary">{annualizedROI.toFixed(1)}%</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">EMI</p><p className="text-xl font-bold">{fmt(emi)}/mo</p></CardContent></Card>
              <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Net Profit</p><p className={`text-xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netProfit)}</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Detailed Breakdown</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Purchase Price</TableCell><TableCell className="text-right">{fmt(purchasePrice)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Stamp Duty + Registration</TableCell><TableCell className="text-right">{fmt(stampDuty + registration)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Total Acquisition Cost</TableCell><TableCell className="text-right font-bold">{fmt(totalCost)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Down Payment</TableCell><TableCell className="text-right">{fmt(downPayment)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Total EMI ({holdingYears}yr)</TableCell><TableCell className="text-right">{fmt(totalEMI)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Total Maintenance</TableCell><TableCell className="text-right">{fmt(totalMaintenance)}</TableCell></TableRow>
                    <TableRow className="border-t-2"><TableCell className="font-medium">Future Property Value</TableCell><TableCell className="text-right text-primary font-bold">{fmt(futureValue)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Capital Appreciation</TableCell><TableCell className="text-right">{fmt(capitalGain)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Total Rental Income</TableCell><TableCell className="text-right">{fmt(totalRental)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">LTCG Tax (20%)</TableCell><TableCell className="text-right text-destructive">-{fmt(ltcgTax)}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Sec 24 Tax Benefit</TableCell><TableCell className="text-right text-primary">+{fmt(sec24Benefit)}</TableCell></TableRow>
                    <TableRow className="border-t-2 font-bold"><TableCell>Net Profit/Loss</TableCell><TableCell className={`text-right ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(netProfit)}</TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5" /> vs Alternatives</CardTitle><CardDescription>Same money invested elsewhere for {holdingYears} years</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Option</TableHead><TableHead className="text-right">Profit</TableHead><TableHead className="text-right">Return</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow><TableCell className="font-medium">Real Estate</TableCell><TableCell className="text-right">{fmt(netProfit)}</TableCell><TableCell className="text-right">{annualizedROI.toFixed(1)}%</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">FD @7%</TableCell><TableCell className="text-right">{fmt(fdReturn)}</TableCell><TableCell className="text-right">7.0%</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium">Equity MF @12%</TableCell><TableCell className="text-right">{fmt(mfReturn)}</TableCell><TableCell className="text-right">12.0%</TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealEstateROICalculator;
