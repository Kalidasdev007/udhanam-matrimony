import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  phone_number: string | null;
  created_at: string;
}

export default function AdminCustomers() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
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
      fetchProfiles();
    }
  }, [user, isAdmin]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Customers</h1>
          <p className="mt-2 text-muted-foreground">
            View all registered customers and their profiles.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Customers ({profiles.length})
            </CardTitle>
            <CardDescription>Customer profiles with their details.</CardDescription>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No customers registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">
                          {profile.full_name || "Not provided"}
                        </TableCell>
                        <TableCell>{profile.age || "-"}</TableCell>
                        <TableCell className="capitalize">{profile.gender || "-"}</TableCell>
                        <TableCell>{profile.phone_number || "-"}</TableCell>
                        <TableCell>
                          {format(new Date(profile.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
