import { Subject } from "@/data/subjects";
import { motion } from "framer-motion";

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
  index: number;
}

const SubjectCard = ({ subject, onClick, index }: SubjectCardProps) => {
  const Icon = subject.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={onClick}
      className="flex items-start gap-4 rounded-lg bg-card p-4 text-left card-shadow hover:card-hover-shadow transition-shadow duration-200 w-full"
    >
      <div className={`rounded-lg p-2.5 ${subject.color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-heading font-semibold text-card-foreground">{subject.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground leading-snug">{subject.description}</p>
      </div>
    </motion.button>
  );
};

export default SubjectCard;
