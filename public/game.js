/** @typedef {{ id: string, category: string, prompt: string, answers: string[], explanation: string }} TypedQuizQuestion */

const ENDPOINTS = {
  verify: "/api/verify-code",
  continueCode: "/api/continue-code",
  resume: "/api/resume-session",
  progress: "/api/save-progress",
  leaderboard: "/api/leaderboard"
};

/** @type {TypedQuizQuestion[]} */
const QUIZ_QUESTIONS = [
  { id: "q01", category: "Science", prompt: "ചെടികൾ സൂര്യപ്രകാശത്തിന്റെ സഹായത്തോടെ ഭക്ഷണം ഉണ്ടാക്കുന്ന പ്രക്രിയ ഏതാണ്?", answers: ["PHOTOSYNTHESIS", "പ്രകാശസംശ്ലേഷണം"], explanation: "സൂര്യപ്രകാശം ഉപയോഗിച്ച് ചെടികൾ ഭക്ഷണം നിർമ്മിക്കുന്നതിനെ Photosynthesis എന്ന് വിളിക്കുന്നു." },
  { id: "q02", category: "Geography", prompt: "ഭൂമിയിലെ ഏറ്റവും വലിയ സമുദ്രം ഏതാണ്?", answers: ["PACIFIC OCEAN", "PACIFIC", "പസഫിക് സമുദ്രം"], explanation: "Pacific Ocean ആണ് ഏറ്റവും വലിയ സമുദ്രം." },
  { id: "q03", category: "GK", prompt: "കേരളത്തിൽ ആകെ എത്ര ജില്ലകളുണ്ട്?", answers: ["14", "പതിനാല്"], explanation: "കേരളത്തിൽ ആകെ 14 ജില്ലകളാണുള്ളത്." },
  { id: "q04", category: "Sports", prompt: "ഒരു സാധാരണ ഫുട്ബോൾ ടീമിൽ എത്ര കളിക്കാർ കളിക്കുന്നു?", answers: ["11", "പതിനൊന്ന്"], explanation: "ഒരു ടീമിൽ 11 കളിക്കാരാണ് ഉണ്ടാകുക." },
  { id: "q05", category: "Science", prompt: "ജലത്തിന്റെ രാസസൂത്രം (Chemical formula) ഏതാണ്?", answers: ["H2O", "H₂O"], explanation: "രണ്ട് ഹൈഡ്രജൻ ആറ്റവും ഒരു ഓക്സിജൻ ആറ്റവും ചേർന്നതാണ് H2O." },
  { id: "q06", category: "Geography", prompt: "ഇന്ത്യയുടെ തലസ്ഥാന നഗരം ഏതാണ്?", answers: ["NEW DELHI", "DELHI", "ന്യൂഡൽഹി", "ന്യൂഡെൽഹി"], explanation: "New Delhi ആണ് ഇന്ത്യയുടെ തലസ്ഥാനം." },
  { id: "q07", category: "Math", prompt: "15 × 4 എത്രയാണ്?", answers: ["60", "അറുപത്"], explanation: "15-നെ 4 കൊണ്ട് ഗുണിച്ചാൽ 60 ലഭിക്കും." },
  { id: "q08", category: "History", prompt: "ഇന്ത്യയ്ക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത് ഏത് വർഷമാണ്?", answers: ["1947"], explanation: "1947 ഓഗസ്റ്റ് 15-നാണ് ഇന്ത്യയ്ക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത്." },
  { id: "q09", category: "Nature", prompt: "ഏറ്റവും വേഗത്തിൽ ഓടുന്ന കരയിലെ ജീവി ഏതാണ്?", answers: ["CHEETAH", "ചീറ്റ", "ചീറ്റപ്പുലി"], explanation: "Cheetah ആണ് കരയിലെ ഏറ്റവും വേഗതയുള്ള ജീവി." },
  { id: "q10", category: "Culture", prompt: "കേരളത്തിലെ പ്രശസ്തമായ വിളവെടുപ്പ് ഉത്സവം ഏതാണ്?", answers: ["ONAM", "ഓണം"], explanation: "കേരളത്തിന്റെ ദേശീയ ഉത്സവവും വിളവെടുപ്പ് ഉത്സവവുമാണ് ഓണം." },
  { id: "q11", category: "Science", prompt: "ശബ്ദം ശൂന്യതയിലൂടെ സഞ്ചരിക്കുമോ? (അതെ / ഇല്ല)", answers: ["ഇല്ല", "NO", "ILLA"], explanation: "ശബ്ദത്തിന് സഞ്ചരിക്കാൻ വായു പോലുള്ള മാധ്യമം ആവശ്യമാണ്." },
  { id: "q12", category: "Geography", prompt: "ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ പർവതശിഖരം ഏതാണ്?", answers: ["MOUNT EVEREST", "EVEREST", "എവറസ്റ്റ്"], explanation: "Mount Everest ആണ് ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടി." },
  { id: "q13", category: "Math", prompt: "144-ന്റെ വർഗ്ഗമൂലം (Square root) എത്രയാണ്?", answers: ["12", "പന്ത്രണ്ട്"], explanation: "12 × 12 = 144 ആയതിനാൽ വർഗ്ഗമൂലം 12 ആണ്." },
  { id: "q14", category: "Sports", prompt: "ഒളിമ്പിക് പതാകയിൽ എത്ര വളയങ്ങളുണ്ട്?", answers: ["5", "അഞ്ച്"], explanation: "ഒളിമ്പിക് പതാകയിൽ പരസ്പരം ബന്ധിപ്പിച്ച 5 വളയങ്ങളാണുള്ളത്." },
  { id: "q15", category: "Science", prompt: "സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏതാണ്?", answers: ["JUPITER", "വ്യാഴം"], explanation: "Jupiter ആണ് സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം." },
  { id: "q16", category: "Geography", prompt: "ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ കണക്കാക്കപ്പെടുന്നത് ഏതാണ്?", answers: ["NILE", "നൈൽ"], explanation: "Nile നദിയാണ് ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ പറയപ്പെടുന്നത്." },
  { id: "q17", category: "Culture", prompt: "കഥകളി ഏത് സംസ്ഥാനത്തിന്റെ പരമ്പരാഗത കലാരൂപമാണ്?", answers: ["KERALA", "കേരളം"], explanation: "കേരളത്തിന്റെ പരമ്പരാഗത ശാസ്ത്രീയ കലാരൂപമാണ് കഥകളി." },
  { id: "q18", category: "Math", prompt: "25% of 200 എത്രയാണ്?", answers: ["50", "അൻപത്"], explanation: "200-ന്റെ 25% (നാലിലൊന്ന്) 50 ആണ്." },
  { id: "q19", category: "Science", prompt: "മനുഷ്യശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം ഏതാണ്?", answers: ["SKIN", "ത്വക്ക്", "ചർമ്മം"], explanation: "Skin (ത്വക്ക്) ആണ് മനുഷ്യശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം." },
  { id: "q20", category: "History", prompt: "ചന്ദ്രനിൽ ആദ്യം കാലുകുത്തിയ മനുഷ്യൻ ആര്?", answers: ["NEIL ARMSTRONG", "ARMSTRONG", "നീൽ ആംസ്ട്രോംഗ്"], explanation: "1969-ൽ അപ്പോളോ 11 ദൗത്യത്തിലാണ് Neil Armstrong ചന്ദ്രനിൽ ഇറങ്ങിയത്." },
  { id: "q21", category: "Nature", prompt: "മരങ്ങൾ ഓക്സിജൻ പുറത്തുവിടാൻ ആഗിരണം ചെയ്യുന്ന പ്രധാന വാതകം ഏതാണ്?", answers: ["CARBON DIOXIDE", "CO2", "കാർബൺ ഡയോക്സൈഡ്"], explanation: "Carbon Dioxide ആഗിരണം ചെയ്താണ് ചെടികൾ ഓക്സിജൻ പുറത്തുവിടുന്നത്." },
  { id: "q22", category: "Sports", prompt: "ക്രിക്കറ്റിൽ ഒരു ഓവറിൽ സാധാരണയായി എത്ര നിയമപരമായ പന്തുകളുണ്ട്?", answers: ["6", "ആറ്"], explanation: "ഒരു ഓവറിൽ 6 നിയമപരമായ പന്തുകളാണുള്ളത്." },
  { id: "q23", category: "GK", prompt: "കമ്പ്യൂട്ടറിന്റെ 'Brain' എന്ന് സാധാരണയായി വിളിക്കുന്നത് ഏതിനെയാണ്?", answers: ["CPU"], explanation: "Central Processing Unit (CPU) ആണ് കമ്പ്യൂട്ടറിന്റെ പ്രധാന പ്രോസസ്സിംഗ് യൂണിറ്റ്." },
  { id: "q24", category: "Math", prompt: "9² (9 square) എത്രയാണ്?", answers: ["81", "എൺപത്തിയൊന്ന്"], explanation: "9 × 9 = 81 ആണ്." },
  { id: "q25", category: "GK", prompt: "ഇന്ത്യൻ ഭരണഘടന നിലവിൽ വന്ന വർഷം ഏതാണ്?", answers: ["1950"], explanation: "1950 ജനുവരി 26-നാണ് ഇന്ത്യൻ ഭരണഘടന നിലവിൽ വന്നത്." }
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
  hudAttended: getEl("hud-attended"),
  hudTimer: getEl("hud-timer"),
  hudAutosave: getEl("hud-autosave"),
  allQuestionsContainer: getEl("all-questions-container"),
  submitAllBtn: /** @type {HTMLButtonElement | null} */ (getEl("submit-all-btn")),
  submitStatus: getEl("submit-status"),

  resultScreen: getEl("result-screen"),
  resultSummary: getEl("result-summary"),
  resultSubmitTime: getEl("result-submit-time"),
  reviewList: getEl("review-list"),
  backHomeBtn: /** @type {HTMLButtonElement | null} */ (getEl("back-home-btn")),

  refreshLbBtn: /** @type {HTMLButtonElement | null} */ (getEl("refresh-lb-btn")),
  leaderboardList: getEl("leaderboard-list")
};

