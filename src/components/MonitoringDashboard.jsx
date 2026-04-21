import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Search, Trash2, PlusCircle, AlertCircle, Cpu } from 'lucide-react';

const MonitoringDashboard = ({ isLockdown, onTriggerLockdown, onRecover, scanTrigger, onOpenIncident }) => {
  const [logs, setLogs] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [monitoredFiles, setMonitoredFiles] = useState([
    '/etc/shadow',
    '/var/log/auth.log',
    '/usr/bin/sudo',
    '/home/admin/secret.key',
    '/etc/nginx/nginx.conf'
  ]);
  const [honeypots, setHoneypots] = useState([]);
  const [activeThreat, setActiveThreat] = useState(null);
  const [newPath, setNewPath] = useState('');
  const [systemStatus, setSystemStatus] = useState('ACTIVE');
  const [stats, setStats] = useState({
    scans: 12482,
    threats: 142,
    reliability: 94
  });
  const scrollRef = useRef(null);

  // Generate random hash
  const generateHash = () => {
    return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const actions = ['MODIFIED', 'DELETED', 'ADDED'];

  const addLog = (forcedAction = null, forcedFile = null) => {
    const action = forcedAction || actions[Math.floor(Math.random() * actions.length)];
    const file = forcedFile || monitoredFiles[Math.floor(Math.random() * monitoredFiles.length)];
    
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      file: file,
      action: action,
      hash: generateHash(),
      status: action === 'MODIFIED' ? 'CRITICAL' : 'WARNING'
    };

    setLogs(prev => [newLog, ...prev].slice(0, 50));
    setStats(prev => ({ 
      ...prev, 
      scans: prev.scans + 1,
      threats: action === 'MODIFIED' ? prev.threats + 1 : prev.threats
    }));

    // Logic to detect honeypot breach
    if (action === 'MODIFIED' && honeypots.some(hp => hp.path === file)) {
      setActiveThreat({
        origin: '192.168.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255),
        target: file,
        vector: 'MD5_COLLISION_ATTEMPT'
      });
      setTimeout(() => onTriggerLockdown(), 1500);
    }
  };

  const deployHoneypot = () => {
    const decoyPaths = ['/root/SECRET_ACCESS.key', '/var/secure/PASSWORDS.db', '/etc/sudoers.bak', '/usr/bin/kernel_patch'];
    const path = decoyPaths[Math.floor(Math.random() * decoyPaths.length)];
    if (!honeypots.find(h => h.path === path)) {
      const newHp = { id: Date.now(), path, status: 'DEPLOYED' };
      setHoneypots(prev => [...prev, newHp]);
      setMonitoredFiles(prev => [...prev, path]);
      addLog('DEPLOYED', path);
    }
  };

  const handleAddPath = (e) => {
    e.preventDefault();
    if (newPath && !monitoredFiles.includes(newPath)) {
      setMonitoredFiles(prev => [...prev, newPath]);
      addLog('ADDED', newPath);
      setNewPath('');
    }
  };

  const forceScan = () => {
    setSystemStatus('SCANNING');
    setTimeout(() => {
      addLog('INTEGRITY_CHECK', monitoredFiles[Math.floor(Math.random() * monitoredFiles.length)]);
      setSystemStatus('ACTIVE');
    }, 1000);
  };

  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        addLog();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, monitoredFiles]);

  useEffect(() => {
     setSystemStatus(isMonitoring ? 'ACTIVE' : 'PAUSED');
  }, [isMonitoring]);

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
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full animate-pulse">
                  {systemStatus}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Scans:</span>
                  <span className="text-cyber-blue font-mono">{stats.scans.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Threats Resolved:</span>
                  <span className="text-cyber-blue font-mono">{stats.threats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Sensors:</span>
                  <span className="text-cyber-blue font-mono">{stats.reliability}%</span>
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
                  Network Activity Monitor
                </p>
              </div>
            </div>

            <div className="glass-card p-6 border-white/5 space-y-4">
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dashboard Controls</h3>
               
               <button 
                 onClick={() => setIsMonitoring(!isMonitoring)}
                 className={`w-full py-3 rounded font-bold text-xs transition-all border ${
                   isMonitoring 
                   ? 'bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20' 
                   : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500/20'
                 }`}
               >
                 {isMonitoring ? 'STOP MONITORING' : 'START MONITORING'}
               </button>

               <div className="flex gap-2">
                 <button 
                   onClick={forceScan}
                   className="flex-1 py-3 bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue rounded font-bold text-xs hover:bg-cyber-blue/20 transition-all font-mono"
                 >
                   FORCE SCAN
                 </button>
                 <button 
                   onClick={() => setLogs([])}
                   className="px-4 py-3 bg-white/5 border border-white/10 text-gray-400 rounded hover:text-white transition-all"
                   title="Clear Logs"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
               </div>

               <form onSubmit={handleAddPath} className="pt-4 border-t border-white/5">
                 <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Monitor New Path</label>
                 <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={newPath}
                     onChange={(e) => setNewPath(e.target.value)}
                     placeholder="/path/to/file..."
                     className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-xs focus:border-cyber-blue outline-none transition-colors"
                   />
                   <button type="submit" className="p-2 bg-cyber-blue text-black rounded hover:shadow-neon transition-all">
                     <PlusCircle className="w-4 h-4" />
                   </button>
                 </div>
               </form>
            </div>

            <div className="glass-card p-6 border-red-500/10 bg-red-500/5">
               <div className="flex items-center gap-3 text-red-400 mb-4 font-bold">
                  <AlertCircle className="w-5 h-5" /> RECENT THREATS
               </div>
               <p className="text-sm text-gray-400 mb-4">
                 {stats.threats} unauthorized access attempts blocked automatically.
               </p>
               <button 
                 onClick={() => onOpenIncident('incident')}
                 className="w-full py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30 hover:bg-red-500/30 transition-all uppercase tracking-widest"
               >
                 View Incident Report
               </button>
            </div>
          </div>

          {/* Monitoring Panel */}
          <div className="w-full md:w-2/3 space-y-6">
            {/* Advanced Threat Projection Map */}
            <div className="glass-card border-white/5 p-4 h-[250px] relative overflow-hidden bg-black/60">
               <div className="absolute top-4 left-4 z-10">
                  <h4 className="text-[10px] font-black text-cyber-blue uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyber-blue rounded-full animate-ping" /> Guardian AI: Neural Threat Projection
                  </h4>
               </div>
               
               {/* Simulated Map SVG */}
               <svg className="w-full h-full opacity-40">
                  <defs>
                    <radialGradient id="threatGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#f00" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#f00" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  {[...Array(10)].map((_, i) => (
                    <line key={`v-${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="rgba(0, 243, 255, 0.05)" />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <line key={`h-${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="rgba(0, 243, 255, 0.05)" />
                  ))}

                  {/* Nodes */}
                  {[...Array(6)].map((_, i) => (
                    <circle key={i} cx={`${20 + i * 15}%`} cy={`${30 + (i % 3) * 20}%`} r="3" fill="#00f3ff" />
                  ))}

                  {/* Active Threat Projection */}
                  {activeThreat && (
                    <g>
                      <motion.circle 
                        initial={{ r: 0, opacity: 0 }}
                        animate={{ r: [0, 50, 0], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        cx="70%" cy="50%" fill="url(#threatGrad)" 
                      />
                      <motion.line 
                        initial={{ x2: '70%', y2: '50%' }}
                        animate={{ x1: ['20%', '70%'], y1: ['30%', '50%'] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        x2="70%" y2="50%" stroke="#f00" strokeWidth="2" strokeDasharray="4 2"
                      />
                      <text x="72%" y="48%" fill="#f00" fontSize="10" className="font-mono font-bold animate-pulse">
                        ORIGIN: {activeThreat.origin}
                      </text>
                      <text x="72%" y="55%" fill="#f00" fontSize="8" className="font-mono font-bold">
                        VECTOR: {activeThreat.vector}
                      </text>
                    </g>
                  )}
               </svg>

               <div className="absolute bottom-4 right-4 text-[9px] font-mono text-gray-500 uppercase tracking-tighter text-right">
                  System Mesh: Operational <br />
                  Latent Nodes: 4.2k <br />
                  <span className={activeThreat ? 'text-red-500 font-bold animate-pulse' : ''}>
                    Status: {activeThreat ? 'INTRUSION_IN_PROGRESS' : 'SECURE_IDLE'}
                  </span>
               </div>
            </div>

            {/* Standard Stream with Honeypot Lab */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 glass-card border-white/5 flex flex-col h-[400px]">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-gray-400" />
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-widest font-bold">Monitoring Stream</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] custom-scrollbar" ref={scrollRef}>
                  <AnimatePresence initial={false}>
                    {logs.length === 0 && (
                      <div className="h-full flex items-center justify-center text-gray-600 italic">
                        Initializing sensors... Waiting for events.
                      </div>
                    )}
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 p-3 bg-white/5 rounded border-l-2 border-transparent hover:border-cyber-blue transition-colors group"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-500">[{log.timestamp}]</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            log.action === 'MODIFIED' || log.action === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
                            log.action === 'ADDED' || log.action === 'DEPLOYED' ? 'bg-green-500/20 text-green-400' : 
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <p className="text-cyber-cyan mb-1 flex items-center gap-1.5">
                              {log.action === 'MODIFIED' ? <Search className="w-3 h-3" /> : 
                               log.action === 'ADDED' ? <PlusCircle className="w-3 h-3" /> : 
                               <Trash2 className="w-3 h-3" />}
                              {log.file}
                            </p>
                            <p className="text-gray-600 break-all text-[11px] leading-tight">
                              HASH: {log.hash}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Honeypot Lab Panel */}
              <div className="w-full lg:w-72 glass-card border-white/5 p-4 bg-cyber-blue/5">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <AlertCircle className="w-3 h-3 text-cyber-blue" /> Honeypot Lab
                 </h4>
                 
                 <button 
                   onClick={deployHoneypot}
                   className="w-full py-2 bg-cyber-blue/20 border border-cyber-blue/40 text-cyber-blue text-[10px] font-bold rounded mb-4 hover:bg-cyber-blue/30 transition-all uppercase tracking-widest"
                 >
                   Deploy Autonomous Decoy
                 </button>

                 <div className="space-y-2">
                    <p className="text-[9px] text-gray-500 font-bold uppercase mb-2">Active Decoys</p>
                    {honeypots.length === 0 && <p className="text-[10px] text-gray-600 italic">No decoys deployed.</p>}
                    {honeypots.map(hp => (
                      <div key={hp.id} className="p-2 bg-black/40 border border-white/5 rounded flex items-center justify-between group">
                        <div className="truncate flex-1 mr-2">
                           <p className="text-[10px] text-cyber-cyan truncate">{hp.path}</p>
                           <p className="text-[8px] text-gray-600 uppercase font-bold tracking-widest">Status: {hp.status}</p>
                        </div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                      </div>
                    ))}
                 </div>

                 <div className="mt-8 pt-4 border-t border-white/5">
                    <p className="text-[8px] text-gray-500 leading-relaxed uppercase font-medium">
                      Note: Vulnerable decoy files attract autonomous bots. If a decoy is modified, the system enters Lockdown Protocol.
                    </p>
                 </div>
              </div>
            </div>

            <div className="p-2 bg-black/40 border-t border-white/5 flex items-center gap-3">
               <span className="text-cyber-green px-2">{`>`}</span>
               <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden flex items-center px-2">
                  <motion.div 
                    animate={{ opacity: [0, 1] }} 
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-3 bg-cyber-green" 
                  />
                  <span className="text-[10px] text-gray-500 ml-2">Guardian AI active... Monitoring neural web for anomalies</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MonitoringDashboard;
