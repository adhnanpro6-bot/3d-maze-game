// ==========================================
// 1. CONFIGURATION
// ==========================================
const VERIFY_ENDPOINT = "/api/verify-code";
const RESUME_ENDPOINT = "/api/resume-session";
const PROGRESS_ENDPOINT = "/api/save-progress";

const TOTAL_STAGES = 12;

const GOOGLE_FORM_CONFIG = {
  enabled: false,
  formResponseUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  entries: {
    playerName: "entry.1111111111",
    accessCode: "entry.2222222222",
    completionTime: "entry.3333333333"
  }
};

// 12 Stages with Maths, GK, and Sports Clues + Fake Keys + Fake Routes
// Left lane x ≈ -5.2 | Center x ≈ 0 | Right lane x ≈ +5.2
const TREASURE_STAGES = [
  {
    stage: 1,
    category: "MATHS CLUE",
    doorZ: -10,
    clue: "🔢 Maths Clue 1: (18 ÷ 3) + 2 = 8 (Even). ഇരട്ട സംഖ്യ ഇടതുവശത്തെ (LEFT) ഇടനാഴിയിൽ കീ തിരയുക!",
    keyPos: { x: -5.2, z: -6.5 },
    fakeKeys: [{ x: 5.2, z: -6.5 }]
  },
  {
    stage: 2,
    category: "SPORTS CLUE",
    doorZ: -21,
    clue: "⚽ Sports Clue 2: ഒരു ഫുട്ബോൾ ടീമിൽ 11 കളിക്കാർ (Odd). ഒറ്റസംഖ്യ വലതുവശത്തെ (RIGHT) ഭാഗത്ത് കീ ഉണ്ട്!",
    keyPos: { x: 5.2, z: -17.0 },
    fakeKeys: [{ x: -5.2, z: -16.5 }, { x: 0, z: -14.5 }]
  },
  {
    stage: 3,
    category: "GK CLUE",
    doorZ: -32,
    clue: "🌍 GK Clue 3: കേരളത്തിൽ 14 ജില്ലകൾ (Even). ഇടതുവശത്തെ (LEFT) മറവിൽ കീ ഒളിഞ്ഞിരിപ്പുണ്ട്.",
    keyPos: { x: -5.2, z: -27.5 },
    fakeKeys: [{ x: 5.2, z: -27.5 }]
  },
  {
    stage: 4,
    category: "MATHS CLUE",
    doorZ: -43,
    clue: "🔢 Maths Clue 4: 9 × 3 = 27 (Odd). വലതുവശത്തെ (RIGHT) ശാഖയിൽ കീ കണ്ടെത്തുക!",
    keyPos: { x: 5.2, z: -38.5 },
    fakeKeys: [{ x: -5.2, z: -38.5 }, { x: -5.2, z: -35.5 }]
  },
  {
    stage: 5,
    category: "SPORTS CLUE",
    doorZ: -54,
    clue: "🏆 Sports Clue 5: FIFA ലോകകപ്പ് 4 വർഷത്തിലൊരിക്കൽ (Even). ഇടതുവശത്തെ (LEFT) ചുവരിനരികിൽ കീ തിരയുക!",
    keyPos: { x: -5.2, z: -49.0 },
    fakeKeys: [{ x: 5.2, z: -49.0 }]
  },
  {
    stage: 6,
    category: "GK CLUE",
    doorZ: -65,
    clue: "🌍 GK Clue 6: ലോകത്തിലെ ഏറ്റവും വലിയ ഭൂഖണ്ഡം ഏഷ്യ (1). 1 = വലതുവശം (RIGHT) — അവിടെ കീ ഉണ്ട്!",
    keyPos: { x: 5.2, z: -60.0 },
    fakeKeys: [{ x: -5.2, z: -60.0 }, { x: 0, z: -58.0 }]
  },
  {
    stage: 7,
    category: "MATHS CLUE",
    doorZ: -76,
    clue: "🔢 Maths Clue 7: 100 - 64 = 36 (Even). ഇടതുവശത്തെ (LEFT) ഇടനാഴിയിലേക്ക് തിരിയുക!",
    keyPos: { x: -5.2, z: -71.0 },
    fakeKeys: [{ x: 5.2, z: -71.0 }, { x: 5.2, z: -68.5 }]
  },
  {
    stage: 8,
    category: "SPORTS CLUE",
    doorZ: -87,
    clue: "🏏 Sports Clue 8: ക്രിക്കറ്റ് ടെസ്റ്റ് ഇന്നിംഗ്സ്/ടീം ഘടനയിൽ 11 (Odd). വലതുവശത്തെ (RIGHT) മൂലയിൽ കീ ഉണ്ട്!",
    keyPos: { x: 5.2, z: -82.0 },
    fakeKeys: [{ x: -5.2, z: -82.0 }]
  },
  {
    stage: 9,
    category: "GK CLUE",
    doorZ: -98,
    clue: "🌍 GK Clue 9: സൂര്യയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം വ്യാഴം (Jupiter — J = Left/Even). ഇടതുവശത്തെ (LEFT) ഭാഗത്ത് കീ തിരയുക!",
    keyPos: { x: -5.2, z: -93.0 },
    fakeKeys: [{ x: 5.2, z: -93.0 }, { x: 0, z: -91.0 }]
  },
  {
    stage: 10,
    category: "MATHS CLUE",
    doorZ: -109,
    clue: "🔢 Maths Clue 10: 15 × 3 = 45 (Odd). വലതുവശത്തെ (RIGHT) ഭാഗത്ത് കീ ഒളിപ്പിച്ചിട്ടുണ്ട്!",
    keyPos: { x: 5.2, z: -104.0 },
    fakeKeys: [{ x: -5.2, z: -104.0 }, { x: -5.2, z: -101.5 }]
  },
  {
    stage: 11,
    category: "SPORTS CLUE",
    doorZ: -120,
    clue: "🏅 Sports Clue 11: ഒളിമ്പിക് റിംഗുകൾ 5 എണ്ണം (Odd -> Right). വലതുവശത്തെ (RIGHT) ഇടനാഴിയിൽ കീ കണ്ടെത്തുക!",
    keyPos: { x: 5.2, z: -115.0 },
    fakeKeys: [{ x: -5.2, z: -115.0 }]
  },
  {
    stage: 12,
    category: "GK CLUE (FINAL)",
    doorZ: -131,
    clue: "🔥 Final GK Clue 12: ഇന്ത്യയുടെ ഭരണഘടന നിലവിൽ വന്ന വർഷം 1950 (Even -> Left). അവസാന കീ ഇടതുവശത്ത് (LEFT)!",
    keyPos: { x: -5.2, z: -126.0 },
    fakeKeys: [{ x: 5.2, z: -126.0 }, { x: 0, z: -124.0 }]
  }
];

