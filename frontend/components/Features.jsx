import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldOff, Bell, History } from 'lucide-react';

const features = [
  {
    title: "Real-Time Monitoring",
    description: "Instantaneous detection of file system events across your entire infrastructure.",
    icon: Activity,
    color: "text-blue-400"
  },
  {
    title: "SHA-256 Integrity",
    description: "Cryptographic hash verification ensures even a single byte change is detected.",
    icon: ShieldOff,
    color: "text-purple-400"
  },
  {
    title: "Automated Alerts",
    description: "Configurable notification system for critical file modifications and security breaches.",
    icon: Bell,
    color: "text-red-400"
  },
  {
    title: "Audit History",
    description: "Comprehensive logging of all file changes with precise timestamps and user data.",
    icon: History,
    color: "text-green-400"
  }
];

const Features = ({ onOpenModal }) => {
  const handleCardClick = (id) => {
    switch (id) {
      case 0: // Real-Time Monitoring
      case 3: // Audit History
        document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 1: // SHA-256 Integrity
        onOpenModal('sha256');
        break;
      case 2: // Automated Alerts
        onOpenModal('alerts');
        break;
      default:
        break;
    }
  };

  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Advanced Security Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our multi-layered approach to file integrity provides the visibility you need to maintain a zero-trust environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => handleCardClick(index)}
              className="glass-card p-8 border-white/5 hover:border-cyber-blue/50 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                Launch Feature Demo <span>→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
