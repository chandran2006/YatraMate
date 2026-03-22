import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Sparkles, Clock, Camera, UtensilsCrossed, Footprints, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Activity {
  time: string;
  title: string;
  description: string;
  type: "travel" | "food" | "sightseeing" | "activity" | "rest";
}

interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

const typeIcons: Record<string, typeof Clock> = {
  travel: MapPin,
  food: UtensilsCrossed,
  sightseeing: Camera,
  activity: Footprints,
  rest: Bed,
};

const TripPlannerPage = () => {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [travelers, setTravelers] = useState("2");
  const [itinerary, setItinerary] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!destination.trim()) return;
    setLoading(true);
    setItinerary(null);

    try {
      const { data, error } = await supabase.functions.invoke("trip-planner", {
        body: { destination, days: parseInt(days), travelers: parseInt(travelers) },
      });

      if (error) throw error;

      if (data?.itinerary) {
        setItinerary(data.itinerary);
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (e) {
      console.error("Trip planner error:", e);
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Could not generate itinerary",
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
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
              AI Trip Planner
            </h1>
            <p className="text-muted-foreground mb-8">Let AI create the perfect itinerary for your next adventure.</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-card mb-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Destination</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Where to?"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Duration</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <select
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-foreground font-body"
                  >
                    {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                      <option key={d} value={d}>{d} {d === 1 ? "day" : "days"}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Travelers</label>
                <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3">
                  <Users className="w-4 h-4 text-primary" />
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-foreground font-body"
                  >
                    {[1, 2, 3, 4, 5, 6].map((t) => (
                      <option key={t} value={t}>{t} {t === 1 ? "person" : "people"}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!destination.trim() || loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "Generating..." : "Generate Itinerary"}
            </Button>
          </motion.div>

          {/* Timeline */}
          {itinerary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Your {destination} Itinerary
              </h2>
              <div className="space-y-8">
                {itinerary.map((day) => (
                  <div key={day.day} className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {day.day}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">Day {day.day}</h3>
                        <p className="text-sm text-muted-foreground">{day.title}</p>
                      </div>
                    </div>
                    <div className="ml-5 border-l-2 border-border pl-8 space-y-4">
                      {day.activities.map((act, j) => {
                        const Icon = typeIcons[act.type] || Clock;
                        return (
                          <motion.div
                            key={j}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: j * 0.1 }}
                            className="relative bg-card rounded-xl p-4 shadow-card"
                          >
                            <div className="absolute -left-[2.55rem] top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground">{act.time}</span>
                                <h4 className="font-semibold text-card-foreground">{act.title}</h4>
                                <p className="text-sm text-muted-foreground">{act.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TripPlannerPage;
