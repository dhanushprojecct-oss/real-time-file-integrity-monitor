import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

const LockdownOverlay = ({ isActive, onRecover }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center bg-red-950/20 backdrop-blur-xl transition-all duration-300"
        >
          {/* Glitch Overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-xl p-12 glass-card border-red-500/50 bg-black/90 shadow-[0_0_100px_rgba(239,68,68,0.4)] text-center relative overflow-hidden"
          >
            {/* Pulsing red scanline */}
            <motion.div 
               animate={{ top: ['0%', '100%', '0%'] }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute left-0 w-full h-[2px] bg-red-500/50 blur-sm pointer-events-none" 
            />

            <div className="flex justify-center mb-8">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)]"
              >
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </motion.div>
            </div>

            <h2 className="text-4xl font-black text-red-500 mb-4 tracking-tighter uppercase italic">
              CRITICAL INTRUSION DETECTED
            </h2>
            
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded mb-8 space-y-2">
               <p className="text-red-400 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                 <AlertTriangle className="w-4 h-4" /> HONEYPOT SYSTEM COMPROMISED
               </p>
               <p className="text-red-200/60 font-mono text-[10px]">
                 Origin: 192.168.1.254 [MALICIOUS_NODE] <br />
                 Target: /root/SECRET_ACCESS.key <br />
                 Protocol: UNAUTHORIZED_MD5_BYPASS
               </p>
            </div>

            <p className="text-gray-400 text-sm mb-10 leading-relaxed font-medium">
              System has entered <span className="text-red-400 font-bold">FULL LOCKDOWN</span>. <br /> 
              All external ports closed. Kernel sensors are isolating the threat.
            </p>

            <button 
              onClick={onRecover}
              className="w-full py-4 bg-red-500 text-black font-black uppercase tracking-widest rounded-sm hover:bg-white transition-all flex items-center justify-center gap-2 group shadow-neon-strong"
            >
              RUN EMERGENCY RECOVERY PROTOCOL <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
            
            <div className="mt-8 flex justify-center gap-8 opacity-40">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-8 h-1 bg-red-500 animate-pulse" />
                    <span className="text-[8px] font-mono font-bold">SEC_{i+1}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockdownOverlay;