/** @type {{ active: boolean, sessionId: string, playerName: string, accessCode: string, deck: TypedQuizQuestion[], userAnswers: Record<string, string>, totalElapsed: number }} */
let state = {
  active: false,
  sessionId: "",
  playerName: "",
  accessCode: "",
  deck: [],
  userAnswers: {},
  totalElapsed: 0
};

let lastFrameMs = performance.now();
/** @type {number | null} */
let autoSaveTimer = null;

/**
 * @param {TypedQuizQuestion[]} list
 * @param {string} seedStr
 * @returns {TypedQuizQuestion[]}
 */
function deterministicShuffleForUser(list, seedStr) {
  let seed = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    seed ^= seedStr.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const nextRand = () => {
    seed += 0x6D2B79F5;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/**
 * @param {"ACCESS" | "QUIZ" | "RESULT"} name
 */
function showView(name) {
  if (UI.accessScreen) UI.accessScreen.style.display = name === "ACCESS" ? "block" : "none";
  if (UI.quizScreen) UI.quizScreen.style.display = name === "QUIZ" ? "block" : "none";
  if (UI.resultScreen) UI.resultScreen.style.display = name === "RESULT" ? "block" : "none";
}

/**
 * @param {string} val
 */
function normalizeText(val) {
  return String(val || "").trim().toUpperCase().replace(/\s+/g, " ");
}

function getAttendedCount() {
  let count = 0;
  for (const q of state.deck) {
    if (String(state.userAnswers[q.id] || "").trim().length > 0) {
      count += 1;
    }
  }
  return count;
}

function calculateCurrentScore() {
  let score = 0;
  for (const q of state.deck) {
    const typed = normalizeText(state.userAnswers[q.id] || "");
    if (!typed) continue;
    const accepted = q.answers.map((a) => normalizeText(a));
    if (accepted.includes(typed)) {
      score += 1;
    }
  }
  return score;
}

function renderTopHud() {
  if (UI.hudPlayer) UI.hudPlayer.textContent = `Player: ${state.playerName}`;
  if (UI.hudAttended) UI.hudAttended.textContent = `Attended: ${getAttendedCount()} / ${state.deck.length}`;
  if (UI.hudTimer) UI.hudTimer.textContent = `Time: ${state.totalElapsed.toFixed(1)}s`;
}

function saveLocalDraft() {
  if (!state.accessCode) return;
  try {
    localStorage.setItem(
      `quiz_draft_${state.accessCode}`,
      JSON.stringify({
        sessionId: state.sessionId,
        playerName: state.playerName,
        accessCode: state.accessCode,
        userAnswers: state.userAnswers,
        totalElapsed: state.totalElapsed
      })
    );
  } catch (_) {}
}

/**
 * @param {string} code
 */
function loadLocalDraft(code) {
  try {
    const raw = localStorage.getItem(`quiz_draft_${code}`);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/**
 * @param {boolean} finished
 * @param {string} submitTimeStr
 */
async function syncToServer(finished, submitTimeStr = "") {
  if (!state.sessionId) return;
  const currentScore = calculateCurrentScore();
  const attendedCount = getAttendedCount();

  if (UI.hudAutosave && !finished) UI.hudAutosave.textContent = "Saving...";
  try {
    await fetch(ENDPOINTS.progress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: state.sessionId,
        doorIndex: attendedCount,
        elapsedSeconds: Number(state.totalElapsed.toFixed(1)),
        finished,
        score: currentScore,
        submitTime: submitTimeStr,
        savedAnswersJson: JSON.stringify(state.userAnswers)
      })
    });
    if (UI.hudAutosave && !finished) UI.hudAutosave.textContent = "Saved ✓";
  } catch (_) {
    if (UI.hudAutosave && !finished) UI.hudAutosave.textContent = "Local Saved";
  }
}

function scheduleAutoSave() {
  saveLocalDraft();
  if (UI.hudAutosave) UI.hudAutosave.textContent = "Saving...";
  if (autoSaveTimer !== null) {
    window.clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = window.setTimeout(() => {
    void syncToServer(false);
  }, 600);
}

function renderAll25Questions() {
  if (!UI.allQuestionsContainer) return;
  UI.allQuestionsContainer.innerHTML = "";

  state.deck.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "q-item-card";

    const head = document.createElement("div");
    head.className = "q-item-head";
    head.innerHTML = `<span>ചോദ്യം ${idx + 1} / ${state.deck.length}</span><span>${q.category}</span>`;

    const title = document.createElement("p");
    title.className = "q-item-title";
    title.textContent = q.prompt;

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "ഉത്തരം ടൈപ്പ് ചെയ്യുക (ഒഴിച്ചിട്ടാൽ 0 പോയിന്റ്)";
    input.autocomplete = "off";
    input.value = state.userAnswers[q.id] || "";

    input.addEventListener("input", () => {
      state.userAnswers[q.id] = input.value;
      renderTopHud();
      scheduleAutoSave();
    });

    card.appendChild(head);
    card.appendChild(title);
    card.appendChild(input);
    UI.allQuestionsContainer?.appendChild(card);
  });

  renderTopHud();
}

