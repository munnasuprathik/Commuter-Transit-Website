"use client";

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="bg-brand-blue text-white pt-12 sm:pt-16 md:pt-20 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Pre-footer CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 sm:mb-20 md:mb-32 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
        >
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1]">
            Need reliable transport <br />
            <span className="text-brand-orange">in Melbourne?</span>
          </h2>
          <motion.a 
            href="/#contact" 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex flex-col items-center justify-center w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border border-white/20 hover:bg-brand-orange hover:text-white transition-all duration-500 shrink-0 mt-4 md:mt-0 shadow-2xl shadow-white/5"
          >
            <span className="text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1">Book Now</span>
            <iconify-icon icon="solar:arrow-right-up-linear" width="16" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></iconify-icon>
          </motion.a>
        </motion.div>

        {/* Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-6 py-8 sm:py-10 md:py-12 md:border-r border-white/10 md:pr-12"
          >
            <div className="flex items-center gap-3 mb-4 sm:mb-6 md:mb-8">
              <div className="h-28 sm:h-32 flex items-center justify-start p-1 -ml-4">
                <img src="/images/CT LOGO WHITE.png" alt="Commuter Transit Logo" className="h-full w-auto object-contain" />
              </div>
            </div>
            <p className="text-white/70 font-light text-sm max-w-sm leading-relaxed mt-4">
              Melbourne's trusted provider for wheelchair-accessible transport, NDIS travel, corporate event shuttles, civil crew bus hire, and professional removals.
              <br /><br />
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">H&A Global Aus Pty Ltd</span>
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-3 py-8 sm:py-10 md:py-12 md:border-r border-white/10 md:px-12"
          >
            <h3 className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-4 sm:mb-6 md:mb-8">Navigation</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li><a href="/#fleet" className="text-sm text-white/70 hover:text-white transition-colors font-light">The Fleet</a></li>
              <li><a href="/#standards" className="text-sm text-white/70 hover:text-white transition-colors font-light">Our Standards</a></li>
              <li><a href="/#faq" className="text-sm text-white/70 hover:text-white transition-colors font-light">FAQ</a></li>
              <li><a href="/#booking" className="text-sm text-white/70 hover:text-white transition-colors font-light">Booking</a></li>
            </ul>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="md:col-span-3 py-8 sm:py-10 md:py-12 md:pl-12"
          >
            <h3 className="text-[10px] uppercase tracking-widest text-white/50 font-bold mb-4 sm:mb-6 md:mb-8">Contact</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li><a href="mailto:info@commutertransit.com.au" className="text-sm text-white/70 hover:text-white transition-colors font-light break-all">info@commutertransit.com.au</a></li>
              <li><span className="text-sm text-white/50 font-light">Epping, VIC, Australia</span></li>
            </ul>
          </motion.div>
        </div>
        
        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-4 text-center sm:text-left"
        >
          <p className="text-white/50 text-[10px] sm:text-xs font-light">
            &copy; {new Date().getFullYear()} Commuter Transit. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <Link to="/privacy" className="text-white/50 hover:text-white text-[10px] sm:text-xs font-light transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/50 hover:text-white text-[10px] sm:text-xs font-light transition-colors">Terms of Service</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

