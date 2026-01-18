import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileCheck, ExternalLink, Info } from "lucide-react";
import Footer from "@/components/Footer";

interface StateRate {
  name: string;
  male: number;
  female: number;
  joint: number;
  registration: number;
}

const stateRates: StateRate[] = [
  { name: "Maharashtra", male: 6, female: 5, joint: 5.5, registration: 1 },
  { name: "Delhi", male: 6, female: 4, joint: 5, registration: 1 },
  { name: "Karnataka", male: 5.6, female: 5.6, joint: 5.6, registration: 1 },
  { name: "Tamil Nadu", male: 7, female: 7, joint: 7, registration: 1 },
  { name: "Telangana", male: 6, female: 6, joint: 6, registration: 0.5 },
  { name: "Gujarat", male: 4.9, female: 4.9, joint: 4.9, registration: 1 },
  { name: "Rajasthan", male: 6, female: 5, joint: 5.5, registration: 1 },
  { name: "Uttar Pradesh", male: 7, female: 6, joint: 6.5, registration: 1 },
  { name: "West Bengal", male: 6, female: 6, joint: 6, registration: 1 },
  { name: "Madhya Pradesh", male: 7.5, female: 7.5, joint: 7.5, registration: 1 },
  { name: "Kerala", male: 8, female: 8, joint: 8, registration: 2 },
  { name: "Punjab", male: 7, female: 5, joint: 6, registration: 1 },
  { name: "Haryana", male: 7, female: 5, joint: 6, registration: 1 },
  { name: "Andhra Pradesh", male: 5, female: 5, joint: 5, registration: 0.5 },
  { name: "Bihar", male: 6.3, female: 6.3, joint: 6.3, registration: 2 },
];

const StampDutyCalculator = () => {
  const navigate = useNavigate();
  const [propertyValue, setPropertyValue] = useState<number>(5000000);
  const [selectedState, setSelectedState] = useState<string>("Maharashtra");
  const [buyerGender, setBuyerGender] = useState<string>("male");
  const [isFirstProperty, setIsFirstProperty] = useState<boolean>(true);

  const stateData = stateRates.find(s => s.name === selectedState) || stateRates[0];
  
  // Get stamp duty rate based on gender
  const getStampDutyRate = () => {
    switch (buyerGender) {
      case "female": return stateData.female;
      case "joint": return stateData.joint;
      default: return stateData.male;
    }
  };

  const stampDutyRate = getStampDutyRate();
  const stampDuty = (propertyValue * stampDutyRate) / 100;
  const registrationFee = (propertyValue * stateData.registration) / 100;
  const totalCharges = stampDuty + registrationFee;

  // Additional costs estimate
  const legalFees = 15000;
  const brokerageFee = propertyValue * 0.01;
  const grandTotal = totalCharges + legalFees + brokerageFee;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Stamp Duty Calculator</h1>
              <p className="text-sm text-muted-foreground">Property Registration Charges</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                Property Details
              </CardTitle>
              <CardDescription>Enter property and buyer information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propertyValue">Property Value (₹)</Label>
                <Input
                  id="propertyValue"
                  type="number"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  min={100000}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stateRates.map((state) => (
                      <SelectItem key={state.name} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Buyer Category</Label>
                <Select value={buyerGender} onValueChange={setBuyerGender}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male (Single Owner)</SelectItem>
                    <SelectItem value="female">Female (Single Owner)</SelectItem>
                    <SelectItem value="joint">Joint Ownership</SelectItem>
                  </SelectContent>
                </Select>
                {buyerGender === "female" && stateData.female < stateData.male && (
                  <p className="text-xs text-green-600">✓ Women get {stateData.male - stateData.female}% concession in {selectedState}</p>
                )}
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-primary flex items-center gap-2">
                  <Info className="h-4 w-4" /> State Rates for {selectedState}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium">Male</p>
                    <p>{stateData.male}%</p>
                  </div>
                  <div>
                    <p className="font-medium">Female</p>
                    <p>{stateData.female}%</p>
                  </div>
                  <div>
                    <p className="font-medium">Registration</p>
                    <p>{stateData.registration}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Total registration charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-card rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Total Registration Cost</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalCharges)}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-card rounded-lg border">
                  <div>
                    <span className="text-sm">Stamp Duty ({stampDutyRate}%)</span>
                    {buyerGender === "female" && stateData.female < stateData.male && (
                      <span className="ml-2 text-xs text-green-600">Women discount</span>
                    )}
                  </div>
                  <span className="font-semibold">{formatCurrency(stampDuty)}</span>
                </div>
                <div className="flex justify-between p-3 bg-card rounded-lg border">
                  <span className="text-sm">Registration Fee ({stateData.registration}%)</span>
                  <span className="font-semibold">{formatCurrency(registrationFee)}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Other Estimated Costs</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Legal/Documentation Fees</span>
                    <span>{formatCurrency(legalFees)}</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Brokerage (1%)</span>
                    <span>{formatCurrency(brokerageFee)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-card rounded-lg border-2 border-primary/30">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Grand Total (Estimated)</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((grandTotal / propertyValue) * 100).toFixed(1)}% of property value
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Rates may vary based on property type (residential/commercial), 
                  location (urban/rural), and specific municipal regulations. Please verify with local authorities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto mt-6 flex gap-4 justify-center flex-wrap">
          <Button variant="outline" onClick={() => window.open("https://igr.maharashtra.gov.in/", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Maharashtra IGR
          </Button>
          <Button variant="outline" onClick={() => window.open("https://shcilestamp.com/", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> SHCIL eStamp
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StampDutyCalculator;
