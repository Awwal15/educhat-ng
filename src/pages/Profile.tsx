import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Trophy, MessageCircle, LogOut, BookOpen } from "lucide-react";
import RecentChats from "@/components/RecentChats";


interface Stats {
  quizCount: number;
  avgScore: number;
  chatCount: number;
  streak: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<Stats>({ quizCount: 0, avgScore: 0, chatCount: 0, streak: 0 });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth", { replace: true }); return; }

    (async () => {
      const { data: prof } = await supabase.from("profiles" as any).select("*").eq("id", user.id).maybeSingle();
      if (!prof) { navigate("/onboarding", { replace: true }); return; }
      setProfile(prof);

      const [{ data: quizzes }, { data: chats }, { data: activity }] = await Promise.all([
        supabase.from("quiz_attempts" as any).select("score,total").eq("user_id", user.id),
        supabase.from("chat_sessions" as any).select("id").eq("user_id", user.id),
        supabase.from("daily_activity" as any).select("activity_date").eq("user_id", user.id).order("activity_date", { ascending: false }).limit(60),
      ]);

      const quizCount = quizzes?.length || 0;
      const avgScore = quizCount
        ? Math.round((quizzes!.reduce((a: number, q: any) => a + (q.score / q.total) * 100, 0)) / quizCount)
        : 0;

      // streak
      let streak = 0;
      if (activity?.length) {
        const days = new Set(activity.map((a: any) => a.activity_date));
        const d = new Date();
        while (days.has(d.toISOString().slice(0, 10))) {
          streak++;
          d.setDate(d.getDate() - 1);
        }
      }

      setStats({ quizCount, avgScore, chatCount: chats?.length || 0, streak });
    })();
  }, [user, loading, navigate]);

  if (loading || !profile) {
    return <div className="min-h-[100dvh] grid place-items-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="gap-1">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="mt-6 rounded-2xl hero-gradient p-6 text-primary-foreground card-shadow">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary-foreground/20 grid place-items-center font-heading text-xl font-bold">
              {profile.full_name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-xl font-extrabold truncate">{profile.full_name}</h1>
              <p className="text-sm text-primary-foreground/80">
                {profile.class_level} • {profile.state}{profile.lga ? `, ${profile.lga}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard icon={Flame} label="Day streak" value={stats.streak} />
          <StatCard icon={Trophy} label="Avg score" value={`${stats.avgScore}%`} />
          <StatCard icon={MessageCircle} label="Chats" value={stats.chatCount} />
          <StatCard icon={BookOpen} label="Quizzes" value={stats.quizCount} />
        </div>

        <Button
          onClick={() => navigate("/subjects")}
          className="w-full mt-6 hero-gradient text-primary-foreground font-semibold py-6 rounded-xl"
        >
          Continue Learning →
        </Button>

        <div className="mt-6">
          <RecentChats
            limit={8}
            emptyLabel="Your past chats will appear here after you start learning."
            onOpen={(s) => navigate("/subjects", { state: { subjectId: s.id } })}
          />
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl bg-card border border-border p-4 card-shadow">
    <div className="flex items-center gap-2 text-muted-foreground text-xs">
      <Icon className="h-4 w-4" /> {label}
    </div>
    <div className="mt-1 font-heading text-2xl font-extrabold text-card-foreground">{value}</div>
  </div>
);

export default Profile;
