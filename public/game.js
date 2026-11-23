// ==========================================
// 1. CONFIGURATION
// ==========================================
const VERIFY_ENDPOINT = "/api/verify-code";
const CONTINUE_CODE_ENDPOINT = "/api/continue-code";
const RESUME_ENDPOINT = "/api/resume-session";
const PROGRESS_ENDPOINT = "/api/save-progress";

const TOTAL_STAGES = 10;
// Horror element only appears on these specific stages (no ghost anywhere)
const HORROR_STAGES = new Set([4, 7, 9]);

const GOOGLE_FORM_CONFIG = {
  enabled: false,
  formResponseUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  entries: {
    playerName: "entry.1111111111",
    accessCode: "entry.2222222222",
    completionTime: "entry.3333333333"
  }
};

// 10 Fun Stage Minigames (mix of Target Click Rush, Quick Math Blitz, Choice Fun & Riddle)
const STAGE_MINIGAMES = [
  { stage: 1, type: "TARGET_RUSH", title: "Fun Target Rush", prompt: "ചൊവ്വയിലെ 3 തിളങ്ങുന്ന Rover Targets വേഗത്തിൽ ക്ലിക്ക് ചെയ്യുക!", targetClicks: 3 },
  { stage: 2, type: "CHOICE", title: "Space Fun Quiz", prompt: "ചൊവ്വയിൽ (Mars) ആകാശം സാധാരണയായി ഏത് നിറത്തിലാണ് കാണപ്പെടുന്നത്?", options: ["Rust Red / Butterscotch", "Neon Pink", "Deep Ocean Blue"], answer: 0 },
  { stage: 3, type: "TARGET_RUSH", title: "Meteor Tap Fun", prompt: "4 Space Meteors ടാപ്പ് ചെയ്ത് തകർക്കുക!", targetClicks: 4 },
  { stage: 4, type: "CHOICE", title: "⚠️ Red Crater Alert", prompt: "ചുവന്ന അപായ സിഗ്നൽ! 15 + 27 എത്രയാണ്?", options: ["42", "38", "54"], answer: 0 },
  { stage: 5, type: "CHOICE", title: "Football & Space Fun", prompt: "ഒരു ഫുട്ബോൾ ടീമിൽ സാധാരണയായി എത്ര കളിക്കാർ ഉണ്ടാകും?", options: ["9", "11", "12"], answer: 1 },
  { stage: 6, type: "TARGET_RUSH", title: "Solar Core Tap", prompt: "3 Solar Cores ടാപ്പ് ചെയ്ത് ചാർജ് ചെയ്യുക!", targetClicks: 3 },
  { stage: 7, type: "CHOICE", title: "⚠️ Dark Canyon Pulse", prompt: "കനത്ത ഇരുട്ട്! 8 × 7 എത്രയാണ്?", options: ["48", "56", "64"], answer: 1 },
  { stage: 8, type: "CHOICE", title: "Kerala & Mars Fun", prompt: "കേരളത്തിലെ ആകെ ജില്ലകളുടെ എണ്ണം എത്ര?", options: ["12", "14", "16"], answer: 1 },
  { stage: 9, type: "CHOICE", title: "⚠️ Phantom Signal", prompt: "അവസാന ഭീതി സിഗ്നൽ! 100 - 37 എത്രയാണ്?", options: ["63", "73", "53"], answer: 0 },
  { stage: 10, type: "TARGET_RUSH", title: "Final Mars Beacon", prompt: "5 Beacon Nodes ടാപ്പ് ചെയ്ത് Mars ദൗത്യം പൂർത്തിയാക്കുക!", targetClicks: 5 }
];

// 10 Sequential Stage Checkpoints across the Mars Maze
const STAGE_SPOTS = [
  { x: -16, z: 26 },
  { x: -6,  z: 18 },
  { x: -24, z: 12 },
  { x: -12, z: 6 },
  { x: 4,   z: 14 },
  { x: 16,  z: 22 },
  { x: 24,  z: 8 },
  { x: 10,  z: -8 },
  { x: -14, z: -18 },
  { x: 18,  z: -22 }
];

