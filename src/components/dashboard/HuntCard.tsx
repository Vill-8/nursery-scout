import { Hunt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MapPin, DollarSign, Pause, Play, Trash2, Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

interface HuntCardProps {
  hunt: Hunt;
  matchCount?: number;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const brandColors: Record<string, string> = {
  UPPAbaby: "bg-blue-500/10 text-blue-700 border-blue-200",
  Nuna: "bg-purple-500/10 text-purple-700 border-purple-200",
  SNOO: "bg-teal-500/10 text-teal-700 border-teal-200",
  Stokke: "bg-amber-500/10 text-amber-700 border-amber-200",
};

const categoryIcons: Record<string, string> = {
  Stroller: "🚼",
  Bassinet: "🛏️",
  "Car Seat": "🚗",
  "High Chair": "🍼",
};

export function HuntCard({ hunt, matchCount = 0, onToggle, onDelete }: HuntCardProps) {
  const [scouting, setScouting] = useState(false);

  const handleScrape = async () => {
    setScouting(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/scout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: hunt.brand,
          item_name: hunt.item_name,
          hunt_id: hunt.id,
          max_price: hunt.max_price
        })
      });

      if (!response.ok) {
        throw new Error("Failed to scrape deals");
      }

      const data = await response.json();
      toast.success(`🎉 Found ${data.deals_found} deals! Check your hunt card.`);
    } catch (error) {
      toast.error("Failed to scout deals. Make sure backend is running on localhost:8000");
      console.error(error);
    } finally {
      setScouting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`hunt-card ${!hunt.is_active ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className={brandColors[hunt.brand] || "bg-muted"}>
              {hunt.brand}
            </Badge>
            <span className="text-lg">{categoryIcons[hunt.category]}</span>
            <span className="font-medium">{hunt.category}</span>
            {hunt.item_name && (
              <span className="text-sm text-muted-foreground">• {hunt.item_name}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Up to ${hunt.max_price}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {hunt.zip_code} • {hunt.radius_miles}mi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {matchCount > 0 && (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              {matchCount} match{matchCount > 1 ? "es" : ""}
            </Badge>
          )}
          
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={handleScrape}
            disabled={scouting}
          >
            {scouting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Scouting...
              </>
            ) : (
              <>
                🔍 Scout Now
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle?.(hunt.id)}
            className="h-8 w-8"
          >
            {hunt.is_active ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete?.(hunt.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
