import { BookOpen, FlaskConical, Calculator, Languages, Globe, Leaf, Atom, PenTool, TrendingUp } from "lucide-react";

export interface Subject {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

export const subjects: Subject[] = [
  { id: "mathematics", name: "Mathematics", icon: Calculator, description: "Algebra, Geometry, Statistics & more", color: "bg-primary/10 text-primary" },
  { id: "english", name: "English Language", icon: Languages, description: "Grammar, Comprehension & Essay Writing", color: "bg-secondary/20 text-secondary-foreground" },
  { id: "physics", name: "Physics", icon: Atom, description: "Mechanics, Waves, Electricity & more", color: "bg-blue-100 text-blue-700" },
  { id: "chemistry", name: "Chemistry", icon: FlaskConical, description: "Organic, Inorganic & Physical Chemistry", color: "bg-orange-100 text-orange-700" },
  { id: "biology", name: "Biology", icon: Leaf, description: "Cell Biology, Ecology, Genetics & more", color: "bg-emerald-100 text-emerald-700" },
  { id: "literature", name: "Literature in English", icon: BookOpen, description: "Prose, Poetry, Drama & Literary Devices", color: "bg-purple-100 text-purple-700" },
  { id: "geography", name: "Geography", icon: Globe, description: "Physical & Human Geography of Nigeria", color: "bg-teal-100 text-teal-700" },
  { id: "government", name: "Government", icon: PenTool, description: "Nigerian Government, Constitution & Civics", color: "bg-red-100 text-red-700" },
];
