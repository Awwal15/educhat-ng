import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subject } from "@/data/subjects";
import ReactMarkdown from "react-markdown";

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

const LearningChat = ({ subject, onBack, onStartQuiz }: LearningChatProps) => {
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
    } catch (e) {
      console.error(e);
      toast.error("Failed to get response. Please try again.");
    }

    setIsLoading(false);
  };

  const Icon = subject.icon;

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
          size="sm"
          className="ml-auto shrink-0 hero-gradient text-primary-foreground font-semibold text-xs"
          onClick={() => onStartQuiz(messages)}
          disabled={messages.length < 3}
        >
          Take Quiz 📝
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
            <div
              key={msg.id}
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

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
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
