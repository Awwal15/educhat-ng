import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subject } from "@/data/subjects";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizViewProps {
  subject: Subject;
  topic?: string;
  onBack: () => void;
}

const QuizView = ({ subject, topic, onBack }: QuizViewProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { subject: subject.name, topic: topic || subject.name },
      });
      if (error) throw error;
      if (data?.questions?.length) {
        setQuestions(data.questions);
      } else {
        throw new Error("No questions returned");
      }
    } catch (e: any) {
      console.error("Quiz fetch error:", e);
      toast.error(e?.message || "Failed to generate quiz. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  const current = questions[currentIndex];
  const isCorrect = selectedAnswer === current?.correctIndex;
  const isFinished = showResult;

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === current.correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
    fetchQuiz();
  };

  const Icon = subject.icon;

  if (loading) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-heading font-semibold text-card-foreground">Generating Quiz...</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Creating WAEC-style questions for you...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-heading font-semibold text-card-foreground">Quiz</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-muted-foreground text-center">Couldn't generate quiz questions. Please go back and try again.</p>
          <Button onClick={onBack} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((score / questions.length) * 100);

  if (isFinished) {
    return (
      <div className="flex h-[100dvh] flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-heading font-semibold text-card-foreground">Quiz Results</h2>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <div className="text-center animate-fade-in">
            <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${percentage >= 60 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <span className={`font-heading text-3xl font-bold ${percentage >= 60 ? "text-primary" : "text-destructive"}`}>{percentage}%</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              {percentage >= 80 ? "Excellent! 🌟" : percentage >= 60 ? "Good job! 👍" : "Keep practicing! 💪"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              You scored {score} out of {questions.length} in {subject.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRestart} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Try Again
            </Button>
            <Button onClick={onBack} className="hero-gradient text-primary-foreground gap-2">
              Continue Learning
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className={`rounded-lg p-1.5 ${subject.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-heading font-semibold text-card-foreground">Quiz</h2>
        <span className="ml-auto text-sm font-medium text-muted-foreground">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <div className="h-1 bg-muted">
        <div className="h-full hero-gradient transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div key={current.id} className="animate-fade-in">
          <p className="mb-6 font-heading text-lg font-semibold text-foreground leading-snug">{current.question}</p>

          <div className="space-y-3">
            {current.options.map((option, i) => {
              let optionStyle = "bg-card card-shadow border-2 border-transparent";
              if (answered) {
                if (i === current.correctIndex) optionStyle = "bg-primary/10 border-2 border-primary";
                else if (i === selectedAnswer) optionStyle = "bg-destructive/10 border-2 border-destructive";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition-all ${optionStyle}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-card-foreground">{option}</span>
                  {answered && i === current.correctIndex && <CheckCircle2 className="ml-auto h-5 w-5 text-primary shrink-0" />}
                  {answered && i === selectedAnswer && i !== current.correctIndex && <XCircle className="ml-auto h-5 w-5 text-destructive shrink-0" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-4 rounded-xl bg-accent p-4 animate-fade-in">
              <p className="text-sm font-semibold text-accent-foreground mb-1">{isCorrect ? "Correct! ✅" : "Not quite ❌"}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.explanation}</p>
            </div>
          )}
        </motion.div>
      </div>

      {answered && (
        <div className="border-t border-border bg-card px-4 py-3">
          <Button onClick={handleNext} className="w-full hero-gradient text-primary-foreground font-semibold">
            {currentIndex < questions.length - 1 ? "Next Question →" : "See Results"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuizView;
