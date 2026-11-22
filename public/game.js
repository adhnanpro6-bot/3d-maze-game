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

const DOOR_PUZZLES = [
  { doorNumber: 1, title: "Door 1 — Cipher Lock", question: "What is 14 + 28?", answer: "42" },
  { doorNumber: 2, title: "Door 2 — Sequence Gate", question: "Next number in sequence: 3, 6, 12, 24, ?", answer: "48" },
  { doorNumber: 3, title: "Door 3 — Code Word", question: "Unscramble to form a game term: Z E M A", answer: "MAZE" },
  { doorNumber: 4, title: "Door 4 — Logic Math", question: "If 5x = 85, what is x?", answer: "17" },
  { doorNumber: 5, title: "Door 5 — Final Vault", question: "How many sides does a hexagon have?", answer: "6" }
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

  puzzleModal: document.getElementById("puzzle-modal"),
  puzzleTitle: document.getElementById("puzzle-title"),
  puzzleQuestion: document.getElementById("puzzle-question"),
  puzzleAnswerInput: document.getElementById("puzzle-answer"),
  puzzleSubmitBtn: document.getElementById("puzzle-submit-btn"),
  puzzleCloseBtn: document.getElementById("puzzle-close-btn"),
  puzzleFeedback: document.getElementById("puzzle-feedback"),

  winModal: document.getElementById("win-modal"),
  winSummary: document.getElementById("win-summary"),
  formSubmitStatus: document.getElementById("form-submit-status"),
  playAgainBtn: document.getElementById("play-again-btn"),

  btnUp: document.getElementById("btn-up"),
  btnDown: document.getElementById("btn-down"),
  btnLeft: document.getElementById("btn-left"),
  btnRight: document.getElementById("btn-right")
};

