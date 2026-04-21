const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const chokidar = require('chokidar');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = 3001;
const WATCH_DIR = path.join(__dirname, 'monitored_files');

app.use(cors());
app.use(express.json());

// In-memory storage for file hashes and logs
let fileHashes = {};
let logs = [];

// Helper to generate SHA-256 hash
const generateHash = (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.error(`Error hashing file ${filePath}:`, error);
    return null;
  }
};

// Log helper
const addLog = (file, action, hash, status) => {
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString(),
    file: path.relative(WATCH_DIR, file),
    action: action,
    hash: hash || 'N/A',
    status: status || 'INFO'
  };
  logs = [newLog, ...logs].slice(0, 100);
  io.emit('newLog', newLog);
  return newLog;
};

// Initialize watcher
const watcher = chokidar.watch(WATCH_DIR, {
  persistent: true,
  ignoreInitial: false
});

watcher
  .on('add', filePath => {
    const hash = generateHash(filePath);
    fileHashes[filePath] = hash;
    addLog(filePath, 'ADDED', hash, 'SAFE');
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: 'SAFE'
    })));
  })
  .on('change', filePath => {
    const newHash = generateHash(filePath);
    const oldHash = fileHashes[filePath];
    let status = 'SAFE';

    if (oldHash && newHash !== oldHash) {
      status = 'CRITICAL';
    }

    fileHashes[filePath] = newHash;
    addLog(filePath, 'MODIFIED', newHash, status);
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: p === filePath ? status : 'SAFE'
    })));
  })
  .on('unlink', filePath => {
    delete fileHashes[filePath];
    addLog(filePath, 'DELETED', null, 'WARNING');
    io.emit('updateFiles', Object.keys(fileHashes).map(p => ({
      path: path.relative(WATCH_DIR, p),
      hash: fileHashes[p],
      status: 'SAFE'
    })));
  });

// API Endpoints
app.get('/status', (req, res) => {
  res.json({
    status: 'ACTIVE',
    monitoredCount: Object.keys(fileHashes).length,
    timestamp: new Date().toISOString()
  });
});

app.get('/logs', (req, res) => {
  res.json(logs);
});

app.get('/files', (req, res) => {
  const fileList = Object.keys(fileHashes).map(p => ({
    path: path.relative(WATCH_DIR, p),
    hash: fileHashes[p],
    status: 'SAFE'
  }));
  res.json(fileList);
});

server.listen(PORT, () => {
  console.log(`FIM Backend running on http://localhost:${PORT}`);
  console.log(`Monitoring directory: ${WATCH_DIR}`);
});
