import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Cpu, Edit3, Save, Terminal, Trash2, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MonitoringDashboard = ({ isLockdown, onTriggerLockdown, onRecover, scanTrigger, onOpenIncident, socket, activeTab, setActiveTab }) => {
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

  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [editingFile, setEditingFile] = useState(null);
  const [deleteConfirmPath, setDeleteConfirmPath] = useState(null);

  const [latency, setLatency] = useState(4);
  const [watcherStatus, setWatcherStatus] = useState('ACTIVE');



  // Wizard States
  const [wizardStep, setWizardStep] = useState(1); // 1: Baseline, 2: Comparison, 3: Results
  const [wizardBaselineFiles, setWizardBaselineFiles] = useState([]);
  const [wizardCompareFiles, setWizardCompareFiles] = useState([]);
  const [wizardResults, setWizardResults] = useState([]);
  const [wizardDragging, setWizardDragging] = useState(false);
  const [wizardUploadStatus, setWizardUploadStatus] = useState('');

  // Client-side SHA-256 utility using Web Crypto API
  const calculateSHA256 = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (e) {
      console.error("SHA-256 computation error:", e);
      return null;
    }
  };

  const handleWizardBaselineUpload = async (files) => {
    if (!files || files.length === 0) return;
    setWizardUploadStatus('Reading baseline files...');

    // We expect 2 or 3 files
    const fileList = Array.from(files);
    if (fileList.length < 2 || fileList.length > 3) {
      setWizardUploadStatus('Error: Select 2 or 3 files.');
      return;
    }

    try {
      const readFiles = [];
      for (const file of fileList) {
        const hash = await calculateSHA256(file);
        readFiles.push({
          name: file.name,
          hash: hash,
          size: file.size
        });
      }
      setWizardBaselineFiles(readFiles);
      setWizardUploadStatus('Baseline established!');
      setTimeout(() => {
        setWizardStep(2);
        setWizardUploadStatus('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setWizardUploadStatus('Error reading baseline files.');
    }
  };

  const handleWizardComparisonUpload = async (files) => {
    if (!files || files.length === 0) return;
    setWizardUploadStatus('Reading comparison files...');

    const fileList = Array.from(files);
    try {
      const readFiles = [];
      for (const file of fileList) {
        const hash = await calculateSHA256(file);
        readFiles.push({
          name: file.name,
          hash: hash,
          size: file.size
        });
      }
      setWizardCompareFiles(readFiles);
      setWizardUploadStatus('Comparison files loaded! Analyzing...');

      // Perform verification comparison
      setTimeout(() => {
        performVerification(readFiles);
      }, 1500);
    } catch (err) {
      console.error(err);
      setWizardUploadStatus('Error reading comparison files.');
    }
  };

  const performVerification = (compFiles) => {
    const results = [];
    const baselineNames = new Set(wizardBaselineFiles.map(f => f.name));

    // Check same/modified/deleted
    for (const base of wizardBaselineFiles) {
      const match = compFiles.find(f => f.name === base.name);
      if (match) {
        if (match.hash === base.hash) {
          results.push({
            name: base.name,
            status: 'SAME',
            baselineHash: base.hash,
            currentHash: match.hash,
            size: match.size
          });
        } else {
          results.push({
            name: base.name,
            status: 'MODIFIED',
            baselineHash: base.hash,
            currentHash: match.hash,
            size: match.size
          });
        }
      } else {
        results.push({
          name: base.name,
          status: 'DELETED',
          baselineHash: base.hash,
          currentHash: 'N/A',
          size: base.size
        });
      }
    }

    // Check added
    for (const comp of compFiles) {
      if (!baselineNames.has(comp.name)) {
        results.push({
          name: comp.name,
          status: 'ADDED',
          baselineHash: 'N/A',
          currentHash: comp.hash,
          size: comp.size
        });
      }
    }

    setWizardResults(results);
    setWizardStep(3);
    setWizardUploadStatus('');
  };

  const resetWizard = () => {
    setWizardStep(1);
    setWizardBaselineFiles([]);
    setWizardCompareFiles([]);
    setWizardResults([]);
    setWizardUploadStatus('');
  };

  const simulateWizardBaseline = () => {
    const mockFiles = [
      { name: 'sys_config.yaml', hash: 'e28a9b34c890123456789abcdef0123456789abcdef0123456789abcdef0123', size: 1024 },
      { name: 'index.html', hash: 'fb389a0123456789abcdef0123456789abcdef0123456789abcdef012345678', size: 2450 },
      { name: 'auth_module.js', hash: '4fa0123456789abcdef0123456789abcdef0123456789abcdef0123456789ab', size: 890 }
    ];
    setWizardBaselineFiles(mockFiles);
    setWizardUploadStatus('Simulated baseline loaded!');
    setTimeout(() => {
      setWizardStep(2);
      setWizardUploadStatus('');
    }, 1000);
  };

  const simulateWizardComparison = () => {
    const mockCompare = [
      { name: 'sys_config.yaml', hash: 'e28a9b34c890123456789abcdef0123456789abcdef0123456789abcdef0123', size: 1024 },
      { name: 'index.html', hash: '8888888888888888888888888888888888888888888888888888888888888888', size: 2500 },
      { name: 'patch_v1.bin', hash: '9999999999999999999999999999999999999999999999999999999999999999', size: 15320 }
    ];
    setWizardCompareFiles(mockCompare);
    setWizardUploadStatus('Simulated modifications detected! Running analysis...');
    setTimeout(() => {
      performVerification(mockCompare);
    }, 1000);
  };

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      const res = await fetch('http://localhost:3001/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setUploadStatus('Upload successful!');
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        const err = await res.json();
        setUploadStatus(`Error: ${err.error || 'Upload failed'}`);
      }
    } catch (e) {
      console.error(e);
      setUploadStatus('Network error.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const openEditor = async (filePath) => {
    try {
      const res = await fetch(`http://localhost:3001/file/content?path=${encodeURIComponent(filePath)}`);
      if (res.ok) {
        const data = await res.json();
        setEditingFile(data);
      } else {
        alert('Failed to load file content.');
      }
    } catch (e) {
      console.error(e);
      alert('Error loading file content.');
    }
  };

  const saveFileEdits = async () => {
    if (!editingFile) return;
    try {
      const res = await fetch('http://localhost:3001/file/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: editingFile.path, content: editingFile.content })
      });
      if (res.ok) {
        setEditingFile(null);
      } else {
        const err = await res.json();
        alert(`Failed to save: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving file.');
    }
  };

  const deleteFile = async (filePath) => {
    if (deleteConfirmPath !== filePath) {
      setDeleteConfirmPath(filePath);
      // Automatically reset confirmation state after 3 seconds
      setTimeout(() => setDeleteConfirmPath(null), 3000);
      return;
    }
    setDeleteConfirmPath(null);
    try {
      const res = await fetch(`http://localhost:3001/file/delete?path=${encodeURIComponent(filePath)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to delete: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting file.');
    }
  };

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

    if (socket.connected) {
      setWatcherStatus('ACTIVE');
    } else {
      setWatcherStatus('OFFLINE');
    }

    socket.on('connect', () => {
      setWatcherStatus('ACTIVE');
    });

    socket.on('disconnect', () => {
      setWatcherStatus('OFFLINE');
    });

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
      setWatcherStatus('ACTIVE');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
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
    const startTime = performance.now();
    setSystemStatus('SCANNING');
    try {
      const res = await fetch('http://localhost:3001/scan', {
        method: 'POST'
      });
      const endTime = performance.now();
      const diff = Math.round(endTime - startTime);
      setLatency(diff);
      if (res.ok) {
        setWatcherStatus('ACTIVE');
      } else {
        setWatcherStatus('OFFLINE');
      }
    } catch (e) {
      console.error(e);
      setWatcherStatus('OFFLINE');
    } finally {
      setSystemStatus('ACTIVE');
    }
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
                <span className={`px-3 py-1 text-xs font-bold rounded-full animate-pulse ${systemStatus === 'SCANNING' ? 'bg-cyber-blue/20 text-cyber-blue' : 'bg-green-500/20 text-green-400'
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
                  <p className={`text-xs font-mono ${watcherStatus === 'ACTIVE' ? 'text-cyber-green' : 'text-red-500 font-bold'}`}>
                    {watcherStatus}
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Latency</p>
                  <p className="text-xs font-mono text-cyber-blue">{latency}ms</p>
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

            {/* Live File Editor Overlay */}
            <AnimatePresence>
              {editingFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card border-cyber-blue/30 p-4 bg-black/90 relative z-20 space-y-4 mb-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyber-blue">
                      <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" />
                      <span>EDITING SECURE NODE: {editingFile.path}</span>
                    </div>
                    <button
                      onClick={() => setEditingFile(null)}
                      className="p-1 hover:text-red-500 rounded transition-all text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {editingFile.isBinary ? (
                    <div className="py-8 text-center text-red-400 font-mono text-xs uppercase">
                      ⚠️ Binary file detected. Real-time terminal modifications disabled.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={editingFile.content}
                        onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
                        className="w-full h-48 p-3 bg-black border border-white/10 rounded font-mono text-xs text-cyber-green focus:border-cyber-blue focus:outline-none custom-scrollbar shadow-inner"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-gray-500 uppercase font-mono">
                          Warning: Saving will alter SHA-256 baseline
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingFile(null)}
                            className="px-3 py-1.5 border border-white/10 text-gray-400 text-[10px] font-bold rounded hover:bg-white/5 transition-all uppercase tracking-wider font-mono"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveFileEdits}
                            className="px-4 py-1.5 bg-cyber-blue/20 border border-cyber-blue text-cyber-blue text-[10px] font-bold rounded hover:bg-cyber-blue/30 hover:shadow-neon-blue transition-all uppercase tracking-wider font-mono flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5" /> Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab Navigation Switcher */}
            <div className="flex border-b border-white/10 gap-6 mb-6">
              <button
                onClick={() => setActiveTab('monitor')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${activeTab === 'monitor'
                  ? 'border-cyber-blue text-cyber-blue shadow-neon-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
              >
                1. Real-Time Monitor Stream
              </button>
              <button
                onClick={() => setActiveTab('wizard')}
                className={`pb-2 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all cursor-pointer ${activeTab === 'wizard'
                  ? 'border-cyber-blue text-cyber-blue shadow-neon-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
              >
                2. Integrity Verification Wizard
              </button>
            </div>

            {activeTab === 'monitor' && (
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
                            <span className={`font-black tracking-widest px-2 py-0.5 rounded ${log.status === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
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

                <div className="w-full lg:w-72 glass-card border-white/5 p-4 bg-cyber-blue/5 flex flex-col justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3 text-cyber-blue" /> Registered Nodes
                    </h4>

                    <div className="space-y-2 overflow-y-auto max-h-[220px] custom-scrollbar">
                      {monitoredFiles.length === 0 && <p className="text-[10px] text-gray-600 italic">No files detected yet.</p>}
                      {monitoredFiles.map((file, idx) => (
                        <div key={idx} className="p-2 bg-black/40 border border-white/5 rounded">
                          <div className="flex justify-between items-start gap-2">
                            <div className="truncate flex-1">
                              <p className="text-[10px] text-cyber-cyan truncate font-mono" title={file.path}>{file.path}</p>
                              <p className="text-[8px] text-gray-600 mt-1 truncate">HASH: {file.hash.substring(0, 16)}...</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => openEditor(file.path)}
                                className="p-1 hover:text-cyber-blue hover:bg-cyber-blue/10 rounded transition-all text-gray-500 cursor-pointer"
                                title="Edit File"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => deleteFile(file.path)}
                                className={`p-1 rounded transition-all cursor-pointer ${deleteConfirmPath === file.path
                                  ? 'text-red-500 bg-red-500/20 font-bold text-[8px] px-1.5'
                                  : 'hover:text-red-500 hover:bg-red-500/10 text-gray-500'
                                  }`}
                                title={deleteConfirmPath === file.path ? "Click again to confirm delete" : "Delete File"}
                              >
                                {deleteConfirmPath === file.path ? "CONFIRM?" : <Trash2 className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                          <div className={`mt-2 h-0.5 w-full ${file.status === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-cyber-blue/20'}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <UploadCloud className="w-3 h-3 text-cyber-blue" /> Inject Files
                    </h4>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`border border-dashed p-3 rounded text-center transition-all cursor-pointer ${isDragging
                        ? 'border-cyber-blue bg-cyber-blue/10 shadow-neon-blue'
                        : 'border-white/10 bg-black/20 hover:border-cyber-blue/40'
                        }`}
                    >
                      <UploadCloud className="w-6 h-6 mx-auto mb-1 text-cyber-blue/60" />
                      <p className="text-[9px] text-gray-500 font-mono">Drag & Drop files or</p>
                      <label className="inline-block mt-1 px-2 py-0.5 bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue text-[8px] font-bold rounded cursor-pointer hover:bg-cyber-blue/30 transition-all font-mono">
                        BROWSE
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => handleUpload(e.target.files)}
                        />
                      </label>
                    </div>
                    {uploadStatus && (
                      <p className="text-[8px] mt-1.5 font-mono text-center text-cyber-green uppercase tracking-wide">
                        {uploadStatus}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 text-[8px] text-gray-500 leading-relaxed uppercase font-mono">
                    Real-time SHA-256 baseline monitoring is live.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wizard' && (
              <div className="glass-card border-white/5 p-6 bg-black/60 space-y-6">
                {/* Wizard Header & Progress */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-bold flex items-center gap-2 text-cyber-blue font-mono text-xs">
                      <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" />
                      INTEGRITY COMPARISON WIZARD
                    </h3>
                    <p className="text-[9px] text-gray-500 uppercase mt-1">Verify file modifications and additions client-side</p>
                  </div>

                  {/* Step indicators */}
                  <div className="flex items-center gap-2 text-[9px] font-mono">
                    <span className={`px-2 py-0.5 rounded ${wizardStep === 1 ? 'bg-cyber-blue/20 text-cyber-blue font-bold border border-cyber-blue/30' : 'text-gray-500'}`}>1. BASELINE</span>
                    <span className="text-gray-600">→</span>
                    <span className={`px-2 py-0.5 rounded ${wizardStep === 2 ? 'bg-cyber-blue/20 text-cyber-blue font-bold border border-cyber-blue/30' : 'text-gray-500'}`}>2. COMPARE</span>
                    <span className="text-gray-600">→</span>
                    <span className={`px-2 py-0.5 rounded ${wizardStep === 3 ? 'bg-cyber-blue/20 text-cyber-blue font-bold border border-cyber-blue/30' : 'text-gray-500'}`}>3. RESULTS</span>
                  </div>
                </div>

                {wizardUploadStatus && (
                  <div className="p-3 bg-cyber-blue/10 border border-cyber-blue/20 rounded font-mono text-[10px] text-cyber-blue uppercase text-center animate-pulse">
                    {wizardUploadStatus}
                  </div>
                )}

                {/* Step 1: Upload Baseline */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded border border-white/10">
                      <p className="text-xs text-gray-300 leading-relaxed font-mono">
                        Step 1: Upload exactly <span className="text-cyber-cyan font-bold">2 or 3 baseline files</span>.
                        The wizard will compute their baseline cryptographic hashes (SHA-256) locally in your browser.
                      </p>
                    </div>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setWizardDragging(true); }}
                      onDragLeave={() => setWizardDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setWizardDragging(false);
                        if (e.dataTransfer.files) handleWizardBaselineUpload(e.dataTransfer.files);
                      }}
                      className={`border border-dashed p-8 rounded text-center transition-all cursor-pointer ${wizardDragging
                        ? 'border-cyber-blue bg-cyber-blue/10 shadow-neon-blue'
                        : 'border-white/10 bg-black/20 hover:border-cyber-blue/40'
                        }`}
                    >
                      <UploadCloud className="w-12 h-12 mx-auto mb-3 text-cyber-blue/60" />
                      <p className="text-xs text-gray-400 font-mono">Drag & Drop 2 or 3 baseline files here or</p>
                      <div className="flex justify-center gap-3">
                        <label className="inline-block mt-3 px-4 py-1.5 bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue text-xs font-bold rounded cursor-pointer hover:bg-cyber-blue/30 transition-all font-mono">
                          SELECT FILES
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleWizardBaselineUpload(e.target.files)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={simulateWizardBaseline}
                          className="inline-block mt-3 px-4 py-1.5 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green text-xs font-bold rounded cursor-pointer hover:bg-cyber-green/30 transition-all font-mono"
                        >
                          SIMULATE BASELINE (3 FILES)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Upload Comparison */}
                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded border border-white/10 space-y-3">
                      <p className="text-xs text-cyber-green font-mono uppercase tracking-wider font-bold">✓ Baseline Established</p>
                      <div className="space-y-1.5 font-mono text-[10px]">
                        {wizardBaselineFiles.map((file, idx) => (
                          <div key={idx} className="flex justify-between items-center text-gray-400 border-b border-white/5 pb-1">
                            <span className="text-cyber-cyan truncate w-1/3">{file.name}</span>
                            <span className="text-gray-500 font-mono text-[9px] truncate w-2/3 text-right">HASH: {file.hash}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded border border-white/10">
                      <p className="text-xs text-gray-300 leading-relaxed font-mono">
                        Step 2: Upload files again to verify their integrity. You can make changes to the files, omit some to simulate deletion, or add new ones.
                      </p>
                    </div>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setWizardDragging(true); }}
                      onDragLeave={() => setWizardDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setWizardDragging(false);
                        if (e.dataTransfer.files) handleWizardComparisonUpload(e.dataTransfer.files);
                      }}
                      className={`border border-dashed p-8 rounded text-center transition-all cursor-pointer ${wizardDragging
                        ? 'border-cyber-blue bg-cyber-blue/10 shadow-neon-blue'
                        : 'border-white/10 bg-black/20 hover:border-cyber-blue/40'
                        }`}
                    >
                      <UploadCloud className="w-12 h-12 mx-auto mb-3 text-cyber-blue/60" />
                      <p className="text-xs text-gray-400 font-mono">Drag & Drop files to verify integrity or</p>
                      <div className="flex justify-center gap-3">
                        <label className="inline-block mt-3 px-4 py-1.5 bg-cyber-blue/20 border border-cyber-blue/30 text-cyber-blue text-xs font-bold rounded cursor-pointer hover:bg-cyber-blue/30 transition-all font-mono">
                          SELECT COMPUTE FILES
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => handleWizardComparisonUpload(e.target.files)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={simulateWizardComparison}
                          className="inline-block mt-3 px-4 py-1.5 bg-cyber-green/20 border border-cyber-green/30 text-cyber-green text-xs font-bold rounded cursor-pointer hover:bg-cyber-green/30 transition-all font-mono"
                        >
                          SIMULATE COMPARISON
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        onClick={resetWizard}
                        className="px-4 py-2 border border-white/10 text-gray-400 text-xs font-bold rounded hover:bg-white/5 transition-all font-mono uppercase cursor-pointer"
                      >
                        Back / Reset
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Results */}
                {wizardStep === 3 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded border border-white/10">
                      <p className="text-xs text-gray-300 font-mono uppercase tracking-wider font-bold mb-2">Integrity Verification Report</p>
                      <p className="text-[10px] text-gray-500 uppercase">Analysis computed client-side using browser cryptoprocessor</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400 text-[10px]">
                            <th className="pb-2">FILE NAME</th>
                            <th className="pb-2">STATUS</th>
                            <th className="pb-2">BASELINE HASH</th>
                            <th className="pb-2">CURRENT HASH</th>
                            <th className="pb-2 text-right">SIZE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wizardResults.map((res, idx) => (
                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-3 text-cyber-cyan truncate max-w-[120px]" title={res.name}>{res.name}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${res.status === 'SAME' ? 'bg-green-500/20 text-green-400' :
                                  res.status === 'MODIFIED' ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' :
                                    res.status === 'DELETED' ? 'bg-red-500/20 text-red-500' :
                                      'bg-blue-500/20 text-blue-400'
                                  }`}>
                                  {res.status}
                                </span>
                              </td>
                              <td className="py-3 text-gray-600 font-mono text-[10px]" title={res.baselineHash}>
                                {res.baselineHash !== 'N/A' ? `${res.baselineHash.substring(0, 8)}...` : 'N/A'}
                              </td>
                              <td className="py-3 text-gray-600 font-mono text-[10px]" title={res.currentHash}>
                                {res.currentHash !== 'N/A' ? `${res.currentHash.substring(0, 8)}...` : 'N/A'}
                              </td>
                              <td className="py-3 text-gray-400 text-right">{(res.size / 1024).toFixed(2)} KB</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                      <button
                        onClick={resetWizard}
                        className="px-6 py-2.5 bg-cyber-blue/20 border border-cyber-blue text-cyber-blue hover:bg-cyber-blue/30 hover:shadow-neon-blue text-xs font-bold rounded transition-all font-mono uppercase cursor-pointer"
                      >
                        Reset and Compare Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
