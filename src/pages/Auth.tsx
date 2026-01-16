import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, TrendingUp } from "lucide-react";
import heroAuth from "@/assets/hero-auth.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={heroAuth} 
          alt="Professional consultation" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/90" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              ABC
            </h1>
            <p className="text-2xl font-light mb-2">AnyBody Can Consult</p>
            <p className="text-xl opacity-90">AI Legal & Tax Co-pilot</p>
          </div>
          
          <div className="space-y-6 max-w-md">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Secure & Compliant</h3>
                <p className="text-sm opacity-90">
                  We extract basic and relevant information from your Income Tax profile for a better experience
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg mb-1">AI-Powered Intelligence</h3>
                <p className="text-sm opacity-90">
                  24/7 instant consultation with trained AI understanding Indian law, tax, and finance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-muted/30 to-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <h1 className="text-4xl font-bold text-primary mb-2">ABC</h1>
            <p className="text-muted-foreground">AI Legal & Tax Co-pilot</p>
          </div>

          <Card className="border-2 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome to the Prototype</CardTitle>
              <CardDescription>
                Dummy User Auth to allow seamless access to the Prototype
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input 
                    id="pan" 
                    placeholder="ABCDE1234F" 
                    required 
                    className="uppercase"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    required 
                  />
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  By continuing, you agree to let us extract basic information from your Income Tax profile
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity shadow-[var(--shadow-gold)]"
                  disabled={isLoading}
                >
                  {isLoading ? "Please wait..." : "Sign In / Sign Up"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