// ==========================================
// 2. DOM ELEMENTS & BANNERS
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

const clueBanner = document.createElement("div");
clueBanner.id = "treasure-clue-banner";
clueBanner.style.cssText = [
  "position: fixed",
  "top: 56px",
  "left: 50%",
  "transform: translateX(-50%)",
  "z-index: 25",
  "max-width: 94vw",
  "padding: 10px 16px",
  "border-radius: 10px",
  "background: rgba(10, 17, 34, 0.92)",
  "border: 1px solid rgba(255, 209, 102, 0.75)",
  "color: #ffd166",
  "font-size: 13.5px",
  "font-weight: 600",
  "text-align: center",
  "display: none",
  "box-shadow: 0 6px 22px rgba(0,0,0,0.5)"
].join(";");
document.body.appendChild(clueBanner);

const toastBanner = document.createElement("div");
toastBanner.id = "treasure-toast";
toastBanner.style.cssText = [
  "position: fixed",
  "bottom: 118px",
  "left: 50%",
  "transform: translateX(-50%)",
  "z-index: 25",
  "max-width: 92vw",
  "padding: 8px 14px",
  "border-radius: 8px",
  "background: rgba(18, 28, 48, 0.94)",
  "border: 1px solid rgba(255,255,255,0.15)",
  "color: #7ee787",
  "font-size: 13px",
  "text-align: center",
  "display: none"
].join(";");
document.body.appendChild(toastBanner);

