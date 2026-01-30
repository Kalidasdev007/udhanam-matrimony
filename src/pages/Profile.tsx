import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface Profile {
  full_name: string | null;
  age: number | null;
  gender: string | null;
  religion: string | null;
  caste: string | null;
  education: string | null;
  profession: string | null;
  phone_number: string | null;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    age: null,
    gender: null,
    religion: "",
    caste: "",
    education: "",
    profession: "",
    phone_number: "",
    birth_date: "",
    birth_time: "",
    birth_place: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      if (data) {
        setProfile({
          full_name: data.full_name || "",
          age: data.age,
          gender: data.gender,
          religion: data.religion || "",
          caste: data.caste || "",
          education: data.education || "",
          profession: data.profession || "",
          phone_number: data.phone_number || "",
          birth_date: data.birth_date || "",
          birth_time: data.birth_time || "",
          birth_place: data.birth_place || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name || null,
          age: profile.age,
          gender: profile.gender,
          religion: profile.religion || null,
          caste: profile.caste || null,
          education: profile.education || null,
          profession: profile.profession || null,
          phone_number: profile.phone_number || null,
          birth_date: profile.birth_date || null,
          birth_time: profile.birth_time || null,
          birth_place: profile.birth_place || null,
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
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
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Complete your profile for better matchmaking and astrology readings.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic details</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="mt-1.5"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                    className="mt-1.5"
                    placeholder="Your age"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="religion">Religion</Label>
                  <Input
                    id="religion"
                    value={profile.religion || ""}
                    onChange={(e) => setProfile({ ...profile, religion: e.target.value })}
                    className="mt-1.5"
                    placeholder="Your religion"
                  />
                </div>

                <div>
                  <Label htmlFor="caste">Caste</Label>
                  <Input
                    id="caste"
                    value={profile.caste || ""}
                    onChange={(e) => setProfile({ ...profile, caste: e.target.value })}
                    className="mt-1.5"
                    placeholder="Your caste"
                  />
                </div>

                <div>
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    value={profile.education || ""}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    className="mt-1.5"
                    placeholder="Your education"
                  />
                </div>

                <div>
                  <Label htmlFor="profession">Profession</Label>
                  <Input
                    id="profession"
                    value={profile.profession || ""}
                    onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                    className="mt-1.5"
                    placeholder="Your profession"
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={profile.phone_number || ""}
                    onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                    className="mt-1.5"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Birth Details */}
            <Card>
              <CardHeader>
                <CardTitle>Birth Details</CardTitle>
                <CardDescription>Required for accurate astrological readings</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="birth_date">Birth Date</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={profile.birth_date || ""}
                    onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_time">Birth Time</Label>
                  <Input
                    id="birth_time"
                    type="time"
                    value={profile.birth_time || ""}
                    onChange={(e) => setProfile({ ...profile, birth_time: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="birth_place">Birth Place</Label>
                  <Input
                    id="birth_place"
                    value={profile.birth_place || ""}
                    onChange={(e) => setProfile({ ...profile, birth_place: e.target.value })}
                    className="mt-1.5"
                    placeholder="City, State"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" variant="gold" size="lg" disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Profile
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
