import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import { useToast } from "@/hooks/use-toast";

interface IncomeRow {
  particulars: string;
  amount: string;
}

const OtherSources = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [incomeData, setIncomeData] = useState<IncomeRow[]>([
    { particulars: "Bank SB Interest", amount: "" },
    { particulars: "Bank FD Interest", amount: "" },
    { particulars: "Dividend", amount: "" },
    { particulars: "Other Income", amount: "" },
  ]);

  const updateIncomeRow = (index: number, value: string) => {
    const newData = [...incomeData];
    newData[index].amount = value;
    setIncomeData(newData);
  };

  const calculateTotal = () => {
    return incomeData.reduce((acc, row) => {
      return acc + (parseFloat(row.amount) || 0);
    }, 0);
  };

  const handleSave = () => {
    const total = calculateTotal();
    localStorage.setItem('os_total', total.toString());
    toast({
      title: "Other sources details saved",
      description: "Your income information has been saved successfully.",
    });
  };

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Other Sources</h1>
                <p className="text-sm text-muted-foreground">Interest, dividends, and other income</p>
              </div>
            </div>
            <Button 
              onClick={handleSave}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-white shadow-[var(--shadow-gold)]"
            >
              <Save className="w-4 h-4" />
              Save Details
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Income Details */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Income Details</CardTitle>
            <CardDescription>
              Enter your income from other sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary/20">
                    <th className="text-left p-3 font-semibold bg-muted/50">Particulars</th>
                    <th className="text-right p-3 font-semibold bg-muted/50">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{row.particulars}</td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.amount}
                          onChange={(e) => updateIncomeRow(index, e.target.value)}
                          placeholder="0.00"
                          className="text-right"
                        />
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total Row */}
                  <tr className="border-t-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                    <td className="p-3 font-bold text-lg">Total</td>
                    <td className="p-3">
                      <div className="text-right font-bold text-lg text-primary">
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default OtherSources;
