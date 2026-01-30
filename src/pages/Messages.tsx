import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  booking_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  astrologer: {
    name: string;
  };
}

export default function Messages() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const selectedBookingId = searchParams.get("booking");
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeBooking, setActiveBooking] = useState<string | null>(selectedBookingId);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (activeBooking) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [activeBooking]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          astrologer:astrologers(name)
        `)
        .eq("user_id", user?.id)
        .in("status", ["confirmed", "completed"]);

      if (error) throw error;
      setBookings(data as unknown as Booking[]);
      
      if (!activeBooking && data && data.length > 0) {
        setActiveBooking(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeBooking) return;
    
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", activeBooking)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${activeBooking}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${activeBooking}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeBooking) return;

    setSending(true);

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user?.id,
        booking_id: activeBooking,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (authLoading || loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto flex h-[calc(100vh-4rem)] flex-col px-4 py-4 md:flex-row md:gap-4">
        {/* Bookings List */}
        <div className="mb-4 w-full md:mb-0 md:w-64 lg:w-80">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bookings.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No active conversations. Book a consultation first.
                </p>
              ) : (
                bookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setActiveBooking(booking.id)}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      activeBooking === booking.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        activeBooking === booking.id ? "bg-primary-foreground/20" : "bg-gradient-gold"
                      }`}>
                        <MessageCircle className={`h-5 w-5 ${
                          activeBooking === booking.id ? "text-primary-foreground" : "text-primary-foreground"
                        }`} />
                      </div>
                      <span className="font-medium">{booking.astrologer.name}</span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          {activeBooking ? (
            <>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg">
                  {bookings.find((b) => b.id === activeBooking)?.astrologer.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_id === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            message.sender_id === user?.id
                              ? "bg-gradient-gold text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`mt-1 text-xs ${
                            message.sender_id === user?.id 
                              ? "text-primary-foreground/70" 
                              : "text-muted-foreground"
                          }`}>
                            {format(new Date(message.created_at), "p")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </CardContent>

              <div className="border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" variant="gold" disabled={sending || !newMessage.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
