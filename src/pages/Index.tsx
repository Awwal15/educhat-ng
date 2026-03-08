import { useState } from "react";
import { GraduationCap, BookOpen, Sparkles } from "lucide-react";
import { subjects, Subject } from "@/data/subjects";
import SubjectCard from "@/components/SubjectCard";
import LearningChat from "@/components/LearningChat";
import QuizView from "@/components/QuizView";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import coatOfArms from "@/assets/nigeria-coat-of-arms.png";
import waecLogo from "@/assets/waec-logo.png";

type View = "home" | "chat" | "quiz";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [quizTopic, setQuizTopic] = useState<string>("");

  const handleSelectSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setView("chat");
  };

  if (view === "quiz" && selectedSubject) {
    return <QuizView subject={selectedSubject} topic={quizTopic} onBack={() => setView("chat")} />;
  }

  if (view === "chat" && selectedSubject) {
    return (
      <LearningChat
        subject={selectedSubject}
        onBack={() => {
          setView("home");
          setSelectedSubject(null);
        }}
        onStartQuiz={(messages) => {
          const userMessages = messages.filter((m) => m.role === "user");
          const topic = userMessages.map((m) => m.content).join(", ");
          setQuizTopic(topic || selectedSubject.name);
          setView("quiz");
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>

        <div className="relative px-4 pb-16 pt-8">
          <div className="container max-w-lg mx-auto">
            {/* Logos Row */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <img
                src={coatOfArms}
                alt="Nigeria Coat of Arms"
                className="h-14 w-auto drop-shadow-lg"
              />
              <div className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
                <span className="font-heading text-lg font-bold text-primary-foreground">LearnWAEC</span>
              </div>
              <img
                src={waecLogo}
                alt="WAEC Logo"
                className="h-14 w-auto drop-shadow-lg"
              />
            </motion.div>

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center"
            >
              <h1 className="font-heading text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                Learn Smart.<br />
                <span className="text-secondary">Pass Your WAEC.</span>
              </h1>
              <p className="mt-3 text-sm text-primary-foreground/85 leading-relaxed max-w-xs mx-auto">
                Free AI-powered learning for Nigerian students. Ask questions, get simple explanations, and ace your exams. 🇳🇬
              </p>
            </motion.div>

            {/* Stats Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-3 mt-5"
            >
              <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                8 Subjects
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI Tutor
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                SS1–SS3
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="container max-w-lg mx-auto px-4 -mt-6">
        <div className="rounded-2xl bg-card card-shadow p-5">
          <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Choose a Subject
          </h2>
          <div className="space-y-3">
            {subjects.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={i}
                onClick={() => handleSelectSubject(subject)}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img src={coatOfArms} alt="" className="h-8 w-auto opacity-40" />
            <img src={waecLogo} alt="" className="h-8 w-auto opacity-40" />
          </div>
          <p className="text-xs text-muted-foreground">
            Built for SS1–SS3 students preparing for WAEC 📚
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Unity and Faith, Peace and Progress
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