// ==========================================
// 2. DOM ELEMENTS, FUN MINIGAME MODAL & HORROR PULSE
// ==========================================
const UI = {
  accessScreen: document.getElementById("access-screen"),
  playerNameInput: document.getElementById("player-name"),
  accessCodeInput: document.getElementById("access-code"),
  startBtn: document.getElementById("start-btn"),
  loginStatus: document.getElementById("login-status"),

  continueCodeInput: document.getElementById("continue-code-input"),
  continueBtn: document.getElementById("continue-btn"),
  continueStatus: document.getElementById("continue-status"),

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

// Large Smooth Rotation Buttons for Mobile & Desktop
const turnControlsRow = document.createElement("div");
turnControlsRow.id = "smooth-turn-controls";
turnControlsRow.style.cssText = [
  "position: fixed",
  "left: 14px",
  "bottom: 18px",
  "z-index: 25",
  "display: none",
  "gap: 10px"
].join(";");
turnControlsRow.innerHTML = `
  <button id="btn-turn-left" type="button" aria-label="Turn Left">↺</button>
  <button id="btn-turn-right" type="button" aria-label="Turn Right">↻</button>
`;
document.body.appendChild(turnControlsRow);

const btnTurnLeft = document.getElementById("btn-turn-left");
const btnTurnRight = document.getElementById("btn-turn-right");

// Fun Minigame Modal
const minigameModal = document.createElement("div");
minigameModal.id = "fun-minigame-modal";
minigameModal.style.cssText = [
  "position: fixed",
  "inset: 0",
  "z-index: 40",
  "display: none",
  "align-items: center",
  "justify-content: center",
  "background: rgba(16, 5, 3, 0.86)",
  "backdrop-filter: blur(4px)",
  "padding: 16px"
].join(";");
minigameModal.innerHTML = `
  <div style="width:100%;max-width:440px;background:#260d09;border:1px solid rgba(251,146,60,0.55);border-radius:16px;padding:22px;color:#fff7ed;box-shadow:0 20px 50px rgba(0,0,0,0.8);font-family:system-ui,sans-serif;">
    <div id="mg-badge" style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(251,146,60,0.2);color:#fdba74;font-size:12px;font-weight:800;margin-bottom:10px;">STAGE 1 • FUN GAME</div>
    <h3 id="mg-title" style="margin:0 0 6px 0;font-size:19px;color:#ffffff;"></h3>
    <p id="mg-prompt" style="margin:0 0 14px 0;font-size:14px;line-height:1.45;color:#fed7aa;"></p>
    <div id="mg-body" style="margin-bottom:12px;"></div>
    <div id="mg-feedback" style="min-height:20px;font-size:13px;color:#fca5a5;margin-bottom:10px;"></div>
    <div style="display:flex;justify-content:flex-end;">
      <button id="mg-close-btn" type="button" style="padding:10px 16px;border-radius:10px;border:1px solid rgba(251,146,60,0.4);background:transparent;color:#fed7aa;cursor:pointer;">പിന്നോട്ട്</button>
    </div>
  </div>
`;
document.body.appendChild(minigameModal);

const mgBadge = document.getElementById("mg-badge");
const mgTitle = document.getElementById("mg-title");
const mgPrompt = document.getElementById("mg-prompt");
const mgBody = document.getElementById("mg-body");
const mgFeedback = document.getElementById("mg-feedback");
const mgCloseBtn = document.getElementById("mg-close-btn");

// Stage-specific horror flash overlay (stages 4, 7, 9 only)
const stageHorrorFlash = document.createElement("div");
stageHorrorFlash.style.cssText = [
  "position: fixed",
  "inset: 0",
  "z-index: 48",
  "pointer-events: none",
  "display: none",
  "background: radial-gradient(circle, rgba(220,38,38,0.14) 20%, rgba(153,27,27,0.78) 100%)",
  "align-items: center",
  "justify-content: center",
  "color: #fecaca",
  "font-size: 24px",
  "font-weight: 900",
  "letter-spacing: 1.5px",
  "text-shadow: 0 0 20px #dc2626"
].join(";");
stageHorrorFlash.textContent = "⚠️ MARS HORROR SURGE!";
document.body.appendChild(stageHorrorFlash);

const infoBanner = document.createElement("div");
infoBanner.style.cssText = [
  "position: fixed",
  "top: 56px",
  "left: 50%",
  "transform: translateX(-50%)",
  "z-index: 25",
  "max-width: 92vw",
  "padding: 8px 14px",
  "border-radius: 10px",
  "background: rgba(38, 12, 8, 0.92)",
  "border: 1px solid rgba(251, 146, 60, 0.5)",
  "color: #fed7aa",
  "font-size: 13px",
  "font-weight: 600",
  "text-align: center",
  "display: none"
].join(";");
document.body.appendChild(infoBanner);

let bannerTimer = null;
function showInfoBanner(msg, color = "#fed7aa") {
  infoBanner.textContent = msg;
  infoBanner.style.color = color;
  infoBanner.style.display = "block";
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    infoBanner.style.display = "none";
  }, 2600);
}

