import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { subjects, Subject } from "@/data/subjects";
import SubjectCard from "@/components/SubjectCard";
import LearningChat from "@/components/LearningChat";
import QuizView from "@/components/QuizView";
import { motion } from "framer-motion";

type View = "home" | "chat" | "quiz";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setView("chat");
  };

  if (view === "quiz" && selectedSubject) {
    return <QuizView subject={selectedSubject} onBack={() => setView("chat")} />;
  }

  if (view === "chat" && selectedSubject) {
    return (
      <LearningChat
        subject={selectedSubject}
        onBack={() => {
          setView("home");
          setSelectedSubject(null);
        }}
        onStartQuiz={() => setView("quiz")}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero */}
      <div className="hero-gradient px-4 pb-8 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="container max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
            <h1 className="font-heading text-xl font-bold text-primary-foreground">LearnWAEC</h1>
          </div>
          <h2 className="font-heading text-2xl font-bold text-primary-foreground leading-tight">
            Learn smart.<br />Pass your WAEC. 🇳🇬
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80 leading-relaxed">
            Ask questions in any subject, get simple explanations with Nigerian examples, then test yourself with quizzes.
          </p>
        </motion.div>
      </div>

      {/* Subjects */}
      <div className="container max-w-lg mx-auto px-4 -mt-4">
        <div className="rounded-xl bg-card card-shadow p-4">
          <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Choose a Subject</h3>
          <div className="space-y-3">
            {subjects.map((subject, i) => (
              <SubjectCard key={subject.id} subject={subject} index={i} onClick={() => handleSelectSubject(subject)} />
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6 pb-8">
          Built for SS1–SS3 students preparing for WAEC 📚
        </p>
      </div>
    </div>
  );
};

export default Index;
