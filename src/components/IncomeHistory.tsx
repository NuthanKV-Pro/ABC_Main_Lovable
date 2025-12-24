import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface HistoryEntry {
  id: string;
  year: string;
  salary: number;
  houseProperty: number;
  business: number;
  capitalGains: number;
  otherSources: number;
  totalIncome: number;
  deductions: number;
  taxableIncome: number;
  taxPaid: number;
}

const years = ["2026-27", "2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21", "2019-20"];

const IncomeHistory = () => {
  const { toast } = useToast();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [formData, setFormData] = useState({
    salary: "",
    houseProperty: "",
    business: "",
    capitalGains: "",
    otherSources: "",
    deductions: "",
    taxPaid: ""
  });

  useEffect(() => {
    const saved = localStorage.getItem('income_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveHistory = (newHistory: HistoryEntry[]) => {
    localStorage.setItem('income_history', JSON.stringify(newHistory));
    setHistory(newHistory);
  };

  const handleAddEntry = () => {
    if (!selectedYear) {
      toast({ title: "Please select a year", variant: "destructive" });
      return;
    }

    const salary = parseFloat(formData.salary) || 0;
    const houseProperty = parseFloat(formData.houseProperty) || 0;
    const business = parseFloat(formData.business) || 0;
    const capitalGains = parseFloat(formData.capitalGains) || 0;
    const otherSources = parseFloat(formData.otherSources) || 0;
    const deductions = parseFloat(formData.deductions) || 0;
    const taxPaid = parseFloat(formData.taxPaid) || 0;

    const totalIncome = salary + houseProperty + business + capitalGains + otherSources;
    const taxableIncome = totalIncome - deductions;

    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      year: selectedYear,
      salary,
      houseProperty,
      business,
      capitalGains,
      otherSources,
      totalIncome,
      deductions,
      taxableIncome,
      taxPaid
    };

    // Remove existing entry for same year if exists
    const filtered = history.filter(h => h.year !== selectedYear);
    const newHistory = [...filtered, newEntry].sort((a, b) => b.year.localeCompare(a.year));
    
    saveHistory(newHistory);
    setShowForm(false);
    setFormData({ salary: "", houseProperty: "", business: "", capitalGains: "", otherSources: "", deductions: "", taxPaid: "" });
    setSelectedYear("");
    
    toast({ title: "Income history saved", description: `Data for ${selectedYear} has been saved.` });
  };

  const handleDelete = (id: string) => {
    const newHistory = history.filter(h => h.id !== id);
    saveHistory(newHistory);
    toast({ title: "Entry deleted" });
  };

  const chartData = [...history].sort((a, b) => a.year.localeCompare(b.year)).map(h => ({
    year: h.year,
    totalIncome: h.totalIncome,
    taxableIncome: h.taxableIncome,
    taxPaid: h.taxPaid
  }));

  return (
    <Card className="border-2 mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <div>
              <CardTitle>Income History</CardTitle>
              <CardDescription>Save and compare your income across years</CardDescription>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Year
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Form */}
        {showForm && (
          <div className="p-4 rounded-lg border bg-muted/50 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Assessment Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Salary (₹)</Label>
                <Input 
                  type="number" 
                  value={formData.salary}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>House Property (₹)</Label>
                <Input 
                  type="number"
                  value={formData.houseProperty}
                  onChange={(e) => setFormData(prev => ({ ...prev, houseProperty: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Business (₹)</Label>
                <Input 
                  type="number"
                  value={formData.business}
                  onChange={(e) => setFormData(prev => ({ ...prev, business: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Capital Gains (₹)</Label>
                <Input 
                  type="number"
                  value={formData.capitalGains}
                  onChange={(e) => setFormData(prev => ({ ...prev, capitalGains: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Other Sources (₹)</Label>
                <Input 
                  type="number"
                  value={formData.otherSources}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherSources: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Deductions (₹)</Label>
                <Input 
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData(prev => ({ ...prev, deductions: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Paid (₹)</Label>
                <Input 
                  type="number"
                  value={formData.taxPaid}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxPaid: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddEntry} className="gap-2">
                <Save className="w-4 h-4" />
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* History Table */}
        {history.length > 0 ? (
          <>
            <div className="overflow-x-auto mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Salary</TableHead>
                    <TableHead className="text-right">House Property</TableHead>
                    <TableHead className="text-right">Business</TableHead>
                    <TableHead className="text-right">Capital Gains</TableHead>
                    <TableHead className="text-right">Other Sources</TableHead>
                    <TableHead className="text-right">Total Income</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Taxable Income</TableHead>
                    <TableHead className="text-right">Tax Paid</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.year}</TableCell>
                      <TableCell className="text-right">₹{entry.salary.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{entry.houseProperty.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{entry.business.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{entry.capitalGains.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{entry.otherSources.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-semibold">₹{entry.totalIncome.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{entry.deductions.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">₹{entry.taxableIncome.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{entry.taxPaid.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Trend Chart */}
            {chartData.length >= 2 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Income Trend Over Years</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} />
                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                    <Legend />
                    <Line type="monotone" dataKey="totalIncome" name="Total Income" stroke="hsl(var(--primary))" strokeWidth={2} />
                    <Line type="monotone" dataKey="taxableIncome" name="Taxable Income" stroke="hsl(var(--accent))" strokeWidth={2} />
                    <Line type="monotone" dataKey="taxPaid" name="Tax Paid" stroke="hsl(28, 90%, 55%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No income history saved yet.</p>
            <p className="text-sm">Click "Add Year" to start tracking your income over time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeHistory;
