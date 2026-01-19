import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, AlertTriangle, PieChart, TrendingUp, Search, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface Fund {
  id: string;
  name: string;
  category: string;
  holdings: string[];
  investedAmount: number;
}

interface Holding {
  name: string;
  funds: string[];
  totalWeight: number;
}

// Sample popular stock holdings for demonstration
const sampleHoldings: Record<string, string[]> = {
  "HDFC Top 100": ["HDFC Bank", "ICICI Bank", "Reliance Industries", "Infosys", "TCS", "ITC", "L&T", "Axis Bank", "Kotak Bank", "Bajaj Finance"],
  "ICICI Bluechip": ["HDFC Bank", "ICICI Bank", "Reliance Industries", "Infosys", "TCS", "HUL", "Bharti Airtel", "SBI", "Asian Paints", "Maruti"],
  "SBI Bluechip": ["HDFC Bank", "Reliance Industries", "Infosys", "TCS", "ICICI Bank", "ITC", "L&T", "Kotak Bank", "HUL", "Axis Bank"],
  "Axis Bluechip": ["HDFC Bank", "ICICI Bank", "Infosys", "TCS", "Bajaj Finance", "Avenue Supermarts", "Titan", "Asian Paints", "Kotak Bank", "HUL"],
  "Mirae Large Cap": ["HDFC Bank", "ICICI Bank", "Reliance Industries", "Infosys", "TCS", "Bharti Airtel", "L&T", "SBI", "Axis Bank", "HUL"],
  "Parag Parikh Flexi Cap": ["HDFC Bank", "ICICI Bank", "ITC", "Bajaj Holdings", "Coal India", "Power Grid", "Axis Bank", "HCL Tech", "Tech Mahindra", "Alphabet"],
  "UTI Flexi Cap": ["HDFC Bank", "ICICI Bank", "Infosys", "TCS", "Kotak Bank", "Axis Bank", "L&T", "SBI", "Bajaj Finance", "Bharti Airtel"],
  "Nippon Small Cap": ["Tube Investments", "Carborundum", "KPIT Tech", "Navin Fluorine", "Ratnamani Metals", "Elgi Equipments", "Brigade Enterprises", "CIE Automotive", "Kalpataru Projects", "KEI Industries"],
  "SBI Small Cap": ["Blue Star", "Carborundum", "KPIT Tech", "Finolex Cables", "Chalet Hotels", "Elgi Equipments", "Galaxy Surfactants", "Greenpanel Industries", "JK Cement", "Kalpataru Projects"],
  "HDFC Mid Cap": ["Max Healthcare", "Indian Hotels", "Persistent Systems", "Coforge", "Trent", "Jindal Steel", "Apollo Hospitals", "AU Small Finance", "Oberoi Realty", "Ashok Leyland"],
  "Custom Fund": [],
};

const fundCategories = ["Large Cap", "Mid Cap", "Small Cap", "Flexi Cap", "Multi Cap", "ELSS", "Focused", "Sectoral"];

