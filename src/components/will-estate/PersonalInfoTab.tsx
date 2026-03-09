import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Shield, Heart } from "lucide-react";
import type { WillData } from "./types";

interface Props {
  data: WillData;
  onChange: (updates: Partial<WillData>) => void;
}

const PersonalInfoTab = ({ data, onChange }: Props) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" /> Testator Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Full Legal Name</Label><Input value={data.testatorName} onChange={e => onChange({ testatorName: e.target.value })} placeholder="As per government ID" /></div>
          <div><Label>Age</Label><Input value={data.testatorAge} onChange={e => onChange({ testatorAge: e.target.value })} placeholder="Current age" type="number" /></div>
        </div>
        <div>
          <Label>Residential Address</Label>
          <Textarea value={data.address} onChange={e => onChange({ address: e.target.value })} placeholder="Full residential address for legal records" rows={2} />
        </div>
        <div>
          <Label>Religion (determines applicable succession law)</Label>
          <Select value={data.religion} onValueChange={v => onChange({ religion: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hindu">Hindu / Sikh / Jain / Buddhist</SelectItem>
              <SelectItem value="muslim">Muslim</SelectItem>
              <SelectItem value="christian">Christian</SelectItem>
              <SelectItem value="parsi">Parsi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" /> Executor & Guardian
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Executor Name</Label><Input value={data.executorName} onChange={e => onChange({ executorName: e.target.value })} placeholder="Person to execute the will" /></div>
          <div><Label>Executor Address</Label><Input value={data.executorAddress} onChange={e => onChange({ executorAddress: e.target.value })} placeholder="Executor's address" /></div>
        </div>
        <div>
          <Label>Guardian for Minor Children (if applicable)</Label>
          <Input value={data.guardianName} onChange={e => onChange({ guardianName: e.target.value })} placeholder="Full name of guardian" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-primary" /> Final Wishes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Funeral / Last Rites Wishes</Label><Textarea value={data.funeralWishes} onChange={e => onChange({ funeralWishes: e.target.value })} placeholder="Burial, cremation, or other specific preferences..." rows={2} /></div>
        <div><Label>Charitable Donations</Label><Textarea value={data.charitableDonations} onChange={e => onChange({ charitableDonations: e.target.value })} placeholder="Any donations to charities, trusts, or religious institutions..." rows={2} /></div>
        <div><Label>Special Instructions</Label><Textarea value={data.specialInstructions} onChange={e => onChange({ specialInstructions: e.target.value })} placeholder="Any other specific wishes or conditions..." rows={3} /></div>
      </CardContent>
    </Card>
  </div>
);

export default PersonalInfoTab;
