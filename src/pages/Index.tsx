import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Star, Users, Calendar, MessageCircle, Heart, Shield } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Expert Astrologers",
    description: "Consult with experienced Vedic astrologers for marriage compatibility analysis.",
  },
  {
    icon: Calendar,
    title: "Easy Booking",
    description: "Book consultation sessions at your preferred date and time.",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with astrologers and get personalized guidance.",
  },
  {
    icon: Heart,
    title: "Match Compatibility",
    description: "Get detailed Kundali matching and compatibility reports.",
  },
  {
    icon: Star,
    title: "Auspicious Dates",
    description: "Find the most favorable muhurat for your special occasions.",
  },
  {
    icon: Shield,
    title: "Privacy Protected",
    description: "Your personal information is kept secure and confidential.",
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pattern-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by 10,000+ Families</span>
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Find Your Perfect Match with{" "}
              <span className="text-gradient-gold">Vedic Astrology</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Udhanam Matrimony combines traditional matchmaking wisdom with expert astrological 
              consultations to help you find your ideal life partner.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="gold" size="xl" asChild>
                <Link to="/auth?mode=signup">Create Free Profile</Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/astrologers">View Astrologers</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-72 w-72 rounded-full bg-secondary/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Why Choose Udhanam?
            </h2>
            <p className="mt-4 text-muted-foreground">
              We offer comprehensive astrology and matrimony services to help you make 
              the right decisions for your future.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-gold hover:border-primary/20"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-gold">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-burgundy p-10 md:p-16">
            <div className="relative z-10 mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-secondary-foreground md:text-4xl">
                Ready to Find Your Match?
              </h2>
              <p className="mt-4 text-secondary-foreground/80">
                Create your profile today and connect with experienced astrologers 
                who can guide you on your journey to finding the perfect life partner.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button 
                  variant="default" 
                  size="lg" 
                  asChild 
                  className="bg-background text-foreground hover:bg-background/90"
                >
                  <Link to="/auth?mode=signup">Get Started Free</Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  asChild
                  className="text-secondary-foreground hover:bg-secondary-foreground/10"
                >
                  <Link to="/astrologers">Browse Astrologers</Link>
                </Button>
              </div>
            </div>
            
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary-foreground/5" />
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-secondary-foreground/5" />
          </div>
        </div>
      </section>
    </Layout>
  );
}
