import { useState, useEffect } from "react";
import { Calculator, Home, Building2, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HRACalculatorProps {
  basicSalary?: number;
  hraReceived?: number;
}

export const HRACalculator = ({ basicSalary = 0, hraReceived = 0 }: HRACalculatorProps) => {
  const [basic, setBasic] = useState(basicSalary);
  const [hra, setHra] = useState(hraReceived);
  const [rentPaid, setRentPaid] = useState(0);
  const [isMetro, setIsMetro] = useState(true);
  const [exemption, setExemption] = useState(0);
  const [breakdown, setBreakdown] = useState({
    actualHRA: 0,
    rentMinus10: 0,
    percentOfBasic: 0,
  });

  // Load Form 16 data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("form16Data");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.basicSalary) setBasic(parsed.basicSalary);
        if (parsed.hraReceived) setHra(parsed.hraReceived);
      } catch (e) {
        console.error("Error parsing Form 16 data:", e);
      }
    }
  }, []);

  // Update from props
  useEffect(() => {
    if (basicSalary > 0) setBasic(basicSalary);
    if (hraReceived > 0) setHra(hraReceived);
  }, [basicSalary, hraReceived]);

  // Calculate HRA exemption
  useEffect(() => {
    const annualBasic = basic;
    const annualHRA = hra;
    const annualRent = rentPaid * 12;

    // Three conditions for HRA exemption (Section 10(13A))
    const actualHRA = annualHRA;
    const rentMinus10 = Math.max(0, annualRent - 0.1 * annualBasic);
    const percentOfBasic = isMetro ? 0.5 * annualBasic : 0.4 * annualBasic;

    const minExemption = Math.min(actualHRA, rentMinus10, percentOfBasic);
    
    setBreakdown({
      actualHRA,
      rentMinus10,
      percentOfBasic,
    });
    setExemption(Math.max(0, minExemption));
  }, [basic, hra, rentPaid, isMetro]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMinCondition = () => {
    const values = [
      { name: "Actual HRA Received", value: breakdown.actualHRA },
      { name: "Rent - 10% of Basic", value: breakdown.rentMinus10 },
      { name: isMetro ? "50% of Basic (Metro)" : "40% of Basic (Non-Metro)", value: breakdown.percentOfBasic },
    ];
    return values.reduce((min, curr) => (curr.value < min.value ? curr : min));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calculator className="h-4 w-4" />
          HRA Calculator
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            HRA Exemption Calculator
          </DialogTitle>
          <DialogDescription>
            Calculate your HRA exemption under Section 10(13A) of Income Tax Act
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Salary */}
          <div className="space-y-2">
            <Label htmlFor="basic" className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Annual Basic Salary
            </Label>
            <Input
              id="basic"
              type="number"
              value={basic || ""}
              onChange={(e) => setBasic(Number(e.target.value))}
              placeholder="Enter annual basic salary"
            />
          </div>

          {/* HRA Received */}
          <div className="space-y-2">
            <Label htmlFor="hra">Annual HRA Received</Label>
            <Input
              id="hra"
              type="number"
              value={hra || ""}
              onChange={(e) => setHra(Number(e.target.value))}
              placeholder="Enter annual HRA received"
            />
          </div>

          {/* Monthly Rent */}
          <div className="space-y-2">
            <Label htmlFor="rent">Monthly Rent Paid</Label>
            <Input
              id="rent"
              type="number"
              value={rentPaid || ""}
              onChange={(e) => setRentPaid(Number(e.target.value))}
              placeholder="Enter monthly rent paid"
            />
          </div>

          {/* Metro/Non-Metro */}
          <div className="space-y-2">
            <Label>City Type</Label>
            <RadioGroup
              value={isMetro ? "metro" : "non-metro"}
              onValueChange={(v) => setIsMetro(v === "metro")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="metro" id="metro" />
                <Label htmlFor="metro" className="flex items-center gap-1 cursor-pointer">
                  <Building2 className="h-4 w-4" />
                  Metro (50%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-metro" id="non-metro" />
                <Label htmlFor="non-metro" className="flex items-center gap-1 cursor-pointer">
                  <Home className="h-4 w-4" />
                  Non-Metro (40%)
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              Metro cities: Delhi, Mumbai, Kolkata, Chennai
            </p>
          </div>

          <Separator />

          {/* Calculation Breakdown */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Calculation Breakdown</Label>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">1. Actual HRA Received</span>
                <span className="font-medium">{formatCurrency(breakdown.actualHRA)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">2. Rent Paid - 10% of Basic</span>
                <span className="font-medium">{formatCurrency(breakdown.rentMinus10)}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">
                  3. {isMetro ? "50%" : "40%"} of Basic Salary
                </span>
                <span className="font-medium">{formatCurrency(breakdown.percentOfBasic)}</span>
              </div>
            </div>
          </div>

          {/* Result */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">HRA Exemption (Minimum of above)</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(exemption)}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getMinCondition().name}
                </Badge>
              </div>
              {hra > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxable HRA</span>
                    <span className="font-medium text-destructive">
                      {formatCurrency(hra - exemption)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            As per Section 10(13A) read with Rule 2A of Income Tax Rules
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
