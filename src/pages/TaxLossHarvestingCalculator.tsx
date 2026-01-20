import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Plus, Trash2, Info, CheckCircle, AlertTriangle, TrendingUp, Lightbulb, Scale, Percent, IndianRupee, Upload, FileSpreadsheet, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface Holding {
  id: string;
  name: string;
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
  type: 'equity' | 'debt' | 'other';
  holdingPeriod: 'short' | 'long';
}

const TaxLossHarvestingCalculator = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [holdings, setHoldings] = useState<Holding[]>([
    { id: '1', name: 'Stock A', purchasePrice: 1000, currentPrice: 1200, quantity: 100, type: 'equity', holdingPeriod: 'long' },
    { id: '2', name: 'Stock B', purchasePrice: 500, currentPrice: 350, quantity: 200, type: 'equity', holdingPeriod: 'short' },
    { id: '3', name: 'MF - Debt', purchasePrice: 2000, currentPrice: 1800, quantity: 50, type: 'debt', holdingPeriod: 'long' },
  ]);
  const [isParsingFile, setIsParsingFile] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const addHolding = () => {
    const newHolding: Holding = {
      id: Date.now().toString(),
      name: `Asset ${holdings.length + 1}`,
      purchasePrice: 1000,
      currentPrice: 1000,
      quantity: 10,
      type: 'equity',
      holdingPeriod: 'short'
    };
    setHoldings([...holdings, newHolding]);
  };

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const updateHolding = (id: string, field: keyof Holding, value: any) => {
    setHoldings(holdings.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  // Parse Zerodha Holding Statement Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Find header row - Zerodha format typically has headers like: Instrument, Qty., Avg. cost, LTP, Cur. val, P&L, Net chg., Day chg.
      let headerRowIndex = -1;
      const possibleHeaders = ['instrument', 'symbol', 'stock', 'name', 'qty', 'quantity'];
      
      for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
        const row = jsonData[i];
        if (row && row.some((cell: any) => 
          typeof cell === 'string' && 
          possibleHeaders.some(h => cell.toLowerCase().includes(h))
        )) {
          headerRowIndex = i;
          break;
        }
      }

      if (headerRowIndex === -1) {
        toast.error("Could not identify column headers. Please ensure the file has columns like Instrument, Qty, Avg. cost, LTP.");
        setIsParsingFile(false);
        return;
      }

      const headers = jsonData[headerRowIndex].map((h: any) => 
        String(h || '').toLowerCase().trim()
      );

      // Map column indices
      const getColumnIndex = (keywords: string[]) => {
        return headers.findIndex((h: string) => 
          keywords.some(k => h.includes(k))
        );
      };

      const nameCol = getColumnIndex(['instrument', 'symbol', 'stock', 'name', 'scrip']);
      const qtyCol = getColumnIndex(['qty', 'quantity', 'units']);
      const avgCostCol = getColumnIndex(['avg', 'average', 'buy', 'cost', 'purchase']);
      const ltpCol = getColumnIndex(['ltp', 'current', 'cmp', 'market', 'close', 'price']);

      if (nameCol === -1 || qtyCol === -1 || avgCostCol === -1 || ltpCol === -1) {
        toast.error("Missing required columns. Expected: Instrument/Symbol, Qty, Avg. cost, LTP/Current Price");
        setIsParsingFile(false);
        return;
      }

      const parsedHoldings: Holding[] = [];
      
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;

        const name = String(row[nameCol] || '').trim();
        const qty = parseFloat(String(row[qtyCol] || '0').replace(/,/g, ''));
        const avgCost = parseFloat(String(row[avgCostCol] || '0').replace(/,/g, ''));
        const ltp = parseFloat(String(row[ltpCol] || '0').replace(/,/g, ''));

        if (name && !isNaN(qty) && qty > 0 && !isNaN(avgCost) && !isNaN(ltp)) {
          parsedHoldings.push({
            id: Date.now().toString() + i,
            name: name,
            purchasePrice: avgCost,
            currentPrice: ltp,
            quantity: qty,
            type: 'equity',
            holdingPeriod: 'short' // Default to short term - user can adjust
          });
        }
      }

      if (parsedHoldings.length === 0) {
        toast.error("No valid holdings found in the file.");
      } else {
        setHoldings(parsedHoldings);
        toast.success(`Successfully imported ${parsedHoldings.length} holdings from Zerodha statement!`);
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      toast.error("Error parsing file. Please check the format and try again.");
    }
    
    setIsParsingFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Calculate gains/losses
  const calculateGainLoss = (holding: Holding) => {
    const totalPurchase = holding.purchasePrice * holding.quantity;
    const totalCurrent = holding.currentPrice * holding.quantity;
    return totalCurrent - totalPurchase;
  };

  // Get tax rate based on type and holding period
  const getTaxRate = (type: string, holdingPeriod: string) => {
    if (type === 'equity') {
      return holdingPeriod === 'long' ? 12.5 : 20; // LTCG: 12.5% (above 1.25L), STCG: 20%
    } else if (type === 'debt') {
      return holdingPeriod === 'long' ? 20 : 30; // Assuming slab rate for debt
    }
    return 30; // Default slab rate
  };

  const gainHoldings = holdings.filter(h => calculateGainLoss(h) > 0);
  const lossHoldings = holdings.filter(h => calculateGainLoss(h) < 0);

  const totalGains = gainHoldings.reduce((sum, h) => sum + calculateGainLoss(h), 0);
  const totalLosses = Math.abs(lossHoldings.reduce((sum, h) => sum + calculateGainLoss(h), 0));
  const netGainLoss = totalGains - totalLosses;

  // Categorize by type and period for equity
  const shortTermEquityGains = holdings.filter(h => h.type === 'equity' && h.holdingPeriod === 'short' && calculateGainLoss(h) > 0)
    .reduce((sum, h) => sum + calculateGainLoss(h), 0);
  const shortTermEquityLosses = Math.abs(holdings.filter(h => h.type === 'equity' && h.holdingPeriod === 'short' && calculateGainLoss(h) < 0)
    .reduce((sum, h) => sum + calculateGainLoss(h), 0));
  const longTermEquityGains = holdings.filter(h => h.type === 'equity' && h.holdingPeriod === 'long' && calculateGainLoss(h) > 0)
    .reduce((sum, h) => sum + calculateGainLoss(h), 0);
  const longTermEquityLosses = Math.abs(holdings.filter(h => h.type === 'equity' && h.holdingPeriod === 'long' && calculateGainLoss(h) < 0)
    .reduce((sum, h) => sum + calculateGainLoss(h), 0));

  // LTCG exemption (₹1.25 Lakh for equity)
  const ltcgExemption = 125000;
  
  // CORRECT TAX SAVINGS CALCULATION
  // As per Indian tax law:
  // - STCL can be set off against both STCG and LTCG
  // - LTCL can ONLY be set off against LTCG

  // Tax WITHOUT harvesting (if we didn't book any losses)
  const taxableLTCGWithoutHarvesting = Math.max(0, longTermEquityGains - ltcgExemption);
  const taxWithoutHarvesting = (shortTermEquityGains * 0.20) + (taxableLTCGWithoutHarvesting * 0.125);

  // Tax WITH harvesting (after booking losses)
  // Step 1: STCL first offsets STCG
  let remainingSTCL = shortTermEquityLosses;
  const netSTCG = Math.max(0, shortTermEquityGains - remainingSTCL);
  remainingSTCL = Math.max(0, remainingSTCL - shortTermEquityGains);

  // Step 2: LTCL offsets LTCG (after exemption consideration)
  // Step 3: Any remaining STCL also offsets LTCG
  const taxableLTCGBeforeOffset = Math.max(0, longTermEquityGains - ltcgExemption);
  const totalLTCGOffset = longTermEquityLosses + remainingSTCL;
  const netTaxableLTCG = Math.max(0, taxableLTCGBeforeOffset - totalLTCGOffset);

  const taxWithHarvesting = (netSTCG * 0.20) + (netTaxableLTCG * 0.125);
  const taxSavings = Math.max(0, taxWithoutHarvesting - taxWithHarvesting);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Tax Loss Harvesting Calculator</h1>
              <p className="text-sm text-muted-foreground">Offset capital gains with losses for tax optimization</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* How It Works */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                What is Tax Loss Harvesting?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Tax Loss Harvesting is a strategy where you sell investments that are at a loss to offset the capital gains 
                from profitable investments. This reduces your overall tax liability while maintaining your investment strategy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Step 1: Identify Losses</h4>
                  <p className="text-sm text-muted-foreground">Find investments trading below your purchase price</p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Step 2: Book Losses</h4>
                  <p className="text-sm text-muted-foreground">Sell losing positions before financial year end</p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Step 3: Offset Gains</h4>
                  <p className="text-sm text-muted-foreground">Use booked losses to reduce taxable capital gains</p>
                </div>
                <div className="p-4 bg-card rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">Step 4: Buy Back</h4>
                  <p className="text-sm text-muted-foreground">Repurchase sold shares/securities to maintain strategy</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zerodha Upload Section */}
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    Import Zerodha Holdings
                  </CardTitle>
                  <CardDescription>Upload your Zerodha Holding Statement (Excel) to auto-analyze</CardDescription>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    variant="outline"
                    disabled={isParsingFile}
                  >
                    {isParsingFile ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Excel
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How to get your Zerodha Holdings:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Login to <a href="https://kite.zerodha.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">kite.zerodha.com</a></li>
                  <li>Go to <strong>Holdings</strong> tab</li>
                  <li>Click on <strong>Download</strong> icon (top right) → Select <strong>Excel</strong></li>
                  <li>Upload the downloaded file here</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  <Info className="h-3 w-3 inline mr-1" />
                  Supported formats: .xlsx, .xls, .csv. Columns needed: Instrument, Qty, Avg. cost, LTP
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Holdings Input */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Your Investment Holdings
                  </CardTitle>
                  <CardDescription>Add your current investments to analyze harvesting opportunities</CardDescription>
                </div>
                <Button onClick={addHolding} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Holding
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.map((holding) => {
                  const gainLoss = calculateGainLoss(holding);
                  const isGain = gainLoss >= 0;
                  return (
                    <div key={holding.id} className={`p-4 rounded-lg border ${isGain ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Asset Name</Label>
                          <Input
                            value={holding.name}
                            onChange={(e) => updateHolding(holding.id, 'name', e.target.value)}
                            placeholder="Stock/MF Name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Buy Price (₹)</Label>
                          <Input
                            type="number"
                            value={holding.purchasePrice}
                            onChange={(e) => updateHolding(holding.id, 'purchasePrice', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Current Price (₹)</Label>
                          <Input
                            type="number"
                            value={holding.currentPrice}
                            onChange={(e) => updateHolding(holding.id, 'currentPrice', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={holding.quantity}
                            onChange={(e) => updateHolding(holding.id, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Type</Label>
                          <Select value={holding.type} onValueChange={(v) => updateHolding(holding.id, 'type', v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equity">Equity</SelectItem>
                              <SelectItem value="debt">Debt</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Holding Period</Label>
                          <Select value={holding.holdingPeriod} onValueChange={(v) => updateHolding(holding.id, 'holdingPeriod', v as 'short' | 'long')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="short">Short Term</SelectItem>
                              <SelectItem value="long">Long Term</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`text-sm font-semibold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                            {isGain ? '+' : ''}{formatCurrency(gainLoss)}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeHolding(holding.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Total Gains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{formatCurrency(totalGains)}</p>
                <p className="text-xs text-muted-foreground mt-1">{gainHoldings.length} profitable holdings</p>
              </CardContent>
            </Card>

            <Card className="border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                  Total Losses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-500">-{formatCurrency(totalLosses)}</p>
                <p className="text-xs text-muted-foreground mt-1">{lossHoldings.length} losing holdings</p>
              </CardContent>
            </Card>

            <Card className={netGainLoss >= 0 ? 'border-green-500/30' : 'border-red-500/30'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="h-4 w-4 text-primary" />
                  Net Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${netGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {netGainLoss >= 0 ? '+' : ''}{formatCurrency(netGainLoss)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">After offsetting losses</p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-primary" />
                  Potential Tax Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{formatCurrency(Math.max(0, taxSavings))}</p>
                <p className="text-xs text-muted-foreground mt-1">By harvesting losses</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Tabs defaultValue="equity" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="equity">Equity Analysis</TabsTrigger>
              <TabsTrigger value="strategy">Harvesting Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="equity" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Short Term Capital Gains (STCG)</CardTitle>
                    <CardDescription>Holdings less than 12 months for equity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span>Gains</span>
                      <span className="font-bold text-green-500">{formatCurrency(shortTermEquityGains)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                      <span>Losses</span>
                      <span className="font-bold text-red-500">-{formatCurrency(shortTermEquityLosses)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Net STCG</span>
                      <span className="font-bold">{formatCurrency(shortTermEquityGains - shortTermEquityLosses)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                      <span>Tax @ 20%</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(Math.max(0, (shortTermEquityGains - shortTermEquityLosses) * 0.20))}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Long Term Capital Gains (LTCG)</CardTitle>
                    <CardDescription>Holdings more than 12 months for equity</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span>Gains</span>
                      <span className="font-bold text-green-500">{formatCurrency(longTermEquityGains)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-500/10 rounded-lg">
                      <span>Exemption (₹1.25L)</span>
                      <span className="font-bold text-amber-500">-{formatCurrency(Math.min(longTermEquityGains, ltcgExemption))}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                      <span>Losses Offset</span>
                      <span className="font-bold text-red-500">-{formatCurrency(longTermEquityLosses)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span>Taxable LTCG</span>
                      <span className="font-bold">{formatCurrency(netTaxableLTCG)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                      <span>Tax @ 12.5%</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(netTaxableLTCG * 0.125)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="strategy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Recommended Harvesting Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lossHoldings.length > 0 ? (
                    <>
                      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <h4 className="font-semibold text-amber-600 mb-2">Consider Selling These Losing Positions:</h4>
                        <ul className="space-y-2">
                          {lossHoldings.map(h => (
                            <li key={h.id} className="flex justify-between items-center p-2 bg-card rounded">
                              <span>{h.name} ({h.holdingPeriod === 'short' ? 'STCG' : 'LTCG'})</span>
                              <span className="font-semibold text-red-500">{formatCurrency(calculateGainLoss(h))}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <h4 className="font-semibold text-green-600 mb-2">✅ Do This</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Sell losing positions before 31st March</li>
                            <li>• Wait 30+ days before repurchasing (wash sale rule)</li>
                            <li>• Document all transactions properly</li>
                            <li>• Consider transaction costs in your decision</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <h4 className="font-semibold text-red-600 mb-2">❌ Avoid This</h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Don't sell just for tax benefits if fundamentals are strong</li>
                            <li>• Avoid repurchasing immediately (wash sale)</li>
                            <li>• Don't ignore brokerage and STT costs</li>
                            <li>• Don't harvest more losses than you have gains</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center bg-muted/30 rounded-lg">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold">All your holdings are in profit!</p>
                      <p className="text-muted-foreground">No tax loss harvesting opportunities available currently.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Set-off Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Capital Gains Set-off Rules (India)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Short Term Capital Loss (STCL)</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Can be set off against both STCG and LTCG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Unabsorbed loss can be carried forward for 8 years</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary">Long Term Capital Loss (LTCL)</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>Can ONLY be set off against LTCG (not STCG)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Unabsorbed loss can be carried forward for 8 years</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Rates Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Capital Gains Tax Rates (FY 2024-25)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Asset Type</th>
                      <th className="text-left p-3">Holding Period</th>
                      <th className="text-left p-3">STCG Rate</th>
                      <th className="text-left p-3">LTCG Rate</th>
                      <th className="text-left p-3">Exemption</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">Listed Equity/Equity MF</td>
                      <td className="p-3">&gt;12 months for LTCG</td>
                      <td className="p-3">20%</td>
                      <td className="p-3">12.5%</td>
                      <td className="p-3">₹1.25 Lakh</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Debt MF / Bonds</td>
                      <td className="p-3">All periods</td>
                      <td className="p-3">Slab Rate</td>
                      <td className="p-3">Slab Rate</td>
                      <td className="p-3">None</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3">Real Estate</td>
                      <td className="p-3">&gt;24 months for LTCG</td>
                      <td className="p-3">Slab Rate</td>
                      <td className="p-3">12.5%</td>
                      <td className="p-3">None (No indexation)</td>
                    </tr>
                    <tr>
                      <td className="p-3">Gold / Other Assets</td>
                      <td className="p-3">&gt;24 months for LTCG</td>
                      <td className="p-3">Slab Rate</td>
                      <td className="p-3">12.5%</td>
                      <td className="p-3">None (No indexation)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                Important Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                This Tax Loss Harvesting Calculator is provided for educational and informational purposes only.
                It is designed to help you understand the concept of tax loss harvesting and estimate potential tax savings.
              </p>
              <p>
                Tax laws are complex and subject to change. The tax rates and rules shown here are based on the Union Budget 2024 
                and may not reflect the latest amendments. Always verify current rates with official sources.
              </p>
              <p>
                Surcharge and cess (4% health & education cess) are not included in the calculations. Actual tax liability 
                may vary based on your total income and applicable surcharge slabs.
              </p>
              <p>
                <strong>Important:</strong> Securities Transaction Tax (STT), brokerage, and other transaction costs are not 
                considered. These costs should be factored into your harvesting decision.
              </p>
              <p>
                This tool does not constitute tax advice. Please consult a qualified tax professional or Chartered Accountant 
                before making any investment or tax planning decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TaxLossHarvestingCalculator;
