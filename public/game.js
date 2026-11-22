// ==========================================
// 1. CONFIGURATION
// ==========================================
const VERIFY_ENDPOINT = "/api/verify-code";
const CONTINUE_CODE_ENDPOINT = "/api/continue-code";
const RESUME_ENDPOINT = "/api/resume-session";
const PROGRESS_ENDPOINT = "/api/save-progress";

const TOTAL_CARDS = 10;

const GOOGLE_FORM_CONFIG = {
  enabled: false,
  formResponseUrl: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse",
  entries: {
    playerName: "entry.1111111111",
    accessCode: "entry.2222222222",
    completionTime: "entry.3333333333"
  }
};

// 10 Questions (Maths, GK & Sports) — Each unlocks one Access Card
const CARD_QUESTIONS = [
  { cardCode: "KK-CARD-01", category: "MATHS", question: "Card 1 (Maths): 14 + 28 എത്രയാണ്? (തെറ്റിയാൽ Ghost കൊല്ലും!)", answer: "42" },
  { cardCode: "KK-CARD-02", category: "SPORTS", question: "Card 2 (Sports): ഒരു ഫുട്ബോൾ ടീമിൽ സാധാരണയായി എത്ര കളിക്കാർ കളിക്കുന്നു?", answer: "11" },
  { cardCode: "KK-CARD-03", category: "GK", question: "Card 3 (GK): കേരളത്തിൽ ആകെ എത്ര ജില്ലകളുണ്ട്?", answer: "14" },
  { cardCode: "KK-CARD-04", category: "MATHS", question: "Card 4 (Maths): 12 × 6 എത്രയാണ്?", answer: "72" },
  { cardCode: "KK-CARD-05", category: "SPORTS", question: "Card 5 (Sports): FIFA ലോകകപ്പ് എത്ര വർഷം കൂടുമ്പോഴാണ് നടക്കുന്നത്?", answer: "4" },
  { cardCode: "KK-CARD-06", category: "GK", question: "Card 6 (GK): ഇന്ത്യയുടെ തലസ്ഥാന നഗരം ഏതാണ്?", answer: "NEW DELHI" },
  { cardCode: "KK-CARD-07", category: "MATHS", question: "Card 7 (Maths): 150 - 67 എത്രയാണ്?", answer: "83" },
  { cardCode: "KK-CARD-08", category: "SPORTS", question: "Card 8 (Sports): ഒളിമ്പിക് പതാകയിൽ എത്ര വളയങ്ങളുണ്ട്?", answer: "5" },
  { cardCode: "KK-CARD-09", category: "GK", question: "Card 9 (GK): സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏതാണ്?", answer: "JUPITER" },
  { cardCode: "KK-CARD-10", category: "MATHS", question: "Card 10 (Maths): 9² (9 square) എത്രയാണ്?", answer: "81" }
];

// Candidate random drop spots inside the Hedge Maze (10 will be picked randomly per run)
const RANDOM_CARD_SPOTS = [
  { x: -24, z: 22 },
  { x: -14, z: 24 },
  { x: 14, z: 24 },
  { x: 24, z: 20 },
  { x: -25, z: 8 },
  { x: -15, z: 9 },
  { x: 15, z: 8 },
  { x: 25, z: 6 },
  { x: -24, z: -12 },
  { x: -12, z: -16 },
  { x: 12, z: -16 },
  { x: 24, z: -14 },
  { x: -16, z: -25 },
  { x: 16, z: -25 },
  { x: -8, z: 18 },
  { x: 8, z: 18 }
];

// ==========================================
// 2. DOM ELEMENTS, MODALS & HORROR OVERLAY
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

