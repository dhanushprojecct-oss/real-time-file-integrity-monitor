import React from 'react';
import { motion } from 'framer-motion';
import { Database, Fingerprint, Search, Bell } from 'lucide-react';

const steps = [
  {
    title: "Data Acquisition",
    description: "Scan file system and capture binary data streams.",
    icon: Database
  },
  {
    title: "SHA-256 Hashing",
    description: "Generate unique cryptographic fingerprints for every file.",
    icon: Fingerprint
  },
  {
    title: "Baseline Comparison",
    description: "Compare current hashes against the secure baseline database.",
    icon: Search
  },
  {
    title: "Immediate Alerting",
    description: "Trigger security protocols if any unauthorized changes occur.",
    icon: Bell
  }
];

const About = ({ onOpenModal, onTriggerScan }) => {
  const handleStepClick = (index) => {
    switch (index) {
      case 0: // Data Acquisition
        onTriggerScan();
        break;
      case 1: // SHA-256
        onOpenModal('sha256');
        break;
      case 2: // Baseline
        onTriggerScan();
        break;
      case 3: // Alerting
        onOpenModal('alerts');
        break;
      default:
        break;
    }
  };

  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyber-blue/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 italic tracking-tighter uppercase underline decoration-cyber-blue decoration-4 underline-offset-8">
            How FIM.Core Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mt-8">
            The architecture follows a zero-trust model, assuming every file is a potential attack vector until cryptographically verified.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleStepClick(index)}
                className="flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-20 h-20 rounded-2xl bg-cyber-dark border border-white/10 flex items-center justify-center mb-6 group-hover:neon-border group-hover:scale-110 group-hover:shadow-neon transition-all duration-300">
                   <step.icon className="w-10 h-10 text-cyber-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cyber-blue transition-colors">{step.title}</h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                  {step.description}
                </p>
                <div className="mt-4 text-[10px] font-mono text-gray-600 bg-white/5 py-1 px-3 rounded uppercase tracking-[0.2em] group-hover:bg-cyber-blue/10 group-hover:text-cyber-blue transition-all">
                   Phase 0{index + 1}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
