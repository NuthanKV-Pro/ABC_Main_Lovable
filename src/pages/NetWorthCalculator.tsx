import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, TrendingUp, TrendingDown, Wallet, Building, Car, Coins, CreditCard, Home, Briefcase, Landmark, PiggyBank, AlertTriangle, Info, CheckCircle, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Asset {
  id: string;
  name: string;
  value: number;
  category: 'cash' | 'investment' | 'property' | 'vehicle' | 'other';
}

interface Liability {
  id: string;
  name: string;
  value: number;
  category: 'home_loan' | 'car_loan' | 'personal_loan' | 'credit_card' | 'education_loan' | 'other';
}

const defaultAssets: Asset[] = [
  { id: '1', name: 'Savings Account', value: 0, category: 'cash' },
  { id: '2', name: 'Fixed Deposits', value: 0, category: 'cash' },
  { id: '3', name: 'Stocks & Mutual Funds', value: 0, category: 'investment' },
  { id: '4', name: 'PPF', value: 0, category: 'investment' },
  { id: '5', name: 'NPS', value: 0, category: 'investment' },
  { id: '6', name: 'Primary Residence', value: 0, category: 'property' },
  { id: '7', name: 'Car', value: 0, category: 'vehicle' },
  { id: '8', name: 'Gold & Jewelry', value: 0, category: 'other' },
];

const defaultLiabilities: Liability[] = [
  { id: '1', name: 'Home Loan', value: 0, category: 'home_loan' },
  { id: '2', name: 'Car Loan', value: 0, category: 'car_loan' },
  { id: '3', name: 'Personal Loan', value: 0, category: 'personal_loan' },
  { id: '4', name: 'Credit Card Debt', value: 0, category: 'credit_card' },
  { id: '5', name: 'Education Loan', value: 0, category: 'education_loan' },
];

const assetIcons = {
  cash: Wallet,
  investment: TrendingUp,
  property: Building,
  vehicle: Car,
  other: Coins
};

const liabilityIcons = {
  home_loan: Home,
  car_loan: Car,
  personal_loan: Briefcase,
  credit_card: CreditCard,
  education_loan: Landmark,
  other: Coins
};

