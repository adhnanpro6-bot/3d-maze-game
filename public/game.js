// ==========================================
// 1. EDITABLE GAME SETTINGS, LOCATIONS & CHALLENGES
// ==========================================
const GAME_CONFIG = {
  roundSeconds: 15,         // Configurable time limit per round (15s default)
  sunriseSeconds: 240,      // Total night duration before sunrise arrives
  totalStepsToClub: 10,     // Rounds needed to reach the Village Club
  startingLives: 3,
  startingHints: 2,
  basePoints: 100,
  speedBonusMax: 50,
  comboBonusStep: 25,
  fearStepOnFail: 15,
  fearDropOnSuccess: 5
};

const BACKEND_ENDPOINTS = {
  verify: "/api/verify-code",
  continueCode: "/api/continue-code",
  resume: "/api/resume-session",
  progress: "/api/save-progress"
};

const VILLAGE_LOCATIONS = [
  {
    id: "lane",
    name: "Whispering Lane",
    storyCue: "നിലാവെളിച്ചം വീണ ഇടുങ്ങിയ ഗ്രാമപാതയിൽ മരച്ചില്ലകൾ സാവധാനം ഇളകുന്നു.",
    fogColor: 0x0b1324,
    lanternColor: 0xffc870
  },
  {
    id: "school",
    name: "Abandoned School",
    storyCue: "പഴയ സ്കൂളിന്റെ ജനാലകളിലൂടെ നിലാവ് ഒഴുകുന്നു; ബ്ലാക്ക്ബോർഡിൽ ഒരു പസിൽ തെളിയുന്നു.",
    fogColor: 0x0d1526,
    lanternColor: 0xfbbf24
  },
  {
    id: "well",
    name: "Haunted Well",
    storyCue: "പഴയ കിണറിനരികെ തണുത്ത കാറ്റ് വീശുന്നു; വെള്ളത്തിനടിയിൽ തിളങ്ങുന്ന അടയാളങ്ങൾ കാണാം.",
    fogColor: 0x091622,
    lanternColor: 0x7dd3fc
  },
  {
    id: "forest",
    name: "Whispering Woods",
    storyCue: "കട്ടിയുള്ള മൂടൽമഞ്ഞുള്ള കാട്ടുവഴിയിൽ പക്ഷികളുടെ ശബ്ദം ദൂരെ കേൾക്കാം.",
    fogColor: 0x09171c,
    lanternColor: 0xa7f3d0
  },
  {
    id: "manor",
    name: "Old Manor House",
    storyCue: "പഴയ മാളികയുടെ ഹാളിൽ തൂങ്ങിക്കിടക്കുന്ന ലാന്റേണുകൾ സാവധാനം ആടുന്നു.",
    fogColor: 0x141024,
    lanternColor: 0xfde68a
  },
  {
    id: "club",
    name: "Village Club Gate",
    storyCue: "പുലർച്ചെയുടെ ആദ്യ വെളിച്ചം വരുന്നതിന് മുൻപ് Village Club-ന്റെ വാതിൽ തുറക്കണം!",
    fogColor: 0x10182b,
    lanternColor: 0xfcd34d
  }
];

