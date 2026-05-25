import React from 'react';
import { motion } from 'framer-motion';

const standards = [
  {
    title: "Punctuality",
    description: "Time is your most valuable asset. Our chauffeurs arrive 15 minutes early, every time.",
    icon: "solar:clock-circle-linear"
  },
  {
    title: "Discretion",
    description: "Privacy is paramount. Our professionals are trained in the highest standards of confidentiality.",
    icon: "solar:lock-password-linear"
  },
  {
    title: "Safety",
    description: "Your well-being is our priority. Every vehicle undergoes rigorous daily safety inspections.",
    icon: "solar:shield-check-linear"
  },
  {
    title: "Local Expertise",
    description: "Navigate Melbourne with ease. Our chauffeurs possess unparalleled knowledge of the city's routes.",
    icon: "solar:map-point-wave-linear"
  }
];

export function StandardsSection() {
  return (
    <section id="standards" className="py-24 md:py-32 bg-brand-blue text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div>
            <h2 className="text-[40px] md:text-[80px] font-light tracking-tight leading-[1.1] mb-8">
              OUR <br />
              <span className="italic text-zinc-500">Standards</span>
            </h2>
            <p className="text-sm md:text-base text-zinc-400 max-w-md font-light leading-relaxed mb-12">
              We don't just provide transport; we provide peace of mind. Our commitment to excellence is reflected in every detail of our service.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {standards.map((standard, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <iconify-icon icon={standard.icon} width="20"></iconify-icon>
                  </div>
                  <h3 className="text-lg font-medium tracking-tight">{standard.title}</h3>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed">
                    {standard.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-square rounded-3xl overflow-hidden"
          >
            <img 
              src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" 
              alt="Professional Chauffeur"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale brightness-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-blue via-transparent to-transparent"></div>
            <div className="absolute bottom-12 left-12 right-12">
              <p className="text-2xl font-light tracking-tight italic">
                "Excellence is not an act, but a habit."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