const MutualFundOverlapAnalyzer = () => {
  const navigate = useNavigate();
  const [funds, setFunds] = useState<Fund[]>([
    { id: "1", name: "HDFC Top 100", category: "Large Cap", holdings: sampleHoldings["HDFC Top 100"], investedAmount: 100000 },
    { id: "2", name: "ICICI Bluechip", category: "Large Cap", holdings: sampleHoldings["ICICI Bluechip"], investedAmount: 80000 },
  ]);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customHolding, setCustomHolding] = useState<string>("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addFund = () => {
    const newFund: Fund = {
      id: Date.now().toString(),
      name: "Custom Fund",
      category: "Large Cap",
      holdings: [],
      investedAmount: 50000
    };
    setFunds([...funds, newFund]);
  };

  const removeFund = (id: string) => {
    if (funds.length > 1) {
      setFunds(funds.filter(f => f.id !== id));
    }
  };

  const updateFund = (id: string, field: keyof Fund, value: any) => {
    setFunds(funds.map(f => {
      if (f.id === id) {
        const updated = { ...f, [field]: value };
        // If name changed to a preset, update holdings
        if (field === 'name' && sampleHoldings[value]) {
          updated.holdings = sampleHoldings[value];
        }
        return updated;
      }
      return f;
    }));
  };

  const addCustomHolding = (fundId: string) => {
    if (customHolding.trim()) {
      setFunds(funds.map(f => {
        if (f.id === fundId) {
          return { ...f, holdings: [...f.holdings, customHolding.trim()] };
        }
        return f;
      }));
      setCustomHolding("");
    }
  };

  const removeHolding = (fundId: string, holding: string) => {
    setFunds(funds.map(f => {
      if (f.id === fundId) {
        return { ...f, holdings: f.holdings.filter(h => h !== holding) };
      }
      return f;
    }));
  };

  // Analyze overlap
  const analyzeOverlap = () => {
    const holdingMap: Record<string, { funds: string[], weight: number }> = {};
    
    funds.forEach(fund => {
      fund.holdings.forEach(holding => {
        if (!holdingMap[holding]) {
          holdingMap[holding] = { funds: [], weight: 0 };
        }
        holdingMap[holding].funds.push(fund.name);
        holdingMap[holding].weight += (10 / fund.holdings.length) * (fund.investedAmount / totalInvestment * 100);
      });
    });

    return Object.entries(holdingMap)
      .map(([name, data]) => ({
        name,
        funds: data.funds,
        count: data.funds.length,
        weight: data.weight
      }))
      .sort((a, b) => b.count - a.count);
  };

  const totalInvestment = funds.reduce((sum, f) => sum + f.investedAmount, 0);
  const overlapData = analyzeOverlap();
  const overlappingHoldings = overlapData.filter(h => h.count > 1);
  const uniqueHoldings = overlapData.filter(h => h.count === 1);
  
  const overlapPercentage = overlappingHoldings.length > 0 
    ? (overlappingHoldings.length / overlapData.length) * 100 
    : 0;

  const getOverlapSeverity = (percentage: number) => {
    if (percentage > 50) return { label: "High", color: "text-red-500", bg: "bg-red-500" };
    if (percentage > 30) return { label: "Medium", color: "text-amber-500", bg: "bg-amber-500" };
    return { label: "Low", color: "text-green-500", bg: "bg-green-500" };
  };

  const severity = getOverlapSeverity(overlapPercentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Mutual Fund Overlap Analyzer</h1>
              <p className="text-sm text-muted-foreground">Identify duplicate holdings across your MF portfolio</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Fund Input Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    Your Mutual Funds
                  </CardTitle>
                  <CardDescription>Add funds to analyze portfolio overlap</CardDescription>
                </div>
                <Button onClick={addFund} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Fund
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {funds.map((fund) => (
                <div key={fund.id} className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Fund Name</Label>
                      <Select value={fund.name} onValueChange={(v) => updateFund(fund.id, 'name', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(sampleHoldings).map(name => (
                            <SelectItem key={name} value={name}>{name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Category</Label>
                      <Select value={fund.category} onValueChange={(v) => updateFund(fund.id, 'category', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fundCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Invested Amount (₹)</Label>
                      <Input
                        type="number"
                        value={fund.investedAmount}
                        onChange={(e) => updateFund(fund.id, 'investedAmount', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      {funds.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeFund(fund.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Holdings */}
                  <div className="space-y-2">
                    <Label className="text-xs">Top Holdings ({fund.holdings.length})</Label>
                    <div className="flex flex-wrap gap-2">
                      {fund.holdings.map((holding, idx) => (
                        <span key={idx} className="px-2 py-1 bg-muted rounded text-xs flex items-center gap-1">
                          {holding}
                          <button onClick={() => removeHolding(fund.id, holding)} className="text-red-500 hover:text-red-700">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom holding..."
                        value={customHolding}
                        onChange={(e) => setCustomHolding(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomHolding(fund.id)}
                        className="text-sm"
                      />
                      <Button size="sm" variant="outline" onClick={() => addCustomHolding(fund.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Overlap Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className={`border-2 ${severity.color.replace('text', 'border')}/30`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overlap Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-4xl font-bold ${severity.color}`}>{overlapPercentage.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">{severity.label} overlap</p>
                <Progress value={overlapPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{overlapData.length}</p>
                <p className="text-sm text-muted-foreground">Across {funds.length} funds</p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Overlapping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-amber-500">{overlappingHoldings.length}</p>
                <p className="text-sm text-muted-foreground">Stocks in 2+ funds</p>
              </CardContent>
            </Card>

            <Card className="border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Unique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-green-500">{uniqueHoldings.length}</p>
                <p className="text-sm text-muted-foreground">Exclusive holdings</p>
              </CardContent>
            </Card>
          </div>

          {/* Overlapping Stocks Detail */}
          {overlappingHoldings.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Overlapping Holdings
                </CardTitle>
                <CardDescription>Stocks appearing in multiple funds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Stock Name</th>
                        <th className="text-left p-3">Present In</th>
                        <th className="text-left p-3">Funds Count</th>
                        <th className="text-left p-3">Approx. Portfolio Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overlappingHoldings.slice(0, 15).map((holding, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-3 font-medium">{holding.name}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {holding.funds.map((fund, i) => (
                                <span key={i} className="px-2 py-0.5 bg-muted rounded text-xs">{fund}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              holding.count >= 3 ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                            }`}>
                              {holding.count} funds
                            </span>
                          </td>
                          <td className="p-3">{holding.weight.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analysis & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Portfolio Insights</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {overlapPercentage > 50 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        <span>High overlap detected. Consider consolidating into fewer funds.</span>
                      </li>
                    )}
                    {funds.filter(f => f.category === "Large Cap").length > 2 && (
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                        <span>Multiple Large Cap funds - typically have high overlap. One fund may suffice.</span>
                      </li>
                    )}
                    {overlapPercentage < 30 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span>Good diversification! Low overlap across your funds.</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                      <span>Total investment: {formatCurrency(totalInvestment)} across {funds.length} funds.</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Tips to Reduce Overlap</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Avoid multiple funds of same category (e.g., 2 Large Cap funds)</li>
                    <li>• Mix categories: Large Cap + Mid Cap + Small Cap</li>
                    <li>• Consider index funds + actively managed combination</li>
                    <li>• 3-5 funds is usually optimal for most investors</li>
                    <li>• Check portfolio overlap before adding new funds</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This tool uses sample holdings data for demonstration. Actual fund holdings change monthly and may differ.
                Please refer to the latest fund factsheets for accurate holding information.
              </p>
              <p>
                This analysis is for educational purposes only and does not constitute investment advice. 
                Please consult a financial advisor before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MutualFundOverlapAnalyzer;
