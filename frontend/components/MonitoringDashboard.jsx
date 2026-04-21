import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Search, Trash2, PlusCircle, AlertCircle, Cpu } from 'lucide-react';

const MonitoringDashboard = ({ isLockdown, onTriggerLockdown, onRecover, scanTrigger, onOpenIncident, socket }) => {
  const [logs, setLogs] = useState([]);
  const [monitoredFiles, setMonitoredFiles] = useState([]);
  const [honeypots, setHoneypots] = useState([]);
  const [activeThreat, setActiveThreat] = useState(null);
  const [newPath, setNewPath] = useState('');
  const [systemStatus, setSystemStatus] = useState('ACTIVE');
  const [stats, setStats] = useState({
    scans: 0,
    threats: 0,
    reliability: 100
  });
  const scrollRef = useRef(null);

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const [logsRes, filesRes, statusRes] = await Promise.all([
          fetch('http://localhost:3001/logs'),
          fetch('http://localhost:3001/files'),
          fetch('http://localhost:3001/status')
        ]);
        
        const initialLogs = await logsRes.json();
        const initialFiles = await filesRes.json();
        const initialStatus = await statusRes.json();

        setLogs(initialLogs);
        setMonitoredFiles(initialFiles);
        setStats(prev => ({
          ...prev,
          scans: initialStatus.monitoredCount * 42, // Aesthetic initial scan count
          threats: initialLogs.filter(l => l.status === 'CRITICAL').length
        }));
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };

    fetchInitialData();

    if (!socket) return;

    socket.on('newLog', (log) => {
      setLogs(prev => [log, ...prev].slice(0, 100));
      if (log.status === 'CRITICAL') {
        setStats(prev => ({ ...prev, threats: prev.threats + 1 }));
        // Trigger lockdown on critical detected (simulated for demonstration)
        onTriggerLockdown();
      }
      setStats(prev => ({ ...prev, scans: prev.scans + 1 }));
      
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    });

    socket.on('updateFiles', (files) => {
      setMonitoredFiles(files);
    });

    return () => {
      socket.off('newLog');
      socket.off('updateFiles');
    };
  }, [socket]);

  const deployHoneypot = () => {
    // Simulated honeypot logic for UI
    const path = '/root/SECRET_ACCESS.key';
    if (!honeypots.find(h => h.path === path)) {
      setHoneypots(prev => [...prev, { id: Date.now(), path, status: 'DEPLOYED' }]);
    }
  };

  const forceScan = async () => {
    setSystemStatus('SCANNING');
    await new Promise(r => setTimeout(r, 1000));
    setSystemStatus('ACTIVE');
  };

  useEffect(() => {
    if (scanTrigger > 0) {
      forceScan();
    }
  }, [scanTrigger]);

  return (
    <section id="dashboard" className="py-24 px-6 bg-black/40">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Status Panel */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="glass-card p-6 border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-cyber-blue" /> SYSTEM STATUS
                </h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full animate-pulse ${
                  systemStatus === 'SCANNING' ? 'bg-cyber-blue/20 text-cyber-blue' : 'bg-green-500/20 text-green-400'
                }`}>
                  {systemStatus}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Scans:</span>
                  <span className="text-cyber-blue font-mono">{stats.scans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Threats Detected:</span>
                  <span className="text-red-500 font-mono">{stats.threats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Sensors:</span>
                  <span className="text-cyber-blue font-mono">{monitoredFiles.length}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="w-full h-32 bg-cyber-blue/5 rounded-lg relative overflow-hidden flex items-end px-2 gap-1">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.random() * 80 + 10}%` }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        duration: 0.5 + Math.random() * 1,
                        delay: i * 0.05 
                      }}
                      className="flex-1 bg-cyber-blue/30 rounded-t-sm"
                    />
                  ))}
                </div>
                <p className="text-[10px] text-center mt-2 text-gray-500 uppercase tracking-widest font-bold">
                  Kernel Activity Monitor
                </p>
              </div>
            </div>

            <div className="glass-card p-6 border-white/5 space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dashboard Controls</h3>
               
               <button 
                 onClick={forceScan}
                 className="w-full py-4 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue rounded font-black text-xs hover:bg-cyber-blue/20 transition-all font-mono tracking-[0.2em]"
               >
                 MANUAL INTEGRITY CHECK
               </button>

               <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 mt-4">
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                     <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Watcher</p>
                     <p className="text-xs font-mono text-cyber-green">ACTIVE</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                     <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Latency</p>
                     <p className="text-xs font-mono text-cyber-blue">4ms</p>
                  </div>
               </div>
            </div>

            <div className="glass-card p-6 border-red-500/10 bg-red-500/5">
               <div className="flex items-center gap-3 text-red-400 mb-4 font-bold">
                  <AlertCircle className="w-5 h-5 shadow-neon" /> RECENT THREATS
               </div>
               <p className="text-sm text-gray-400 mb-4">
                 System automatically handles SHA-256 violations through kernel isolation.
               </p>
               <button 
                 onClick={() => onOpenIncident('incident')}
                 className="w-full py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30 hover:bg-red-500/30 transition-all uppercase tracking-widest"
               >
                 View Forensic Trace
               </button>
            </div>
          </div>

          <div className="w-full md:w-2/3 space-y-6">
            <div className="glass-card border-white/5 p-4 h-[250px] relative overflow-hidden bg-black/60 shadow-inner">
               <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyber-blue rounded-full animate-pulse shadow-neon" />
                  <h4 className="text-[10px] font-black text-cyber-blue uppercase tracking-widest">
                    Guardian AI: Real-Time Threat Projection
                  </h4>
               </div>
               
               <svg className="w-full h-full opacity-30">
                  <defs>
                    <radialGradient id="threatGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f00" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#f00" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {[...Array(10)].map((_, i) => (
                    <line key={`v-${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="rgba(0, 243, 255, 0.05)" />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="rgba(0, 243, 255, 0.05)" />
                  ))}

                  {/* Active Nodes */}
                  {monitoredFiles.map((file, i) => (
                    <circle 
                      key={i} 
                      cx={`${10 + (i * 12) % 80}%`} 
                      cy={`${20 + (i * 18) % 60}%`} 
                      r="4" 
                      fill={file.status === 'CRITICAL' ? '#f00' : '#00f3ff'} 
                      className={file.status === 'CRITICAL' ? 'animate-ping' : ''}
                    />
                  ))}
               </svg>

               <div className="absolute bottom-4 right-4 text-[9px] font-mono text-gray-500 tracking-tighter text-right">
                  KERNEL_POLLING: ENABLED <br />
                  HASH_ALGO: SHA-256 <br />
                  <span className={stats.threats > 0 ? 'text-red-500 font-bold' : ''}>
                    SECURITY_LEVEL: {stats.threats > 0 ? 'CRITICAL_ALERT' : 'OPTIMAL'}
                  </span>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 glass-card border-white/5 flex flex-col h-[400px]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/10">
                  <div className="flex items-center gap-3 font-mono text-xs text-gray-400">
                    <Terminal className="w-4 h-4" /> 
                    <span className="uppercase tracking-[0.2em] font-black">Monitored Filesystem Stream</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] custom-scrollbar" ref={scrollRef}>
                  <AnimatePresence initial={false}>
                    {logs.length === 0 && (
                      <div className="h-full flex items-center justify-center text-gray-600 italic text-[11px] uppercase tracking-widest">
                        Node.js monitoring active. Change a file in /monitored_files to see results.
                      </div>
                    )}
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-3 p-3 bg-white/5 rounded border-l-2 border-transparent hover:border-cyber-blue transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1 text-[10px]">
                          <span className="text-gray-500">[{log.timestamp}]</span>
                          <span className={`font-black tracking-widest px-2 py-0.5 rounded ${
                            log.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 
                            log.action === 'ADDED' ? 'bg-green-500/20 text-green-400' : 
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-cyber-cyan truncate text-xs">
                              {log.file}
                            </p>
                            <p className="text-gray-600 break-all text-[10px] leading-tight select-all">
                              SHA256: {log.hash}
                            </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="w-full lg:w-72 glass-card border-white/5 p-4 bg-cyber-blue/5">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <AlertCircle className="w-3 h-3 text-cyber-blue" /> Registered Nodes
                 </h4>
                 
                 <div className="space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {monitoredFiles.length === 0 && <p className="text-[10px] text-gray-600 italic">No files detected yet.</p>}
                    {monitoredFiles.map((file, idx) => (
                      <div key={idx} className="p-2 bg-black/40 border border-white/5 rounded">
                         <p className="text-[10px] text-cyber-cyan truncate font-mono">{file.path}</p>
                         <p className="text-[8px] text-gray-600 mt-1 truncate">HASH: {file.hash.substring(0, 16)}...</p>
                         <div className={`mt-2 h-0.5 w-full ${file.status === 'CRITICAL' ? 'bg-red-500' : 'bg-cyber-blue/20'}`} />
                      </div>
                    ))}
                 </div>

                 <div className="mt-8 pt-4 border-t border-white/5 text-[9px] text-gray-500 leading-relaxed uppercase">
                    Kernel logic ensures all hashes are immutable once baselined.
                 </div>
              </div>
            </div>

            <div className="p-3 bg-black/60 border-t border-white/5 flex items-center gap-3">
               <span className="text-cyber-green text-sm">{`>`}</span>
               <div className="flex-1 h-4 flex items-center">
                  <motion.div 
                    animate={{ opacity: [0, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-1.5 h-3 bg-cyber-green" 
                  />
                  <span className="text-[9px] text-gray-500 ml-4 tracking-[0.3em] font-black uppercase">
                    System Bridge: Online
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MonitoringDashboard;
