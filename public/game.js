/** @typedef {{ category: string, prompt: string, answers: string[], explanation: string }} TypedQuizQuestion */

const SECONDS_PER_QUESTION = 20;
const POINTS_PER_CORRECT = 100;
const STARTING_HINTS = 3;

const ENDPOINTS = {
  verify: "/api/verify-code",
  continueCode: "/api/continue-code",
  resume: "/api/resume-session",
  progress: "/api/save-progress"
};

/** @type {TypedQuizQuestion[]} */
const QUIZ_QUESTIONS = [
  { category: "Science", prompt: "ചെടികൾ സൂര്യപ്രകാശത്തിന്റെ സഹായത്തോടെ ഭക്ഷണം ഉണ്ടാക്കുന്ന പ്രക്രിയ ഏതാണ്?", answers: ["PHOTOSYNTHESIS", "പ്രകാശസംശ്ലേഷണം"], explanation: "സൂര്യപ്രകാശം ഉപയോഗിച്ച് ചെടികൾ ഭക്ഷണം നിർമ്മിക്കുന്നതിനെ Photosynthesis എന്ന് വിളിക്കുന്നു." },
  { category: "Geography", prompt: "ഭൂമിയിലെ ഏറ്റവും വലിയ സമുദ്രം ഏതാണ്?", answers: ["PACIFIC OCEAN", "PACIFIC", "പസഫിക് സമുദ്രം"], explanation: "Pacific Ocean ആണ് ഏറ്റവും വലിയ സമുദ്രം." },
  { category: "GK", prompt: "കേരളത്തിൽ ആകെ എത്ര ജില്ലകളുണ്ട്?", answers: ["14", "പതിനാല്"], explanation: "കേരളത്തിൽ ആകെ 14 ജില്ലകളാണുള്ളത്." },
  { category: "Sports", prompt: "ഒരു സാധാരണ ഫുട്ബോൾ ടീമിൽ എത്ര കളിക്കാർ കളിക്കുന്നു?", answers: ["11", "പതിനൊന്ന്"], explanation: "ഒരു ടീമിൽ 11 കളിക്കാരാണ് ഉണ്ടാകുക." },
  { category: "Science", prompt: "ജലത്തിന്റെ രാസസൂത്രം (Chemical formula) ഏതാണ്?", answers: ["H2O", "H₂O"], explanation: "രണ്ട് ഹൈഡ്രജൻ ആറ്റവും ഒരു ഓക്സിജൻ ആറ്റവും ചേർന്നതാണ് H2O." },
  { category: "Geography", prompt: "ഇന്ത്യയുടെ തലസ്ഥാന നഗരം ഏതാണ്?", answers: ["NEW DELHI", "DELHI", "ന്യൂഡൽഹി", "ന്യൂഡെൽഹി"], explanation: "New Delhi ആണ് ഇന്ത്യയുടെ തലസ്ഥാനം." },
  { category: "Math", prompt: "15 × 4 എത്രയാണ്?", answers: ["60", "അറുപത്"], explanation: "15-നെ 4 കൊണ്ട് ഗുണിച്ചാൽ 60 ലഭിക്കും." },
  { category: "History", prompt: "ഇന്ത്യയ്ക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത് ഏത് വർഷമാണ്?", answers: ["1947"], explanation: "1947 ഓഗസ്റ്റ് 15-നാണ് ഇന്ത്യയ്ക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത്." },
  { category: "Nature", prompt: "ഏറ്റവും വേഗത്തിൽ ഓടുന്ന കരയിലെ ജീവി ഏതാണ്?", answers: ["CHEETAH", "ചീറ്റ", "ചീറ്റപ്പുലി"], explanation: "Cheetah ആണ് കരയിലെ ഏറ്റവും വേഗതയുള്ള ജീവി." },
  { category: "Culture", prompt: "കേരളത്തിലെ പ്രശസ്തമായ വിളവെടുപ്പ് ഉത്സവം ഏതാണ്?", answers: ["ONAM", "ഓണം"], explanation: "കേരളത്തിന്റെ ദേശീയ ഉത്സവവും വിളവെടുപ്പ് ഉത്സവവുമാണ് ഓണം." },
  { category: "Science", prompt: "ശബ്ദം ശൂന്യതയിലൂടെ സഞ്ചരിക്കുമോ? (അതെ / ഇല്ല)", answers: ["ഇല്ല", "NO", "ILLA"], explanation: "ശബ്ദത്തിന് സഞ്ചരിക്കാൻ വായു പോലുള്ള മാധ്യമം ആവശ്യമാണ്." },
  { category: "Geography", prompt: "ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ പർവതശിഖരം ഏതാണ്?", answers: ["MOUNT EVEREST", "EVEREST", "എവറസ്റ്റ്"], explanation: "Mount Everest ആണ് ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടി." },
  { category: "Math", prompt: "144-ന്റെ വർഗ്ഗമൂലം (Square root) എത്രയാണ്?", answers: ["12", "പന്ത്രണ്ട്"], explanation: "12 × 12 = 144 ആയതിനാൽ വർഗ്ഗമൂലം 12 ആണ്." },
  { category: "Sports", prompt: "ഒളിമ്പിക് പതാകയിൽ എത്ര വളയങ്ങളുണ്ട്?", answers: ["5", "അഞ്ച്"], explanation: "ഒളിമ്പിക് പതാകയിൽ പരസ്പരം ബന്ധിപ്പിച്ച 5 വളയങ്ങളാണുള്ളത്." },
  { category: "Science", prompt: "സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏതാണ്?", answers: ["JUPITER", "വ്യാഴം"], explanation: "Jupiter ആണ് സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം." },
  { category: "Geography", prompt: "ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ കണക്കാക്കപ്പെടുന്നത് ഏതാണ്?", answers: ["NILE", "നൈൽ"], explanation: "Nile നദിയാണ് ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ പറയപ്പെടുന്നത്." },
  { category: "Culture", prompt: "കഥകളി ഏത് സംസ്ഥാനത്തിന്റെ പരമ്പരാഗത കലാരൂപമാണ്?", answers: ["KERALA", "കേരളം"], explanation: "കേരളത്തിന്റെ പരമ്പരാഗത ശാസ്ത്രീയ കലാരൂപമാണ് കഥകളി." },
  { category: "Math", prompt: "25% of 200 എത്രയാണ്?", answers: ["50", "അൻപത്"], explanation: "200-ന്റെ 25% (നാലിലൊന്ന്) 50 ആണ്." },
  { category: "Science", prompt: "മനുഷ്യശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം ഏതാണ്?", answers: ["SKIN", "ത്വക്ക്", "ചർമ്മം"], explanation: "Skin (ത്വക്ക്) ആണ് മനുഷ്യശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം." },
  { category: "History", prompt: "ചന്ദ്രനിൽ ആദ്യം കാലുകുത്തിയ മനുഷ്യൻ ആര്?", answers: ["NEIL ARMSTRONG", "ARMSTRONG", "നീൽ ആംസ്ട്രോംഗ്"], explanation: "1969-ൽ അപ്പോളോ 11 ദൗത്യത്തിലാണ് Neil Armstrong ചന്ദ്രനിൽ ഇറങ്ങിയത്." },
  { category: "Nature", prompt: "മരങ്ങൾ ഓക്സിജൻ പുറത്തുവിടാൻ ആഗിരണം ചെയ്യുന്ന പ്രധാന വാതകം ഏതാണ്?", answers: ["CARBON DIOXIDE", "CO2", "കാർബൺ ഡയോക്സൈഡ്"], explanation: "Carbon Dioxide ആഗിരണം ചെയ്താണ് ചെടികൾ ഓക്സിജൻ പുറത്തുവിടുന്നത്." },
  { category: "Sports", prompt: "ക്രിക്കറ്റിൽ ഒരു ഓവറിൽ സാധാരണയായി എത്ര നിയമപരമായ പന്തുകളുണ്ട്?", answers: ["6", "ആറ്"], explanation: "ഒരു ഓവറിൽ 6 നിയമപരമായ പന്തുകളാണുള്ളത്." },
  { category: "GK", prompt: "കമ്പ്യൂട്ടറിന്റെ 'Brain' എന്ന് സാധാരണയായി വിളിക്കുന്നത് ഏതിനെയാണ്?", answers: ["CPU"], explanation: "Central Processing Unit (CPU) ആണ് കമ്പ്യൂട്ടറിന്റെ പ്രധാന പ്രോസസ്സിംഗ് യൂണിറ്റ്." },
  { category: "Math", prompt: "9² (9 square) എത്രയാണ്?", answers: ["81", "എൺപത്തിയൊന്ന്"], explanation: "9 × 9 = 81 ആണ്." },
  { category: "GK", prompt: "ഇന്ത്യൻ ഭരണഘടന നിലവിൽ വന്ന വർഷം ഏതാണ്?", answers: ["1950"], explanation: "1950 ജനുവരി 26-നാണ് ഇന്ത്യൻ ഭരണഘടന നിലവിൽ വന്നത്." }
];

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function getEl(id) {
  return document.getElementById(id);
}

