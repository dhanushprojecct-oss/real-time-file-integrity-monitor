import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck } from 'lucide-react';

const Hero = ({ onOpenDashboard, onOpenDocs }) => {
  return (
    <section className="pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 glass-card border-cyber-blue/30 text-cyber-blue text-xs font-bold uppercase tracking-widest"
      >
        <ShieldCheck className="w-4 h-4" /> Next-Generation File Protection
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6"
      >
        Real-Time <span className="text-cyber-blue neon-text">Integrity</span> <br />
        Monitoring System
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="max-w-2xl text-gray-400 text-lg mb-10 leading-relaxed"
      >
        Secure your infrastructure with SHA-256 based cryptographic verification. 
        Detect unauthorized modifications, deletions, and additions instantly through 
        our advanced neural-themed dashboard.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button 
          onClick={onOpenDashboard}
          className="px-8 py-4 bg-cyber-blue text-black font-bold rounded-lg hover:shadow-neon transition-all flex items-center gap-2 group"
        >
          VIEW DASHBOARD <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={onOpenDocs}
          className="px-8 py-4 glass-card border-white/20 text-white font-bold hover:bg-white/5 transition-all"
        >
          READ DOCUMENTATION
        </button>
      </motion.div>
    </section>
  );
};

export default Hero;
