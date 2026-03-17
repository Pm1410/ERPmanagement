import { CalendarIcon, MapPinIcon } from "lucide-react";

export function NewsEvents() {
  return (
    <section className="py-20 bg-neutral-50 border-t border-border/50">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              News & Upcoming Events
            </h2>
            <p className="mt-4 text-neutral-600">
              Stay updated with our latest happenings, academic events, and achievements.
            </p>
          </div>
          <button className="mt-6 md:mt-0 text-primary font-semibold hover:underline bg-primary/10 px-4 py-2 rounded-md transition-colors">
            View All Content
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Event Highlight */}
          <div className="lg:col-span-2 group relative overflow-hidden rounded-2xl bg-white shadow-elevated border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
            
            {/* Image Placeholder */}
            <div className="absolute inset-0 bg-neutral-300 transition-transform duration-700 group-hover:scale-105" />
            
            <div className="relative z-20 h-full min-h-[400px] p-8 flex flex-col justify-end">
              <div className="inline-flex items-center rounded-full bg-danger/90 px-3 py-1 text-xs font-semibold text-white w-fit mb-4">
                Featured Event
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                Annual Science Exhibition 2026: Exploring New Frontiers
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-200 mb-6">
                <span className="flex items-center"><CalendarIcon className="w-4 h-4 mr-2" /> November 15, 2026</span>
                <span className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2" /> Main Auditorium</span>
              </div>
              <button className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-md w-fit transition-colors shadow-lg shadow-primary/20">
                Register Now
              </button>
            </div>
          </div>

          {/* Side List */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-card border border-border/50 md:flex flex-col">
              <h4 className="font-bold text-lg mb-4 text-foreground flex items-center border-b border-border/50 pb-3">
                <span className="w-2 h-2 rounded-full bg-secondary mr-2"></span> Recent News
              </h4>
              <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="group cursor-pointer">
                    <div className="text-xs font-medium text-neutral-500 mb-1">Oct {10 - item}, 2026</div>
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm leading-snug">
                      Students Win National Level Coding Competition
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