const UI = {
  accessScreen: getEl("access-screen"),
  playerName: /** @type {HTMLInputElement | null} */ (getEl("player-name")),
  accessCode: /** @type {HTMLInputElement | null} */ (getEl("access-code")),
  startBtn: /** @type {HTMLButtonElement | null} */ (getEl("start-btn")),
  loginStatus: getEl("login-status"),
  continueCodeInput: /** @type {HTMLInputElement | null} */ (getEl("continue-code-input")),
  continueBtn: /** @type {HTMLButtonElement | null} */ (getEl("continue-btn")),
  continueStatus: getEl("continue-status"),

  quizScreen: getEl("quiz-screen"),
  hudPlayer: getEl("hud-player"),
  hudQnum: getEl("hud-qnum"),
  hudScore: getEl("hud-score"),
  hudTimer: getEl("hud-timer"),
  qCategory: getEl("q-category"),
  hintBtn: /** @type {HTMLButtonElement | null} */ (getEl("hint-btn")),
  qPrompt: getEl("q-prompt"),
  choicesList: getEl("choices-list"),
  feedbackPanel: getEl("feedback-panel"),
  feedbackHeading: getEl("feedback-heading"),
  feedbackText: getEl("feedback-text"),
  nextBtn: /** @type {HTMLButtonElement | null} */ (getEl("next-btn")),

  resultScreen: getEl("result-screen"),
  resultSummary: getEl("result-summary"),
  resultSyncStatus: getEl("result-sync-status"),
  restartBtn: /** @type {HTMLButtonElement | null} */ (getEl("restart-btn"))
};

