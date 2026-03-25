import { motion } from "framer-motion";
import { Brain, Map, MessageCircle, DollarSign, Hotel, Bus } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Brain, title: "AI Trip Planner", desc: "Get personalized itineraries powered by AI", link: "/trip-planner", color: "bg-primary/10 text-primary" },
  { icon: MessageCircle, title: "Travel Chatbot", desc: "Ask anything about your travel plans", link: "/chatbot", color: "bg-accent/10 text-accent" },
  { icon: Map, title: "Explore Places", desc: "Discover hidden gems worldwide", link: "/explore", color: "bg-secondary text-secondary-foreground" },
  { icon: DollarSign, title: "Expense Tracker", desc: "Budget your trips smartly", link: "/expenses", color: "bg-primary/10 text-primary" },
  { icon: Hotel, title: "Hotel Finder", desc: "Compare and book the best stays", link: "/hotels", color: "bg-accent/10 text-accent" },
  { icon: Bus, title: "Transport Info", desc: "Estimate costs between destinations", link: "/transport", color: "bg-secondary text-secondary-foreground" },
];

const FeaturesSection = () => (
  <section className="py-20 bg-muted/50">
    <div className="container mx-auto px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-primary font-medium text-sm uppercase tracking-widest">Features</span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
          Everything You Need
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={f.link}
              className="block p-6 bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