// ==========================================
// 3. AUDIO (Web Audio API)
// ==========================================
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playStageClearSound() {
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(940, audioCtx.currentTime + 0.22);
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.24);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (_) {}
}

function playStageHorrorSound() {
  try {
    ensureAudio();
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.55);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.62);
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
  currentStageIndex: 0, // 0..9 (only currentStageIndex stage marker is visible!)
  activeMinigameIndex: null,
  horrorSurgeTimer: 0,
  shakeIntensity: 0,
  startTimeMs: 0,
  elapsedSeconds: 0,
  finished: false
};

const controls = {
  forward: false,
  backward: false,
  strafeLeft: false,
  strafeRight: false,
  turnLeft: false,
  turnRight: false
};

let playerYaw = -Math.PI / 4; // Facing diagonally toward interior of Mars maze from corner (-27, 27)

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
        doorIndex: sessionState.currentStageIndex,
        elapsedSeconds: Number(sessionState.elapsedSeconds.toFixed(2)),
        finished
      })
    });
  } catch (_) {}
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
  } catch (_) {
    return { valid: false, reason: "NETWORK_ERROR" };
  }
}

async function handleContinueUsedCode() {
  const usedCode = String(UI.continueCodeInput?.value || "").trim().toUpperCase();
  if (!usedCode) {
    setContinueStatus("ദയവായി ഉപയോഗിച്ച ആക്സസ് കോഡ് നൽകുക.", true);
    return;
  }

  if (UI.continueBtn) UI.continueBtn.disabled = true;
  setContinueStatus("സെഷൻ കണ്ടെത്തുന്നു...", false);

  try {
    const response = await fetch(CONTINUE_CODE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: usedCode })
    });
    const data = await response.json();
    if (UI.continueBtn) UI.continueBtn.disabled = false;

    if (!data || !data.valid) {
      setContinueStatus("ഈ കോഡ് ഉപയോഗിച്ച് തുടരാൻ കഴിഞ്ഞില്ല.", true);
      return;
    }

    const typedName = String(UI.playerNameInput?.value || "").trim();
    setContinueStatus("", false);
    startSession({
      sessionId: data.sessionId,
      playerName: typedName || data.playerName || "Player",
      accessCode: data.code || usedCode,
      stageIndex: Number(data.doorIndex || 0),
      elapsedSeconds: Number(data.elapsedSeconds || 0)
    });
  } catch (_) {
    if (UI.continueBtn) UI.continueBtn.disabled = false;
    setContinueStatus("സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.", true);
  }
}

async function tryResumeExistingSession() {
  const existingId = readPersistedSessionId();
  if (!existingId) return false;

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
        stageIndex: Number(data.doorIndex || 0),
        elapsedSeconds: Number(data.elapsedSeconds || 0)
      });
      return true;
    }
  } catch (_) {}
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
      setLoginStatus("ഈ കോഡ് ഉപയോഗിച്ചു കഴിഞ്ഞു — താഴെയുള്ള Continue Mission ഉപയോഗിക്കുക.", true);
      if (UI.continueCodeInput && !UI.continueCodeInput.value) UI.continueCodeInput.value = code;
    } else if (result?.reason === "INVALID_CODE") {
      setLoginStatus("തെറ്റായ ആക്സസ് കോഡ്.", true);
    } else {
      setLoginStatus("സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.", true);
    }
    return;
  }

  setLoginStatus("", false);
  startSession({
    sessionId: result.sessionId,
    playerName,
    accessCode: code,
    stageIndex: Number(result.doorIndex || 0),
    elapsedSeconds: Number(result.elapsedSeconds || 0)
  });
}

function setLoginStatus(msg, isError) {
  if (!UI.loginStatus) return;
  UI.loginStatus.textContent = msg;
  UI.loginStatus.style.color = isError ? "#fca5a5" : "#86efac";
}