/** @type {HTMLInputElement | null} */
let answerInputEl = null;
/** @type {HTMLButtonElement | null} */
let submitAnswerBtnEl = null;

function ensureTypingUi() {
  if (!UI.choicesList) return;
  UI.choicesList.style.display = "block";
  if (answerInputEl && submitAnswerBtnEl) return;

  UI.choicesList.innerHTML = `
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <input id="typed-answer-input" type="text" placeholder="ഉത്തരം ഇവിടെ ടൈപ്പ് ചെയ്യുക..." autocomplete="off"
        style="flex:1;min-width:200px;min-height:48px;padding:10px 14px;border-radius:12px;border:1px solid #38bdf8;background:#090e1a;color:#fff;font-size:16px;outline:none;" />
      <button id="typed-submit-btn" type="button" class="btn secondary"
        style="min-height:48px;padding:10px 20px;background:#0284c7;color:#fff;border:none;">Submit</button>
    </div>
  `;

  answerInputEl = /** @type {HTMLInputElement | null} */ (getEl("typed-answer-input"));
  submitAnswerBtnEl = /** @type {HTMLButtonElement | null} */ (getEl("typed-submit-btn"));

  if (submitAnswerBtnEl) {
    submitAnswerBtnEl.addEventListener("click", () => {
      handleTypedSubmit();
    });
  }
  if (answerInputEl) {
    answerInputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTypedSubmit();
      }
    });
  }
}

