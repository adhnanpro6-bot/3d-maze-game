// ==========================================
// 1. CONFIGURATION
// ==========================================
const VERIFY_ENDPOINT = "/api/verify-code";
const RESUME_ENDPOINT = "/api/resume-session";
const PROGRESS_ENDPOINT = "/api/save-progress";

const TOTAL_DOORS = 10;

const GOOGLE_FORM_CONFIG = {
  enabled: false,
  formResponseUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  entries: {
    playerName: "entry.1111111111",
    accessCode: "entry.2222222222",
    completionTime: "entry.3333333333"
  }
};

// 10 Sequential Questions (Maths, GK & Sports) — Wrong answer triggers Horror Ghost kill & restart from Door 1
const DOOR_QUESTIONS = [
  { door: 1, category: "MATHS", question: "Door 1 (Maths): 14 + 28 എത്രയാണ്? (തെറ്റിയാൽ Ghost കൊല്ലും!)", answer: "42" },
  { door: 2, category: "SPORTS", question: "Door 2 (Sports): ഒരു ഫുട്ബോൾ ടീമിൽ സാധാരണയായി എത്ര കളിക്കാർ കളിക്കുന്നു?", answer: "11" },
  { door: 3, category: "GK", question: "Door 3 (GK): കേരളത്തിൽ ആകെ എത്ര ജില്ലകളുണ്ട്?", answer: "14" },
  { door: 4, category: "MATHS", question: "Door 4 (Maths): 12 × 6 എത്രയാണ്?", answer: "72" },
  { door: 5, category: "SPORTS", question: "Door 5 (Sports): FIFA ലോകകപ്പ് എത്ര വർഷം കൂടുമ്പോഴാണ് നടക്കുന്നത്?", answer: "4" },
  { door: 6, category: "GK", question: "Door 6 (GK): ഇന്ത്യയുടെ തലസ്ഥാന നഗരം ഏതാണ്?", answer: "NEW DELHI" },
  { door: 7, category: "MATHS", question: "Door 7 (Maths): 150 - 67 എത്രയാണ്?", answer: "83" },
  { door: 8, category: "SPORTS", question: "Door 8 (Sports): ഒളിമ്പിക് പതാകയിൽ എത്ര വളയങ്ങളുണ്ട്?", answer: "5" },
  { door: 9, category: "GK", question: "Door 9 (GK): സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏതാണ്?", answer: "JUPITER" },
  { door: 10, category: "FINAL MATHS", question: "Door 10 (Final): 9² എത്രയാണ്? ശരിയാക്കിയാൽ Centre Fountain തുറക്കും!", answer: "81" }
];

// Single ordered path of 10 Doors leading from South Entrance (z = +35) into Centre Fountain (x = 0, z = 0)
const DOOR_WAYPOINTS = [
  { x: 0, z: 28, rotY: 0 },
  { x: -16, z: 22, rotY: Math.PI / 2 },
  { x: -16, z: 8, rotY: Math.PI / 2 },
  { x: -8, z: -14, rotY: 0 },
  { x: 10, z: -18, rotY: 0 },
  { x: 18, z: -8, rotY: Math.PI / 2 },
  { x: 18, z: 12, rotY: Math.PI / 2 },
  { x: 8, z: 18, rotY: 0 },
  { x: 6, z: 5, rotY: Math.PI / 2 },
  { x: 0, z: -6.5, rotY: 0 }
];

// ==========================================
// 2. DOM ELEMENTS, QUESTION MODAL & HORROR OVERLAY
// ==========================================
const UI = {
  accessScreen: document.getElementById("access-screen"),
  playerNameInput: document.getElementById("player-name"),
  accessCodeInput: document.getElementById("access-code"),
  startBtn: document.getElementById("start-btn"),
  loginStatus: document.getElementById("login-status"),

  hud: document.getElementById("hud"),
  hudPlayer: document.getElementById("hud-player"),
  hudDoor: document.getElementById("hud-door"),
  hudTimer: document.getElementById("hud-timer"),
  canvasContainer: document.getElementById("game-canvas") || document.body,

  winModal: document.getElementById("win-modal"),
  winSummary: document.getElementById("win-summary"),
  formSubmitStatus: document.getElementById("form-submit-status"),
  playAgainBtn: document.getElementById("play-again-btn"),

  btnUp: document.getElementById("btn-up"),
  btnDown: document.getElementById("btn-down"),
  btnLeft: document.getElementById("btn-left"),
  btnRight: document.getElementById("btn-right")
};

