import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface AssetData {
  id: string;
  assetName: string;
  dateOfPurchase: string;
  dateOfSale: string;
  purchasePrice: number;
  salePrice: number;
  expenses: number;
  capitalGain: number;
}

const CapitalGains = () => {
  const navigate = useNavigate();
  
  const [shares, setShares] = useState<AssetData[]>([
    {
      id: "1",
      assetName: "",
      dateOfPurchase: "",
      dateOfSale: "",
      purchasePrice: 0,
      salePrice: 0,
      expenses: 0,
      capitalGain: 0,
    },
  ]);

  const [mutualFunds, setMutualFunds] = useState<AssetData[]>([
    {
      id: "1",
      assetName: "",
      dateOfPurchase: "",
      dateOfSale: "",
      purchasePrice: 0,
      salePrice: 0,
      expenses: 0,
      capitalGain: 0,
    },
  ]);

  const [property, setProperty] = useState<AssetData[]>([
    {
      id: "1",
      assetName: "",
      dateOfPurchase: "",
      dateOfSale: "",
      purchasePrice: 0,
      salePrice: 0,
      expenses: 0,
      capitalGain: 0,
    },
  ]);

  const [crypto, setCrypto] = useState<AssetData[]>([
    {
      id: "1",
      assetName: "",
      dateOfPurchase: "",
      dateOfSale: "",
      purchasePrice: 0,
      salePrice: 0,
      expenses: 0,
      capitalGain: 0,
    },
  ]);

  const calculateGain = (salePrice: number, purchasePrice: number, expenses: number) => {
    return salePrice - purchasePrice - expenses;
  };

  const updateAsset = (
    category: "shares" | "mutualFunds" | "property" | "crypto",
    id: string,
    field: string,
    value: string | number
  ) => {
    const setState =
      category === "shares"
        ? setShares
        : category === "mutualFunds"
        ? setMutualFunds
        : category === "property"
        ? setProperty
        : setCrypto;

    setState((prev) =>
      prev.map((asset) => {
        if (asset.id !== id) return asset;

        const updated = { ...asset, [field]: value };

        if (["salePrice", "purchasePrice", "expenses"].includes(field)) {
          updated.capitalGain = calculateGain(
            Number(updated.salePrice),
            Number(updated.purchasePrice),
            Number(updated.expenses)
          );
        }

        return updated;
      })
    );
  };

  const addAsset = (category: "shares" | "mutualFunds" | "property" | "crypto") => {
    const setState =
      category === "shares"
        ? setShares
        : category === "mutualFunds"
        ? setMutualFunds
        : category === "property"
        ? setProperty
        : setCrypto;

    const getState =
      category === "shares"
        ? shares
        : category === "mutualFunds"
        ? mutualFunds
        : category === "property"
        ? property
        : crypto;

    setState([
      ...getState,
      {
        id: Date.now().toString(),
        assetName: "",
        dateOfPurchase: "",
        dateOfSale: "",
        purchasePrice: 0,
        salePrice: 0,
        expenses: 0,
        capitalGain: 0,
      },
    ]);
  };

  const removeAsset = (
    category: "shares" | "mutualFunds" | "property" | "crypto",
    id: string
  ) => {
    const setState =
      category === "shares"
        ? setShares
        : category === "mutualFunds"
        ? setMutualFunds
        : category === "property"
        ? setProperty
        : setCrypto;

    const getState =
      category === "shares"
        ? shares
        : category === "mutualFunds"
        ? mutualFunds
        : category === "property"
        ? property
        : crypto;

    if (getState.length > 1) {
      setState(getState.filter((a) => a.id !== id));
    }
  };

  const renderAssetForm = (
    assets: AssetData[],
    category: "shares" | "mutualFunds" | "property" | "crypto",
    categoryName: string
  ) => (
    <div className="space-y-6">
      {assets.map((asset, index) => (
        <Card key={asset.id} className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {categoryName} {index + 1}
              </CardTitle>
              {assets.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAsset(category, asset.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${asset.id}`}>Asset Name/Description</Label>
                <Input
                  id={`name-${asset.id}`}
                  value={asset.assetName}
                  onChange={(e) =>
                    updateAsset(category, asset.id, "assetName", e.target.value)
                  }
                  placeholder="e.g., Reliance Industries, HDFC MF"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`purchase-date-${asset.id}`}>Date of Purchase</Label>
                <Input
                  id={`purchase-date-${asset.id}`}
                  type="date"
                  value={asset.dateOfPurchase}
                  onChange={(e) =>
                    updateAsset(category, asset.id, "dateOfPurchase", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sale-date-${asset.id}`}>Date of Sale</Label>
                <Input
                  id={`sale-date-${asset.id}`}
                  type="date"
                  value={asset.dateOfSale}
                  onChange={(e) =>
                    updateAsset(category, asset.id, "dateOfSale", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`purchase-${asset.id}`}>Purchase Price (₹)</Label>
                <Input
                  id={`purchase-${asset.id}`}
                  type="number"
                  value={asset.purchasePrice || ""}
                  onChange={(e) =>
                    updateAsset(category, asset.id, "purchasePrice", Number(e.target.value))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`sale-${asset.id}`}>Sale Price (₹)</Label>
                <Input
                  id={`sale-${asset.id}`}
                  type="number"
                  value={asset.salePrice || ""}
                  onChange={(e) =>
                    updateAsset(category, asset.id, "salePrice", Number(e.target.value))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`expenses-${asset.id}`}>
                  Expenses (Brokerage, Legal, etc.) (₹)
                </Label>
                <Input
                  id={`expenses-${asset.id}`}
                  type="number"
                  value={asset.expenses || ""}
                  onChange={(e) =>
                    updateAsset(category, asset.id, "expenses", Number(e.target.value))
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Capital Gain/Loss</span>
                <span
                  className={`text-2xl font-bold ${
                    asset.capitalGain >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  ₹{asset.capitalGain.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                = Sale Price - Purchase Price - Expenses
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={() => addAsset(category)} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Another {categoryName}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Capital Gains</h1>
              <p className="text-sm text-muted-foreground">
                Profit/Loss from sale of assets
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="shares" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="shares">Shares</TabsTrigger>
            <TabsTrigger value="mutualfunds">Mutual Funds</TabsTrigger>
            <TabsTrigger value="property">Land/House</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>

          <TabsContent value="shares">
            {renderAssetForm(shares, "shares", "Share")}
          </TabsContent>

          <TabsContent value="mutualfunds">
            {renderAssetForm(mutualFunds, "mutualFunds", "Mutual Fund")}
          </TabsContent>

          <TabsContent value="property">
            {renderAssetForm(property, "property", "Property")}
          </TabsContent>

          <TabsContent value="crypto">
            {renderAssetForm(crypto, "crypto", "Crypto Asset")}
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 mt-6">
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">
            Save & Return
          </Button>
          <Button className="flex-1">Calculate Tax Impact</Button>
        </div>
      </main>
    </div>
  );
};

export default CapitalGains;
