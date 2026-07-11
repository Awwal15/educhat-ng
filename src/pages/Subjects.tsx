import { useEffect, useState } from "react";
import { BookOpen, ArrowLeft } from "lucide-react";
import { subjects, Subject } from "@/data/subjects";
import SubjectCard from "@/components/SubjectCard";
import LearningChat from "@/components/LearningChat";
import QuizView from "@/components/QuizView";
import RecentChats from "@/components/RecentChats";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";


type View = "list" | "chat" | "quiz";

const Subjects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<View>("list");
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [quizTopic, setQuizTopic] = useState<string>("");

  useEffect(() => {
    const preselect = (location.state as any)?.subjectId as string | undefined;
    if (preselect) {
      const s = subjects.find((x) => x.id === preselect);
      if (s) { setSelectedSubject(s); setView("chat"); }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

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
          setView("list");
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
      <div className="container max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-heading text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Choose a Subject
          </h1>
        </div>

        <div className="mb-4">
          <RecentChats limit={5} onOpen={handleSelectSubject} />
        </div>

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
    </div>
  );
};

export default Subjects;
