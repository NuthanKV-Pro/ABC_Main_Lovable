import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calculator, IndianRupee, FileText, CheckCircle, AlertTriangle, Download, Link2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTaxData } from "@/hooks/useTaxData";
import { useToast } from "@/hooks/use-toast";
import { useAutoPopulate } from "@/hooks/useAutoPopulate";
import AutoPopulateBadge from "@/components/AutoPopulateBadge";
import { TooltipProvider } from "@/components/ui/tooltip";

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

interface TDSEntry {
  id: string;
  section: string;
  description: string;
  payer: string;
  amount: number;
  tdsRate: number;
  tdsDeducted: number;
  quarter: string;
  status: 'Matched' | 'Mismatch' | 'Pending';
}

const tdsRates: Record<string, { rate: number; threshold: number; description: string }> = {
  "192": { rate: 0, threshold: 0, description: "Salary – As per slab rates" },
  "193": { rate: 10, threshold: 5000, description: "Interest on Securities" },
  "194": { rate: 10, threshold: 5000, description: "Dividends" },
  "194A": { rate: 10, threshold: 40000, description: "Interest other than securities (Bank FD etc.)" },
  "194B": { rate: 30, threshold: 10000, description: "Lottery / Crossword Puzzle" },
  "194C": { rate: 1, threshold: 30000, description: "Contractor Payments (Individual/HUF)" },
  "194C_other": { rate: 2, threshold: 30000, description: "Contractor Payments (Others)" },
  "194H": { rate: 5, threshold: 15000, description: "Commission / Brokerage" },
  "194I_land": { rate: 10, threshold: 240000, description: "Rent – Land / Building" },
  "194I_plant": { rate: 2, threshold: 240000, description: "Rent – Plant & Machinery" },
  "194J_tech": { rate: 2, threshold: 30000, description: "Professional / Technical Services (Tech)" },
  "194J_prof": { rate: 10, threshold: 30000, description: "Professional / Technical Services (Prof)" },
  "194N": { rate: 2, threshold: 10000000, description: "Cash Withdrawal > ₹1Cr" },
  "194O": { rate: 1, threshold: 500000, description: "E-Commerce Participant" },
  "194Q": { rate: 0.1, threshold: 5000000, description: "Purchase of Goods" },
  "195": { rate: 20, threshold: 0, description: "Payment to NRI (Other income)" },
  "196B": { rate: 10, threshold: 0, description: "Income from Foreign Institutional Investor" },
};

