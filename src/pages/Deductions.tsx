import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const deductionSections = [
  { section: "80C", maxLimit: 150000 },
  { section: "80CCD", maxLimit: 50000 },
  { section: "80D", maxLimit: 25000 },
  { section: "80DD", maxLimit: 75000 },
  { section: "80DDB", maxLimit: 40000 },
  { section: "80E", maxLimit: null },
  { section: "80EEA", maxLimit: 150000 },
  { section: "80EEB", maxLimit: 150000 },
  { section: "80G", maxLimit: null },
  { section: "80GG", maxLimit: 60000 },
  { section: "80JJAA", maxLimit: null },
  { section: "80RRB", maxLimit: 300000 },
  { section: "80TTA", maxLimit: 10000 },
  { section: "80TTB", maxLimit: 50000 },
  { section: "80U", maxLimit: 75000 },
  { section: "80CCH", maxLimit: 50000 }
];

const Deductions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amounts, setAmounts] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('deductions_data');
    if (saved) {
      return JSON.parse(saved);
    }
    return deductionSections.reduce((acc, item) => ({ ...acc, [item.section]: 0 }), {});
  });

  const handleAmountChange = (section: string, value: string) => {
    setAmounts(prev => ({ ...prev, [section]: parseFloat(value) || 0 }));
  };

  const totalDeductions = Object.values(amounts).reduce((sum, val) => sum + val, 0);

  const handleSave = () => {
    localStorage.setItem('deductions_data', JSON.stringify(amounts));
    localStorage.setItem('deductions_total', totalDeductions.toString());
    toast({
      title: "Deductions saved",
      description: "Your deduction details have been saved successfully.",
    });
  };

  // Auto-save on change
  useEffect(() => {
    localStorage.setItem('deductions_data', JSON.stringify(amounts));
    localStorage.setItem('deductions_total', totalDeductions.toString());
  }, [amounts, totalDeductions]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Deductions</h1>
                <p className="text-sm text-muted-foreground">Chapter VI-A Deductions</p>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-[var(--shadow-gold)]"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Deduction Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Section</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                  <TableHead>Max Limit (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deductionSections.map((item) => (
                  <TableRow key={item.section}>
                    <TableCell className="font-medium">{item.section}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={amounts[item.section] || ''}
                        onChange={(e) => handleAmountChange(item.section, e.target.value)}
                        className="max-w-xs"
                      />
                    </TableCell>
                    <TableCell>
                      {item.maxLimit ? `₹${item.maxLimit.toLocaleString('en-IN')}` : 'No Limit'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-primary/5 font-bold">
                  <TableCell>Total Deductions</TableCell>
                  <TableCell>₹{totalDeductions.toLocaleString('en-IN')}</TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Deductions;