// 22 Varied Questions & Fun Challenges across GK + Fun Minigames (Easy -> Medium -> Hard)
const CHALLENGE_POOL = [
  // EASY (1 - 7)
  {
    id: "gk-1",
    kind: "KNOWLEDGE",
    category: "Science",
    difficulty: "EASY",
    prompt: "ചെടികൾ സൂര്യപ്രകാശത്തിന്റെ സഹായത്തോടെ ഭക്ഷണം നിർമ്മിക്കുന്ന പ്രക്രിയ ഏതാണ്?",
    options: ["Photosynthesis", "Respiration", "Evaporation", "Condensation"],
    answerIndex: 0,
    explanation: "സൂര്യപ്രകാശം, വെള്ളം, കാർബൺ ഡയോക്സൈഡ് എന്നിവ ഉപയോഗിച്ച് ചെടികൾ ആഹാരം ഉണ്ടാക്കുന്നതിനെ Photosynthesis (പ്രകാശസംശ്ലേഷണം) എന്ന് പറയുന്നു."
  },
  {
    id: "gk-2",
    kind: "KNOWLEDGE",
    category: "Geography",
    difficulty: "EASY",
    prompt: "ഭൂമിയിലെ ഏറ്റവും വലിയ സമുദ്രം ഏതാണ്?",
    options: ["Atlantic Ocean", "Indian Ocean", "Pacific Ocean", "Arctic Ocean"],
    answerIndex: 2,
    explanation: "Pacific Ocean ആണ് വിസ്തീർണ്ണത്തിൽ ഏറ്റവും വലിയ സമുദ്രം."
  },
  {
    id: "fun-1",
    kind: "CHALLENGE",
    category: "Odd-One-Out",
    difficulty: "EASY",
    prompt: "താഴെ പറയുന്നവയിൽ വ്യത്യസ്തമായത് (Odd-One-Out) ഏതാണ്?",
    options: ["Moon", "Mars", "Jupiter", "Saturn"],
    answerIndex: 0,
    explanation: "Mars, Jupiter, Saturn എന്നിവ ഗ്രഹങ്ങളാണ്; Moon (ചന്ദ്രൻ) ഭൂമിയുടെ ഉപഗ്രഹമാണ്."
  },
  {
    id: "fun-2",
    kind: "CHALLENGE",
    category: "Pattern Match",
    difficulty: "EASY",
    prompt: "പാറ്റേൺ പൂർത്തിയാക്കുക: 2, 4, 6, 8, ?",
    options: ["10", "9", "12", "14"],
    answerIndex: 0,
    explanation: "ഓരോ സംഖ്യയോടും 2 വീതം കൂട്ടുമ്പോൾ അടുത്ത സംഖ്യ 10 ആയി ലഭിക്കുന്നു."
  },
  {
    id: "gk-3",
    kind: "KNOWLEDGE",
    category: "Nature",
    difficulty: "EASY",
    prompt: "തേനീച്ചകൾ പൂക്കളിൽ നിന്ന് ശേഖരിക്കുന്ന മധുരദ്രവം ഏത് പേരിൽ അറിയപ്പെടുന്നു?",
    options: ["Nectar", "Resin", "Sap", "Dew"],
    answerIndex: 0,
    explanation: "പൂക്കളിൽ നിന്നുള്ള Nectar ശേഖരിച്ചാണ് തേനീച്ചകൾ തേൻ നിർമ്മിക്കുന്നത്."
  },
  {
    id: "gk-4",
    kind: "KNOWLEDGE",
    category: "Sports",
    difficulty: "EASY",
    prompt: "ഒരു സാധാരണ ഫുട്ബോൾ മത്സരത്തിൽ ഓരോ ടീമിലും എത്ര കളിക്കാർ കളിക്കുന്നു?",
    options: ["9", "10", "11", "12"],
    answerIndex: 2,
    explanation: "ഗോൾകീപ്പർ ഉൾപ്പെടെ 11 കളിക്കാരാണ് ഓരോ ടീമിലും ഉണ്ടാകുക."
  },
  {
    id: "fun-3",
    kind: "CHALLENGE",
    category: "Observation",
    difficulty: "EASY",
    prompt: "നിരീക്ഷിക്കുക: 'LANTERN' എന്ന വാക്കിൽ ആകെ എത്ര അക്ഷരങ്ങളുണ്ട്?",
    options: ["6", "7", "8", "5"],
    answerIndex: 1,
    explanation: "L-A-N-T-E-R-N എന്ന വാക്കിൽ ആകെ 7 അക്ഷരങ്ങളാണുള്ളത്."
  },

  // MEDIUM (8 - 15)
  {
    id: "fun-4",
    kind: "CHALLENGE",
    category: "Memory Sequence",
    difficulty: "MEDIUM",
    prompt: "ഈ ക്രമം ഓർമ്മിക്കുക — ഇതിൽ മൂന്നാമതായി വന്ന ചിഹ്നം ഏതാണ്?",
    memorySequence: ["🌙", "🕯️", "🦉", "🗝️"],
    options: ["🕯️", "🦉", "🗝️", "🌙"],
    answerIndex: 1,
    explanation: "ക്രമം: 1) 🌙, 2) 🕯️, 3) 🦉, 4) 🗝️ — മൂന്നാമത്തേത് 🦉 ആണ്."
  },
  {
    id: "gk-5",
    kind: "KNOWLEDGE",
    category: "History",
    difficulty: "MEDIUM",
    prompt: "ഇന്ത്യയിൽ അച്ചടിശാലകൾ (Printing Press) ആദ്യമായി ആരംഭിച്ചത് ഏത് യൂറോപ്യൻ ശക്തിയാണ്?",
    options: ["Dutch", "Portuguese", "French", "Danish"],
    answerIndex: 1,
    explanation: "16-ാം നൂറ്റാണ്ടിൽ പോർച്ചുഗീസുകാരാണ് ഇന്ത്യയിൽ ആദ്യമായി അച്ചടിശാല കൊണ്ടുവന്നത്."
  },
  {
    id: "gk-6",
    kind: "KNOWLEDGE",
    category: "Culture",
    difficulty: "MEDIUM",
    prompt: "കേരളത്തിലെ പ്രശസ്തമായ 'തെയ്യം' കലാരൂപം പ്രധാനമായും ഏത് മേഖലയിലാണ് പ്രചാരത്തിലുള്ളത്?",
    options: ["North Malabar", "Central Travancore", "Idukki Hills", "Wayanad Plateau"],
    answerIndex: 0,
    explanation: "വടക്കൻ മലബാറിലെ (കണ്ണൂർ, കാസർഗോഡ് മേഖല) കാവുകളിലും തറവാടുകളിലുമാണ് തെയ്യം പ്രധാനമായും അവതരിപ്പിക്കുന്നത്."
  },
  {
    id: "fun-5",
    kind: "CHALLENGE",
    category: "Odd-One-Out",
    difficulty: "MEDIUM",
    prompt: "ഏതാണ് ഈ കൂട്ടത്തിൽ പെടാത്തത്?",
    options: ["Compass", "Barometer", "Thermometer", "Marathon"],
    answerIndex: 3,
    explanation: "Compass, Barometer, Thermometer എന്നിവ ഉപകരണങ്ങളാണ്; Marathon ഒരു ദീർഘദൂര ഓട്ടമത്സരമാണ്."
  },
  {
    id: "gk-7",
    kind: "KNOWLEDGE",
    category: "Science",
    difficulty: "MEDIUM",
    prompt: "ശബ്ദം ശൂന്യതയിലൂടെ (Vacuum) സഞ്ചരിക്കുമോ?",
    options: ["അതെ, വേഗത്തിൽ സഞ്ചരിക്കും", "ഇല്ല, മാധ്യമം ആവശ്യമാണ്", "രാത്രിയിൽ മാത്രം സഞ്ചരിക്കും", "ചന്ദ്രനിൽ മാത്രം സഞ്ചരിക്കും"],
    answerIndex: 1,
    explanation: "ശബ്ദതരംഗങ്ങൾക്ക് സഞ്ചരിക്കാൻ വായു, വെള്ളം അല്ലെങ്കിൽ ഖരവസ്തു പോലുള്ള ഒരു മാധ്യമം ആവശ്യമാണ്."
  },
  {
    id: "fun-6",
    kind: "CHALLENGE",
    category: "Pattern Match",
    difficulty: "MEDIUM",
    prompt: "ക്രമം തുടരുക: 3, 6, 12, 24, ?",
    options: ["36", "48", "30", "42"],
    answerIndex: 1,
    explanation: "ഓരോ സംഖ്യയും 2 കൊണ്ട് ഗുണിക്കുമ്പോൾ അടുത്തത് 48 ആകുന്നു."
  },
  {
    id: "gk-8",
    kind: "KNOWLEDGE",
    category: "Geography",
    difficulty: "MEDIUM",
    prompt: "ഏത് നദിയാണ് 'ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദി' ആയി സാധാരണയായി കണക്കാക്കപ്പെടുന്നത്?",
    options: ["Amazon", "Nile", "Ganga", "Danube"],
    answerIndex: 1,
    explanation: "നൈൽ നദിയാണ് (Nile) ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ കണക്കാക്കപ്പെടുന്നത്."
  },
  {
    id: "fun-7",
    kind: "CHALLENGE",
    category: "Observation",
    difficulty: "MEDIUM",
    prompt: "നിരീക്ഷിക്കുക: 'MIDNIGHT' എന്ന വാക്കിൽ 'I' എന്ന അക്ഷരം എത്ര തവണ വരുന്നുണ്ട്?",
    options: ["1", "2", "3", "0"],
    answerIndex: 1,
    explanation: "M-I-D-N-I-G-H-T എന്ന വാക്കിൽ 'I' രണ്ട് തവണയാണ് വരുന്നത്."
  },

  // HARD (16 - 22)
  {
    id: "fun-8",
    kind: "CHALLENGE",
    category: "Memory Sequence",
    difficulty: "HARD",
    prompt: "ഈ ക്രമം ശ്രദ്ധിക്കുക — അവസാനത്തേതിന് തൊട്ടുമുൻപുള്ള (3rd) സംഖ്യ ഏതാണ്?",
    memorySequence: ["7", "14", "21", "28"],
    options: ["14", "21", "28", "35"],
    answerIndex: 1,
    explanation: "ക്രമം 7, 14, 21, 28 എന്നാണ് — മൂന്നാമത്തേത് 21 ആണ്."
  },
  {
    id: "gk-9",
    kind: "KNOWLEDGE",
    category: "Science",
    difficulty: "HARD",
    prompt: "വൈദ്യുതിയുടെ SI യൂണിറ്റ് ഏതാണ്?",
    options: ["Volt", "Ampere", "Ohm", "Watt"],
    answerIndex: 1,
    explanation: "വൈദ്യുത പ്രവാഹത്തിന്റെ (Electric current) SI യൂണിറ്റ് Ampere (A) ആണ്."
  },
  {
    id: "gk-10",
    kind: "KNOWLEDGE",
    category: "History",
    difficulty: "HARD",
    prompt: "സൗരയൂഥത്തിൽ സൂര്യനെ ചുറ്റുന്നത് ഭൂമിയാണെന്നും വൃത്താകൃതിയിലല്ലെന്നും വ്യക്തമാക്കിയ ശാസ്ത്രജ്ഞരിൽ പ്രമുഖൻ ആര്?",
    options: ["Johannes Kepler", "Marco Polo", "Vasco da Gama", "Archimedes"],
    answerIndex: 0,
    explanation: "ഗ്രഹചലന നിയമങ്ങൾ (Laws of Planetary Motion) അവതരിപ്പിച്ചത് Johannes Kepler ആണ്."
  },
  {
    id: "fun-9",
    kind: "CHALLENGE",
    category: "Pattern Match",
    difficulty: "HARD",
    prompt: "പാറ്റേൺ പൂർത്തിയാക്കുക: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "12", "13", "15"],
    answerIndex: 2,
    explanation: "തൊട്ടുമുൻപുള്ള രണ്ട് സംഖ്യകൾ കൂട്ടുമ്പോൾ അടുത്തത് ലഭിക്കുന്നു (5 + 8 = 13)."
  },
  {
    id: "gk-11",
    kind: "KNOWLEDGE",
    category: "Sports",
    difficulty: "HARD",
    prompt: "ഒളിമ്പിക്സ് ചരിത്രത്തിൽ തുടർച്ചയായി സ്വർണ്ണ മെഡലുകൾ നേടിയ പ്രശസ്ത വേഗതാരമായ ഉസൈൻ ബോൾട്ട് ഏത് രാജ്യക്കാരനാണ്?",
    options: ["Jamaica", "Kenya", "Bahamas", "Trinidad"],
    answerIndex: 0,
    explanation: "ഉസൈൻ ബോൾട്ട് ജമൈക്ക (Jamaica) സ്വദേശിയാണ്."
  },
  {
    id: "gk-12",
    kind: "KNOWLEDGE",
    category: "Culture",
    difficulty: "HARD",
    prompt: "ജപ്പാനിലെ പരമ്പരാഗത കവിതാരൂപമായ 'ഹൈക്കു' (Haiku) സാധാരണയായി എത്ര വരികളുള്ളതാണ്?",
    options: ["2 വരി", "3 വരി", "4 വരി", "5 വരി"],
    answerIndex: 1,
    explanation: "പരമ്പരാഗത ഹൈക്കു കവിതകൾ സാധാരണയായി 3 വരികളിലായാണ് എഴുതപ്പെടുന്നത്."
  },
  {
    id: "fun-10",
    kind: "CHALLENGE",
    category: "Odd-One-Out",
    difficulty: "HARD",
    prompt: "ഏതാണ് ഈ കൂട്ടത്തിൽ പെടാത്തത്?",
    options: ["2", "3", "5", "9"],
    answerIndex: 3,
    explanation: "2, 3, 5 എന്നിവ അഭാജ്യ സംഖ്യകളാണ് (Prime numbers); 9 ഒരു ഭാജ്യ സംഖ്യയാണ് (9 = 3 × 3)."
  }
];

