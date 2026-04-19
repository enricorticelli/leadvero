"use strict";
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const { fork } = require("child_process");
const fs = require("fs");
const http = require("http");
const crypto = require("crypto");

const PORT = 3847;
let nextServer = null;
let workerProcess = null;
let mainWindow = null;
let isQuitting = false;

function loadConfig() {
  const configPath = path.join(app.getPath("userData"), "config.json");
  if (!fs.existsSync(configPath)) {
    const config = {
      serpApiKey: "",
      sessionSecret: crypto.randomBytes(32).toString("hex"),
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return config;
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    const config = {
      serpApiKey: "",
      sessionSecret: crypto.randomBytes(32).toString("hex"),
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return config;
  }
}

function ensureDatabase() {
  const dbPath = path.join(app.getPath("userData"), "leadvero.db");
  if (!fs.existsSync(dbPath)) {
    const template = path.join(app.getAppPath(), "electron", "leadvero-template.db");
    if (fs.existsSync(template)) {
      fs.copyFileSync(template, dbPath);
    }
  }
  return dbPath;
}

function waitForServer(port, maxMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + (maxMs || 30000);
    function attempt() {
      const req = http.get(`http://127.0.0.1:${port}`, () => resolve(true));
      req.on("error", () => {
        if (Date.now() >= deadline) {
          reject(new Error("Server startup timeout"));
        } else {
          setTimeout(attempt, 500);
        }
      });
      req.end();
    }
    attempt();
  });
}

function createSplash() {
  const w = new BrowserWindow({
    width: 400,
    height: 250,
    frame: false,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  w.loadFile(path.join(__dirname, "splash.html"));
  return w;
}

function createMainWindow() {
  const w = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Leadvero",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  w.loadURL(`http://127.0.0.1:${PORT}`);
  w.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      w.hide();
    }
  });
  return w;
}

app.whenReady().then(async () => {
  const userDataDir = app.getPath("userData");
  const logPath = path.join(userDataDir, "leadvero.log");
  const logStream = fs.createWriteStream(logPath, { flags: "a" });
  const log = (...args) => {
    const line = `[${new Date().toISOString()}] ${args.map(String).join(" ")}\n`;
    logStream.write(line);
  };

  process.on("uncaughtException", (err) => log("[electron] uncaught:", err && err.stack || err));

  const config = loadConfig();
  const dbPath = ensureDatabase();
  const appPath = app.getAppPath();
  log("[electron] appPath:", appPath);
  log("[electron] dbPath:", dbPath);

  const childEnv = Object.assign({}, process.env, {
    DATABASE_URL: `file:${dbPath}`,
    SERPAPI_KEY: config.serpApiKey || "",
    SESSION_SECRET: config.sessionSecret,
    LEADVERO_DATA_DIR: userDataDir,
    PORT: String(PORT),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    ELECTRON_RUN_AS_NODE: "1",
  });

  const splash = createSplash();

  const serverScript = path.join(appPath, ".next", "standalone", "server.js");
  const serverCwd = path.join(appPath, ".next", "standalone");
  const workerScript = path.join(appPath, "dist", "worker.cjs");

  log("[electron] serverScript:", serverScript);
  log("[electron] workerScript:", workerScript);

  nextServer = fork(serverScript, [], {
    env: childEnv,
    cwd: serverCwd,
    silent: true,
  });
  nextServer.stdout && nextServer.stdout.on("data", (d) => log("[next]", d.toString().trim()));
  nextServer.stderr && nextServer.stderr.on("data", (d) => log("[next:err]", d.toString().trim()));
  nextServer.on("error", (err) => log("[electron] Next.js error:", err && err.stack || err));
  nextServer.on("exit", (code, sig) => log("[electron] Next.js exit:", code, sig));

  workerProcess = fork(workerScript, [], {
    env: childEnv,
    cwd: appPath,
    silent: true,
  });
  workerProcess.stdout && workerProcess.stdout.on("data", (d) => log("[worker]", d.toString().trim()));
  workerProcess.stderr && workerProcess.stderr.on("data", (d) => log("[worker:err]", d.toString().trim()));
  workerProcess.on("error", (err) => log("[electron] Worker error:", err && err.stack || err));
  workerProcess.on("exit", (code, sig) => log("[electron] Worker exit:", code, sig));

  try {
    await waitForServer(PORT);
  } catch (err) {
    log("[electron] Server failed to start:", err && err.stack || err);
    splash.close();
    app.quit();
    return;
  }

  splash.close();
  mainWindow = createMainWindow();

  if (process.platform === "darwin") {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: app.name,
          submenu: [
            { label: "Mostra Leadvero", click: () => mainWindow && mainWindow.show() },
            { type: "separator" },
            {
              label: "Esci da Leadvero",
              accelerator: "Cmd+Q",
              click: () => { isQuitting = true; app.quit(); },
            },
          ],
        },
        {
          label: "Modifica",
          submenu: [
            { label: "Taglia", accelerator: "CmdOrCtrl+X", role: "cut" },
            { label: "Copia", accelerator: "CmdOrCtrl+C", role: "copy" },
            { label: "Incolla", accelerator: "CmdOrCtrl+V", role: "paste" },
            { label: "Seleziona tutto", accelerator: "CmdOrCtrl+A", role: "selectAll" },
          ],
        },
      ])
    );
  }
});

app.on("activate", () => {
  if (mainWindow) mainWindow.show();
});

app.on("before-quit", () => {
  isQuitting = true;
  if (nextServer) { nextServer.kill("SIGTERM"); nextServer = null; }
  if (workerProcess) { workerProcess.kill("SIGTERM"); workerProcess = null; }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
