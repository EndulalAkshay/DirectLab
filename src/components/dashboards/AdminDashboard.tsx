import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FlaskConical, Calendar, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [labs, setLabs] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, bookings: 0, labs: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const [labsRes, bookingsRes, profilesRes] = await Promise.all([
        supabase.from("labs").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setLabs(labsRes.data || []);
      setStats({
        users: profilesRes.count || 0,
        bookings: bookingsRes.count || 0,
        labs: (labsRes.data || []).length,
      });
      setLoading(false);
    };
    fetch();
  }, []);

  const approveLab = async (labId: string) => {
    const { error } = await supabase.from("labs").update({ is_approved: true }).eq("id", labId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setLabs((prev) => prev.map((l) => (l.id === labId ? { ...l, is_approved: true } : l)));
      toast({ title: "Lab approved" });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the platform</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.users}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary"><FlaskConical className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.labs}</p>
              <p className="text-sm text-muted-foreground">Labs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info"><Calendar className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.bookings}</p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display">Labs</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : labs.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No labs registered yet</p>
          ) : (
            <div className="space-y-3">
              {labs.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{l.lab_name}</p>
                      {l.is_nabl_certified && <Badge variant="outline" className="bg-success/10 text-success border-success/20">NABL</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{l.city} · Rating: {l.rating}/5</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {l.is_approved ? (
                      <Badge className="bg-success text-success-foreground gap-1"><ShieldCheck className="h-3 w-3" /> Approved</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => approveLab(l.id)}>Approve</Button>
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
