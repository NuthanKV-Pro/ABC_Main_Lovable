import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Heart, Plus, Trash2, Users, Gift } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import ExportButton from "@/components/ExportButton";
import { ExportConfig } from "@/utils/unifiedExport";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const DEFAULT_CATEGORIES = [
  { name: "Venue & Mandap", budget: 200000, actual: 0 },
  { name: "Catering & Food", budget: 150000, actual: 0 },
  { name: "Decoration & Flowers", budget: 80000, actual: 0 },
  { name: "Jewelry", budget: 300000, actual: 0 },
  { name: "Trousseau & Clothing", budget: 100000, actual: 0 },
  { name: "Photography & Videography", budget: 50000, actual: 0 },
  { name: "Mehendi Ceremony", budget: 30000, actual: 0 },
  { name: "Sangeet & DJ", budget: 40000, actual: 0 },
  { name: "Baraat & Band", budget: 25000, actual: 0 },
  { name: "Invitations & Cards", budget: 15000, actual: 0 },
  { name: "Gifts & Favors", budget: 20000, actual: 0 },
  { name: "Miscellaneous", budget: 50000, actual: 0 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "#e879f9", "#fb923c", "#34d399", "#60a5fa", "#f87171", "#a78bfa"];

interface GiftEntry { id: string; from: string; item: string; value: number; thanked: boolean; }

const WeddingBudgetPlanner = () => {
  const goBack = useGoBack();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [guestCount, setGuestCount] = useState(300);
  const [gifts, setGifts] = useState<GiftEntry[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("wedding_budget_data");
    if (s) { const d = JSON.parse(s); setCategories(d.categories || DEFAULT_CATEGORIES); setGuestCount(d.guestCount || 300); setGifts(d.gifts || []); }
  }, []);
  useEffect(() => {
    localStorage.setItem("wedding_budget_data", JSON.stringify({ categories, guestCount, gifts }));
  }, [categories, guestCount, gifts]);

  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalActual = categories.reduce((s, c) => s + c.actual, 0);
  const totalGifts = gifts.reduce((s, g) => s + g.value, 0);
  const perGuest = guestCount > 0 ? totalBudget / guestCount : 0;
  const remaining = totalBudget - totalActual;

  const pieData = categories.filter(c => c.budget > 0).map(c => ({ name: c.name, value: c.budget }));

  const getExportConfig = (): ExportConfig => ({
    title: "Wedding Budget Report", fileNamePrefix: "wedding-budget",
    sections: [
      { title: "Summary", keyValues: [["Total Budget", fmt(totalBudget)], ["Total Spent", fmt(totalActual)], ["Remaining", fmt(remaining)], ["Guests", String(guestCount)], ["Per Guest Cost", fmt(perGuest)], ["Gifts Received", fmt(totalGifts)]] },
      { title: "Category Breakdown", table: { head: ["Category", "Budget", "Actual", "Variance"], body: categories.map(c => [c.name, fmt(c.budget), fmt(c.actual), fmt(c.budget - c.actual)]) } },
    ]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Heart className="h-6 w-6 text-primary" /> Wedding Budget Planner</h1>
              <p className="text-sm text-muted-foreground">Plan your perfect Indian wedding</p>
            </div>
          </div>
          <ExportButton getConfig={getExportConfig} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Total Budget</p><p className="text-lg font-bold">{fmt(totalBudget)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Spent</p><p className="text-lg font-bold text-primary">{fmt(totalActual)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Remaining</p><p className={`text-lg font-bold ${remaining >= 0 ? "text-foreground" : "text-destructive"}`}>{fmt(remaining)}</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Users className="h-3 w-3" /> Guests</p><Input type="number" className="text-center h-8 mt-1" value={guestCount} onChange={e => setGuestCount(parseInt(e.target.value) || 0)} /></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><p className="text-xs text-muted-foreground">Per Guest</p><p className="text-lg font-bold">{fmt(perGuest)}</p></CardContent></Card>
        </div>

        <Progress value={totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0} className="h-3" />

        <Tabs defaultValue="budget" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="gifts">Gifts ({gifts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="budget">
            <Card>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Category</TableHead><TableHead className="text-right">Budget (₹)</TableHead><TableHead className="text-right">Actual (₹)</TableHead><TableHead className="text-right">Variance</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat, i) => {
                      const variance = cat.budget - cat.actual;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell className="text-right"><Input type="number" className="w-28 ml-auto text-right h-8" value={cat.budget || ""} onChange={e => { const n = [...categories]; n[i] = { ...n[i], budget: parseFloat(e.target.value) || 0 }; setCategories(n); }} /></TableCell>
                          <TableCell className="text-right"><Input type="number" className="w-28 ml-auto text-right h-8" value={cat.actual || ""} onChange={e => { const n = [...categories]; n[i] = { ...n[i], actual: parseFloat(e.target.value) || 0 }; setCategories(n); }} /></TableCell>
                          <TableCell className={`text-right font-medium ${variance >= 0 ? "text-foreground" : "text-destructive"}`}>{fmt(variance)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-right">{fmt(totalBudget)}</TableCell>
                      <TableCell className="text-right">{fmt(totalActual)}</TableCell>
                      <TableCell className={`text-right ${remaining >= 0 ? "text-foreground" : "text-destructive"}`}>{fmt(remaining)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card>
              <CardHeader><CardTitle className="text-lg">Budget Allocation</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gifts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2"><Gift className="h-5 w-5" /> Gift Tracker</CardTitle>
                    <CardDescription>Total gifts received: {fmt(totalGifts)}</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setGifts([...gifts, { id: crypto.randomUUID(), from: "", item: "", value: 0, thanked: false }])}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
              </CardHeader>
              <CardContent>
                {gifts.length === 0 ? <p className="text-muted-foreground text-sm text-center py-4">No gifts recorded yet.</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>From</TableHead><TableHead>Item/Cash</TableHead><TableHead className="text-right">Value (₹)</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
                    <TableBody>
                      {gifts.map(g => (
                        <TableRow key={g.id}>
                          <TableCell><Input value={g.from} onChange={e => setGifts(gifts.map(x => x.id === g.id ? { ...x, from: e.target.value } : x))} placeholder="Name" /></TableCell>
                          <TableCell><Input value={g.item} onChange={e => setGifts(gifts.map(x => x.id === g.id ? { ...x, item: e.target.value } : x))} placeholder="Cash / Gold / Item" /></TableCell>
                          <TableCell className="text-right"><Input type="number" className="w-24 text-right" value={g.value || ""} onChange={e => setGifts(gifts.map(x => x.id === g.id ? { ...x, value: parseFloat(e.target.value) || 0 } : x))} /></TableCell>
                          <TableCell><Button variant="ghost" size="icon" onClick={() => setGifts(gifts.filter(x => x.id !== g.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WeddingBudgetPlanner;
