import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CollectorDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    supabase
      .from("bookings")
      .select("*, labs(lab_name), profiles!bookings_patient_id_fkey(full_name, address, phone)")
      .eq("collector_id", user.id)
      .order("booking_date", { ascending: true })
      .then(({ data }) => {
        setBookings(data || []);
        setLoading(false);
      });
  }, [user]);

  const markCollected = async (id: string) => {
    const { error } = await supabase.from("bookings").update({ status: "sample_collected" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "sample_collected" } : b)));
      toast({ title: "Marked as collected" });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Collector Dashboard</h1>
        <p className="text-muted-foreground">Your assigned sample pickups</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><MapPin className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning"><Clock className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "collector_assigned").length}</p>
              <p className="text-sm text-muted-foreground">Pending Pickup</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><CheckCircle className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "sample_collected").length}</p>
              <p className="text-sm text-muted-foreground">Collected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display">Pickups</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : bookings.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No pickups assigned yet</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{b.test_type} — {b.labs?.lab_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Patient: {b.profiles?.full_name} · {b.profiles?.address || "No address"} · {new Date(b.booking_date).toLocaleDateString()} {b.booking_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {b.status === "collector_assigned" && (
                      <Button size="sm" variant="secondary" onClick={() => markCollected(b.id)}>
                        Mark Collected
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