// Smooth Turn Left / Right buttons for mobile & desktop
const turnControlsRow = document.createElement("div");
turnControlsRow.id = "smooth-turn-controls";
turnControlsRow.style.cssText = [
  "position: fixed",
  "left: 16px",
  "bottom: 20px",
  "z-index: 25",
  "display: none",
  "gap: 10px"
].join(";");
turnControlsRow.innerHTML = `
  <button id="btn-turn-left" type="button" style="width:54px;height:54px;border-radius:14px;background:rgba(15,23,42,0.78);border:1px solid rgba(255,209,102,0.45);color:#ffd166;font-size:20px;font-weight:800;cursor:pointer;">↺</button>
  <button id="btn-turn-right" type="button" style="width:54px;height:54px;border-radius:14px;background:rgba(15,23,42,0.78);border:1px solid rgba(255,209,102,0.45);color:#ffd166;font-size:20px;font-weight:800;cursor:pointer;">↻</button>
`;
document.body.appendChild(turnControlsRow);

const btnTurnLeft = document.getElementById("btn-turn-left");
const btnTurnRight = document.getElementById("btn-turn-right");

// Card Question Modal
let questionModal = document.getElementById("puzzle-modal");
if (!questionModal) {
  questionModal = document.createElement("div");
  questionModal.id = "dynamic-card-question-modal";
  questionModal.style.cssText = [
    "position: fixed",
    "inset: 0",
    "z-index: 40",
    "display: none",
    "align-items: center",
    "justify-content: center",
    "background: rgba(5, 8, 15, 0.85)",
    "backdrop-filter: blur(4px)",
    "padding: 16px"
  ].join(";");

  questionModal.innerHTML = `
    <div style="width:100%;max-width:420px;background:#121826;border:1px solid rgba(255,209,102,0.55);border-radius:14px;padding:22px;color:#f8fafc;box-shadow:0 18px 45px rgba(0,0,0,0.75);font-family:system-ui,sans-serif;">
      <div id="cq-badge" style="display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(255,209,102,0.18);color:#ffd166;font-size:12px;font-weight:700;margin-bottom:10px;">ACCESS CARD LOCK</div>
      <h3 id="cq-question" style="margin:0 0 14px 0;font-size:17px;line-height:1.45;color:#ffffff;"></h3>
      <input id="cq-input" type="text" placeholder="ഉത്തരം ടൈപ്പ് ചെയ്യുക..." autocomplete="off"
        style="width:100%;box-sizing:border-box;padding:11px 12px;border-radius:8px;border:1px solid #384661;background:#090d16;color:#fff;font-size:15px;margin-bottom:12px;outline:none;" />
      <div id="cq-feedback" style="min-height:20px;font-size:13px;color:#ff6b6b;margin-bottom:10px;"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button id="cq-cancel-btn" type="button" style="padding:9px 14px;border-radius:8px;border:1px solid #3b4963;background:transparent;color:#cbd5e1;cursor:pointer;">പിന്നോട്ട്</button>
        <button id="cq-submit-btn" type="button" style="padding:9px 18px;border-radius:8px;border:none;background:#eab308;color:#090d16;font-weight:800;cursor:pointer;">കാർഡ് എടുക്കുക</button>
      </div>
    </div>
  `;
  document.body.appendChild(questionModal);
}

const cqBadge = questionModal.querySelector("#cq-badge");
const cqQuestion = questionModal.querySelector("#cq-question");
const cqInput = questionModal.querySelector("#cq-input");
const cqFeedback = questionModal.querySelector("#cq-feedback");
const cqCancelBtn = questionModal.querySelector("#cq-cancel-btn");
const cqSubmitBtn = questionModal.querySelector("#cq-submit-btn");

