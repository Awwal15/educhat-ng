import { Subject } from "@/data/subjects";

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
  index: number;
}

const SubjectCard = ({ subject, onClick, index }: SubjectCardProps) => {
  const Icon = subject.icon;

  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 rounded-lg bg-card p-4 text-left card-shadow hover:card-hover-shadow transition-shadow duration-200 w-full animate-fade-in"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      <div className={`rounded-lg p-2.5 ${subject.color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <h3 className="font-heading font-semibold text-card-foreground">{subject.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground leading-snug">{subject.description}</p>
      </div>
    </button>
  );
};

export default SubjectCard;
