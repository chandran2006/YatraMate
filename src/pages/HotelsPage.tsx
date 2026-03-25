import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Hotel, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const amenityIcons: Record<string, typeof Wifi> = { wifi: Wifi, parking: Car, breakfast: Coffee, gym: Dumbbell };

const HotelsPage = () => {
  const [city, setCity] = useState("All");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      const { data } = await supabase
        .from("hotels")
        .select("*")
        .order("rating", { ascending: false });
      if (data) {
        setHotels(data);
        const uniqueCities = [...new Set(data.map((h) => h.city))];
        setCities(["All", ...uniqueCities]);
      }
      setLoading(false);
    };
    fetchHotels();
  }, []);

  const filtered = hotels.filter(
    (h) => (city === "All" || h.city === city) && h.price_per_night <= maxPrice && (h.rating ?? 0) >= minRating
  );

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">Hotels</h1>
            <p className="text-muted-foreground mb-8">Find and compare the best hotels by city, price, and rating.</p>
          </motion.div>

          {/* Filters */}
          <div className="bg-card rounded-2xl p-6 shadow-card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground font-body outline-none">
                  {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Max Price: ₹{maxPrice}/night</label>
                <input type="range" min={500} max={50000} step={500} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Min Rating: {minRating}★</label>
                <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(+e.target.value)} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((hotel, i) => (
                  <motion.div key={hotel.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow flex flex-col md:flex-row">
                    <div className="md:w-64 h-48 md:h-auto overflow-hidden shrink-0 bg-muted">
                      {hotel.image_url ? (
                        <img src={hotel.image_url} alt={hotel.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Hotel className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-xl font-semibold text-card-foreground">{hotel.name}</h3>
                          <div className="flex items-center gap-1 text-primary text-sm">
                            <Star className="w-4 h-4 fill-primary" />
                            {hotel.rating ?? "N/A"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                          <MapPin className="w-3.5 h-3.5" />
                          {hotel.city}, {hotel.country}
                        </div>
                        <div className="flex gap-2 flex-wrap mb-4">
                          {(hotel.amenities ?? []).map((a: string) => {
                            const Icon = amenityIcons[a.toLowerCase()];
                            return (
                              <Badge key={a} variant="secondary" className="gap-1 capitalize">
                                {Icon && <Icon className="w-3 h-3" />}
                                {a}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-display text-2xl font-bold text-foreground">₹{hotel.price_per_night}</span>
                          <span className="text-sm text-muted-foreground">/night</span>
                        </div>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Book Now</Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && <p className="text-center text-muted-foreground py-12">No hotels found matching your filters.</p>}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HotelsPage;
