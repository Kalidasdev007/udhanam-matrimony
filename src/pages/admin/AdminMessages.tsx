import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, Loader2, User } from "lucide-react";
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

interface BookingConversation {
  id: string;
  customer_name: string | null;
  customer_id: string;
  astrologer_name: string;
}

export default function AdminMessages() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<BookingConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<BookingConversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin-login");
      } else if (!isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchConversations();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          id,
          user_id,
          astrologer:astrologers(name)
        `)
        .in("status", ["confirmed", "completed"]);

      if (error) throw error;

      const conversationsWithProfiles = await Promise.all(
        (bookings || []).map(async (booking) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", booking.user_id)
            .single();

          return {
            id: booking.id,
            customer_name: profile?.full_name || "Unknown Customer",
            customer_id: booking.user_id,
            astrologer_name: (booking.astrologer as any).name,
          };
        })
      );

      setConversations(conversationsWithProfiles);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeConversation) return;

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("booking_id", activeConversation.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = () => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`admin-messages-${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `booking_id=eq.${activeConversation.id}`,
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
    if (!newMessage.trim() || !activeConversation) return;

    setSending(true);

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user?.id,
        receiver_id: activeConversation.customer_id,
        booking_id: activeConversation.id,
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
        {/* Conversations List */}
        <div className="mb-4 w-full md:mb-0 md:w-72 lg:w-80">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Customer Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {conversations.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No conversations yet.
                </p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      activeConversation?.id === conv.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        activeConversation?.id === conv.id ? "bg-primary-foreground/20" : "bg-gradient-gold"
                      }`}>
                        <User className={`h-5 w-5 ${
                          activeConversation?.id === conv.id ? "text-primary-foreground" : "text-primary-foreground"
                        }`} />
                      </div>
                      <div>
                        <span className="block font-medium">{conv.customer_name}</span>
                        <span className={`text-xs ${
                          activeConversation?.id === conv.id ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                          with {conv.astrologer_name}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          {activeConversation ? (
            <>
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg">
                  {activeConversation.customer_name}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (with {activeConversation.astrologer_name})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      No messages in this conversation yet.
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
                              ? "bg-gradient-burgundy text-secondary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className={`mt-1 text-xs ${
                            message.sender_id === user?.id
                              ? "text-secondary-foreground/70"
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
                    placeholder="Reply to customer..."
                    className="flex-1"
                  />
                  <Button type="submit" variant="burgundy" disabled={sending || !newMessage.trim()}>
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
                  Select a conversation to view and reply
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