/**
 * @param {{ sessionId: string, playerName: string, accessCode: string, savedAnswers?: Record<string, string>, elapsedSeconds?: number }} params
 */
function startOrResumeQuiz(params) {
  const code = params.accessCode.trim().toUpperCase();
  const localDraft = loadLocalDraft(code);
  const mergedAnswers = Object.assign(
    {},
    localDraft && localDraft.userAnswers ? localDraft.userAnswers : {},
    params.savedAnswers || {}
  );
  const startElapsed = Math.max(
    Number(params.elapsedSeconds || 0),
    Number(localDraft && localDraft.totalElapsed ? localDraft.totalElapsed : 0)
  );

  state = {
    active: true,
    sessionId: params.sessionId,
    playerName: params.playerName,
    accessCode: code,
    deck: deterministicShuffleForUser(QUIZ_QUESTIONS, code || params.sessionId),
    userAnswers: mergedAnswers,
    totalElapsed: startElapsed
  };

  try {
    history.replaceState(null, "", "#session=" + encodeURIComponent(params.sessionId));
  } catch (_) {}

  showView("QUIZ");
  renderAll25Questions();
  void syncToServer(false);
}

async function handleSubmitAll() {
  if (!state.active) return;

  if (UI.submitAllBtn) UI.submitAllBtn.disabled = true;
  if (UI.submitStatus) UI.submitStatus.textContent = "ഉത്തരങ്ങൾ പരിശോധിക്കുകയും Google Sheet-ലേക്ക് അയക്കുകയും ചെയ്യുന്നു...";

  state.active = false;
  const finalScore = calculateCurrentScore();
  const totalQ = state.deck.length;
  const submitTimeFormatted = new Date().toLocaleString("en-IN", { hour12: true });

  await syncToServer(true, submitTimeFormatted);
  try {
    localStorage.removeItem(`quiz_draft_${state.accessCode}`);
  } catch (_) {}

  if (UI.submitAllBtn) UI.submitAllBtn.disabled = false;
  if (UI.submitStatus) UI.submitStatus.textContent = "";

  showView("RESULT");
  if (UI.resultSummary) {
    UI.resultSummary.textContent = `${state.playerName}, നിങ്ങളുടെ സ്കോർ: ${finalScore} / ${totalQ} (ആകെ സമയം: ${state.totalElapsed.toFixed(1)}s)`;
  }
  if (UI.resultSubmitTime) {
    UI.resultSubmitTime.textContent = `Submit ചെയ്ത സമയം: ${submitTimeFormatted}`;
  }

  if (UI.reviewList) {
    UI.reviewList.innerHTML = "";
    state.deck.forEach((q, idx) => {
      const rawUser = String(state.userAnswers[q.id] || "").trim();
      const normUser = normalizeText(rawUser);
      const isUnattended = normUser.length === 0;
      const isCorrect = !isUnattended && q.answers.map((a) => normalizeText(a)).includes(normUser);
      const pts = isCorrect ? 1 : 0;

      const item = document.createElement("div");
      item.className = "q-item-card";
      item.innerHTML = `
        <div class="q-item-head">
          <span>ചോദ്യം ${idx + 1}</span>
          <span style="color:${isCorrect ? "#4ade80" : "#f87171"}">${pts} Point (${isUnattended ? "Unattended" : isCorrect ? "Correct" : "Wrong"})</span>
        </div>
        <p class="q-item-title">${q.prompt}</p>
        <p class="muted" style="margin:0;">നിങ്ങളുടെ ഉത്തരം: <strong>${rawUser || "എഴുതിയിട്ടില്ല"}</strong> | ശരി ഉത്തരം: <strong>${q.answers[0]}</strong></p>
      `;
      UI.reviewList?.appendChild(item);
    });
  }

  await refreshLeaderboard();
}

