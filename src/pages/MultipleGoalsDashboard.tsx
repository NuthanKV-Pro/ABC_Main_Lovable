import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Target, Home, GraduationCap, Car, Plane, Heart } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentSaved: number;
  monthlyContribution: number;
  targetYear: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  education: GraduationCap,
  car: Car,
  travel: Plane,
  wedding: Heart,
  other: Target
};

const MultipleGoalsDashboard = () => {
  const goBack = useGoBack();
  const [goals, setGoals] = useState<Goal[]>([
    { id: "1", name: "Dream Home", icon: "home", targetAmount: 10000000, currentSaved: 2500000, monthlyContribution: 50000, targetYear: 2030 },
    { id: "2", name: "Child Education", icon: "education", targetAmount: 3000000, currentSaved: 800000, monthlyContribution: 20000, targetYear: 2035 },
    { id: "3", name: "New Car", icon: "car", targetAmount: 1500000, currentSaved: 500000, monthlyContribution: 25000, targetYear: 2026 },
  ]);
  const [newGoal, setNewGoal] = useState({ name: "", icon: "other", targetAmount: "", currentSaved: "", monthlyContribution: "", targetYear: "" });
  const [showForm, setShowForm] = useState(false);

  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.targetYear) {
      setGoals([...goals, {
        id: Date.now().toString(),
        name: newGoal.name,
        icon: newGoal.icon,
        targetAmount: parseFloat(newGoal.targetAmount) || 0,
        currentSaved: parseFloat(newGoal.currentSaved) || 0,
        monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0,
        targetYear: parseInt(newGoal.targetYear) || new Date().getFullYear() + 5
      }]);
      setNewGoal({ name: "", icon: "other", targetAmount: "", currentSaved: "", monthlyContribution: "", targetYear: "" });
      setShowForm(false);
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const calculateProjection = (goal: Goal) => {
    const currentYear = new Date().getFullYear();
    const monthsRemaining = Math.max(0, (goal.targetYear - currentYear) * 12);
    const projectedTotal = goal.currentSaved + (goal.monthlyContribution * monthsRemaining);
    const percentComplete = (goal.currentSaved / goal.targetAmount) * 100;
    const projectedPercent = (projectedTotal / goal.targetAmount) * 100;
    const gap = goal.targetAmount - projectedTotal;
    const onTrack = projectedTotal >= goal.targetAmount;
    
    return { projectedTotal, percentComplete, projectedPercent, gap, onTrack, monthsRemaining };
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalMonthly = goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Multiple Goals Dashboard</CardTitle>
                <CardDescription>Track progress across all your financial goals</CardDescription>
              </div>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-1" /> Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-xl font-bold">₹{(totalTarget / 10000000).toFixed(2)} Cr</p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-xl font-bold text-green-500">₹{(totalSaved / 100000).toFixed(1)} L</p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Monthly Investment</p>
                <p className="text-xl font-bold text-blue-500">₹{totalMonthly.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-xl font-bold text-amber-500">{overallProgress.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {showForm && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">New Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div>
                    <Label>Goal Name</Label>
                    <Input
                      placeholder="Dream Home"
                      value={newGoal.name}
                      onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                      value={newGoal.icon}
                      onChange={(e) => setNewGoal({ ...newGoal, icon: e.target.value })}
                    >
                      <option value="home">🏠 Home</option>
                      <option value="education">🎓 Education</option>
                      <option value="car">🚗 Car</option>
                      <option value="travel">✈️ Travel</option>
                      <option value="wedding">💒 Wedding</option>
                      <option value="other">🎯 Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Target Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="1000000"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Current Saved (₹)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newGoal.currentSaved}
                      onChange={(e) => setNewGoal({ ...newGoal, currentSaved: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Monthly SIP (₹)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={newGoal.monthlyContribution}
                      onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Target Year</Label>
                    <Input
                      type="number"
                      placeholder="2030"
                      value={newGoal.targetYear}
                      onChange={(e) => setNewGoal({ ...newGoal, targetYear: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addGoal} className="mt-4">Add Goal</Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const projection = calculateProjection(goal);
              const IconComponent = iconMap[goal.icon] || Target;
              
              return (
                <Card key={goal.id} className={`${projection.onTrack ? "border-green-500/30" : "border-amber-500/30"}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Target: ₹{(goal.targetAmount / 100000).toFixed(1)}L</span>
                      <span>by {goal.targetYear}</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{projection.percentComplete.toFixed(1)}%</span>
                      </div>
                      <Progress value={projection.percentComplete} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Saved</p>
                        <p className="font-mono">₹{(goal.currentSaved / 100000).toFixed(1)}L</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Monthly SIP</p>
                        <p className="font-mono">₹{goal.monthlyContribution.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Projected</span>
                        <Badge variant={projection.onTrack ? "default" : "destructive"}>
                          {projection.onTrack ? "On Track" : `Gap: ₹${(projection.gap / 100000).toFixed(1)}L`}
                        </Badge>
                      </div>
                      <p className="text-sm font-mono mt-1">
                        ₹{(projection.projectedTotal / 100000).toFixed(1)}L in {Math.floor(projection.monthsRemaining / 12)} years
                      </p>
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

export default MultipleGoalsDashboard;
