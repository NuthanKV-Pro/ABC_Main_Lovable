import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calculator, Home, Car, Gift, Utensils, Lightbulb, GraduationCap, Wallet, Info, Building2 } from "lucide-react";

interface PerquisiteResult {
  name: string;
  taxableValue: number;
  exemptValue: number;
  details: string;
}

interface PerquisitesCalculatorProps {
  basicSalary: number;
  da: number;
  isMetro: boolean;
  isGovtEmployee: boolean;
  onPerquisiteValueChange?: (totalValue: number) => void;
}

const PerquisitesCalculator = ({ 
  basicSalary, 
  da, 
  isMetro, 
  isGovtEmployee,
  onPerquisiteValueChange 
}: PerquisitesCalculatorProps) => {
  // Accommodation states
  const [accomType, setAccomType] = useState<"owned" | "leased" | "none">("none");
  const [accomFurnished, setAccomFurnished] = useState(false);
  const [accomRentPaidByEmployer, setAccomRentPaidByEmployer] = useState(0);
  const [furnitureCost, setFurnitureCost] = useState(0);
  const [recoveryFromEmployee, setRecoveryFromEmployee] = useState(0);
  
  // Motor car states
  const [hasMotorCar, setHasMotorCar] = useState(false);
  const [carCubicCapacity, setCarCubicCapacity] = useState<"small" | "large">("small");
  const [carOwnedBy, setCarOwnedBy] = useState<"employer" | "employee">("employer");
  const [carUsage, setCarUsage] = useState<"official" | "personal" | "both">("both");
  const [driverProvided, setDriverProvided] = useState(false);
  
  // Loan states
  const [hasLoan, setHasLoan] = useState(false);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRateCharged, setInterestRateCharged] = useState(0);
  const [sbiRate, setSbiRate] = useState(8.5); // SBI rate for similar loans
  
  // Free food states
  const [hasFreeFood, setHasFreeFood] = useState(false);
  const [mealsPerDay, setMealsPerDay] = useState(2);
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(22);
  const [mealCostPerMeal, setMealCostPerMeal] = useState(150);
  
  // Gift/voucher states
  const [giftValue, setGiftValue] = useState(0);
  
  // Education facility states
  const [hasEducationFacility, setHasEducationFacility] = useState(false);
  const [educationCostPerChild, setEducationCostPerChild] = useState(0);
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  
  // Domestic servants
  const [hasDomesticServants, setHasDomesticServants] = useState(false);
  const [servantsCost, setServantsCost] = useState(0);
  
  // Utilities
  const [hasUtilities, setHasUtilities] = useState(false);
  const [utilitiesCost, setUtilitiesCost] = useState(0);

  // Moveable assets
  const [hasMoveableAssets, setHasMoveableAssets] = useState(false);
  const [assetCost, setAssetCost] = useState(0);
  const [assetRecovery, setAssetRecovery] = useState(0);

  const salary = basicSalary + da;

  const perquisiteResults = useMemo(() => {
    const results: PerquisiteResult[] = [];

    // 1. Accommodation Perquisite
    if (accomType !== "none" && salary > 0) {
      let accomValue = 0;
      let details = "";

      if (isGovtEmployee) {
        // For govt employees, license fee is the value
        accomValue = Math.round(salary * 0.15); // Simplified - actual is license fee
        details = "Government accommodation valued at license fee (estimated 15% of salary)";
      } else if (accomType === "owned") {
        // Owned by employer
        const rate = isMetro ? 0.15 : 0.10;
        accomValue = Math.round(salary * rate);
        details = `${isMetro ? '15%' : '10%'} of Basic+DA (${isMetro ? 'Metro' : 'Non-Metro'} city)`;
      } else if (accomType === "leased") {
        // Leased by employer
        const rateBasedValue = Math.round(salary * (isMetro ? 0.15 : 0.10));
        accomValue = Math.min(accomRentPaidByEmployer, rateBasedValue);
        details = `Lower of actual rent (₹${accomRentPaidByEmployer.toLocaleString()}) or ${isMetro ? '15%' : '10%'} of salary`;
      }

      // Add furniture value if furnished
      if (accomFurnished && furnitureCost > 0) {
        const furniturePerquisite = Math.round(furnitureCost * 0.10);
        accomValue += furniturePerquisite;
        details += `. Furniture: 10% of ₹${furnitureCost.toLocaleString()} = ₹${furniturePerquisite.toLocaleString()}`;
      }

      // Deduct recovery
      accomValue = Math.max(0, accomValue - recoveryFromEmployee);
      if (recoveryFromEmployee > 0) {
        details += `. Less recovery: ₹${recoveryFromEmployee.toLocaleString()}`;
      }

      results.push({
        name: "Rent-Free/Concessional Accommodation",
        taxableValue: accomValue,
        exemptValue: 0,
        details
      });
    }

    // 2. Motor Car Perquisite
    if (hasMotorCar) {
      let carValue = 0;
      let details = "";

      if (carOwnedBy === "employer") {
        if (carUsage === "official") {
          carValue = 0;
          details = "Fully official use - No perquisite";
        } else if (carUsage === "personal") {
          // Actual running cost by employer
          carValue = carCubicCapacity === "small" ? 2400 * 12 : 3200 * 12;
          details = `Personal use of employer's car: ₹${carCubicCapacity === "small" ? '2,400' : '3,200'}/month`;
        } else {
          // Mixed use
          carValue = carCubicCapacity === "small" ? 1800 * 12 : 2400 * 12;
          details = `Mixed use (employer's car): ₹${carCubicCapacity === "small" ? '1,800' : '2,400'}/month`;
        }
      } else {
        // Employee owns car, employer pays expenses
        if (carUsage !== "official") {
          carValue = carCubicCapacity === "small" ? 900 * 12 : 1200 * 12;
          details = `Employee's car, expenses by employer: ₹${carCubicCapacity === "small" ? '900' : '1,200'}/month`;
        }
      }

      // Add driver perquisite
      if (driverProvided && carUsage !== "official") {
        carValue += 900 * 12;
        details += ". Driver: ₹900/month";
      }

      results.push({
        name: "Motor Car Perquisite",
        taxableValue: carValue,
        exemptValue: 0,
        details
      });
    }

    // 3. Interest-Free/Concessional Loan
    if (hasLoan && loanAmount > 20000) {
      const interestDiff = (sbiRate - interestRateCharged) / 100;
      const taxableInterest = Math.round(loanAmount * interestDiff);
      results.push({
        name: "Interest-Free/Concessional Loan",
        taxableValue: Math.max(0, taxableInterest),
        exemptValue: 0,
        details: `Loan: ₹${loanAmount.toLocaleString()}, SBI rate: ${sbiRate}%, Charged: ${interestRateCharged}%`
      });
    }

    // 4. Free Food & Beverages
    if (hasFreeFood) {
      const totalMeals = mealsPerDay * workingDaysPerMonth * 12;
      const totalCost = totalMeals * mealCostPerMeal;
      const exemptMeals = mealsPerDay * workingDaysPerMonth * 12;
      const exemptAmount = Math.min(exemptMeals * 50, totalCost); // ₹50 per meal exempt
      const taxableValue = Math.max(0, totalCost - exemptAmount);
      
      results.push({
        name: "Free Food & Beverages",
        taxableValue,
        exemptValue: exemptAmount,
        details: `${totalMeals} meals/year @ ₹${mealCostPerMeal}/meal. Exemption: ₹50/meal`
      });
    }

    // 5. Gifts/Vouchers
    if (giftValue > 0) {
      const exemptLimit = 5000;
      const taxableValue = Math.max(0, giftValue - exemptLimit);
      results.push({
        name: "Gifts & Vouchers",
        taxableValue,
        exemptValue: Math.min(giftValue, exemptLimit),
        details: `Total gifts: ₹${giftValue.toLocaleString()}. Exempt up to ₹5,000/year`
      });
    }

    // 6. Education Facility
    if (hasEducationFacility && educationCostPerChild > 0) {
      const monthlyExempt = 1000; // ₹1,000/month per child exempt
      const annualExempt = monthlyExempt * 12 * numberOfChildren;
      const totalCost = educationCostPerChild * 12 * numberOfChildren;
      const taxableValue = Math.max(0, totalCost - annualExempt);
      
      results.push({
        name: "Free/Concessional Education",
        taxableValue,
        exemptValue: Math.min(totalCost, annualExempt),
        details: `${numberOfChildren} child(ren) @ ₹${educationCostPerChild}/month. Exempt: ₹1,000/month/child`
      });
    }

    // 7. Domestic Servants
    if (hasDomesticServants && servantsCost > 0) {
      results.push({
        name: "Domestic Servants (Sweeper/Gardener/Watchman)",
        taxableValue: servantsCost * 12,
        exemptValue: 0,
        details: `Actual cost to employer: ₹${servantsCost.toLocaleString()}/month`
      });
    }

    // 8. Utilities
    if (hasUtilities && utilitiesCost > 0) {
      results.push({
        name: "Gas/Electricity/Water for Household",
        taxableValue: utilitiesCost * 12,
        exemptValue: 0,
        details: `Amount paid by employer: ₹${utilitiesCost.toLocaleString()}/month`
      });
    }

    // 9. Moveable Assets
    if (hasMoveableAssets && assetCost > 0) {
      const perquisiteValue = Math.round(assetCost * 0.10) - assetRecovery;
      results.push({
        name: "Use of Moveable Assets",
        taxableValue: Math.max(0, perquisiteValue * 12),
        exemptValue: 0,
        details: `10% of asset cost (₹${assetCost.toLocaleString()}) minus recovery`
      });
    }

    return results;
  }, [
    accomType, accomFurnished, accomRentPaidByEmployer, furnitureCost, recoveryFromEmployee,
    hasMotorCar, carCubicCapacity, carOwnedBy, carUsage, driverProvided,
    hasLoan, loanAmount, interestRateCharged, sbiRate,
    hasFreeFood, mealsPerDay, workingDaysPerMonth, mealCostPerMeal,
    giftValue, hasEducationFacility, educationCostPerChild, numberOfChildren,
    hasDomesticServants, servantsCost, hasUtilities, utilitiesCost,
    hasMoveableAssets, assetCost, assetRecovery,
    salary, isMetro, isGovtEmployee
  ]);

  const totalTaxablePerquisites = useMemo(() => {
    const total = perquisiteResults.reduce((sum, p) => sum + p.taxableValue, 0);
    onPerquisiteValueChange?.(total);
    return total;
  }, [perquisiteResults, onPerquisiteValueChange]);

  const totalExemptPerquisites = useMemo(() => {
    return perquisiteResults.reduce((sum, p) => sum + p.exemptValue, 0);
  }, [perquisiteResults]);

  const formatCurrency = (value: number): string => {
    if (value === 0) return "₹0";
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <Card className="border-2 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <Calculator className="w-5 h-5" />
          Perquisites Value Calculator
        </CardTitle>
        <CardDescription>
          Select your perquisites and enter details - the app will calculate taxable value as per Income Tax Rules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800 flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-purple-700 dark:text-purple-300">
            <strong>Note:</strong> Perquisite valuation is based on Rules 3 & 3A of Income Tax Rules, 1962. 
            Select only the perquisites you receive from your employer.
          </p>
        </div>

        <Accordion type="multiple" className="space-y-2">
          {/* Accommodation */}
          <AccordionItem value="accommodation" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-purple-600" />
                <span>Rent-Free/Concessional Accommodation</span>
                <Badge variant="outline" className="ml-2">Rule 3(1)</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Accommodation Type</Label>
                  <Select value={accomType} onValueChange={(v) => setAccomType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border z-50">
                      <SelectItem value="none">Not Provided</SelectItem>
                      <SelectItem value="owned">Owned by Employer</SelectItem>
                      <SelectItem value="leased">Leased/Rented by Employer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {accomType === "leased" && (
                  <div className="space-y-2">
                    <Label>Rent Paid by Employer (Annual)</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={accomRentPaidByEmployer || ''}
                      onChange={(e) => setAccomRentPaidByEmployer(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>

              {accomType !== "none" && (
                <>
                  <div className="flex items-center gap-3">
                    <Switch checked={accomFurnished} onCheckedChange={setAccomFurnished} />
                    <Label>Furnished Accommodation</Label>
                  </div>

                  {accomFurnished && (
                    <div className="space-y-2">
                      <Label>Cost of Furniture/Appliances</Label>
                      <Input
                        type="number"
                        placeholder="₹"
                        value={furnitureCost || ''}
                        onChange={(e) => setFurnitureCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Amount Recovered from Employee (Annual)</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={recoveryFromEmployee || ''}
                      onChange={(e) => setRecoveryFromEmployee(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Motor Car */}
          <AccordionItem value="motorcar" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-purple-600" />
                <span>Motor Car Provided by Employer</span>
                <Badge variant="outline" className="ml-2">Rule 3(2)</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={hasMotorCar} onCheckedChange={setHasMotorCar} />
                <Label>Motor Car Provided</Label>
              </div>

              {hasMotorCar && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Car Owned By</Label>
                    <Select value={carOwnedBy} onValueChange={(v) => setCarOwnedBy(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="employer">Employer</SelectItem>
                        <SelectItem value="employee">Employee (Expenses by Employer)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cubic Capacity</Label>
                    <Select value={carCubicCapacity} onValueChange={(v) => setCarCubicCapacity(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="small">Up to 1.6L (Small)</SelectItem>
                        <SelectItem value="large">Above 1.6L (Large)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Usage</Label>
                    <Select value={carUsage} onValueChange={(v) => setCarUsage(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border z-50">
                        <SelectItem value="official">Fully Official</SelectItem>
                        <SelectItem value="personal">Fully Personal</SelectItem>
                        <SelectItem value="both">Mixed (Official + Personal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <Switch checked={driverProvided} onCheckedChange={setDriverProvided} />
                    <Label>Driver Also Provided</Label>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Interest-Free Loan */}
          <AccordionItem value="loan" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-purple-600" />
                <span>Interest-Free/Concessional Loan</span>
                <Badge variant="outline" className="ml-2">Rule 3(7)(i)</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={hasLoan} onCheckedChange={setHasLoan} />
                <Label>Loan Received from Employer (&gt;₹20,000)</Label>
              </div>

              {hasLoan && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Outstanding Loan Amount</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={loanAmount || ''}
                      onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Interest Rate Charged (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="%"
                      value={interestRateCharged || ''}
                      onChange={(e) => setInterestRateCharged(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SBI Rate for Similar Loan (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={sbiRate}
                      onChange={(e) => setSbiRate(parseFloat(e.target.value) || 8.5)}
                    />
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Free Food */}
          <AccordionItem value="food" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Utensils className="w-4 h-4 text-purple-600" />
                <span>Free Food & Beverages</span>
                <Badge variant="outline" className="ml-2">Rule 3(7)(iii)</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={hasFreeFood} onCheckedChange={setHasFreeFood} />
                <Label>Free Meals Provided at Workplace</Label>
              </div>

              {hasFreeFood && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Meals per Day</Label>
                    <Input
                      type="number"
                      value={mealsPerDay}
                      onChange={(e) => setMealsPerDay(parseFloat(e.target.value) || 2)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Working Days per Month</Label>
                    <Input
                      type="number"
                      value={workingDaysPerMonth}
                      onChange={(e) => setWorkingDaysPerMonth(parseFloat(e.target.value) || 22)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Cost per Meal (₹)</Label>
                    <Input
                      type="number"
                      value={mealCostPerMeal}
                      onChange={(e) => setMealCostPerMeal(parseFloat(e.target.value) || 150)}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3 inline mr-1" />
                Free food up to ₹50/meal during office hours is exempt
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Gifts */}
          <AccordionItem value="gifts" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Gift className="w-4 h-4 text-purple-600" />
                <span>Gifts & Vouchers</span>
                <Badge variant="outline" className="ml-2">Rule 3(7)(iv)</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Total Value of Gifts/Vouchers Received (Annual)</Label>
                <Input
                  type="number"
                  placeholder="₹"
                  value={giftValue || ''}
                  onChange={(e) => setGiftValue(parseFloat(e.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3 inline mr-1" />
                Gifts up to ₹5,000 in aggregate per year are exempt
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Education */}
          <AccordionItem value="education" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Free/Concessional Education</span>
                <Badge variant="outline" className="ml-2">Rule 3(5)</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={hasEducationFacility} onCheckedChange={setHasEducationFacility} />
                <Label>Education Facility for Children</Label>
              </div>

              {hasEducationFacility && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Education Cost per Child</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={educationCostPerChild || ''}
                      onChange={(e) => setEducationCostPerChild(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Number of Children</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={numberOfChildren}
                      onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3 inline mr-1" />
                No perquisite if value ≤ ₹1,000/month per child
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Domestic Servants & Utilities */}
          <AccordionItem value="others" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Other Perquisites (Servants, Utilities, Assets)</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              {/* Domestic Servants */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={hasDomesticServants} onCheckedChange={setHasDomesticServants} />
                  <Label>Domestic Servants (Sweeper/Gardener/Watchman)</Label>
                </div>
                {hasDomesticServants && (
                  <div className="space-y-2">
                    <Label>Monthly Cost Paid by Employer</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={servantsCost || ''}
                      onChange={(e) => setServantsCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>

              {/* Utilities */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={hasUtilities} onCheckedChange={setHasUtilities} />
                  <Label>Gas/Electricity/Water for Household</Label>
                </div>
                {hasUtilities && (
                  <div className="space-y-2">
                    <Label>Monthly Cost Paid by Employer</Label>
                    <Input
                      type="number"
                      placeholder="₹"
                      value={utilitiesCost || ''}
                      onChange={(e) => setUtilitiesCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>

              {/* Moveable Assets */}
              <div className="space-y-3 p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch checked={hasMoveableAssets} onCheckedChange={setHasMoveableAssets} />
                  <Label>Use of Moveable Assets (Laptop, Furniture, etc.)</Label>
                </div>
                {hasMoveableAssets && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cost of Asset</Label>
                      <Input
                        type="number"
                        placeholder="₹"
                        value={assetCost || ''}
                        onChange={(e) => setAssetCost(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Recovery from You</Label>
                      <Input
                        type="number"
                        placeholder="₹"
                        value={assetRecovery || ''}
                        onChange={(e) => setAssetRecovery(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Results Summary */}
        {perquisiteResults.length > 0 && (
          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-3">
              Perquisite Valuation Summary
            </h4>
            <div className="space-y-2">
              {perquisiteResults.map((result, index) => (
                <div key={index} className="flex justify-between items-start py-2 border-b border-purple-200 dark:border-purple-800 last:border-0">
                  <div className="flex-1">
                    <span className="font-medium">{result.name}</span>
                    <p className="text-xs text-muted-foreground">{result.details}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-700 dark:text-purple-400">
                      {formatCurrency(result.taxableValue)}
                    </div>
                    {result.exemptValue > 0 && (
                      <div className="text-xs text-green-600">
                        Exempt: {formatCurrency(result.exemptValue)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-purple-300 dark:border-purple-700 flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">Total Taxable Perquisites</span>
                {totalExemptPerquisites > 0 && (
                  <div className="text-sm text-green-600">
                    Total Exempt: {formatCurrency(totalExemptPerquisites)}
                  </div>
                )}
              </div>
              <span className="font-bold text-2xl text-purple-700 dark:text-purple-400">
                {formatCurrency(totalTaxablePerquisites)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerquisitesCalculator;
