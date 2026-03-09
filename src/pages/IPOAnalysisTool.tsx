import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Percent, Calculator, Users } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

const IPOAnalysisTool = () => {
  const goBack = useGoBack();
  const [issuePrice, setIssuePrice] = useState("");
  const [gmp, setGmp] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [totalApplications, setTotalApplications] = useState("");
  const [lotsAvailable, setLotsAvailable] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");

  const price = parseFloat(issuePrice) || 0;
  const greyMarketPremium = parseFloat(gmp) || 0;
  const lot = parseInt(lotSize) || 0;
  const apps = parseInt(totalApplications) || 0;
  const availableLots = parseInt(lotsAvailable) || 0;
  const investment = parseFloat(investmentAmount) || 0;

  const expectedListingPrice = price + greyMarketPremium;
  const listingGainPercent = price > 0 ? ((greyMarketPremium / price) * 100) : 0;
  const lotValue = price * lot;
  const expectedGainPerLot = greyMarketPremium * lot;

  // Allotment probability
  const subscriptionTimes = availableLots > 0 ? apps / availableLots : 0;
  const allotmentProbability = subscriptionTimes > 0 ? Math.min(100, (1 / subscriptionTimes) * 100) : 100;

  // Investment analysis
  const lotsApplied = lotValue > 0 ? Math.floor(investment / lotValue) : 0;
  const actualInvestment = lotsApplied * lotValue;
  const expectedTotalGain = lotsApplied * expectedGainPerLot;
  const probabilisticGain = expectedTotalGain * (allotmentProbability / 100);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">IPO Analysis Tool</CardTitle>
              <CardDescription>Analyze GMP, allotment probability, and expected listing gains</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">IPO Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Issue Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={issuePrice}
                    onChange={(e) => setIssuePrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Grey Market Premium - GMP (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={gmp}
                    onChange={(e) => setGmp(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Current premium in grey market</p>
                </div>
                <div>
                  <Label>Lot Size (shares)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 30"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-500/10 border-green-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" /> Listing Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Expected Listing Price:</span>
                  <span className="text-xl font-bold text-primary font-mono">₹{expectedListingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Listing Gain %:</span>
                  <Badge variant={listingGainPercent > 0 ? "default" : "destructive"} className="text-lg">
                    {listingGainPercent > 0 ? "+" : ""}{listingGainPercent.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lot Value:</span>
                  <span className="font-mono">₹{lotValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Expected Gain/Lot:</span>
                  <span className={`font-mono ${expectedGainPerLot >= 0 ? "text-green-500" : "text-red-500"}`}>
                    ₹{expectedGainPerLot.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" /> Subscription & Allotment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Total Applications (estimated)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1500000"
                    value={totalApplications}
                    onChange={(e) => setTotalApplications(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Lots Available (retail quota)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 200000"
                    value={lotsAvailable}
                    onChange={(e) => setLotsAvailable(e.target.value)}
                  />
                </div>
              </div>

              {subscriptionTimes > 0 && (
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span>Subscription:</span>
                    <Badge variant="outline">{subscriptionTimes.toFixed(1)}x</Badge>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Allotment Probability:</span>
                      <span className="font-medium">{allotmentProbability.toFixed(1)}%</span>
                    </div>
                    <Progress value={allotmentProbability} className="h-3" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5" /> Your Investment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Your Investment Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 200000"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                />
              </div>

              {lotsApplied > 0 && (
                <div className="grid gap-4 md:grid-cols-3 pt-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Lots Applied</p>
                    <p className="text-2xl font-bold">{lotsApplied}</p>
                    <p className="text-xs text-muted-foreground">₹{actualInvestment.toLocaleString()} blocked</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Max Gain (if allotted)</p>
                    <p className="text-2xl font-bold text-green-500">₹{expectedTotalGain.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">On all {lotsApplied} lots</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground">Expected Value (prob. adjusted)</p>
                    <p className="text-2xl font-bold text-primary">₹{Math.round(probabilisticGain).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">At {allotmentProbability.toFixed(1)}% allotment chance</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• GMP is not a guaranteed indicator of listing price</li>
                <li>• Grey market trades are not regulated by SEBI</li>
                <li>• Actual allotment depends on subscription and lottery</li>
                <li>• STCG @ 20% applicable on listing gains (if sold within 1 year)</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default IPOAnalysisTool;
