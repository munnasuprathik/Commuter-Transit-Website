import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Are you an NDIS-registered wheelchair accessible transport provider in Melbourne?",
    answer: "Yes. Commuter Transit provides wheelchair-accessible transport across Melbourne for NDIS participants and individuals with mobility needs. Our vehicles are fully equipped with ramps and restraints, and our drivers are trained to assist passengers safely. We cover essential appointments, community outings, and group travel throughout Victoria."
  },
  {
    question: "Do you offer civil construction crew bus hire in Melbourne?",
    answer: "Yes. We specialise in crew bus hire for civil construction and infrastructure projects across Melbourne and regional Victoria. Our fleet meets project site safety specifications and our workforce transport services operate on flexible schedules to suit early starts and shift changes."
  },
  {
    question: "What corporate event shuttle and airport transfer services do you provide?",
    answer: "We offer corporate charter buses, executive airport transfers, conference shuttle services, and group event transport coordination across Melbourne. We cater to businesses requiring reliable transport for employees, clients, and guests — with punctuality and professionalism guaranteed."
  },
  {
    question: "Do you offer residential and commercial removals in Melbourne?",
    answer: "Yes. Our removals service covers residential and commercial moves within Melbourne and interstate. We bring the same transport expertise and fleet reliability that powers our passenger services to every removal job — ensuring your move is safe, efficient, and stress-free."
  },
  {
    question: "What school and group transport services are available?",
    answer: "Commuter Transit provides school bus services, student transport, group airport pickups and drop-offs, and charter buses for school excursions throughout Melbourne and Victoria. Safety is our priority for every student and group journey."
  }
];

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[40px] md:text-[80px] font-light tracking-tighter leading-none mb-6">
            <span className="italic font-serif">Frequently</span> ASKED
          </h2>
          <p className="text-sm md:text-base text-zinc-500 font-light leading-relaxed">
            Common questions about our wheelchair accessible transport, civil crew bus hire, corporate charters, and removals in Melbourne.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-zinc-200">
              <button 
                onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <span className="text-sm md:text-base font-medium tracking-tight text-brand-blue group-hover:text-brand-orange transition-colors">
                  {faq.question}
                </span>
                <iconify-icon 
                  icon={activeIndex === i ? "solar:minus-circle-linear" : "solar:add-circle-linear"} 
                  width="20" 
                  className={`text-zinc-400 transition-transform duration-300 ${activeIndex === i ? 'rotate-180' : ''}`}
                ></iconify-icon>
              </button>
              <AnimatePresence>
                {activeIndex === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pb-8 text-sm text-zinc-500 font-light leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
