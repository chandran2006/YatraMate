import { Link } from "react-router-dom";
import { Plane } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background py-16">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">YatraMate</span>
          </div>
          <p className="text-sm opacity-70">AI-powered travel planning platform. Discover, plan, and explore the world smarter.</p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Explore</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/explore" className="block hover:opacity-100 transition">Destinations</Link>
            <Link to="/hotels" className="block hover:opacity-100 transition">Hotels</Link>
            <Link to="/transport" className="block hover:opacity-100 transition">Transport</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Tools</h4>
          <div className="space-y-2 text-sm opacity-70">
            <Link to="/trip-planner" className="block hover:opacity-100 transition">Trip Planner</Link>
            <Link to="/chatbot" className="block hover:opacity-100 transition">AI Chatbot</Link>
            <Link to="/expenses" className="block hover:opacity-100 transition">Expenses</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-4">Company</h4>
          <div className="space-y-2 text-sm opacity-70">
            <span className="block">About Us</span>
            <span className="block">Contact</span>
            <span className="block">Privacy Policy</span>
          </div>
        </div>
      </div>
      <div className="border-t border-background/20 pt-8 text-center text-sm opacity-50">
        © 2026 YatraMate. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
