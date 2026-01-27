import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus } from "lucide-react";
import { Brand, ItemCategory } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const brands: Brand[] = ["UPPAbaby", "Nuna", "SNOO", "Stokke"];
const categories: ItemCategory[] = ["Stroller", "Bassinet", "Car Seat", "High Chair"];

interface CreateHuntDialogProps {
  onCreated?: () => void;
}

export function CreateHuntDialog({ onCreated }: CreateHuntDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  
  const [brand, setBrand] = useState<Brand | "">("");
  const [category, setCategory] = useState<ItemCategory | "">("");
  const [itemName, setItemName] = useState("");
  const [maxPrice, setMaxPrice] = useState([500]);
  const [zipCode, setZipCode] = useState("");
  const [radius, setRadius] = useState([25]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !category || !zipCode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a hunt");
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.from("hunts").insert({
      user_id: user.id,
      brand,
      item_name: itemName || null,
      category,
      max_price: maxPrice[0],
      zip_code: zipCode,
      radius_miles: radius[0],
    });

    setLoading(false);

    if (error) {
      toast.error(`Failed to create hunt: ${error.message}`);
      console.error("Supabase error:", error);
      return;
    }

    toast.success("Hunt created! We'll start looking for deals.");
    setOpen(false);
    resetForm();
    onCreated?.();
  };

  const resetForm = () => {
    setBrand("");
    setCategory("");
    setItemName("");
    setMaxPrice([500]);
    setZipCode("");
    setRadius([25]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Hunt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Start a New Hunt</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Brand Selection */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select value={brand} onValueChange={(v) => setBrand(v as Brand)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="itemName">Product Name <span className="text-muted-foreground text-sm">(optional)</span></Label>
            <Input
              id="itemName"
              placeholder="SNOO Smart Sleeper"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Price Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max Price</Label>
              <span className="text-sm font-medium">${maxPrice[0]}</span>
            </div>
            <Slider
              value={maxPrice}
              onValueChange={setMaxPrice}
              max={1200}
              step={25}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$1,200</span>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                placeholder="90210"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Radius</Label>
                <span className="text-xs text-muted-foreground">{radius[0]} mi</span>
              </div>
              <Slider
                value={radius}
                onValueChange={setRadius}
                min={5}
                max={100}
                step={5}
                className="py-2"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Start Hunting"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