// ==========================================
// 2. DOM REFERENCES
// ==========================================
const DOM = {
  canvasWrap: document.getElementById("game-canvas"),

  titleScreen: document.getElementById("title-screen"),
  playerNameInput: document.getElementById("player-name"),
  accessCodeInput: document.getElementById("access-code"),
  loginStatus: document.getElementById("login-status"),
  startGameBtn: document.getElementById("start-game-btn"),
  howToPlayBtn: document.getElementById("how-to-play-btn"),
  soundToggleBtn: document.getElementById("sound-toggle-btn"),
  continueCodeInput: document.getElementById("continue-code-input"),
  continueBtn: document.getElementById("continue-btn"),
  continueStatus: document.getElementById("continue-status"),

  helpModal: document.getElementById("how-to-play-modal"),
  closeHelpBtn: document.getElementById("close-help-btn"),

  gameplayScreen: document.getElementById("gameplay-screen"),
  hudLocation: document.getElementById("hud-location"),
  hudProgress: document.getElementById("hud-progress"),
  hudLives: document.getElementById("hud-lives"),
  hudHints: document.getElementById("hud-hints"),
  hudScore: document.getElementById("hud-score"),
  hudRoundTimer: document.getElementById("hud-round-timer"),
  hudSunriseTimer: document.getElementById("hud-sunrise-timer"),
  hudSoundBtn: document.getElementById("hud-sound-btn"),
  pauseBtn: document.getElementById("pause-btn"),

  typeBadge: document.getElementById("challenge-type-badge"),
  diffBadge: document.getElementById("challenge-difficulty-badge"),
  fearText: document.getElementById("challenge-fear-text"),
  storyCue: document.getElementById("story-cue"),
  promptEl: document.getElementById("challenge-prompt"),
  interactiveArea: document.getElementById("challenge-interactive-area"),
  choicesGrid: document.getElementById("choices-grid"),
  useHintBtn: document.getElementById("use-hint-btn"),

  feedbackBox: document.getElementById("feedback-box"),
  feedbackTitle: document.getElementById("feedback-title"),
  feedbackExplanation: document.getElementById("feedback-explanation"),
  nextRoundBtn: document.getElementById("next-round-btn"),

  pauseScreen: document.getElementById("pause-screen"),
  resumeBtn: document.getElementById("resume-btn"),
  restartBtn: document.getElementById("restart-btn"),

  winScreen: document.getElementById("win-screen"),
  winScore: document.getElementById("win-score"),
  winCorrect: document.getElementById("win-correct"),
  winFastest: document.getElementById("win-fastest"),
  winSyncStatus: document.getElementById("win-sync-status"),
  winPlayAgainBtn: document.getElementById("win-play-again-btn"),

  gameOverScreen: document.getElementById("gameover-screen"),
  gameoverReason: document.getElementById("gameover-reason"),
  gameoverScore: document.getElementById("gameover-score"),
  gameoverCorrect: document.getElementById("gameover-correct"),
  gameoverSyncStatus: document.getElementById("gameover-sync-status"),
  gameoverPlayAgainBtn: document.getElementById("gameover-play-again-btn")
};