// ==========================================
// 3. GAME STATE
// ==========================================
let sessionState = {
  active: false,
  sessionId: "",
  playerName: "",
  accessCode: "",
  currentDoorIndex: 0,
  unlockedDoors: [false, false, false, false, false],
  activePuzzleDoorIndex: null,
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
// 4. SESSION TOKEN HELPERS (URL Hash + window.name)
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
  try {
    window.name = "";
  } catch (_) {}
  try {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (_) {}
}

function readPersistedSessionId() {
  const hash = window.location.hash || "";
  const match = hash.match(/session=([^&]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
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

// ==========================================
// 5. SERVER VERIFICATION & RESUME
// ==========================================
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

function startSession({ sessionId, playerName, accessCode, doorIndex, elapsedSeconds }) {
  const safeDoorIdx = Math.max(0, Math.min(doorIndex, 5));
  const unlocked = [false, false, false, false, false].map((_, i) => i < safeDoorIdx);

  sessionState = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    currentDoorIndex: safeDoorIdx,
    unlockedDoors: unlocked,
    activePuzzleDoorIndex: null,
    startTimeMs: performance.now() - elapsedSeconds * 1000,
    elapsedSeconds,
    finished: false
  };

  persistSessionId(sessionId);
  applyDoorStatesAndPosition();

  if (UI.accessScreen) UI.accessScreen.style.display = "none";
  if (UI.winModal) UI.winModal.style.display = "none";
  if (UI.hud) UI.hud.style.display = "flex";
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${playerName}`;
  updateHudDoor();
}

function updateHudDoor() {
  if (!UI.hudDoor) return;
  const nextDoor = Math.min(sessionState.currentDoorIndex + 1, 5);
  UI.hudDoor.textContent = `Door: ${nextDoor} / 5`;
}

// ==========================================
// 6. THREE.JS 3D MAZE & 5 SEQUENTIAL DOORS
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);
scene.fog = new THREE.Fog(0x0b1020, 12, 36);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
UI.canvasContainer.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 64),
  new THREE.MeshStandardMaterial({ color: 0x162038, roughness: 0.8 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, -24);
scene.add(floor);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x293b66, roughness: 0.6 });
const lockedDoorMat = new THREE.MeshStandardMaterial({ color: 0xd94848, roughness: 0.4 });

const wallColliders = [];
const doorObjects = [];

function addWall(x, y, z, w, h, d) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  mesh.position.set(x, y, z);
  scene.add(mesh);
  wallColliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
}

addWall(-6, 1.5, -24, 1, 3, 64);
addWall(6, 1.5, -24, 1, 3, 64);
addWall(0, 1.5, 8, 13, 3, 1);

const doorZPositions = [-6, -16, -26, -36, -46];

doorZPositions.forEach((zPos, idx) => {
  addWall(-3.75, 1.5, zPos, 4.5, 3, 0.8);
  addWall(3.75, 1.5, zPos, 4.5, 3, 0.8);

  const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(3, 2.8, 0.4), lockedDoorMat.clone());
  doorMesh.position.set(0, 1.4, zPos);
  scene.add(doorMesh);

  doorObjects.push({ index: idx, z: zPos, mesh: doorMesh, unlocked: false });
});

const goalMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(1.6, 1.6, 0.2, 24),
  new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0x553c00 })
);
goalMesh.position.set(0, 0.1, -54);
scene.add(goalMesh);

const playerPos = new THREE.Vector3(0, 1.6, 4);
const PLAYER_RADIUS = 0.55;

function applyDoorStatesAndPosition() {
  doorObjects.forEach((d, idx) => {
    const isUnlocked = Boolean(sessionState.unlockedDoors[idx]);
    d.unlocked = isUnlocked;
    d.mesh.position.y = isUnlocked ? -2.0 : 1.4;
    d.mesh.material.color.setHex(isUnlocked ? 0x2ea043 : 0xd94848);
  });

  // Place player safely just behind their current unlocked progress
  const startZ = sessionState.currentDoorIndex > 0
    ? doorZPositions[Math.min(sessionState.currentDoorIndex - 1, 4)] - 2.2
    : 4;

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

function collidesWithLockedDoor(x, z) {
  for (const d of doorObjects) {
    if (d.unlocked) continue;
    const closestX = Math.max(-1.5, Math.min(x, 1.5));
    const closestZ = Math.max(d.z - 0.35, Math.min(z, d.z + 0.35));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < PLAYER_RADIUS * PLAYER_RADIUS) {
      openPuzzleForDoor(d.index);
      return true;
    }
  }
  return false;
}

// ==========================================
// 7. PUZZLE MODAL & DOOR UNLOCKING
// ==========================================
function openPuzzleForDoor(doorIndex) {
  if (!sessionState.active || sessionState.finished) return;
  if (sessionState.activePuzzleDoorIndex !== null) return;
  if (doorIndex !== sessionState.currentDoorIndex) return;

  const puzzle = DOOR_PUZZLES[doorIndex];
  if (!puzzle) return;

  sessionState.activePuzzleDoorIndex = doorIndex;
  keys.forward = keys.backward = keys.left = keys.right = false;

  if (UI.puzzleTitle) UI.puzzleTitle.textContent = puzzle.title;
  if (UI.puzzleQuestion) UI.puzzleQuestion.textContent = puzzle.question;
  if (UI.puzzleAnswerInput) {
    UI.puzzleAnswerInput.value = "";
    setTimeout(() => UI.puzzleAnswerInput.focus(), 50);
  }
  if (UI.puzzleFeedback) UI.puzzleFeedback.textContent = "";
  if (UI.puzzleModal) UI.puzzleModal.style.display = "flex";
}

function closePuzzleModal() {
  sessionState.activePuzzleDoorIndex = null;
  if (UI.puzzleModal) UI.puzzleModal.style.display = "none";
}

async function submitPuzzleAnswer() {
  const idx = sessionState.activePuzzleDoorIndex;
  if (idx === null) return;

  const puzzle = DOOR_PUZZLES[idx];
  const userAns = String(UI.puzzleAnswerInput?.value || "").trim().toUpperCase();
  const expectedAns = String(puzzle.answer || "").trim().toUpperCase();

  if (userAns === expectedAns) {
    const door = doorObjects[idx];
    door.unlocked = true;
    door.mesh.position.y = -2.0;
    door.mesh.material.color.setHex(0x2ea043);

    sessionState.unlockedDoors[idx] = true;
    sessionState.currentDoorIndex = idx + 1;
    updateHudDoor();
    closePuzzleModal();

    await saveProgressToServer(false);
  } else if (UI.puzzleFeedback) {
    UI.puzzleFeedback.textContent = "ഉത്തരം ശരിയല്ല. വീണ്ടും ശ്രമിക്കുക!";
    UI.puzzleFeedback.style.color = "#ff6b6b";
  }
}

// ==========================================
// 8. WIN & GOOGLE FORM SUBMISSION
// ==========================================
async function handleGameWin() {
  if (sessionState.finished) return;
  sessionState.finished = true;
  sessionState.active = false;
  clearSessionId();

  const finalTime = sessionState.elapsedSeconds.toFixed(2);
  await saveProgressToServer(true);

  if (UI.hud) UI.hud.style.display = "none";
  if (UI.winSummary) {
    UI.winSummary.textContent = `അഭിനന്ദനങ്ങൾ ${sessionState.playerName}! എല്ലാ 5 വാതിലുകളും പൂർത്തിയാക്കിയ സമയം: ${finalTime}s`;
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
// 9. CONTROLS & BACK/REFRESH PROTECTION
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
  if (sessionState.activePuzzleDoorIndex !== null) {
    if (e.key === "Enter") submitPuzzleAnswer();
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
if (UI.puzzleSubmitBtn) UI.puzzleSubmitBtn.addEventListener("click", submitPuzzleAnswer);
if (UI.puzzleCloseBtn) UI.puzzleCloseBtn.addEventListener("click", closePuzzleModal);
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
// 10. MAIN LOOP
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

    if (sessionState.activePuzzleDoorIndex === null) {
      const moveSpeed = 6.5 * dt;
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
      camera.lookAt(playerPos.x, playerPos.y - 0.1, playerPos.z - 8);

      if (playerPos.z <= -53.2) {
        handleGameWin();
      }
    }
  }

  goalMesh.rotation.y += 1.5 * dt;
  renderer.render(scene, camera);
}

tryResumeExistingSession();
requestAnimationFrame(animate);