async function refreshLeaderboard() {
  if (!UI.leaderboardList) return;
  try {
    const res = await fetch(ENDPOINTS.leaderboard);
    const data = await res.json();
    const entries = Array.isArray(data.entries) ? data.entries : [];

    if (entries.length === 0) {
      UI.leaderboardList.innerHTML = `<p class="muted" style="margin:0;">ഇതുവരെ ആരും ക്വിസ് പൂർത്തിയാക്കിയിട്ടില്ല.</p>`;
      return;
    }

    UI.leaderboardList.innerHTML = "";
    entries.forEach((entry, idx) => {
      const row = document.createElement("div");
      row.className = "lb-row";

      const rank = document.createElement("span");
      rank.className = "lb-rank";
      rank.textContent = `#${idx + 1}`;

      const name = document.createElement("span");
      name.className = "lb-name";
      name.textContent = String(entry.playerName || "Player");

      const meta = document.createElement("div");
      meta.className = "lb-meta";
      const statusTag = entry.finished ? `${Number(entry.elapsedSeconds || 0).toFixed(1)}s` : "In Progress";
      meta.innerHTML = `<span class="lb-score">${Number(entry.score || 0)} / 25</span><span>${statusTag}</span>`;

      row.appendChild(rank);
      row.appendChild(name);
      row.appendChild(meta);
      UI.leaderboardList?.appendChild(row);
    });
  } catch (_) {
    UI.leaderboardList.innerHTML = `<p class="muted" style="margin:0;">Leaderboard ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല.</p>`;
  }
}