/**
 * @template T
 * @param {T[]} list
 * @returns {T[]}
 */
function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

/** @type {{ active: boolean, sessionId: string, playerName: string, accessCode: string, deck: TypedQuizQuestion[], index: number, score: number, correctCount: number, hintsLeft: number, timeLeft: number, totalElapsed: number, answered: boolean }} */
let state = {
  active: false,
  sessionId: "",
  playerName: "",
  accessCode: "",
  deck: [],
  index: 0,
  score: 0,
  correctCount: 0,
  hintsLeft: STARTING_HINTS,
  timeLeft: SECONDS_PER_QUESTION,
  totalElapsed: 0,
  answered: false
};

let lastFrameMs = performance.now();

/**
 * @param {"ACCESS" | "QUIZ" | "RESULT"} name
 */
function showView(name) {
  if (UI.accessScreen) UI.accessScreen.style.display = name === "ACCESS" ? "flex" : "none";
  if (UI.quizScreen) UI.quizScreen.style.display = name === "QUIZ" ? "flex" : "none";
  if (UI.resultScreen) UI.resultScreen.style.display = name === "RESULT" ? "flex" : "none";
}

function renderHud() {
  const total = state.deck.length || QUIZ_QUESTIONS.length;
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${state.playerName}`;
  if (UI.hudQnum) UI.hudQnum.textContent = `Question: ${Math.min(state.index + 1, total)} / ${total}`;
  if (UI.hudScore) UI.hudScore.textContent = `Score: ${state.score}`;
  if (UI.hudTimer) UI.hudTimer.textContent = `Time: ${Math.max(0, state.timeLeft).toFixed(1)}s`;
  if (UI.hintBtn) {
    UI.hintBtn.textContent = `Hint (${state.hintsLeft} left)`;
    UI.hintBtn.disabled = state.answered || state.hintsLeft <= 0;
  }
}

/**
 * @param {boolean} finished
 */
async function syncProgress(finished) {
  if (!state.sessionId) return;
  try {
    await fetch(ENDPOINTS.progress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: state.sessionId,
        doorIndex: state.index,
        elapsedSeconds: Number(state.totalElapsed.toFixed(1)),
        finished
      })
    });
  } catch (_) {}
}

async function finishQuiz() {
  state.active = false;
  showView("RESULT");
  const total = state.deck.length;
  if (UI.resultSummary) {
    UI.resultSummary.textContent =
      `${state.playerName}, നിങ്ങൾ ${total}-ൽ ${state.correctCount} ചോദ്യങ്ങൾക്ക് ശരി ഉത്തരം നൽകി. സ്കോർ: ${state.score} | സമയം: ${state.totalElapsed.toFixed(1)}s`;
  }
  if (UI.resultSyncStatus) UI.resultSyncStatus.textContent = "ഫലം സേവ് ചെയ്യുന്നു...";
  await syncProgress(true);
  if (UI.resultSyncStatus) UI.resultSyncStatus.textContent = "ഫലം രേഖപ്പെടുത്തി.";
}

function normalizeText(val) {
  return String(val || "").trim().toUpperCase().replace(/\s+/g, " ");
}

/**
 * @param {boolean} isTimeout
 */
function evaluateTypedAnswer(isTimeout) {
  if (!state.active || state.answered) return;
  state.answered = true;

  if (answerInputEl) answerInputEl.disabled = true;
  if (submitAnswerBtnEl) submitAnswerBtnEl.disabled = true;

  const q = state.deck[state.index];
  if (!q) return;

  const userTyped = normalizeText(answerInputEl ? answerInputEl.value : "");
  const accepted = q.answers.map((a) => normalizeText(a));
  const isCorrect = !isTimeout && userTyped.length > 0 && accepted.includes(userTyped);

  if (isCorrect) {
    state.correctCount += 1;
    state.score += POINTS_PER_CORRECT + Math.round(state.timeLeft * 2);
    if (UI.feedbackHeading) {
      UI.feedbackHeading.textContent = "ശരി ഉത്തരം!";
      UI.feedbackHeading.style.color = "#4ade80";
    }
  } else if (isTimeout) {
    if (UI.feedbackHeading) {
      UI.feedbackHeading.textContent = "സമയം കഴിഞ്ഞു (Timeout)";
      UI.feedbackHeading.style.color = "#f87171";
    }
  } else {
    if (UI.feedbackHeading) {
      UI.feedbackHeading.textContent = `തെറ്റായ ഉത്തരം — ശരി ഉത്തരം: ${q.answers[0]}`;
      UI.feedbackHeading.style.color = "#f87171";
    }
  }

  if (UI.feedbackText) UI.feedbackText.textContent = q.explanation;
  if (UI.nextBtn) {
    UI.nextBtn.textContent = state.index + 1 >= state.deck.length ? "ഫലം കാണുക" : "അടുത്ത ചോദ്യം";
  }
  if (UI.feedbackPanel) UI.feedbackPanel.style.display = "block";
  renderHud();
}

function handleTypedSubmit() {
  evaluateTypedAnswer(false);
}

function handleHint() {
  if (!state.active || state.answered || state.hintsLeft <= 0) return;
  const q = state.deck[state.index];
  if (!q) return;
  const primaryAns = q.answers[0] || "";
  const firstChar = primaryAns.slice(0, 1);
  const len = primaryAns.length;

  state.hintsLeft -= 1;
  if (UI.feedbackPanel) {
    UI.feedbackPanel.style.display = "block";
    if (UI.feedbackHeading) {
      UI.feedbackHeading.textContent = `Hint: തുടക്കം "${firstChar}" (${len} അക്ഷരങ്ങൾ/അക്കങ്ങൾ)`;
      UI.feedbackHeading.style.color = "#fde047";
    }
    if (UI.feedbackText) UI.feedbackText.textContent = "";
    if (UI.nextBtn) UI.nextBtn.style.display = "none";
  }
  renderHud();
}

function loadQuestion() {
  const q = state.deck[state.index];
  if (!q) {
    void finishQuiz();
    return;
  }

  state.answered = false;
  state.timeLeft = SECONDS_PER_QUESTION;

  ensureTypingUi();
  if (answerInputEl) {
    answerInputEl.value = "";
    answerInputEl.disabled = false;
    setTimeout(() => answerInputEl?.focus(), 30);
  }
  if (submitAnswerBtnEl) submitAnswerBtnEl.disabled = false;

  if (UI.qCategory) UI.qCategory.textContent = q.category;
  if (UI.qPrompt) UI.qPrompt.textContent = q.prompt;
  if (UI.feedbackPanel) UI.feedbackPanel.style.display = "none";
  if (UI.nextBtn) UI.nextBtn.style.display = "block";

  renderHud();
}

/**
 * @param {{ sessionId: string, playerName: string, accessCode: string }} params
 */
function beginQuizSession(params) {
  state = {
    active: true,
    sessionId: params.sessionId,
    playerName: params.playerName,
    accessCode: params.accessCode,
    deck: shuffle(QUIZ_QUESTIONS).slice(0, 25),
    index: 0,
    score: 0,
    correctCount: 0,
    hintsLeft: STARTING_HINTS,
    timeLeft: SECONDS_PER_QUESTION,
    totalElapsed: 0,
    answered: false
  };
  showView("QUIZ");
  loadQuestion();
}

if (UI.startBtn) {
  UI.startBtn.addEventListener("click", async () => {
    const playerName = String(UI.playerName?.value || "").trim();
    const code = String(UI.accessCode?.value || "").trim().toUpperCase();
    if (!playerName) {
      if (UI.loginStatus) UI.loginStatus.textContent = "ദയവായി പേര് നൽകുക.";
      return;
    }
    if (!code) {
      if (UI.loginStatus) UI.loginStatus.textContent = "ദയവായി ആക്സസ് കോഡ് നൽകുക.";
      return;
    }

    if (UI.startBtn) UI.startBtn.disabled = true;
    if (UI.loginStatus) UI.loginStatus.textContent = "പരിശോധിക്കുന്നു...";
    try {
      const res = await fetch(ENDPOINTS.verify, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, playerName })
      });
      const data = await res.json();
      if (UI.startBtn) UI.startBtn.disabled = false;

      if (!data || !data.valid) {
        if (UI.loginStatus) {
          UI.loginStatus.textContent =
            data?.reason === "ALREADY_USED" ? "ഈ കോഡ് ഇതിനകം ഉപയോഗിച്ചു കഴിഞ്ഞു." : "ആക്സസ് കോഡ് ശരിയല്ല.";
        }
        return;
      }

      if (UI.loginStatus) UI.loginStatus.textContent = "";
      beginQuizSession({ sessionId: String(data.sessionId || ""), playerName, accessCode: code });
    } catch (_) {
      if (UI.startBtn) UI.startBtn.disabled = false;
      if (UI.loginStatus) UI.loginStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
    }
  });
}

if (UI.continueBtn) {
  UI.continueBtn.addEventListener("click", async () => {
    const code = String(UI.continueCodeInput?.value || "").trim().toUpperCase();
    if (!code) {
      if (UI.continueStatus) UI.continueStatus.textContent = "ആക്സസ് കോഡ് നൽകുക.";
      return;
    }
    if (UI.continueBtn) UI.continueBtn.disabled = true;
    if (UI.continueStatus) UI.continueStatus.textContent = "പരിശോധിക്കുന്നു...";
    try {
      const res = await fetch(ENDPOINTS.continueCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (UI.continueBtn) UI.continueBtn.disabled = false;

      if (!data || !data.valid) {
        if (UI.continueStatus) UI.continueStatus.textContent = "ഈ കോഡ് ഉപയോഗിച്ച് തുടരാൻ കഴിഞ്ഞില്ല.";
        return;
      }

      const typedName = String(UI.playerName?.value || "").trim();
      if (UI.continueStatus) UI.continueStatus.textContent = "";
      beginQuizSession({
        sessionId: String(data.sessionId || ""),
        playerName: typedName || String(data.playerName || "Player"),
        accessCode: code
      });
    } catch (_) {
      if (UI.continueBtn) UI.continueBtn.disabled = false;
      if (UI.continueStatus) UI.continueStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
    }
  });
}

if (UI.hintBtn) UI.hintBtn.addEventListener("click", handleHint);
if (UI.nextBtn) {
  UI.nextBtn.addEventListener("click", async () => {
    state.index += 1;
    await syncProgress(false);
    loadQuestion();
  });
}
if (UI.restartBtn) {
  UI.restartBtn.addEventListener("click", () => {
    showView("ACCESS");
  });
}

/**
 * @param {number} now
 */
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min((now - lastFrameMs) / 1000, 0.1);
  lastFrameMs = now;

  if (state.active && !state.answered) {
    state.totalElapsed += dt;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    renderHud();
    if (state.timeLeft <= 0) {
      evaluateTypedAnswer(true);
    }
  }
}

requestAnimationFrame(tick);