// ==========================================
// 3. SUBTLE SOUND EFFECTS (OFF BY DEFAULT, NO SUDDEN LOUD SOUNDS)
// ==========================================
let soundEnabled = false;
let audioCtx = null;

function toggleSound() {
  soundEnabled = !soundEnabled;
  if (soundEnabled) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch (_) {}
  }
  const labelTitle = soundEnabled ? "Sound: ON" : "Sound: OFF";
  const labelHud = soundEnabled ? "🔊 ON" : "🔇 OFF";
  if (DOM.soundToggleBtn) {
    DOM.soundToggleBtn.textContent = labelTitle;
    DOM.soundToggleBtn.setAttribute("aria-pressed", String(soundEnabled));
  }
  if (DOM.hudSoundBtn) {
    DOM.hudSoundBtn.textContent = labelHud;
    DOM.hudSoundBtn.setAttribute("aria-pressed", String(soundEnabled));
  }
}

function playSoftTone(freqStart, freqEnd, duration = 0.16, peakGain = 0.04) {
  if (!soundEnabled || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch (_) {}
}

// ==========================================
// 4. SPOOKY MIDNIGHT VILLAGE 3D ATMOSPHERE (NO FLASHING)
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080f1e);
scene.fog = new THREE.FogExp2(0x080f1e, 0.022);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 140);
camera.position.set(0, 5.2, 14);
camera.lookAt(0, 1.5, -2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
DOM.canvasWrap.appendChild(renderer.domElement);

const moonLight = new THREE.DirectionalLight(0xa5d8ff, 0.85);
moonLight.position.set(-14, 22, -16);
scene.add(moonLight);
scene.add(new THREE.HemisphereLight(0x3b5998, 0x0b1220, 0.55));

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 90),
  new THREE.MeshStandardMaterial({ color: 0x0e1a2b, roughness: 0.92 })
);
groundMesh.rotation.x = -Math.PI / 2;
scene.add(groundMesh);

// Glowing Moon in the night sky
const moonMesh = new THREE.Mesh(
  new THREE.SphereGeometry(2.4, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xe2f1ff })
);
moonMesh.position.set(-16, 17, -28);
scene.add(moonMesh);

// Old Village Buildings & Village Club Beacon
const buildings = [];
function addVillageBuilding(x, z, w, h, d, isClub = false) {
  const bGroup = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({
    color: isClub ? 0x1e3a5f : 0x172236,
    roughness: 0.85
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: isClub ? 0x2b547e : 0x101827,
    roughness: 0.9
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
  body.position.y = h / 2;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, 2.2, 4), roofMat);
  roof.position.y = h + 1.1;
  roof.rotation.y = Math.PI / 4;

  bGroup.add(body, roof);
  bGroup.position.set(x, 0, z);
  scene.add(bGroup);
  buildings.push(bGroup);
}

addVillageBuilding(-9, -6, 4.5, 4.2, 4.2, false); // Abandoned School silhouette
addVillageBuilding(9, -5, 4.0, 3.6, 4.0, false);  // Old Manor silhouette
addVillageBuilding(0, -14, 6.2, 4.8, 5.0, true);  // Village Club target building

