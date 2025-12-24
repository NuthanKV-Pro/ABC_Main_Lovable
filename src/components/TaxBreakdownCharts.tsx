import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TaxBreakdownChartsProps {
  incomeData: {
    particulars: string;
    income: number;
    exemption: number;
    taxableIncome: number;
  }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(28, 90%, 55%)', 'hsl(180, 70%, 45%)', 'hsl(280, 70%, 55%)', 'hsl(340, 70%, 55%)', 'hsl(60, 70%, 45%)', 'hsl(200, 70%, 55%)', 'hsl(120, 50%, 45%)'];

const TaxBreakdownCharts = ({ incomeData }: TaxBreakdownChartsProps) => {
  const pieData = incomeData
    .filter(item => item.taxableIncome > 0)
    .map((item, index) => ({
      name: item.particulars,
      value: item.taxableIncome,
      color: COLORS[index % COLORS.length]
    }));

  const barData = incomeData.map(item => ({
    name: item.particulars.length > 10 ? item.particulars.substring(0, 10) + '...' : item.particulars,
    fullName: item.particulars,
    income: item.income,
    exemption: item.exemption,
    taxable: item.taxableIncome
  }));

  const totalTaxable = incomeData.reduce((acc, item) => acc + item.taxableIncome, 0);

  // Tax slab calculation for new regime (2024-25)
  const calculateTaxSlabs = (income: number) => {
    if (income <= 300000) return [{ slab: '0-3L', tax: 0, rate: '0%' }];
    
    const slabs = [];
    let remaining = income;
    
    if (remaining > 0) {
      const amount = Math.min(remaining, 300000);
      slabs.push({ slab: '0-3L', tax: 0, rate: '0%' });
      remaining -= amount;
    }
    if (remaining > 0) {
      const amount = Math.min(remaining, 400000);
      slabs.push({ slab: '3-7L', tax: amount * 0.05, rate: '5%' });
      remaining -= amount;
    }
    if (remaining > 0) {
      const amount = Math.min(remaining, 300000);
      slabs.push({ slab: '7-10L', tax: amount * 0.10, rate: '10%' });
      remaining -= amount;
    }
    if (remaining > 0) {
      const amount = Math.min(remaining, 200000);
      slabs.push({ slab: '10-12L', tax: amount * 0.15, rate: '15%' });
      remaining -= amount;
    }
    if (remaining > 0) {
      const amount = Math.min(remaining, 300000);
      slabs.push({ slab: '12-15L', tax: amount * 0.20, rate: '20%' });
      remaining -= amount;
    }
    if (remaining > 0) {
      slabs.push({ slab: '>15L', tax: remaining * 0.30, rate: '30%' });
    }
    
    return slabs.filter(s => s.tax > 0);
  };

  const taxSlabData = calculateTaxSlabs(totalTaxable);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Pie Chart - Income Distribution */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Income Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - Income vs Exemption */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Income vs Exemption Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="hsl(var(--primary))" />
              <Bar dataKey="exemption" name="Exemption" fill="hsl(var(--accent))" />
              <Bar dataKey="taxable" name="Taxable" fill="hsl(28, 90%, 55%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tax Slab Breakdown */}
      <Card className="border-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Tax Breakdown by Slab (New Regime)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taxSlabData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="slab" width={60} />
              <Tooltip 
                formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                labelFormatter={(label) => `Slab: ${label}`}
              />
              <Legend />
              <Bar dataKey="tax" name="Tax Amount" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxBreakdownCharts;
