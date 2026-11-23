const SECONDS_PER_QUESTION = 20;
const POINTS_PER_CORRECT = 100;
const STARTING_HINTS = 3;

const ENDPOINTS = {
  verify: "/api/verify-code",
  continueCode: "/api/continue-code",
  resume: "/api/resume-session",
  progress: "/api/save-progress"
};

// 25 Quiz Questions
const QUIZ_QUESTIONS = [
  { category: "Science", prompt: "ചെടികൾ സൂര്യപ്രകാശത്തിന്റെ സഹായത്തോടെ ഭക്ഷണം ഉണ്ടാക്കുന്ന പ്രക്രിയ ഏതാണ്?", options: ["Photosynthesis", "Evaporation", "Filtration", "Condensation"], answerIndex: 0, explanation: "സൂര്യപ്രകാശം ഉപയോഗിച്ച് ചെടികൾ ഭക്ഷണം നിർമ്മിക്കുന്നതിനെ Photosynthesis എന്ന് വിളിക്കുന്നു." },
  { category: "Geography", prompt: "ഭൂമിയിലെ ഏറ്റവും വലിയ സമുദ്രം ഏതാണ്?", options: ["Indian Ocean", "Pacific Ocean", "Atlantic Ocean", "Arctic Ocean"], answerIndex: 1, explanation: "Pacific Ocean ആണ് ഏറ്റവും വലിയ സമുദ്രം." },
  { category: "GK", prompt: "കേരളത്തിൽ ആകെ എത്ര ജില്ലകളുണ്ട്?", options: ["12", "14", "15", "16"], answerIndex: 1, explanation: "കേരളത്തിൽ ആകെ 14 ജില്ലകളാണുള്ളത്." },
  { category: "Sports", prompt: "ഒരു സാധാരണ ഫുട്ബോൾ ടീമിൽ എത്ര കളിക്കാർ കളിക്കുന്നു?", options: ["9", "10", "11", "12"], answerIndex: 2, explanation: "ഒരു ടീമിൽ 11 കളിക്കാരാണ് ഉണ്ടാകുക." },
  { category: "Science", prompt: "ജലത്തിന്റെ രാസസൂത്രം (Chemical formula) ഏതാണ്?", options: ["CO2", "H2O", "O2", "NaCl"], answerIndex: 1, explanation: "രണ്ട് ഹൈഡ്രജൻ ആറ്റവും ഒരു ഓക്സിജൻ ആറ്റവും ചേർന്നതാണ് H2O." },
  { category: "Geography", prompt: "ഇന്ത്യയുടെ തലസ്ഥാന നഗരം ഏതാണ്?", options: ["Mumbai", "Chennai", "New Delhi", "Kolkata"], answerIndex: 2, explanation: "New Delhi ആണ് ഇന്ത്യയുടെ തലസ്ഥാനം." },
  { category: "Math", prompt: "15 × 4 എത്രയാണ്?", options: ["45", "50", "60", "75"], answerIndex: 2, explanation: "15-നെ 4 കൊണ്ട് ഗുണിച്ചാൽ 60 ലഭിക്കും." },
  { category: "History", prompt: "ഇന്ത്യയ്ക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത് ഏത് വർഷമാണ്?", options: ["1942", "1945", "1947", "1950"], answerIndex: 2, explanation: "1947 ഓഗസ്റ്റ് 15-നാണ് ഇന്ത്യയ്ക്ക് സ്വാതന്ത്ര്യം ലഭിച്ചത്." },
  { category: "Nature", prompt: "ഏറ്റവും വേഗത്തിൽ ഓടുന്ന കരയിലെ ജീവി ഏതാണ്?", options: ["Lion", "Cheetah", "Horse", "Greyhound"], answerIndex: 1, explanation: "Cheetah ആണ് കരയിലെ ഏറ്റവും വേഗതയുള്ള ജീവി." },
  { category: "Culture", prompt: "കേരളത്തിലെ പ്രശസ്തമായ വിളവെടുപ്പ് ഉത്സവം ഏതാണ്?", options: ["Vishu", "Onam", "Thrissur Pooram", "Bihu"], answerIndex: 1, explanation: "കേരളത്തിന്റെ ദേശീയ ഉത്സവവും വിളവെടുപ്പ് ഉത്സവവുമാണ് ഓണം." },
  { category: "Science", prompt: "ശബ്ദം ശൂന്യതയിലൂടെ സഞ്ചരിക്കുമോ?", options: ["അതെ", "ഇല്ല", "ചിലപ്പോൾ", "രാത്രിയിൽ മാത്രം"], answerIndex: 1, explanation: "ശബ്ദത്തിന് സഞ്ചരിക്കാൻ വായു പോലുള്ള മാധ്യമം ആവശ്യമാണ്." },
  { category: "Geography", prompt: "ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ പർവതശിഖരം ഏതാണ്?", options: ["K2", "Mount Everest", "Kangchenjunga", "Makalu"], answerIndex: 1, explanation: "Mount Everest ആണ് ലോകത്തിലെ ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടി." },
  { category: "Math", prompt: "144-ന്റെ വർഗ്ഗമൂലം (Square root) എത്രയാണ്?", options: ["10", "11", "12", "14"], answerIndex: 2, explanation: "12 × 12 = 144 ആയതിനാൽ വർഗ്ഗമൂലം 12 ആണ്." },
  { category: "Sports", prompt: "ഒളിമ്പിക് പതാകയിൽ എത്ര വളയങ്ങളുണ്ട്?", options: ["4", "5", "6", "7"], answerIndex: 1, explanation: "ഒളിമ്പിക് പതാകയിൽ പരസ്പരം ബന്ധിപ്പിച്ച 5 വളയങ്ങളാണുള്ളത്." },
  { category: "Science", prompt: "സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം ഏതാണ്?", options: ["Mars", "Saturn", "Jupiter", "Neptune"], answerIndex: 2, explanation: "Jupiter ആണ് സൗരയൂഥത്തിലെ ഏറ്റവും വലിയ ഗ്രഹം." },
  { category: "Geography", prompt: "ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ കണക്കാക്കപ്പെടുന്നത് ഏതാണ്?", options: ["Amazon", "Nile", "Ganga", "Yangtze"], answerIndex: 1, explanation: "Nile നദിയാണ് ലോകത്തിലെ ഏറ്റവും നീളം കൂടിയ നദിയായി പൊതുവെ പറയപ്പെടുന്നത്." },
  { category: "Culture", prompt: "കഥകളി ഏത് സംസ്ഥാനത്തിന്റെ പരമ്പരാഗത കലാരൂപമാണ്?", options: ["Tamil Nadu", "Karnataka", "Kerala", "Odisha"], answerIndex: 2, explanation: "കേരളത്തിന്റെ പരമ്പരാഗത ശാസ്ത്രീയ കലാരൂപമാണ് കഥകളി." },
  { category: "Math", prompt: "25% of 200 എത്രയാണ്?", options: ["25", "40", "50", "75"], answerIndex: 2, explanation: "200-ന്റെ 25% (നാലിലൊന്ന്) 50 ആണ്." },
  { category: "Science", prompt: "മനുഷ്യശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം ഏതാണ്?", options: ["Heart", "Liver", "Skin", "Brain"], answerIndex: 2, explanation: "Skin (ത്വക്ക്) ആണ് മനുഷ്യശരീരത്തിലെ ഏറ്റവും വലിയ അവയവം." },
  { category: "History", prompt: "ചന്ദ്രനിൽ ആദ്യം കാലുകുത്തിയ മനുഷ്യൻ ആര്?", options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "Rakesh Sharma"], answerIndex: 1, explanation: "1969-ൽ അപ്പോളോ 11 ദൗത്യത്തിലാണ് Neil Armstrong ചന്ദ്രനിൽ ഇറങ്ങിയത്." },
  { category: "Nature", prompt: "മരങ്ങൾ ഓക്സിജൻ പുറത്തുവിടാൻ സഹായിക്കുന്ന പ്രധാന വാതകം ഏതാണ്?", options: ["Carbon Dioxide", "Nitrogen", "Hydrogen", "Helium"], answerIndex: 0, explanation: "Carbon Dioxide ആഗിരണം ചെയ്താണ് ചെടികൾ ഓക്സിജൻ പുറത്തുവിടുന്നത്." },
  { category: "Sports", prompt: "ക്രിക്കറ്റിൽ ഒരു ഓവറിൽ സാധാരണയായി എത്ര നിയമപരമായ പന്തുകളുണ്ട്?", options: ["5", "6", "8", "10"], answerIndex: 1, explanation: "ഒരു ഓവറിൽ 6 നിയമപരമായ പന്തുകളാണുള്ളത്." },
  { category: "GK", prompt: "കമ്പ്യൂട്ടറിന്റെ 'Brain' എന്ന് സാധാരണയായി വിളിക്കുന്നത് ഏതിനെയാണ്?", options: ["RAM", "CPU", "Monitor", "Keyboard"], answerIndex: 1, explanation: "Central Processing Unit (CPU) ആണ് കമ്പ്യൂട്ടറിന്റെ പ്രധാന പ്രോസസ്സിംഗ് യൂണിറ്റ്." },
  { category: "Math", prompt: "9² (9 square) എത്രയാണ്?", options: ["18", "72", "81", "90"], answerIndex: 2, explanation: "9 × 9 = 81 ആണ്." },
  { category: "GK", prompt: "ഇന്ത്യൻ ഭരണഘടന നിലവിൽ വന്ന വർഷം ഏതാണ്?", options: ["1947", "1949", "1950", "1952"], answerIndex: 2, explanation: "1950 ജനുവരി 26-നാണ് ഇന്ത്യൻ ഭരണഘടന നിലവിൽ വന്നത്." }
];

