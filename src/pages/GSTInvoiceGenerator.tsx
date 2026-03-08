import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Download, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  qty: number;
  rate: number;
  gstRate: number;
  discount: number;
}

const gstRates = [0, 0.25, 3, 5, 12, 18, 28];

const hsnCodes: Record<string, string> = {
  "9983": "Professional Services",
  "9984": "Telecommunications",
  "9985": "IT & Software Services",
  "9986": "Support Services",
  "9971": "Financial Services",
  "9972": "Real Estate Services",
  "9973": "Leasing/Rental Services",
  "8471": "Computers & Laptops",
  "8517": "Mobile Phones",
  "6109": "T-shirts & Apparel",
  "0402": "Milk Products",
  "1006": "Rice",
  "8703": "Motor Cars",
  "3304": "Beauty Products",
  "3004": "Medicines",
  "2202": "Beverages",
};

const validateGSTIN = (gstin: string): boolean => {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.toUpperCase());
};

const GSTInvoiceGenerator = () => {
  const navigate = useNavigate();
  const [sellerGSTIN, setSellerGSTIN] = useState("29ABCDE1234F1Z5");
  const [buyerGSTIN, setBuyerGSTIN] = useState("");
  const [sellerName, setSellerName] = useState("ABC Enterprises");
  const [buyerName, setBuyerName] = useState("");
  const [sellerState, setSellerState] = useState("29");
  const [buyerState, setBuyerState] = useState("29");
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-001");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInterState, setIsInterState] = useState(false);
  const [reverseCharge, setReverseCharge] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Software Development Services", hsnCode: "9985", qty: 1, rate: 100000, gstRate: 18, discount: 0 },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now().toString(), description: "", hsnCode: "", qty: 1, rate: 0, gstRate: 18, discount: 0 }]);
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const totals = useMemo(() => {
    let subtotal = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalDiscount = 0;
    items.forEach(item => {
      const lineTotal = item.qty * item.rate;
      const discountAmt = (lineTotal * item.discount) / 100;
      const taxableValue = lineTotal - discountAmt;
      const gstAmt = (taxableValue * item.gstRate) / 100;
      subtotal += taxableValue;
      totalDiscount += discountAmt;
      if (isInterState) {
        totalIGST += gstAmt;
      } else {
        totalCGST += gstAmt / 2;
        totalSGST += gstAmt / 2;
      }
    });
    return { subtotal, totalCGST, totalSGST, totalIGST, totalDiscount, grandTotal: subtotal + totalCGST + totalSGST + totalIGST };
  }, [items, isInterState]);

  const formatCurrency = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isSellerGSTINValid = validateGSTIN(sellerGSTIN);
  const isBuyerGSTINValid = !buyerGSTIN || validateGSTIN(buyerGSTIN);

  const states: Record<string, string> = {
    "01": "Jammu & Kashmir", "02": "Himachal Pradesh", "03": "Punjab", "04": "Chandigarh", "05": "Uttarakhand",
    "06": "Haryana", "07": "Delhi", "08": "Rajasthan", "09": "Uttar Pradesh", "10": "Bihar",
    "11": "Sikkim", "12": "Arunachal Pradesh", "13": "Nagaland", "14": "Manipur", "15": "Mizoram",
    "16": "Tripura", "17": "Meghalaya", "18": "Assam", "19": "West Bengal", "20": "Jharkhand",
    "21": "Odisha", "22": "Chhattisgarh", "23": "Madhya Pradesh", "24": "Gujarat", "27": "Maharashtra",
    "29": "Karnataka", "32": "Kerala", "33": "Tamil Nadu", "36": "Telangana", "37": "Andhra Pradesh"
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">GST Invoice Generator</h1>
            <p className="text-muted-foreground text-sm">Generate GST-compliant invoices with HSN/SAC codes & GSTIN validation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Seller Details */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Seller Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Business Name</Label>
                <Input value={sellerName} onChange={e => setSellerName(e.target.value)} />
              </div>
              <div>
                <Label>GSTIN</Label>
                <Input value={sellerGSTIN} onChange={e => setSellerGSTIN(e.target.value.toUpperCase())} maxLength={15} />
                {sellerGSTIN && <p className={`text-xs mt-1 ${isSellerGSTINValid ? 'text-green-500' : 'text-destructive'}`}>
                  {isSellerGSTINValid ? "✓ Valid GSTIN format" : "✗ Invalid GSTIN format"}
                </p>}
              </div>
              <div>
                <Label>State</Label>
                <Select value={sellerState} onValueChange={v => { setSellerState(v); setIsInterState(v !== buyerState); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(states).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Buyer Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Buyer Name</Label>
                <Input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Buyer business name" />
              </div>
              <div>
                <Label>GSTIN (optional for B2C)</Label>
                <Input value={buyerGSTIN} onChange={e => setBuyerGSTIN(e.target.value.toUpperCase())} maxLength={15} placeholder="Leave blank for B2C" />
                {buyerGSTIN && <p className={`text-xs mt-1 ${isBuyerGSTINValid ? 'text-green-500' : 'text-destructive'}`}>
                  {isBuyerGSTINValid ? "✓ Valid GSTIN format" : "✗ Invalid GSTIN format"}
                </p>}
              </div>
              <div>
                <Label>State</Label>
                <Select value={buyerState} onValueChange={v => { setBuyerState(v); setIsInterState(v !== sellerState); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(states).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Meta */}
        <Card className="mt-6">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>Invoice No.</Label><Input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} /></div>
              <div><Label>Invoice Date</Label><Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} /></div>
              <div className="flex items-center gap-2 pt-6">
                <Badge variant={isInterState ? "default" : "secondary"}>{isInterState ? "IGST (Inter-State)" : "CGST + SGST (Intra-State)"}</Badge>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={reverseCharge} onCheckedChange={setReverseCharge} />
                <Label className="text-sm">Reverse Charge</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Invoice Items</span>
              <Button size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>HSN/SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate (₹)</TableHead>
                    <TableHead className="text-right">GST %</TableHead>
                    <TableHead className="text-right">Disc %</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => {
                    const lineTotal = item.qty * item.rate;
                    const discAmt = (lineTotal * item.discount) / 100;
                    const taxable = lineTotal - discAmt;
                    const gst = (taxable * item.gstRate) / 100;
                    return (
                      <TableRow key={item.id}>
                        <TableCell><Input className="min-w-[150px]" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} /></TableCell>
                        <TableCell><Input className="w-20" value={item.hsnCode} onChange={e => updateItem(item.id, "hsnCode", e.target.value)} /></TableCell>
                        <TableCell><Input className="w-16" type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", Number(e.target.value))} /></TableCell>
                        <TableCell><Input className="w-24" type="number" value={item.rate} onChange={e => updateItem(item.id, "rate", Number(e.target.value))} /></TableCell>
                        <TableCell>
                          <Select value={String(item.gstRate)} onValueChange={v => updateItem(item.id, "gstRate", Number(v))}>
                            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>{gstRates.map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}</SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Input className="w-16" type="number" value={item.discount} onChange={e => updateItem(item.id, "discount", Number(e.target.value))} /></TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(taxable + gst)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="mt-6">
          <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
              {totals.totalDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-{formatCurrency(totals.totalDiscount)}</span></div>}
              {isInterState ? (
                <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>{formatCurrency(totals.totalIGST)}</span></div>
              ) : (<>
                <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>{formatCurrency(totals.totalCGST)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>{formatCurrency(totals.totalSGST)}</span></div>
              </>)}
              {reverseCharge && <div className="flex items-center gap-2 text-sm text-amber-500"><AlertTriangle className="h-4 w-4" /> Tax payable under Reverse Charge</div>}
              <Separator />
              <div className="flex justify-between text-lg font-bold"><span>Grand Total</span><span className="text-primary">{formatCurrency(totals.grandTotal)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* HSN Reference */}
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Common HSN/SAC Codes Reference</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(hsnCodes).map(([code, desc]) => (
                <div key={code} className="p-2 rounded border text-sm">
                  <span className="font-mono font-semibold text-primary">{code}</span>
                  <span className="text-muted-foreground ml-2">{desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GSTInvoiceGenerator;
