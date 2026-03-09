import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, Bitcoin, AlertTriangle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

interface Trade {
  id: string;
  asset: string;
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  type: "profit" | "loss";
}

const CryptoTaxCalculator = () => {
  const goBack = useGoBack();
  const [trades, setTrades] = useState<Trade[]>([
    { id: "1", asset: "Bitcoin", buyPrice: 3000000, sellPrice: 4500000, quantity: 0.5, type: "profit" },
    { id: "2", asset: "Ethereum", buyPrice: 200000, sellPrice: 150000, quantity: 2, type: "loss" },
  ]);
  const [newTrade, setNewTrade] = useState({ asset: "", buyPrice: "", sellPrice: "", quantity: "" });

  const addTrade = () => {
    if (newTrade.asset && newTrade.buyPrice && newTrade.sellPrice && newTrade.quantity) {
      const buy = parseFloat(newTrade.buyPrice);
      const sell = parseFloat(newTrade.sellPrice);
      const qty = parseFloat(newTrade.quantity);
      setTrades([...trades, {
        id: Date.now().toString(),
        asset: newTrade.asset,
        buyPrice: buy,
        sellPrice: sell,
        quantity: qty,
        type: sell > buy ? "profit" : "loss"
      }]);
      setNewTrade({ asset: "", buyPrice: "", sellPrice: "", quantity: "" });
    }
  };

  const deleteTrade = (id: string) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  const calculateTax = () => {
    let totalProfit = 0;
    let totalLoss = 0;
    let totalTDS = 0;

    trades.forEach(trade => {
      const gain = (trade.sellPrice - trade.buyPrice) * trade.quantity;
      if (gain > 0) {
        totalProfit += gain;
      } else {
        totalLoss += Math.abs(gain);
      }
      // TDS 1% on sale value above ₹50,000
      const saleValue = trade.sellPrice * trade.quantity;
      if (saleValue > 50000) {
        totalTDS += saleValue * 0.01;
      }
    });

    const tax = totalProfit * 0.30; // 30% flat tax
    const surcharge = tax > 1000000 ? tax * 0.15 : tax > 5000000 ? tax * 0.25 : 0;
    const cess = (tax + surcharge) * 0.04;
    const totalTax = tax + surcharge + cess;

    return { totalProfit, totalLoss, tax, surcharge, cess, totalTax, totalTDS };
  };

  const result = calculateTax();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Bitcoin className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Crypto Tax Calculator</CardTitle>
              <CardDescription>Calculate VDA tax under Indian regulations - 30% flat tax, 1% TDS</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="pt-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">Important VDA Tax Rules (Section 115BBH)</p>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• 30% flat tax on crypto gains - no slab benefit</li>
                  <li>• No set-off of losses against other income or crypto profits</li>
                  <li>• 1% TDS on transfers above ₹50,000 (Section 194S)</li>
                  <li>• No deduction allowed except cost of acquisition</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label>Asset</Label>
                  <Input
                    placeholder="BTC, ETH, etc."
                    value={newTrade.asset}
                    onChange={(e) => setNewTrade({ ...newTrade, asset: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Buy Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newTrade.buyPrice}
                    onChange={(e) => setNewTrade({ ...newTrade, buyPrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sell Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newTrade.sellPrice}
                    onChange={(e) => setNewTrade({ ...newTrade, sellPrice: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0"
                    value={newTrade.quantity}
                    onChange={(e) => setNewTrade({ ...newTrade, quantity: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addTrade} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Buy Price</TableHead>
                <TableHead className="text-right">Sell Price</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Gain/Loss</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => {
                const gain = (trade.sellPrice - trade.buyPrice) * trade.quantity;
                return (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.asset}</TableCell>
                    <TableCell className="text-right font-mono">₹{trade.buyPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">₹{trade.sellPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{trade.quantity}</TableCell>
                    <TableCell className={`text-right font-mono ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {gain >= 0 ? "+" : ""}₹{gain.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteTrade(trade.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Gains Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Profit:</span>
                    <span className="font-mono text-green-500">₹{result.totalProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Loss (non-deductible):</span>
                    <span className="font-mono text-red-500">₹{result.totalLoss.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Tax Liability</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tax @ 30%:</span>
                    <span className="font-mono">₹{result.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Surcharge (if applicable):</span>
                    <span className="font-mono">₹{result.surcharge.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cess @ 4%:</span>
                    <span className="font-mono">₹{result.cess.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total Tax:</span>
                    <span className="text-primary font-mono">₹{Math.round(result.totalTax).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>TDS Already Deducted:</span>
                    <span className="font-mono">₹{Math.round(result.totalTDS).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoTaxCalculator;
