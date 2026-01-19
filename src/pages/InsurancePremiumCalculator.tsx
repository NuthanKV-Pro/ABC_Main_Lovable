import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, Info, CheckCircle, AlertTriangle, Shield, Heart, Cigarette, Wine, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const InsurancePremiumCalculator = () => {
  const navigate = useNavigate();
  
  // Term Life Insurance Inputs
  const [age, setAge] = useState<number>(30);
  const [gender, setGender] = useState<string>("male");
  const [sumAssured, setSumAssured] = useState<number>(10000000); // 1 Crore
  const [policyTerm, setPolicyTerm] = useState<number>(30);
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [isAlcohol, setIsAlcohol] = useState<boolean>(false);
  const [occupation, setOccupation] = useState<string>("desk");
  const [bmi, setBmi] = useState<string>("normal");
  const [existingConditions, setExistingConditions] = useState<boolean>(false);
  
  // Health Insurance Inputs
  const [healthAge, setHealthAge] = useState<number>(30);
  const [familyMembers, setFamilyMembers] = useState<number>(4);
  const [healthSumInsured, setHealthSumInsured] = useState<number>(1000000);
  const [cityTier, setCityTier] = useState<string>("metro");
  const [roomType, setRoomType] = useState<string>("single");
  const [hasMaternity, setHasMaternity] = useState<boolean>(false);
  const [hasCriticalIllness, setHasCriticalIllness] = useState<boolean>(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Term Life Premium Calculation
  const calculateTermLifePremium = () => {
    // Base rate per lakh (varies by age)
    let baseRatePerLakh = 0;
    if (age < 25) baseRatePerLakh = 5;
    else if (age < 30) baseRatePerLakh = 6;
    else if (age < 35) baseRatePerLakh = 8;
    else if (age < 40) baseRatePerLakh = 12;
    else if (age < 45) baseRatePerLakh = 18;
    else if (age < 50) baseRatePerLakh = 28;
    else if (age < 55) baseRatePerLakh = 45;
    else baseRatePerLakh = 70;

    let premium = (sumAssured / 100000) * baseRatePerLakh;

    // Gender factor
    if (gender === "female") premium *= 0.85;

    // Smoker factor
    if (isSmoker) premium *= 1.5;

    // Alcohol factor
    if (isAlcohol) premium *= 1.15;

    // Occupation factor
    if (occupation === "hazardous") premium *= 1.4;
    else if (occupation === "field") premium *= 1.15;

    // BMI factor
    if (bmi === "overweight") premium *= 1.15;
    else if (bmi === "obese") premium *= 1.35;
    else if (bmi === "underweight") premium *= 1.1;

    // Existing conditions
    if (existingConditions) premium *= 1.25;

    // Policy term factor (longer term = slightly higher)
    premium *= (1 + (policyTerm - 10) * 0.01);

    return Math.round(premium);
  };

  // Health Insurance Premium Calculation
  const calculateHealthPremium = () => {
    // Base rate based on sum insured
    let baseRate = healthSumInsured * 0.012; // 1.2% base

    // Age loading
    if (healthAge >= 45) baseRate *= 1.4;
    else if (healthAge >= 35) baseRate *= 1.2;

    // Family size factor
    baseRate *= (1 + (familyMembers - 1) * 0.25);

    // City tier
    if (cityTier === "metro") baseRate *= 1.15;
    else if (cityTier === "tier1") baseRate *= 1.05;

    // Room type
    if (roomType === "single") baseRate *= 1.1;
    else if (roomType === "deluxe") baseRate *= 1.25;

    // Add-ons
    if (hasMaternity) baseRate += 8000;
    if (hasCriticalIllness) baseRate += healthSumInsured * 0.005;

    return Math.round(baseRate);
  };

  const termLifePremium = calculateTermLifePremium();
  const healthPremium = calculateHealthPremium();

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Insurance Premium Calculator</h1>
              <p className="text-sm text-muted-foreground">Estimate term life & health insurance premiums</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Tabs defaultValue="term-life" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="term-life" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Term Life Insurance
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> Health Insurance
              </TabsTrigger>
            </TabsList>

            {/* Term Life Insurance Tab */}
            <TabsContent value="term-life" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Personal Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Age</Label>
                          <span className="text-sm font-medium">{age} years</span>
                        </div>
                        <Slider
                          value={[age]}
                          onValueChange={(v) => setAge(v[0])}
                          min={18}
                          max={65}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Sum Assured</Label>
                        <span className="text-sm font-medium">{formatCurrency(sumAssured)}</span>
                      </div>
                      <Slider
                        value={[sumAssured]}
                        onValueChange={(v) => setSumAssured(v[0])}
                        min={2500000}
                        max={100000000}
                        step={2500000}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₹25L</span>
                        <span>₹10Cr</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Policy Term</Label>
                        <span className="text-sm font-medium">{policyTerm} years</span>
                      </div>
                      <Slider
                        value={[policyTerm]}
                        onValueChange={(v) => setPolicyTerm(v[0])}
                        min={10}
                        max={40}
                        step={5}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Occupation Type</Label>
                      <Select value={occupation} onValueChange={setOccupation}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desk">Desk Job / Office Work</SelectItem>
                          <SelectItem value="field">Field Work / Moderate Risk</SelectItem>
                          <SelectItem value="hazardous">Hazardous / High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Lifestyle & Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>BMI Category</Label>
                      <Select value={bmi} onValueChange={setBmi}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="underweight">Underweight (&lt;18.5)</SelectItem>
                          <SelectItem value="normal">Normal (18.5-25)</SelectItem>
                          <SelectItem value="overweight">Overweight (25-30)</SelectItem>
                          <SelectItem value="obese">Obese (&gt;30)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Cigarette className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">Tobacco/Smoking</p>
                          <p className="text-xs text-muted-foreground">+50% premium loading</p>
                        </div>
                      </div>
                      <Switch checked={isSmoker} onCheckedChange={setIsSmoker} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Wine className="h-5 w-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Regular Alcohol</p>
                          <p className="text-xs text-muted-foreground">+15% premium loading</p>
                        </div>
                      </div>
                      <Switch checked={isAlcohol} onCheckedChange={setIsAlcohol} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="font-medium">Pre-existing Conditions</p>
                          <p className="text-xs text-muted-foreground">Diabetes, BP, Heart conditions</p>
                        </div>
                      </div>
                      <Switch checked={existingConditions} onCheckedChange={setExistingConditions} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Term Life Premium Result */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
                <CardHeader>
                  <CardTitle>Estimated Term Life Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground">Annual Premium</p>
                      <p className="text-3xl font-bold text-primary">{formatCurrency(termLifePremium)}</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Premium</p>
                      <p className="text-3xl font-bold">{formatCurrency(Math.round(termLifePremium / 12))}</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground">Premium per Lakh SA</p>
                      <p className="text-3xl font-bold text-amber-500">{formatCurrency(Math.round(termLifePremium / (sumAssured / 100000)))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Term Life Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Term Life Insurance Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-500">✅ Do This</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Buy early - premiums are lowest in 20s-30s</li>
                        <li>• Cover = 10-15x annual income</li>
                        <li>• Term till retirement (60-65 years)</li>
                        <li>• Compare multiple insurers</li>
                        <li>• Check claim settlement ratio (&gt;95%)</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-500">❌ Avoid This</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Don't hide pre-existing conditions</li>
                        <li>• Avoid riders you don't need</li>
                        <li>• Don't buy return of premium plans</li>
                        <li>• Avoid ULIPs marketed as insurance</li>
                        <li>• Don't delay buying due to cost</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Insurance Tab */}
            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Coverage Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Eldest Member Age</Label>
                          <span className="text-sm font-medium">{healthAge} years</span>
                        </div>
                        <Slider
                          value={[healthAge]}
                          onValueChange={(v) => setHealthAge(v[0])}
                          min={18}
                          max={70}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Family Members</Label>
                          <span className="text-sm font-medium">{familyMembers}</span>
                        </div>
                        <Slider
                          value={[familyMembers]}
                          onValueChange={(v) => setFamilyMembers(v[0])}
                          min={1}
                          max={6}
                          step={1}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Sum Insured</Label>
                        <span className="text-sm font-medium">{formatCurrency(healthSumInsured)}</span>
                      </div>
                      <Slider
                        value={[healthSumInsured]}
                        onValueChange={(v) => setHealthSumInsured(v[0])}
                        min={300000}
                        max={10000000}
                        step={100000}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₹3L</span>
                        <span>₹1Cr</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>City Tier</Label>
                        <Select value={cityTier} onValueChange={setCityTier}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="metro">Metro (Mumbai, Delhi, etc.)</SelectItem>
                            <SelectItem value="tier1">Tier 1 City</SelectItem>
                            <SelectItem value="tier2">Tier 2/3 City</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Room Type</Label>
                        <Select value={roomType} onValueChange={setRoomType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="shared">Shared Room</SelectItem>
                            <SelectItem value="single">Single Private Room</SelectItem>
                            <SelectItem value="deluxe">Deluxe / Suite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      Add-on Covers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Maternity Cover</p>
                        <p className="text-xs text-muted-foreground">Normal & C-Section delivery + newborn cover</p>
                      </div>
                      <Switch checked={hasMaternity} onCheckedChange={setHasMaternity} />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">Critical Illness Cover</p>
                        <p className="text-xs text-muted-foreground">Lump sum payout for major illnesses</p>
                      </div>
                      <Switch checked={hasCriticalIllness} onCheckedChange={setHasCriticalIllness} />
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <h4 className="font-semibold text-amber-600 mb-2">Recommended Coverage</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Metro cities: Minimum ₹10-15 Lakhs</li>
                        <li>• Family floater for 4 members</li>
                        <li>• No room rent capping preferred</li>
                        <li>• Top-up plan for additional coverage</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Premium Result */}
              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
                <CardHeader>
                  <CardTitle>Estimated Health Insurance Premium</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground">Annual Premium</p>
                      <p className="text-3xl font-bold text-green-500">{formatCurrency(healthPremium)}</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Cost</p>
                      <p className="text-3xl font-bold">{formatCurrency(Math.round(healthPremium / 12))}</p>
                    </div>
                    <div className="text-center p-4 bg-card rounded-lg">
                      <p className="text-sm text-muted-foreground">Per Person (Approx)</p>
                      <p className="text-3xl font-bold text-amber-500">{formatCurrency(Math.round(healthPremium / familyMembers))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

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
                This calculator provides estimated premiums for educational purposes only. Actual premiums vary significantly 
                based on the insurer, underwriting criteria, medical history, and specific policy terms.
              </p>
              <p>
                The calculations are based on general industry averages and do not represent quotes from any specific insurance company.
                Please contact insurance providers directly or consult an insurance advisor for accurate quotes.
              </p>
              <p>
                Insurance is subject to policy terms and conditions. Please read the policy documents carefully before purchasing.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InsurancePremiumCalculator;

