import { useState } from "react";
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Subject } from "@/data/subjects";
import { motion } from "framer-motion";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizViewProps {
  subject: Subject;
  onBack: () => void;
}

function generateMockQuiz(subjectName: string): QuizQuestion[] {
  const quizzes: Record<string, QuizQuestion[]> = {
    default: [
      {
        id: 1,
        question: `Which of the following best describes a key concept in ${subjectName}?`,
        options: ["The study of living things", "The study of numbers and patterns", "The study of matter and energy", "The study of the earth"],
        correctIndex: 1,
        explanation: `This is a foundational concept in ${subjectName}. Understanding definitions helps you tackle WAEC objective questions quickly.`,
      },
      {
        id: 2,
        question: "A trader in Lagos bought goods for ₦5,000 and sold them for ₦7,500. What is the percentage profit?",
        options: ["25%", "50%", "75%", "150%"],
        correctIndex: 1,
        explanation: "Profit = ₦7,500 - ₦5,000 = ₦2,500. Percentage profit = (2500/5000) × 100 = 50%. This is a common WAEC question!",
      },
      {
        id: 3,
        question: "In Nigeria, the harmattan season is associated with which of the following?",
        options: ["Heavy rainfall", "Cool dry winds from the Sahara", "Flooding", "Tropical storms"],
        correctIndex: 1,
        explanation: "The harmattan brings cool, dry, and dusty winds from the Sahara Desert across West Africa, typically between November and March.",
      },
      {
        id: 4,
        question: "Which Nigerian city is known as the 'Centre of Commerce'?",
        options: ["Abuja", "Lagos", "Kano", "Port Harcourt"],
        correctIndex: 1,
        explanation: "Lagos is the commercial capital of Nigeria and one of the largest economies in Africa.",
      },
      {
        id: 5,
        question: `A WAEC ${subjectName} question tests your understanding of practical applications. Which approach is best?`,
        options: ["Memorise everything", "Understand concepts and practice", "Only read textbooks", "Skip difficult topics"],
        correctIndex: 1,
        explanation: "Understanding concepts and practicing past questions is the best approach for WAEC success!",
      },
    ],
  };
  return quizzes.default;
}

const QuizView = ({ subject, onBack }: QuizViewProps) => {
  const [questions] = useState(() => generateMockQuiz(subject.name));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

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
  };

  const Icon = subject.icon;
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
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
            <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${percentage >= 60 ? "bg-primary/10" : "bg-destructive/10"}`}>
              <span className={`font-heading text-3xl font-bold ${percentage >= 60 ? "text-primary" : "text-destructive"}`}>{percentage}%</span>
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">
              {percentage >= 80 ? "Excellent! 🌟" : percentage >= 60 ? "Good job! 👍" : "Keep practicing! 💪"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              You scored {score} out of {questions.length} in {subject.name}
            </p>
          </motion.div>
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
      {/* Header */}
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

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full hero-gradient transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <motion.div key={current.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-accent p-4">
              <p className="text-sm font-semibold text-accent-foreground mb-1">{isCorrect ? "Correct! ✅" : "Not quite ❌"}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Next button */}
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
