import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Do you provide chauffeur services across Australia?",
    answer: "Yes. We deliver premium executive chauffeur services for business leaders, VIP guests, private clients, weddings and professional travel with experienced chauffeurs and luxury vehicles."
  },
  {
    question: "Do you offer wheelchair accessible transport?",
    answer: "Yes. We provide safe, dignity-first wheelchair-accessible transport with trained drivers and inclusive travel support for healthcare, aged care, NDIS and assisted mobility journeys."
  },
  {
    question: "Do you provide rail replacement and public disruption transport?",
    answer: "Yes. Rapid-response transport for rail replacement, planned infrastructure works, emergency passenger movement and network disruption support — for transport authorities, contractors and government agencies."
  },
  {
    question: "What corporate and event transport services do you provide?",
    answer: "Scalable transport for conferences, workforce movement, executive travel, event logistics, airport transfers and guest transport coordination."
  },
  {
    question: "Can I hire vehicles from your fleet?",
    answer: "Yes. Flexible vehicle hire from executive sedans and SUVs to accessible vans, minibuses and specialist transport fleet for private travel, business operations and contract transport."
  }
];

export function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32 bg-zinc-50">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-[40px] md:text-[80px] font-light tracking-tight leading-[1.1] mb-6">
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
