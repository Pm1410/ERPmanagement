import Link from "next/link";
import { 
  BuildingLibraryIcon, 
  CalendarDaysIcon, 
  CreditCardIcon, 
  DocumentChartBarIcon, 
  PhoneIcon, 
  UserGroupIcon 
} from "@heroicons/react/24/outline";

const links = [
  { name: "Admissions", icon: UserGroupIcon, href: "/apply", color: "text-primary", bg: "bg-primary/10" },
  { name: "Results", icon: DocumentChartBarIcon, href: "/student/results", color: "text-secondary", bg: "bg-secondary/10" },
  { name: "Fee Payment", icon: CreditCardIcon, href: "/parent/fees", color: "text-accent", bg: "bg-accent/10" },
  { name: "Timetable", icon: CalendarDaysIcon, href: "/student/timetable", color: "text-danger", bg: "bg-danger/10" },
  { name: "Library", icon: BuildingLibraryIcon, href: "/student/library", color: "text-success", bg: "bg-success/10" },
  { name: "Contact", icon: PhoneIcon, href: "#contact", color: "text-neutral-600", bg: "bg-neutral-100" },
];

export function QuickLinks() {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Quick Links</h2>
          <p className="mt-2 text-neutral-500">Access essential portals and resources quickly</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link 
                key={link.name}
                href={link.href}
                className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-card hover:shadow-elevated transition-all hover:-translate-y-1 border border-border/50 text-center"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${link.bg}`}>
                  <Icon className={`w-8 h-8 ${link.color}`} />
                </div>
                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