let toastTimeout = null;
function showToast(msg, color = "#7ee787") {
  toastBanner.textContent = msg;
  toastBanner.style.color = color;
  toastBanner.style.display = "block";
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastBanner.style.display = "none";
  }, 2400);
}

// ==========================================
// 3. SOUND EFFECTS (Web Audio API)
// ==========================================
let audioCtx = null;
function playTone(freq = 640, type = "triangle", duration = 0.18) {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      type === "sawtooth" ? freq * 0.55 : freq * 1.45,
      audioCtx.currentTime + duration
    );

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration + 0.02);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration + 0.03);
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
  currentStageIndex: 0, // 0..11
  collectedKeys: Array(TOTAL_STAGES).fill(false),
  unlockedDoors: Array(TOTAL_STAGES).fill(false),
  fakeKeyCooldown: 0,
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
  try {
    window.name = JSON.stringify({ mazeSessionId: sessionId });
  } catch (_) {}
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

  setLoginStatus("പഴയ 12-Door Treasure Hunt സെഷൻ തുടരുന്നു...", false);
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

function updateHudAndClue() {
  const idx = sessionState.currentStageIndex;
  if (UI.hudDoor) {
    UI.hudDoor.textContent = `Door: ${Math.min(idx + 1, TOTAL_STAGES)} / ${TOTAL_STAGES}`;
  }

  if (idx < TREASURE_STAGES.length) {
    const stageInfo = TREASURE_STAGES[idx];
    const hasKey = sessionState.collectedKeys[idx];
    clueBanner.style.display = "block";
    clueBanner.textContent = hasKey
      ? `🔑 Key ${idx + 1} ലഭിച്ചു! Door ${idx + 1} കടന്ന് അടുത്ത സോണിലേക്ക് നീങ്ങുക.`
      : stageInfo.clue;
  } else {
    clueBanner.style.display = "block";
    clueBanner.textContent = "🏆 12 വാതിലുകളും പൂർത്തിയായി! മുന്നിലുള്ള ഗോൾഡൻ ഫിനിഷ് സോണിലേക്ക് ഓടുക!";
  }
}

