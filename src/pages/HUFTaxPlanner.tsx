import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, ArrowLeft, IndianRupee, TrendingUp, PiggyBank } from "lucide-react";
import ResetConfirmDialog from "@/components/ResetConfirmDialog";
import { useGoBack } from "@/hooks/useGoBack";
import ExportButton from "@/components/ExportButton";
import { ExportConfig } from "@/utils/unifiedExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Member { id: string; name: string; relation: string; panNumber: string; }
interface IncomeEntry { id: string; source: string; type: string; amount: number; }

const OLD_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: Infinity, rate: 0.30 },
];

const calcTax = (income: number, deductions: number): number => {
  const taxable = Math.max(0, income - deductions);
  let tax = 0;
  for (const slab of OLD_SLABS) {
    if (taxable > slab.min) tax += (Math.min(taxable, slab.max) - slab.min) * slab.rate;
  }
  return Math.round(tax * 1.04);
};

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const HUFTaxPlanner = () => {
  const goBack = useGoBack();
  const [hufName, setHufName] = useState("");
  const [kartaName, setKartaName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [ded80C, setDed80C] = useState(0);
  const [ded80D, setDed80D] = useState(0);
  const [indIncome, setIndIncome] = useState(0);
  const [indDed, setIndDed] = useState(0);

  useEffect(() => {
    const s = localStorage.getItem("huf_planner_data");
    if (s) { const d = JSON.parse(s); setHufName(d.hufName||""); setKartaName(d.kartaName||""); setMembers(d.members||[]); setIncomes(d.incomes||[]); setDed80C(d.ded80C||0); setDed80D(d.ded80D||0); setIndIncome(d.indIncome||0); setIndDed(d.indDed||0); }
  }, []);
  useEffect(() => {
    localStorage.setItem("huf_planner_data", JSON.stringify({ hufName, kartaName, members, incomes, ded80C, ded80D, indIncome, indDed }));
  }, [hufName, kartaName, members, incomes, ded80C, ded80D, indIncome, indDed]);

  const addMember = () => setMembers([...members, { id: crypto.randomUUID(), name: "", relation: "Coparcener", panNumber: "" }]);
  const addIncome = () => setIncomes([...incomes, { id: crypto.randomUUID(), source: "", type: "Rental", amount: 0 }]);

  const totalHUF = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const hufDed = ded80C + ded80D;
  const hufTax = calcTax(totalHUF, hufDed);
  const withoutHUF = calcTax(indIncome + totalHUF, indDed);
  const withHUF = calcTax(indIncome, indDed) + hufTax;
  const savings = Math.max(0, withoutHUF - withHUF);

  const getExportConfig = (): ExportConfig => ({
    title: "HUF Tax Planner Report", fileNamePrefix: "huf-tax-plan",
    sections: [
      { title: "HUF Details", keyValues: [["HUF Name", hufName], ["Karta", kartaName], ["Members", String(members.length + 1)]] },
      { title: "HUF Income", table: { head: ["Source", "Type", "Amount"], body: incomes.map(i => [i.source || "-", i.type, fmt(i.amount)]) } },
      { title: "Tax Comparison", keyValues: [["Without HUF", fmt(withoutHUF)], ["With HUF", fmt(withHUF)], ["Savings", fmt(savings)]] },
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Users className="h-6 w-6 text-primary" /> HUF Tax Planner</h1>
              <p className="text-sm text-muted-foreground">Plan tax savings through Hindu Undivided Family structure</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ResetConfirmDialog onConfirm={() => {
              localStorage.removeItem('huf_planner_data');
              setHufName(""); setKartaName(""); setMembers([]); setIncomes([]);
              setDed80C(0); setDed80D(0); setIndIncome(0); setIndDed(0);
            }} />
            <ExportButton getConfig={getExportConfig} />
          </div>
        </div>

        <Tabs defaultValue="setup" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">HUF Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>HUF Name</Label><Input placeholder="e.g., Sharma HUF" value={hufName} onChange={e => setHufName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Karta Name</Label><Input placeholder="e.g., Rajesh Sharma" value={kartaName} onChange={e => setKartaName(e.target.value)} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Members (Coparceners)</CardTitle>
                  <Button size="sm" onClick={addMember}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">No members added yet.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Relation</TableHead><TableHead>PAN</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                    <TableBody>
                      {members.map(m => (
                        <TableRow key={m.id}>
                          <TableCell><Input value={m.name} onChange={e => setMembers(members.map(x => x.id === m.id ? { ...x, name: e.target.value } : x))} /></TableCell>
                          <TableCell>
                            <Select value={m.relation} onValueChange={v => setMembers(members.map(x => x.id === m.id ? { ...x, relation: v } : x))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{["Coparcener","Spouse","Son","Daughter","Other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell><Input value={m.panNumber} onChange={e => setMembers(members.map(x => x.id === m.id ? { ...x, panNumber: e.target.value } : x))} placeholder="ABCDE1234F" /></TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => setMembers(members.filter(x => x.id !== m.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">HUF Income Sources</CardTitle>
                  <Button size="sm" onClick={addIncome}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {incomes.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">No income entries.</p> : incomes.map(inc => (
                  <div key={inc.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input value={inc.source} onChange={e => setIncomes(incomes.map(x => x.id === inc.id ? { ...x, source: e.target.value } : x))} placeholder="Source" />
                      <Select value={inc.type} onValueChange={v => setIncomes(incomes.map(x => x.id === inc.id ? { ...x, type: v } : x))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["Rental","Business","Interest","Capital Gains","Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" className="pl-9" value={inc.amount || ""} onChange={e => setIncomes(incomes.map(x => x.id === inc.id ? { ...x, amount: parseFloat(e.target.value) || 0 } : x))} />
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIncomes(incomes.filter(x => x.id !== inc.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">HUF Deductions</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Section 80C (max ₹1,50,000)</Label><Input type="number" value={ded80C || ""} onChange={e => setDed80C(Math.min(150000, parseFloat(e.target.value) || 0))} /></div>
                <div className="space-y-2"><Label>Section 80D (max ₹25,000)</Label><Input type="number" value={ded80D || ""} onChange={e => setDed80D(Math.min(25000, parseFloat(e.target.value) || 0))} /></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Your Individual Income</CardTitle><CardDescription>For comparison with HUF splitting</CardDescription></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Individual Gross Income</Label><Input type="number" value={indIncome || ""} onChange={e => setIndIncome(parseFloat(e.target.value) || 0)} /></div>
                <div className="space-y-2"><Label>Individual Deductions</Label><Input type="number" value={indDed || ""} onChange={e => setIndDed(parseFloat(e.target.value) || 0)} /></div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-2"><CardDescription>Without HUF</CardDescription><CardTitle className="text-2xl text-destructive">{fmt(withoutHUF)}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Combined income: {fmt(indIncome + totalHUF)}</p></CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2"><CardDescription>With HUF</CardDescription><CardTitle className="text-2xl text-primary">{fmt(withHUF)}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">Individual: {fmt(calcTax(indIncome, indDed))} + HUF: {fmt(hufTax)}</p></CardContent>
              </Card>
              <Card className="border-accent/30 bg-accent/10">
                <CardHeader className="pb-2"><CardDescription>Tax Savings</CardDescription><CardTitle className="text-2xl text-accent-foreground flex items-center gap-1"><TrendingUp className="h-5 w-5" /> {fmt(savings)}</CardTitle></CardHeader>
                <CardContent><p className="text-xs text-muted-foreground">{savings > 0 ? "HUF structure saves you tax!" : "Add HUF income to see savings"}</p></CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Tax Comparison Chart</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: "Without HUF", tax: withoutHUF },
                      { name: "With HUF", tax: withHUF },
                      { name: "Savings", tax: savings },
                    ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: number) => fmt(value)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="tax" radius={[6, 6, 0, 0]}>
                        <Cell fill="hsl(var(--destructive))" />
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="hsl(142 76% 36%)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><PiggyBank className="h-5 w-5" /> Breakdown</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Particular</TableHead><TableHead className="text-right">Without HUF</TableHead><TableHead className="text-right">With HUF</TableHead></TableRow></TableHeader>
                  <TableBody>
                    <TableRow><TableCell>Individual Income</TableCell><TableCell className="text-right">{fmt(indIncome + totalHUF)}</TableCell><TableCell className="text-right">{fmt(indIncome)}</TableCell></TableRow>
                    <TableRow><TableCell>HUF Income</TableCell><TableCell className="text-right">—</TableCell><TableCell className="text-right">{fmt(totalHUF)}</TableCell></TableRow>
                    <TableRow><TableCell>Individual Deductions</TableCell><TableCell className="text-right">{fmt(indDed)}</TableCell><TableCell className="text-right">{fmt(indDed)}</TableCell></TableRow>
                    <TableRow><TableCell>HUF Deductions</TableCell><TableCell className="text-right">—</TableCell><TableCell className="text-right">{fmt(hufDed)}</TableCell></TableRow>
                    <TableRow className="font-bold border-t-2"><TableCell>Total Tax</TableCell><TableCell className="text-right text-destructive">{fmt(withoutHUF)}</TableCell><TableCell className="text-right text-primary">{fmt(withHUF)}</TableCell></TableRow>
                    <TableRow className="font-bold"><TableCell>Net Savings</TableCell><TableCell className="text-right" colSpan={2}><Badge variant="outline" className="text-base">{fmt(savings)}</Badge></TableCell></TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HUFTaxPlanner;
