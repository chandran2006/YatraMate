import { useState, useEffect } from "react";
<<<<<<< HEAD
import { useSearchParams } from "react-router-dom";
=======
>>>>>>> 982b5b72a728c263c1980821ff84bde55d0b1040
import Layout from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Beach", "City", "Mountain", "Cultural", "Adventure", "attraction"];

type Place = {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  image_url: string | null;
  rating: number | null;
  popularity: number | null;
};

const ExplorePage = () => {
<<<<<<< HEAD
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
=======
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
>>>>>>> 982b5b72a728c263c1980821ff84bde55d0b1040
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const { data, error } = await supabase
        .from("tourist_places")
        .select("id, name, city, country, category, image_url, rating, popularity")
        .order("popularity", { ascending: false });
      if (data) setPlaces(data);
      setLoading(false);
    };
    fetchPlaces();
  }, []);

<<<<<<< HEAD
  const query = searchQuery.toLowerCase();
  const filtered = places.filter(
    (p) =>
      (activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase()) &&
      (p.name.toLowerCase().includes(query) || p.city.toLowerCase().includes(query) || p.country.toLowerCase().includes(query))
=======
  const filtered = places.filter(
    (p) =>
      (activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase()) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
>>>>>>> 982b5b72a728c263c1980821ff84bde55d0b1040
  );

  return (
    <Layout>
      <div className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-2">
              Explore Destinations
            </h1>
            <p className="text-muted-foreground mb-8">Browse tourist places by category, city, or popularity.</p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search places..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground font-body"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full capitalize"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-shadow"
                  >
                    <div className="relative h-56 overflow-hidden bg-muted">
                      {place.image_url ? (
                        <img src={place.image_url} alt={place.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <MapPin className="w-12 h-12" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground capitalize">{place.category}</Badge>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-semibold text-card-foreground">{place.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          {place.city}, {place.country}
                        </div>
                        <div className="flex items-center gap-1 text-primary text-sm">
                          <Star className="w-4 h-4 fill-primary" />
                          {place.rating ?? "N/A"}
                        </div>
                      </div>
                      {place.popularity != null && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Popularity</span>
                            <span>{place.popularity}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${place.popularity}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No destinations found. Add some from the Admin dashboard!</p>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExplorePage;
