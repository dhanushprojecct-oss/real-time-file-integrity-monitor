import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, Zap, Info, Mail, Menu as MenuIcon, X } from 'lucide-react';

const Navbar = ({ onOpenDocs }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home', icon: Zap, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { id: 'features', label: 'Features', icon: Info, action: () => scrollTo('features') },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => scrollTo('dashboard') },
    { id: 'contact', label: 'Contact', icon: Mail, action: () => scrollTo('contact') },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card px-8 py-4 border-white/5 relative z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Shield className="w-8 h-8 text-cyber-blue" />
          <span className="text-xl font-bold tracking-tighter neon-text">FIM.CORE</span>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          {navLinks.map((link) => (
            <button key={link.id} onClick={link.action} className="hover:text-cyber-blue transition-colors flex items-center gap-2">
              <link.icon className="w-4 h-4" /> {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => scrollTo('dashboard')}
            className="hidden sm:block px-5 py-2 glass-card border-cyber-blue/30 text-cyber-blue text-sm font-bold hover:neon-border transition-all duration-300"
          >
            LAUNCH SYSTEM
          </button>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-6 right-6 glass-card border-white/10 bg-cyber-dark/95 backdrop-blur-xl p-6 md:hidden z-40"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <button 
                  key={link.id} 
                  onClick={link.action} 
                  className="flex items-center gap-4 text-lg font-medium text-gray-300 hover:text-cyber-blue transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <link.icon className="w-6 h-6" /> {link.label}
                </button>
              ))}
              <div className="h-px bg-white/5 w-full my-2" />
              <button 
                onClick={() => scrollTo('dashboard')}
                className="w-full py-4 bg-cyber-blue text-black font-bold uppercase tracking-widest rounded-lg hover:shadow-neon transition-all"
              >
                LAUNCH SYSTEM
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
