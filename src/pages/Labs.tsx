import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, ArrowRight, ShieldCheck } from "lucide-react";

export default function Labs() {
  const [labs, setLabs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("labs")
      .select("*")
      .eq("is_approved", true)
      .order("rating", { ascending: false })
      .then(({ data }) => {
        setLabs(data || []);
        setLoading(false);
      });
  }, []);

  const cities = [...new Set(labs.map((l) => l.city).filter(Boolean))];

  const filtered = labs.filter((l) => {
    const matchSearch = l.lab_name.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase());
    const matchCity = cityFilter === "all" || l.city === cityFilter;
    return matchSearch && matchCity;
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Find a Lab</h1>
        <p className="text-muted-foreground">Browse certified diagnostic laboratories near you</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search labs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <p className="text-muted-foreground">Loading labs...</p>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No labs found. Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lab) => (
            <Card key={lab.id} className="shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">{lab.lab_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {lab.city || "Unknown"}{lab.location ? ` · ${lab.location}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-warning">
                    <Star className="h-4 w-4 fill-current" />
                    {lab.rating || "N/A"}
                  </div>
                </div>
                <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{lab.description || "No description available"}</p>
                <div className="mb-4 flex flex-wrap gap-1">
                  {lab.is_nabl_certified && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1 text-xs">
                      <ShieldCheck className="h-3 w-3" /> NABL
                    </Badge>
                  )}
                  {(lab.certifications || []).map((c: string) => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
                <Link to={`/labs/${lab.id}`}>
                  <Button variant="secondary" size="sm" className="w-full gap-2">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