const TDSCalculator = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { toast } = useToast();
  const taxData = useTaxData();
  const [selectedSection, setSelectedSection] = useState("194A");
  const [paymentAmount, setPaymentAmount] = useState<number>(500000);
  const [panAvailable, setPanAvailable] = useState("yes");
  const [panNumber, setPanNumber] = useState("");
  const [importedFromSalary, setImportedFromSalary] = useState(false);

  const { populatedFields, resetField } = useAutoPopulate([
    { key: "pan", setter: (v) => setPanNumber(v as string), defaultValue: "" },
  ]);

  // Auto-set PAN available when PAN is populated
  useEffect(() => {
    if (panNumber && panNumber.length === 10) {
      setPanAvailable("yes");
    }
  }, [panNumber]);

  const [form26ASEntries, setForm26ASEntries] = useState<TDSEntry[]>([
    { id: "1", section: "192", description: "Salary", payer: "ABC Pvt Ltd", amount: 1200000, tdsRate: 10, tdsDeducted: 120000, quarter: "Q1-Q4", status: "Matched" },
    { id: "2", section: "194A", description: "Bank FD Interest", payer: "SBI", amount: 85000, tdsRate: 10, tdsDeducted: 8500, quarter: "Q4", status: "Matched" },
    { id: "3", section: "194A", description: "FD Interest", payer: "HDFC Bank", amount: 62000, tdsRate: 10, tdsDeducted: 6200, quarter: "Q3", status: "Mismatch" },
    { id: "4", section: "194J", description: "Consulting Fees", payer: "XYZ Corp", amount: 200000, tdsRate: 10, tdsDeducted: 20000, quarter: "Q2", status: "Matched" },
    { id: "5", section: "194H", description: "Commission", payer: "Insurance Co", amount: 45000, tdsRate: 5, tdsDeducted: 2250, quarter: "Q1", status: "Pending" },
  ]);

  const importSalaryData = () => {
    if (!taxData.salary.hasData || !taxData.salary.data) return;
    const salaryAmount = taxData.salary.grossIncome;
    const employerName = taxData.salary.data.employerName || "Employer";
    // Estimate TDS on salary at ~10% as placeholder
    const estimatedTDS = Math.round(salaryAmount * 0.1);
    
    // Check if salary entry already exists
    const existingIdx = form26ASEntries.findIndex(e => e.section === "192" && e.payer === employerName);
    if (existingIdx >= 0) {
      setForm26ASEntries(prev => prev.map((e, i) => 
        i === existingIdx ? { ...e, amount: salaryAmount, tdsDeducted: estimatedTDS, payer: employerName } : e
      ));
    } else {
      setForm26ASEntries(prev => [...prev, {
        id: Date.now().toString(),
        section: "192",
        description: "Salary",
        payer: employerName,
        amount: salaryAmount,
        tdsRate: 10,
        tdsDeducted: estimatedTDS,
        quarter: "Q1-Q4",
        status: "Pending" as const,
      }]);
    }
    setImportedFromSalary(true);
    toast({ title: "Salary data imported", description: `₹${salaryAmount.toLocaleString('en-IN')} salary from ${employerName} added to TDS tracker.` });
  };

  const [newEntry, setNewEntry] = useState({ section: "194A", payer: "", amount: 0, tdsDeducted: 0, quarter: "Q1" });

  const sectionInfo = tdsRates[selectedSection];
  const effectiveRate = panAvailable === "no" ? 20 : sectionInfo?.rate || 0;
  const tdsAmount = selectedSection === "192" ? 0 : (paymentAmount * effectiveRate) / 100;
  const isAboveThreshold = paymentAmount > (sectionInfo?.threshold || 0);

  const totalTDS = useMemo(() => form26ASEntries.reduce((sum, e) => sum + e.tdsDeducted, 0), [form26ASEntries]);
  const matchedTDS = useMemo(() => form26ASEntries.filter(e => e.status === "Matched").reduce((sum, e) => sum + e.tdsDeducted, 0), [form26ASEntries]);
  const mismatchCount = form26ASEntries.filter(e => e.status === "Mismatch").length;

  const quarterlyData = useMemo(() => {
    const quarters = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    form26ASEntries.forEach(e => {
      if (e.quarter.includes("Q1")) quarters.Q1 += e.tdsDeducted;
      if (e.quarter.includes("Q2")) quarters.Q2 += e.tdsDeducted;
      if (e.quarter.includes("Q3")) quarters.Q3 += e.tdsDeducted;
      if (e.quarter.includes("Q4")) quarters.Q4 += e.tdsDeducted;
    });
    return Object.entries(quarters).map(([q, val]) => ({ quarter: q, amount: val }));
  }, [form26ASEntries]);

  const sectionWiseData = useMemo(() => {
    const map: Record<string, number> = {};
    form26ASEntries.forEach(e => {
      map[`Sec ${e.section}`] = (map[`Sec ${e.section}`] || 0) + e.tdsDeducted;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [form26ASEntries]);

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN");

  const addEntry = () => {
    if (!newEntry.payer || newEntry.amount <= 0) return;
    const rate = tdsRates[newEntry.section]?.rate || 10;
    setForm26ASEntries(prev => [...prev, {
      id: Date.now().toString(),
      section: newEntry.section,
      description: tdsRates[newEntry.section]?.description || "",
      payer: newEntry.payer,
      amount: newEntry.amount,
      tdsRate: rate,
      tdsDeducted: newEntry.tdsDeducted,
      quarter: newEntry.quarter,
      status: Math.abs(newEntry.tdsDeducted - (newEntry.amount * rate / 100)) < 1 ? "Matched" : "Mismatch"
    }]);
    setNewEntry({ section: "194A", payer: "", amount: 0, tdsDeducted: 0, quarter: "Q1" });
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => goBack()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">TDS Calculator & Tracker</h1>
              <p className="text-muted-foreground text-sm">Calculate TDS rates by section & reconcile Form 26AS</p>
            </div>
          </div>
          {taxData.salary.hasData && !importedFromSalary && (
            <Button variant="outline" className="gap-2 border-primary/50" onClick={importSalaryData}>
              <Link2 className="h-4 w-4" />
              Import Salary Data
            </Button>
          )}
          {importedFromSalary && (
            <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" /> Salary Imported</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TDS Calculator */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> TDS Rate Calculator</CardTitle>
              <CardDescription>Select section to calculate applicable TDS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>TDS Section</Label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(tdsRates).map(([key, val]) => (
                        <SelectItem key={key} value={key}>Sec {key.replace("_", " ")} – {val.description.slice(0, 35)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Amount (₹)</Label>
                  <Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="flex items-center">
                    PAN Number
                    <AutoPopulateBadge fieldKey="pan" populatedFields={populatedFields} onReset={resetField} />
                  </Label>
                  <Input 
                    value={panNumber} 
                    onChange={e => setPanNumber(e.target.value.toUpperCase())} 
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label>PAN Available?</Label>
                  <Select value={panAvailable} onValueChange={setPanAvailable}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No (20% rate applies)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">{sectionInfo?.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><p className="text-xs text-muted-foreground">Rate</p><p className="text-lg font-bold text-primary">{effectiveRate}%</p></div>
                    <div><p className="text-xs text-muted-foreground">Threshold</p><p className="text-lg font-bold">{formatCurrency(sectionInfo?.threshold || 0)}</p></div>
                    <div><p className="text-xs text-muted-foreground">TDS Amount</p><p className="text-lg font-bold text-primary">{formatCurrency(tdsAmount)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Net Payment</p><p className="text-lg font-bold">{formatCurrency(paymentAmount - tdsAmount)}</p></div>
                  </div>
                  {!isAboveThreshold && selectedSection !== "192" && (
                    <div className="flex items-center gap-2 text-sm text-amber-500 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      Amount is below threshold – TDS may not apply
                    </div>
                  )}
                  {panAvailable === "no" && (
                    <div className="flex items-center gap-2 text-sm text-destructive mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      Without PAN, TDS is deducted at 20% (Section 206AA)
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Total TDS (26AS)</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalTDS)}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Matched TDS</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(matchedTDS)}</p>
                <Progress value={totalTDS > 0 ? (matchedTDS / totalTDS) * 100 : 0} className="mt-2" />
              </CardContent>
            </Card>
            <Card className={`${mismatchCount > 0 ? 'bg-destructive/5 border-destructive/20' : 'bg-green-500/5 border-green-500/20'}`}>
              <CardContent className="pt-4 text-center">
                <p className="text-sm text-muted-foreground">Mismatches</p>
                <p className={`text-2xl font-bold ${mismatchCount > 0 ? 'text-destructive' : 'text-green-500'}`}>{mismatchCount}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Quarterly TDS Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Section-wise Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={sectionWiseData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {sectionWiseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Add Entry */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Add TDS Entry</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Section</Label>
                <Select value={newEntry.section} onValueChange={v => setNewEntry(p => ({ ...p, section: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(tdsRates).map(k => <SelectItem key={k} value={k}>Sec {k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Payer</Label>
                <Input value={newEntry.payer} onChange={e => setNewEntry(p => ({ ...p, payer: e.target.value }))} placeholder="Payer name" />
              </div>
              <div>
                <Label className="text-xs">Amount</Label>
                <Input type="number" value={newEntry.amount || ""} onChange={e => setNewEntry(p => ({ ...p, amount: Number(e.target.value) }))} />
              </div>
              <div>
                <Label className="text-xs">TDS Deducted</Label>
                <Input type="number" value={newEntry.tdsDeducted || ""} onChange={e => setNewEntry(p => ({ ...p, tdsDeducted: Number(e.target.value) }))} />
              </div>
              <div className="flex items-end">
                <Button onClick={addEntry} className="w-full">Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form 26AS Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Form 26AS Reconciliation</CardTitle>
            <CardDescription>Track and reconcile TDS entries with your Form 26AS</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">TDS</TableHead>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {form26ASEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.section}</TableCell>
                      <TableCell>{entry.payer}</TableCell>
                      <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
                      <TableCell className="text-right">{entry.tdsRate}%</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(entry.tdsDeducted)}</TableCell>
                      <TableCell>{entry.quarter}</TableCell>
                      <TableCell>
                        <Badge variant={entry.status === "Matched" ? "default" : entry.status === "Mismatch" ? "destructive" : "secondary"}>
                          {entry.status === "Matched" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {entry.status === "Mismatch" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {entry.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* TDS Rate Reference */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">TDS Rate Reference (AY 2026-27)</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Nature of Payment</TableHead>
                    <TableHead className="text-right">Rate (%)</TableHead>
                    <TableHead className="text-right">Threshold (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(tdsRates).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono">{key.replace("_", " ")}</TableCell>
                      <TableCell>{val.description}</TableCell>
                      <TableCell className="text-right font-semibold">{val.rate}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(val.threshold)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TDSCalculator;
