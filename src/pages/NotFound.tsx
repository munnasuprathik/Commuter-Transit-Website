import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 text-center"
      >
        <h1 className="text-[120px] sm:text-[180px] md:text-[240px] font-bold text-white leading-none tracking-tighter mb-4">
          404
        </h1>
        <p className="text-xl sm:text-2xl text-zinc-400 font-light mb-12 tracking-tight">
          The page you're looking for doesn't exist.
        </p>
        
        <Link 
          to="/"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-300"
        >
          <iconify-icon icon="solar:arrow-left-linear" width="16"></iconify-icon>
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
