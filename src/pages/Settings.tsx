import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Bell, MessageCircle, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [telegramConnected, setTelegramConnected] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile(data as Profile);
      setFullName(data.full_name || "");
      setTelegramUsername(data.telegram_username || "");
      setTelegramConnected(data.telegram_connected || false);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        telegram_username: telegramUsername,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } else {
      toast.success("Settings saved successfully");
    }
  };

  const handleConnectTelegram = () => {
    // Placeholder for Telegram bot connection
    toast.info("Telegram integration coming soon! You'll be able to receive instant deal alerts.");
  };

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout>
      <div className="container py-8 page-transition">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-3xl font-semibold mb-2">Settings</h1>
          <p className="text-muted-foreground mb-8">
            Manage your account and notification preferences
          </p>

          {/* Profile Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>
                Your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Telegram Integration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Telegram Alerts
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Get instant notifications when we find deals matching your hunts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Username</Label>
                <Input
                  id="telegram"
                  type="text"
                  placeholder="@yourusername"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Connect to Telegram</p>
                    <p className="text-sm text-muted-foreground">
                      {telegramConnected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={telegramConnected ? "secondary" : "default"}
                  onClick={handleConnectTelegram}
                >
                  {telegramConnected ? "Reconnect" : "Connect"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive deal alerts via email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Summary of all deals found this week
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Drop Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when a matched item drops in price
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
