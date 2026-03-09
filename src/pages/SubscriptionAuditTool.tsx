import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, CreditCard, AlertTriangle, CheckCircle } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: "monthly" | "yearly";
  essential: boolean;
  lastUsed: string;
}

const SubscriptionAuditTool = () => {
  const goBack = useGoBack();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: "1", name: "Netflix", category: "Entertainment", amount: 649, frequency: "monthly", essential: false, lastUsed: "2024-12-10" },
    { id: "2", name: "Spotify", category: "Entertainment", amount: 119, frequency: "monthly", essential: false, lastUsed: "2024-12-15" },
    { id: "3", name: "Amazon Prime", category: "Shopping", amount: 1499, frequency: "yearly", essential: true, lastUsed: "2024-12-14" },
    { id: "4", name: "Gym Membership", category: "Health", amount: 2500, frequency: "monthly", essential: true, lastUsed: "2024-11-20" },
    { id: "5", name: "Cloud Storage", category: "Productivity", amount: 130, frequency: "monthly", essential: true, lastUsed: "2024-12-15" },
    { id: "6", name: "Magazine Sub", category: "Reading", amount: 999, frequency: "yearly", essential: false, lastUsed: "2024-10-01" },
  ]);

  const [newSub, setNewSub] = useState({ name: "", category: "", amount: "", frequency: "monthly" as const, essential: false });

  const addSubscription = () => {
    if (newSub.name && newSub.amount) {
      setSubscriptions([...subscriptions, {
        id: Date.now().toString(),
        name: newSub.name,
        category: newSub.category || "Other",
        amount: parseFloat(newSub.amount) || 0,
        frequency: newSub.frequency,
        essential: newSub.essential,
        lastUsed: new Date().toISOString().split('T')[0]
      }]);
      setNewSub({ name: "", category: "", amount: "", frequency: "monthly", essential: false });
    }
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const toggleEssential = (id: string) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === id ? { ...s, essential: !s.essential } : s
    ));
  };

  const getMonthlyAmount = (sub: Subscription) => {
    return sub.frequency === "yearly" ? sub.amount / 12 : sub.amount;
  };

  const getDaysSinceUsed = (lastUsed: string) => {
    const diff = new Date().getTime() - new Date(lastUsed).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const totalMonthly = subscriptions.reduce((sum, s) => sum + getMonthlyAmount(s), 0);
  const essentialMonthly = subscriptions.filter(s => s.essential).reduce((sum, s) => sum + getMonthlyAmount(s), 0);
  const nonEssentialMonthly = totalMonthly - essentialMonthly;
  const annualSpend = totalMonthly * 12;

  const unusedSubs = subscriptions.filter(s => getDaysSinceUsed(s.lastUsed) > 30);
  const potentialSavings = unusedSubs.reduce((sum, s) => sum + getMonthlyAmount(s), 0);

  const categorySpend = subscriptions.reduce((acc, sub) => {
    acc[sub.category] = (acc[sub.category] || 0) + getMonthlyAmount(sub);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categorySpend).map(([name, value], idx) => ({
    name,
    value: Math.round(value),
    color: `hsl(var(--chart-${(idx % 5) + 1}))`
  }));

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Subscription Audit Tool</CardTitle>
              <CardDescription>Track recurring expenses and identify waste</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-xl font-bold text-primary">₹{Math.round(totalMonthly).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Essential</p>
                <p className="text-xl font-bold text-green-500">₹{Math.round(essentialMonthly).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Non-Essential</p>
                <p className="text-xl font-bold text-amber-500">₹{Math.round(nonEssentialMonthly).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Annual Total</p>
                <p className="text-xl font-bold text-red-500">₹{Math.round(annualSpend).toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {potentialSavings > 0 && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-amber-600">Potential Savings Identified!</p>
                  <p className="text-sm text-muted-foreground">
                    {unusedSubs.length} subscription(s) not used in 30+ days. 
                    Potential monthly savings: <strong>₹{Math.round(potentialSavings)}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Spend by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ₹${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${value}`, "Monthly"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Add Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      placeholder="Netflix"
                      value={newSub.name}
                      onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      placeholder="Entertainment"
                      value={newSub.category}
                      onChange={(e) => setNewSub({ ...newSub, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="499"
                      value={newSub.amount}
                      onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                      value={newSub.frequency}
                      onChange={(e) => setNewSub({ ...newSub, frequency: e.target.value as any })}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newSub.essential}
                    onCheckedChange={(checked) => setNewSub({ ...newSub, essential: checked })}
                  />
                  <Label>Essential</Label>
                </div>
                <Button onClick={addSubscription} className="w-full">
                  <Plus className="h-4 w-4 mr-1" /> Add Subscription
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const daysSince = getDaysSinceUsed(sub.lastUsed);
              const isUnused = daysSince > 30;
              
              return (
                <Card key={sub.id} className={`${isUnused ? "border-amber-500/50" : ""}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sub.name}</span>
                            <Badge variant="outline">{sub.category}</Badge>
                            {sub.essential && <Badge className="bg-green-500">Essential</Badge>}
                            {isUnused && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" /> Unused {daysSince}d
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ₹{sub.amount}/{sub.frequency === "yearly" ? "yr" : "mo"} 
                            {sub.frequency === "yearly" && ` (₹${Math.round(sub.amount/12)}/mo)`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sub.essential}
                            onCheckedChange={() => toggleEssential(sub.id)}
                          />
                          <span className="text-sm">Essential</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteSubscription(sub.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionAuditTool;
