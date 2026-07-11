import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { MessageCircle, Clock } from "lucide-react";
import { subjects, Subject } from "@/data/subjects";

interface RecentItem {
  subject_id: string;
  subject_name: string;
  content: string;
  created_at: string;
}

interface Props {
  limit?: number;
  onOpen?: (subject: Subject) => void;
  emptyLabel?: string;
}

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const RecentChats = ({ limit = 5, onOpen, emptyLabel = "No previous chats yet." }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<RecentItem[] | null>(null);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    (async () => {
      const { data } = await supabase
        .from("chat_messages" as any)
        .select("subject_id, subject_name, content, created_at")
        .eq("user_id", user.id)
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(limit);
      setItems((data as any) || []);
    })();
  }, [user, limit]);

  if (!user || items === null) return null;

  return (
    <div className="rounded-2xl bg-card border border-border card-shadow p-4">
      <h2 className="font-heading text-sm font-bold flex items-center gap-2 text-card-foreground">
        <Clock className="h-4 w-4 text-primary" /> Recent chats
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground mt-2">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((it, i) => {
            const subject = subjects.find((s) => s.id === it.subject_id);
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => subject && onOpen?.(subject)}
                  className="w-full text-left rounded-xl border border-border hover:bg-muted transition p-3"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-primary" />
                      {it.subject_name}
                    </span>
                    <span>{timeAgo(it.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-card-foreground line-clamp-2">{it.content}</p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentChats;
