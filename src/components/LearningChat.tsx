import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2, History, X, MessageSquare, Trash2, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subject } from "@/data/subjects";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";


interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface LearningChatProps {
  subject: Subject;
  onBack: () => void;
  onStartQuiz: (messages: Message[]) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/learn-chat`;

const SCIENCE_SYMBOLS: Record<string, string[]> = {
  Mathematics: ["×", "÷", "±", "√", "π", "²", "³", "½", "≠", "≈", "≤", "≥", "∞", "∑", "∫", "θ", "α", "β", "°", "(", ")", "^"],
  Physics: ["×", "÷", "±", "√", "π", "²", "³", "°", "θ", "λ", "μ", "Ω", "α", "β", "Δ", "→", "≈", "≤", "≥", "^", "·"],
  Chemistry: ["→", "⇌", "↑", "↓", "Δ", "°", "±", "₁", "₂", "₃", "₄", "⁺", "⁻", "²⁺", "³⁺", "·", "≈"],
  Biology: ["×", "→", "°", "±", "μ", "α", "β", "Δ", "≈"],
};

const LearningChat = ({ subject, onBack, onStartQuiz }: LearningChatProps) => {
  const symbols = SCIENCE_SYMBOLS[subject.name];
  const inputRef = useRef<HTMLInputElement>(null);

  const insertSymbol = (sym: string) => {
    const el = inputRef.current;
    if (!el) { setInput((v) => v + sym); return; }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    const next = input.slice(0, start) + sym + input.slice(end);
    setInput(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + sym.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const sampleQuestions: Record<string, string[]> = {
    Mathematics: ["Explain quadratic equations", "How do I solve simultaneous equations?", "What is the formula for compound interest?"],
    "English Language": ["What are the types of clauses?", "Explain the use of reported speech", "How do I write a formal letter?"],
    Physics: ["What is Newton's second law of motion?", "Explain the concept of electromagnetic induction", "How does a transformer work?"],
    Chemistry: ["What is the periodic table?", "Explain the process of electrolysis", "What are the properties of alkanes?"],
    Biology: ["What is photosynthesis?", "Explain mitosis and meiosis", "What are the components of blood?"],
    "Literature in English": ["What are the themes in Wole Soyinka's works?", "Explain the use of irony in prose", "What is a soliloquy in drama?"],
    Geography: ["What are the types of rocks?", "Explain the climate zones of Nigeria", "What causes desertification in the Sahel?"],
    Government: ["How does the Nigerian government work?", "What are the features of federalism?", "Explain the separation of powers"],
    Economics: ["What is the law of demand and supply?", "Explain inflation and its effects on Nigeria", "What are the factors of production?"],
  };

  const questions = sampleQuestions[subject.name] || [
    `What are the key topics in ${subject.name}?`,
    `Explain a basic concept in ${subject.name}`,
    `How is ${subject.name} tested in WAEC?`,
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome! 👋 I'm your ${subject.name} tutor. Ask me anything about ${subject.name} — I'll explain it simply with examples you can relate to as a Nigerian student.\n\nFor example, you can ask:\n- "${questions[0]}"\n- "${questions[1]}"\n- "${questions[2]}"\n\nWhat would you like to learn today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const [tipLoading, setTipLoading] = useState(true);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [tipCollapsed, setTipCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { user } = useAuth();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Load prior chat history for this user + subject
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_messages" as any)
        .select("id, role, content")
        .eq("user_id", user.id)
        .eq("subject_id", subject.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled || !data || data.length === 0) return;
      setMessages((prev) => [
        prev[0],
        ...data.map((m: any) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })),
      ]);
    })();
    return () => { cancelled = true; };
  }, [user, subject.id]);

  // Load (or generate once) the study tip for this subject
  useEffect(() => {
    let cancelled = false;
    setTip(null);
    setTipLoading(true);
    setTipDismissed(false);
    setTipCollapsed(false);
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-study-tip", {
          body: { subjectId: subject.id, subjectName: subject.name },
        });
        if (cancelled) return;
        if (error || !data?.tip) {
          setTipLoading(false);
          return;
        }
        setTip(data.tip);
      } catch {
        // Tip is a nice-to-have; fail silently on poor networks
      } finally {
        if (!cancelled) setTipLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subject.id, subject.name]);


  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    // Prepare chat history (exclude welcome message id, just send role+content)
    const chatHistory = allMessages.map((m) => ({ role: m.role, content: m.content }));

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === "streaming") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { id: "streaming", role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: chatHistory, subject: subject.name }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Network error" }));
        toast.error(err.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Finalize streaming message with a stable id
      setMessages((prev) =>
        prev.map((m) => (m.id === "streaming" ? { ...m, id: Date.now().toString() } : m))
      );

      // Persist the exchange for signed-in users
      if (user && assistantSoFar) {
        supabase.from("chat_messages" as any).insert([
          { user_id: user.id, subject_id: subject.id, subject_name: subject.name, role: "user", content: text },
          { user_id: user.id, subject_id: subject.id, subject_name: subject.name, role: "assistant", content: assistantSoFar },
        ]).then(({ error }) => { if (error) console.error("save chat:", error); });
      }

    } catch (e) {
      console.error(e);
      toast.error("Failed to get response. Please try again.");
    }

    setIsLoading(false);
  };

  const Icon = subject.icon;

  const pastQuestions = messages.filter((m) => m.role === "user");

  const jumpTo = (id: string) => {
    const el = messageRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setHistoryOpen(false);
  };

  const isUuid = (s: string) => /^[0-9a-f-]{36}$/i.test(s);

  const deleteQuestion = async (id: string) => {
    if (!confirm("Delete this question and its answer?")) return;
    // find index of the user message and the following assistant message
    const idx = messages.findIndex((m) => m.id === id);
    const idsToRemove = new Set<string>([id]);
    if (idx >= 0 && messages[idx + 1]?.role === "assistant") {
      idsToRemove.add(messages[idx + 1].id);
    }
    // remove locally
    setMessages((prev) => prev.filter((m) => !idsToRemove.has(m.id)));
    // remove persisted rows if we have real ids
    if (user) {
      const dbIds = [...idsToRemove].filter(isUuid);
      if (dbIds.length) {
        const { error } = await supabase
          .from("chat_messages" as any)
          .delete()
          .eq("user_id", user.id)
          .in("id", dbIds);
        if (error) toast.error("Failed to delete on server");
      }
    }
  };

  const clearAllHistory = async () => {
    if (!confirm(`Clear all ${subject.name} chat history?`)) return;
    setMessages((prev) => [prev[0]]);
    if (user) {
      const { error } = await supabase
        .from("chat_messages" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("subject_id", subject.id);
      if (error) toast.error("Failed to clear history");
      else toast.success("History cleared");
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className={`rounded-lg p-1.5 ${subject.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-heading font-semibold text-card-foreground truncate">{subject.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto shrink-0 lg:hidden"
          onClick={() => setHistoryOpen(true)}
          aria-label="Open chat history"
        >
          <History className="h-5 w-5" />
        </Button>
        <Button
          size="sm"
          className="shrink-0 hero-gradient text-primary-foreground font-semibold text-xs lg:ml-auto"
          onClick={() => onStartQuiz(messages)}
          disabled={messages.length < 3}
        >
          Take Quiz 📝
        </Button>
      </div>

      {/* Body: sidebar + messages */}
      <div className="flex flex-1 min-h-0">
        {/* Left history panel */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="font-heading text-sm font-semibold flex-1">Chat History</h3>
            {pastQuestions.length > 0 && (
              <button
                onClick={clearAllHistory}
                className="text-[11px] text-muted-foreground hover:text-destructive"
                aria-label="Clear all history"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {pastQuestions.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-3">
                Your questions will appear here.
              </p>
            ) : (
              pastQuestions.map((q, i) => (
                <div
                  key={q.id}
                  className="group flex items-start gap-1 rounded-lg text-xs text-card-foreground hover:bg-accent transition"
                >
                  <button
                    onClick={() => jumpTo(q.id)}
                    className="flex-1 text-left px-3 py-2 flex items-start gap-2"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span className="line-clamp-2">{i + 1}. {q.content}</span>
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    aria-label="Delete this question"
                    className="px-2 py-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Mobile drawer */}
        {historyOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setHistoryOpen(false)} />
            <aside className="relative w-72 max-w-[80%] bg-card flex flex-col animate-fade-in">
              <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold flex-1">Chat History</h3>
                {pastQuestions.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setHistoryOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {pastQuestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-3">
                    Your questions will appear here.
                  </p>
                ) : (
                  pastQuestions.map((q, i) => (
                    <div
                      key={q.id}
                      className="flex items-start gap-1 rounded-lg text-xs text-card-foreground hover:bg-accent transition"
                    >
                      <button
                        onClick={() => jumpTo(q.id)}
                        className="flex-1 text-left px-3 py-2 flex items-start gap-2"
                      >
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                        <span className="line-clamp-2">{i + 1}. {q.content}</span>
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        aria-label="Delete this question"
                        className="px-2 py-2 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg) => (
              <div
                key={msg.id}
                ref={(el) => { messageRefs.current[msg.id] = el; }}
                className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "hero-gradient text-primary-foreground rounded-br-md"
                      : "bg-card card-shadow text-card-foreground rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none prose-headings:font-heading prose-headings:text-card-foreground prose-p:text-card-foreground prose-strong:text-card-foreground prose-li:text-card-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-card card-shadow rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        {symbols && (
          <div className="mb-2 -mx-1 flex gap-1 overflow-x-auto pb-1" aria-label="Symbols and formula helpers">
            {symbols.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => insertSymbol(s)}
                className="shrink-0 min-w-8 h-8 px-2 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-accent active:scale-95 transition"
                aria-label={`Insert ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={symbols ? "Ask a question or type an equation..." : "Ask a question..."}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="hero-gradient text-primary-foreground shrink-0 rounded-xl">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LearningChat;
