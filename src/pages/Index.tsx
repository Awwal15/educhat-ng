import { GraduationCap, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import coatOfArms from "@/assets/nigeria-coat-of-arms.png";
import waecLogo from "@/assets/waec-logo.png";
import necoLogo from "@/assets/neco-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Hero Section with CSS gradient instead of image */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative px-4 pb-16 pt-8">
          <div className="container max-w-lg mx-auto">
            {/* Logos Row */}
            <div className="flex flex-col items-center gap-3 mb-6 animate-fade-in">
              <img
                src={coatOfArms}
                alt="Nigeria Coat of Arms"
                className="h-16 sm:h-20 w-auto drop-shadow-lg"
                loading="eager"
                width="80"
                height="80"
              />
              <div className="flex items-center justify-center gap-4">
                <img
                  src={waecLogo}
                  alt="WAEC Logo"
                  className="h-12 sm:h-16 w-auto drop-shadow-lg"
                  loading="eager"
                  width="64"
                  height="64"
                />
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                  <span className="font-heading text-lg sm:text-2xl font-extrabold text-primary-foreground whitespace-nowrap">EduChat NG</span>
                </div>
                <img
                  src={necoLogo}
                  alt="NECO Logo"
                  className="h-12 sm:h-16 w-auto drop-shadow-lg"
                  loading="eager"
                  width="64"
                  height="64"
                />
              </div>
            </div>

            {/* Hero Content */}
            <div className="text-center animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              <h1 className="font-heading text-3xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                Learn Smart.<br />
                <span className="text-secondary">Pass Your WAEC and NECO.</span>
              </h1>
              <p className="mt-3 text-sm text-primary-foreground/85 leading-relaxed max-w-xs mx-auto">
                Free AI-powered learning for Nigerian students. Ask questions, get simple explanations, and ace your exams. 🇳🇬
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center justify-center gap-3 mt-5 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <BookOpen className="h-3.5 w-3.5" />
                9 Subjects
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI Tutor
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-primary-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                SS1–SS3
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-8 animate-fade-in" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
              <Button
                size="lg"
                onClick={() => navigate("/subjects")}
                className="rounded-full px-8 py-6 text-base font-bold shadow-lg gap-2"
              >
                Start Learning
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container max-w-2xl mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Sparkles, title: "Personalized Learning", desc: "Adapts to the student's pace." },
            { icon: BookOpen, title: "24/7 Access", desc: "Tutoring available even outside school hours." },
            { icon: GraduationCap, title: "Data-Light", desc: "Optimized for low-bandwidth connections." },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 rounded-lg bg-card p-3.5 shadow-sm border border-border animate-fade-in"
              style={{ animationDelay: `${550 + i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="rounded-md bg-primary/10 p-2">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="container max-w-lg mx-auto px-4">
        <div className="text-center mt-8 pb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img src={coatOfArms} alt="" className="h-8 w-auto opacity-40" loading="lazy" />
            <img src={waecLogo} alt="" className="h-8 w-auto opacity-40" loading="lazy" />
            <img src={necoLogo} alt="" className="h-8 w-auto opacity-40" loading="lazy" />
          </div>
          <p className="text-xs text-muted-foreground">
            Built for SS1–SS3 students preparing for WAEC 📚
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Unity and Faith, Peace and Progress
          </p>
          <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">
            Developed by <span className="font-medium text-foreground">Lawal Wahab</span> | 3MTT NextGen Cohort | Software Development
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
