import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Chatbot from "@/components/Chatbot";

const BusinessProfession = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [presumptiveIncome, setPresumptiveIncome] = useState({
    grossReceipts: 0,
    presumptiveRate: 8,
    presumptiveIncome: 0,
  });

  const [regularIncome, setRegularIncome] = useState({
    grossReceipts: 0,
    expenses: 0,
    netIncome: 0,
  });

  const calculatePresumptive = (receipts: number, rate: number) => {
    const income = receipts * (rate / 100);
    setPresumptiveIncome({
      grossReceipts: receipts,
      presumptiveRate: rate,
      presumptiveIncome: income,
    });
  };

  const calculateRegular = (receipts: number, expenses: number) => {
    const net = receipts - expenses;
    setRegularIncome({
      grossReceipts: receipts,
      expenses: expenses,
      netIncome: net,
    });
  };

  const handleSave = () => {
    // Save the higher of presumptive or regular income
    const total = Math.max(presumptiveIncome.presumptiveIncome, regularIncome.netIncome);
    localStorage.setItem('pgbp_total', total.toString());
    toast({
      title: "Business & Profession details saved",
      description: "Your income information has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
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
                <h1 className="text-2xl font-bold text-primary">Business & Profession Income</h1>
                <p className="text-sm text-muted-foreground">Business and professional income details</p>
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

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="presumptive" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="presumptive">Presumptive Taxation</TabsTrigger>
            <TabsTrigger value="regular">Regular Taxation</TabsTrigger>
          </TabsList>

          <TabsContent value="presumptive">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Presumptive Taxation (Section 44AD/44ADA)</CardTitle>
                <CardDescription>
                  Simplified taxation scheme for small businesses and professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gross-receipts-presumptive">
                      Gross Receipts/Turnover (₹)
                    </Label>
                    <Input
                      id="gross-receipts-presumptive"
                      type="number"
                      value={presumptiveIncome.grossReceipts || ""}
                      onChange={(e) =>
                        calculatePresumptive(
                          Number(e.target.value),
                          presumptiveIncome.presumptiveRate
                        )
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="presumptive-rate">Presumptive Income Rate (%)</Label>
                    <Input
                      id="presumptive-rate"
                      type="number"
                      value={presumptiveIncome.presumptiveRate || ""}
                      onChange={(e) =>
                        calculatePresumptive(
                          presumptiveIncome.grossReceipts,
                          Number(e.target.value)
                        )
                      }
                      placeholder="8"
                    />
                    <p className="text-sm text-muted-foreground">
                      8% for businesses (Section 44AD), 50% for professionals (Section 44ADA)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Presumptive Income</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{presumptiveIncome.presumptiveIncome.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    = Gross Receipts × {presumptiveIncome.presumptiveRate}%
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Benefits of Presumptive Taxation:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>No need to maintain books of accounts</li>
                    <li>No requirement for tax audit</li>
                    <li>Simplified compliance</li>
                    <li>Lower tax burden for businesses with higher profit margins</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="regular">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Regular Taxation</CardTitle>
                <CardDescription>
                  Detailed income computation with actual expenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gross-receipts-regular">
                      Gross Receipts/Turnover (₹)
                    </Label>
                    <Input
                      id="gross-receipts-regular"
                      type="number"
                      value={regularIncome.grossReceipts || ""}
                      onChange={(e) =>
                        calculateRegular(Number(e.target.value), regularIncome.expenses)
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenses">Total Expenses (₹)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={regularIncome.expenses || ""}
                      onChange={(e) =>
                        calculateRegular(regularIncome.grossReceipts, Number(e.target.value))
                      }
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Include all business expenses: rent, salaries, utilities, depreciation, etc.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Net Business Income</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{regularIncome.netIncome.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    = Gross Receipts - Total Expenses
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Requirements for Regular Taxation:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Maintain detailed books of accounts</li>
                    <li>Tax audit required if turnover exceeds prescribed limits</li>
                    <li>Detailed expense documentation needed</li>
                    <li>Better for businesses with lower profit margins</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">
            Save & Return
          </Button>
          <Button className="flex-1">Calculate Tax Impact</Button>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default BusinessProfession;
