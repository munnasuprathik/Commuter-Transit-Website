"use client";

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="relative bg-brand-blue text-white pt-16 md:pt-20 pb-6 md:pb-8 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Pre-footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 pb-12 md:pb-16 border-b border-white/10"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15] max-w-3xl">
            Need specialist transport <span className="text-brand-orange">across Australia?</span>
          </h2>
          <motion.a
            href="/#contact"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center gap-3 bg-brand-orange hover:bg-brand-orange-light text-white px-8 py-4 rounded-full transition-colors shrink-0"
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em]">Quote Now</span>
            <iconify-icon icon="solar:arrow-right-up-linear" width="16" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></iconify-icon>
          </motion.a>
        </motion.div>

        {/* Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="md:col-span-5"
          >
            <div className="h-20 sm:h-24 md:h-28 lg:h-32 mb-6">
              <img src="/images/CT LOGO WHITE.png" alt="Commuter Transit — Specialist transport & mobility solutions across Victoria" className="h-full w-auto object-contain object-left scale-[1.35] origin-left" />
            </div>
            <p className="text-white/70 font-light text-sm max-w-sm leading-relaxed mb-8">
              Safe, accessible and reliable transport solutions across Victoria, available 24/7.
            </p>
            <div className="mb-8">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-3">Coverage Areas</h3>
              <ul className="text-sm text-white/80 font-light space-y-2">
                <li>Melbourne Metro</li>
                <li>Outer Suburbs</li>
                <li>Regional Victoria</li>
                <li>Airport Transfers</li>
                <li>Specialist Transport</li>
              </ul>
            </div>
            
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-3"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-5">Navigate</h3>
            <ul className="space-y-3">
              <li><a href="/#services" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Services</a></li>
              <li><a href="/#fleet" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Fleet</a></li>
              <li><a href="/#corporate" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Corporate & Government</a></li>
              <li><a href="/#standards" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Compliance</a></li>
              <li><a href="/#why-us" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Why Us</a></li>
              <li><a href="/#contact" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Quote</a></li>
              <li><a href="/#contact" className="text-sm text-white/80 hover:text-brand-orange transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:col-span-4"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium mb-5">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:info@commutertransit.com.au" className="text-sm text-white/80 hover:text-brand-orange transition-colors break-all">info@commutertransit.com.au</a>
              </li>
              <li>
                <a href="tel:0411099994" className="text-sm text-white/80 hover:text-brand-orange transition-colors">0411 099 994</a>
              </li>
              <li>
                <span className="text-sm text-white/60 leading-relaxed block">Melbourne, VIC</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* SEO keyword strip — subtle */}
        <motion.nav
          aria-label="Service keywords"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-14 md:mt-20 pt-6 border-t border-white/10"
        >
          <ul className="flex flex-wrap justify-center md:justify-start gap-x-3 gap-y-2 text-[10px] sm:text-xs text-white/40 font-light tracking-wide">
            <li><a href="/services/chauffeur" className="hover:text-brand-orange transition-colors">Chauffeur Services</a></li>
            <li aria-hidden="true" className="text-white/15">·</li>
            <li><a href="/services/airport-transfers" className="hover:text-brand-orange transition-colors">Airport Transfers</a></li>
            <li aria-hidden="true" className="text-white/15">·</li>
            <li><a href="/services/wheelchair-accessible" className="hover:text-brand-orange transition-colors">Wheelchair Accessible Transport</a></li>
            <li aria-hidden="true" className="text-white/15">·</li>
            <li><a href="/services/event-corporate" className="hover:text-brand-orange transition-colors">Corporate Transport</a></li>
            <li aria-hidden="true" className="text-white/15">·</li>
            <li><a href="/services/rail-replacement" className="hover:text-brand-orange transition-colors">Rail Replacement Services</a></li>
            <li aria-hidden="true" className="text-white/15">·</li>
            <li><a href="/services/vehicle-hire" className="hover:text-brand-orange transition-colors">Fleet Hire</a></li>
            <li aria-hidden="true" className="text-white/15">·</li>
            <li><a href="/services/logistics" className="hover:text-brand-orange transition-colors">Specialist Transport Solutions Australia</a></li>
          </ul>
        </motion.nav>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left"
        >
          <p className="text-white/40 text-[11px] font-light">
            &copy; {new Date().getFullYear()} Commuter Transit. All rights reserved.
          </p>
          <div className="flex gap-6 sm:gap-8">
            <Link to="/privacy" className="text-white/40 hover:text-white text-[11px] font-light transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white/40 hover:text-white text-[11px] font-light transition-colors">Terms of Service</Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