// Warm Lanterns along the village path
const lanterns = [];
function addLantern(x, z) {
  const lGroup = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  post.position.y = 1.3;

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffcf70 })
  );
  bulb.position.y = 2.65;

  const light = new THREE.PointLight(0xffbe55, 1.1, 9);
  light.position.set(0, 2.65, 0);

  lGroup.add(post, bulb, light);
  lGroup.position.set(x, 0, z);
  scene.add(lGroup);
  lanterns.push({ lGroup, light, baseX: x, baseZ: z });
}

addLantern(-4.5, 5);
addLantern(4.5, 2);
addLantern(-3.5, -4);
addLantern(3.5, -9);

// Player Explorer Marker moving toward the Village Club
const explorerMesh = new THREE.Mesh(
  new THREE.ConeGeometry(0.55, 1.4, 12),
  new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0c4a6e })
);
explorerMesh.position.set(-5, 0.7, 9);
scene.add(explorerMesh);

function updateVillageAtmosphereForStep(stepIdx) {
  const loc = VILLAGE_LOCATIONS[stepIdx % VILLAGE_LOCATIONS.length];
  scene.background.setHex(loc.fogColor);
  scene.fog.color.setHex(loc.fogColor);

  const progressRatio = Math.min(1, stepIdx / GAME_CONFIG.totalStepsToClub);
  const startZ = 9;
  const endZ = -11;
  explorerMesh.position.z = startZ + (endZ - startZ) * progressRatio;
  explorerMesh.position.x = Math.sin(progressRatio * Math.PI * 2) * 3.2;

  lanterns.forEach((item) => {
    item.light.color.setHex(loc.lanternColor);
  });
}

// ==========================================
// 5. GAME STATE & SHUFFLE HELPERS
// ==========================================
let gameState = {
  phase: "TITLE", // TITLE | PLAYING | FEEDBACK | PAUSED | WIN | GAMEOVER
  sessionId: "",
  playerName: "",
  accessCode: "",
  stepIndex: 0,
  lives: GAME_CONFIG.startingLives,
  hintsLeft: GAME_CONFIG.startingHints,
  score: 0,
  combo: 0,
  fearLevel: 10,
  correctCount: 0,
  answeredCount: 0,
  fastestAnswerSec: null,
  roundRemaining: GAME_CONFIG.roundSeconds,
  sunriseRemaining: GAME_CONFIG.sunriseSeconds,
  questionQueue: [],
  currentChallenge: null,
  currentChoices: [],
  roundAnswered: false,
  roundStartMs: 0
};

let lastTickMs = performance.now();

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildShuffledQuestionDeck() {
  const easy = shuffleArray(CHALLENGE_POOL.filter((q) => q.difficulty === "EASY"));
  const medium = shuffleArray(CHALLENGE_POOL.filter((q) => q.difficulty === "MEDIUM"));
  const hard = shuffleArray(CHALLENGE_POOL.filter((q) => q.difficulty === "HARD"));
  return [...easy, ...medium, ...hard];
}

function getLocationForStep(stepIdx) {
  if (stepIdx >= GAME_CONFIG.totalStepsToClub - 1) {
    return VILLAGE_LOCATIONS[VILLAGE_LOCATIONS.length - 1];
  }
  return VILLAGE_LOCATIONS[stepIdx % (VILLAGE_LOCATIONS.length - 1)];
}

// ==========================================
// 6. BACKEND SYNC (EXISTING ROUTES)
// ==========================================
function readSessionFromHash() {
  const m = (window.location.hash || "").match(/session=([^&]+)/);
  return m && m[1] ? decodeURIComponent(m[1]) : "";
}

function writeSessionToHash(sessionId) {
  if (!sessionId) return;
  try {
    history.replaceState(null, "", "#session=" + encodeURIComponent(sessionId));
  } catch (_) {
    window.location.hash = "session=" + encodeURIComponent(sessionId);
  }
}

async function syncProgress(finished = false) {
  if (!gameState.sessionId) return;
  try {
    await fetch(BACKEND_ENDPOINTS.progress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: gameState.sessionId,
        doorIndex: gameState.stepIndex,
        elapsedSeconds: Number((GAME_CONFIG.sunriseSeconds - gameState.sunriseRemaining).toFixed(1)),
        finished
      })
    });
  } catch (_) {}
}

// ==========================================
// 7. SCREEN & ROUND MANAGEMENT
// ==========================================
function showScreen(targetScreen) {
  DOM.titleScreen.style.display = "none";
  DOM.helpModal.style.display = "none";
  DOM.gameplayScreen.style.display = "none";
  DOM.pauseScreen.style.display = "none";
  DOM.winScreen.style.display = "none";
  DOM.gameOverScreen.style.display = "none";

  if (targetScreen === "TITLE") DOM.titleScreen.style.display = "flex";
  else if (targetScreen === "HELP") DOM.helpModal.style.display = "flex";
  else if (targetScreen === "GAMEPLAY") DOM.gameplayScreen.style.display = "block";
  else if (targetScreen === "PAUSED") {
    DOM.gameplayScreen.style.display = "block";
    DOM.pauseScreen.style.display = "flex";
  } else if (targetScreen === "WIN") DOM.winScreen.style.display = "flex";
  else if (targetScreen === "GAMEOVER") DOM.gameOverScreen.style.display = "flex";
}

function formatSunriseTime(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const mins = String(Math.floor(s / 60)).padStart(2, "0");
  const rem = String(s % 60).padStart(2, "0");
  return `${mins}:${rem}`;
}

