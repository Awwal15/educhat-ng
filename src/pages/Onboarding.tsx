import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
  "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano",
  "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo",
  "Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is too short").max(100),
  state: z.string().min(1, "Select your state"),
  lga: z.string().trim().max(100).optional(),
  class_level: z.enum(["SS1", "SS2", "SS3"]),
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [classLevel, setClassLevel] = useState<"SS1"|"SS2"|"SS3">("SS2");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }
    supabase.from("profiles" as any).select("*").eq("id", user.id).maybeSingle().then(({ data }: any) => {
      if (data) {
        setFullName(data.full_name || (user.user_metadata as any)?.full_name || "");
        setState(data.state || "");
        setLga(data.lga || "");
        setClassLevel((data.class_level as any) || "SS2");
      } else {
        setFullName(((user.user_metadata as any)?.full_name) || "");
      }
    });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ full_name: fullName, state, lga, class_level: classLevel });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setBusy(true);
    const { error } = await supabase.from("profiles" as any).upsert({
      id: user.id,
      ...parsed.data,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved!");
    navigate("/profile", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="container max-w-md mx-auto px-4 py-8">
        <h1 className="font-heading text-2xl font-extrabold">Tell us about you</h1>
        <p className="text-sm text-muted-foreground mt-1">This helps us tailor lessons to your class.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-2xl bg-card border border-border p-5 card-shadow">
          <div>
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Aisha Bello" maxLength={100} />
          </div>
          <div>
            <Label>State</Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {NG_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>LGA (optional)</Label>
            <Input value={lga} onChange={(e) => setLga(e.target.value)} placeholder="Local Government Area" maxLength={100} />
          </div>
          <div>
            <Label>Class</Label>
            <Select value={classLevel} onValueChange={(v) => setClassLevel(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SS1">SS1</SelectItem>
                <SelectItem value="SS2">SS2</SelectItem>
                <SelectItem value="SS3">SS3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full hero-gradient text-primary-foreground font-semibold" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
