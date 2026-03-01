import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { Link } from "react-router-dom";
import { MessageSquare, FlaskConical, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statuses = ["requested", "collector_assigned", "sample_collected", "testing", "report_ready", "cancelled"];

export default function LabDashboard() {
  const { user } = useAuth();
  const [lab, setLab] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: labData } = await supabase.from("labs").select("*").eq("owner_id", user.id).maybeSingle();
      setLab(labData);
      if (labData) {
        const { data: bkgs } = await supabase
          .from("bookings")
          .select("*, profiles!bookings_patient_id_fkey(full_name)")
          .eq("lab_id", labData.id)
          .order("created_at", { ascending: false });
        setBookings(bkgs || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      toast({ title: "Status updated" });
    }
  };

  if (loading) return <div className="container mx-auto p-6"><p className="text-muted-foreground">Loading...</p></div>;

  if (!lab) {
    return (
      <div className="container mx-auto p-6">
        <Card className="shadow-card">
          <CardContent className="py-12 text-center">
            <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-display text-xl font-bold text-foreground">Set Up Your Lab</h2>
            <p className="mb-4 text-muted-foreground">Create your lab profile to start accepting bookings.</p>
            <Link to="/lab/setup"><Button>Create Lab Profile</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{lab.lab_name}</h1>
        <p className="text-muted-foreground">Manage your bookings and patients</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Calendar className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "requested").length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success"><FlaskConical className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{bookings.filter(b => b.status === "testing").length}</p>
              <p className="text-sm text-muted-foreground">Testing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display">Bookings</CardTitle></CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">{b.test_type}</p>
                    <p className="text-sm text-muted-foreground">
                      Patient: {b.profiles?.full_name || "Unknown"} · {new Date(b.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                      <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {statuses.map((s) => (
                          <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Link to={`/chat/${b.id}`}>
                      <Button variant="ghost" size="icon"><MessageSquare className="h-4 w-4" /></Button>
                    </Link>
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