const UI = {
  accessScreen: document.getElementById("access-screen"),
  playerName: document.getElementById("player-name"),
  accessCode: document.getElementById("access-code"),
  startBtn: document.getElementById("start-btn"),
  loginStatus: document.getElementById("login-status"),
  continueCodeInput: document.getElementById("continue-code-input"),
  continueBtn: document.getElementById("continue-btn"),
  continueStatus: document.getElementById("continue-status"),

  quizScreen: document.getElementById("quiz-screen"),
  hudPlayer: document.getElementById("hud-player"),
  hudQnum: document.getElementById("hud-qnum"),
  hudScore: document.getElementById("hud-score"),
  hudTimer: document.getElementById("hud-timer"),
  qCategory: document.getElementById("q-category"),
  hintBtn: document.getElementById("hint-btn"),
  qPrompt: document.getElementById("q-prompt"),
  choicesList: document.getElementById("choices-list"),
  feedbackPanel: document.getElementById("feedback-panel"),
  feedbackHeading: document.getElementById("feedback-heading"),
  feedbackText: document.getElementById("feedback-text"),
  nextBtn: document.getElementById("next-btn"),

  resultScreen: document.getElementById("result-screen"),
  resultSummary: document.getElementById("result-summary"),
  resultSyncStatus: document.getElementById("result-sync-status"),
  restartBtn: document.getElementById("restart-btn")
};

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
  answered: false,
  currentChoices: []
};

