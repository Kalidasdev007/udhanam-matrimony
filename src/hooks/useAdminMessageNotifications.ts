import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewMessagePayload {
  id: string;
  sender_id: string;
  booking_id: string | null;
  content: string;
  created_at: string;
}

export function useAdminMessageNotifications(
  adminUserId: string | undefined,
  onNewMessage?: (message: NewMessagePayload) => void
) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!adminUserId) return;

    // Create notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleRcDNgABpN/cq3keAzUAAqDf4K5/IQM0AASH5eO5hyQDMwAAe+vnxpAoAzIAAHPv6dCYKwMxAABt8+vXnS4DMAAAaPXs3qExAy8AAGH37uOkNAMuAABb+O/oqDcDLQAAVvnx7Ks6AywAAFH68++tPQMrAABM+/TxrkADKgAASPz19bFDAykAAET9+Pa0RgMoAABA/vn3t0kDJwAAPP/6+bpMAyYAADkA+/u8TwMlAAA2Af38v1IDJAAAMwL9/cFVAyMAADAD/v7EWAMiAAAtBP//xl0DIQAAKgUAAMlgAyABACcGAAHMYwMfAQAkBwABz2YDHgEAIQgAANJpAx0BACMJAAHUbAMcAQIjCgAB120DGwECIwsAAdpwAxoBACMMAAPcchkZAQAjDQAC33UYGAEAIw4AAt91FxcBABgPAALgeRYWAQAYEAAC4HoVFQEAGBEAAtB9FBQBAAYSAALPgBMTAQAGEwAC0YISEgEABhQAAdOEEREBAAYVAAHVhhAPAQAGFgAB14cPDgEABhcAAdmJDg0AAAYYAAHaig0MAAAGGQABGIwMCwAABhoAAReLCwoAAAYbAAEYjQoJAAAGHAABGY4JCAAABh0AARqPCAcAAAYeAQAakgYGAAAGHwEAG5MFBQAABiABAByUBAQAAAYhAQAdlQMDAAAGIgEAHpYCAgAABiMBAB+XAQEAABYkAQAfmAAAABYlAQEgmf8AABYlAQIhl/4AABYlAQMilf0AABYlAQQjk/wAABYlAQUkkvsAABYlAQYlkPoAABYlAQcmj/kAABYlAQgnj/gAABYlAQkoj/cAABYlAQspjvYAABYlAQwqjfUAABYlAQ0rjPQAABYlAQ4sjPMAABQ=");
    
    // Subscribe to all new messages (not from admin)
    const channel = supabase
      .channel("admin-new-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const newMessage = payload.new as NewMessagePayload;
          
          // Only notify if the message is NOT from admin
          if (newMessage.sender_id !== adminUserId) {
            // Play notification sound
            try {
              audioRef.current?.play();
            } catch (e) {
              console.log("Could not play notification sound");
            }

            // Show toast notification
            toast({
              title: "New Message",
              description: `New customer message received`,
            });

            // Callback for additional handling
            onNewMessage?.(newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminUserId, toast, onNewMessage]);
}
