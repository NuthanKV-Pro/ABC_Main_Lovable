import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, PieChart, BarChart3, IndianRupee, Percent, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface StockHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  sector: string;
}

const SECTORS = [
  "Technology", "Banking", "Pharma", "FMCG", "Auto", "Energy", "Infra", "IT Services", "Metals", "Telecom", "Others"
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57', '#83a6ed'];

const StockPortfolioTracker = () => {
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<StockHolding[]>([
    { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 50, buyPrice: 2400, currentPrice: 2650, sector: 'Energy' },
    { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', quantity: 30, buyPrice: 3200, currentPrice: 3450, sector: 'IT Services' },
    { id: '3', symbol: 'HDFCBANK', name: 'HDFC Bank', quantity: 100, buyPrice: 1500, currentPrice: 1420, sector: 'Banking' },
    { id: '4', symbol: 'INFY', name: 'Infosys', quantity: 80, buyPrice: 1400, currentPrice: 1580, sector: 'IT Services' },
    { id: '5', symbol: 'SUNPHARMA', name: 'Sun Pharma', quantity: 60, buyPrice: 1100, currentPrice: 1250, sector: 'Pharma' },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addHolding = () => {
    const newHolding: StockHolding = {
      id: Date.now().toString(),
      symbol: '',
      name: `Stock ${holdings.length + 1}`,
      quantity: 10,
      buyPrice: 100,
      currentPrice: 100,
      sector: 'Others'
    };
    setHoldings([...holdings, newHolding]);
  };

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const updateHolding = (id: string, field: keyof StockHolding, value: any) => {
    setHoldings(holdings.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  // Calculate metrics
  const calculateMetrics = (holding: StockHolding) => {
    const investedValue = holding.quantity * holding.buyPrice;
    const currentValue = holding.quantity * holding.currentPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent = (pnl / investedValue) * 100;
    return { investedValue, currentValue, pnl, pnlPercent };
  };

  // Portfolio totals
  const totalInvested = holdings.reduce((sum, h) => sum + (h.quantity * h.buyPrice), 0);
  const totalCurrent = holdings.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Sector allocation
  const sectorAllocation = holdings.reduce((acc, h) => {
    const value = h.quantity * h.currentPrice;
    if (!acc[h.sector]) acc[h.sector] = 0;
    acc[h.sector] += value;
    return acc;
  }, {} as Record<string, number>);

  const sectorData = Object.entries(sectorAllocation).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalCurrent) * 100).toFixed(1)
  }));

  // Top gainers and losers
  const holdingsWithMetrics = holdings.map(h => ({ ...h, ...calculateMetrics(h) }));
  const topGainers = [...holdingsWithMetrics].sort((a, b) => b.pnlPercent - a.pnlPercent).slice(0, 3);
  const topLosers = [...holdingsWithMetrics].sort((a, b) => a.pnlPercent - b.pnlPercent).slice(0, 3);

  // Bar chart data
  const barData = holdingsWithMetrics.map(h => ({
    name: h.symbol || h.name.slice(0, 10),
    invested: h.investedValue,
    current: h.currentValue,
    pnl: h.pnl
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Stock Portfolio Tracker</h1>
              <p className="text-sm text-muted-foreground">Monitor your equity investments with P&L analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Portfolio Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCurrent)}</p>
              </CardContent>
            </Card>
            <Card className={totalPnL >= 0 ? 'border-green-500/30' : 'border-red-500/30'}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </p>
              </CardContent>
            </Card>
            <Card className={totalPnLPercent >= 0 ? 'border-green-500/30' : 'border-red-500/30'}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Returns</p>
                <p className={`text-2xl font-bold flex items-center gap-1 ${totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {totalPnLPercent >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="holdings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            {/* Holdings Tab */}
            <TabsContent value="holdings" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Your Stock Holdings</CardTitle>
                    <Button onClick={addHolding} size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Stock
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Stock</th>
                          <th className="text-left p-3">Qty</th>
                          <th className="text-left p-3">Buy Price</th>
                          <th className="text-left p-3">Current</th>
                          <th className="text-left p-3">Invested</th>
                          <th className="text-left p-3">Current Val</th>
                          <th className="text-left p-3">P&L</th>
                          <th className="text-left p-3">%</th>
                          <th className="text-left p-3">Sector</th>
                          <th className="p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((holding) => {
                          const metrics = calculateMetrics(holding);
                          return (
                            <tr key={holding.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <Input
                                  value={holding.name}
                                  onChange={(e) => updateHolding(holding.id, 'name', e.target.value)}
                                  className="w-32"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={holding.quantity}
                                  onChange={(e) => updateHolding(holding.id, 'quantity', Number(e.target.value))}
                                  className="w-20"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={holding.buyPrice}
                                  onChange={(e) => updateHolding(holding.id, 'buyPrice', Number(e.target.value))}
                                  className="w-24"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  value={holding.currentPrice}
                                  onChange={(e) => updateHolding(holding.id, 'currentPrice', Number(e.target.value))}
                                  className="w-24"
                                />
                              </td>
                              <td className="p-3 font-medium">{formatCurrency(metrics.investedValue)}</td>
                              <td className="p-3 font-medium">{formatCurrency(metrics.currentValue)}</td>
                              <td className={`p-3 font-semibold ${metrics.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {metrics.pnl >= 0 ? '+' : ''}{formatCurrency(metrics.pnl)}
                              </td>
                              <td className={`p-3 font-semibold ${metrics.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {metrics.pnlPercent >= 0 ? '+' : ''}{metrics.pnlPercent.toFixed(1)}%
                              </td>
                              <td className="p-3">
                                <select
                                  value={holding.sector}
                                  onChange={(e) => updateHolding(holding.id, 'sector', e.target.value)}
                                  className="border rounded p-1 text-xs bg-background"
                                >
                                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="p-3">
                                <Button variant="ghost" size="icon" onClick={() => removeHolding(holding.id)} className="text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Allocation Tab */}
            <TabsContent value="allocation" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Sector Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={sectorData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {sectorData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sector Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sectorData.map((sector, index) => (
                        <div key={sector.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="font-medium">{sector.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(sector.value)}</p>
                            <p className="text-sm text-muted-foreground">{sector.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-500">
                      <TrendingUp className="h-5 w-5" />
                      Top Gainers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topGainers.map((stock, i) => (
                        <div key={stock.id} className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                          <div>
                            <p className="font-semibold">{stock.name}</p>
                            <p className="text-sm text-muted-foreground">{stock.quantity} shares @ {formatCurrency(stock.buyPrice)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-500">+{stock.pnlPercent.toFixed(2)}%</p>
                            <p className="text-sm text-green-500">+{formatCurrency(stock.pnl)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-500">
                      <TrendingDown className="h-5 w-5" />
                      Top Losers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topLosers.filter(s => s.pnl < 0).map((stock, i) => (
                        <div key={stock.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                          <div>
                            <p className="font-semibold">{stock.name}</p>
                            <p className="text-sm text-muted-foreground">{stock.quantity} shares @ {formatCurrency(stock.buyPrice)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-500">{stock.pnlPercent.toFixed(2)}%</p>
                            <p className="text-sm text-red-500">{formatCurrency(stock.pnl)}</p>
                          </div>
                        </div>
                      ))}
                      {topLosers.filter(s => s.pnl < 0).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No losing positions! 🎉</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Investment vs Current Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}K`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="invested" name="Invested" fill="#8884d8" />
                        <Bar dataKey="current" name="Current" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                This portfolio tracker is for informational purposes only. Enter your buy prices and current market prices manually. 
                Real-time stock price updates are not available. Always verify data with your broker's official statements.
                Past performance does not guarantee future results. Consult a financial advisor before making investment decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StockPortfolioTracker;
