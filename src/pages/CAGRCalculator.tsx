import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TrendingUp, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

const CAGRCalculator = () => {
  const navigate = useNavigate();
  const [initialValue, setInitialValue] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(250000);
  const [years, setYears] = useState<number>(5);

  // CAGR Formula: ((Final/Initial)^(1/years) - 1) * 100
  const cagr = ((Math.pow(finalValue / initialValue, 1 / years) - 1) * 100);
  const absoluteReturn = ((finalValue - initialValue) / initialValue) * 100;
  const totalGain = finalValue - initialValue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate year-wise growth at CAGR rate
  const yearlyGrowth = Array.from({ length: years }, (_, i) => {
    const year = i + 1;
    const value = initialValue * Math.pow(1 + cagr / 100, year);
    return { year, value };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">CAGR Calculator</h1>
              <p className="text-sm text-muted-foreground">Compound Annual Growth Rate</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Investment Details
              </CardTitle>
              <CardDescription>Enter your investment values</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialValue">Initial Investment (₹)</Label>
                <Input
                  id="initialValue"
                  type="number"
                  value={initialValue}
                  onChange={(e) => setInitialValue(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finalValue">Final Value (₹)</Label>
                <Input
                  id="finalValue"
                  type="number"
                  value={finalValue}
                  onChange={(e) => setFinalValue(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="years">Time Period (Years)</Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                  min={1}
                  max={50}
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20 mt-6">
                <p className="text-sm font-medium text-primary">What is CAGR?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  CAGR represents the rate at which an investment would have grown if it had grown at a steady rate annually. It smooths out volatility to show consistent growth.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Growth Analysis</CardTitle>
              <CardDescription>Your investment growth rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">CAGR</p>
                <p className="text-4xl font-bold text-primary">{cagr.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground mt-1">per annum</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Absolute Return</p>
                  <p className="text-lg font-semibold text-green-600">{absoluteReturn.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Total Gain</p>
                  <p className="text-lg font-semibold text-green-600">{formatCurrency(totalGain)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Year-wise Growth at CAGR</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {yearlyGrowth.map((item) => (
                    <div key={item.year} className="flex justify-between items-center p-2 bg-card rounded border text-sm">
                      <span>Year {item.year}</span>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.open("https://groww.in/calculators/cagr-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Groww CAGR Calc
          </Button>
          <Button variant="outline" onClick={() => window.open("https://cleartax.in/s/cagr-calculator", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> ClearTax CAGR Calc
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CAGRCalculator;
