import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Layers, Plus, Trash2 } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Bond {
  id: string;
  name: string;
  principal: number;
  yield: number;
  maturityYears: number;
}

const BondLadderCalculator = () => {
  const goBack = useGoBack();
  const [bonds, setBonds] = useState<Bond[]>([
    { id: "1", name: "RBI Bond 2025", principal: 100000, yield: 7.5, maturityYears: 1 },
    { id: "2", name: "PSU Bond 2026", principal: 100000, yield: 8.0, maturityYears: 2 },
    { id: "3", name: "Corp Bond 2027", principal: 100000, yield: 8.5, maturityYears: 3 },
    { id: "4", name: "Tax-Free Bond 2028", principal: 100000, yield: 6.5, maturityYears: 4 },
    { id: "5", name: "Govt Bond 2029", principal: 100000, yield: 7.8, maturityYears: 5 },
  ]);
  const [newBond, setNewBond] = useState({ name: "", principal: "", yield: "", maturityYears: "" });

  const addBond = () => {
    if (newBond.name && newBond.principal && newBond.yield && newBond.maturityYears) {
      setBonds([...bonds, {
        id: Date.now().toString(),
        name: newBond.name,
        principal: parseFloat(newBond.principal),
        yield: parseFloat(newBond.yield),
        maturityYears: parseInt(newBond.maturityYears)
      }]);
      setNewBond({ name: "", principal: "", yield: "", maturityYears: "" });
    }
  };

  const deleteBond = (id: string) => {
    setBonds(bonds.filter(b => b.id !== id));
  };

  const totalPrincipal = bonds.reduce((sum, b) => sum + b.principal, 0);
  const weightedYield = totalPrincipal > 0 
    ? bonds.reduce((sum, b) => sum + (b.yield * b.principal), 0) / totalPrincipal 
    : 0;
  const totalAnnualIncome = bonds.reduce((sum, b) => sum + (b.principal * b.yield / 100), 0);

  const maturitySchedule = bonds.reduce((acc, bond) => {
    const year = bond.maturityYears;
    if (!acc[year]) acc[year] = 0;
    acc[year] += bond.principal;
    return acc;
  }, {} as Record<number, number>);

  const chartData = Object.entries(maturitySchedule)
    .map(([year, amount]) => ({ year: `Year ${year}`, amount }))
    .sort((a, b) => parseInt(a.year.split(' ')[1]) - parseInt(b.year.split(' ')[1]));

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Bond Ladder Calculator</CardTitle>
              <CardDescription>Build a maturity-staggered bond portfolio for regular income</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold text-primary">₹{totalPrincipal.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Weighted Avg Yield</p>
                <p className="text-2xl font-bold text-green-500">{weightedYield.toFixed(2)}%</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Annual Income</p>
                <p className="text-2xl font-bold text-blue-500">₹{Math.round(totalAnnualIncome).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Bond</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Bond Name</Label>
                  <Input
                    placeholder="e.g., RBI Bond"
                    value={newBond.name}
                    onChange={(e) => setNewBond({ ...newBond, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Principal (₹)</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={newBond.principal}
                    onChange={(e) => setNewBond({ ...newBond, principal: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Yield (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="7.5"
                    value={newBond.yield}
                    onChange={(e) => setNewBond({ ...newBond, yield: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Maturity (Years)</Label>
                  <Input
                    type="number"
                    placeholder="5"
                    value={newBond.maturityYears}
                    onChange={(e) => setNewBond({ ...newBond, maturityYears: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addBond} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bond Name</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">Yield</TableHead>
                <TableHead className="text-right">Maturity</TableHead>
                <TableHead className="text-right">Annual Income</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonds.sort((a, b) => a.maturityYears - b.maturityYears).map((bond) => (
                <TableRow key={bond.id}>
                  <TableCell className="font-medium">{bond.name}</TableCell>
                  <TableCell className="text-right font-mono">₹{bond.principal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">{bond.yield}%</TableCell>
                  <TableCell className="text-right">{bond.maturityYears} year{bond.maturityYears > 1 ? "s" : ""}</TableCell>
                  <TableCell className="text-right font-mono text-green-500">
                    ₹{Math.round(bond.principal * bond.yield / 100).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteBond(bond.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Maturity Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Maturing"]}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">Bond Ladder Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Regular maturity provides liquidity at intervals</li>
                <li>• Reinvest maturing bonds at prevailing rates</li>
                <li>• Reduces interest rate risk through diversification</li>
                <li>• Ideal for retirement income planning</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default BondLadderCalculator;
