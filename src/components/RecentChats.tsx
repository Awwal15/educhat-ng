import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { MessageCircle, Clock, Trash2 } from "lucide-react";
import { subjects, Subject } from "@/data/subjects";
import { toast } from "sonner";

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

  const load = async () => {
    if (!user) { setItems([]); return; }
    const { data } = await supabase
      .from("chat_messages" as any)
      .select("subject_id, subject_name, content, created_at")
      .eq("user_id", user.id)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(limit);
    setItems((data as any) || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, limit]);

  const deleteSubjectChats = async (subjectId: string, subjectName: string) => {
    if (!user) return;
    if (!confirm(`Delete all ${subjectName} chat history? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("chat_messages" as any)
      .delete()
      .eq("user_id", user.id)
      .eq("subject_id", subjectId);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success(`${subjectName} chats deleted`);
    load();
  };

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
              <li key={i} className="rounded-xl border border-border hover:bg-muted transition">
                <div className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => subject && onOpen?.(subject)}
                    className="flex-1 text-left p-3"
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
                  <button
                    type="button"
                    onClick={() => deleteSubjectChats(it.subject_id, it.subject_name)}
                    aria-label={`Delete ${it.subject_name} chat history`}
                    className="px-3 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentChats;
