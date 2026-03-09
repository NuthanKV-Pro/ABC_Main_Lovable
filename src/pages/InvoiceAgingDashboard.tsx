import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Trash2, FileText, AlertTriangle, Clock } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Invoice {
  id: string;
  customer: string;
  invoiceNo: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
}

const InvoiceAgingDashboard = () => {
  const goBack = useGoBack();
  const today = new Date();
  
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: "1", customer: "ABC Corp", invoiceNo: "INV-001", amount: 150000, invoiceDate: "2024-11-01", dueDate: "2024-11-30" },
    { id: "2", customer: "XYZ Ltd", invoiceNo: "INV-002", amount: 280000, invoiceDate: "2024-10-15", dueDate: "2024-11-15" },
    { id: "3", customer: "DEF Inc", invoiceNo: "INV-003", amount: 95000, invoiceDate: "2024-09-20", dueDate: "2024-10-20" },
    { id: "4", customer: "GHI Corp", invoiceNo: "INV-004", amount: 420000, invoiceDate: "2024-08-01", dueDate: "2024-08-31" },
    { id: "5", customer: "JKL Pvt", invoiceNo: "INV-005", amount: 180000, invoiceDate: "2024-12-01", dueDate: "2024-12-31" },
  ]);

  const [newInvoice, setNewInvoice] = useState({ customer: "", invoiceNo: "", amount: "", invoiceDate: "", dueDate: "" });

  const addInvoice = () => {
    if (newInvoice.customer && newInvoice.amount && newInvoice.dueDate) {
      setInvoices([...invoices, {
        id: Date.now().toString(),
        customer: newInvoice.customer,
        invoiceNo: newInvoice.invoiceNo || `INV-${Date.now()}`,
        amount: parseFloat(newInvoice.amount) || 0,
        invoiceDate: newInvoice.invoiceDate || today.toISOString().split('T')[0],
        dueDate: newInvoice.dueDate
      }]);
      setNewInvoice({ customer: "", invoiceNo: "", amount: "", invoiceDate: "", dueDate: "" });
    }
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  const getAgingBucket = (dueDate: string) => {
    const due = new Date(dueDate);
    const diffDays = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Current";
    if (diffDays <= 30) return "1-30 Days";
    if (diffDays <= 60) return "31-60 Days";
    if (diffDays <= 90) return "61-90 Days";
    return "90+ Days";
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case "Current": return "bg-green-500";
      case "1-30 Days": return "bg-blue-500";
      case "31-60 Days": return "bg-amber-500";
      case "61-90 Days": return "bg-orange-500";
      case "90+ Days": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const agingSummary = invoices.reduce((acc, inv) => {
    const bucket = getAgingBucket(inv.dueDate);
    acc[bucket] = (acc[bucket] || 0) + inv.amount;
    return acc;
  }, {} as Record<string, number>);

  const bucketOrder = ["Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days"];
  const chartData = bucketOrder.map(bucket => ({
    bucket,
    amount: agingSummary[bucket] || 0,
    color: getBucketColor(bucket)
  }));

  const totalReceivables = invoices.reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = Object.entries(agingSummary)
    .filter(([key]) => key !== "Current")
    .reduce((sum, [, val]) => sum + val, 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Invoice Aging Dashboard</CardTitle>
              <CardDescription>Track accounts receivable by aging buckets</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Receivables</p>
                <p className="text-xl font-bold text-primary">₹{(totalReceivables / 100000).toFixed(1)}L</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Overdue Amount</p>
                <p className="text-xl font-bold text-red-500">₹{(overdueAmount / 100000).toFixed(1)}L</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Overdue %</p>
                <p className="text-xl font-bold text-amber-500">{totalReceivables > 0 ? ((overdueAmount / totalReceivables) * 100).toFixed(1) : 0}%</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Current (Not Due)</p>
                <p className="text-xl font-bold text-green-500">₹{((agingSummary["Current"] || 0) / 100000).toFixed(1)}L</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Aging Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="bucket" className="text-xs" />
                  <YAxis tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, "Amount"]}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color.replace('bg-', 'var(--')} className={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                {bucketOrder.map(bucket => (
                  <div key={bucket} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getBucketColor(bucket)}`}></div>
                    <span className="text-sm">{bucket}: ₹{((agingSummary[bucket] || 0) / 100000).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <Label>Customer</Label>
                  <Input
                    placeholder="ABC Corp"
                    value={newInvoice.customer}
                    onChange={(e) => setNewInvoice({ ...newInvoice, customer: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Invoice No</Label>
                  <Input
                    placeholder="INV-001"
                    value={newInvoice.invoiceNo}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Invoice Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.invoiceDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, invoiceDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addInvoice} className="w-full">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => {
                const bucket = getAgingBucket(inv.dueDate);
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.customer}</TableCell>
                    <TableCell>{inv.invoiceNo}</TableCell>
                    <TableCell className="text-right font-mono">₹{inv.amount.toLocaleString()}</TableCell>
                    <TableCell>{inv.invoiceDate}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell>
                      <Badge className={`${getBucketColor(bucket)} text-white`}>
                        {bucket === "Current" ? <Clock className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                        {bucket}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteInvoice(inv.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceAgingDashboard;
