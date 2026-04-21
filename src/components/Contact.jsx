import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2 space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Contact Security Ops</h2>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Need specialized file integrity consulting or enterprise support? Our team of security architects is available 24/7.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Mail, text: "ops@fimcore.security", label: "Email" },
                { icon: Phone, text: "+1 (555) 012-3456", label: "Emergency Line" },
                { icon: MapPin, text: "Sector 7-G, Cyber City, Global Net", label: "Address" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-cyber-blue/10 flex items-center justify-center border border-cyber-blue/20 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5 text-cyber-blue" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="glass-card p-8 border-white/5 relative overflow-hidden">
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-[400px] flex flex-col items-center justify-center text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-cyber-green/20 rounded-full flex items-center justify-center border border-cyber-green/30">
                    <Send className="w-8 h-8 text-cyber-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-cyber-green">Message Transmitted</h3>
                  <p className="text-gray-400 text-sm px-8">
                    Your request has been encrypted and sent to our security operations center.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Identifer (Name)</label>
                    <input 
                      required
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyber-blue outline-none transition-all"
                      placeholder="Agency or Individual Name"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Secure Email</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyber-blue outline-none transition-all"
                      placeholder="user@provider.com"
                      value={form.email}
                      onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Briefing (Message)</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyber-blue outline-none transition-all resize-none"
                      placeholder="Describe your security requirements..."
                      value={form.message}
                      onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="w-full py-4 bg-cyber-blue text-black font-bold uppercase tracking-widest rounded-lg hover:shadow-neon transition-all flex items-center justify-center gap-2">
                    SEND SECURE MESSAGE <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
