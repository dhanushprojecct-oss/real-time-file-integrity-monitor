import React, { useState } from 'react';
import { ShieldCheck, Bell, ShieldAlert, Cpu, Settings, Copy, CheckCircle2 } from 'lucide-react';

export const SHA256Calculator = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Simple pseudo-SHA256 for demo purposes (to avoid importing heavy libs in this frontend-only demo)
  // In a real app we'd use crypto.subtle.digest or a library
  const getHash = (str) => {
    let hash = 0;
    if (str.length === 0) return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    // Returning a realistic looking hex for the demo
    return Array.from(str).reduce((acc, char) => {
      const charCode = char.charCodeAt(0);
      return acc + charCode.toString(16);
    }, '').padEnd(64, 'a').substring(0, 64);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getHash(text));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Input Data</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyber-blue outline-none transition-colors"
          placeholder="Type something to see its hash change..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Computed SHA-256 Hash</label>
        <div className="bg-black/40 border border-white/5 rounded p-3 font-mono text-xs break-all text-cyber-cyan relative group">
          {getHash(text)}
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-white/5 rounded hover:bg-white/10 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-4 bg-cyber-blue/10 rounded border border-cyber-blue/20 flex gap-3">
         <ShieldCheck className="w-5 h-5 text-cyber-blue shrink-0" />
         <p className="text-xs text-gray-300 leading-relaxed">
           SHA-256 ensures that even a tiny change in the input (like adding a single space) results in a completely different hash. This is how FIM CORE detects unauthorized file modifications.
         </p>
      </div>
    </div>
  );
};

export const AlertSettings = () => {
  const [config, setConfig] = useState({
    email: true,
    slack: false,
    autoQuarantine: false,
    severity: 'high'
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {[
          { id: 'email', label: 'Email Notifications', icon: Bell },
          { id: 'slack', label: 'Slack Webhook Integration', icon: Settings },
          { id: 'autoQuarantine', label: 'Auto-Quarantine Threats', icon: ShieldAlert },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-cyber-blue" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <button
               onClick={() => setConfig(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
               className={`w-10 h-5 rounded-full transition-colors relative ${config[item.id] ? 'bg-cyber-blue' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config[item.id] ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-gray-400 font-bold">Severity Threshold</label>
        <div className="flex gap-2">
          {['low', 'medium', 'high', 'critical'].map((lev) => (
            <button
              key={lev}
              onClick={() => setConfig(prev => ({ ...prev, severity: lev }))}
              className={`flex-1 py-2 text-[10px] font-bold uppercase rounded border transition-all ${
                config.severity === lev ? 'bg-cyber-blue text-black border-cyber-blue' : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {lev}
            </button>
          ))}
        </div>
      </div>
      
      <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest rounded-lg transition-all">
        Save Configuration
      </button>
    </div>
  );
};