function setContinueStatus(msg, isError) {
  if (!UI.continueStatus) return;
  UI.continueStatus.textContent = msg;
  UI.continueStatus.style.color = isError ? "#fca5a5" : "#86efac";
}

function updateHudStage() {
  if (!UI.hudDoor) return;
  const shown = Math.min(sessionState.currentStageIndex + 1, TOTAL_STAGES);
  UI.hudDoor.textContent = `Stage: ${shown} / ${TOTAL_STAGES}`;
}

// ==========================================
// 6. MARS PLANET SCENE, CORNER START & SINGLE VISIBLE STAGE
// ==========================================
function createMarsGroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#8c3219";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 1.5 + Math.random() * 4.5;
    const tones = ["#6e2210", "#a83e1f", "#c24c27", "#57190b"];
    ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
  return tex;
}

function createMarsRockWallTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#5c1d10";
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const w = 4 + Math.random() * 10;
    const h = 4 + Math.random() * 10;
    ctx.fillStyle = Math.random() > 0.5 ? "#7a2816" : "#3d1108";
    ctx.fillRect(x, y, w, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  return tex;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2b0b06);
scene.fog = new THREE.FogExp2(0x2b0b06, 0.015);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 160);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
UI.canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffb48a, 0x3b1109, 0.95));

const marsSunLight = new THREE.DirectionalLight(0xffcf9e, 1.15);
marsSunLight.position.set(24, 40, 22);
marsSunLight.castShadow = true;
scene.add(marsSunLight);

const marsGround = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshStandardMaterial({ map: createMarsGroundTexture(), roughness: 0.92 })
);
marsGround.rotation.x = -Math.PI / 2;
marsGround.receiveShadow = true;
scene.add(marsGround);

const marsWallMat = new THREE.MeshStandardMaterial({
  map: createMarsRockWallTexture(),
  roughness: 0.88,
  metalness: 0.06
});

const wallColliders = [];
function addMarsWall(x, z, w, d, h = 3.2) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), marsWallMat);
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

// Outer Mars Perimeter
addMarsWall(0, 31, 64, 2.2);
addMarsWall(0, -31, 64, 2.2);
addMarsWall(-31, 0, 2.2, 64);
addMarsWall(31, 0, 2.2, 64);

// Mars Canyon Maze Walls (open paths from bottom-left corner -27, 27)
addMarsWall(-18, 22, 12, 2.0);
addMarsWall(-10, 28, 2.0, 10);
addMarsWall(4, 24, 14, 2.0);
addMarsWall(18, 25, 10, 2.0);
addMarsWall(-22, 16, 10, 2.0);
addMarsWall(-6, 13, 12, 2.0);
addMarsWall(10, 15, 2.0, 12);
addMarsWall(22, 14, 10, 2.0);
addMarsWall(-18, 2, 2.0, 14);
addMarsWall(-4, 2, 10, 2.0);
addMarsWall(14, 2, 14, 2.0);
addMarsWall(-20, -12, 14, 2.0);
addMarsWall(0, -14, 2.0, 14);
addMarsWall(16, -15, 14, 2.0);

// 10 Stage Markers — ONLY the current active stage is visible!
const stageBeacons = STAGE_SPOTS.map((spot, idx) => {
  const group = new THREE.Group();

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.65, 28),
    new THREE.MeshBasicMaterial({ color: 0xfb923c, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.75, 0),
    new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      emissive: 0xc2410c,
      roughness: 0.25,
      metalness: 0.4
    })
  );
  core.position.y = 1.4;

  group.add(ring, core);
  group.position.set(spot.x, 0, spot.z);
  group.visible = idx === 0;
  scene.add(group);

  return {
    index: idx,
    x: spot.x,
    z: spot.z,
    group,
    core,
    completed: false
  };
});

function syncStagesVisibility() {
  stageBeacons.forEach((st, idx) => {
    const isDone = idx < sessionState.currentStageIndex;
    st.completed = isDone;
    st.group.visible = idx === sessionState.currentStageIndex;
  });
}

// Start from corner (-27, 27)
const playerPos = new THREE.Vector3(-27, 1.6, 27);
const PLAYER_RADIUS = 0.55;

