import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import MonitoringDashboard from './components/MonitoringDashboard';
import About from './components/About';
import Contact from './components/Contact';
import MatrixBackground from './components/MatrixBackground';
import Modal from './components/Modal';
import LockdownOverlay from './components/LockdownOverlay';
import { SHA256Calculator, AlertSettings } from './components/FeatureDemos';

function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [isLockdown, setIsLockdown] = useState(false);
  const [scanTrigger, setScanTrigger] = useState(0);

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);
  const triggerLockdown = () => setIsLockdown(true);
  const recoverSystem = () => setIsLockdown(false);
  const triggerScan = () => {
    setScanTrigger(prev => prev + 1);
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'sha256': return <SHA256Calculator />;
      case 'alerts': return <AlertSettings />;
      case 'incident': return (
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
             <div className="flex items-center gap-3 text-red-500 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-mono text-sm font-black uppercase tracking-tighter">Forensic Breakdown: INF-9421</span>
             </div>
             <p className="text-xs text-gray-400">Automated isolation completed at {new Date().toLocaleTimeString()}. Detailed trace below.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Attack Source</p>
              <p className="font-mono text-xs text-cyber-blue">IP: 192.168.1.254</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Target Node</p>
              <p className="font-mono text-xs text-cyber-blue">ROOT_ACCESS.key</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] text-gray-500 font-bold uppercase">Event Timeline</p>
            <div className="space-y-3 font-mono text-[10px]">
               <div className="flex gap-4 p-2 bg-white/5 rounded border-l-2 border-cyber-cyan">
                  <span className="text-gray-500 shrink-0">17:54:02</span>
                  <span className="text-gray-300">Initial Probe: Port 22 SSH attempt detected.</span>
               </div>
               <div className="flex gap-4 p-2 bg-white/5 rounded border-l-2 border-cyber-cyan">
                  <span className="text-gray-500 shrink-0">17:54:15</span>
                  <span className="text-gray-300">Pattern Match: Cryptographic salt-bypass identified.</span>
               </div>
               <div className="flex gap-4 p-2 bg-red-500/10 rounded border-l-2 border-red-500">
                  <span className="text-red-500 shrink-0">17:55:01</span>
                  <span className="text-red-400">CRITICAL: Honeypot modified. Lockdown triggered.</span>
               </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
             <button className="w-full py-3 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue text-[10px] font-bold uppercase tracking-widest rounded hover:bg-cyber-blue/20 transition-all">
                Download Full Forensic Dump (.bin)
             </button>
          </div>
        </div>
      );
      case 'docs': return (
        <div className="space-y-4 text-sm text-gray-400">
          <p className="text-white font-bold">What is FIM CORE?</p>
          <p>FIM (File Integrity Monitoring) is a critical security control that involves observing unauthorized file system changes.</p>
          <p className="text-white font-bold">Key Commands:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><code className="text-cyber-green">scan --all</code>: Performs a deep crypto-check of all monitored paths.</li>
            <li><code className="text-cyber-green">add [path]</code>: Registers a new file in the secure database.</li>
            <li><code className="text-cyber-green">logs --tail</code>: Streams real-time integrity events.</li>
          </ul>
          <p>Our system uses SHA-256 hashing to create a baseline of your files. Every time a file is accessed, its hash is recalculated and compared to the baseline.</p>
        </div>
      );
      default: return null;
    }
  };

  const getModalTitle = () => {
    switch (activeModal) {
      case 'sha256': return 'SHA-256 Integrity Demo';
      case 'alerts': return 'Alert Configuration';
      case 'incident': return 'Threat Forensic Report';
      case 'docs': return 'System Documentation';
      default: return '';
    }
  };

  return (
    <div className={`relative min-h-screen bg-cyber-dark text-white selection:bg-cyber-blue selection:text-black transition-colors duration-1000 ${isLockdown ? 'bg-red-950/20' : ''}`}>
      <MatrixBackground isLockdown={isLockdown} />
      <Navbar onOpenDocs={() => openModal('docs')} />
      
      <main className={`${isLockdown ? 'pointer-events-none grayscale opacity-30 blur-md' : ''} transition-all duration-1000`}>
        <Hero onOpenDashboard={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })} onOpenDocs={() => openModal('docs')} />
        <Features onOpenModal={openModal} />
        
        {/* Visual Separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        
        <MonitoringDashboard 
          isLockdown={isLockdown} 
          onTriggerLockdown={triggerLockdown} 
          onRecover={recoverSystem} 
          scanTrigger={scanTrigger}
          onOpenIncident={openModal}
        />
        
        <About onOpenModal={openModal} onTriggerScan={triggerScan} />

        <Contact />
      </main>

      <LockdownOverlay isActive={isLockdown} onRecover={recoverSystem} />

      <Modal 
        isOpen={activeModal !== null} 
        onClose={closeModal} 
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>

      <footer className="py-12 px-6 border-t border-white/5 bg-black/60 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-cyber-blue rounded-sm" />
              <span className="text-xl font-bold tracking-tighter neon-text">FIM.CORE</span>
            </div>
            <p className="text-gray-500 text-sm">
              Advanced File Integrity Monitoring for Decentralized Infrastructure.
            </p>
          </div>

          <div className="flex gap-8 text-sm text-gray-500">
             <button onClick={() => alert('Privacy Policy encrypted for your protection.')} className="hover:text-cyber-blue transition-colors">Privacy Policy</button>
             <button onClick={() => alert('Terms of Service: Protect the network at all costs.')} className="hover:text-cyber-blue transition-colors">Terms of Service</button>
             <button onClick={() => openModal('docs')} className="hover:text-cyber-blue transition-colors">Documentation</button>
          </div>

          <div className="text-gray-600 text-xs font-mono">
            © 2026 ANTIGRAVITY SECURITY. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
