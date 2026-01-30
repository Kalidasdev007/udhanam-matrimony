import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface AstrologerData {
  name: string;
  experience: number;
  specialization: string;
  phone_number: string;
  is_active: boolean;
}

export default function AstrologerForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AstrologerData>({
    name: "",
    experience: 0,
    specialization: "",
    phone_number: "",
    is_active: true,
  });

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
    if (isEditing && user && isAdmin) {
      fetchAstrologer();
    }
  }, [id, user, isAdmin]);

  const fetchAstrologer = async () => {
    try {
      const { data: astrologer, error } = await supabase
        .from("astrologers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setData({
        name: astrologer.name,
        experience: astrologer.experience,
        specialization: astrologer.specialization,
        phone_number: astrologer.phone_number,
        is_active: astrologer.is_active,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Astrologer not found.",
        variant: "destructive",
      });
      navigate("/admin/astrologers");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.name || !data.specialization || !data.phone_number) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("astrologers")
          .update(data)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Astrologer updated",
          description: "The astrologer has been updated successfully.",
        });
      } else {
        const { error } = await supabase.from("astrologers").insert(data);

        if (error) throw error;

        toast({
          title: "Astrologer added",
          description: "The astrologer has been added successfully.",
        });
      }

      navigate("/admin/astrologers");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save astrologer.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/admin/astrologers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Astrologers
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Astrologer" : "Add New Astrologer"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update the astrologer's information."
                : "Add a new astrologer to the platform."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="mt-1.5"
                  placeholder="Astrologer's full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="specialization">Specialization *</Label>
                <Input
                  id="specialization"
                  value={data.specialization}
                  onChange={(e) => setData({ ...data, specialization: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., Kundali Matching, Muhurat"
                  required
                />
              </div>

              <div>
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={data.experience}
                  onChange={(e) => setData({ ...data, experience: parseInt(e.target.value) || 0 })}
                  className="mt-1.5"
                  min={0}
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  value={data.phone_number}
                  onChange={(e) => setData({ ...data, phone_number: e.target.value })}
                  className="mt-1.5"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <Label htmlFor="is_active" className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Active astrologers are visible to customers.
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData({ ...data, is_active: checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/admin/astrologers">Cancel</Link>
                </Button>
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? "Update" : "Add"} Astrologer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
