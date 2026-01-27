import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, AlertTriangle, Link2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SafetyResult {
  status: "safe" | "recall" | "unknown";
  product: string;
  brand: string;
  message: string;
  details?: string;
}

export default function SafetyChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SafetyResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) return;
    
    setLoading(true);
    setResult(null);

    // Simulate API call to check against recall database
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Placeholder logic - in production this would call a real recall API
    const mockResults: SafetyResult[] = [
      {
        status: "safe",
        product: "VISTA V2 Stroller",
        brand: "UPPAbaby",
        message: "No recalls found for this model",
        details: "This stroller meets all current safety standards. Last checked against CPSC database on Jan 2024.",
      },
      {
        status: "recall",
        product: "PIPA Lite R Car Seat",
        brand: "Nuna",
        message: "Active recall - Handle may release unexpectedly",
        details: "Recall issued December 2023. Contact manufacturer for free repair kit. NHTSA Campaign Number: 24V-XXX.",
      },
      {
        status: "unknown",
        product: "Unknown Product",
        brand: "Unknown",
        message: "Unable to verify this listing",
        details: "We couldn't identify this product. Please verify the model number and try again, or contact the seller for more details.",
      },
    ];

    // Random result for demo
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    setResult(randomResult);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <ShieldCheck className="w-6 h-6" />;
      case "recall":
        return <AlertTriangle className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-success/10 text-success border-success/20";
      case "recall":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-warning/10 text-warning-foreground border-warning/30";
    }
  };

  return (
    <Layout>
      <div className="container py-8 page-transition">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-sage flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2">Safety Checker</h1>
            <p className="text-muted-foreground">
              Paste a marketplace listing URL to check if the product has any recalls or safety issues.
            </p>
          </div>

          {/* Check Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Listing URL</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://facebook.com/marketplace/item/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supports Facebook Marketplace, Craigslist, OfferUp, and more
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking safety database...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Check Safety Status
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`border-2 ${result.status === "recall" ? "border-destructive/50" : result.status === "safe" ? "border-success/50" : "border-warning/50"}`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{result.product}</CardTitle>
                          <Badge variant="secondary">{result.brand}</Badge>
                        </div>
                        <CardDescription className="text-base">
                          {result.message}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  {result.details && (
                    <CardContent>
                      <div className="p-4 rounded-lg bg-muted text-sm">
                        {result.details}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <h3 className="font-semibold mb-2">How it works</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              We analyze the listing to identify the product, then cross-reference it against 
              the CPSC recall database, NHTSA vehicle safety recalls, and manufacturer bulletins.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
