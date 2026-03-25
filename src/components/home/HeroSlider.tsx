import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  { image: hero1, title: "Discover Santorini", subtitle: "Where dreams meet the Aegean Sea" },
  { image: hero2, title: "Explore Bali", subtitle: "Lush terraces and ancient temples await" },
  { image: hero3, title: "Swiss Adventures", subtitle: "Majestic peaks and crystal lakes" },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].image}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/60" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-4 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold text-background mb-4">
              {slides[current].title}
            </h1>
            <p className="text-xl md:text-2xl text-background/80 mb-10 font-light">
              {slides[current].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          onSubmit={handleSearch}
          className="w-full max-w-3xl bg-background/95 backdrop-blur-lg rounded-2xl p-2 shadow-elevated"
        >
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3">
              <MapPin className="w-5 h-5 text-primary shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Where do you want to go?"
                className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-body"
              />
            </div>
            <div className="hidden md:flex items-center gap-3 px-4 py-3 border-l border-border">
              <Calendar className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground text-sm">Any dates</span>
            </div>
            <div className="hidden md:flex items-center gap-3 px-4 py-3 border-l border-border">
              <Users className="w-5 h-5 text-primary shrink-0" />
              <span className="text-muted-foreground text-sm">Guests</span>
            </div>
            <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </motion.form>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-primary" : "w-2 bg-background/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