function renderHud() {
  const loc = getLocationForStep(gameState.stepIndex);
  DOM.hudLocation.textContent = `Location: ${loc.name}`;
  DOM.hudProgress.textContent = `Step: ${Math.min(gameState.stepIndex + 1, GAME_CONFIG.totalStepsToClub)} / ${GAME_CONFIG.totalStepsToClub}`;
  DOM.hudLives.textContent = `Lives: ${"❤️".repeat(Math.max(0, gameState.lives)) || "0"}`;
  DOM.hudHints.textContent = `Hints: 💡 ${gameState.hintsLeft}`;
  DOM.hudScore.textContent = `Score: ${gameState.score}`;
  DOM.hudRoundTimer.textContent = `Round: ${Math.max(0, gameState.roundRemaining).toFixed(1)}s`;
  DOM.hudSunriseTimer.textContent = `Sunrise: ${formatSunriseTime(gameState.sunriseRemaining)}`;
  DOM.fearText.textContent = `Village Fear: ${gameState.fearLevel}%`;

  DOM.useHintBtn.textContent = `Use Hint (${gameState.hintsLeft} left)`;
  DOM.useHintBtn.disabled = gameState.hintsLeft <= 0 || gameState.roundAnswered;
}

function startNewPlaythrough({ sessionId, playerName, accessCode }) {
  gameState = {
    phase: "PLAYING",
    sessionId,
    playerName,
    accessCode,
    stepIndex: 0,
    lives: GAME_CONFIG.startingLives,
    hintsLeft: GAME_CONFIG.startingHints,
    score: 0,
    combo: 0,
    fearLevel: 10,
    correctCount: 0,
    answeredCount: 0,
    fastestAnswerSec: null,
    roundRemaining: GAME_CONFIG.roundSeconds,
    sunriseRemaining: GAME_CONFIG.sunriseSeconds,
    questionQueue: buildShuffledQuestionDeck(),
    currentChallenge: null,
    currentChoices: [],
    roundAnswered: false,
    roundStartMs: performance.now()
  };

  if (sessionId) writeSessionToHash(sessionId);
  updateVillageAtmosphereForStep(0);
  showScreen("GAMEPLAY");
  loadRound();
}

function loadRound() {
  if (gameState.questionQueue.length === 0) {
    gameState.questionQueue = buildShuffledQuestionDeck();
  }
  const qItem = gameState.questionQueue.pop();
  const loc = getLocationForStep(gameState.stepIndex);

  // Shuffle choices while tracking the true answer text
  const correctText = qItem.options[qItem.answerIndex];
  const shuffledOptions = shuffleArray(qItem.options).map((text) => ({
    text,
    isCorrect: text === correctText
  }));

  gameState.phase = "PLAYING";
  gameState.currentChallenge = qItem;
  gameState.currentChoices = shuffledOptions;
  gameState.roundAnswered = false;
  gameState.roundRemaining = GAME_CONFIG.roundSeconds;
  gameState.roundStartMs = performance.now();

  updateVillageAtmosphereForStep(gameState.stepIndex);

  DOM.storyCue.textContent = loc.storyCue;
  DOM.typeBadge.textContent = qItem.kind === "CHALLENGE" ? `FUN CHALLENGE • ${qItem.category}` : `KNOWLEDGE • ${qItem.category}`;
  DOM.diffBadge.textContent = qItem.difficulty;
  DOM.diffBadge.className = `badge diff-${qItem.difficulty.toLowerCase()}`;
  DOM.promptEl.textContent = qItem.prompt;

  // Render optional memory sequence for memory challenges
  DOM.interactiveArea.innerHTML = "";
  if (Array.isArray(qItem.memorySequence) && qItem.memorySequence.length > 0) {
    const seqBox = document.createElement("div");
    seqBox.className = "memory-sequence-box";
    qItem.memorySequence.forEach((token) => {
      const chip = document.createElement("div");
      chip.className = "memory-token";
      chip.textContent = token;
      seqBox.appendChild(chip);
    });
    DOM.interactiveArea.appendChild(seqBox);
  }

  // Render answer buttons
  DOM.choicesGrid.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  shuffledOptions.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.dataset.choiceIndex = String(idx);
    btn.textContent = `${letters[idx] || idx + 1}. ${choice.text}`;
    btn.addEventListener("click", () => handleSelectChoice(idx));
    DOM.choicesGrid.appendChild(btn);
  });

  DOM.feedbackBox.style.display = "none";
  renderHud();
}

function handleUseHint() {
  if (gameState.phase !== "PLAYING" || gameState.roundAnswered || gameState.hintsLeft <= 0) return;

  const wrongIndices = gameState.currentChoices
    .map((c, i) => (!c.isCorrect ? i : -1))
    .filter((i) => i !== -1);

  const toEliminate = shuffleArray(wrongIndices).slice(0, 2);
  toEliminate.forEach((idx) => {
    const btn = DOM.choicesGrid.querySelector(`button[data-choice-index="${idx}"]`);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("eliminated");
    }
  });

  gameState.hintsLeft -= 1;
  playSoftTone(660, 780, 0.14, 0.035);
  renderHud();
}

