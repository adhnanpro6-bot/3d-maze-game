// ==========================================
// 1. CONFIGURATION
// ==========================================
const VERIFY_ENDPOINT = "/api/verify-code";
const RESUME_ENDPOINT = "/api/resume-session";
const PROGRESS_ENDPOINT = "/api/save-progress";

const GOOGLE_FORM_CONFIG = {
  enabled: false,
  formResponseUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  entries: {
    playerName: "entry.1111111111",
    accessCode: "entry.2222222222",
    completionTime: "entry.3333333333"
  }
};

// 5 Treasure Hunt Zones: Clue -> Find Key in Zone -> Unlock Door
const TREASURE_STAGES = [
  {
    stage: 1,
    doorZ: -8,
    clue: "Clue 1: ആദ്യ വാതിലിന്റെ കീ ഇടതുവശത്തെ (West / Left) ഇടനാഴിയിൽ ഒളിഞ്ഞിരിപ്പുണ്ട്.",
    keyPos: { x: -3.6, z: -4.2 }
  },
  {
    stage: 2,
    doorZ: -18,
    clue: "Clue 2: രണ്ടാം വാതിലിന്റെ കീ വലതുവശത്തെ (East / Right) മൂലയിലാണ്.",
    keyPos: { x: 3.6, z: -13.5 }
  },
  {
    stage: 3,
    doorZ: -28,
    clue: "Clue 3: മൂന്നാം വാതിലിന്റെ കീ ഇടതുവശത്തെ ചുവരിനരികിൽ നേരെ മുന്നോട്ട് പോയാൽ കാണാം.",
    keyPos: { x: -3.8, z: -24.5 }
  },
  {
    stage: 4,
    doorZ: -38,
    clue: "Clue 4: നാലാം വാതിലിന്റെ കീ വലതുവശത്തെ (Right) ഭാഗത്ത് വാതിലിന് തൊട്ടുമുമ്പിലുണ്ട്.",
    keyPos: { x: 3.5, z: -34.0 }
  },
  {
    stage: 5,
    doorZ: -48,
    clue: "Clue 5: അവസാന വാതിലിന്റെ (Vault) കീ ഇടതുവശത്തെ (Left) മറവിൽ തിളങ്ങുന്നുണ്ട്!",
    keyPos: { x: -3.7, z: -44.0 }
  }
];

// ==========================================
// 2. DOM ELEMENTS
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

// Clue & Status Banner created dynamically inside HUD/Body so no HTML changes needed
const clueBanner = document.createElement("div");
clueBanner.id = "treasure-clue-banner";
clueBanner.style.cssText = [
  "position: fixed",
  "top: 56px",
  "left: 50%",
  "transform: translateX(-50%)",
  "z-index: 25",
  "max-width: 92vw",
  "padding: 10px 16px",
  "border-radius: 10px",
  "background: rgba(12, 20, 38, 0.9)",
  "border: 1px solid rgba(255, 209, 102, 0.65)",
  "color: #ffd166",
  "font-size: 14px",
  "font-weight: 600",
  "text-align: center",
  "display: none",
  "box-shadow: 0 6px 20px rgba(0,0,0,0.45)"
].join(";");
document.body.appendChild(clueBanner);

const toastBanner = document.createElement("div");
toastBanner.id = "treasure-toast";
toastBanner.style.cssText = [
  "position: fixed",
  "bottom: 115px",
  "left: 50%",
  "transform: translateX(-50%)",
  "z-index: 25",
  "padding: 8px 14px",
  "border-radius: 8px",
  "background: rgba(20, 35, 60, 0.92)",
  "color: #7ee787",
  "font-size: 13px",
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
  }, 2200);
}

// ==========================================
// 3. SOUND EFFECT (Web Audio API)
// ==========================================
let audioCtx = null;
function playPickupSound(freq = 660) {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, audioCtx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.19);
  } catch (_) {}
}

