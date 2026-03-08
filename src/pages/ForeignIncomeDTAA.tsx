import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Globe, Calculator, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

const dtaaCountries: Record<string, { rate: number; article: string }> = {
  "USA": { rate: 15, article: "Article 10/11/12" },
  "UK": { rate: 15, article: "Article 11/12" },
  "Singapore": { rate: 15, article: "Article 11" },
  "UAE": { rate: 0, article: "No DTAA (but no tax in UAE)" },
  "Germany": { rate: 10, article: "Article 11" },
  "Canada": { rate: 15, article: "Article 11/12" },
  "Australia": { rate: 15, article: "Article 11" },
  "Japan": { rate: 10, article: "Article 11" },
  "France": { rate: 10, article: "Article 11" },
  "Netherlands": { rate: 10, article: "Article 11/12" },
  "Switzerland": { rate: 10, article: "Article 11" },
  "Ireland": { rate: 10, article: "Article 11" },
  "Hong Kong": { rate: 10, article: "Article 11" },
  "South Korea": { rate: 15, article: "Article 11" },
  "China": { rate: 10, article: "Article 11" },
};

const ForeignIncomeDTAA = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [fy, setFY] = useState("2025-26");

  // Residency determination
  const [daysInIndia, setDaysInIndia] = useState(200);
  const [daysInIndiaPrev4, setDaysInIndiaPrev4] = useState(500);
  const [daysInIndiaPrev7, setDaysInIndiaPrev7] = useState(1200);
  const [indiaIncomeLessThan15L, setIndiaIncomeLessThan15L] = useState(false);
  const [indianCitizen, setIndianCitizen] = useState(true);

  // Foreign Income
  const [country, setCountry] = useState("USA");
  const [foreignSalary, setForeignSalary] = useState(0);
  const [foreignInterest, setForeignInterest] = useState(500000);
  const [foreignDividend, setForeignDividend] = useState(200000);
  const [foreignCapitalGains, setForeignCapitalGains] = useState(0);
  const [foreignRentalIncome, setForeignRentalIncome] = useState(0);
  const [taxPaidAbroad, setTaxPaidAbroad] = useState(80000);
  const [indianIncome, setIndianIncome] = useState(1500000);

  // Residency Status
  const residencyStatus = useMemo(() => {
    if (daysInIndia >= 182) return "Resident";
    if (daysInIndia >= 60 && daysInIndiaPrev4 >= 365) {
      if (indianCitizen && indiaIncomeLessThan15L) return "Non-Resident (NRI)"; // relaxation
      return "Resident";
    }
    return "Non-Resident (NRI)";
  }, [daysInIndia, daysInIndiaPrev4, indianCitizen, indiaIncomeLessThan15L]);

  const isRNOR = useMemo(() => {
    if (residencyStatus !== "Resident") return false;
    if (daysInIndiaPrev7 < 730) return true;
    // Simplified check
    return false;
  }, [residencyStatus, daysInIndiaPrev7]);

  const effectiveStatus = isRNOR ? "RNOR" : residencyStatus;

  const totalForeignIncome = foreignSalary + foreignInterest + foreignDividend + foreignCapitalGains + foreignRentalIncome;
  const totalGlobalIncome = totalForeignIncome + indianIncome;

  // DTAA relief
  const dtaaRate = dtaaCountries[country]?.rate || 20;
  const dtaaArticle = dtaaCountries[country]?.article || "N/A";

  // Foreign Tax Credit (FTC) calculation
  const indianTaxRate = totalGlobalIncome > 1500000 ? 30 : totalGlobalIncome > 1200000 ? 20 : totalGlobalIncome > 900000 ? 15 : 10;
  const indianTaxOnForeignIncome = Math.round(totalForeignIncome * indianTaxRate / 100);
  const ftcAllowed = Math.min(taxPaidAbroad, indianTaxOnForeignIncome);

  const taxableInIndia = useMemo(() => {
    if (effectiveStatus === "Non-Resident (NRI)") return indianIncome; // Only Indian income taxable
    if (effectiveStatus === "RNOR") return indianIncome + foreignSalary; // Indian + salary received in India
    return totalGlobalIncome; // Resident: Global income
  }, [effectiveStatus, indianIncome, totalGlobalIncome, foreignSalary]);

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => goBack()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Foreign Income & DTAA Calculator</h1>
            <p className="text-muted-foreground text-sm">Determine residency status, calculate FTC & DTAA relief</p>
          </div>
        </div>

        {/* Residency Status Badge */}
        <Card className={`mb-6 ${effectiveStatus === "Non-Resident (NRI)" ? 'border-blue-500/40 bg-blue-500/5' : effectiveStatus === "RNOR" ? 'border-amber-500/40 bg-amber-500/5' : 'border-green-500/40 bg-green-500/5'}`}>
          <CardContent className="pt-6 flex items-center gap-4">
            <Globe className="h-10 w-10 text-primary" />
            <div>
              <p className="text-xl font-bold">Residency Status: {effectiveStatus}</p>
              <p className="text-sm text-muted-foreground">
                {effectiveStatus === "Resident" && "Global income is taxable in India. Claim FTC/DTAA relief for double taxation."}
                {effectiveStatus === "RNOR" && "Only Indian income & income received in India is taxable. Foreign income from outside India is exempt."}
                {effectiveStatus === "Non-Resident (NRI)" && "Only Indian-sourced income is taxable. Foreign income is NOT taxable in India."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Residency Inputs */}
          <Card>
            <CardHeader><CardTitle>Residency Determination</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Days in India (Current FY)</Label><Input type="number" value={daysInIndia} onChange={e => setDaysInIndia(Number(e.target.value))} max={366} /></div>
              <div><Label>Days in India (Previous 4 FYs total)</Label><Input type="number" value={daysInIndiaPrev4} onChange={e => setDaysInIndiaPrev4(Number(e.target.value))} /></div>
              <div><Label>Days in India (Previous 7 FYs total)</Label><Input type="number" value={daysInIndiaPrev7} onChange={e => setDaysInIndiaPrev7(Number(e.target.value))} /></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Indian Citizen / PIO?</Label>
                <Switch checked={indianCitizen} onCheckedChange={setIndianCitizen} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Indian income &lt; ₹15L? (60-day relaxation)</Label>
                <Switch checked={indiaIncomeLessThan15L} onCheckedChange={setIndiaIncomeLessThan15L} />
              </div>
            </CardContent>
          </Card>

          {/* Foreign Income */}
          <Card>
            <CardHeader><CardTitle>Foreign Income Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Country of Foreign Income</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.keys(dtaaCountries).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Foreign Salary (₹)</Label><Input type="number" value={foreignSalary || ""} onChange={e => setForeignSalary(Number(e.target.value))} /></div>
                <div><Label className="text-xs">Foreign Interest (₹)</Label><Input type="number" value={foreignInterest || ""} onChange={e => setForeignInterest(Number(e.target.value))} /></div>
                <div><Label className="text-xs">Foreign Dividends (₹)</Label><Input type="number" value={foreignDividend || ""} onChange={e => setForeignDividend(Number(e.target.value))} /></div>
                <div><Label className="text-xs">Foreign Capital Gains (₹)</Label><Input type="number" value={foreignCapitalGains || ""} onChange={e => setForeignCapitalGains(Number(e.target.value))} /></div>
                <div><Label className="text-xs">Foreign Rental Income (₹)</Label><Input type="number" value={foreignRentalIncome || ""} onChange={e => setForeignRentalIncome(Number(e.target.value))} /></div>
                <div><Label className="text-xs">Tax Paid Abroad (₹)</Label><Input type="number" value={taxPaidAbroad || ""} onChange={e => setTaxPaidAbroad(Number(e.target.value))} /></div>
              </div>
              <div><Label>Indian Income (₹)</Label><Input type="number" value={indianIncome} onChange={e => setIndianIncome(Number(e.target.value))} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Foreign Income</p><p className="text-lg font-bold">{formatCurrency(totalForeignIncome)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Taxable in India</p><p className="text-lg font-bold text-primary">{formatCurrency(taxableInIndia)}</p></CardContent></Card>
          <Card className="bg-green-500/5 border-green-500/20"><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">FTC Allowed</p><p className="text-lg font-bold text-green-500">{formatCurrency(ftcAllowed)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">DTAA Rate ({country})</p><p className="text-lg font-bold text-primary">{dtaaRate}%</p></CardContent></Card>
        </div>

        {/* DTAA Reference */}
        <Card className="mt-6">
          <CardHeader><CardTitle>DTAA Rates with Major Countries</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Country</TableHead><TableHead className="text-right">Max Rate (%)</TableHead><TableHead>Article</TableHead></TableRow></TableHeader>
                <TableBody>
                  {Object.entries(dtaaCountries).map(([c, info]) => (
                    <TableRow key={c} className={c === country ? 'bg-primary/5' : ''}>
                      <TableCell className="font-medium">{c}</TableCell>
                      <TableCell className="text-right font-semibold">{info.rate}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{info.article}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Form 67 Info */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Form 67 – Foreign Tax Credit</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              "Form 67 MUST be filed BEFORE filing ITR to claim Foreign Tax Credit",
              "File electronically on the income tax portal under 'e-File' → 'Income Tax Forms'",
              "Attach: Certificate of tax deducted/paid abroad, Tax Residency Certificate (TRC)",
              "FTC is limited to: Lower of (a) tax paid abroad, (b) Indian tax on that income",
              "FTC can be claimed only in the year the corresponding foreign income is offered to tax",
              "Doubly Taxed Income (DTI) must be computed separately for each country",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 p-2">
                <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForeignIncomeDTAA;
