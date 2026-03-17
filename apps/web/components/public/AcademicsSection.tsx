import { BookOpen, FlaskConical, Globe, Palette } from "lucide-react";

const programs = [
  {
    title: "Primary Years (Grades 1-5)",
    description: "Laying a strong foundation through inquiry-based learning and creative exploration.",
    icon: BookOpen,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Middle School (Grades 6-8)",
    description: "Fostering critical thinking, collaboration, and deeper subject mastery.",
    icon: Globe,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    title: "High School (Grades 9-10)",
    description: "Preparation for board exams with a focus on core academic competencies.",
    icon: FlaskConical,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Senior Secondary (Grades 11-12)",
    description: "Specialized streams in Science, Commerce, and Humanities to prepare for higher education.",
    icon: Palette,
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
];

export function AcademicsSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
            Our Academics
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Academic Programs Designed for Success
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            A comprehensive curriculum structured to provide age-appropriate challenges and holistic development across all grades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {programs.map((program, idx) => {
            const Icon = program.icon;
            return (
              <div 
                key={idx} 
                className="group relative flex flex-col items-start p-8 bg-white rounded-2xl shadow-card border border-border/50 hover:shadow-elevated transition-all overflow-hidden"
              >
                {/* Background accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-20 transition-transform group-hover:scale-150 ${program.bgColor}`}></div>
                
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 relative z-10 ${program.bgColor}`}>
                  <Icon className={`w-7 h-7 flex-shrink-0 ${program.color}`} />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">{program.title}</h3>
                <p className="text-neutral-600 text-base leading-relaxed relative z-10 flex-grow">
                  {program.description}
                </p>
                
                <div className="mt-6 font-semibold text-primary inline-flex items-center text-sm relative z-10 group-hover:underline">
                  Learn more <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