let questionModal = document.getElementById("puzzle-modal");
if (!questionModal) {
  questionModal = document.createElement("div");
  questionModal.id = "dynamic-door-question-modal";
  questionModal.style.cssText = [
    "position: fixed",
    "inset: 0",
    "z-index: 40",
    "display: none",
    "align-items: center",
    "justify-content: center",
    "background: rgba(5, 8, 15, 0.84)",
    "backdrop-filter: blur(4px)",
    "padding: 16px"
  ].join(";");

  questionModal.innerHTML = `
    <div style="width:100%;max-width:420px;background:#121826;border:1px solid rgba(255,90,90,0.55);border-radius:14px;padding:22px;color:#f8fafc;box-shadow:0 18px 45px rgba(0,0,0,0.75);font-family:system-ui,sans-serif;">
      <div id="dq-badge" style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(239,68,68,0.2);color:#fca5a5;font-size:12px;font-weight:700;margin-bottom:10px;">DOOR LOCK</div>
      <h3 id="dq-question" style="margin:0 0 14px 0;font-size:17px;line-height:1.45;color:#ffffff;"></h3>
      <input id="dq-input" type="text" placeholder="ഉത്തരം ടൈപ്പ് ചെയ്യുക..." autocomplete="off"
        style="width:100%;box-sizing:border-box;padding:11px 12px;border-radius:8px;border:1px solid #384661;background:#090d16;color:#fff;font-size:15px;margin-bottom:12px;outline:none;" />
      <div id="dq-feedback" style="min-height:20px;font-size:13px;color:#ff6b6b;margin-bottom:10px;"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button id="dq-back-btn" type="button" style="padding:9px 14px;border-radius:8px;border:1px solid #3b4963;background:transparent;color:#cbd5e1;cursor:pointer;">പിന്നോട്ട്</button>
        <button id="dq-submit-btn" type="button" style="padding:9px 18px;border-radius:8px;border:none;background:#dc2626;color:#fff;font-weight:700;cursor:pointer;">ഉത്തരം നൽകുക</button>
      </div>
    </div>
  `;
  document.body.appendChild(questionModal);
}

const dqBadge = questionModal.querySelector("#dq-badge") || document.getElementById("puzzle-title");
const dqQuestion = questionModal.querySelector("#dq-question") || document.getElementById("puzzle-question");
const dqInput = questionModal.querySelector("#dq-input") || document.getElementById("puzzle-answer");
const dqFeedback = questionModal.querySelector("#dq-feedback") || document.getElementById("puzzle-feedback");
const dqBackBtn = questionModal.querySelector("#dq-back-btn") || document.getElementById("puzzle-close-btn");
const dqSubmitBtn = questionModal.querySelector("#dq-submit-btn") || document.getElementById("puzzle-submit-btn");

// Jumpscare blood-red flash & shock banner
const jumpscareFlash = document.createElement("div");
jumpscareFlash.style.cssText = [
  "position: fixed",
  "inset: 0",
  "z-index: 50",
  "pointer-events: none",
  "display: none",
  "background: radial-gradient(circle, rgba(220,20,20,0.18) 25%, rgba(140,0,0,0.82) 100%)",
  "align-items: center",
  "justify-content: center",
  "flex-direction: column",
  "color: #ffffff",
  "font-family: system-ui, sans-serif",
  "text-align: center",
  "padding: 20px"
].join(";");
jumpscareFlash.innerHTML = `
  <div style="font-size:34px;font-weight:900;letter-spacing:2px;color:#ff4d4d;text-shadow:0 0 24px #ff0000;margin-bottom:8px;">👻 YOU WERE KILLED!</div>
  <div style="font-size:15px;color:#ffe4e6;background:rgba(0,0,0,0.65);padding:8px 16px;border-radius:8px;">തെറ്റായ ഉത്തരം! പ്രേതം ആക്രമിച്ചു — ആദ്യം മുതൽ (Door 1) വീണ്ടും തുടങ്ങുന്നു...</div>
`;
document.body.appendChild(jumpscareFlash);

const infoBanner = document.createElement("div");
infoBanner.style.cssText = [
  "position: fixed",
  "top: 54px",
  "left: 50%",
  "transform: translateX(-50%)",
  "z-index: 25",
  "max-width: 92vw",
  "padding: 8px 14px",
  "border-radius: 9px",
  "background: rgba(9, 16, 29, 0.9)",
  "border: 1px solid rgba(110, 231, 183, 0.45)",
  "color: #a7f3d0",
  "font-size: 13px",
  "font-weight: 600",
  "text-align: center",
  "display: none"
].join(";");
document.body.appendChild(infoBanner);

let bannerTimer = null;
function showInfoBanner(msg, color = "#a7f3d0") {
  infoBanner.textContent = msg;
  infoBanner.style.color = color;
  infoBanner.style.display = "block";
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    infoBanner.style.display = "none";
  }, 2500);
}

// ==========================================
// 3. HORROR & UNLOCK AUDIO (Web Audio API)
// ==========================================
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playUnlockSound() {
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(920, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.23);
  } catch (_) {}
}