function updateCameraFromYaw() {
  camera.position.set(playerPos.x, playerPos.y, playerPos.z);
  const lookX = playerPos.x - Math.sin(playerYaw) * 9;
  const lookZ = playerPos.z - Math.cos(playerYaw) * 9;
  camera.lookAt(lookX, playerPos.y - 0.1, lookZ);
}

function startSession({ sessionId, playerName, accessCode, stageIndex, elapsedSeconds }) {
  const safeStage = Math.max(0, Math.min(stageIndex, TOTAL_STAGES));

  sessionState = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    currentStageIndex: safeStage,
    activeMinigameIndex: null,
    horrorSurgeTimer: 0,
    shakeIntensity: 0,
    startTimeMs: performance.now() - elapsedSeconds * 1000,
    elapsedSeconds,
    finished: safeStage >= TOTAL_STAGES
  };

  persistSessionId(sessionId);
  playerPos.set(-27, 1.6, 27);
  playerYaw = -Math.PI / 4;
  updateCameraFromYaw();
  syncStagesVisibility();

  if (UI.accessScreen) UI.accessScreen.style.display = "none";
  if (UI.winModal) UI.winModal.style.display = "none";
  if (UI.hud) UI.hud.style.display = "flex";
  turnControlsRow.style.display = "flex";
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${playerName}`;
  updateHudStage();
  showInfoBanner("Mars മൂലയിൽ നിന്ന് ദൗത്യം തുടങ്ങി! Stage 1 മാത്രമേ ദൃശ്യമാകൂ.");
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

// ==========================================
// 7. FUN MINIGAMES & STAGE-SPECIFIC HORROR (STAGES 4, 7, 9 ONLY)
// ==========================================
function triggerStageHorrorIfNeeded(stageNumber) {
  if (!HORROR_STAGES.has(stageNumber)) return;
  sessionState.horrorSurgeTimer = 0.85;
  sessionState.shakeIntensity = 0.26;
  stageHorrorFlash.style.display = "flex";
  playStageHorrorSound();
}

function openStageMinigame(stageIdx) {
  if (!sessionState.active || sessionState.finished) return;
  if (sessionState.activeMinigameIndex !== null) return;
  if (stageIdx !== sessionState.currentStageIndex) return;

  const gameCfg = STAGE_MINIGAMES[stageIdx];
  if (!gameCfg) return;

  sessionState.activeMinigameIndex = stageIdx;
  controls.forward = controls.backward = controls.strafeLeft = controls.strafeRight = false;

  triggerStageHorrorIfNeeded(gameCfg.stage);

  if (mgBadge) mgBadge.textContent = `STAGE ${gameCfg.stage} / ${TOTAL_STAGES} • ${gameCfg.title}`;
  if (mgTitle) mgTitle.textContent = gameCfg.title;
  if (mgPrompt) mgPrompt.textContent = gameCfg.prompt;
  if (mgFeedback) mgFeedback.textContent = "";
  if (mgBody) mgBody.innerHTML = "";

  if (gameCfg.type === "TARGET_RUSH") {
    let tapsDone = 0;
    const progressEl = document.createElement("div");
    progressEl.style.cssText = "font-size:14px;font-weight:700;color:#86efac;margin-bottom:10px;";
    progressEl.textContent = `Targets hit: 0 / ${gameCfg.targetClicks}`;

    const gridEl = document.createElement("div");
    gridEl.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:10px;";

    for (let i = 0; i < 6; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "🛰️";
      btn.style.cssText = "height:56px;border-radius:12px;background:rgba(249,115,22,0.22);border:1px solid #fb923c;color:#fff;font-size:22px;";
      btn.addEventListener("click", () => {
        if (btn.dataset.hit === "1") return;
        btn.dataset.hit = "1";
        btn.textContent = "✅";
        btn.style.background = "rgba(34,197,94,0.3)";
        btn.style.borderColor = "#4ade80";
        tapsDone += 1;
        progressEl.textContent = `Targets hit: ${tapsDone} / ${gameCfg.targetClicks}`;
        if (tapsDone >= gameCfg.targetClicks) {
          completeCurrentStage();
        }
      });
      gridEl.appendChild(btn);
    }

    mgBody.appendChild(progressEl);
    mgBody.appendChild(gridEl);
  } else {
    const listEl = document.createElement("div");
    listEl.style.cssText = "display:flex;flex-direction:column;gap:8px;";

    gameCfg.options.forEach((optText, optIdx) => {
      const optBtn = document.createElement("button");
      optBtn.type = "button";
      optBtn.textContent = optText;
      optBtn.style.cssText = "width:100%;text-align:left;padding:12px 14px;border-radius:10px;background:rgba(255,255,255,0.08);border:1px solid rgba(251,146,60,0.4);color:#fff7ed;";
      optBtn.addEventListener("click", () => {
        if (optIdx === gameCfg.answer) {
          completeCurrentStage();
        } else {
          if (mgFeedback) mgFeedback.textContent = "ശരിയായ ഉത്തരം അല്ല — വീണ്ടും ശ്രമിക്കുക!";
        }
      });
      listEl.appendChild(optBtn);
    });

    mgBody.appendChild(listEl);
  }

  minigameModal.style.display = "flex";
}

function closeStageMinigame() {
  sessionState.activeMinigameIndex = null;
  minigameModal.style.display = "none";
  // Step back slightly so stage does not immediately re-open
  playerPos.x += Math.sin(playerYaw) * 1.4;
  playerPos.z += Math.cos(playerYaw) * 1.4;
}

async function completeCurrentStage() {
  sessionState.activeMinigameIndex = null;
  minigameModal.style.display = "none";
  sessionState.currentStageIndex += 1;

  playStageClearSound();
  syncStagesVisibility();
  updateHudStage();

  if (sessionState.currentStageIndex >= TOTAL_STAGES) {
    await handleGameWin();
    return;
  }

  showInfoBanner(`🚀 Stage ${sessionState.currentStageIndex} പൂർത്തിയായി! ഇപ്പോൾ Stage ${sessionState.currentStageIndex + 1} തെളിഞ്ഞു.`);
  await saveProgressToServer(false);
}

async function handleGameWin() {
  if (sessionState.finished) return;
  sessionState.finished = true;
  sessionState.active = false;
  infoBanner.style.display = "none";
  turnControlsRow.style.display = "none";
  clearSessionId();
  playStageClearSound();

  const finalTime = sessionState.elapsedSeconds.toFixed(2);
  await saveProgressToServer(true);

  if (UI.hud) UI.hud.style.display = "none";
  if (UI.winSummary) {
    UI.winSummary.textContent = `അഭിനന്ദനങ്ങൾ ${sessionState.playerName}! Mars-ലെ 10 Fun Stages പൂർത്തിയാക്കാൻ എടുത്ത ആകെ സമയം: ${finalTime}s`;
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
    } catch (_) {
      if (UI.formSubmitStatus) UI.formSubmitStatus.textContent = "Form സബ്മിഷനിൽ പിശക് സംഭവിച്ചു.";
    }
  }
}

// ==========================================
// 8. SMOOTH ROTATION & CONTROLS
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
  if (sessionState.activeMinigameIndex !== null) {
    if (e.key === "Escape") closeStageMinigame();
    return;
  }
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") controls.forward = true;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") controls.backward = true;
  if (e.key === "a" || e.key === "A") controls.strafeLeft = true;
  if (e.key === "d" || e.key === "D") controls.strafeRight = true;
  if (e.key === "ArrowLeft" || e.key === "q" || e.key === "Q") controls.turnLeft = true;
  if (e.key === "ArrowRight" || e.key === "e" || e.key === "E") controls.turnRight = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") controls.forward = false;
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") controls.backward = false;
  if (e.key === "a" || e.key === "A") controls.strafeLeft = false;
  if (e.key === "d" || e.key === "D") controls.strafeRight = false;
  if (e.key === "ArrowLeft" || e.key === "q" || e.key === "Q") controls.turnLeft = false;
  if (e.key === "ArrowRight" || e.key === "e" || e.key === "E") controls.turnRight = false;
});

function bindHoldBtn(el, keyName) {
  if (!el) return;
  const press = (ev) => {
    ev.preventDefault();
    controls[keyName] = true;
  };
  const release = (ev) => {
    ev.preventDefault();
    controls[keyName] = false;
  };
  el.addEventListener("touchstart", press, { passive: false });
  el.addEventListener("touchend", release, { passive: false });
  el.addEventListener("mousedown", press);
  el.addEventListener("mouseup", release);
  el.addEventListener("mouseleave", release);
}

bindHoldBtn(UI.btnUp, "forward");
bindHoldBtn(UI.btnDown, "backward");
bindHoldBtn(UI.btnLeft, "strafeLeft");
bindHoldBtn(UI.btnRight, "strafeRight");
bindHoldBtn(btnTurnLeft, "turnLeft");
bindHoldBtn(btnTurnRight, "turnRight");

let isDraggingLook = false;
let lastPointerX = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  if (!sessionState.active) return;
  isDraggingLook = true;
  lastPointerX = e.clientX;
});

window.addEventListener("pointermove", (e) => {
  if (!isDraggingLook || !sessionState.active) return;
  const dx = e.clientX - lastPointerX;
  lastPointerX = e.clientX;
  playerYaw -= dx * 0.0065;
});

window.addEventListener("pointerup", () => {
  isDraggingLook = false;
});

if (UI.startBtn) UI.startBtn.addEventListener("click", handleStartGame);
if (UI.continueBtn) UI.continueBtn.addEventListener("click", handleContinueUsedCode);
if (mgCloseBtn) mgCloseBtn.addEventListener("click", closeStageMinigame);

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

  if (sessionState.active && !sessionState.finished) {
    sessionState.elapsedSeconds = (now - sessionState.startTimeMs) / 1000;
    if (UI.hudTimer) {
      UI.hudTimer.textContent = `Time: ${sessionState.elapsedSeconds.toFixed(1)}s`;
    }
  }

  if (sessionState.horrorSurgeTimer > 0) {
    sessionState.horrorSurgeTimer -= dt;
    if (sessionState.horrorSurgeTimer <= 0) {
      stageHorrorFlash.style.display = "none";
      sessionState.shakeIntensity = 0;
    }
  }

  if (sessionState.active && !sessionState.finished && sessionState.activeMinigameIndex === null) {
    const turnSpeed = 2.45 * dt;
    if (controls.turnLeft) playerYaw += turnSpeed;
    if (controls.turnRight) playerYaw -= turnSpeed;

    const moveSpeed = 7.8 * dt;
    const fwdX = -Math.sin(playerYaw);
    const fwdZ = -Math.cos(playerYaw);
    const rightX = Math.cos(playerYaw);
    const rightZ = -Math.sin(playerYaw);

    let dx = 0;
    let dz = 0;
    if (controls.forward) { dx += fwdX * moveSpeed; dz += fwdZ * moveSpeed; }
    if (controls.backward) { dx -= fwdX * moveSpeed; dz -= fwdZ * moveSpeed; }
    if (controls.strafeLeft) { dx -= rightX * moveSpeed; dz -= rightZ * moveSpeed; }
    if (controls.strafeRight) { dx += rightX * moveSpeed; dz += rightZ * moveSpeed; }

    const nextX = playerPos.x + dx;
    if (!collidesWithWall(nextX, playerPos.z)) playerPos.x = nextX;

    const nextZ = playerPos.z + dz;
    if (!collidesWithWall(playerPos.x, nextZ)) playerPos.z = nextZ;

    const shakeX = sessionState.shakeIntensity > 0 ? (Math.random() - 0.5) * sessionState.shakeIntensity : 0;
    const shakeY = sessionState.shakeIntensity > 0 ? (Math.random() - 0.5) * sessionState.shakeIntensity : 0;
    camera.position.set(playerPos.x + shakeX, playerPos.y + shakeY, playerPos.z);
    const lookX = playerPos.x - Math.sin(playerYaw) * 9;
    const lookZ = playerPos.z - Math.cos(playerYaw) * 9;
    camera.lookAt(lookX, playerPos.y - 0.1, lookZ);

    const activeStage = stageBeacons[sessionState.currentStageIndex];
    if (activeStage && activeStage.group.visible) {
      const dist = Math.hypot(playerPos.x - activeStage.x, playerPos.z - activeStage.z);
      if (dist <= 1.95) {
        openStageMinigame(activeStage.index);
      }
    }
  }

  stageBeacons.forEach((st) => {
    if (st.group.visible) {
      st.core.rotation.y += 2.2 * dt;
      st.core.position.y = 1.4 + Math.sin(now * 0.004) * 0.15;
    }
  });

  renderer.render(scene, camera);
}

tryResumeExistingSession();
requestAnimationFrame(animate);