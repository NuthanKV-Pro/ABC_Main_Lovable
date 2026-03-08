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
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import ExportButton from "@/components/ExportButton";

interface Member {
  id: string;
  name: string;
  relation: string;
  panNumber: string;
}

interface IncomeEntry {
  id: string;
  source: string;
  type: string;
  amount: number;
}

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
    if (taxable > slab.min) {
      const chunk = Math.min(taxable, slab.max) - slab.min;
      tax += chunk * slab.rate;
    }
  }
  const cess = tax * 0.04;
  return Math.round(tax + cess);
};

const HUFTaxPlanner = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();

  const [hufName, setHufName] = useState("");
  const [kartaName, setKartaName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [deductions80C, setDeductions80C] = useState(0);
  const [deductions80D, setDeductions80D] = useState(0);
  const [individualIncome, setIndividualIncome] = useState(0);
  const [individualDeductions, setIndividualDeductions] = useState(0);

  // localStorage persistence
  useEffect(() => {
    const saved = localStorage.getItem("huf_planner_data");
    if (saved) {
      const data = JSON.parse(saved);
      setHufName(data.hufName || "");
      setKartaName(data.kartaName || "");
      setMembers(data.members || []);
      setIncomes(data.incomes || []);
      setDeductions80C(data.deductions80C || 0);
      setDeductions80D(data.deductions80D || 0);
      setIndividualIncome(data.individualIncome || 0);
      setIndividualDeductions(data.individualDeductions || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("huf_planner_data", JSON.stringify({
      hufName, kartaName, members, incomes, deductions80C, deductions80D, individualIncome, individualDeductions
    }));
  }, [hufName, kartaName, members, incomes, deductions80C, deductions80D, individualIncome, individualDeductions]);

  const addMember = () => {
    setMembers([...members, { id: crypto.randomUUID(), name: "", relation: "Coparcener", panNumber: "" }]);
  };

  const removeMember = (id: string) => setMembers(members.filter(m => m.id !== id));

  const updateMember = (id: string, field: keyof Member, value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addIncome = () => {
    setIncomes([...incomes, { id: crypto.randomUUID(), source: "", type: "Rental", amount: 0 }]);
  };

  const removeIncome = (id: string) => setIncomes(incomes.filter(i => i.id !== id));

  const updateIncome = (id: string, field: keyof IncomeEntry, value: string | number) => {
    setIncomes(incomes.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const totalHUFIncome = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const totalHUFDeductions = deductions80C + deductions80D;
  const hufTax = calcTax(totalHUFIncome, totalHUFDeductions);
  const individualTax = calcTax(individualIncome + totalHUFIncome, individualDeductions);
  const splitTax = calcTax(individualIncome, individualDeductions) + hufTax;
  const savings = Math.max(0, individualTax - splitTax);

  const exportData = {
    title: "HUF Tax Planner Report",
    sections: [
      { heading: "HUF Details", rows: [["HUF Name", hufName], ["Karta", kartaName], ["Members", String(members.length + 1)]] },
      { heading: "HUF Income", rows: incomes.map(i => [i.source || i.type, `₹${i.amount.toLocaleString("en-IN")}`]) },
      { heading: "Tax Comparison", rows: [
        ["Without HUF (combined)", `₹${individualTax.toLocaleString("en-IN")}`],
        ["With HUF (split)", `₹${splitTax.toLocaleString("en-IN")}`],
        ["Tax Savings", `₹${savings.toLocaleString("en-IN")}`],
      ]}
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" /> HUF Tax Planner
              </h1>
              <p className="text-sm text-muted-foreground">Plan tax savings through Hindu Undivided Family structure</p>
            </div>
          </div>
          <ExportButton data={exportData} fileName="huf-tax-plan" />
        </div>

        <Tabs defaultValue="setup" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HUF Details</CardTitle>
                <CardDescription>Enter the HUF name and Karta details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>HUF Name</Label>
                    <Input placeholder="e.g., Sharma HUF" value={hufName} onChange={e => setHufName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Karta Name</Label>
                    <Input placeholder="e.g., Rajesh Sharma" value={kartaName} onChange={e => setKartaName(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Members (Coparceners)</CardTitle>
                    <CardDescription>Add coparceners and members of the HUF</CardDescription>
                  </div>
                  <Button size="sm" onClick={addMember}><Plus className="h-4 w-4 mr-1" /> Add Member</Button>
                </div>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No members added yet. Click "Add Member" to start.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Relation</TableHead>
                        <TableHead>PAN</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map(m => (
                        <TableRow key={m.id}>
                          <TableCell>
                            <Input value={m.name} onChange={e => updateMember(m.id, "name", e.target.value)} placeholder="Member name" />
                          </TableCell>
                          <TableCell>
                            <Select value={m.relation} onValueChange={v => updateMember(m.id, "relation", v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Coparcener">Coparcener</SelectItem>
                                <SelectItem value="Spouse">Spouse</SelectItem>
                                <SelectItem value="Son">Son</SelectItem>
                                <SelectItem value="Daughter">Daughter</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input value={m.panNumber} onChange={e => updateMember(m.id, "panNumber", e.target.value)} placeholder="ABCDE1234F" />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">HUF Income Sources</CardTitle>
                    <CardDescription>Income earned by the HUF entity</CardDescription>
                  </div>
                  <Button size="sm" onClick={addIncome}><Plus className="h-4 w-4 mr-1" /> Add Income</Button>
                </div>
              </CardHeader>
              <CardContent>
                {incomes.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No income entries. Add rental, business, or investment income.</p>
                ) : (
                  <div className="space-y-3">
                    {incomes.map(inc => (
                      <div key={inc.id} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input value={inc.source} onChange={e => updateIncome(inc.id, "source", e.target.value)} placeholder="Source name" />
                          <Select value={inc.type} onValueChange={v => updateIncome(inc.id, "type", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Rental">Rental Income</SelectItem>
                              <SelectItem value="Business">Business Income</SelectItem>
                              <SelectItem value="Interest">Interest Income</SelectItem>
                              <SelectItem value="Capital Gains">Capital Gains</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="number" className="pl-9" value={inc.amount || ""} onChange={e => updateIncome(inc.id, "amount", parseFloat(e.target.value) || 0)} placeholder="Amount" />
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeIncome(inc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HUF Deductions</CardTitle>
                <CardDescription>Deductions available to the HUF entity</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section 80C (max ₹1,50,000)</Label>
                  <Input type="number" value={deductions80C || ""} onChange={e => setDeductions80C(Math.min(150000, parseFloat(e.target.value) || 0))} />
                </div>
                <div className="space-y-2">
                  <Label>Section 80D - Health Insurance (max ₹25,000)</Label>
                  <Input type="number" value={deductions80D || ""} onChange={e => setDeductions80D(Math.min(25000, parseFloat(e.target.value) || 0))} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Individual Income (for comparison)</CardTitle>
                <CardDescription>Enter your personal income to see the tax benefit of HUF splitting</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Individual Gross Income</Label>
                  <Input type="number" value={individualIncome || ""} onChange={e => setIndividualIncome(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Individual Deductions (80C+80D etc.)</Label>
                  <Input type="number" value={individualDeductions || ""} onChange={e => setIndividualDeductions(parseFloat(e.target.value) || 0)} />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-2">
                  <CardDescription>Without HUF (All combined)</CardDescription>
                  <CardTitle className="text-2xl text-destructive">₹{individualTax.toLocaleString("en-IN")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Tax on ₹{(individualIncome + totalHUFIncome).toLocaleString("en-IN")} combined income</p>
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-primary/5">
                <CardHeader className="pb-2">
                  <CardDescription>With HUF (Split)</CardDescription>
                  <CardTitle className="text-2xl text-primary">₹{splitTax.toLocaleString("en-IN")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Individual: ₹{calcTax(individualIncome, individualDeductions).toLocaleString("en-IN")} + HUF: ₹{hufTax.toLocaleString("en-IN")}</p>
                </CardContent>
              </Card>

              <Card className="border-green-500/30 bg-green-500/5">
                <CardHeader className="pb-2">
                  <CardDescription>Tax Savings</CardDescription>
                  <CardTitle className="text-2xl text-green-500 flex items-center gap-1">
                    <TrendingUp className="h-5 w-5" /> ₹{savings.toLocaleString("en-IN")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {savings > 0 ? "HUF structure saves you tax!" : "Add HUF income to see savings"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Summary Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><PiggyBank className="h-5 w-5" /> Detailed Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Particular</TableHead>
                      <TableHead className="text-right">Without HUF</TableHead>
                      <TableHead className="text-right">With HUF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Individual Gross Income</TableCell>
                      <TableCell className="text-right">₹{(individualIncome + totalHUFIncome).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{individualIncome.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HUF Gross Income</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">₹{totalHUFIncome.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Individual Deductions</TableCell>
                      <TableCell className="text-right">₹{individualDeductions.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{individualDeductions.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HUF Deductions</TableCell>
                      <TableCell className="text-right">—</TableCell>
                      <TableCell className="text-right">₹{totalHUFDeductions.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total Tax</TableCell>
                      <TableCell className="text-right text-destructive">₹{individualTax.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right text-primary">₹{splitTax.toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell>Net Savings</TableCell>
                      <TableCell className="text-right" colSpan={2}>
                        <Badge variant="outline" className="text-green-500 border-green-500/30 text-base">₹{savings.toLocaleString("en-IN")}</Badge>
                      </TableCell>
                    </TableRow>
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
