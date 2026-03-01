import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function LabSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    lab_name: "",
    description: "",
    location: "",
    city: "",
    is_nabl_certified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("labs").insert({
      ...form,
      owner_id: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lab created!" });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-lg p-6">
      <Card className="shadow-elevated">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Create Lab Profile</CardTitle>
          <CardDescription>Set up your lab to start receiving bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Lab Name</Label>
              <Input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mumbai" required />
            </div>
            <div className="space-y-2">
              <Label>Address / Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_nabl_certified} onCheckedChange={(v) => setForm({ ...form, is_nabl_certified: v })} />
              <Label>NABL Certified</Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Lab"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
