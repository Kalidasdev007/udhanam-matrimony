import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Users, Star, Calendar, MessageCircle, Plus } from "lucide-react";

interface Stats {
  customers: number;
  astrologers: number;
  bookings: number;
  messages: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    customers: 0,
    astrologers: 0,
    bookings: 0,
    messages: 0,
  });
  const [loading, setLoading] = useState(true);

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
      fetchStats();
    }
  }, [user, isAdmin]);

  const fetchStats = async () => {
    try {
      const [customersRes, astrologersRes, bookingsRes, messagesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("astrologers").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        customers: customersRes.count || 0,
        astrologers: astrologersRes.count || 0,
        bookings: bookingsRes.count || 0,
        messages: messagesRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    { title: "Total Customers", value: stats.customers, icon: Users, link: "/admin/customers" },
    { title: "Astrologers", value: stats.astrologers, icon: Star, link: "/admin/astrologers" },
    { title: "Total Bookings", value: stats.bookings, icon: Calendar, link: "/admin/bookings" },
    { title: "Messages", value: stats.messages, icon: MessageCircle, link: "/admin/messages" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your matrimony and astrology platform.
            </p>
          </div>
          <Button variant="gold" asChild>
            <Link to="/admin/astrologers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Astrologer
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card key={index} className="transition-all hover:shadow-gold hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold">
                  <stat.icon className="h-4 w-4 text-primary-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <Button variant="link" className="mt-1 h-auto p-0 text-sm" asChild>
                  <Link to={stat.link}>View details →</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Manage Astrologers</CardTitle>
              <CardDescription>Add, edit, or remove astrologers from the platform.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="gold" asChild>
                  <Link to="/admin/astrologers">View All</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/admin/astrologers/new">Add New</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Messages</CardTitle>
              <CardDescription>View and reply to customer inquiries.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="gold" asChild>
                <Link to="/admin/messages">View Messages</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
