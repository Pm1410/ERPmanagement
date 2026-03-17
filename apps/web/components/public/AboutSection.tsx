import { CheckCircle2 } from "lucide-react";

export function AboutSection() {
  return (
    <section className="py-20 bg-neutral-50">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Images/Visuals */}
          <div className="relative group">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated bg-neutral-200">
               {/* Replace with actual image */}
               <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <span className="text-primary/40 font-semibold">Campus Image</span>
               </div>
            </div>
            {/* Overlapping Badge */}
            <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-xl shadow-xl w-48 border border-neutral-100 hidden md:block group-hover:-translate-y-2 transition-transform">
              <div className="text-4xl font-black text-secondary">25+</div>
              <div className="text-sm font-semibold text-neutral-600 mt-2">Years of Academic Excellence</div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">
              About Our Institution
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              A Legacy of Nurturing Global Citizens
            </h2>
            
            <p className="text-lg text-neutral-600 leading-relaxed">
              Founded in 1995, our institution has been at the forefront of providing holistic education. We believe in empowering students with the knowledge, skills, and values required to thrive in a rapidly changing world.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Our Vision</h4>
                  <p className="text-neutral-600 text-sm mt-1">To be a globally recognized center of excellence fostering intellectual curiosity and social responsibility.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-6 h-6 text-secondary mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Our Mission</h4>
                  <p className="text-neutral-600 text-sm mt-1">Providing progressive and value-based education that equips students to become innovative leaders.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 flex items-center gap-8 border-t border-border/50">
              {/* Accreditations / Stats */}
              <div>
                <div className="text-sm text-neutral-500 mb-2">Accredited By</div>
                <div className="flex flex-wrap gap-4">
                  {/* Placeholders for logos */}
                  <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
