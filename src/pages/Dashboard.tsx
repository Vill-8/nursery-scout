import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { HuntCard } from "@/components/dashboard/HuntCard";
import { DealCard } from "@/components/dashboard/DealCard";
import { CreateHuntDialog } from "@/components/dashboard/CreateHuntDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Hunt, FoundItem } from "@/types";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);

    // Fetch hunts
    const { data: huntsData, error: huntsError } = await supabase
      .from("hunts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (huntsError) {
      console.error("Error fetching hunts:", huntsError);
    } else {
      setHunts((huntsData || []) as Hunt[]);
    }

    // Fetch found items for user's hunts
    const { data: itemsData, error: itemsError } = await supabase
      .from("found_items")
      .select("*")
      .order("found_at", { ascending: false });

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
    } else {
      setFoundItems((itemsData || []) as FoundItem[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleToggleHunt = async (id: string) => {
    const hunt = hunts.find((h) => h.id === id);
    if (!hunt) return;

    const { error } = await supabase
      .from("hunts")
      .update({ is_active: !hunt.is_active })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update hunt");
    } else {
      toast.success(hunt.is_active ? "Hunt paused" : "Hunt resumed");
      fetchData();
    }
  };

  const handleDeleteHunt = async (id: string) => {
    const { error } = await supabase.from("hunts").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete hunt");
    } else {
      toast.success("Hunt deleted");
      fetchData();
    }
  };

  const handleMarkViewed = async (id: string) => {
    await supabase.from("found_items").update({ is_viewed: true }).eq("id", id);
    fetchData();
  };

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const activeHunts = hunts.filter((h) => h.is_active);
  const newItems = foundItems.filter((i) => !i.is_viewed);

  return (
    <Layout>
      <div className="container py-8 page-transition">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              {activeHunts.length} active hunt{activeHunts.length !== 1 ? "s" : ""} 
              {newItems.length > 0 && ` • ${newItems.length} new match${newItems.length !== 1 ? "es" : ""}`}
            </p>
          </div>
          <CreateHuntDialog onCreated={fetchData} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Hunts */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Active Hunts
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : hunts.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No hunts yet"
                description="Create your first hunt to start finding deals on premium baby gear."
                action={<CreateHuntDialog onCreated={fetchData} />}
              />
            ) : (
              <div className="space-y-4">
                {hunts.map((hunt) => (
                  <HuntCard
                    key={hunt.id}
                    hunt={hunt}
                    matchCount={foundItems.filter((i) => i.hunt_id === hunt.id && !i.is_viewed).length}
                    onToggle={handleToggleHunt}
                    onDelete={handleDeleteHunt}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Latest Matches */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Latest Matches
            </h2>
            
            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : foundItems.length === 0 ? (
              <EmptyState
                icon="✨"
                title="No matches yet"
                description="When we find deals matching your hunts, they'll appear here. Check back soon!"
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                {foundItems.map((item) => (
                  <DealCard
                    key={item.id}
                    item={item}
                    onMarkViewed={handleMarkViewed}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
