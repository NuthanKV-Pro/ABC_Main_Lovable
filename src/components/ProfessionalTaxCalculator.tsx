import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Landmark, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StateLimit {
  state: string;
  maxAnnual: number;
  maxMonthly: number;
  notes?: string;
}

const stateLimits: StateLimit[] = [
  { state: "Andhra Pradesh", maxAnnual: 2500, maxMonthly: 208, notes: "₹150/month for salary ₹15,001-₹20,000; ₹200/month above ₹20,000" },
  { state: "Assam", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Bihar", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Chhattisgarh", maxAnnual: 2500, maxMonthly: 208, notes: "₹150/month for salary ₹15,001-₹20,000; ₹200/month above ₹20,000; ₹250 in Feb" },
  { state: "Goa", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Gujarat", maxAnnual: 2500, maxMonthly: 200 },
  { state: "Jharkhand", maxAnnual: 2500, maxMonthly: 208, notes: "₹100/month for salary ₹25,001-₹41,666; ₹150/month for ₹41,667-₹66,666" },
  { state: "Karnataka", maxAnnual: 2500, maxMonthly: 200, notes: "₹200/month for salary above ₹15,000" },
  { state: "Kerala", maxAnnual: 2500, maxMonthly: 208, notes: "Slab-based: ₹60-₹250/month depending on income" },
  { state: "Madhya Pradesh", maxAnnual: 2500, maxMonthly: 208, notes: "₹150/month for ₹18,751-₹25,000; ₹200/month above ₹25,000; ₹300 in Feb" },
  { state: "Maharashtra", maxAnnual: 2500, maxMonthly: 200, notes: "₹175/month for salary ₹10,001-₹15,000; ₹200/month for ₹15,001+; ₹300 in Feb" },
  { state: "Manipur", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Meghalaya", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Mizoram", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Nagaland", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Odisha", maxAnnual: 2500, maxMonthly: 208, notes: "₹150/month for salary ₹15,001-₹25,000; ₹200/month above ₹25,000" },
  { state: "Puducherry", maxAnnual: 2500, maxMonthly: 208 },
  { state: "Punjab", maxAnnual: 2400, maxMonthly: 200, notes: "₹200/month for salary above ₹25,000" },
  { state: "Sikkim", maxAnnual: 2500, maxMonthly: 208, notes: "₹125/month for salary ₹20,001-₹30,000; ₹150/month for ₹30,001-₹40,000" },
  { state: "Tamil Nadu", maxAnnual: 2500, maxMonthly: 208, notes: "Slab: ₹135-₹208/month based on half-yearly salary" },
  { state: "Telangana", maxAnnual: 2500, maxMonthly: 208, notes: "₹150/month for salary ₹15,001-₹20,000; ₹200/month above ₹20,000" },
  { state: "Tripura", maxAnnual: 2500, maxMonthly: 208, notes: "₹150/month for salary ₹10,001-₹15,000; ₹180/month above ₹15,000" },
  { state: "West Bengal", maxAnnual: 2500, maxMonthly: 200, notes: "₹110/month for salary ₹15,001-₹25,000; ₹130/month for ₹25,001-₹40,000" },
  { state: "Delhi", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in Delhi" },
  { state: "Haryana", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in Haryana" },
  { state: "Himachal Pradesh", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in Himachal Pradesh" },
  { state: "Jammu & Kashmir", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in J&K" },
  { state: "Rajasthan", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in Rajasthan" },
  { state: "Uttarakhand", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in Uttarakhand" },
  { state: "Uttar Pradesh", maxAnnual: 0, maxMonthly: 0, notes: "No Professional Tax in UP" },
];

interface ProfessionalTaxCalculatorProps {
  onSave?: (amount: number) => void;
}

export const ProfessionalTaxCalculator = ({ onSave }: ProfessionalTaxCalculatorProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string>(() => {
    return localStorage.getItem('professional_tax_state') || "";
  });

  const selectedStateData = stateLimits.find(s => s.state === selectedState);
  const applicableTax = selectedStateData?.maxAnnual || 0;

  useEffect(() => {
    if (selectedState) {
      localStorage.setItem('professional_tax_state', selectedState);
      localStorage.setItem('professional_tax_amount', applicableTax.toString());
    }
  }, [selectedState, applicableTax]);

  const handleSave = () => {
    if (!selectedState) {
      toast({
        title: "Select a State",
        description: "Please select your state to calculate Professional Tax.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('professional_tax_state', selectedState);
    localStorage.setItem('professional_tax_amount', applicableTax.toString());
    
    onSave?.(applicableTax);
    
    toast({
      title: "Professional Tax Saved",
      description: `Professional Tax of ₹${applicableTax.toLocaleString('en-IN')} saved for ${selectedState}.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Landmark className="w-4 h-4" />
          Professional Tax
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-primary" />
            Professional Tax Calculator
          </DialogTitle>
          <DialogDescription>
            Section 16(iii) - State-wise Professional Tax deduction limits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="state">Select Your State</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {stateLimits.map((state) => (
                  <SelectItem key={state.state} value={state.state}>
                    {state.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStateData && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Max Annual Limit</p>
                    <p className="text-2xl font-bold text-primary">
                      ₹{selectedStateData.maxAnnual.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Monthly</p>
                    <p className="text-lg font-semibold">
                      ₹{selectedStateData.maxMonthly.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                
                {selectedStateData.notes && (
                  <div className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{selectedStateData.notes}</p>
                  </div>
                )}

                {selectedStateData.maxAnnual === 0 && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                      ✓ No Professional Tax applicable in {selectedStateData.state}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium mb-2">About Professional Tax</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Levied by State Governments on salaried individuals</li>
              <li>• Maximum limit is ₹2,500 per annum (constitutional limit)</li>
              <li>• Deductible under Section 16(iii) of Income Tax Act</li>
              <li>• Collected by employer and deposited to state treasury</li>
            </ul>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Professional Tax Deduction
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
