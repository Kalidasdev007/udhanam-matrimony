import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MessageCircle, User, History, Star, Phone } from "lucide-react";
import { format } from "date-fns";

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  astrologer: {
    name: string;
    phone_number: string;
    specialization: string;
  };
}

export default function Dashboard() {
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
          astrologer:astrologers(name, phone_number, specialization)
        `)
        .eq("user_id", user?.id)
        .order("booking_date", { ascending: false })
        .limit(5);

      if (error) throw error;
      setBookings(data as unknown as Booking[]);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
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
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Manage your profile and bookings.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-gold hover:border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">My Profile</CardTitle>
              <CardDescription>View and edit your details</CardDescription>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link to="/profile">Edit Profile →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-gold hover:border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
                <Star className="h-5 w-5 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Astrologers</CardTitle>
              <CardDescription>Browse expert astrologers</CardDescription>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link to="/astrologers">View All →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-gold hover:border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Book Session</CardTitle>
              <CardDescription>Schedule a consultation</CardDescription>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link to="/astrologers">Book Now →</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-gold hover:border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
                <MessageCircle className="h-5 w-5 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg">Messages</CardTitle>
              <CardDescription>Chat with astrologers</CardDescription>
              <Button variant="link" className="mt-2 h-auto p-0" asChild>
                <Link to="/messages">View Messages →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recent Bookings
              </CardTitle>
              <CardDescription>Your upcoming and past consultations</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No bookings yet.</p>
                <Button variant="gold" className="mt-4" asChild>
                  <Link to="/astrologers">Book Your First Session</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{booking.astrologer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.astrologer.specialization}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {format(new Date(booking.booking_date), "PPP")} at {booking.booking_time}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                      {(booking.status === "confirmed" || booking.status === "completed") && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${booking.astrologer.phone_number}`}>
                            <Phone className="mr-1.5 h-4 w-4" />
                            Call Now
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