// Centre Circle 10 Access Cards Submission Modal
const centerVaultModal = document.createElement("div");
centerVaultModal.id = "center-vault-modal";
centerVaultModal.style.cssText = [
  "position: fixed",
  "inset: 0",
  "z-index: 42",
  "display: none",
  "align-items: center",
  "justify-content: center",
  "background: rgba(4, 10, 20, 0.88)",
  "backdrop-filter: blur(5px)",
  "padding: 16px"
].join(";");
centerVaultModal.innerHTML = `
  <div style="width:100%;max-width:460px;background:#0f1b2e;border:1px solid rgba(56,189,248,0.55);border-radius:16px;padding:22px;color:#f8fafc;box-shadow:0 20px 50px rgba(0,0,0,0.8);font-family:system-ui,sans-serif;">
    <div style="font-size:12px;font-weight:800;color:#38bdf8;letter-spacing:0.6px;margin-bottom:6px;">CENTRE CIRCLE VAULT</div>
    <h3 style="margin:0 0 8px 0;font-size:18px;color:#ffffff;">10 Access Cards സമർപ്പിക്കുക</h3>
    <p style="margin:0 0 12px 0;font-size:13px;color:#cbd5e1;line-height:1.45;">ഗെയിം പൂർത്തിയാക്കാൻ ശേഖരിച്ച 10 Access Cards ഇവിടെ നൽകി (അല്ലെങ്കിൽ താഴെ കാണുന്ന കാർഡുകൾ കൺഫേം ചെയ്ത്) Submit ചെയ്യുക:</p>
    <textarea id="vault-cards-input" rows="3" placeholder="KK-CARD-01, KK-CARD-02, ... KK-CARD-10"
      style="width:100%;box-sizing:border-box;padding:10px 12px;border-radius:9px;border:1px solid #334e75;background:#08101c;color:#7ee787;font-size:13px;margin-bottom:10px;outline:none;"></textarea>
    <div id="vault-feedback" style="min-height:20px;font-size:13px;color:#ff6b6b;margin-bottom:10px;"></div>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button id="vault-close-btn" type="button" style="padding:9px 14px;border-radius:8px;border:1px solid #3b4963;background:transparent;color:#cbd5e1;cursor:pointer;">അടയ്ക്കുക</button>
      <button id="vault-submit-btn" type="button" style="padding:9px 18px;border-radius:8px;border:none;background:#22c55e;color:#052e16;font-weight:800;cursor:pointer;">10 Cards Submit</button>
    </div>
  </div>
`;
document.body.appendChild(centerVaultModal);

const vaultCardsInput = document.getElementById("vault-cards-input");
const vaultFeedback = document.getElementById("vault-feedback");
const vaultCloseBtn = document.getElementById("vault-close-btn");
const vaultSubmitBtn = document.getElementById("vault-submit-btn");

// Jumpscare Horror Overlay
const jumpscareFlash = document.createElement("div");
jumpscareFlash.style.cssText = [
  "position: fixed",
  "inset: 0",
  "z-index: 50",
  "pointer-events: none",
  "display: none",
  "background: radial-gradient(circle, rgba(220,20,20,0.18) 25%, rgba(140,0,0,0.84) 100%)",
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
  <div style="font-size:15px;color:#ffe4e6;background:rgba(0,0,0,0.65);padding:8px 16px;border-radius:8px;">തെറ്റായ ഉത്തരം! പ്രേതം ആക്രമിച്ചു — ആദ്യം മുതൽ വീണ്ടും തുടങ്ങുന്നു...</div>
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
  "border: 1px solid rgba(255, 209, 102, 0.5)",
  "color: #ffd166",
  "font-size: 13px",
  "font-weight: 600",
  "text-align: center",
  "display: none"
].join(";");
document.body.appendChild(infoBanner);

