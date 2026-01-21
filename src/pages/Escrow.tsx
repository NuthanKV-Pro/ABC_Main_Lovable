import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Shield, Users, IndianRupee, Clock, CheckCircle2, AlertCircle, XCircle, Eye, FileText, Send, Lock, Unlock, Milestone, Database, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MilestoneItem {
  id: string;
  title: string;
  amount: number;
  status: "pending" | "in_progress" | "completed";
  dueDate?: Date;
}

interface EscrowTransaction {
  id: string;
  title: string;
  description: string;
  amount: number;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  status: "pending" | "funded" | "in_progress" | "completed" | "disputed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  terms: string;
  milestones: MilestoneItem[];
}

const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  funded: { label: "Funded", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Lock },
  in_progress: { label: "In Progress", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Clock },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
  disputed: { label: "Disputed", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground border-muted-foreground/30", icon: XCircle },
};

const milestoneStatusConfig = {
  pending: { label: "Pending", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  in_progress: { label: "In Progress", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30" },
};

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

const sampleTransactions: EscrowTransaction[] = [
  {
    id: "ESC001",
    title: "Website Development Project",
    description: "Full-stack web application development with React and Node.js",
    amount: 150000,
    buyerName: "Rahul Sharma",
    buyerEmail: "rahul@example.com",
    sellerName: "TechSoft Solutions",
    sellerEmail: "contact@techsoft.com",
    status: "funded",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-16"),
    terms: "50% upfront, 50% on completion. Delivery within 30 days.",
    milestones: [
      { id: "M1", title: "Design Phase", amount: 30000, status: "completed" },
      { id: "M2", title: "Frontend Development", amount: 50000, status: "in_progress" },
      { id: "M3", title: "Backend Development", amount: 40000, status: "pending" },
      { id: "M4", title: "Testing & Deployment", amount: 30000, status: "pending" },
    ]
  },
  {
    id: "ESC002",
    title: "Property Agreement",
    description: "Token amount for residential property purchase",
    amount: 500000,
    buyerName: "Priya Patel",
    buyerEmail: "priya@example.com",
    sellerName: "Kumar Properties",
    sellerEmail: "sales@kumarprops.com",
    status: "in_progress",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
    terms: "Token amount held until property documentation verification.",
    milestones: [
      { id: "M1", title: "Document Collection", amount: 100000, status: "completed" },
      { id: "M2", title: "Legal Verification", amount: 150000, status: "completed" },
      { id: "M3", title: "Registration Process", amount: 150000, status: "in_progress" },
      { id: "M4", title: "Handover", amount: 100000, status: "pending" },
    ]
  },
  {
    id: "ESC003",
    title: "Freelance Content Writing",
    description: "10 blog articles for corporate website",
    amount: 25000,
    buyerName: "StartupXYZ",
    buyerEmail: "hr@startupxyz.com",
    sellerName: "Anita Writers",
    sellerEmail: "anita@writers.com",
    status: "completed",
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-20"),
    terms: "Payment released upon content approval.",
    milestones: [
      { id: "M1", title: "First 5 Articles", amount: 12500, status: "completed" },
      { id: "M2", title: "Remaining 5 Articles", amount: 12500, status: "completed" },
    ]
  }
];

const Escrow = () => {
  const navigate = useNavigate();
  const [useSampleData, setUseSampleData] = useState(true);
  const [transactions, setTransactions] = useState<EscrowTransaction[]>(sampleTransactions);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<EscrowTransaction | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const [newTransaction, setNewTransaction] = useState({
    title: "",
    description: "",
    amount: "",
    buyerName: "",
    buyerEmail: "",
    sellerName: "",
    sellerEmail: "",
    terms: "",
  });

  const [newMilestones, setNewMilestones] = useState<{ title: string; amount: string }[]>([
    { title: "", amount: "" }
  ]);

  const handleToggleSampleData = (enabled: boolean) => {
    setUseSampleData(enabled);
    if (enabled) {
      setTransactions(sampleTransactions);
      toast({
        title: "Sample Data Enabled",
        description: "Loaded 3 sample escrow transactions for demonstration.",
      });
    } else {
      setTransactions([]);
      toast({
        title: "Sample Data Disabled",
        description: "All sample transactions have been cleared.",
      });
    }
    setSelectedTransaction(null);
  };

  const addMilestoneField = () => {
    setNewMilestones([...newMilestones, { title: "", amount: "" }]);
  };

  const removeMilestoneField = (index: number) => {
    if (newMilestones.length > 1) {
      setNewMilestones(newMilestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestoneField = (index: number, field: "title" | "amount", value: string) => {
    const updated = [...newMilestones];
    updated[index][field] = value;
    setNewMilestones(updated);
  };

  const handleCreateTransaction = () => {
    if (!newTransaction.title || !newTransaction.amount || !newTransaction.buyerName || !newTransaction.sellerName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const validMilestones = newMilestones
      .filter(m => m.title && m.amount)
      .map((m, index) => ({
        id: `M${index + 1}`,
        title: m.title,
        amount: parseFloat(m.amount),
        status: "pending" as const,
      }));

    const transaction: EscrowTransaction = {
      id: `ESC${String(transactions.length + 1).padStart(3, "0")}`,
      title: newTransaction.title,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      buyerName: newTransaction.buyerName,
      buyerEmail: newTransaction.buyerEmail,
      sellerName: newTransaction.sellerName,
      sellerEmail: newTransaction.sellerEmail,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      terms: newTransaction.terms,
      milestones: validMilestones,
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      title: "",
      description: "",
      amount: "",
      buyerName: "",
      buyerEmail: "",
      sellerName: "",
      sellerEmail: "",
      terms: "",
    });
    setNewMilestones([{ title: "", amount: "" }]);
    setIsCreateDialogOpen(false);

    toast({
      title: "Escrow Created",
      description: `Transaction ${transaction.id} has been created with ${validMilestones.length} milestone(s).`,
    });
  };

  const handleStatusChange = (id: string, newStatus: EscrowTransaction["status"]) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: newStatus, updatedAt: new Date() } : t
    ));
    
    const statusLabels = {
      pending: "marked as pending",
      funded: "funded successfully",
      in_progress: "now in progress",
      completed: "completed and funds released",
      disputed: "marked as disputed",
      cancelled: "cancelled",
    };

    toast({
      title: "Status Updated",
      description: `Transaction ${id} has been ${statusLabels[newStatus]}.`,
    });

    if (selectedTransaction?.id === id) {
      setSelectedTransaction({ ...selectedTransaction, status: newStatus, updatedAt: new Date() });
    }
  };

  const handleMilestoneStatusChange = (transactionId: string, milestoneId: string, newStatus: MilestoneItem["status"]) => {
    setTransactions(transactions.map(t => {
      if (t.id === transactionId) {
        const updatedMilestones = t.milestones.map(m => 
          m.id === milestoneId ? { ...m, status: newStatus } : m
        );
        return { ...t, milestones: updatedMilestones, updatedAt: new Date() };
      }
      return t;
    }));

    if (selectedTransaction?.id === transactionId) {
      const updatedMilestones = selectedTransaction.milestones.map(m => 
        m.id === milestoneId ? { ...m, status: newStatus } : m
      );
      setSelectedTransaction({ ...selectedTransaction, milestones: updatedMilestones, updatedAt: new Date() });
    }

    toast({
      title: "Milestone Updated",
      description: `Milestone marked as ${newStatus.replace("_", " ")}.`,
    });
  };

  const getMilestoneProgress = (milestones: MilestoneItem[]) => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === "completed").length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getCompletedMilestoneAmount = (milestones: MilestoneItem[]) => {
    return milestones.filter(m => m.status === "completed").reduce((sum, m) => sum + m.amount, 0);
  };

  const filteredTransactions = transactions.filter(t => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["pending", "funded", "in_progress"].includes(t.status);
    if (activeTab === "completed") return t.status === "completed";
    if (activeTab === "disputed") return t.status === "disputed";
    return true;
  });

  const stats = {
    total: transactions.length,
    active: transactions.filter(t => ["pending", "funded", "in_progress"].includes(t.status)).length,
    totalValue: transactions.filter(t => t.status !== "cancelled").reduce((sum, t) => sum + t.amount, 0),
    completed: transactions.filter(t => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Escrow Manager
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Secure transaction management between parties
              </p>
            </div>
            
            {/* Sample Data Toggle */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <Database className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground hidden sm:inline">Sample</span>
              <Switch
                checked={useSampleData}
                onCheckedChange={handleToggleSampleData}
                className="scale-90"
              />
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Escrow</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Create New Escrow
                  </DialogTitle>
                  <DialogDescription>
                    Set up a secure transaction between buyer and seller with milestone tracking
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Transaction Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Website Development Project"
                      value={newTransaction.title}
                      onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the transaction details..."
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="amount">Total Amount (₹) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter total amount"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" /> Buyer Details
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="buyerName">Name *</Label>
                        <Input
                          id="buyerName"
                          placeholder="Buyer's name"
                          value={newTransaction.buyerName}
                          onChange={(e) => setNewTransaction({ ...newTransaction, buyerName: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="buyerEmail">Email</Label>
                        <Input
                          id="buyerEmail"
                          type="email"
                          placeholder="buyer@example.com"
                          value={newTransaction.buyerEmail}
                          onChange={(e) => setNewTransaction({ ...newTransaction, buyerEmail: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" /> Seller Details
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="sellerName">Name *</Label>
                        <Input
                          id="sellerName"
                          placeholder="Seller's name"
                          value={newTransaction.sellerName}
                          onChange={(e) => setNewTransaction({ ...newTransaction, sellerName: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sellerEmail">Email</Label>
                        <Input
                          id="sellerEmail"
                          type="email"
                          placeholder="seller@example.com"
                          value={newTransaction.sellerEmail}
                          onChange={(e) => setNewTransaction({ ...newTransaction, sellerEmail: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Milestones Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Milestone className="w-4 h-4" /> Milestones (Optional)
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={addMilestoneField}>
                        <Plus className="w-3 h-3 mr-1" /> Add Milestone
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {newMilestones.map((milestone, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder={`Milestone ${index + 1} title`}
                            value={milestone.title}
                            onChange={(e) => updateMilestoneField(index, "title", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={milestone.amount}
                            onChange={(e) => updateMilestoneField(index, "amount", e.target.value)}
                            className="w-28"
                          />
                          {newMilestones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMilestoneField(index)}
                              className="shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Break down the transaction into milestones for phased releases
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      placeholder="Define the terms for fund release..."
                      value={newTransaction.terms}
                      onChange={(e) => setNewTransaction({ ...newTransaction, terms: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTransaction} className="gap-2">
                    <Shield className="w-4 h-4" />
                    Create Escrow
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Escrows</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <IndianRupee className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
                  <p className="text-xs text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Escrow Transactions</CardTitle>
            <CardDescription>Manage and track all your secure transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="disputed">Disputed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                    {!useSampleData && (
                      <p className="text-sm mt-2">Enable sample data or create a new escrow to get started</p>
                    )}
                  </div>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const StatusIcon = statusConfig[transaction.status].icon;
                    const milestoneProgress = getMilestoneProgress(transaction.milestones);
                    return (
                      <Card 
                        key={transaction.id} 
                        className="hover:border-primary/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">{transaction.id}</span>
                                <Badge className={`${statusConfig[transaction.status].color} text-xs`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig[transaction.status].label}
                                </Badge>
                              </div>
                              <h3 className="font-semibold truncate">{transaction.title}</h3>
                              <p className="text-sm text-muted-foreground truncate">{transaction.description}</p>
                            </div>

                            <div className="flex items-center gap-4 md:gap-6">
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{formatCurrency(transaction.amount)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {transaction.createdAt.toLocaleDateString('en-IN')}
                                </p>
                              </div>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="w-3 h-3" />
                              <span>{transaction.buyerName}</span>
                              <span className="mx-1">→</span>
                              <span>{transaction.sellerName}</span>
                            </div>
                            
                            {transaction.milestones.length > 0 && (
                              <div className="flex items-center gap-2 flex-1">
                                <Milestone className="w-3 h-3 text-muted-foreground" />
                                <div className="flex-1 max-w-32">
                                  <Progress value={milestoneProgress} className="h-1.5" />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {transaction.milestones.filter(m => m.status === "completed").length}/{transaction.milestones.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedTransaction && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-muted-foreground">{selectedTransaction.id}</span>
                    <Badge className={statusConfig[selectedTransaction.status].color}>
                      {statusConfig[selectedTransaction.status].label}
                    </Badge>
                  </div>
                  <DialogTitle>{selectedTransaction.title}</DialogTitle>
                  <DialogDescription>{selectedTransaction.description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Amount */}
                  <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Escrow Amount</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(selectedTransaction.amount)}</p>
                    {selectedTransaction.milestones.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Released: {formatCurrency(getCompletedMilestoneAmount(selectedTransaction.milestones))}
                      </p>
                    )}
                  </div>

                  {/* Parties */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Send className="w-4 h-4" /> Buyer
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{selectedTransaction.buyerName}</p>
                        <p className="text-sm text-muted-foreground">{selectedTransaction.buyerEmail}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" /> Seller
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-medium">{selectedTransaction.sellerName}</p>
                        <p className="text-sm text-muted-foreground">{selectedTransaction.sellerEmail}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Milestones */}
                  {selectedTransaction.milestones.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-base font-semibold">
                          <Milestone className="w-4 h-4" /> Milestone Tracking
                        </Label>
                        <span className="text-sm text-muted-foreground">
                          {getMilestoneProgress(selectedTransaction.milestones)}% Complete
                        </span>
                      </div>
                      <Progress value={getMilestoneProgress(selectedTransaction.milestones)} className="h-2" />
                      
                      <div className="space-y-2 mt-4">
                        {selectedTransaction.milestones.map((milestone, index) => (
                          <div 
                            key={milestone.id} 
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              milestone.status === "completed" 
                                ? "bg-green-500/20 text-green-400" 
                                : milestone.status === "in_progress"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {milestone.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">{milestone.title}</p>
                              <p className="text-sm text-muted-foreground">{formatCurrency(milestone.amount)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${milestoneStatusConfig[milestone.status].color} text-xs`}>
                                {milestoneStatusConfig[milestone.status].label}
                              </Badge>
                              {milestone.status !== "completed" && selectedTransaction.status !== "completed" && selectedTransaction.status !== "cancelled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStatus = milestone.status === "pending" ? "in_progress" : "completed";
                                    handleMilestoneStatusChange(selectedTransaction.id, milestone.id, nextStatus);
                                  }}
                                >
                                  {milestone.status === "pending" ? "Start" : "Complete"}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  {selectedTransaction.terms && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Terms & Conditions</Label>
                      <p className="mt-1 p-3 rounded-lg bg-muted/50 text-sm">{selectedTransaction.terms}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p>{selectedTransaction.createdAt.toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Last Updated</Label>
                      <p>{selectedTransaction.updatedAt.toLocaleDateString('en-IN', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      })}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Update Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTransaction.status === "pending" && (
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleStatusChange(selectedTransaction.id, "funded")}
                        >
                          <Lock className="w-4 h-4" /> Mark as Funded
                        </Button>
                      )}
                      {selectedTransaction.status === "funded" && (
                        <Button 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleStatusChange(selectedTransaction.id, "in_progress")}
                        >
                          <Clock className="w-4 h-4" /> Start Progress
                        </Button>
                      )}
                      {["funded", "in_progress"].includes(selectedTransaction.status) && (
                        <>
                          <Button 
                            size="sm" 
                            variant="default"
                            className="gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusChange(selectedTransaction.id, "completed")}
                          >
                            <Unlock className="w-4 h-4" /> Release Funds
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="gap-2"
                            onClick={() => handleStatusChange(selectedTransaction.id, "disputed")}
                          >
                            <AlertCircle className="w-4 h-4" /> Raise Dispute
                          </Button>
                        </>
                      )}
                      {selectedTransaction.status !== "cancelled" && selectedTransaction.status !== "completed" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleStatusChange(selectedTransaction.id, "cancelled")}
                        >
                          <XCircle className="w-4 h-4" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Info Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              How Escrow Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: 1, title: "Create Escrow", desc: "Set up transaction with buyer & seller details" },
                { step: 2, title: "Fund Escrow", desc: "Buyer deposits funds into secure escrow" },
                { step: 3, title: "Deliver & Verify", desc: "Seller delivers, buyer verifies the work" },
                { step: 4, title: "Release Funds", desc: "Funds released to seller upon approval" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-2 font-bold">
                    {item.step}
                  </div>
                  <h4 className="font-medium text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Escrow;
