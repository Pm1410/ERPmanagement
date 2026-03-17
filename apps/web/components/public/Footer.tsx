import Link from "next/link";
import { GraduationCap, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-300">
      <div className="container pt-16 pb-8 border-b border-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Edura ERP</span>
            </div>
            <p className="text-sm text-neutral-400">
              Empowering education through technology. A comprehensive school management system designed for excellence.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="p-2 bg-neutral-900 rounded-full hover:bg-primary hover:text-white transition-colors">
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Portals</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/login" className="hover:text-primary transition-colors">Student Login</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Parent Login</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Faculty Login</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Information</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/apply" className="hover:text-primary transition-colors">Admissions</Link></li>
              <li><Link href="#academics" className="hover:text-primary transition-colors">Academic Programs</Link></li>
              <li><Link href="#events" className="hover:text-primary transition-colors">News & Events</Link></li>
              <li><Link href="#contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase text-sm tracking-wider">Stay Updated</h4>
            <p className="text-sm text-neutral-400 mb-4">
              Subscribe to our newsletter for the latest updates and announcements.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-neutral-900 text-sm px-4 py-2.5 rounded-l-md w-full outline-none focus:ring-1 focus:ring-primary border border-transparent focus:border-primary text-white"
              />
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-r-md transition-colors text-sm font-medium">
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>
      
      <div className="container py-6 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
        <p>&copy; {currentYear} Edura Education System. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