let lastFrameMs = performance.now();

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showView(name) {
  UI.accessScreen.style.display = name === "ACCESS" ? "flex" : "none";
  UI.quizScreen.style.display = name === "QUIZ" ? "flex" : "none";
  UI.resultScreen.style.display = name === "RESULT" ? "flex" : "none";
}

function renderHud() {
  const total = state.deck.length || QUIZ_QUESTIONS.length;
  UI.hudPlayer.textContent = `Player: ${state.playerName}`; UI.hudQnum.textContent = `Question: ${Math.min(state.index + 1, total)} / ${total}`; UI.hudScore.textContent = `Score: ${state.score}`;
  UI.hudTimer.textContent = `Time: ${Math.max(0, state.timeLeft).toFixed(1)}s`; UI.hintBtn.textContent = `Hint (${state.hintsLeft} left)`;
  UI.hintBtn.disabled = state.answered || state.hintsLeft <= 0;
}

function loadQuestion() {
  const q = state.deck[state.index];
  if (!q) {
    finishQuiz();
    return;
  }

  const rightAnswer = q.options[q.answerIndex];
  state.currentChoices = shuffle(q.options).map((text) => ({
    text,
    isCorrect: text === rightAnswer
  }));
  state.answered = false;
  state.timeLeft = SECONDS_PER_QUESTION;

  UI.qCategory.textContent = q.category;
  UI.qPrompt.textContent = q.prompt;
  UI.feedbackPanel.style.display = "none";
  UI.choicesList.innerHTML = "";

  const labels = ["A", "B", "C", "D"];
  state.currentChoices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.dataset.idx = String(idx);
    btn.textContent = `${labels[idx]}.${choice.text}`;
    btn.addEventListener("click", () => handleAnswer(idx));
    UI.choicesList.appendChild(btn);
  });

  renderHud();
}

