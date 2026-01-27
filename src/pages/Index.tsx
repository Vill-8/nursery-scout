import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Shield, Bell, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";

const features = [
  {
    icon: Search,
    title: "Smart Hunt Matching",
    description: "Set your criteria once and we'll monitor marketplaces 24/7 for the perfect deal.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Every listing is checked against recall databases so you can buy with confidence.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified the moment a matching deal appears, before it's gone.",
  },
];

const brands = ["UPPAbaby", "Nuna", "SNOO", "Stokke"];

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm" />
        <div className="container relative py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Search className="w-4 h-4" />
              Find premium baby gear for less
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight mb-6">
              Hunt for the best{" "}
              <span className="text-gradient">baby gear deals</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Set your preferences, and we'll scan the marketplaces for verified, safe, 
              second-hand baby gear from premium brands—all at a fraction of retail.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="gap-2 px-8">
                  {user ? "Go to Dashboard" : "Start Hunting"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/safety-checker">
                <Button size="lg" variant="outline" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Safety Checker
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Brand Logos */}
      <section className="py-12 border-y bg-card">
        <div className="container">
          <p className="text-center text-sm text-muted-foreground mb-6">
            We track the most trusted baby brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {brands.map((brand) => (
              <span
                key={brand}
                className="font-display text-xl md:text-2xl font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              How Nursery Scout Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the tools every parent needs to shop smarter and safer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium p-6 md:p-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl gradient-sage flex items-center justify-center mx-auto mb-5">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4">
            Ready to find your perfect deal?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join thousands of parents who are saving money on quality baby gear.
          </p>
          <Link to={user ? "/dashboard" : "/auth"}>
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-sage flex items-center justify-center">
                <Search className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">Nursery Scout</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Nursery Scout. Made with 💚 for parents everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
