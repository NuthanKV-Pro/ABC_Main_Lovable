import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Info, FileText, Building, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const TaxAuditChecker = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [entityType, setEntityType] = useState("individual");
  const [businessType, setBusinessType] = useState("business");
  const [turnover, setTurnover] = useState(12000000);
  const [grossReceipts, setGrossReceipts] = useState(5000000);
  const [cashReceipts, setCashReceipts] = useState(400000);
  const [cashPayments, setCashPayments] = useState(300000);
  const [profitDeclared, setProfitDeclared] = useState(800000);
  const [optedPresumptive, setOptedPresumptive] = useState(false);
  const [previousYearPresumptive, setPreviousYearPresumptive] = useState(false);
  const [totalIncome, setTotalIncome] = useState(600000);
  const [digitalTurnoverPct, setDigitalTurnoverPct] = useState(80);
  const [assessmentYear, setAssessmentYear] = useState("2026-27");

  const analysis = useMemo(() => {
    const results: { rule: string; applicable: boolean; details: string; section: string; severity: 'required' | 'optional' | 'exempt' }[] = [];

    // Section 44AB thresholds
    const effectiveLimit = businessType === "business" ? (digitalTurnoverPct >= 95 ? 100000000 : 10000000) : 5000000;

    const relevantAmount = businessType === "business" ? turnover : grossReceipts;

    if (businessType === "business") {
      results.push({
        rule: "Business turnover exceeds limit",
        applicable: turnover > effectiveLimit,
        details: `Turnover: ₹${(turnover/100000).toFixed(1)}L vs Limit: ₹${(effectiveLimit/10000000).toFixed(0)}Cr ${digitalTurnoverPct >= 95 ? '(digital ≥95%)' : '(digital <95%)'}`,
        section: "44AB(a)",
        severity: turnover > effectiveLimit ? 'required' : 'exempt'
      });
    }

    if (businessType === "profession") {
      results.push({
        rule: "Professional receipts exceed ₹50L",
        applicable: grossReceipts > 5000000,
        details: `Gross Receipts: ₹${(grossReceipts/100000).toFixed(1)}L vs Limit: ₹50L`,
        section: "44AB(b)",
        severity: grossReceipts > 5000000 ? 'required' : 'exempt'
      });
    }

    // 44AD Presumptive
    if (businessType === "business" && optedPresumptive) {
      const minProfit = turnover * (digitalTurnoverPct >= 95 ? 6 : 8) / 100;
      results.push({
        rule: "Presumptive income (44AD) – Profit below threshold",
        applicable: profitDeclared < minProfit && totalIncome > 250000,
        details: `Declared: ₹${(profitDeclared/100000).toFixed(1)}L | Min required (${digitalTurnoverPct >= 95 ? '6%' : '8%'}): ₹${(minProfit/100000).toFixed(1)}L`,
        section: "44AD(5)",
        severity: profitDeclared < minProfit ? 'required' : 'exempt'
      });
    }

    // 44ADA Presumptive for professionals
    if (businessType === "profession" && optedPresumptive) {
      const minProfitProf = grossReceipts * 50 / 100;
      results.push({
        rule: "Presumptive income (44ADA) – Below 50% of receipts",
        applicable: profitDeclared < minProfitProf && totalIncome > 250000,
        details: `Declared: ₹${(profitDeclared/100000).toFixed(1)}L | Min 50%: ₹${(minProfitProf/100000).toFixed(1)}L`,
        section: "44ADA(4)",
        severity: profitDeclared < minProfitProf ? 'required' : 'exempt'
      });
    }

    // Previous year presumptive opt-out
    if (previousYearPresumptive && !optedPresumptive) {
      results.push({
        rule: "Opted out of presumptive scheme – 5 year lock-in",
        applicable: true,
        details: "If you declared presumptive income previously and opt out, audit is required for next 5 years",
        section: "44AD(4)/44ADA(4)",
        severity: 'required'
      });
    }

    // Cash transaction checks
    if (cashReceipts > 200000) {
      results.push({
        rule: "Cash receipts > ₹2L from single person",
        applicable: true,
        details: "Section 269ST: Penalty equal to amount received",
        section: "269ST",
        severity: 'required'
      });
    }

    return results;
  }, [turnover, grossReceipts, businessType, profitDeclared, optedPresumptive, previousYearPresumptive, totalIncome, digitalTurnoverPct, cashReceipts]);

  const auditRequired = analysis.some(a => a.applicable && a.severity === 'required');
  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  const auditDeadline = assessmentYear === "2026-27" ? "30th September 2026" : assessmentYear === "2025-26" ? "30th September 2025" : "30th September 2024";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => goBack()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tax Audit Checker</h1>
            <p className="text-muted-foreground text-sm">Check if Section 44AB audit is applicable & verify presumptive taxation eligibility</p>
          </div>
        </div>

        {/* Verdict */}
        <Card className={`mb-6 ${auditRequired ? 'border-destructive/40 bg-destructive/5' : 'border-green-500/40 bg-green-500/5'}`}>
          <CardContent className="pt-6 flex items-center gap-4">
            {auditRequired ? <AlertTriangle className="h-10 w-10 text-destructive" /> : <CheckCircle className="h-10 w-10 text-green-500" />}
            <div>
              <p className="text-xl font-bold">{auditRequired ? "Tax Audit IS Required" : "Tax Audit NOT Required"}</p>
              <p className="text-sm text-muted-foreground">Based on your inputs for AY {assessmentYear} | Audit deadline: {auditDeadline}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Business Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Entity Type</Label>
                  <Select value={entityType} onValueChange={setEntityType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="huf">HUF</SelectItem>
                      <SelectItem value="firm">Partnership Firm</SelectItem>
                      <SelectItem value="llp">LLP</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nature</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business (44AD)</SelectItem>
                      <SelectItem value="profession">Profession (44ADA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assessment Year</Label>
                  <Select value={assessmentYear} onValueChange={setAssessmentYear}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-25">AY 2024-25</SelectItem>
                      <SelectItem value="2025-26">AY 2025-26</SelectItem>
                      <SelectItem value="2026-27">AY 2026-27</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessType === "business" ? (
                  <div><Label>Annual Turnover (₹)</Label><Input type="number" value={turnover} onChange={e => setTurnover(Number(e.target.value))} /></div>
                ) : (
                  <div><Label>Gross Professional Receipts (₹)</Label><Input type="number" value={grossReceipts} onChange={e => setGrossReceipts(Number(e.target.value))} /></div>
                )}
                <div><Label>Profit Declared (₹)</Label><Input type="number" value={profitDeclared} onChange={e => setProfitDeclared(Number(e.target.value))} /></div>
                <div><Label>Total Income (₹)</Label><Input type="number" value={totalIncome} onChange={e => setTotalIncome(Number(e.target.value))} /></div>
                {businessType === "business" && (
                  <div><Label>Digital Receipts (% of turnover)</Label><Input type="number" value={digitalTurnoverPct} onChange={e => setDigitalTurnoverPct(Number(e.target.value))} min={0} max={100} /></div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>Opted for Presumptive Taxation?</Label>
                  <Switch checked={optedPresumptive} onCheckedChange={setOptedPresumptive} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>Was on Presumptive in previous year?</Label>
                  <Switch checked={previousYearPresumptive} onCheckedChange={setPreviousYearPresumptive} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Threshold Limits</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Business (cash >5%)", limit: "₹1 Crore", section: "44AB(a)" },
                { label: "Business (digital ≥95%)", limit: "₹10 Crore", section: "44AB(a)" },
                { label: "Profession", limit: "₹50 Lakhs", section: "44AB(b)" },
                { label: "Presumptive 44AD", limit: "₹3 Crore", section: "44AD" },
                { label: "Presumptive 44ADA", limit: "₹75 Lakhs", section: "44ADA" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded border">
                  <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.section}</p></div>
                  <Badge variant="outline">{item.limit}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Detailed Analysis</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule / Check</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.map((a, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{a.rule}</TableCell>
                    <TableCell><Badge variant="outline">{a.section}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[300px]">{a.details}</TableCell>
                    <TableCell>
                      <Badge variant={a.applicable ? "destructive" : "default"}>
                        {a.applicable ? "⚠ Audit Required" : "✓ Not Applicable"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Penalty Info */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Penalties for Non-Compliance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              "Failure to get audit: Penalty of 0.5% of turnover or ₹1,50,000 whichever is less (Sec 271B)",
              "Late filing (after audit deadline): ₹5,000/day u/s 234F + Interest u/s 234A",
              "Disallowance of expenses: 30% of expenses not supported by audit (Sec 40(a)(ia))",
              "Loss of presumptive benefit: Cannot opt for presumptive for next 5 years once opted out",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaxAuditChecker;