function handleHint() {
  if (!state.active || state.answered || state.hintsLeft <= 0) return;
  const wrongIndices = state.currentChoices
    .map((c, idx) => (!c.isCorrect ? idx : -1))
    .filter((idx) => idx !== -1);

  shuffle(wrongIndices).slice(0, 2).forEach((idx) => {
    const btn = UI.choicesList.querySelector(`button[data-idx="${idx}"]`); if (btn) { btn.disabled = true; btn.classList.add("eliminated"); } });  state.hintsLeft -= 1; renderHud(); }  function handleAnswer(choiceIdx) { if (!state.active \vert{}\vert{} state.answered) return; state.answered = true;  const buttons = Array.from(UI.choicesList.querySelectorAll("button")); buttons.forEach((b) => { b.disabled = true; });  const q = state.deck[state.index]; const picked = choiceIdx !== null ? state.currentChoices[choiceIdx] : null; const isCorrect = Boolean(picked && picked.isCorrect);  if (isCorrect) { state.correctCount += 1; state.score += POINTS_PER_CORRECT + Math.round(state.timeLeft * 2); UI.feedbackHeading.textContent = "ശരി ഉത്തരം!"; UI.feedbackHeading.style.color = "#4ade80"; if (buttons[choiceIdx]) buttons[choiceIdx].style.borderColor = "#4ade80"; } else if (choiceIdx === null) { UI.feedbackHeading.textContent = "സമയം കഴിഞ്ഞു (Timeout)"; UI.feedbackHeading.style.color = "#f87171"; } else { UI.feedbackHeading.textContent = "തെറ്റായ ഉത്തരം"; UI.feedbackHeading.style.color = "#f87171"; if (buttons[choiceIdx]) buttons[choiceIdx].style.borderColor = "#f87171"; }  UI.feedbackText.textContent = q.explanation; UI.nextBtn.textContent = state.index + 1 >= state.deck.length ? "ഫലം കാണുക" : "അടുത്ത ചോദ്യം"; UI.feedbackPanel.style.display = "block"; renderHud(); }  async function syncProgress(finished) { if (!state.sessionId) return; try { await fetch(ENDPOINTS.progress, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: state.sessionId, doorIndex: state.index, elapsedSeconds: Number(state.totalElapsed.toFixed(1)), finished }) }); } catch (_) {} }  async function finishQuiz() { state.active = false; showView("RESULT"); const total = state.deck.length; UI.resultSummary.textContent = `${state.playerName}, നിങ്ങൾ ${total}-ൽ ${state.correctCount} ചോദ്യങ്ങൾക്ക് ശരി ഉത്തരം നൽകി. സ്കോർ: ${state.score} \vert{} സമയം: ${state.totalElapsed.toFixed(1)}s`;
  UI.resultSyncStatus.textContent = "ഫലം സേവ് ചെയ്യുന്നു...";
  await syncProgress(true);
  UI.resultSyncStatus.textContent = "ഫലം രേഖപ്പെടുത്തി.";
}

