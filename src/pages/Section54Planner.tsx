import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, AlertTriangle, CheckCircle, Clock, Home, Building, Landmark, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExemptionSection {
  section: string;
  title: string;
  assetSold: string;
  investIn: string;
  maxExemption: string;
  lockIn: string;
  deadline: string;
  icon: any;
}

const exemptionSections: ExemptionSection[] = [
  { section: "54", title: "Residential House Property", assetSold: "Long-term residential house", investIn: "Purchase/construct new residential house", maxExemption: "Capital gains amount", lockIn: "3 years", deadline: "Purchase: 1yr before / 2yrs after | Construction: 3yrs after", icon: Home },
  { section: "54B", title: "Agricultural Land", assetSold: "Agricultural land (urban)", investIn: "Purchase new agricultural land", maxExemption: "Capital gains amount", lockIn: "3 years", deadline: "Within 2 years of sale", icon: Building },
  { section: "54D", title: "Compulsory Acquisition", assetSold: "Land/building (compulsory acquisition)", investIn: "Purchase land/building for industrial purpose", maxExemption: "Capital gains amount", lockIn: "3 years", deadline: "Within 3 years of receipt of compensation", icon: Building },
  { section: "54EC", title: "Capital Gain Bonds", assetSold: "Any long-term capital asset", investIn: "NHAI/REC/PFC bonds", maxExemption: "₹50 Lakhs per FY", lockIn: "5 years", deadline: "Within 6 months of sale", icon: Landmark },
  { section: "54F", title: "Any Asset (Not House)", assetSold: "Any long-term asset (other than house)", investIn: "Purchase/construct residential house", maxExemption: "Proportionate: (CG × Investment) / Net Sale Consideration", lockIn: "3 years", deadline: "Purchase: 1yr before / 2yrs after | Construction: 3yrs after", icon: Home },
  { section: "54G", title: "Industrial Undertaking", assetSold: "Land/building/machinery of urban industrial undertaking", investIn: "Shift to rural area – new assets", maxExemption: "Capital gains amount", lockIn: "3 years", deadline: "Within 1 year before / 3 years after transfer", icon: Building },
];