if (UI.startBtn) {
  UI.startBtn.addEventListener("click", async () => {
    const playerName = String(UI.playerName?.value || "").trim();
    const code = String(UI.accessCode?.value || "").trim().toUpperCase();
    if (!playerName) {
      if (UI.loginStatus) UI.loginStatus.textContent = "ദയവായി നിങ്ങളുടെ പേര് നൽകുക.";
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
          if (data?.reason === "ALREADY_USED") {
            UI.loginStatus.textContent = "ഈ കോഡ് ഉപയോഗിച്ചു കഴിഞ്ഞു — താഴെയുള്ള Continue വഴി തുടരാം.";
          } else if (data?.reason === "MISSING_APPS_SCRIPT_URL") {
            UI.loginStatus.textContent = "Render Environment-ൽ APPS_SCRIPT_URL സെറ്റ് ചെയ്തിട്ടില്ല.";
          } else {
            UI.loginStatus.textContent = "തെറ്റായ ആക്സസ് കോഡ്.";
          }
        }
        return;
      }

      if (UI.loginStatus) UI.loginStatus.textContent = "";
      startOrResumeQuiz({
        sessionId: String(data.sessionId || ""),
        playerName,
        accessCode: code,
        savedAnswers: {},
        elapsedSeconds: 0
      });
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
    if (UI.continueStatus) UI.continueStatus.textContent = "സേവ് ചെയ്ത ഉത്തരങ്ങൾ എടുക്കുന്നു...";
    try {
      const res = await fetch(ENDPOINTS.continueCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (UI.continueBtn) UI.continueBtn.disabled = false;

      if (!data || !data.valid) {
        if (UI.continueStatus) {
          UI.continueStatus.textContent =
            data?.reason === "ALREADY_FINISHED"
              ? "ഈ കോഡ് ഉപയോഗിച്ച് ക്വിസ് ഇതിനകം Submit ചെയ്തു കഴിഞ്ഞു."
              : "ഈ കോഡ് ഉപയോഗിച്ച് തുടരാൻ കഴിഞ്ഞില്ല.";
        }
        return;
      }

      let parsedAnswers = {};
      try {
        parsedAnswers = data.savedAnswersJson ? JSON.parse(String(data.savedAnswersJson)) : {};
      } catch (_) {}

      const typedName = String(UI.playerName?.value || "").trim();
      if (UI.continueStatus) UI.continueStatus.textContent = "";
      startOrResumeQuiz({
        sessionId: String(data.sessionId || ""),
        playerName: typedName || String(data.playerName || "Player"),
        accessCode: code,
        savedAnswers: parsedAnswers,
        elapsedSeconds: Number(data.elapsedSeconds || 0)
      });
    } catch (_) {
      if (UI.continueBtn) UI.continueBtn.disabled = false;
      if (UI.continueStatus) UI.continueStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
    }
  });
}

