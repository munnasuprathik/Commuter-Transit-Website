"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const TESTIMONIALS = [
  {
    id: "testimonial-1",
    name: "Sarah Jenkins",
    profession: "Director of Events",
    description:
      "An absolute masterclass in logistical execution. They handled our multi-day executive summit shuttle with flawless precision. The fleet was pristine.",
    avatarUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  },
  {
    id: "testimonial-2",
    name: "Marcus Thorne",
    profession: "Operations Manager",
    description:
      "We rely entirely on their accessible transit services. Punctuality and profound respect for passenger dignity make them completely irreplaceable.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "testimonial-3",
    name: "David Chen",
    profession: "Senior Site Manager",
    description:
      "For large-scale civil project crew movements, there is no one better. They operate with clockwork reliability, ensuring zero delays to our schedules.",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0",
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="hidden bg-brand-blue py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 lg:sticky lg:top-32 h-fit"
          >
            <div className="flex flex-col gap-6 mb-10 md:mb-14">
              <div className="flex items-center gap-4">
                <span className="text-xl sm:text-2xl font-black text-white/20 leading-none tracking-tighter uppercase">05</span>
                <span className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-[0.3em]">Client Voices</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white tracking-tight font-medium leading-[1.1]">
                Trusted by <br />
                <span className="text-brand-orange italic">Industry Leaders.</span>
              </h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-light leading-relaxed">
              Don't just take our word for it. Hear from the organizations and individuals who rely on our mobility solutions every day.
            </p>
          </motion.div>
          
          <div className="lg:col-span-8 flex flex-col mt-4 sm:mt-8 lg:mt-0">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div 
                key={testimonial.id} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group border-t border-white/10 py-8 sm:py-10 md:py-16 first:border-t-0 lg:first:pt-0"
              >
                <div className="grid md:grid-cols-12 gap-4 sm:gap-6 md:gap-8 items-start">
                  <div className="md:col-span-4 flex items-center gap-3 sm:gap-4">
                    <Avatar className="size-10 sm:size-12 md:size-14 border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-500">
                      <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} />
                      <AvatarFallback className="bg-brand-blue-light text-white">{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-white">{testimonial.name}</p>
                      <p className="text-[8px] sm:text-[10px] uppercase tracking-widest text-brand-orange mt-0.5 sm:mt-1">{testimonial.profession}</p>
                    </div>
                  </div>
                  <div className="md:col-span-8 mt-2 md:mt-0">
                    <iconify-icon icon="solar:quote-left-bold" className="text-brand-blue-light mb-3 sm:mb-4 md:mb-6 w-5 sm:w-6" width="24"></iconify-icon>
                    <p className="text-base sm:text-lg md:text-2xl lg:text-3xl text-white/90 font-light leading-snug tracking-tight group-hover:text-white transition-colors duration-500">
                      "{testimonial.description}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
