import { FoundItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShieldCheck, AlertTriangle, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface DealCardProps {
  item: FoundItem;
  onMarkViewed?: (id: string) => void;
}

export function DealCard({ item, onMarkViewed }: DealCardProps) {
  const valuePercentage = item.retail_price
    ? Math.round(((item.retail_price - item.price) / item.retail_price) * 100)
    : null;

  const getSafetyBadge = () => {
    switch (item.safety_status) {
      case "Verified Model":
        return (
          <Badge className="badge-verified gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </Badge>
        );
      case "Check Recall":
        return (
          <Badge className="badge-warning gap-1">
            <AlertTriangle className="w-3 h-3" />
            Check Recall
          </Badge>
        );
      case "Recalled":
        return (
          <Badge className="badge-danger gap-1">
            <AlertTriangle className="w-3 h-3" />
            Recalled
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            Unknown
          </Badge>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card-premium overflow-hidden ${!item.is_viewed ? "ring-2 ring-primary/20" : ""}`}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
            📷
          </div>
        )}
        
        {/* Value Score Chip */}
        {valuePercentage && valuePercentage > 0 && (
          <div className="absolute top-3 right-3 value-chip">
            <span className="font-semibold">{valuePercentage}%</span>
            <span className="text-xs">below retail</span>
          </div>
        )}
        
        {/* New indicator */}
        {!item.is_viewed && (
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-medium line-clamp-2 flex-1">{item.title}</h3>
          {getSafetyBadge()}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl font-display font-semibold">${item.price}</span>
          {item.retail_price && (
            <span className="text-sm text-muted-foreground line-through">
              ${item.retail_price}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          {item.location && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {item.location}
            </span>
          )}
          
          <Button
            size="sm"
            variant="default"
            className="gap-1"
            onClick={() => {
              window.open(item.link, "_blank");
              onMarkViewed?.(item.id);
            }}
          >
            View Deal
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
