import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star, Phone } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Astrologer {
  id: string;
  name: string;
  experience: number;
  specialization: string;
  phone_number: string;
  is_active: boolean;
}

export default function AdminAstrologers() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
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
      fetchAstrologers();
    }
  }, [user, isAdmin]);

  const fetchAstrologers = async () => {
    try {
      const { data, error } = await supabase
        .from("astrologers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAstrologers(data || []);
    } catch (error) {
      console.error("Error fetching astrologers:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAstrologer = async (id: string) => {
    try {
      const { error } = await supabase.from("astrologers").delete().eq("id", id);

      if (error) throw error;

      setAstrologers((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: "Astrologer deleted",
        description: "The astrologer has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete astrologer.",
        variant: "destructive",
      });
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Manage Astrologers</h1>
            <p className="mt-2 text-muted-foreground">
              Add, edit, or remove astrologers from the platform.
            </p>
          </div>
          <Button variant="gold" asChild>
            <Link to="/admin/astrologers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Astrologer
            </Link>
          </Button>
        </div>

        {astrologers.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Star className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold text-foreground">No Astrologers Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Add your first astrologer to get started.
              </p>
              <Button variant="gold" className="mt-6" asChild>
                <Link to="/admin/astrologers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Astrologer
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {astrologers.map((astrologer) => (
              <Card key={astrologer.id} className="overflow-hidden">
                <div className="bg-gradient-gold p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10">
                    <Star className="h-7 w-7 text-primary-foreground" />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{astrologer.name}</h3>
                      <p className="text-sm text-muted-foreground">{astrologer.specialization}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        astrologer.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {astrologer.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>{astrologer.experience} years experience</p>
                    <p className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {astrologer.phone_number}
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/admin/astrologers/${astrologer.id}/edit`}>
                        <Edit className="mr-1.5 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Astrologer</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {astrologer.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAstrologer(astrologer.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