const NetWorthCalculator = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>(defaultAssets);
  const [liabilities, setLiabilities] = useState<Liability[]>(defaultLiabilities);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'cash' as Asset['category'] });
  const [newLiability, setNewLiability] = useState({ name: '', category: 'other' as Liability['category'] });

  const addAsset = () => {
    if (newAsset.name.trim()) {
      setAssets([...assets, { id: Date.now().toString(), name: newAsset.name, value: 0, category: newAsset.category }]);
      setNewAsset({ name: '', category: 'cash' });
    }
  };

  const addLiability = () => {
    if (newLiability.name.trim()) {
      setLiabilities([...liabilities, { id: Date.now().toString(), name: newLiability.name, value: 0, category: newLiability.category }]);
      setNewLiability({ name: '', category: 'other' });
    }
  };

  const updateAsset = (id: string, value: number) => {
    setAssets(assets.map(a => a.id === id ? { ...a, value } : a));
  };

  const updateLiability = (id: string, value: number) => {
    setLiabilities(liabilities.map(l => l.id === id ? { ...l, value } : l));
  };

  const removeAsset = (id: string) => setAssets(assets.filter(a => a.id !== id));
  const removeLiability = (id: string) => setLiabilities(liabilities.filter(l => l.id !== id));

  const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.value, 0);
  const netWorth = totalAssets - totalLiabilities;

  const assetsByCategory = {
    cash: assets.filter(a => a.category === 'cash').reduce((sum, a) => sum + a.value, 0),
    investment: assets.filter(a => a.category === 'investment').reduce((sum, a) => sum + a.value, 0),
    property: assets.filter(a => a.category === 'property').reduce((sum, a) => sum + a.value, 0),
    vehicle: assets.filter(a => a.category === 'vehicle').reduce((sum, a) => sum + a.value, 0),
    other: assets.filter(a => a.category === 'other').reduce((sum, a) => sum + a.value, 0),
  };

  const liquidAssets = assetsByCategory.cash + assetsByCategory.investment;
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const liquidityRatio = totalLiabilities > 0 ? (liquidAssets / totalLiabilities) * 100 : 100;

  const getFinancialHealth = () => {
    if (netWorth > 0 && debtToAssetRatio < 30 && liquidityRatio > 50) return { status: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (netWorth > 0 && debtToAssetRatio < 50) return { status: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (netWorth >= 0) return { status: 'Fair', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { status: 'Needs Attention', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const health = getFinancialHealth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatLakhs = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return formatCurrency(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Net Worth Calculator</h1>
              <p className="text-sm text-muted-foreground">Track assets vs liabilities</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Net Worth Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-2 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Your Net Worth</p>
                  <p className={`text-4xl font-bold ${netWorth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatLakhs(netWorth)}
                  </p>
                  <div className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full ${health.bg}`}>
                    {netWorth >= 0 ? <TrendingUp className={`h-4 w-4 ${health.color}`} /> : <TrendingDown className={`h-4 w-4 ${health.color}`} />}
                    <span className={`text-sm font-medium ${health.color}`}>{health.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold text-green-500">{formatLakhs(totalAssets)}</p>
                  <TrendingUp className="h-4 w-4 text-green-500 mx-auto mt-1" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-500">{formatLakhs(totalLiabilities)}</p>
                  <TrendingDown className="h-4 w-4 text-red-500 mx-auto mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Financial Ratios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-primary" />
                Financial Health Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Debt-to-Asset Ratio</span>
                    <span className={debtToAssetRatio < 30 ? 'text-green-500' : debtToAssetRatio < 50 ? 'text-amber-500' : 'text-red-500'}>
                      {debtToAssetRatio.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(debtToAssetRatio, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">Target: Below 30%</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Liquidity Ratio</span>
                    <span className={liquidityRatio > 50 ? 'text-green-500' : 'text-amber-500'}>
                      {liquidityRatio.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(liquidityRatio, 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground">Liquid Assets / Total Debt</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Asset Allocation</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                    {totalAssets > 0 && (
                      <>
                        <div className="bg-blue-500" style={{ width: `${(assetsByCategory.cash / totalAssets) * 100}%` }} />
                        <div className="bg-green-500" style={{ width: `${(assetsByCategory.investment / totalAssets) * 100}%` }} />
                        <div className="bg-amber-500" style={{ width: `${(assetsByCategory.property / totalAssets) * 100}%` }} />
                        <div className="bg-purple-500" style={{ width: `${(assetsByCategory.vehicle / totalAssets) * 100}%` }} />
                        <div className="bg-pink-500" style={{ width: `${(assetsByCategory.other / totalAssets) * 100}%` }} />
                      </>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-500" />Cash</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500" />Invest</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500" />Property</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" />Vehicle</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-pink-500" />Other</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-500">
                  <TrendingUp className="h-5 w-5" />
                  Assets ({formatLakhs(totalAssets)})
                </CardTitle>
                <CardDescription>What you own</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New asset name"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                    className="flex-1"
                  />
                  <Button onClick={addAsset} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {['cash', 'investment', 'property', 'vehicle', 'other'].map((category) => {
                    const Icon = assetIcons[category as keyof typeof assetIcons];
                    const categoryAssets = assets.filter(a => a.category === category);
                    if (categoryAssets.length === 0) return null;
                    return (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                          <Icon className="h-3 w-3" /> {category}
                        </h4>
                        {categoryAssets.map((asset) => (
                          <div key={asset.id} className="flex items-center gap-2 p-2 bg-green-500/5 rounded-lg">
                            <span className="flex-1 text-sm">{asset.name}</span>
                            <Input
                              type="number"
                              value={asset.value}
                              onChange={(e) => updateAsset(asset.id, Number(e.target.value))}
                              className="w-[120px]"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeAsset(asset.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Liabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <TrendingDown className="h-5 w-5" />
                  Liabilities ({formatLakhs(totalLiabilities)})
                </CardTitle>
                <CardDescription>What you owe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New liability name"
                    value={newLiability.name}
                    onChange={(e) => setNewLiability({ ...newLiability, name: e.target.value })}
                    className="flex-1"
                  />
                  <Button onClick={addLiability} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {liabilities.map((liability) => {
                    const Icon = liabilityIcons[liability.category];
                    return (
                      <div key={liability.id} className="flex items-center gap-2 p-2 bg-red-500/5 rounded-lg">
                        <Icon className="h-4 w-4 text-red-500" />
                        <span className="flex-1 text-sm">{liability.name}</span>
                        <Input
                          type="number"
                          value={liability.value}
                          onChange={(e) => updateLiability(liability.id, Number(e.target.value))}
                          className="w-[120px]"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeLiability(liability.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Tips to Grow Your Net Worth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Pay off high-interest debt first (credit cards, personal loans)</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Increase investments in appreciating assets (stocks, mutual funds, real estate)</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Track your net worth quarterly to monitor progress</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Maintain liquid assets worth 6 months of expenses</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Diversify across asset classes to reduce risk</span>
                </li>
                <li className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <span className="text-sm">Avoid depreciating assets like new cars when possible</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Info className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This Net Worth Calculator is provided for informational and educational purposes only. Asset values
                entered should reflect current market values, which may fluctuate.
              </p>
              <p>
                Real estate values should be based on recent market valuations. Vehicle values depreciate over time.
                Investment values should reflect current portfolio value.
              </p>
              <p>
                Data entered is stored locally in your browser and is not saved to any server. This tool does not
                constitute financial advice. Consult a certified financial planner for personalized guidance.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NetWorthCalculator;