// ==========================================
// 4. GAME STATE
// ==========================================
let sessionState = {
  active: false,
  sessionId: "",
  playerName: "",
  accessCode: "",
  currentStageIndex: 0, // 0..4
  collectedKeys: [false, false, false, false, false],
  unlockedDoors: [false, false, false, false, false],
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

  setLoginStatus("പഴയ Treasure Hunt സെഷൻ തുടരുന്നു...", false);
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
    UI.hudDoor.textContent = `Stage: ${Math.min(idx + 1, 5)} / 5`;
  }

  if (idx < TREASURE_STAGES.length) {
    const stageInfo = TREASURE_STAGES[idx];
    const hasKey = sessionState.collectedKeys[idx];
    clueBanner.style.display = "block";
    clueBanner.textContent = hasKey
      ? `🔑 Key ${idx + 1} ലഭിച്ചു! മുന്നോട്ടുള്ള വാതിൽ (Door ${idx + 1}) കടന്ന് അടുത്ത സോണിലേക്ക് പോകുക.`
      : stageInfo.clue;
  } else {
    clueBanner.style.display = "block";
    clueBanner.textContent = "🏆 എല്ലാ കീകളും വാതിലുകളും പൂർത്തിയായി! മുന്നിലുള്ള ഗോൾഡൻ എക്സിറ്റിലേക്ക് ഓടുക!";
  }
}

function startSession({ sessionId, playerName, accessCode, doorIndex, elapsedSeconds }) {
  const safeIdx = Math.max(0, Math.min(doorIndex, 5));

  sessionState = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    currentStageIndex: safeIdx,
    collectedKeys: [false, false, false, false, false].map((_, i) => i < safeIdx),
    unlockedDoors: [false, false, false, false, false].map((_, i) => i < safeIdx),
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
// 6. THREE.JS 3D TREASURE MAZE, KEYS & DOORS
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090e1a);
scene.fog = new THREE.Fog(0x090e1a, 12, 38);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
UI.canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
dirLight.position.set(8, 18, 12);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 68),
  new THREE.MeshStandardMaterial({ color: 0x131d33, roughness: 0.85 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, -25);
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x26385e, roughness: 0.6 });
const obstacleWallMat = new THREE.MeshStandardMaterial({ color: 0x1e2d4d, roughness: 0.65 });
const lockedDoorMat = new THREE.MeshStandardMaterial({ color: 0xd94848, roughness: 0.4 });
const unlockedDoorMat = new THREE.MeshStandardMaterial({ color: 0x2ea043, roughness: 0.4 });
const keyMat = new THREE.MeshStandardMaterial({
  color: 0xffd166,
  emissive: 0x8a5a00,
  metalness: 0.5,
  roughness: 0.25
});

const wallColliders = [];
const doorObjects = [];
const keyObjects = [];

function addWall(x, y, z, w, h, d, isObstacle = false) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    isObstacle ? obstacleWallMat : wallMat
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

// Outer boundaries
addWall(-5.5, 1.5, -25, 1, 3, 68);
addWall(5.5, 1.5, -25, 1, 3, 68);
addWall(0, 1.5, 8, 12, 3, 1);

// Maze cover obstacles inside each stage so players explore & follow clues
addWall(-1.4, 1.2, -4.5, 1.4, 2.4, 2.4, true);
addWall(1.6, 1.2, -13.5, 1.4, 2.4, 2.4, true);
addWall(-1.5, 1.2, -23.5, 1.4, 2.4, 2.4, true);
addWall(1.5, 1.2, -33.5, 1.4, 2.4, 2.4, true);
addWall(-1.5, 1.2, -43.5, 1.4, 2.4, 2.4, true);

// 5 Doors + 5 Keys
TREASURE_STAGES.forEach((stageData, idx) => {
  const zPos = stageData.doorZ;

  // Door partition walls leaving a 3-unit wide gate in center
  addWall(-3.25, 1.5, zPos, 4.0, 3, 0.8);
  addWall(3.25, 1.5, zPos, 4.0, 3, 0.8);

  const doorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 2.8, 0.4),
    lockedDoorMat.clone()
  );
  doorMesh.position.set(0, 1.4, zPos);
  scene.add(doorMesh);

  doorObjects.push({
    index: idx,
    z: zPos,
    mesh: doorMesh,
    unlocked: false
  });

  // Glowing 3D Key mesh (ring + stem)
  const keyGroup = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.1, 10, 20), keyMat);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 0.14), keyMat);
  stem.position.y = -0.45;
  keyGroup.add(ring, stem);
  keyGroup.position.set(stageData.keyPos.x, 1.25, stageData.keyPos.z);
  scene.add(keyGroup);

  keyObjects.push({
    index: idx,
    x: stageData.keyPos.x,
    z: stageData.keyPos.z,
    mesh: keyGroup,
    collected: false
  });
});

const goalMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(1.6, 1.6, 0.25, 24),
  new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x664400 })
);
goalMesh.position.set(0, 0.12, -55);
scene.add(goalMesh);

const playerPos = new THREE.Vector3(0, 1.6, 5);
const PLAYER_RADIUS = 0.55;

function syncWorldWithSession() {
  keyObjects.forEach((k, idx) => {
    const collected = Boolean(sessionState.collectedKeys[idx]);
    k.collected = collected;
    k.mesh.visible = !collected;
  });

  doorObjects.forEach((d, idx) => {
    const unlocked = Boolean(sessionState.unlockedDoors[idx]);
    d.unlocked = unlocked;
    d.mesh.position.y = unlocked ? -2.2 : 1.4;
    d.mesh.material.color.setHex(unlocked ? 0x2ea043 : 0xd94848);
  });

  const startZ = sessionState.currentStageIndex > 0
    ? TREASURE_STAGES[Math.min(sessionState.currentStageIndex - 1, 4)].doorZ - 2.2
    : 5;

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

async function checkKeyPickup() {
  const activeStage = sessionState.currentStageIndex;
  if (activeStage >= keyObjects.length) return;

  const targetKey = keyObjects[activeStage];
  if (targetKey.collected) return;

  const dx = playerPos.x - targetKey.x;
  const dz = playerPos.z - targetKey.z;
  const distSq = dx * dx + dz * dz;

  if (distSq <= 1.25 * 1.25) {
    targetKey.collected = true;
    targetKey.mesh.visible = false;
    sessionState.collectedKeys[activeStage] = true;
    playPickupSound(620);

    // Automatically unlock the stage's door once key is collected!
    const door = doorObjects[activeStage];
    door.unlocked = true;
    door.mesh.position.y = -2.2;
    door.mesh.material.color.setHex(0x2ea043);
    sessionState.unlockedDoors[activeStage] = true;
    sessionState.currentStageIndex = activeStage + 1;

    updateHudAndClue();
    showToast(`🔑 Key ${activeStage + 1} കണ്ടെത്തി! Door ${activeStage + 1} തുറന്നു!`);
    await saveProgressToServer(false);
  }
}

function collidesWithLockedDoor(x, z) {
  for (const d of doorObjects) {
    if (d.unlocked) continue;
    const closestX = Math.max(-1.25, Math.min(x, 1.25));
    const closestZ = Math.max(d.z - 0.35, Math.min(z, d.z + 0.35));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) {
      showToast(`🔒 Door ${d.index + 1} ലോക്ക് ആണ്! മുകളിലെ Clue വായിച്ച് Key എടുക്കുക.`, "#ff9f43");
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
    UI.winSummary.textContent = `അഭിനന്ദനങ്ങൾ ${sessionState.playerName}! 5 കീകളും കണ്ടെത്തി എക്സിറ്റിൽ എത്തിയ സമയം: ${finalTime}s`;
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
// 8. CONTROLS & BACK/REFRESH RESUME
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

    const moveSpeed = 6.8 * dt;
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

    checkKeyPickup();

    camera.position.set(playerPos.x, playerPos.y, playerPos.z);
    camera.lookAt(playerPos.x, playerPos.y - 0.1, playerPos.z - 8);

    if (playerPos.z <= -54.2) {
      handleGameWin();
    }
  }

  keyObjects.forEach((k) => {
    if (!k.collected) k.mesh.rotation.y += 2.2 * dt;
  });
  goalMesh.rotation.y += 1.5 * dt;
  renderer.render(scene, camera);
}

tryResumeExistingSession();
requestAnimationFrame(animate);