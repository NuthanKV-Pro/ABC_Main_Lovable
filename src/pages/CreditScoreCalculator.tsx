import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard, ExternalLink, Info, CheckCircle, XCircle } from "lucide-react";
import Footer from "@/components/Footer";

const CreditScoreCalculator = () => {
  const navigate = useNavigate();
  
  // Payment History (35%)
  const [missedPayments, setMissedPayments] = useState<string>("0");
  
  // Credit Utilization (30%)
  const [creditUtilization, setCreditUtilization] = useState<number>(30);
  
  // Credit History Length (15%)
  const [creditAge, setCreditAge] = useState<string>("5-7");
  
  // Credit Mix (10%)
  const [creditMix, setCreditMix] = useState<string>("good");
  
  // New Credit Inquiries (10%)
  const [hardInquiries, setHardInquiries] = useState<string>("0-2");

  // Calculate score components
  const getPaymentScore = () => {
    switch (missedPayments) {
      case "0": return 35;
      case "1": return 25;
      case "2-3": return 15;
      case "4+": return 5;
      default: return 35;
    }
  };

  const getUtilizationScore = () => {
    if (creditUtilization <= 10) return 30;
    if (creditUtilization <= 30) return 25;
    if (creditUtilization <= 50) return 18;
    if (creditUtilization <= 75) return 10;
    return 5;
  };

  const getAgeScore = () => {
    switch (creditAge) {
      case "7+": return 15;
      case "5-7": return 12;
      case "3-5": return 9;
      case "1-3": return 5;
      case "<1": return 2;
      default: return 10;
    }
  };

  const getMixScore = () => {
    switch (creditMix) {
      case "excellent": return 10;
      case "good": return 8;
      case "fair": return 5;
      case "poor": return 2;
      default: return 5;
    }
  };

  const getInquiryScore = () => {
    switch (hardInquiries) {
      case "0-2": return 10;
      case "3-5": return 7;
      case "6+": return 3;
      default: return 7;
    }
  };

  const paymentScore = getPaymentScore();
  const utilizationScore = getUtilizationScore();
  const ageScore = getAgeScore();
  const mixScore = getMixScore();
  const inquiryScore = getInquiryScore();

  const totalScore = paymentScore + utilizationScore + ageScore + mixScore + inquiryScore;
  
  // Map to CIBIL-like score (300-900)
  const estimatedScore = Math.round(300 + (totalScore / 100) * 600);

  const getScoreCategory = (score: number) => {
    if (score >= 800) return { label: "Excellent", color: "text-green-600", bg: "bg-green-500" };
    if (score >= 750) return { label: "Very Good", color: "text-green-500", bg: "bg-green-400" };
    if (score >= 700) return { label: "Good", color: "text-blue-500", bg: "bg-blue-400" };
    if (score >= 650) return { label: "Fair", color: "text-amber-500", bg: "bg-amber-400" };
    return { label: "Poor", color: "text-red-500", bg: "bg-red-400" };
  };

  const category = getScoreCategory(estimatedScore);

  const scoreFactors = [
    { name: "Payment History", weight: "35%", score: paymentScore, max: 35, tip: "Pay all bills on time" },
    { name: "Credit Utilization", weight: "30%", score: utilizationScore, max: 30, tip: "Keep usage below 30%" },
    { name: "Credit History Length", weight: "15%", score: ageScore, max: 15, tip: "Maintain old accounts" },
    { name: "Credit Mix", weight: "10%", score: mixScore, max: 10, tip: "Have diverse credit types" },
    { name: "New Credit", weight: "10%", score: inquiryScore, max: 10, tip: "Limit hard inquiries" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Credit Score Calculator</h1>
              <p className="text-sm text-muted-foreground">Estimate your CIBIL score range</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Credit Factors
              </CardTitle>
              <CardDescription>Answer based on your credit behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Missed Payments (Last 12 months)</Label>
                <Select value={missedPayments} onValueChange={setMissedPayments}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None - Always on time</SelectItem>
                    <SelectItem value="1">1 missed payment</SelectItem>
                    <SelectItem value="2-3">2-3 missed payments</SelectItem>
                    <SelectItem value="4+">4 or more missed</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Payment history = 35% of score</p>
              </div>

              <div className="space-y-2">
                <Label>Credit Card Utilization (%)</Label>
                <Input
                  type="number"
                  value={creditUtilization}
                  onChange={(e) => setCreditUtilization(Math.min(100, Math.max(0, Number(e.target.value))))}
                  min={0}
                  max={100}
                />
                <p className="text-xs text-muted-foreground">
                  % of credit limit used. Ideal: below 30%. Credit utilization = 30% of score
                </p>
              </div>

              <div className="space-y-2">
                <Label>Credit History Age</Label>
                <Select value={creditAge} onValueChange={setCreditAge}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7+">7+ years</SelectItem>
                    <SelectItem value="5-7">5-7 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="<1">Less than 1 year</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Age of oldest credit account = 15% of score</p>
              </div>

              <div className="space-y-2">
                <Label>Credit Mix</Label>
                <Select value={creditMix} onValueChange={setCreditMix}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (Credit card + Home loan + Auto loan)</SelectItem>
                    <SelectItem value="good">Good (Credit card + 1 secured loan)</SelectItem>
                    <SelectItem value="fair">Fair (Only credit card OR only loan)</SelectItem>
                    <SelectItem value="poor">Poor (No variety)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Variety of credit types = 10% of score</p>
              </div>

              <div className="space-y-2">
                <Label>Hard Inquiries (Last 12 months)</Label>
                <Select value={hardInquiries} onValueChange={setHardInquiries}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-2">0-2 inquiries</SelectItem>
                    <SelectItem value="3-5">3-5 inquiries</SelectItem>
                    <SelectItem value="6+">6 or more inquiries</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">New credit applications = 10% of score</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle>Estimated Credit Score</CardTitle>
                <CardDescription>Based on your inputs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-card rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Your Estimated Score</p>
                  <p className={`text-5xl font-bold ${category.color}`}>{estimatedScore}</p>
                  <p className={`text-lg font-medium mt-1 ${category.color}`}>{category.label}</p>
                  <div className="mt-4 w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${category.bg} transition-all duration-500`}
                      style={{ width: `${((estimatedScore - 300) / 600) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>300</span>
                    <span>500</span>
                    <span>700</span>
                    <span>900</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Score Breakdown</p>
                  {scoreFactors.map((factor) => (
                    <div key={factor.name} className="p-3 bg-card rounded-lg border">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">{factor.name} ({factor.weight})</span>
                        <span className={`text-sm font-medium ${factor.score >= factor.max * 0.7 ? "text-green-600" : factor.score >= factor.max * 0.4 ? "text-amber-600" : "text-red-600"}`}>
                          {factor.score}/{factor.max}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${factor.score >= factor.max * 0.7 ? "bg-green-500" : factor.score >= factor.max * 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${(factor.score / factor.max) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Info className="h-3 w-3" /> {factor.tip}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Score Range Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-600" /> 800-900</span>
                    <span className="text-green-600 font-medium">Excellent - Best rates</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-500/5 rounded">
                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> 750-799</span>
                    <span className="text-green-500 font-medium">Very Good</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded">
                    <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-blue-500" /> 700-749</span>
                    <span className="text-blue-500 font-medium">Good</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-amber-500/10 rounded">
                    <span className="flex items-center gap-2"><XCircle className="h-4 w-4 text-amber-500" /> 650-699</span>
                    <span className="text-amber-500 font-medium">Fair - Higher rates</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                    <span className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /> Below 650</span>
                    <span className="text-red-500 font-medium">Poor - May face rejection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-6 flex gap-4 justify-center flex-wrap">
          <Button variant="outline" onClick={() => window.open("https://www.cibil.com/freecibilscore", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Check Free CIBIL Score
          </Button>
          <Button variant="outline" onClick={() => window.open("https://www.paisabazaar.com/cibil-credit-score/", "_blank")}>
            <ExternalLink className="h-4 w-4 mr-2" /> Paisabazaar CIBIL
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreditScoreCalculator;
