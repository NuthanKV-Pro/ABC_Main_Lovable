import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

const ExemptIncome = () => {
  const navigate = useNavigate();
  const [agricultureData, setAgricultureData] = useState({
    income: 0,
    expense: 0,
    acres: 0,
    ownership: "owned",
    waterType: "rainfed",
    pincode: "",
    district: ""
  });

  const [otherExempt, setOtherExempt] = useState({
    partnershipProfit: 0,
    hufProfit: 0,
    ppfInterest: 0,
    recognisedPF: 0,
    compulsoryAcquisition: 0,
    sikkimIncome: 0
  });

  const agricultureProfit = agricultureData.income - agricultureData.expense;
  const totalExempt = agricultureProfit + Object.values(otherExempt).reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Exempt Income</h1>
              <p className="text-sm text-muted-foreground">Income not subject to tax</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Agricultural Income */}
        <Card>
          <CardHeader>
            <CardTitle>Agricultural Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Income (₹)</Label>
                <Input
                  type="number"
                  value={agricultureData.income || ''}
                  onChange={(e) => setAgricultureData(prev => ({ ...prev, income: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Expense (₹)</Label>
                <Input
                  type="number"
                  value={agricultureData.expense || ''}
                  onChange={(e) => setAgricultureData(prev => ({ ...prev, expense: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Profit (₹)</Label>
                <Input
                  type="number"
                  value={agricultureProfit}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label>Acres of Land</Label>
                <Input
                  type="number"
                  value={agricultureData.acres || ''}
                  onChange={(e) => setAgricultureData(prev => ({ ...prev, acres: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Owned or Rented</Label>
                <Select value={agricultureData.ownership} onValueChange={(val) => setAgricultureData(prev => ({ ...prev, ownership: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="rented">Rented</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rainfed or Irrigated</Label>
                <Select value={agricultureData.waterType} onValueChange={(val) => setAgricultureData(prev => ({ ...prev, waterType: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainfed">Rainfed</SelectItem>
                    <SelectItem value="irrigated">Irrigated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pincode</Label>
                <Input
                  value={agricultureData.pincode}
                  onChange={(e) => setAgricultureData(prev => ({ ...prev, pincode: e.target.value }))}
                />
              </div>
              <div>
                <Label>District (Auto-fetch)</Label>
                <Input
                  value={agricultureData.district}
                  onChange={(e) => setAgricultureData(prev => ({ ...prev, district: e.target.value }))}
                  placeholder="Auto-fetched from pincode"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Exempt Income */}
        <Card>
          <CardHeader>
            <CardTitle>Other Exempt Income</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Income Type</TableHead>
                  <TableHead>Amount (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Share of Profit from Partnership</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={otherExempt.partnershipProfit || ''}
                      onChange={(e) => setOtherExempt(prev => ({ ...prev, partnershipProfit: parseFloat(e.target.value) || 0 }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Share of Profit from HUF</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={otherExempt.hufProfit || ''}
                      onChange={(e) => setOtherExempt(prev => ({ ...prev, hufProfit: parseFloat(e.target.value) || 0 }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>PPF Interest</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={otherExempt.ppfInterest || ''}
                      onChange={(e) => setOtherExempt(prev => ({ ...prev, ppfInterest: parseFloat(e.target.value) || 0 }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Recognised PF</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={otherExempt.recognisedPF || ''}
                      onChange={(e) => setOtherExempt(prev => ({ ...prev, recognisedPF: parseFloat(e.target.value) || 0 }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Compulsory Acquisition</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={otherExempt.compulsoryAcquisition || ''}
                      onChange={(e) => setOtherExempt(prev => ({ ...prev, compulsoryAcquisition: parseFloat(e.target.value) || 0 }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Income of a Sikkimese Individual</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={otherExempt.sikkimIncome || ''}
                      onChange={(e) => setOtherExempt(prev => ({ ...prev, sikkimIncome: parseFloat(e.target.value) || 0 }))}
                    />
                  </TableCell>
                </TableRow>
                <TableRow className="bg-primary/5 font-bold">
                  <TableCell>Total Exempt Income</TableCell>
                  <TableCell>₹{totalExempt.toLocaleString('en-IN')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExemptIncome;
