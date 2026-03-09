import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoBack } from "@/hooks/useGoBack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, RotateCcw, User, Shield, Bell, Palette, Trash2, Building2, Plus, Pencil, ChevronDown } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import LegalEntityDialog from "@/components/LegalEntityDialog";
import type { LegalEntity } from "@/hooks/useUserProfile";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { profile, updateProfile, resetProfile, legalEntities, addEntity, updateEntity, deleteEntity } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState(profile);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taxReminders: true,
    darkMode: false,
  });
  const [entityDialogOpen, setEntityDialogOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null);
  const [deleteEntityId, setDeleteEntityId] = useState<string | null>(null);

  const handleSave = () => {
    updateProfile(formData);
    // Write sync_pan for auto-populate priority chain
    if (formData.pan && formData.pan.length === 10 && formData.pan !== "ABCDE1234F") {
      localStorage.setItem("sync_pan", formData.pan);
    }
    toast({ title: "Profile Updated", description: "Your profile settings have been saved successfully." });
  };

  const handleReset = () => {
    resetProfile();
    setFormData({
      name: 'Shankaran Pillai', pan: 'ABCDE1234F', email: '', phone: '', address: '', dateOfBirth: '', assesseeType: 'Individual',
    });
    toast({ title: "Profile Reset", description: "Your profile has been reset to default values." });
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setFormData({
      name: 'Shankaran Pillai', pan: 'ABCDE1234F', email: '', phone: '', address: '', dateOfBirth: '', assesseeType: 'Individual',
    });
    toast({ title: "All Data Cleared", description: "All locally stored data has been permanently deleted.", variant: "destructive" });
  };

  const handleSaveEntity = (data: Omit<LegalEntity, "id">) => {
    if (editingEntity) {
      updateEntity(editingEntity.id, data);
      toast({ title: "Entity Updated", description: `${data.name} has been updated.` });
    } else {
      addEntity(data);
      toast({ title: "Entity Added", description: `${data.name} has been added.` });
    }
    setEditingEntity(null);
  };

  const handleDeleteEntity = () => {
    if (deleteEntityId) {
      const entity = legalEntities.find(e => e.id === deleteEntityId);
      deleteEntity(deleteEntityId);
      toast({ title: "Entity Deleted", description: `${entity?.name || "Entity"} has been removed.`, variant: "destructive" });
      setDeleteEntityId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => goBack()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your personal details and preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input id="pan" value={formData.pan} onChange={(e) => setFormData(prev => ({ ...prev, pan: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" maxLength={10} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assesseeType">Assessee Type</Label>
                  <Select value={formData.assesseeType} onValueChange={(value) => setFormData(prev => ({ ...prev, assesseeType: value }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="HUF">HUF</SelectItem>
                      <SelectItem value="Firm">Firm</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                      <SelectItem value="AOP/BOI">AOP/BOI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} placeholder="Enter your address" />
              </div>
            </CardContent>
          </Card>

          {/* Legal Entities */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <CardTitle>Legal Entities</CardTitle>
                </div>
                <Button size="sm" className="gap-1" onClick={() => { setEditingEntity(null); setEntityDialogOpen(true); }}>
                  <Plus className="w-4 h-4" /> Add Entity
                </Button>
              </div>
              <CardDescription>Manage your business and legal entities</CardDescription>
            </CardHeader>
            <CardContent>
              {legalEntities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No legal entities added yet. Click "Add Entity" to get started.</p>
              ) : (
                <div className="space-y-3">
                  {legalEntities.map(entity => (
                    <Collapsible key={entity.id}>
                      <div className="border rounded-lg">
                        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 text-left">
                            <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{entity.name}</p>
                              <p className="text-xs text-muted-foreground">{entity.type} • PAN: {entity.pan || "—"}</p>
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-4 pb-4 pt-1 border-t space-y-2 text-sm">
                            {entity.natureOfBusiness && <p><span className="text-muted-foreground">Nature:</span> {entity.natureOfBusiness}</p>}
                            {entity.dateOfIncorporation && <p><span className="text-muted-foreground">Incorporated:</span> {entity.dateOfIncorporation}</p>}
                            {entity.registeredAddress && <p><span className="text-muted-foreground">Registered Address:</span> {entity.registeredAddress}</p>}
                            {entity.businessAddress && <p><span className="text-muted-foreground">Business Address:</span> {entity.businessAddress}</p>}
                            {entity.gstns.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">GSTN(s):</span>{" "}
                                {entity.gstns.join(", ")}
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => { setEditingEntity(entity); setEntityDialogOpen(true); }}>
                                <Pencil className="w-3 h-3" /> Edit
                              </Button>
                              <Button size="sm" variant="destructive" className="gap-1" onClick={() => setDeleteEntityId(entity.id)}>
                                <Trash2 className="w-3 h-3" /> Delete
                              </Button>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tax Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Tax Preferences</CardTitle>
              </div>
              <CardDescription>Configure your tax-related settings</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Tax Regime</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred tax regime</p>
                </div>
                <Select defaultValue="new">
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select regime" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="old">Old Regime</SelectItem>
                    <SelectItem value="new">New Regime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch checked={preferences.emailNotifications} onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tax Deadline Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified about upcoming tax deadlines</p>
                </div>
                <Switch checked={preferences.taxReminders} onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, taxReminders: checked }))} />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch checked={preferences.darkMode} onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, darkMode: checked }))} />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-destructive/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                <CardTitle className="text-destructive">Data Management</CardTitle>
              </div>
              <CardDescription>Manage your locally stored data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear All Local Data</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all data stored in your browser including profile, income details, tax calculations, and preferences.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2 flex-shrink-0 ml-4">
                      <Trash2 className="w-4 h-4" />
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all data stored locally in your browser, including:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Profile information</li>
                          <li>Income and salary details</li>
                          <li>Tax calculations and deductions</li>
                          <li>Financial ratios and budget data</li>
                          <li>All preferences and settings</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </main>

      {/* Legal Entity Dialog */}
      <LegalEntityDialog
        open={entityDialogOpen}
        onOpenChange={setEntityDialogOpen}
        entity={editingEntity}
        onSave={handleSaveEntity}
      />

      {/* Delete Entity Confirmation */}
      <AlertDialog open={!!deleteEntityId} onOpenChange={(open) => !open && setDeleteEntityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this legal entity. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEntity} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileSettings;