function startSession({ sessionId, playerName, accessCode, doorIndex, elapsedSeconds }) {
  const safeIdx = Math.max(0, Math.min(doorIndex, TOTAL_STAGES));

  sessionState = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    currentStageIndex: safeIdx,
    collectedKeys: Array(TOTAL_STAGES).fill(false).map((_, i) => i < safeIdx),
    unlockedDoors: Array(TOTAL_STAGES).fill(false).map((_, i) => i < safeIdx),
    fakeKeyCooldown: 0,
    startTimeMs: performance.now() - elapsedSeconds * 1000,
    elapsedSeconds,
    finished: false
  };

  persistSessionId(sessionId);
  syncWorldWithSession();

  if (UI.accessScreen) UI.accessScreen.style.display = "none";
  if (UI.winModal) UI.winModal.style.display = "none";
  if (UI.hud) UI.hud.style.display = "flex";
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${playerName}`;
  updateHudAndClue();
}

// ==========================================
// 6. ENLARGED 3D MAZE, FAKE ROUTES, FAKE KEYS & KALAKERALA WALL ADS
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x070b14);
scene.fog = new THREE.Fog(0x070b14, 14, 46);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 140);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
UI.canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.78));
const dirLight = new THREE.DirectionalLight(0xfff4d6, 1.0);
dirLight.position.set(12, 24, 15);
scene.add(dirLight);

// Enlarged Maze Floor (-144 to +10 along Z, width 22)
const mazeCenterZ = -67;
const mazeLengthZ = 156;
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, mazeLengthZ),
  new THREE.MeshStandardMaterial({ color: 0x111a2e, roughness: 0.85 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, mazeCenterZ);
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x24365c, roughness: 0.6 });
const fakeRouteWallMat = new THREE.MeshStandardMaterial({ color: 0x1a2744, roughness: 0.7 });
const lockedDoorMat = new THREE.MeshStandardMaterial({ color: 0xd94848, roughness: 0.4 });
const realKeyMat = new THREE.MeshStandardMaterial({
  color: 0xffd166,
  emissive: 0x8a5a00,
  metalness: 0.55,
  roughness: 0.25
});
const fakeKeyMat = new THREE.MeshStandardMaterial({
  color: 0x4ea8de,
  emissive: 0x113a5c,
  metalness: 0.4,
  roughness: 0.35
});

const wallColliders = [];
const doorObjects = [];
const realKeyObjects = [];
const fakeKeyObjects = [];

function addWall(x, y, z, w, h, d, isFakeRoute = false) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    isFakeRoute ? fakeRouteWallMat : wallMat
  );
  mesh.position.set(x, y, z);
  scene.add(mesh);
  wallColliders.push({
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2
  });
}

// Outer maze boundary walls (x = -8.5 and +8.5, total playable width ~16)
addWall(-8.5, 1.6, mazeCenterZ, 1, 3.2, mazeLengthZ);
addWall(8.5, 1.6, mazeCenterZ, 1, 3.2, mazeLengthZ);
addWall(0, 1.6, 10, 18, 3.2, 1);
addWall(0, 1.6, -144, 18, 3.2, 1);

// KALAKERALA ARTS & SPORTS CLUB (CHELAKKADAVU) Wall Advertisements
const texLoader = new THREE.TextureLoader();
const logoTexture = texLoader.load("/logo.png", undefined, undefined, () => {
  // Fallback canvas texture if /logo.png is not yet placed
});

function createClubAdBanner(x, y, z, rotY, width = 4.2, height = 2.1) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#090c12";
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 236);

  ctx.fillStyle = "#f2c94c";
  ctx.font = "bold 28px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("KALAKERALA ARTS & SPORTS CLUB", 256, 78);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial, sans-serif";
  ctx.fillText("CHELAKKADAVU  •  ESTD 1983", 256, 125);

  ctx.fillStyle = "#9fb3c8";
  ctx.font = "18px Arial, sans-serif";
  ctx.fillText("3D MAZE TREASURE HUNT CHALLENGE", 256, 175);

  const fallbackTex = new THREE.CanvasTexture(canvas);
  const bannerMat = new THREE.MeshStandardMaterial({
    map: fallbackTex,
    roughness: 0.45
  });

  const banner = new THREE.Mesh(new THREE.PlaneGeometry(width, height), bannerMat);
  banner.position.set(x, y, z);
  banner.rotation.y = rotY;
  scene.add(banner);

  // If /logo.png exists, place a crisp circular/square emblem badge beside/over it
  const badgeMat = new THREE.MeshBasicMaterial({
    map: logoTexture,
    transparent: true
  });
  const badge = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), badgeMat);
  const offsetDist = 0.03;
  badge.position.set(
    x + Math.sin(rotY) * offsetDist,
    y + 0.1,
    z + Math.cos(rotY) * offsetDist
  );
  badge.rotation.y = rotY;
  badge.visible = false;
  logoTexture.addEventListener("load", () => {
    badge.visible = true;
  });
  scene.add(badge);
}

// Place KALAKERALA club ads along left & right walls across the enlarged maze
[-4, -26, -48, -70, -92, -114, -135].forEach((zAd, i) => {
  if (i % 2 === 0) {
    createClubAdBanner(-7.95, 1.75, zAd, Math.PI / 2, 4.4, 2.1);
  } else {
    createClubAdBanner(7.95, 1.75, zAd, -Math.PI / 2, 4.4, 2.1);
  }
});

// Build 12 Stages, Divider Walls, Fake Routes (detour/dead-end blocks), Real Keys & Fake Keys
function buildKeyMesh(material, scale = 1) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32 * scale, 0.09 * scale, 10, 20), material);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.14 * scale, 0.52 * scale, 0.14 * scale), material);
  stem.position.y = -0.42 * scale;
  group.add(ring, stem);
  return group;
}

TREASURE_STAGES.forEach((stageData, idx) => {
  const zDoor = stageData.doorZ;
  const zoneMidZ = zDoor + 4.2;

  // Partition wall at doorZ with central gate (x from -1.5 to +1.5)
  addWall(-5.0, 1.6, zDoor, 6.0, 3.2, 0.9);
  addWall(5.0, 1.6, zDoor, 6.0, 3.2, 0.9);

  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 3.0, 0.45),
    lockedDoorMat.clone()
  );
  doorMesh.position.set(0, 1.5, zDoor);
  scene.add(doorMesh);

  doorObjects.push({
    index: idx,
    z: zDoor,
    mesh: doorMesh,
    unlocked: false
  });

  // Fake route maze pillars creating winding corridors & dead-end pockets
  const pillarX = idx % 2 === 0 ? -2.3 : 2.3;
  addWall(pillarX, 1.4, zoneMidZ + 1.4, 2.2, 2.8, 1.4, true);
  addWall(-pillarX, 1.4, zoneMidZ - 1.2, 2.2, 2.8, 1.4, true);

  // Real Key
  const realKeyGroup = buildKeyMesh(realKeyMat, 1.05);
  realKeyGroup.position.set(stageData.keyPos.x, 1.25, stageData.keyPos.z);
  scene.add(realKeyGroup);

  realKeyObjects.push({
    index: idx,
    x: stageData.keyPos.x,
    z: stageData.keyPos.z,
    mesh: realKeyGroup,
    collected: false
  });

  // Fake Keys (decoys)
  (stageData.fakeKeys || []).forEach((fk) => {
    const fakeGroup = buildKeyMesh(fakeKeyMat, 0.95);
    fakeGroup.position.set(fk.x, 1.2, fk.z);
    scene.add(fakeGroup);

    fakeKeyObjects.push({
      stageIndex: idx,
      x: fk.x,
      z: fk.z,
      mesh: fakeGroup
    });
  });
});

// Final Exit Zone at z = -139
const goalMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(2.0, 2.0, 0.3, 28),
  new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x775200 })
);
goalMesh.position.set(0, 0.15, -139);
scene.add(goalMesh);

const playerPos = new THREE.Vector3(0, 1.6, 6);
const PLAYER_RADIUS = 0.55;

function syncWorldWithSession() {
  realKeyObjects.forEach((k, idx) => {
    const collected = Boolean(sessionState.collectedKeys[idx]);
    k.collected = collected;
    k.mesh.visible = !collected;
  });

  doorObjects.forEach((d, idx) => {
    const unlocked = Boolean(sessionState.unlockedDoors[idx]);
    d.unlocked = unlocked;
    d.mesh.position.y = unlocked ? -2.4 : 1.5;
    d.mesh.material.color.setHex(unlocked ? 0x2ea043 : 0xd94848);
  });

  const startZ = sessionState.currentStageIndex > 0
    ? TREASURE_STAGES[Math.min(sessionState.currentStageIndex - 1, TOTAL_STAGES - 1)].doorZ - 2.4
    : 6;

  playerPos.set(0, 1.6, startZ);
  camera.position.copy(playerPos);
  camera.lookAt(0, 1.5, startZ - 12);
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

async function checkKeysAndDoors(dt) {
  if (sessionState.fakeKeyCooldown > 0) {
    sessionState.fakeKeyCooldown = Math.max(0, sessionState.fakeKeyCooldown - dt);
  }

  const activeStage = sessionState.currentStageIndex;
  if (activeStage < realKeyObjects.length) {
    const targetKey = realKeyObjects[activeStage];
    if (!targetKey.collected) {
      const dx = playerPos.x - targetKey.x;
      const dz = playerPos.z - targetKey.z;
      if (dx * dx + dz * dz <= 1.3 * 1.3) {
        targetKey.collected = true;
        targetKey.mesh.visible = false;
        sessionState.collectedKeys[activeStage] = true;
        playTone(680, "triangle", 0.2);

        const door = doorObjects[activeStage];
        door.unlocked = true;
        door.mesh.position.y = -2.4;
        door.mesh.material.color.setHex(0x2ea043);
        sessionState.unlockedDoors[activeStage] = true;
        sessionState.currentStageIndex = activeStage + 1;

        updateHudAndClue();
        showToast(`✅ ശരിയായ Key ${activeStage + 1} ലഭിച്ചു! Door ${activeStage + 1} തുറന്നു!`);
        await saveProgressToServer(false);
      }
    }

    // Check fake keys in active stage
    if (sessionState.fakeKeyCooldown === 0) {
      for (const fk of fakeKeyObjects) {
        if (fk.stageIndex !== activeStage) continue;
        const dx = playerPos.x - fk.x;
        const dz = playerPos.z - fk.z;
        if (dx * dx + dz * dz <= 1.15 * 1.15) {
          sessionState.fakeKeyCooldown = 2.0;
          sessionState.startTimeMs -= 3000; // +3s penalty for touching fake key
          playTone(220, "sawtooth", 0.22);
          showToast("❌ Fake Key! വ്യാജ കീ ആണ് (+3s പെനാൽറ്റി). ക്ലൂ കൃത്യമായി വായിക്കുക!", "#ff6b6b");
          break;
        }
      }
    }
  }
}

function collidesWithLockedDoor(x, z) {
  for (const d of doorObjects) {
    if (d.unlocked) continue;
    const closestX = Math.max(-1.5, Math.min(x, 1.5));
    const closestZ = Math.max(d.z - 0.35, Math.min(z, d.z + 0.35));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) {
      showToast(`🔒 Door ${d.index + 1} ലോക്ക് ആണ്! മുകളിലെ Clue വായിച്ച് ശരിയായ Key എടുക്കുക.`, "#ff9f43");
      return true;
    }
  }
  return false;
}

// ==========================================
// 7. WIN & GOOGLE FORM SUBMISSION
// ==========================================
async function handleGameWin() {
  if (sessionState.finished) return;
  sessionState.finished = true;
  sessionState.active = false;
  clueBanner.style.display = "none";
  clearSessionId();

  const finalTime = sessionState.elapsedSeconds.toFixed(2);
  await saveProgressToServer(true);

  if (UI.hud) UI.hud.style.display = "none";
  if (UI.winSummary) {
    UI.winSummary.textContent = `അഭിനന്ദനങ്ങൾ ${sessionState.playerName}! എല്ലാ 12 വാതിലുകളും കടന്ന് ഫിനിഷ് ചെയ്ത സമയം: ${finalTime}s`;
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
// 8. CONTROLS & SESSION RESUME HOOKS
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
  const press = (ev) => { ev.preventDefault(); keys[keyName] = true; };
  const release = (ev) => { ev.preventDefault(); keys[keyName] = false; };
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

    const moveSpeed = 7.2 * dt;
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

    checkKeysAndDoors(dt);

    camera.position.set(playerPos.x, playerPos.y, playerPos.z);
    camera.lookAt(playerPos.x, playerPos.y - 0.1, playerPos.z - 9);

    if (playerPos.z <= -137.8) {
      handleGameWin();
    }
  }

  realKeyObjects.forEach((k) => {
    if (!k.collected) k.mesh.rotation.y += 2.4 * dt;
  });
  fakeKeyObjects.forEach((fk) => {
    fk.mesh.rotation.y -= 2.8 * dt;
  });
  goalMesh.rotation.y += 1.6 * dt;
  renderer.render(scene, camera);
}

tryResumeExistingSession();
requestAnimationFrame(animate);