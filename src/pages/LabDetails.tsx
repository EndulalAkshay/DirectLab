import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, ShieldCheck, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LabDetails() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lab, setLab] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testType, setTestType] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("09:00");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("labs").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setLab(data);
      setLoading(false);
    });
  }, [id]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      patient_id: user.id,
      lab_id: id,
      test_type: testType,
      booking_date: bookingDate,
      booking_time: bookingTime,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking created!", description: "The lab will confirm your booking shortly." });
      navigate("/dashboard");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="container mx-auto p-6"><p className="text-muted-foreground">Loading...</p></div>;
  if (!lab) return <div className="container mx-auto p-6"><p className="text-muted-foreground">Lab not found</p></div>;

  const priceList = Array.isArray(lab.price_list) ? lab.price_list : [];

  return (
    <div className="container mx-auto p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lab info */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{lab.lab_name}</h1>
                  <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{lab.city}{lab.location ? ` · ${lab.location}` : ""}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-lg font-semibold text-warning">
                  <Star className="h-5 w-5 fill-current" />
                  {lab.rating || "N/A"}
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {lab.is_nabl_certified && (
                  <Badge className="bg-success text-success-foreground gap-1"><ShieldCheck className="h-3 w-3" /> NABL Certified</Badge>
                )}
                {(lab.certifications || []).map((c: string) => (
                  <Badge key={c} variant="outline">{c}</Badge>
                ))}
              </div>

              <p className="text-muted-foreground">{lab.description || "No description available."}</p>

              {priceList.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Price List</h3>
                  <div className="space-y-2">
                    {priceList.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between rounded-lg bg-muted/50 px-4 py-2">
                        <span className="text-foreground">{item.test}</span>
                        <span className="font-semibold text-foreground">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking form */}
        {role === "patient" && (
          <div>
            <Card className="shadow-elevated sticky top-20">
              <CardHeader>
                <CardTitle className="font-display">Book a Test</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBook} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Test Type</Label>
                    <Input placeholder="e.g. Complete Blood Count" value={testType} onChange={(e) => setTestType(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Date</Label>
                    <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} min={new Date().toISOString().split("T")[0]} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Clock className="h-4 w-4" /> Time</Label>
                    <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Booking..." : "Book Home Collection"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
