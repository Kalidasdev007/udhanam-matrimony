import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Star, Loader2, ArrowLeft } from "lucide-react";
import { format, addDays } from "date-fns";

interface Astrologer {
  id: string;
  name: string;
  experience: number;
  specialization: string;
  phone_number: string;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function BookAstrologer() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [astrologer, setAstrologer] = useState<Astrologer | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      fetchAstrologer();
    }
  }, [id]);

  const fetchAstrologer = async () => {
    try {
      const { data, error } = await supabase
        .from("astrologers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAstrologer(data);
    } catch (error) {
      console.error("Error fetching astrologer:", error);
      toast({
        title: "Error",
        description: "Astrologer not found.",
        variant: "destructive",
      });
      navigate("/astrologers");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selection Required",
        description: "Please select both date and time.",
        variant: "destructive",
      });
      return;
    }

    setBooking(true);

    try {
      const { error } = await supabase.from("bookings").insert({
        user_id: user?.id,
        astrologer_id: id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Booking Confirmed!",
        description: "Your consultation has been booked successfully.",
      });
      navigate("/bookings");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  // Generate next 14 days for booking
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1);
    return {
      value: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE, MMM d"),
    };
  });

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!astrologer) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/astrologers")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Astrologers
        </Button>

        <Card>
          <CardHeader className="bg-gradient-gold text-primary-foreground">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/10">
                <Star className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">{astrologer.name}</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {astrologer.specialization} • {astrologer.experience} years experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label className="text-base font-medium">Select Date</Label>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      type="button"
                      onClick={() => setSelectedDate(date.value)}
                      className={`rounded-lg border p-3 text-sm transition-all ${
                        selectedDate === date.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {date.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <Label className="text-base font-medium">Select Time</Label>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`rounded-lg border p-3 text-sm transition-all ${
                        selectedTime === time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-medium text-foreground">Booking Summary</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")} at {selectedTime}
                  </p>
                </div>
              )}

              <Button
                variant="gold"
                size="lg"
                className="w-full"
                onClick={handleBooking}
                disabled={booking || !selectedDate || !selectedTime}
              >
                {booking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="mr-2 h-4 w-4" />
                )}
                Confirm Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
