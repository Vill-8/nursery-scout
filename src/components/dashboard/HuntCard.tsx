import { Hunt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, DollarSign, Pause, Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

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