let bannerTimer = null;
function showInfoBanner(msg, color = "#ffd166") {
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

function playCardCollectedSound() {
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(560, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(980, audioCtx.currentTime + 0.2);
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
  collectedCards: [], // Array of cardCode strings e.g. ["KK-CARD-01", ...]
  activeCardIndex: null,
  vaultOpen: false,
  ghostAttacking: false,
  ghostAttackTimer: 0,
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

let playerYaw = 0; // 0 faces -Z (north / toward centre)

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
        doorIndex: sessionState.collectedCards.length,
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
      if (data?.reason === "ALREADY_FINISHED") {
        setContinueStatus("ഈ കോഡ് ഉപയോഗിച്ച കളി ഇതിനകം പൂർത്തിയായി കഴിഞ്ഞു.", true);
      } else if (data?.reason === "NOT_USED_YET") {
        setContinueStatus("ഈ കോഡ് ഇതുവരെ ഉപയോഗിച്ചിട്ടില്ല — മുകളിലെ 'കളി തുടങ്ങുക' ഉപയോഗിക്കുക.", true);
      } else {
        setContinueStatus("സെഷൻ തുടരാൻ കഴിഞ്ഞില്ല.", true);
      }
      return;
    }

    setContinueStatus("", false);
    startSession({
      sessionId: data.sessionId,
      playerName: data.playerName || "Player",
      accessCode: data.code || usedCode,
      savedCount: Number(data.doorIndex || 0),
      elapsedSeconds: Number(data.elapsedSeconds || 0)
    });
  } catch (err) {
    if (UI.continueBtn) UI.continueBtn.disabled = false;
    console.error("Continue code error:", err);
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
        savedCount: Number(data.doorIndex || 0),
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
      setLoginStatus("ഈ ആക്സസ് കോഡ് ഇതിനകം ഉപയോഗിച്ചു കഴിഞ്ഞു — താഴെയുള്ള Continue Game ഉപയോഗിച്ച് തുടരാം.", true);
      if (UI.continueCodeInput && !UI.continueCodeInput.value) {
        UI.continueCodeInput.value = code;
      }
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
    savedCount: Number(result.doorIndex || 0),
    elapsedSeconds: Number(result.elapsedSeconds || 0)
  });
}

function setLoginStatus(msg, isError) {
  if (!UI.loginStatus) return;
  UI.loginStatus.textContent = msg;
  UI.loginStatus.style.color = isError ? "#ff6b6b" : "#7ee787";
}

function setContinueStatus(msg, isError) {
  if (!UI.continueStatus) return;
  UI.continueStatus.textContent = msg;
  UI.continueStatus.style.color = isError ? "#ff6b6b" : "#7ee787";
}

function updateHudCards() {
  if (!UI.hudDoor) return;
  const count = sessionState.collectedCards.length;
  UI.hudDoor.textContent = count >= TOTAL_CARDS
    ? "Cards: 10/10 -> Centre Circle!"
    : `Cards: ${count} / ${TOTAL_CARDS}`;
}

// ==========================================
// 6. PROCEDURAL TEXTURES, HEDGE MAZE, RANDOM 10 CARDS & KALAKERALA ADS
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
scene.fog = new THREE.FogExp2(0x09101c, 0.014);

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

// Outer perimeter hedge walls with wide South opening (x = 0, z = +31)
addHedgeWall(-17.5, 31, 28, 2.2);
addHedgeWall(17.5, 31, 28, 2.2);
addHedgeWall(0, -31, 64, 2.2);
addHedgeWall(-31, 0, 2.2, 64);
addHedgeWall(31, 0, 2.2, 64);

// Open Hedge Maze corridors (no blocking doors!)
addHedgeWall(-11, 24, 15, 2.0);
addHedgeWall(11, 24, 15, 2.0);
addHedgeWall(-21, 14, 2.0, 16);
addHedgeWall(-9, 15, 12, 2.0);
addHedgeWall(12, 14, 12, 2.0);
addHedgeWall(-11, 2, 12, 2.0);
addHedgeWall(12, 1, 12, 2.0);
addHedgeWall(-21, -10, 2.0, 20);
addHedgeWall(21, -8, 2.0, 20);
addHedgeWall(-12, -21, 14, 2.0);
addHedgeWall(13, -22, 12, 2.0);

