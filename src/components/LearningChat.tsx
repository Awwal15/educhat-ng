import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subject } from "@/data/subjects";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

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

// Simple mock AI responses for demo (will be replaced with real AI later)
function getMockResponse(subject: string, question: string): string {
  return `Great question about **${subject}**! 🎓

Let me explain this in a simple way:

${question.toLowerCase().includes("what") ? `This is a fundamental concept in ${subject}. Think of it like how things work in everyday life in Nigeria.` : ""}

**Here's a simple explanation:**

In ${subject}, this topic is very important for your WAEC exam. Let me break it down:

1. **Key Point**: The concept relates to how we observe things around us — for example, in the market or at home.

2. **Nigerian Example**: Think about how a trader in Aba market calculates profit and loss — that's a practical application of this concept.

3. **WAEC Tip**: This topic usually appears in Section A (objectives) and sometimes in theory questions.

> 💡 **Remember**: Understanding the "why" behind concepts helps you answer tricky WAEC questions.

Would you like me to explain further, or are you ready for a **quiz** to test your understanding? Just click the "Take Quiz" button when you're ready! 📝`;
}

const LearningChat = ({ subject, onBack, onStartQuiz }: LearningChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Welcome! 👋 I'm your ${subject.name} tutor. Ask me anything about ${subject.name} — I'll explain it simply with examples you can relate to as a Nigerian student.\n\nFor example, you can ask:\n- "What is photosynthesis?"\n- "Explain quadratic equations"\n- "How does the Nigerian government work?"\n\nWhat would you like to learn today?`,
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
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((r) => setTimeout(r, 1200));
    const response = getMockResponse(subject.name, text);
    const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
    setMessages((prev) => [...prev, assistantMsg]);
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
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
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
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-card card-shadow rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </motion.div>
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