const Section54Planner = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState("54");
  const [saleDate, setSaleDate] = useState("2026-01-15");
  const [saleConsideration, setSaleConsideration] = useState(15000000);
  const [costOfAcquisition, setCostOfAcquisition] = useState(5000000);
  const [costOfImprovement, setCostOfImprovement] = useState(500000);
  const [indexedCost, setIndexedCost] = useState(true);
  const [ciiPurchaseYear, setCiiPurchaseYear] = useState(289); // 2015-16
  const [ciiSaleYear] = useState(363); // 2025-26 estimated
  const [investmentMade, setInvestmentMade] = useState(0);

  const indexedCostOfAcquisition = indexedCost ? Math.round((costOfAcquisition * ciiSaleYear) / ciiPurchaseYear) : costOfAcquisition;
  const indexedCostOfImprovement = indexedCost ? Math.round((costOfImprovement * ciiSaleYear) / ciiPurchaseYear) : costOfImprovement;
  const ltcg = saleConsideration - indexedCostOfAcquisition - indexedCostOfImprovement;

  const sectionInfo = exemptionSections.find(s => s.section === selectedSection)!;
  
  const maxExemption = useMemo(() => {
    if (selectedSection === "54EC") return Math.min(ltcg, 5000000);
    if (selectedSection === "54F") return investmentMade > 0 ? Math.round((ltcg * investmentMade) / saleConsideration) : ltcg;
    return ltcg;
  }, [selectedSection, ltcg, investmentMade, saleConsideration]);

  const exemptionClaimed = Math.min(investmentMade || maxExemption, maxExemption);
  const taxableGains = Math.max(0, ltcg - exemptionClaimed);
  const taxSaved = Math.round(exemptionClaimed * 0.125); // 12.5% LTCG

  // Deadline calculation
  const saleDateObj = new Date(saleDate);
  const deadlines = useMemo(() => {
    const d = new Date(saleDate);
    const results = [];
    if (selectedSection === "54" || selectedSection === "54F") {
      const purchaseBefore = new Date(d); purchaseBefore.setFullYear(d.getFullYear() - 1);
      const purchaseAfter = new Date(d); purchaseAfter.setFullYear(d.getFullYear() + 2);
      const constructAfter = new Date(d); constructAfter.setFullYear(d.getFullYear() + 3);
      const cgasDeadline = new Date(d.getFullYear(), 6, 31); // July 31 of next year
      if (cgasDeadline <= d) cgasDeadline.setFullYear(cgasDeadline.getFullYear() + 1);
      results.push({ event: "Purchase deadline", date: purchaseAfter, desc: "Buy new house within 2 years" });
      results.push({ event: "Construction deadline", date: constructAfter, desc: "Complete construction within 3 years" });
      results.push({ event: "CGAS deposit deadline", date: cgasDeadline, desc: "Deposit in Capital Gains Account Scheme before ITR due date" });
    } else if (selectedSection === "54EC") {
      const bondDeadline = new Date(d); bondDeadline.setMonth(d.getMonth() + 6);
      results.push({ event: "Bond investment deadline", date: bondDeadline, desc: "Invest in 54EC bonds within 6 months" });
    } else if (selectedSection === "54B") {
      const landDeadline = new Date(d); landDeadline.setFullYear(d.getFullYear() + 2);
      results.push({ event: "Purchase new land", date: landDeadline, desc: "Buy agricultural land within 2 years" });
    }
    return results;
  }, [saleDate, selectedSection]);

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");
  const formatDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const daysRemaining = (d: Date) => Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Section 54 Capital Gains Planner</h1>
            <p className="text-muted-foreground text-sm">Plan exemptions under Sec 54, 54EC, 54F & track investment deadlines</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Capital Gains Calculator</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Exemption Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {exemptionSections.map(s => <SelectItem key={s.section} value={s.section}>Sec {s.section} – {s.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Date of Sale</Label><Input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} /></div>
                <div><Label>Sale Consideration (₹)</Label><Input type="number" value={saleConsideration} onChange={e => setSaleConsideration(Number(e.target.value))} /></div>
                <div><Label>Cost of Acquisition (₹)</Label><Input type="number" value={costOfAcquisition} onChange={e => setCostOfAcquisition(Number(e.target.value))} /></div>
                <div><Label>Cost of Improvement (₹)</Label><Input type="number" value={costOfImprovement} onChange={e => setCostOfImprovement(Number(e.target.value))} /></div>
                <div><Label>Investment for Exemption (₹)</Label><Input type="number" value={investmentMade} onChange={e => setInvestmentMade(Number(e.target.value))} placeholder="Amount invested/to be invested" /></div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="text-xs text-muted-foreground">Indexed Cost</p><p className="text-lg font-bold">{formatCurrency(indexedCostOfAcquisition + indexedCostOfImprovement)}</p></div>
                    <div><p className="text-xs text-muted-foreground">LTCG</p><p className="text-lg font-bold text-primary">{formatCurrency(ltcg)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Exemption (Sec {selectedSection})</p><p className="text-lg font-bold text-green-500">{formatCurrency(exemptionClaimed)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Taxable Gains</p><p className="text-lg font-bold text-amber-500">{formatCurrency(taxableGains)}</p></div>
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-500 font-medium">Estimated Tax Saved: {formatCurrency(taxSaved)} (@ 12.5% LTCG)</p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Deadlines */}
          <div className="space-y-4">
            <Card className="border-amber-500/30">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-amber-500" /> Investment Deadlines</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {deadlines.map((dl, i) => {
                  const days = daysRemaining(dl.date);
                  const isUrgent = days < 90;
                  return (
                    <div key={i} className={`p-3 rounded-lg border ${isUrgent ? 'border-destructive/30 bg-destructive/5' : 'border-border'}`}>
                      <p className="font-medium text-sm">{dl.event}</p>
                      <p className="text-lg font-bold">{formatDate(dl.date)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {isUrgent ? <AlertTriangle className="h-4 w-4 text-destructive" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                        <span className={`text-sm ${isUrgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{days} days remaining</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{dl.desc}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Sections Reference */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Section 54 Family – Complete Reference</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Asset Sold</TableHead>
                    <TableHead>Invest In</TableHead>
                    <TableHead>Max Exemption</TableHead>
                    <TableHead>Lock-in</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exemptionSections.map(s => (
                    <TableRow key={s.section} className={selectedSection === s.section ? 'bg-primary/5' : ''}>
                      <TableCell className="font-semibold text-primary">Sec {s.section}</TableCell>
                      <TableCell className="text-sm">{s.assetSold}</TableCell>
                      <TableCell className="text-sm">{s.investIn}</TableCell>
                      <TableCell className="text-sm">{s.maxExemption}</TableCell>
                      <TableCell><Badge variant="outline">{s.lockIn}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px]">{s.deadline}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Important Notes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              "If the new asset is sold within the lock-in period, exemption claimed is reversed and taxed in the year of sale",
              "For Sec 54 & 54F: If investment is not made before ITR filing, deposit in Capital Gains Account Scheme (CGAS)",
              "Sec 54EC bonds: Maximum ₹50L investment per financial year across all 54EC bonds",
              "Sec 54F: You should not own more than one residential house (other than the new one) on the date of transfer",
              "Indexation benefit available for assets acquired before 23 July 2024 (grandfathering)",
              "Budget 2024: LTCG rate reduced to 12.5% without indexation for most assets from 23 July 2024",
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

export default Section54Planner;