// Centre Circle Ring & Fountain (x = 0, z = 0)
const ringSegments = 16;
const ringRadius = 11.5;
for (let i = 0; i < ringSegments; i++) {
  if (i === 0) continue; // South entry into Centre Circle
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

// Highlighted Centre Circle ring on ground
const centreCircleRing = new THREE.Mesh(
  new THREE.RingGeometry(4.3, 5.1, 36),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
);
centreCircleRing.rotation.x = -Math.PI / 2;
centreCircleRing.position.set(0, 0.04, 0);
scene.add(centreCircleRing);

const fountainGroup = new THREE.Group();
const outerBasin = new THREE.Mesh(
  new THREE.CylinderGeometry(3.8, 4.1, 0.7, 32),
  new THREE.MeshStandardMaterial({ color: 0xd8ccb8, roughness: 0.5 })
);
outerBasin.position.y = 0.35;

const fountainWater = new THREE.Mesh(
  new THREE.CylinderGeometry(3.2, 3.2, 0.5, 32),
  new THREE.MeshStandardMaterial({
    color: 0x1e90ff,
    emissive: 0x0b3966,
    roughness: 0.2,
    metalness: 0.3
  })
);
fountainWater.position.y = 0.42;

const centerSpire = new THREE.Mesh(
  new THREE.CylinderGeometry(0.6, 1.0, 2.2, 20),
  new THREE.MeshStandardMaterial({ color: 0xe6dcc8, roughness: 0.45 })
);
centerSpire.position.y = 1.1;

const goalBeacon = new THREE.Mesh(
  new THREE.TorusGeometry(1.35, 0.14, 14, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0x996600,
    metalness: 0.6,
    roughness: 0.25
  })
);
goalBeacon.position.y = 2.75;

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
  ctx.fillText("10-CARD TREASURE MAZE CHALLENGE", 256, 178);

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

// 10 Collectible 3D Access Cards dropped randomly in the maze
const cardMat = new THREE.MeshStandardMaterial({
  color: 0xffd166,
  emissive: 0x7a4f00,
  metalness: 0.55,
  roughness: 0.25
});

const cardObjects = CARD_QUESTIONS.map((qItem, idx) => {
  const cardGroup = new THREE.Group();
  const cardMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.62, 0.08), cardMat.clone());
  cardMesh.castShadow = true;

  const stripMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.14, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  stripMesh.position.y = 0.14;

  cardGroup.add(cardMesh, stripMesh);
  cardGroup.position.set(0, 1.25, 0);
  scene.add(cardGroup);

  return {
    index: idx,
    cardCode: qItem.cardCode,
    category: qItem.category,
    question: qItem.question,
    answer: qItem.answer,
    x: 0,
    z: 0,
    mesh: cardGroup,
    collected: false
  };
});

