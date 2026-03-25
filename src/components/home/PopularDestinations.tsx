import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import destTokyo from "@/assets/dest-tokyo.jpg";
import destParis from "@/assets/dest-paris.jpg";
import destMaldives from "@/assets/dest-maldives.jpg";
import destDubai from "@/assets/dest-dubai.jpg";
import destNewYork from "@/assets/dest-newyork.jpg";
import destBali from "@/assets/dest-bali.jpg";

const destinations = [
  { name: "Tokyo", country: "Japan", image: destTokyo, rating: 4.8, price: "From $899" },
  { name: "Paris", country: "France", image: destParis, rating: 4.9, price: "From $750" },
  { name: "Maldives", country: "Indian Ocean", image: destMaldives, rating: 4.9, price: "From $1,200" },
  { name: "Dubai", country: "UAE", image: destDubai, rating: 4.7, price: "From $650" },
  { name: "New York", country: "USA", image: destNewYork, rating: 4.6, price: "From $550" },
  { name: "Bali", country: "Indonesia", image: destBali, rating: 4.8, price: "From $480" },
];

const PopularDestinations = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-primary font-medium text-sm uppercase tracking-widest">Top Picks</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
          Popular Destinations
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Explore the world's most breathtaking locations, handpicked by our AI travel engine.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((dest, i) => (
          <motion.div
            key={dest.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/explore?q=${dest.name}`}
              className="group block rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-elevated transition-shadow duration-300"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-foreground">
                  {dest.price}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-card-foreground">{dest.name}</h3>
                    <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {dest.country}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="w-4 h-4 fill-primary" />
                    <span className="font-medium text-sm">{dest.rating}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PopularDestinations;
