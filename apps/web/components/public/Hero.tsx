import Link from "next/link";
import { ArrowRight, ChevronRight, GraduationCap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-primary to-secondary">
      {/* Background Decorators */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      
      <div className="container relative z-10 py-24 md:py-32 lg:py-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-sm font-medium text-primary-foreground w-fit backdrop-blur-sm">
              <GraduationCap className="w-4 h-4 mr-2" />
              Excellence in Education Since 1995
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white">
              Shaping the <span className="text-neutral-200">Leaders</span> of Tomorrow
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[600px] leading-relaxed">
              Welcome to our premier institution, where we foster a culture of academic excellence, innovation, and holistic development. Join a community dedicated to lifelong learning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/login"
                className="inline-flex h-12 md:h-14 items-center justify-center rounded-md bg-white px-8 text-base font-semibold text-primary shadow transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
              >
                Student Login
              </Link>
              <Link
                href="/apply"
                className="inline-flex h-12 md:h-14 items-center justify-center rounded-md border-2 border-white bg-transparent px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-200"
              >
                Apply Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
          
          {/* Visual Content / Stats Bar */}
          <div className="relative flex justify-center lg:justify-end animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl bg-neutral-900 border-4 border-white/10">
              {/* Fallback image if actual image is missing */}
              <div className="absolute inset-0 bg-secondary/80 flex items-center justify-center">
                <GraduationCap className="w-32 h-32 text-white/50" />
              </div>
              
              {/* Floating Stat Cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 w-48 border border-neutral-100 backdrop-blur-xl">
                <div className="text-3xl font-bold text-primary">5,000+</div>
                <div className="text-sm font-medium text-neutral-500 mt-1">Students Enrolled</div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-6 w-48 border border-neutral-100 backdrop-blur-xl">
                <div className="text-3xl font-bold text-secondary">98%</div>
                <div className="text-sm font-medium text-neutral-500 mt-1">Pass Rate</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Bottom Wave/Shape Divider layer */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          className="relative block w-full h-[60px] md:h-[120px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.06,130.83,112.92,192.61,96.34,236.14,84.7,279.16,71.44,321.39,56.44Z"
            className="fill-background"
          ></path>
        </svg>
      </div>
    </section>
  );
}
