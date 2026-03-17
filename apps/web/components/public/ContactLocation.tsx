import { Mail, MapPin, Phone, Send } from "lucide-react";

export function ContactLocation() {
  return (
    <section className="py-20 bg-background" id="contact">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Get in Touch</h2>
          <p className="mt-4 text-neutral-600 max-w-2xl mx-auto">
            Have questions about admissions, curriculum, or facilities? Our team is here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto bg-white rounded-3xl shadow-elevated border border-border overflow-hidden">
          
          {/* Contact Details & Map */}
          <div className="p-8 md:p-12 bg-neutral-50 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Address</h4>
                    <p className="text-neutral-600 mt-1">
                      123 Education Boulevard,<br />
                      Knowledge City, ED 123456
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Phone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Phone</h4>
                    <p className="text-neutral-600 mt-1">+1 (800) 123-4567</p>
                    <p className="text-neutral-600">+1 (800) 123-4568</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email</h4>
                    <p className="text-neutral-600 mt-1">admissions@ourschool.edu</p>
                    <p className="text-neutral-600">info@ourschool.edu</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 rounded-xl overflow-hidden shadow-sm h-64 relative bg-neutral-200">
               {/* Embed Google Maps Iframe */}
               <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10000!2d-122.084!3d37.422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDI1JzE5LjIiTiAxMjLCsDA1JzAyLjQiVw!5e0!3m2!1sen!2sus!4v1600000000000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                  title="Campus Map"
                ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 md:p-12">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
                <select id="subject" className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none">
                  <option value="admission">Admissions Inquiry</option>
                  <option value="general">General Information</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">Message</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full inline-flex items-center justify-center h-12 rounded-lg bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
              >
                Send Message
                <Send className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
