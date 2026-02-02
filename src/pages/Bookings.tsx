import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Phone, MessageCircle, Star } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  created_at: string;
  astrologer: {
    id: string;
    name: string;
    phone_number: string;
    specialization: string;
  };
}

export default function Bookings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          created_at,
          astrologer:astrologers(id, name, phone_number, specialization)
        `)
        .eq("user_id", user?.id)
        .order("booking_date", { ascending: false });

      if (error) throw error;
      setBookings(data as unknown as Booking[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="mt-2 text-muted-foreground">
              View and manage your astrology consultation bookings.
            </p>
          </div>
          <Button variant="gold" asChild>
            <Link to="/astrologers">
              <Calendar className="mr-2 h-4 w-4" />
              New Booking
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold text-foreground">No Bookings Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Book your first consultation with an expert astrologer.
              </p>
              <Button variant="gold" className="mt-6" asChild>
                <Link to="/astrologers">Browse Astrologers</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold">
                          <Star className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {booking.astrologer.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {booking.astrologer.specialization}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.booking_date), "PPP")}
                      </div>
                      <div>at {booking.booking_time}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t border-border bg-muted/30 p-4 md:border-l md:border-t-0">
                    {booking.status === "confirmed" && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`tel:${booking.astrologer.phone_number}`}>
                          <Phone className="mr-1.5 h-4 w-4" />
                          Call Now
                        </a>
                      </Button>
                    )}
                    {(booking.status === "confirmed" || booking.status === "completed") && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/messages?booking=${booking.id}`}>
                          <MessageCircle className="mr-1.5 h-4 w-4" />
                          Chat
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
