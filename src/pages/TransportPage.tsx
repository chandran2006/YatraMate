import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { MapPin, ArrowRight, Car, Train, Plane, Bus as BusIcon, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RouteResult {
  mode: string;
  duration: string;
  cost: string;
  distance: string;
}

const modeIcons: Record<string, typeof Car> = {
  Flight: Plane,
  Train: Train,
  Bus: BusIcon,
  Car: Car,
};

const TransportPage = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<RouteResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const estimate = async () => {
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("transport-estimate", {
        body: { from, to },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.routes) {
        setResults(data.routes);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Transport error:", e);
      toast({
        title: "Estimation failed",
        description: e instanceof Error ? e.message : "Could not estimate routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">Transport Estimator</h1>
            <p className="text-muted-foreground mb-8">Get AI-powered travel cost and duration estimates between destinations.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl p-6 shadow-card mb-10">
            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-foreground mb-2 block">From</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Origin city" className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body" />
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground hidden md:block shrink-0 mb-3" />
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-foreground mb-2 block">To</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-accent" />
                  <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination city" className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body" />
                </div>
              </div>
              <Button onClick={estimate} disabled={!from.trim() || !to.trim() || loading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full md:w-auto gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Estimating..." : "Estimate"}
              </Button>
            </div>
          </motion.div>

          {results && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                {from} → {to}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.map((r) => {
                  const Icon = modeIcons[r.mode] || Car;
                  return (
                    <div key={r.mode} className="bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-shadow text-center">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-display text-lg font-semibold text-card-foreground mb-3">{r.mode}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {r.duration}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {r.distance}
                        </div>
                        <p className="text-primary font-semibold text-lg mt-2">{r.cost}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TransportPage;
