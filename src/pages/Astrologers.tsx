import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Star, Calendar, Phone } from "lucide-react";

interface Astrologer {
  id: string;
  name: string;
  experience: number;
  specialization: string;
  phone_number: string;
}

export default function Astrologers() {
  const { user } = useAuth();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAstrologers();
  }, []);

  const fetchAstrologers = async () => {
    try {
      const { data, error } = await supabase
        .from("astrologers")
        .select("*")
        .eq("is_active", true)
        .order("experience", { ascending: false });

      if (error) throw error;
      setAstrologers(data || []);
    } catch (error) {
      console.error("Error fetching astrologers:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Our Expert Astrologers
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Connect with experienced Vedic astrologers who can guide you on marriage 
            compatibility, muhurat selection, and more.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading astrologers...</div>
          </div>
        ) : astrologers.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
            <Star className="mb-4 h-16 w-16 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold text-foreground">No Astrologers Available</h2>
            <p className="mt-2 text-muted-foreground">
              Please check back later. Our team is working on adding expert astrologers.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {astrologers.map((astrologer) => (
              <Card key={astrologer.id} className="overflow-hidden transition-all hover:shadow-gold hover:border-primary/20">
                <CardHeader className="bg-gradient-gold pb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
                    <Star className="h-10 w-10" />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <CardTitle className="text-xl">{astrologer.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {astrologer.specialization}
                  </CardDescription>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-primary" />
                    <span>{astrologer.experience} years experience</span>
                  </div>

                  <div className="mt-6 flex gap-2">
                    {user ? (
                      <Button variant="gold" className="flex-1" asChild>
                        <Link to={`/book/${astrologer.id}`}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Now
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="gold" className="flex-1" asChild>
                        <Link to="/auth?mode=signup">
                          Sign Up to Book
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