function finishRoundWithResult(outcome, selectedIdx = null) {
  if (gameState.roundAnswered) return;
  gameState.roundAnswered = true;
  gameState.phase = "FEEDBACK";
  gameState.answeredCount += 1;

  const elapsedAnswerSec = Math.max(0.2, (performance.now() - gameState.roundStartMs) / 1000);
  const allButtons = Array.from(DOM.choicesGrid.querySelectorAll("button"));
  allButtons.forEach((b) => {
    b.disabled = true;
  });

  const qItem = gameState.currentChallenge;

  if (outcome === "CORRECT") {
    gameState.combo += 1;
    gameState.correctCount += 1;
    gameState.fearLevel = Math.max(0, gameState.fearLevel - GAME_CONFIG.fearDropOnSuccess);
    if (gameState.fastestAnswerSec === null || elapsedAnswerSec < gameState.fastestAnswerSec) {
      gameState.fastestAnswerSec = elapsedAnswerSec;
    }

    const timeRatio = Math.max(0, gameState.roundRemaining / GAME_CONFIG.roundSeconds);
    const speedBonus = Math.round(GAME_CONFIG.speedBonusMax * timeRatio);
    const comboBonus = (gameState.combo - 1) * GAME_CONFIG.comboBonusStep;
    const gained = GAME_CONFIG.basePoints + speedBonus + comboBonus;
    gameState.score += gained;
    gameState.stepIndex += 1;

    if (selectedIdx !== null && allButtons[selectedIdx]) {
      allButtons[selectedIdx].style.borderColor = "#4ade80";
    }

    playSoftTone(520, 760, 0.18, 0.04);
    DOM.feedbackTitle.textContent = `ശരി ഉത്തരം! +${gained} pts (Combo x${gameState.combo})`;
    DOM.feedbackTitle.style.color = "#86efac";
  } else if (outcome === "TIMEOUT") {
    gameState.combo = 0;
    gameState.lives -= 1;
    gameState.fearLevel = Math.min(100, gameState.fearLevel + GAME_CONFIG.fearStepOnFail);
    playSoftTone(260, 150, 0.24, 0.04);
    DOM.feedbackTitle.textContent = "സമയം കഴിഞ്ഞു! (Timeout) — 1 Life നഷ്ടമായി";
    DOM.feedbackTitle.style.color = "#fca5a5";
  } else {
    gameState.combo = 0;
    gameState.lives -= 1;
    gameState.fearLevel = Math.min(100, gameState.fearLevel + GAME_CONFIG.fearStepOnFail);
    if (selectedIdx !== null && allButtons[selectedIdx]) {
      allButtons[selectedIdx].style.borderColor = "#f87171";
    }
    playSoftTone(240, 130, 0.24, 0.04);
    DOM.feedbackTitle.textContent = "തെറ്റായ ഉത്തരം — 1 Life നഷ്ടമായി";
    DOM.feedbackTitle.style.color = "#fca5a5";
  }

  DOM.feedbackExplanation.textContent = qItem.explanation;
  DOM.nextRoundBtn.textContent =
    gameState.lives <= 0
      ? "ഫലം കാണുക"
      : gameState.stepIndex >= GAME_CONFIG.totalStepsToClub
      ? "Village Club-ലേക്ക് പ്രവേശിക്കുക"
      : "അടുത്ത ഘട്ടത്തിലേക്ക്";
  DOM.feedbackBox.style.display = "block";
  renderHud();
  syncProgress(false);
}

function handleSelectChoice(choiceIdx) {
  if (gameState.phase !== "PLAYING" || gameState.roundAnswered) return;
  const picked = gameState.currentChoices[choiceIdx];
  if (!picked) return;
  finishRoundWithResult(picked.isCorrect ? "CORRECT" : "WRONG", choiceIdx);
}

async function advanceAfterFeedback() {
  if (gameState.lives <= 0) {
    triggerGameOver("നിങ്ങളുടെ 3 Lives അവസാനിച്ചു. ഗ്രാമത്തിലെ ഇരുട്ടിൽ ദൗത്യം പൂർത്തിയാക്കാൻ കഴിഞ്ഞില്ല.");
    return;
  }
  if (gameState.sunriseRemaining <= 0) {
    triggerGameOver("സൂര്യോദയം എത്തിച്ചേർന്നു! സൂര്യോദയത്തിന് മുൻപ് Village Club-ൽ എത്താൻ കഴിഞ്ഞില്ല.");
    return;
  }
  if (gameState.stepIndex >= GAME_CONFIG.totalStepsToClub) {
    updateVillageAtmosphereForStep(GAME_CONFIG.totalStepsToClub);
    gameState.phase = "WIN";
    DOM.winScore.textContent = String(gameState.score);
    DOM.winCorrect.textContent = `${gameState.correctCount} / ${gameState.answeredCount}`;
    DOM.winFastest.textContent =
      gameState.fastestAnswerSec !== null ? `${gameState.fastestAnswerSec.toFixed(1)}s` : "-";
    DOM.winSyncStatus.textContent = "വിജയ വിവരങ്ങൾ രേഖപ്പെടുത്തുന്നു...";
    showScreen("WIN");
    await syncProgress(true);
    DOM.winSyncStatus.textContent = "ദൗത്യം പൂർത്തിയായി.";
    return;
  }

  loadRound();
}

async function triggerGameOver(reasonText) {
  gameState.phase = "GAMEOVER";
  DOM.gameoverReason.textContent = reasonText;
  DOM.gameoverScore.textContent = String(gameState.score);
  DOM.gameoverCorrect.textContent = `${gameState.correctCount} / ${gameState.answeredCount}`;
  DOM.gameoverSyncStatus.textContent = "ഫലം സേവ് ചെയ്യുന്നു...";
  showScreen("GAMEOVER");
  await syncProgress(false);
  DOM.gameoverSyncStatus.textContent = "";
}

// ==========================================
// 8. ACCESS / CONTINUE / PAUSE / KEYBOARD CONTROLS
// ==========================================
async function handleStartClick() {
  const playerName = String(DOM.playerNameInput.value || "").trim();
  const code = String(DOM.accessCodeInput.value || "").trim().toUpperCase();

  if (!playerName) {
    DOM.loginStatus.textContent = "ദയവായി കളിക്കാരന്റെ പേര് നൽകുക.";
    return;
  }
  if (!code) {
    DOM.loginStatus.textContent = "ദയവായി ആക്സസ് കോഡ് നൽകുക.";
    return;
  }

  DOM.startGameBtn.disabled = true;
  DOM.loginStatus.textContent = "ആക്സസ് കോഡ് പരിശോധിക്കുന്നു...";

  try {
    const res = await fetch(BACKEND_ENDPOINTS.verify, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerName })
    });
    const data = await res.json();
    DOM.startGameBtn.disabled = false;

    if (!data || !data.valid) {
      if (data?.reason === "ALREADY_USED") {
        DOM.loginStatus.textContent = "ഈ കോഡ് ഉപയോഗിച്ചു കഴിഞ്ഞു — താഴെയുള്ള Continue ഉപയോഗിക്കുക.";
      } else if (data?.reason === "INVALID_CODE") {
        DOM.loginStatus.textContent = "തെറ്റായ ആക്സസ് കോഡ്.";
      } else {
        DOM.loginStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
      }
      return;
    }

    DOM.loginStatus.textContent = "";
    startNewPlaythrough({
      sessionId: data.sessionId,
      playerName,
      accessCode: code
    });
  } catch (_) {
    DOM.startGameBtn.disabled = false;
    DOM.loginStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
  }
}