if (UI.submitAllBtn) {
  UI.submitAllBtn.addEventListener("click", () => {
    void handleSubmitAll();
  });
}

if (UI.backHomeBtn) {
  UI.backHomeBtn.addEventListener("click", () => {
    showView("ACCESS");
    void refreshLeaderboard();
  });
}

if (UI.refreshLbBtn) {
  UI.refreshLbBtn.addEventListener("click", () => {
    void refreshLeaderboard();
  });
}

window.addEventListener("beforeunload", () => {
  if (state.active) {
    saveLocalDraft();
    void syncToServer(false);
  }
});

async function checkHashResumeOnLoad() {
  const m = (window.location.hash || "").match(/session=([^&]+)/);
  if (!m || !m[1]) return;
  const sessionId = decodeURIComponent(m[1]);
  try {
    const res = await fetch(ENDPOINTS.resume, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId })
    });
    const data = await res.json();
    if (data && data.valid) {
      let parsedAnswers = {};
      try {
        parsedAnswers = data.savedAnswersJson ? JSON.parse(String(data.savedAnswersJson)) : {};
      } catch (_) {}
      startOrResumeQuiz({
        sessionId: String(data.sessionId || sessionId),
        playerName: String(data.playerName || "Player"),
        accessCode: String(data.code || ""),
        savedAnswers: parsedAnswers,
        elapsedSeconds: Number(data.elapsedSeconds || 0)
      });
    }
  } catch (_) {}
}

/**
 * @param {number} now
 */
function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min((now - lastFrameMs) / 1000, 0.1);
  lastFrameMs = now;

  if (state.active) {
    state.totalElapsed += dt;
    if (UI.hudTimer) UI.hudTimer.textContent = `Time: ${state.totalElapsed.toFixed(1)}s`;
  }
}

requestAnimationFrame(tick);
void refreshLeaderboard();
window.setInterval(() => {
  void refreshLeaderboard();
}, 10000);
void checkHashResumeOnLoad();