function playGhostKillSound() {
  try {
    ensureAudio();
    const now = audioCtx.currentTime;

    // Harsh horror screech + deep sub boom
    const screech = audioCtx.createOscillator();
    const screechGain = audioCtx.createGain();
    screech.type = "sawtooth";
    screech.frequency.setValueAtTime(980, now);
    screech.frequency.exponentialRampToValueAtTime(165, now + 0.65);

    screechGain.gain.setValueAtTime(0.28, now);
    screechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    screech.connect(screechGain);
    screechGain.connect(audioCtx.destination);
    screech.start(now);
    screech.stop(now + 0.72);

    const boom = audioCtx.createOscillator();
    const boomGain = audioCtx.createGain();
    boom.type = "sine";
    boom.frequency.setValueAtTime(120, now);
    boom.frequency.exponentialRampToValueAtTime(34, now + 0.55);

    boomGain.gain.setValueAtTime(0.32, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    boom.connect(boomGain);
    boomGain.connect(audioCtx.destination);
    boom.start(now);
    boom.stop(now + 0.62);
  } catch (_) {}
}

// ==========================================
// 4. GAME STATE (No localStorage)
// ==========================================
let sessionState = {
  active: false,
  sessionId: "",
  playerName: "",
  accessCode: "",
  currentDoorIndex: 0, // 0..9 (only currentDoorIndex door is shown!)
  unlockedDoors: Array(TOTAL_DOORS).fill(false),
  activeQuestionDoorIndex: null,
  ghostAttacking: false,
  ghostAttackTimer: 0,
  shakeIntensity: 0,
  startTimeMs: 0,
  elapsedSeconds: 0,
  finished: false
};

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

// ==========================================
// 5. SESSION TOKEN & SERVER SYNC
// ==========================================
function persistSessionId(sessionId) {
  if (!sessionId) return;
  try { window.name = JSON.stringify({ mazeSessionId: sessionId }); } catch (_) {}
  try {
    history.replaceState(null, "", "#session=" + encodeURIComponent(sessionId));
  } catch (_) {
    window.location.hash = "session=" + encodeURIComponent(sessionId);
  }
}

function clearSessionId() {
  try { window.name = ""; } catch (_) {}
  try {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (_) {}
}

function readPersistedSessionId() {
  const hash = window.location.hash || "";
  const match = hash.match(/session=([^&]+)/);
  if (match && match[1]) return decodeURIComponent(match[1]);
  try {
    if (window.name) {
      const parsed = JSON.parse(window.name);
      if (parsed && parsed.mazeSessionId) return parsed.mazeSessionId;
    }
  } catch (_) {}
  return "";
}

async function saveProgressToServer(finished = false) {
  if (!sessionState.sessionId) return;
  try {
    await fetch(PROGRESS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionState.sessionId,
        doorIndex: sessionState.currentDoorIndex,
        elapsedSeconds: Number(sessionState.elapsedSeconds.toFixed(2)),
        finished
      })
    });
  } catch (err) {
    console.warn("Progress sync failed:", err);
  }
}

async function verifyAccessCode(code, playerName) {
  const cleanCode = String(code || "").trim().toUpperCase();
  const cleanName = String(playerName || "").trim();
  if (!cleanCode) return { valid: false, reason: "EMPTY_CODE" };

  try {
    const response = await fetch(VERIFY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: cleanCode, playerName: cleanName })
    });
    return await response.json();
  } catch (err) {
    console.error("Verify code error:", err);
    return { valid: false, reason: "NETWORK_ERROR" };
  }
}

async function tryResumeExistingSession() {
  const existingId = readPersistedSessionId();
  if (!existingId) return false;

  setLoginStatus("പഴയ സെഷൻ തുടരുന്നു...", false);
  try {
    const response = await fetch(RESUME_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: existingId })
    });
    const data = await response.json();
    if (data && data.valid) {
      startSession({
        sessionId: data.sessionId,
        playerName: data.playerName,
        accessCode: data.code,
        doorIndex: Number(data.doorIndex || 0),
        elapsedSeconds: Number(data.elapsedSeconds || 0)
      });
      return true;
    }
  } catch (err) {
    console.warn("Resume error:", err);
  }
  setLoginStatus("", false);
  return false;
}

async function handleStartGame() {
  const playerName = String(UI.playerNameInput?.value || "").trim();
  const code = String(UI.accessCodeInput?.value || "").trim().toUpperCase();

  if (!playerName) {
    setLoginStatus("ദയവായി പേര് നൽകുക.", true);
    return;
  }
  if (!code) {
    setLoginStatus("ദയവായി ആക്സസ് കോഡ് നൽകുക.", true);
    return;
  }

  if (UI.startBtn) UI.startBtn.disabled = true;
  setLoginStatus("ആക്സസ് കോഡ് പരിശോധിക്കുന്നു...", false);

  const result = await verifyAccessCode(code, playerName);

  if (UI.startBtn) UI.startBtn.disabled = false;

  if (!result || !result.valid) {
    if (result?.reason === "ALREADY_USED") {
      setLoginStatus("ഈ ആക്സസ് കോഡ് ഇതിനകം ഉപയോഗിച്ചു കഴിഞ്ഞു.", true);
    } else if (result?.reason === "INVALID_CODE") {
      setLoginStatus("തെറ്റായ ആക്സസ് കോഡ്.", true);
    } else {
      setLoginStatus("സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക.", true);
    }
    return;
  }

  setLoginStatus("", false);
  startSession({
    sessionId: result.sessionId,
    playerName,
    accessCode: code,
    doorIndex: Number(result.doorIndex || 0),
    elapsedSeconds: Number(result.elapsedSeconds || 0)
  });
}

