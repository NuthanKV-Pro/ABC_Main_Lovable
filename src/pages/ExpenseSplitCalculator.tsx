import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Users, ArrowRight } from "lucide-react";
import { useGoBack } from "@/hooks/useGoBack";

interface Person {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitAmong: string[];
}

const ExpenseSplitCalculator = () => {
  const goBack = useGoBack();
  const [people, setPeople] = useState<Person[]>([
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Charlie" },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", description: "Dinner", amount: 3000, paidBy: "1", splitAmong: ["1", "2", "3"] },
    { id: "2", description: "Movie tickets", amount: 1500, paidBy: "2", splitAmong: ["1", "2", "3"] },
    { id: "3", description: "Cab", amount: 600, paidBy: "3", splitAmong: ["2", "3"] },
  ]);

  const [newPerson, setNewPerson] = useState("");
  const [newExpense, setNewExpense] = useState({ description: "", amount: "", paidBy: "", splitAmong: [] as string[] });

  const addPerson = () => {
    if (newPerson.trim()) {
      setPeople([...people, { id: Date.now().toString(), name: newPerson.trim() }]);
      setNewPerson("");
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setExpenses(expenses.filter(e => e.paidBy !== id).map(e => ({
      ...e,
      splitAmong: e.splitAmong.filter(s => s !== id)
    })));
  };

  const addExpense = () => {
    if (newExpense.description && newExpense.amount && newExpense.paidBy && newExpense.splitAmong.length > 0) {
      setExpenses([...expenses, {
        id: Date.now().toString(),
        description: newExpense.description,
        amount: parseFloat(newExpense.amount) || 0,
        paidBy: newExpense.paidBy,
        splitAmong: newExpense.splitAmong
      }]);
      setNewExpense({ description: "", amount: "", paidBy: "", splitAmong: [] });
    }
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const toggleSplitPerson = (personId: string) => {
    setNewExpense(prev => ({
      ...prev,
      splitAmong: prev.splitAmong.includes(personId)
        ? prev.splitAmong.filter(id => id !== personId)
        : [...prev.splitAmong, personId]
    }));
  };

  // Calculate balances
  const calculateBalances = () => {
    const balances: Record<string, number> = {};
    people.forEach(p => balances[p.id] = 0);

    expenses.forEach(exp => {
      const sharePerPerson = exp.amount / exp.splitAmong.length;
      
      // Payer gets credit for the full amount
      balances[exp.paidBy] = (balances[exp.paidBy] || 0) + exp.amount;
      
      // Everyone who splits owes their share
      exp.splitAmong.forEach(personId => {
        balances[personId] = (balances[personId] || 0) - sharePerPerson;
      });
    });

    return balances;
  };

  const balances = calculateBalances();

  // Calculate settlements (simplified)
  const calculateSettlements = () => {
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    Object.entries(balances).forEach(([id, amount]) => {
      if (amount < -0.01) debtors.push({ id, amount: Math.abs(amount) });
      else if (amount > 0.01) creditors.push({ id, amount });
    });

    const settlements: { from: string; to: string; amount: number }[] = [];
    
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const payAmount = Math.min(debtors[i].amount, creditors[j].amount);
      if (payAmount > 0.01) {
        settlements.push({
          from: debtors[i].id,
          to: creditors[j].id,
          amount: payAmount
        });
      }
      debtors[i].amount -= payAmount;
      creditors[j].amount -= payAmount;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return settlements;
  };

  const settlements = calculateSettlements();
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const getPersonName = (id: string) => people.find(p => p.id === id)?.name || "Unknown";

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="ghost" onClick={goBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Expense Split Calculator</CardTitle>
              <CardDescription>Split expenses among roommates or groups</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">People</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {people.map(person => (
                  <Badge key={person.id} variant="secondary" className="text-sm py-1 px-3 gap-2">
                    {person.name}
                    <button onClick={() => removePerson(person.id)} className="hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add person"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addPerson()}
                />
                <Button onClick={addPerson}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Expense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Dinner, Movie, etc."
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Paid By</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newExpense.paidBy}
                    onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                  >
                    <option value="">Select person</option>
                    {people.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>Split Among</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {people.map(p => (
                    <Badge
                      key={p.id}
                      variant={newExpense.splitAmong.includes(p.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSplitPerson(p.id)}
                    >
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={addExpense}>Add Expense</Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Expenses (₹{totalExpenses.toLocaleString()})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{exp.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid by {getPersonName(exp.paidBy)} • Split: {exp.splitAmong.map(id => getPersonName(id)).join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">₹{exp.amount}</span>
                        <Button variant="ghost" size="icon" onClick={() => removeExpense(exp.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {people.map(person => {
                    const balance = balances[person.id] || 0;
                    return (
                      <div key={person.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">{person.name}</span>
                        <span className={`font-mono font-bold ${balance > 0 ? "text-green-500" : balance < 0 ? "text-red-500" : ""}`}>
                          {balance > 0 ? "+" : ""}₹{Math.round(balance).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {settlements.length > 0 && (
            <Card className="bg-primary/5 border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">💸 Settlements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {settlements.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <Badge variant="destructive">{getPersonName(s.from)}</Badge>
                      <ArrowRight className="h-4 w-4" />
                      <Badge variant="default">{getPersonName(s.to)}</Badge>
                      <span className="ml-auto font-mono font-bold">₹{Math.round(s.amount).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSplitCalculator;
