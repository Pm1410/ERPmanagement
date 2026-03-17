"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Parent of Grade 8 Student",
    rating: 5,
    text: "The dedication of the teachers is phenomenal. My son has shown immense growth not just academically but also in his confidence and public speaking skills. The facilities are top-notch.",
  },
  {
    id: 2,
    name: "Priya Patel",
    role: "Alumni, Batch of 2020",
    rating: 5,
    text: "This institution shaped my career path. The practical approach to learning and the continuous support from faculty helped me secure admission into my dream university. Forever grateful.",
  },
  {
    id: 3,
    name: "Arjun Desai",
    role: "Student, Grade 12",
    rating: 4,
    text: "The competitive yet supportive environment here pushes you to be your best self. The library resources and the coding club have been my favorite parts of campus life.",
  },
];

export function TestimonialsCarousel() {
  const [current, setCurrent] = useState(0);
  
  // Auto-rotate simple implementation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-24 bg-primary text-white relative overflow-hidden">
      {/* Decorative Elements */}
      <Quote className="absolute top-10 left-10 w-48 h-48 text-primary-foreground/5 rotate-180 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Voices of Our Community</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-2xl mx-auto">
            Discover what our students, parents, and alumni have to say about their journey with us.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Carousel Item */}
            <div className="bg-white text-foreground rounded-3xl p-8 md:p-12 shadow-2xl transition-all duration-500 min-h-[300px] flex flex-col justify-center border-4 border-white/20 bg-clip-padding">
              
              <div className="flex mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < testimonials[current].rating ? "fill-accent text-accent" : "fill-neutral-200 text-neutral-200"}`} 
                  />
                ))}
              </div>
              
              <p className="text-xl md:text-2xl font-medium leading-relaxed italic mb-8 relative">
                <span className="text-neutral-300 text-5xl absolute -top-4 -left-6 opacity-50">&quot;</span>
                {testimonials[current].text}
                <span className="text-neutral-300 text-5xl absolute -bottom-8 -ml-2 opacity-50">&quot;</span>
              </p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-neutral-200 rounded-full mr-4 flex items-center justify-center text-xl font-bold text-neutral-500 overflow-hidden">
                   {testimonials[current].name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{testimonials[current].name}</h4>
                  <p className="text-neutral-500 text-sm">{testimonials[current].role}</p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center mt-10 gap-4">
              <button 
                onClick={prev}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white/50"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-2 px-4">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${idx === current ? "bg-white w-8" : "bg-white/30 hover:bg-white/50"}`}
                    aria-label={`Go to testimonial ${idx + 1}`}
                  />
                ))}
              </div>

              <button 
                onClick={next}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors focus:ring-2 focus:ring-white/50"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