async function handleContinueClick() {
  const code = String(DOM.continueCodeInput.value || "").trim().toUpperCase();
  if (!code) {
    DOM.continueStatus.textContent = "ഉപയോഗിച്ച ആക്സസ് കോഡ് നൽകുക.";
    return;
  }

  DOM.continueBtn.disabled = true;
  DOM.continueStatus.textContent = "സെഷൻ പരിശോധിക്കുന്നു...";

  try {
    const res = await fetch(BACKEND_ENDPOINTS.continueCode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    DOM.continueBtn.disabled = false;

    if (!data || !data.valid) {
      DOM.continueStatus.textContent = "ഈ കോഡ് ഉപയോഗിച്ച് തുടരാൻ കഴിഞ്ഞില്ല.";
      return;
    }

    const typedName = String(DOM.playerNameInput.value || "").trim();
    DOM.continueStatus.textContent = "";
    startNewPlaythrough({
      sessionId: data.sessionId,
      playerName: typedName || data.playerName || "Explorer",
      accessCode: code
    });
  } catch (_) {
    DOM.continueBtn.disabled = false;
    DOM.continueStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
  }
}

DOM.startGameBtn.addEventListener("click", handleStartClick);
DOM.continueBtn.addEventListener("click", handleContinueClick);

DOM.howToPlayBtn.addEventListener("click", () => {
  showScreen("HELP");
});
DOM.closeHelpBtn.addEventListener("click", () => {
  showScreen("TITLE");
});

DOM.soundToggleBtn.addEventListener("click", toggleSound);
DOM.hudSoundBtn.addEventListener("click", toggleSound);

DOM.useHintBtn.addEventListener("click", handleUseHint);
DOM.nextRoundBtn.addEventListener("click", advanceAfterFeedback);

DOM.pauseBtn.addEventListener("click", () => {
  if (gameState.phase === "PLAYING" || gameState.phase === "FEEDBACK") {
    gameState.phase = "PAUSED";
    showScreen("PAUSED");
  }
});

DOM.resumeBtn.addEventListener("click", () => {
  if (gameState.phase === "PAUSED") {
    gameState.phase = gameState.roundAnswered ? "FEEDBACK" : "PLAYING";
    gameState.roundStartMs = performance.now();
    showScreen("GAMEPLAY");
  }
});

DOM.restartBtn.addEventListener("click", () => {
  startNewPlaythrough({
    sessionId: gameState.sessionId,
    playerName: gameState.playerName || "Explorer",
    accessCode: gameState.accessCode || ""
  });
});

DOM.winPlayAgainBtn.addEventListener("click", () => {
  showScreen("TITLE");
});

DOM.gameoverPlayAgainBtn.addEventListener("click", () => {
  showScreen("TITLE");
});

window.addEventListener("keydown", (e) => {
  if (gameState.phase === "PLAYING" && !gameState.roundAnswered) {
    const keyMap = {
      "1": 0, "a": 0, "A": 0,
      "2": 1, "b": 1, "B": 1,
      "3": 2, "c": 2, "C": 2,
      "4": 3, "d": 3, "D": 3
    };
    if (Object.prototype.hasOwnProperty.call(keyMap, e.key)) {
      const idx = keyMap[e.key];
      const btn = DOM.choicesGrid.querySelector(`button[data-choice-index="${idx}"]`);
      if (btn && !btn.disabled) {
        e.preventDefault();
        handleSelectChoice(idx);
      }
      return;
    }
    if (e.key === "h" || e.key === "H") {
      e.preventDefault();
      handleUseHint();
      return;
    }
  }

  if (gameState.phase === "FEEDBACK" && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    advanceAfterFeedback();
    return;
  }

  if (e.key === "p" || e.key === "P" || e.key === "Escape") {
    if (gameState.phase === "PLAYING" || gameState.phase === "FEEDBACK") {
      gameState.phase = "PAUSED";
      showScreen("PAUSED");
    } else if (gameState.phase === "PAUSED") {
      gameState.phase = gameState.roundAnswered ? "FEEDBACK" : "PLAYING";
      gameState.roundStartMs = performance.now();
      showScreen("GAMEPLAY");
    }
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// 9. MAIN LOOP (TIMERS & GENTLE LANTERN SWAY)
// ==========================================
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - lastTickMs) / 1000, 0.1);
  lastTickMs = now;

  if (gameState.phase === "PLAYING" && !gameState.roundAnswered) {
    gameState.roundRemaining = Math.max(0, gameState.roundRemaining - dt);
    gameState.sunriseRemaining = Math.max(0, gameState.sunriseRemaining - dt);
    renderHud();

    if (gameState.sunriseRemaining <= 0) {
      finishRoundWithResult("TIMEOUT");
      triggerGameOver("സൂര്യോദയം എത്തിച്ചേർന്നു! സൂര്യോദയത്തിന് മുൻപ് Village Club-ൽ എത്താൻ കഴിഞ്ഞില്ല.");
    } else if (gameState.roundRemaining <= 0) {
      finishRoundWithResult("TIMEOUT");
    }
  }

  // Gentle sway on village lanterns (no flashing)
  lanterns.forEach((item, i) => {
    item.lGroup.rotation.z = Math.sin(now * 0.0014 + i) * 0.04;
  });

  renderer.render(scene, camera);
}

requestAnimationFrame(loop);