function beginQuizSession({ sessionId, playerName, accessCode }) {
  state = {
    active: true,
    sessionId,
    playerName,
    accessCode,
    deck: shuffle(QUIZ_QUESTIONS).slice(0, 25),
    index: 0,
    score: 0,
    correctCount: 0,
    hintsLeft: STARTING_HINTS,
    timeLeft: SECONDS_PER_QUESTION,
    totalElapsed: 0,
    answered: false,
    currentChoices: []
  };
  showView("QUIZ");
  loadQuestion();
}

UI.startBtn.addEventListener("click", async () => {
  const playerName = String(UI.playerName.value || "").trim();
  const code = String(UI.accessCode.value || "").trim().toUpperCase();
  if (!playerName) {
    UI.loginStatus.textContent = "ദയവായി പേര് നൽകുക.";
    return;
  }
  if (!code) {
    UI.loginStatus.textContent = "ദയവായി ആക്സസ് കോഡ് നൽകുക.";
    return;
  }

  UI.startBtn.disabled = true;
  UI.loginStatus.textContent = "പരിശോധിക്കുന്നു...";
  try {
    const res = await fetch(ENDPOINTS.verify, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerName })
    });
    const data = await res.json();
    UI.startBtn.disabled = false;

    if (!data || !data.valid) {
      UI.loginStatus.textContent =
        data?.reason === "ALREADY_USED" ? "ഈ കോഡ് ഇതിനകം ഉപയോഗിച്ചു കഴിഞ്ഞു." : "ആക്സസ് കോഡ് ശരിയല്ല.";
      return;
    }

    UI.loginStatus.textContent = "";
    beginQuizSession({ sessionId: data.sessionId, playerName, accessCode: code });
  } catch (_) {
    UI.startBtn.disabled = false;
    UI.loginStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
  }
});

UI.continueBtn.addEventListener("click", async () => {
  const code = String(UI.continueCodeInput.value || "").trim().toUpperCase();
  if (!code) {
    UI.continueStatus.textContent = "ആക്സസ് കോഡ് നൽകുക.";
    return;
  }
  UI.continueBtn.disabled = true;
  UI.continueStatus.textContent = "പരിശോധിക്കുന്നു...";
  try {
    const res = await fetch(ENDPOINTS.continueCode, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const data = await res.json();
    UI.continueBtn.disabled = false;

    if (!data || !data.valid) {
      UI.continueStatus.textContent = "ഈ കോഡ് ഉപയോഗിച്ച് തുടരാൻ കഴിഞ്ഞില്ല.";
      return;
    }

    const typedName = String(UI.playerName.value || "").trim();
    UI.continueStatus.textContent = "";
    beginQuizSession({
      sessionId: data.sessionId,
      playerName: typedName || data.playerName || "Player",
      accessCode: code
    });
  } catch (_) {
    UI.continueBtn.disabled = false;
    UI.continueStatus.textContent = "സെർവർ കണക്ട് ചെയ്യാൻ കഴിഞ്ഞില്ല.";
  }
});

UI.hintBtn.addEventListener("click", handleHint);
UI.nextBtn.addEventListener("click", async () => {
  state.index += 1;
  await syncProgress(false);
  loadQuestion();
});
UI.restartBtn.addEventListener("click", () => {
  showView("ACCESS");
});

function tick(now) {
  requestAnimationFrame(tick);
  const dt = Math.min((now - lastFrameMs) / 1000, 0.1);
  lastFrameMs = now;

  if (state.active && !state.answered) {
    state.totalElapsed += dt;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    renderHud();
    if (state.timeLeft <= 0) {
      handleAnswer(null);
    }
  }
}

requestAnimationFrame(tick);