function randomizeCardPositions() {
  const pool = [...RANDOM_CARD_SPOTS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  cardObjects.forEach((c, idx) => {
    const spot = pool[idx % pool.length];
    // Avoid spawning directly inside any wall collider
    let safeX = spot.x;
    let safeZ = spot.z;
    if (collidesWithWall(safeX, safeZ)) {
      safeX = spot.x * 0.7;
      safeZ = spot.z * 0.7;
    }
    c.x = safeX;
    c.z = safeZ;
    c.mesh.position.set(safeX, 1.25, safeZ);
  });
}

// Detailed 3D Horror Ghost
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

const playerPos = new THREE.Vector3(0, 1.6, 28);
const PLAYER_RADIUS = 0.55;

function updateCameraFromYaw() {
  camera.position.set(playerPos.x, playerPos.y, playerPos.z);
  const lookX = playerPos.x - Math.sin(playerYaw) * 9;
  const lookZ = playerPos.z - Math.cos(playerYaw) * 9;
  camera.lookAt(lookX, playerPos.y - 0.1, lookZ);
}

function resetPlayerAndCards(savedCount = 0) {
  randomizeCardPositions();
  const safeCount = Math.max(0, Math.min(savedCount, TOTAL_CARDS));
  sessionState.collectedCards = CARD_QUESTIONS.slice(0, safeCount).map((q) => q.cardCode);

  cardObjects.forEach((c, idx) => {
    const isCollected = idx < safeCount;
    c.collected = isCollected;
    c.mesh.visible = !isCollected;
  });

  playerPos.set(0, 1.6, 28);
  playerYaw = 0;
  updateCameraFromYaw();
}

function startSession({ sessionId, playerName, accessCode, savedCount, elapsedSeconds }) {
  sessionState = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    collectedCards: [],
    activeCardIndex: null,
    vaultOpen: false,
    ghostAttacking: false,
    ghostAttackTimer: 0,
    shakeIntensity: 0,
    startTimeMs: performance.now() - elapsedSeconds * 1000,
    elapsedSeconds,
    finished: false
  };

  persistSessionId(sessionId);
  resetPlayerAndCards(savedCount);

  if (UI.accessScreen) UI.accessScreen.style.display = "none";
  if (UI.winModal) UI.winModal.style.display = "none";
  if (UI.hud) UI.hud.style.display = "flex";
  turnControlsRow.style.display = "flex";
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${playerName}`;
  updateHudCards();
  showInfoBanner("മേസിലെ 10 Access Cards കണ്ടെത്തി ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക — എന്നിട്ട് Centre Circle-ലേക്ക് പോകുക!");
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
// 7. CARD QUESTION, HORROR GHOST KILL & CENTRE VAULT
// ==========================================
function openCardQuestionModal(cardIndex) {
  if (!sessionState.active || sessionState.finished || sessionState.ghostAttacking || sessionState.vaultOpen) return;
  if (sessionState.activeCardIndex !== null) return;

  const card = cardObjects[cardIndex];
  if (!card || card.collected) return;

  sessionState.activeCardIndex = cardIndex;
  controls.forward = controls.backward = controls.strafeLeft = controls.strafeRight = false;

  if (cqBadge) cqBadge.textContent = `${card.cardCode} • ${card.category}`;
  if (cqQuestion) cqQuestion.textContent = card.question;
  if (cqFeedback) cqFeedback.textContent = "";
  if (cqInput) {
    cqInput.value = "";
    setTimeout(() => cqInput.focus(), 50);
  }
  questionModal.style.display = "flex";
}

function closeCardQuestionModal() {
  sessionState.activeCardIndex = null;
  questionModal.style.display = "none";
  // Step slightly back so modal does not re-trigger immediately
  playerPos.x += Math.sin(playerYaw) * 1.2;
  playerPos.z += Math.cos(playerYaw) * 1.2;
}

async function triggerGhostKillAndRestart() {
  sessionState.activeCardIndex = null;
  questionModal.style.display = "none";
  centerVaultModal.style.display = "none";
  sessionState.vaultOpen = false;

  controls.forward = controls.backward = controls.strafeLeft = controls.strafeRight = false;

  sessionState.ghostAttacking = true;
  sessionState.ghostAttackTimer = 1.25;
  sessionState.shakeIntensity = 0.45;

  const fwdX = -Math.sin(playerYaw);
  const fwdZ = -Math.cos(playerYaw);
  ghostGroup.visible = true;
  ghostGroup.position.set(playerPos.x + fwdX * 2.5, 0.1, playerPos.z + fwdZ * 2.5);
  ghostGroup.lookAt(playerPos.x, 1.5, playerPos.z);

  horrorLight.position.set(playerPos.x + fwdX * 1.5, 2.2, playerPos.z + fwdZ * 1.5);
  horrorLight.intensity = 6;

  jumpscareFlash.style.display = "flex";
  playGhostKillSound();

  // Reset all collected cards & timer to start
  sessionState.collectedCards = [];
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

  resetPlayerAndCards(0);
  updateHudCards();
  showInfoBanner("👻 പ്രേതം കൊന്നു! 10 കാർഡുകളും വീണ്ടും മേസിൽ ചിതറിക്കിടക്കുന്നു — ആദ്യം മുതൽ തുടങ്ങുക!", "#ff8080");
}

async function submitCardAnswer() {
  const idx = sessionState.activeCardIndex;
  if (idx === null || sessionState.ghostAttacking) return;

  const card = cardObjects[idx];
  const userAns = String(cqInput?.value || "").trim().toUpperCase();
  const expectedAns = String(card.answer || "").trim().toUpperCase();

  if (userAns === expectedAns) {
    card.collected = true;
    card.mesh.visible = false;
    if (!sessionState.collectedCards.includes(card.cardCode)) {
      sessionState.collectedCards.push(card.cardCode);
    }
    sessionState.activeCardIndex = null;
    questionModal.style.display = "none";

    updateHudCards();
    playCardCollectedSound();

    if (sessionState.collectedCards.length >= TOTAL_CARDS) {
      showInfoBanner("🎉 എല്ലാ 10 Access Cards-ഉം ലഭിച്ചു! ഇപ്പോൾ Centre Circle-ലേക്ക് പോയി 10 Cards Submit ചെയ്യുക!");
    } else {
      showInfoBanner(`🃏 ${card.cardCode} ലഭിച്ചു! (${sessionState.collectedCards.length} / ${TOTAL_CARDS})`);
    }
    await saveProgressToServer(false);
  } else {
    await triggerGhostKillAndRestart();
  }
}

function openCentreVaultModal() {
  if (!sessionState.active || sessionState.finished || sessionState.vaultOpen || sessionState.ghostAttacking) return;
  sessionState.vaultOpen = true;
  controls.forward = controls.backward = controls.strafeLeft = controls.strafeRight = false;
  if (vaultFeedback) vaultFeedback.textContent = "";
  if (vaultCardsInput) {
    vaultCardsInput.value = sessionState.collectedCards.join(", ");
    setTimeout(() => vaultCardsInput.focus(), 50);
  }
  centerVaultModal.style.display = "flex";
}

function closeCentreVaultModal() {
  sessionState.vaultOpen = false;
  centerVaultModal.style.display = "none";
  playerPos.z += 2.2;
}

async function submitCentreVaultCards() {
  const raw = String(vaultCardsInput?.value || "").toUpperCase();
  const tokens = raw
    .split(/[\s,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const uniqueTokens = Array.from(new Set(tokens));
  const requiredCodes = CARD_QUESTIONS.map((q) => q.cardCode);
  const allMatch =
    sessionState.collectedCards.length >= TOTAL_CARDS &&
    requiredCodes.every((code) => uniqueTokens.includes(code));

  if (!allMatch) {
    playGhostKillSound();
    if (vaultFeedback) {
      vaultFeedback.textContent = `10 ശരിയായ Access Cards (${requiredCodes[0]} ... ${requiredCodes[9]}) പൂർണ്ണമായി നൽകണം!`;
    }
    return;
  }

  sessionState.vaultOpen = false;
  centerVaultModal.style.display = "none";
  await handleGameWin();
}

async function handleGameWin() {
  if (sessionState.finished) return;
  sessionState.finished = true;
  sessionState.active = false;
  infoBanner.style.display = "none";
  turnControlsRow.style.display = "none";
  clearSessionId();
  playCardCollectedSound();

  const finalTime = sessionState.elapsedSeconds.toFixed(2);
  await saveProgressToServer(true);

  if (UI.hud) UI.hud.style.display = "none";
  if (UI.winSummary) {
    UI.winSummary.textContent = `അഭിനന്ദനങ്ങൾ ${sessionState.playerName}! 10 Access Cards-ഉം ശേഖരിച്ച് Centre Circle പൂർത്തിയാക്കിയ സമയം: ${finalTime}s`;
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
// 8. SMOOTH ROTATION (KEYBOARD + DRAG + TURN BUTTONS) & SESSION HOOKS
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
  if (sessionState.activeCardIndex !== null) {
    if (e.key === "Enter") {
      e.preventDefault();
      submitCardAnswer();
    } else if (e.key === "Escape") {
      closeCardQuestionModal();
    }
    return;
  }
  if (sessionState.vaultOpen) {
    if (e.key === "Escape") closeCentreVaultModal();
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
    if (sessionState.ghostAttacking) return;
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

// Touch / Mouse drag on canvas for smooth camera rotation
let isDraggingLook = false;
let lastPointerX = 0;

renderer.domElement.addEventListener("pointerdown", (e) => {
  if (!sessionState.active || sessionState.ghostAttacking) return;
  isDraggingLook = true;
  lastPointerX = e.clientX;
});

window.addEventListener("pointermove", (e) => {
  if (!isDraggingLook || !sessionState.active || sessionState.ghostAttacking) return;
  const dx = e.clientX - lastPointerX;
  lastPointerX = e.clientX;
  playerYaw -= dx * 0.0065;
});

window.addEventListener("pointerup", () => {
  isDraggingLook = false;
});

if (UI.startBtn) UI.startBtn.addEventListener("click", handleStartGame);
if (UI.continueBtn) UI.continueBtn.addEventListener("click", handleContinueUsedCode);
if (cqSubmitBtn) cqSubmitBtn.addEventListener("click", submitCardAnswer);
if (cqCancelBtn) cqCancelBtn.addEventListener("click", closeCardQuestionModal);
if (cqInput) {
  cqInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitCardAnswer();
    }
  });
}

if (vaultSubmitBtn) vaultSubmitBtn.addEventListener("click", submitCentreVaultCards);
if (vaultCloseBtn) vaultCloseBtn.addEventListener("click", closeCentreVaultModal);

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
    const lungeProgress = Math.max(0, 1 - sessionState.ghostAttackTimer / 1.25);
    const fwdX = -Math.sin(playerYaw);
    const fwdZ = -Math.cos(playerYaw);
    ghostGroup.position.set(
      playerPos.x + fwdX * (2.5 - lungeProgress * 1.7),
      0.1 + Math.sin(now * 0.035) * 0.22,
      playerPos.z + fwdZ * (2.5 - lungeProgress * 1.7)
    );
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

    if (sessionState.activeCardIndex === null && !sessionState.vaultOpen) {
      // Smooth rotation
      const turnSpeed = 2.4 * dt;
      if (controls.turnLeft) playerYaw += turnSpeed;
      if (controls.turnRight) playerYaw -= turnSpeed;

      // Forward / backward along facing direction + strafe left/right
      const moveSpeed = 7.6 * dt;
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

      updateCameraFromYaw();

      // Check proximity to uncollected Access Cards
      for (const c of cardObjects) {
        if (c.collected) continue;
        const dist = Math.hypot(playerPos.x - c.x, playerPos.z - c.z);
        if (dist <= 1.55) {
          openCardQuestionModal(c.index);
          break;
        }
      }

      // Check Centre Circle (0, 0) once all 10 cards are collected
      const distToCentre = Math.hypot(playerPos.x - 0, playerPos.z - 0);
      if (sessionState.collectedCards.length >= TOTAL_CARDS && distToCentre <= 4.8) {
        openCentreVaultModal();
      } else if (distToCentre <= 4.2 && sessionState.collectedCards.length < TOTAL_CARDS) {
        showInfoBanner(`🔒 Centre Circle-ൽ 10 Access Cards വേണം! ഇപ്പോൾ ഉള്ളത്: ${sessionState.collectedCards.length} / 10`, "#ff9f43");
      }
    }
  }

  cardObjects.forEach((c) => {
    if (!c.collected) {
      c.mesh.rotation.y += 2.2 * dt;
      c.mesh.position.y = 1.25 + Math.sin(now * 0.004 + c.index) * 0.14;
    }
  });
  goalBeacon.rotation.z += 1.8 * dt;
  goalBeacon.rotation.x += 0.9 * dt;
  renderer.render(scene, camera);
}

tryResumeExistingSession();
requestAnimationFrame(animate);