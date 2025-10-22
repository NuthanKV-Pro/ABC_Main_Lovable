import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface PropertyData {
  id: string;
  name: string;
  address: string;
  rentalIncome: number;
  municipalTax: number;
  standardDeduction: number;
  interestPaid: number;
  taxableRent: number;
}

const HouseProperty = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<PropertyData[]>([
    {
      id: "1",
      name: "",
      address: "",
      rentalIncome: 0,
      municipalTax: 0,
      standardDeduction: 0,
      interestPaid: 0,
      taxableRent: 0,
    },
  ]);

  const calculateValues = (
    rentalIncome: number,
    municipalTax: number,
    interestPaid: number
  ) => {
    const standardDeduction = (rentalIncome - municipalTax) * 0.3;
    const taxableRent = rentalIncome - municipalTax - standardDeduction - interestPaid;
    return { standardDeduction, taxableRent };
  };

  const updateProperty = (id: string, field: string, value: string | number) => {
    setProperties((prev) =>
      prev.map((property) => {
        if (property.id !== id) return property;

        const updated = { ...property, [field]: value };

        if (["rentalIncome", "municipalTax", "interestPaid"].includes(field)) {
          const calculated = calculateValues(
            Number(updated.rentalIncome),
            Number(updated.municipalTax),
            Number(updated.interestPaid)
          );
          updated.standardDeduction = calculated.standardDeduction;
          updated.taxableRent = calculated.taxableRent;
        }

        return updated;
      })
    );
  };

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        id: Date.now().toString(),
        name: "",
        address: "",
        rentalIncome: 0,
        municipalTax: 0,
        standardDeduction: 0,
        interestPaid: 0,
        taxableRent: 0,
      },
    ]);
  };

  const removeProperty = (id: string) => {
    if (properties.length > 1) {
      setProperties(properties.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">House Property Income</h1>
              <p className="text-sm text-muted-foreground">Rental income from property</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {properties.map((property, index) => (
            <Card key={property.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Property {index + 1}</CardTitle>
                  {properties.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProperty(property.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${property.id}`}>Name of the Property</Label>
                      <Input
                        id={`name-${property.id}`}
                        value={property.name}
                        onChange={(e) => updateProperty(property.id, "name", e.target.value)}
                        placeholder="e.g., Apartment, Villa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`address-${property.id}`}>Address of the Property</Label>
                      <Input
                        id={`address-${property.id}`}
                        value={property.address}
                        onChange={(e) => updateProperty(property.id, "address", e.target.value)}
                        placeholder="Complete address"
                      />
                    </div>
                  </div>
                </div>

                {/* Income Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Income Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`rental-${property.id}`}>Rental Income per Annum (₹)</Label>
                      <Input
                        id={`rental-${property.id}`}
                        type="number"
                        value={property.rentalIncome || ""}
                        onChange={(e) =>
                          updateProperty(property.id, "rentalIncome", Number(e.target.value))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`mt-${property.id}`}>Municipal Tax (MT) Paid (₹)</Label>
                      <Input
                        id={`mt-${property.id}`}
                        type="number"
                        value={property.municipalTax || ""}
                        onChange={(e) =>
                          updateProperty(property.id, "municipalTax", Number(e.target.value))
                        }
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`std-${property.id}`}>
                        Standard Deduction (30% of Rent - MT)
                      </Label>
                      <Input
                        id={`std-${property.id}`}
                        type="number"
                        value={property.standardDeduction.toFixed(2)}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`interest-${property.id}`}>Interest Paid (₹)</Label>
                      <Input
                        id={`interest-${property.id}`}
                        type="number"
                        value={property.interestPaid || ""}
                        onChange={(e) =>
                          updateProperty(property.id, "interestPaid", Number(e.target.value))
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Taxable Rent */}
                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Taxable Rent</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{property.taxableRent.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    = Rent - MT - Standard Deduction - Interest
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button onClick={addProperty} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Property
          </Button>

          <div className="flex gap-4">
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">
              Save & Return
            </Button>
            <Button className="flex-1">Calculate Tax Impact</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HouseProperty;