function setLoginStatus(msg, isError) {
  if (!UI.loginStatus) return;
  UI.loginStatus.textContent = msg;
  UI.loginStatus.style.color = isError ? "#ff6b6b" : "#7ee787";
}

function updateHudDoor() {
  if (!UI.hudDoor) return;
  if (sessionState.currentDoorIndex >= TOTAL_DOORS) {
    UI.hudDoor.textContent = "Final Fountain Open!";
  } else {
    UI.hudDoor.textContent = `Active Door: ${sessionState.currentDoorIndex + 1} / ${TOTAL_DOORS}`;
  }
}

function startSession({ sessionId, playerName, accessCode, doorIndex, elapsedSeconds }) {
  const safeIdx = Math.max(0, Math.min(doorIndex, TOTAL_DOORS));

  sessionState = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    currentDoorIndex: safeIdx,
    unlockedDoors: Array(TOTAL_DOORS).fill(false).map((_, i) => i < safeIdx),
    activeQuestionDoorIndex: null,
    ghostAttacking: false,
    ghostAttackTimer: 0,
    shakeIntensity: 0,
    startTimeMs: performance.now() - elapsedSeconds * 1000,
    elapsedSeconds,
    finished: false
  };

  persistSessionId(sessionId);
  syncMazeVisibilityAndPosition();

  if (UI.accessScreen) UI.accessScreen.style.display = "none";
  if (UI.winModal) UI.winModal.style.display = "none";
  if (UI.hud) UI.hud.style.display = "flex";
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${playerName}`;
  updateHudDoor();
  showInfoBanner("നിലവിലെ വാതിൽ (Door 1) മാത്രമേ ദൃശ്യമാകൂ. ശരിയായ ഉത്തരം നൽകി മുന്നേറുക!");
}

// ==========================================
// 6. PROCEDURAL TEXTURES, HEDGE MAZE, KALAKERALA ADS & HORROR GHOST
// ==========================================
function createHedgeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#2d6a2e";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2 + Math.random() * 5;
    const shades = ["#1f4e20", "#3b8238", "#4c9a44", "#275d28"];
    ctx.fillStyle = shades[Math.floor(Math.random() * shades.length)];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

function createStoneGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#cfc3a7";
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = "#b5a788";
  ctx.lineWidth = 2;
  for (let y = 0; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
    for (let x = (y % 64 === 0 ? 0 : 32); x < 256; x += 64) {
      ctx.strokeRect(x, y, 64, 32);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x09101c);
scene.fog = new THREE.FogExp2(0x09101c, 0.015);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 160);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
UI.canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdff6ff, 0x243b20, 0.92));

const sunLight = new THREE.DirectionalLight(0xfff1c9, 1.1);
sunLight.position.set(22, 38, 26);
sunLight.castShadow = true;
scene.add(sunLight);

// Red horror spotlight used during ghost jumpscare
const horrorLight = new THREE.PointLight(0xff1a1a, 0, 14);
scene.add(horrorLight);

const lawnGround = new THREE.Mesh(
  new THREE.PlaneGeometry(110, 110),
  new THREE.MeshStandardMaterial({ color: 0x3b7829, roughness: 0.9 })
);
lawnGround.rotation.x = -Math.PI / 2;
lawnGround.position.y = -0.06;
scene.add(lawnGround);

const stonePlaza = new THREE.Mesh(
  new THREE.PlaneGeometry(66, 66),
  new THREE.MeshStandardMaterial({ map: createStoneGroundTexture(), roughness: 0.75 })
);
stonePlaza.rotation.x = -Math.PI / 2;
stonePlaza.receiveShadow = true;
scene.add(stonePlaza);

const hedgeMat = new THREE.MeshStandardMaterial({
  map: createHedgeTexture(),
  roughness: 0.85,
  metalness: 0.05
});

const wallColliders = [];
function addHedgeWall(x, z, w, d, h = 3.2) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hedgeMat);
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  wallColliders.push({
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2
  });
}

// Outer perimeter hedge walls with single entrance opening at South (x = 0, z = +31)
addHedgeWall(-16.5, 31, 30, 2.2);
addHedgeWall(16.5, 31, 30, 2.2);
addHedgeWall(0, -31, 64, 2.2);
addHedgeWall(-31, 0, 2.2, 64);
addHedgeWall(31, 0, 2.2, 64);

// Winding Hedge Labyrinth Walls
addHedgeWall(-10, 24, 18, 2.0);
addHedgeWall(11, 24, 16, 2.0);
addHedgeWall(-21, 15, 2.0, 18);
addHedgeWall(-9, 15, 14, 2.0);
addHedgeWall(12, 14, 14, 2.0);
addHedgeWall(-11, 2, 14, 2.0);
addHedgeWall(12, 1, 14, 2.0);
addHedgeWall(-21, -10, 2.0, 22);
addHedgeWall(21, -8, 2.0, 22);
addHedgeWall(-12, -21, 16, 2.0);
addHedgeWall(13, -22, 14, 2.0);
addHedgeWall(0, -25, 2.0, 10);

// Concentric Hedge Ring around Centre Fountain
const ringSegments = 16;
const ringRadius = 11.5;
for (let i = 0; i < ringSegments; i++) {
  if (i === 0) continue;
  const angle = (i / ringSegments) * Math.PI * 2;
  const sx = Math.sin(angle) * ringRadius;
  const sz = Math.cos(angle) * ringRadius;
  const seg = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.4, 1.4), hedgeMat);
  seg.position.set(sx, 1.2, sz);
  seg.rotation.y = angle;
  seg.castShadow = true;
  scene.add(seg);

  wallColliders.push({
    minX: sx - 2.2,
    maxX: sx + 2.2,
    minZ: sz - 2.2,
    maxZ: sz + 2.2
  });
}

// Centre Fountain (Final Goal at x = 0, z = 0)
const fountainGroup = new THREE.Group();
const outerBasin = new THREE.Mesh(
  new THREE.CylinderGeometry(4.2, 4.5, 0.7, 32),
  new THREE.MeshStandardMaterial({ color: 0xd8ccb8, roughness: 0.5 })
);
outerBasin.position.y = 0.35;

const fountainWater = new THREE.Mesh(
  new THREE.CylinderGeometry(3.6, 3.6, 0.5, 32),
  new THREE.MeshStandardMaterial({
    color: 0x1e90ff,
    emissive: 0x0b3966,
    roughness: 0.2,
    metalness: 0.3
  })
);
fountainWater.position.y = 0.42;

const centerSpire = new THREE.Mesh(
  new THREE.CylinderGeometry(0.65, 1.1, 2.4, 20),
  new THREE.MeshStandardMaterial({ color: 0xe6dcc8, roughness: 0.45 })
);
centerSpire.position.y = 1.2;

const goalBeacon = new THREE.Mesh(
  new THREE.TorusGeometry(1.4, 0.14, 14, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0x996600,
    metalness: 0.6,
    roughness: 0.25
  })
);
goalBeacon.position.y = 2.9;

fountainGroup.add(outerBasin, fountainWater, centerSpire, goalBeacon);
fountainGroup.position.set(0, 0, 0);
scene.add(fountainGroup);

// KALAKERALA ARTS & SPORTS CLUB — CHELAKKADAVU Wall Advertisements
const texLoader = new THREE.TextureLoader();
const logoTexture = texLoader.load("/logo.png", undefined, undefined, () => {});

function addKalakeralaWallAd(x, z, rotY, width = 4.6, height = 2.2) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#080b10";
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = "#e5b94c";
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = "#f5c851";
  ctx.font = "bold 27px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("KALAKERALA ARTS & SPORTS CLUB", 256, 78);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillText("CHELAKKADAVU  •  ESTD 1983", 256, 126);

  ctx.fillStyle = "#a3b8cc";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText("10-DOOR HEDGE MAZE CHALLENGE", 256, 178);

  const fallbackTex = new THREE.CanvasTexture(canvas);
  const adPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: fallbackTex, roughness: 0.45 })
  );
  adPanel.position.set(x, 1.85, z);
  adPanel.rotation.y = rotY;
  scene.add(adPanel);

  const emblem = new THREE.Mesh(
    new THREE.PlaneGeometry(1.15, 1.15),
    new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true })
  );
  emblem.position.set(
    x + Math.sin(rotY) * 0.03,
    1.95,
    z + Math.cos(rotY) * 0.03
  );
  emblem.rotation.y = rotY;
  emblem.visible = false;
  logoTexture.addEventListener("load", () => {
    emblem.visible = true;
  });
  scene.add(emblem);
}

addKalakeralaWallAd(-29.7, 14, Math.PI / 2);
addKalakeralaWallAd(29.7, 14, -Math.PI / 2);
addKalakeralaWallAd(-29.7, -14, Math.PI / 2);
addKalakeralaWallAd(29.7, -14, -Math.PI / 2);
addKalakeralaWallAd(0, -29.7, 0);

// 10 Doors — ONLY the current active door is visible at a time!
const lockedDoorMat = new THREE.MeshStandardMaterial({
  color: 0xd94848,
  emissive: 0x450d0d,
  roughness: 0.35,
  metalness: 0.25
});
const unlockedDoorMat = new THREE.MeshStandardMaterial({
  color: 0x2ea043,
  emissive: 0x0d3616,
  roughness: 0.35
});

const doorObjects = DOOR_WAYPOINTS.map((wp, idx) => {
  const doorGroup = new THREE.Group();

  const pillarGeo = new THREE.BoxGeometry(0.45, 3.2, 0.65);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x8d99ae, roughness: 0.6 });
  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(-1.65, 1.6, 0);
  const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightPillar.position.set(1.65, 1.6, 0);

  const leafMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.85, 2.9, 0.35),
    lockedDoorMat.clone()
  );
  leafMesh.position.set(0, 1.45, 0);
  leafMesh.castShadow = true;

  doorGroup.add(leftPillar, rightPillar, leafMesh);
  doorGroup.position.set(wp.x, 0, wp.z);
  doorGroup.rotation.y = wp.rotY;
  doorGroup.visible = idx === 0;
  scene.add(doorGroup);

  return {
    index: idx,
    x: wp.x,
    z: wp.z,
    rotY: wp.rotY,
    group: doorGroup,
    leafMesh,
    unlocked: false
  };
});

// Detailed 3D Horror Ghost (floating spectral body, glowing red eyes, open screaming jaw, outstretched claws)
const ghostGroup = new THREE.Group();
const ghostBodyMat = new THREE.MeshStandardMaterial({
  color: 0x161822,
  emissive: 0x1a0508,
  roughness: 0.55,
  transparent: true,
  opacity: 0.94
});
const ghostCloak = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.3, 18, 1, true), ghostBodyMat);
ghostCloak.rotation.x = Math.PI;
ghostCloak.position.y = 1.15;

const ghostHead = new THREE.Mesh(new THREE.SphereGeometry(0.62, 20, 20), ghostBodyMat);
ghostHead.position.y = 2.1;

const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1e1e });
const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), eyeMat);
leftEye.position.set(-0.22, 2.18, 0.54);
const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), eyeMat);
rightEye.position.set(0.22, 2.18, 0.54);

const screamMouth = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 12, 12),
  new THREE.MeshBasicMaterial({ color: 0x550000 })
);
screamMouth.scale.set(0.85, 1.35, 0.5);
screamMouth.position.set(0, 1.9, 0.56);

const armGeo = new THREE.CylinderGeometry(0.09, 0.05, 1.15, 8);
const leftArm = new THREE.Mesh(armGeo, ghostBodyMat);
leftArm.position.set(-0.85, 1.75, 0.25);
leftArm.rotation.z = -0.55;
leftArm.rotation.x = Math.PI / 3;

const rightArm = new THREE.Mesh(armGeo, ghostBodyMat);
rightArm.position.set(0.85, 1.75, 0.25);
rightArm.rotation.z = 0.55;
rightArm.rotation.x = Math.PI / 3;

ghostGroup.add(ghostCloak, ghostHead, leftEye, rightEye, screamMouth, leftArm, rightArm);
ghostGroup.visible = false;
scene.add(ghostGroup);

// Player state
const playerPos = new THREE.Vector3(0, 1.6, 35);
const PLAYER_RADIUS = 0.55;

function syncMazeVisibilityAndPosition() {
  // Show ONLY the next/current door (idx === currentDoorIndex), keep other doors hidden for clean optimization
  doorObjects.forEach((d, idx) => {
    const isUnlocked = Boolean(sessionState.unlockedDoors[idx]);
    d.unlocked = isUnlocked;
    d.leafMesh.position.y = isUnlocked ? -2.5 : 1.45;
    d.leafMesh.material.color.setHex(isUnlocked ? 0x2ea043 : 0xd94848);
    d.group.visible = idx === sessionState.currentDoorIndex;
  });

  if (sessionState.currentDoorIndex > 0) {
    const prevDoor = doorObjects[Math.min(sessionState.currentDoorIndex - 1, TOTAL_DOORS - 1)];
    playerPos.set(prevDoor.x, 1.6, prevDoor.z - 2.2);
  } else {
    playerPos.set(0, 1.6, 35);
  }

  camera.position.copy(playerPos);
  camera.lookAt(playerPos.x, 1.5, playerPos.z - 10);
}

function collidesWithWall(x, z) {
  for (const w of wallColliders) {
    const closestX = Math.max(w.minX, Math.min(x, w.maxX));
    const closestZ = Math.max(w.minZ, Math.min(z, w.maxZ));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) return true;
  }
  return false;
}

function openDoorQuestionModal(doorIndex) {
  if (!sessionState.active || sessionState.finished || sessionState.ghostAttacking) return;
  if (sessionState.activeQuestionDoorIndex !== null) return;
  if (doorIndex !== sessionState.currentDoorIndex) return;

  const qData = DOOR_QUESTIONS[doorIndex];
  if (!qData) return;

  sessionState.activeQuestionDoorIndex = doorIndex;
  keys.forward = keys.backward = keys.left = keys.right = false;

  if (dqBadge) dqBadge.textContent = `DOOR ${qData.door} / ${TOTAL_DOORS} • ${qData.category}`;
  if (dqQuestion) dqQuestion.textContent = qData.question;
  if (dqFeedback) dqFeedback.textContent = "";
  if (dqInput) {
    dqInput.value = "";
    setTimeout(() => dqInput.focus(), 50);
  }
  questionModal.style.display = "flex";
}

function closeDoorQuestionModal() {
  sessionState.activeQuestionDoorIndex = null;
  questionModal.style.display = "none";
  playerPos.z += 1.1;
}

async function triggerGhostKillAndRestartFromStart() {
  sessionState.activeQuestionDoorIndex = null;
  questionModal.style.display = "none";
  keys.forward = keys.backward = keys.left = keys.right = false;

  sessionState.ghostAttacking = true;
  sessionState.ghostAttackTimer = 1.25;
  sessionState.shakeIntensity = 0.45;

  // Position ghost right in front of player camera for shocking jumpscare
  ghostGroup.visible = true;
  ghostGroup.position.set(playerPos.x, 0.1, playerPos.z - 2.6);
  ghostGroup.lookAt(playerPos.x, 1.5, playerPos.z);

  horrorLight.position.set(playerPos.x, 2.2, playerPos.z - 1.5);
  horrorLight.intensity = 6;

  jumpscareFlash.style.display = "flex";
  playGhostKillSound();

  // Reset progress to Door 1 / Start
  sessionState.currentDoorIndex = 0;
  sessionState.unlockedDoors = Array(TOTAL_DOORS).fill(false);
  sessionState.startTimeMs = performance.now();
  sessionState.elapsedSeconds = 0;

  await saveProgressToServer(false);
}

function finishGhostKillReset() {
  sessionState.ghostAttacking = false;
  sessionState.ghostAttackTimer = 0;
  sessionState.shakeIntensity = 0;
  ghostGroup.visible = false;
  horrorLight.intensity = 0;
  jumpscareFlash.style.display = "none";

  syncMazeVisibilityAndPosition();
  updateHudDoor();
  showInfoBanner("👻 പ്രേതം കൊന്നു! ആദ്യ വാതിലിൽ (Door 1) നിന്ന് വീണ്ടും തുടങ്ങുന്നു!", "#ff8080");
}

async function submitDoorAnswer() {
  const idx = sessionState.activeQuestionDoorIndex;
  if (idx === null || sessionState.ghostAttacking) return;

  const qData = DOOR_QUESTIONS[idx];
  const userAns = String(dqInput?.value || "").trim().toUpperCase();
  const expectedAns = String(qData.answer || "").trim().toUpperCase();

  if (userAns === expectedAns) {
    const door = doorObjects[idx];
    door.unlocked = true;
    door.leafMesh.position.y = -2.5;
    door.leafMesh.material.color.setHex(0x2ea043);

    sessionState.unlockedDoors[idx] = true;
    sessionState.currentDoorIndex = idx + 1;
    sessionState.activeQuestionDoorIndex = null;
    questionModal.style.display = "none";

    // Reveal ONLY the next door now
    syncMazeVisibilityAndPosition();
    updateHudDoor();
    playUnlockSound();
    showInfoBanner(`🔓 Door ${idx + 1} തുറന്നു! അടുത്ത വാതിൽ തെളിഞ്ഞു.`);
    await saveProgressToServer(false);
  } else {
    // Wrong answer -> Horror Ghost kills player & restarts from Door 1
    await triggerGhostKillAndRestartFromStart();
  }
}

function collidesWithLockedDoor(x, z) {
  const d = doorObjects[sessionState.currentDoorIndex];
  if (!d || !d.group.visible || d.unlocked) return false;
  const dist = Math.hypot(x - d.x, z - d.z);
  if (dist < 1.85) {
    openDoorQuestionModal(d.index);
    return true;
  }
  return false;
}

// ==========================================
// 7. CENTRE FOUNTAIN VICTORY & SUBMISSION
// ==========================================
async function handleReachCentreFountain() {
  if (sessionState.finished) return;
  sessionState.finished = true;
  sessionState.active = false;
  infoBanner.style.display = "none";
  clearSessionId();
  playUnlockSound();

  const finalTime = sessionState.elapsedSeconds.toFixed(2);
  await saveProgressToServer(true);

  if (UI.hud) UI.hud.style.display = "none";
  if (UI.winSummary) {
    UI.winSummary.textContent = `അഭിനന്ദനങ്ങൾ ${sessionState.playerName}! 10 വാതിലുകളും കടന്ന് Centre Fountain-ൽ എത്തിയ സമയം: ${finalTime}s`;
  }
  if (UI.winModal) UI.winModal.style.display = "flex";

  if (GOOGLE_FORM_CONFIG.enabled && GOOGLE_FORM_CONFIG.formResponseUrl) {
    if (UI.formSubmitStatus) UI.formSubmitStatus.textContent = "സ്കോർ Google Form-ലേക്ക് അയക്കുന്നു...";
    try {
      const formData = new URLSearchParams();
      if (GOOGLE_FORM_CONFIG.entries.playerName) formData.append(GOOGLE_FORM_CONFIG.entries.playerName, sessionState.playerName);
      if (GOOGLE_FORM_CONFIG.entries.accessCode) formData.append(GOOGLE_FORM_CONFIG.entries.accessCode, sessionState.accessCode);
      if (GOOGLE_FORM_CONFIG.entries.completionTime) formData.append(GOOGLE_FORM_CONFIG.entries.completionTime, `${finalTime} seconds`);

      await fetch(GOOGLE_FORM_CONFIG.formResponseUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
      });

      if (UI.formSubmitStatus) UI.formSubmitStatus.textContent = "സമയം Google Form-ൽ രേഖപ്പെടുത്തി.";
    } catch (err) {
      console.error("Google Form submit error:", err);
      if (UI.formSubmitStatus) UI.formSubmitStatus.textContent = "Form സബ്മിഷനിൽ പിശക് സംഭവിച്ചു.";
    }
  }
}

// ==========================================
// 8. CONTROLS & SESSION RESUME
// ==========================================
window.addEventListener("beforeunload", (e) => {
  if (sessionState.active && !sessionState.finished) {
    saveProgressToServer(false);
    e.preventDefault();
    e.returnValue = "";
  }
});

window.addEventListener("pageshow", () => {
  if (!sessionState.active && !sessionState.finished) {
    tryResumeExistingSession();
  }
});

window.addEventListener("keydown", (e) => {
  if (sessionState.ghostAttacking) return;
  if (sessionState.activeQuestionDoorIndex !== null) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitDoorAnswer();
    } else if (e.key === "Escape") {
      closeDoorQuestionModal();
    }
    return;
  }
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.forward = true;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.backward = true;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.forward = false;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") keys.backward = false;
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
});

function bindTouchBtn(el, keyName) {
  if (!el) return;
  const press = (ev) => {
    if (sessionState.ghostAttacking) return;
    ev.preventDefault();
    keys[keyName] = true;
  };
  const release = (ev) => {
    ev.preventDefault();
    keys[keyName] = false;
  };
  el.addEventListener("touchstart", press, { passive: false });
  el.addEventListener("touchend", release, { passive: false });
  el.addEventListener("mousedown", press);
  el.addEventListener("mouseup", release);
  el.addEventListener("mouseleave", release);
}

bindTouchBtn(UI.btnUp, "forward");
bindTouchBtn(UI.btnDown, "backward");
bindTouchBtn(UI.btnLeft, "left");
bindTouchBtn(UI.btnRight, "right");

if (UI.startBtn) UI.startBtn.addEventListener("click", handleStartGame);
if (dqSubmitBtn) dqSubmitBtn.addEventListener("click", submitDoorAnswer);
if (dqBackBtn) dqBackBtn.addEventListener("click", closeDoorQuestionModal);
if (dqInput) {
  dqInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitDoorAnswer();
    }
  });
}

if (UI.playAgainBtn) {
  UI.playAgainBtn.addEventListener("click", () => {
    clearSessionId();
    window.location.reload();
  });
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 9. MAIN LOOP
// ==========================================
let lastFrameTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  if (sessionState.ghostAttacking) {
    sessionState.ghostAttackTimer -= dt;
    // Lunge ghost violently toward player camera
    const lungeProgress = Math.max(0, 1 - sessionState.ghostAttackTimer / 1.25);
    ghostGroup.position.z = playerPos.z - 2.6 + lungeProgress * 1.9;
    ghostGroup.position.y = Math.sin(now * 0.035) * 0.22;
    leftArm.rotation.x = Math.PI / 3 + Math.sin(now * 0.04) * 0.35;
    rightArm.rotation.x = Math.PI / 3 - Math.sin(now * 0.04) * 0.35;

    const shakeX = (Math.random() - 0.5) * sessionState.shakeIntensity;
    const shakeY = (Math.random() - 0.5) * sessionState.shakeIntensity;
    camera.position.set(playerPos.x + shakeX, playerPos.y + shakeY, playerPos.z);
    camera.lookAt(ghostGroup.position.x, 1.75, ghostGroup.position.z);

    if (sessionState.ghostAttackTimer <= 0) {
      finishGhostKillReset();
    }
  } else if (sessionState.active && !sessionState.finished) {
    sessionState.elapsedSeconds = (now - sessionState.startTimeMs) / 1000;
    if (UI.hudTimer) {
      UI.hudTimer.textContent = `Time: ${sessionState.elapsedSeconds.toFixed(1)}s`;
    }

    if (sessionState.activeQuestionDoorIndex === null) {
      const moveSpeed = 7.4 * dt;
      let moveX = 0;
      let moveZ = 0;

      if (keys.forward) moveZ -= moveSpeed;
      if (keys.backward) moveZ += moveSpeed;
      if (keys.left) moveX -= moveSpeed;
      if (keys.right) moveX += moveSpeed;

      const nextX = playerPos.x + moveX;
      if (!collidesWithWall(nextX, playerPos.z) && !collidesWithLockedDoor(nextX, playerPos.z)) {
        playerPos.x = nextX;
      }

      const nextZ = playerPos.z + moveZ;
      if (!collidesWithWall(playerPos.x, nextZ) && !collidesWithLockedDoor(playerPos.x, nextZ)) {
        playerPos.z = nextZ;
      }

      camera.position.set(playerPos.x, playerPos.y, playerPos.z);
      camera.lookAt(playerPos.x, playerPos.y - 0.1, playerPos.z - 9);

      const distToFountain = Math.hypot(playerPos.x - 0, playerPos.z - 0);
      if (sessionState.currentDoorIndex >= TOTAL_DOORS && distToFountain <= 4.6) {
        handleReachCentreFountain();
      }
    }
  }

  goalBeacon.rotation.z += 1.8 * dt;
  goalBeacon.rotation.x += 0.9 * dt;
  renderer.render(scene, camera);
}

tryResumeExistingSession();
requestAnimationFrame(animate);