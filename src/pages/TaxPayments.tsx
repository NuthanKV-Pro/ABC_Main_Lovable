import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, ExternalLink } from "lucide-react";

const TaxPayments = () => {
  const navigate = useNavigate();

  const tdsRates = [
    { particular: "Salary", section: "192", rate: "Slab rates" },
    { particular: "Interest on securities", section: "193", rate: "10%" },
    { particular: "Dividend", section: "194", rate: "10%" },
    { particular: "Interest other than on securities", section: "194A", rate: "10%" },
    { particular: "Winning from lottery/crossword", section: "194B", rate: "30%" },
    { particular: "Contractor/Sub-contractor", section: "194C", rate: "1% / 2%" },
    { particular: "Professional/Technical services", section: "194J", rate: "10%" },
  ];

  const tcsRates = [
    { particular: "Sale of goods > ₹50 Lakhs", section: "206C(1H)", rate: "0.1%" },
    { particular: "Overseas tour package", section: "206C(1G)", rate: "5%" },
    { particular: "Sale of motor vehicle > ₹10 Lakhs", section: "206C(1F)", rate: "1%" },
    { particular: "Remittance under LRS > ₹7 Lakhs", section: "206C(1G)", rate: "5%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Tax Payments</h1>
              <p className="text-sm text-muted-foreground">Advance Tax, TDS & TCS</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="advance">Advance Tax</TabsTrigger>
            <TabsTrigger value="tds">TDS</TabsTrigger>
            <TabsTrigger value="tcs">TCS</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Payment Summary</CardTitle>
                <CardDescription>Overview of all tax payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment Type</TableHead>
                      <TableHead className="text-right">Amount (₹)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Advance Tax Paid</TableCell>
                      <TableCell className="text-right">120,000</TableCell>
                      <TableCell className="text-right text-green-600">Paid</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">TDS Deducted</TableCell>
                      <TableCell className="text-right">52,000</TableCell>
                      <TableCell className="text-right text-green-600">Deducted</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">TCS Collected</TableCell>
                      <TableCell className="text-right">6,000</TableCell>
                      <TableCell className="text-right text-green-600">Collected</TableCell>
                    </TableRow>
                    <TableRow className="bg-primary/5 font-bold">
                      <TableCell>Total Prepaid Taxes</TableCell>
                      <TableCell className="text-right">178,000</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Advance Tax Calculator</CardTitle>
                <CardDescription>Calculate and pay advance tax online</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Use the Income Tax Department's official calculator to compute your advance tax liability.
                </p>
                <Button 
                  className="gap-2"
                  onClick={() => window.open('https://eportal.incometax.gov.in/iec/foservices/#/TaxCalc/calculator', '_blank')}
                >
                  Open Tax Calculator
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Advance Tax Due Dates</h3>
                  <ul className="text-sm space-y-1">
                    <li>• 15th June - 15% of tax liability</li>
                    <li>• 15th September - 45% of tax liability</li>
                    <li>• 15th December - 75% of tax liability</li>
                    <li>• 15th March - 100% of tax liability</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tds" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>TDS Rates & Limits</CardTitle>
                <CardDescription>Tax Deducted at Source</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Particular</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tdsRates.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.particular}</TableCell>
                        <TableCell>{item.section}</TableCell>
                        <TableCell className="text-right">{item.rate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tcs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>TCS Rates & Limits</CardTitle>
                <CardDescription>Tax Collected at Source</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Particular</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tcsRates.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.particular}</TableCell>
                        <TableCell>{item.section}</TableCell>
                        <TableCell className="text-right">{item.rate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TaxPayments;
