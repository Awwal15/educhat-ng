import { GraduationCap, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import coatOfArms from "@/assets/nigeria-coat-of-arms.png";
import waecLogo from "@/assets/waec-logo.png";
import necoLogo from "@/assets/neco-logo.png";

const Index = () => {
  const navigate = useNavigate();

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
                className="h-10 sm:h-14 w-auto drop-shadow-lg flex-shrink-0"
              />
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                <span className="font-heading text-lg sm:text-2xl font-extrabold text-primary-foreground whitespace-nowrap">EduChat NG</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <img
                  src={waecLogo}
                  alt="WAEC Logo"
                  className="h-10 sm:h-14 w-auto drop-shadow-lg"
                />
                <img
                  src={necoLogo}
                  alt="NECO Logo"
                  className="h-10 sm:h-14 w-auto drop-shadow-lg"
                />
              </div>
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
                <span className="text-secondary">Pass Your WAEC and NECO.</span>
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
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex justify-center mt-8"
            >
              <Button
                size="lg"
                onClick={() => navigate("/subjects")}
                className="rounded-full px-8 py-6 text-base font-bold shadow-lg gap-2"
              >
                Start Learning
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container max-w-lg mx-auto px-4">
        <div className="text-center mt-8 pb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img src={coatOfArms} alt="" className="h-8 w-auto opacity-40" />
            <img src={waecLogo} alt="" className="h-8 w-auto opacity-40" />
            <img src={necoLogo} alt="" className="h-8 w-auto opacity-40" />
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
