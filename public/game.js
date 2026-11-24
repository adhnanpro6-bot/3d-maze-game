/** @typedef {{ id: string, category: string, prompt: string, answers: string[], explanation: string }} TypedQuizQuestion */

const ENDPOINTS = {
  verify: "/api/verify-code",
  continueCode: "/api/continue-code",
  resume: "/api/resume-session",
  progress: "/api/save-progress",
  leaderboard: "/api/leaderboard"
};

const QUESTIONS_PER_USER = 25;

/** @type {TypedQuizQuestion[]} */
const HARD_QUESTION_POOL = [
  { id: "h001", category: "Science", prompt: "What is the rarest naturally occurring element in Earth's crust?", answers: ["ASTATINE"], explanation: "Astatine is estimated to be the rarest naturally occurring element in Earth's crust." },
  { id: "h002", category: "Science", prompt: "Which subatomic particle is its own antiparticle and has zero electric charge?", answers: ["PHOTON"], explanation: "A photon is a gauge boson with zero charge and is its own antiparticle." },
  { id: "h003", category: "Science", prompt: "What phenomenon causes light to bend when passing through a medium with a varying refractive index like a mirage?", answers: ["REFRACTION"], explanation: "Refraction bends light rays across layers of air with different temperatures and densities." },
  { id: "h004", category: "Science", prompt: "Which organelle in eukaryotic cells is responsible for lipid synthesis and detoxification?", answers: ["SMOOTH ENDOPLASMIC RETICULUM", "SER"], explanation: "The smooth endoplasmic reticulum synthesizes lipids and detoxifies certain chemicals." },
  { id: "h005", category: "Science", prompt: "What is the SI unit of electrical capacitance?", answers: ["FARAD"], explanation: "Capacitance is measured in farads (F)." },
  { id: "h006", category: "Science", prompt: "Which law states that the total pressure of a gas mixture equals the sum of partial pressures of individual gases?", answers: ["DALTONS LAW", "DALTON'S LAW", "DALTON"], explanation: "Dalton's law of partial pressures describes gas mixtures." },
  { id: "h007", category: "Science", prompt: "What type of bond involves sharing electron pairs between atoms?", answers: ["COVALENT", "COVALENT BOND"], explanation: "Covalent bonds form when atoms share pairs of electrons." },
  { id: "h008", category: "Science", prompt: "Which enzyme unwinds the DNA double helix ahead of the replication fork?", answers: ["HELICASE"], explanation: "DNA helicase separates double-stranded DNA into single strands." },
  { id: "h009", category: "Science", prompt: "What is the approximate speed of light in a vacuum in meters per second (round to nearest 10^8, e.g. 300000000)?", answers: ["300000000", "3E8", "3 X 10^8"], explanation: "Light travels at approximately 299,792,458 m/s (~300,000,000 m/s) in vacuum." },
  { id: "h010", category: "Science", prompt: "Which thermodynamic process occurs at constant temperature?", answers: ["ISOTHERMAL", "ISOTHERMAL PROCESS"], explanation: "An isothermal process takes place at constant temperature." },
  { id: "h011", category: "Science", prompt: "What is the powerhouse of the cell that generates most ATP via oxidative phosphorylation?", answers: ["MITOCHONDRION", "MITOCHONDRIA"], explanation: "Mitochondria produce ATP through cellular respiration." },
  { id: "h012", category: "Science", prompt: "Which acid is found in high concentration in gastric juice?", answers: ["HYDROCHLORIC ACID", "HCL"], explanation: "Hydrochloric acid (HCl) helps digest food and kill pathogens in the stomach." },
  { id: "h013", category: "Science", prompt: "What is the term for a material with zero electrical resistance below a critical temperature?", answers: ["SUPERCONDUCTOR", "SUPERCONDUCTIVITY"], explanation: "Superconductors exhibit zero electrical resistance below their critical temperature." },
  { id: "h014", category: "Science", prompt: "Which part of the human brain regulates balance, posture, and motor coordination?", answers: ["CEREBELLUM"], explanation: "The cerebellum coordinates voluntary movements and balance." },
  { id: "h015", category: "Science", prompt: "What is the name of the process by which a solid changes directly into a gas?", answers: ["SUBLIMATION"], explanation: "Sublimation is the direct transition from solid to gas." },
  { id: "h016", category: "Geography", prompt: "Which strait separates Asia from North America?", answers: ["BERING STRAIT", "BERING"], explanation: "The Bering Strait lies between Russia (Asia) and Alaska (North America)." },
  { id: "h017", category: "Geography", prompt: "What is the capital city of Kazakhstan?", answers: ["ASTANA"], explanation: "Astana is the capital of Kazakhstan." },
  { id: "h018", category: "Geography", prompt: "Which African lake is the deepest in the world?", answers: ["LAKE TANGANYIKA", "TANGANYIKA"], explanation: "Lake Tanganyika is the deepest lake in Africa and second deepest globally." },
  { id: "h019", category: "Geography", prompt: "Which desert is known as the driest non-polar desert on Earth?", answers: ["ATACAMA", "ATACAMA DESERT"], explanation: "The Atacama Desert in Chile is famous for extreme aridity." },
  { id: "h020", category: "Geography", prompt: "Which country has the longest coastline in the world?", answers: ["CANADA"], explanation: "Canada has the longest total coastline of any country." },
  { id: "h021", category: "Geography", prompt: "What is the name of the deep oceanic trench in the western Pacific Ocean, the deepest known point on Earth?", answers: ["MARIANA TRENCH", "MARIANA"], explanation: "Challenger Deep in the Mariana Trench is the deepest known oceanic point." },
  { id: "h022", category: "Geography", prompt: "Which mountain range separates Europe and Asia traditionally?", answers: ["URAL MOUNTAINS", "URALS", "URAL"], explanation: "The Ural Mountains form a traditional boundary between Europe and Asia." },
  { id: "h023", category: "Geography", prompt: "Which river flows through the Grand Canyon?", answers: ["COLORADO", "COLORADO RIVER"], explanation: "The Colorado River carved the Grand Canyon in Arizona." },
  { id: "h024", category: "Geography", prompt: "Which European country is completely landlocked by South Africa?", answers: ["LESOTHO"], explanation: "Lesotho is an enclave entirely surrounded by South Africa." },
  { id: "h025", category: "Geography", prompt: "What is the capital city of Australia?", answers: ["CANBERRA"], explanation: "Canberra is the capital city of Australia." },
  { id: "h026", category: "Geography", prompt: "Which sea is bordered by Jordan and Israel and has high salinity?", answers: ["DEAD SEA"], explanation: "The Dead Sea is known for its extreme salinity and buoyancy." },
  { id: "h027", category: "Geography", prompt: "Which peninsula contains Spain and Portugal?", answers: ["IBERIAN PENINSULA", "IBERIAN"], explanation: "Spain and Portugal are located on the Iberian Peninsula." },
  { id: "h028", category: "History", prompt: "In which year did the Berlin Wall fall?", answers: ["1989"], explanation: "The Berlin Wall fell on November 9, 1989." },
  { id: "h029", category: "History", prompt: "Who was the first Emperor of Rome?", answers: ["AUGUSTUS", "CAESAR AUGUSTUS", "OCTAVIAN"], explanation: "Augustus became the first Roman Emperor in 27 BCE." },
  { id: "h030", category: "History", prompt: "Which treaty ended World War I?", answers: ["TREATY OF VERSAILLES", "VERSAILLES"], explanation: "The Treaty of Versailles was signed in 1919." },
  { id: "h031", category: "History", prompt: "Who authored the philosophical work 'The Republic'?", answers: ["PLATO"], explanation: "Plato wrote 'The Republic' around 375 BCE." },
  { id: "h032", category: "History", prompt: "Which empire built Machu Picchu in the 15th century?", answers: ["INCA", "INCA EMPIRE"], explanation: "Machu Picchu was built by the Inca Empire." },
  { id: "h033", category: "History", prompt: "What ancient trade network connected East Asia and the Mediterranean?", answers: ["SILK ROAD"], explanation: "The Silk Road facilitated trade and cultural exchange across Eurasia." },
  { id: "h034", category: "History", prompt: "In which year did the Apollo 11 moon landing take place?", answers: ["1969"], explanation: "Apollo 11 landed on the Moon in July 1969." },
  { id: "h035", category: "History", prompt: "Who was the Prime Minister of the United Kingdom during most of World War II?", answers: ["WINSTON CHURCHILL", "CHURCHILL"], explanation: "Winston Churchill served as UK Prime Minister from 1940 to 1945." },
  { id: "h036", category: "History", prompt: "Which ancient civilization developed cuneiform writing?", answers: ["SUMER", "SUMERIANS", "MESOPOTAMIA"], explanation: "Sumerians in ancient Mesopotamia developed cuneiform script." },
  { id: "h037", category: "History", prompt: "What was the name of the ship on which Charles Darwin sailed around the world?", answers: ["HMS BEAGLE", "BEAGLE"], explanation: "Charles Darwin sailed aboard HMS Beagle (1831–1836)." },
  { id: "h038", category: "History", prompt: "In which year did the French Revolution begin?", answers: ["1789"], explanation: "The French Revolution began in 1789." },
  { id: "h039", category: "Math", prompt: "What is the value of 17 × 19?", answers: ["323"], explanation: "17 × 19 = 323." },
  { id: "h040", category: "Math", prompt: "What is the next prime number after 97?", answers: ["101"], explanation: "97 is prime, and 101 is the next prime number." },
  { id: "h041", category: "Math", prompt: "What is 2^10 (2 raised to the power of 10)?", answers: ["1024"], explanation: "2^10 equals 1024." },
  { id: "h042", category: "Math", prompt: "What is the factorial of 6 (6!)?", answers: ["720"], explanation: "6! = 6 × 5 × 4 × 3 × 2 × 1 = 720." },
  { id: "h043", category: "Math", prompt: "What is the square root of 625?", answers: ["25"], explanation: "25 × 25 = 625." },
  { id: "h044", category: "Math", prompt: "In a right triangle with legs 9 and 12, what is the hypotenuse?", answers: ["15"], explanation: "sqrt(9^2 + 12^2) = sqrt(81 + 144) = sqrt(225) = 15." },
  { id: "h045", category: "Math", prompt: "What is the sum of interior angles of a hexagon in degrees?", answers: ["720"], explanation: "(6 - 2) × 180 = 720 degrees." },
  { id: "h046", category: "Math", prompt: "What is 15% of 400?", answers: ["60"], explanation: "0.15 × 400 = 60." },
  { id: "h047", category: "Math", prompt: "What is the value of log10(10000)?", answers: ["4"], explanation: "10^4 = 10000, so log10(10000) = 4." },
  { id: "h048", category: "Math", prompt: "What is the 10th term of the Fibonacci sequence starting 1, 1, 2, 3, 5...?", answers: ["55"], explanation: "1, 1, 2, 3, 5, 8, 13, 21, 34, 55 -> 10th term is 55." },
  { id: "h049", category: "Math", prompt: "What is 144 divided by 12?", answers: ["12"], explanation: "144 / 12 = 12." },
  { id: "h050", category: "Math", prompt: "What is 13 squared (13^2)?", answers: ["169"], explanation: "13 × 13 = 169." },
  { id: "h051", category: "Computing", prompt: "What does HTTP stand for? (HyperText Transfer ...)", answers: ["HYPERTEXT TRANSFER PROTOCOL"], explanation: "HTTP stands for HyperText Transfer Protocol." },
  { id: "h052", category: "Computing", prompt: "What data structure operates on a Last-In, First-Out (LIFO) principle?", answers: ["STACK"], explanation: "A stack follows Last-In, First-Out (LIFO) ordering." },
  { id: "h053", category: "Computing", prompt: "What data structure operates on a First-In, First-Out (FIFO) principle?", answers: ["QUEUE"], explanation: "A queue follows First-In, First-Out (FIFO) ordering." },
  { id: "h054", category: "Computing", prompt: "What is the decimal equivalent of binary 11010?", answers: ["26"], explanation: "16 + 8 + 2 = 26." },
  { id: "h055", category: "Computing", prompt: "What is the hexadecimal equivalent of decimal 255?", answers: ["FF", "0XFF"], explanation: "255 in decimal is FF in hexadecimal." },
  { id: "h056", category: "Computing", prompt: "What is the worst-case time complexity of binary search on a sorted array of n elements? (e.g. O(log n))", answers: ["O(LOG N)", "LOG N", "LOGN"], explanation: "Binary search has O(log n) worst-case time complexity." },
  { id: "h057", category: "Computing", prompt: "Which protocol is commonly used to resolve domain names to IP addresses?", answers: ["DNS", "DOMAIN NAME SYSTEM"], explanation: "DNS translates human-readable domain names into IP addresses." },
  { id: "h058", category: "Computing", prompt: "What does SQL stand for? (Structured ... Language)", answers: ["STRUCTURED QUERY LANGUAGE"], explanation: "SQL stands for Structured Query Language." },
  { id: "h059", category: "Computing", prompt: "In Git, which command stages changes for the next commit?", answers: ["GIT ADD", "ADD"], explanation: "git add stages modified files into the index." },
  { id: "h060", category: "Computing", prompt: "How many bits are in a standard IPv4 address?", answers: ["32"], explanation: "An IPv4 address consists of 32 bits (four 8-bit octets)." },
  { id: "h061", category: "Computing", prompt: "What does CPU stand for?", answers: ["CENTRAL PROCESSING UNIT"], explanation: "CPU stands for Central Processing Unit." },
  { id: "h062", category: "Computing", prompt: "Which sorting algorithm has an average and worst-case time complexity of O(n^2)?", answers: ["BUBBLE SORT", "INSERTION SORT", "SELECTION SORT"], explanation: "Bubble sort, selection sort, and insertion sort have O(n^2) worst-case time complexity." },
  { id: "h063", category: "GK", prompt: "What is the currency of Japan?", answers: ["YEN", "JAPANESE YEN"], explanation: "The official currency of Japan is the Japanese Yen." },
  { id: "h064", category: "GK", prompt: "Which planet in our solar system has the most confirmed moons (as of recent astronomical catalogs)?", answers: ["SATURN"], explanation: "Saturn has a massive system of moons, exceeding 140 confirmed moons." },
  { id: "h065", category: "GK", prompt: "What is the largest bone in the human body?", answers: ["FEMUR", "THIGH BONE"], explanation: "The femur is the longest and strongest bone in the human body." },
  { id: "h066", category: "GK", prompt: "Which gas makes up approximately 78% of Earth's atmosphere?", answers: ["NITROGEN"], explanation: "Nitrogen accounts for roughly 78% of dry air on Earth." },
  { id: "h067", category: "GK", prompt: "What is the capital city of South Korea?", answers: ["SEOUL"], explanation: "Seoul is the capital of South Korea." },
  { id: "h068", category: "GK", prompt: "Which instrument is used to measure atmospheric pressure?", answers: ["BAROMETER"], explanation: "A barometer measures atmospheric pressure." },
  { id: "h069", category: "GK", prompt: "Which vitamin is produced in human skin upon exposure to sunlight?", answers: ["VITAMIN D", "D"], explanation: "UVB sunlight triggers vitamin D synthesis in the skin." },
  { id: "h070", category: "GK", prompt: "What is the hardest natural mineral on the Mohs scale?", answers: ["DIAMOND"], explanation: "Diamond ranks 10 on the Mohs hardness scale." },
  { id: "h071", category: "GK", prompt: "Which language has the most native speakers globally?", answers: ["MANDARIN", "MANDARIN CHINESE", "CHINESE"], explanation: "Mandarin Chinese has the largest number of native speakers worldwide." },
  { id: "h072", category: "GK", prompt: "What is the capital city of Brazil?", answers: ["BRASILIA", "BRASÍLIA"], explanation: "Brasília is the federal capital of Brazil." },
  { id: "h073", category: "Sports", prompt: "How many players are on the court at once for one volleyball team?", answers: ["6", "SIX"], explanation: "Each volleyball team has 6 players on the court." },
  { id: "h074", category: "Sports", prompt: "Which country has won the most FIFA World Cup titles?", answers: ["BRAZIL"], explanation: "Brazil has won the FIFA World Cup five times." },
  { id: "h075", category: "Sports", prompt: "In tennis, what score comes after 30 in a game?", answers: ["40", "FORTY"], explanation: "Points in a tennis game progress 0, 15, 30, 40, game." },
  { id: "h076", category: "Sports", prompt: "How many holes are on a standard championship golf course?", answers: ["18", "EIGHTEEN"], explanation: "A standard golf round consists of 18 holes." },
  { id: "h077", category: "Sports", prompt: "In basketball, how many points is a shot made from beyond the three-point arc worth?", answers: ["3", "THREE"], explanation: "A shot outside the three-point line scores 3 points." },
  { id: "h078", category: "Sports", prompt: "What is the standard length of an Olympic swimming pool in meters?", answers: ["50"], explanation: "An Olympic-size pool is 50 meters long." },
  { id: "h079", category: "Sports", prompt: "Which Grand Slam tennis tournament is played on clay courts?", answers: ["FRENCH OPEN", "ROLAND GARROS"], explanation: "The French Open (Roland Garros) is played on red clay." },
  { id: "h080", category: "Sports", prompt: "In cricket, how many runs is a boundary worth when the ball crosses the rope after bouncing?", answers: ["4", "FOUR"], explanation: "A grounded boundary in cricket scores 4 runs." },
  { id: "h081", category: "Literature", prompt: "Who wrote '1984'?", answers: ["GEORGE ORWELL", "ORWELL"], explanation: "George Orwell published the dystopian novel '1984' in 1949." },
  { id: "h082", category: "Literature", prompt: "Who is the author of 'Pride and Prejudice'?", answers: ["JANE AUSTEN", "AUSTEN"], explanation: "Jane Austen wrote 'Pride and Prejudice' (1813)." },
  { id: "h083", category: "Literature", prompt: "Who wrote the play 'Hamlet'?", answers: ["WILLIAM SHAKESPEARE", "SHAKESPEARE"], explanation: "William Shakespeare wrote 'Hamlet'." },
  { id: "h084", category: "Literature", prompt: "Who wrote 'Crime and Punishment'?", answers: ["FYODOR DOSTOEVSKY", "DOSTOEVSKY"], explanation: "Fyodor Dostoevsky published 'Crime and Punishment' in 1866." },
  { id: "h085", category: "Literature", prompt: "What is the name of the fictional detective created by Arthur Conan Doyle?", answers: ["SHERLOCK HOLMES", "HOLMES"], explanation: "Sherlock Holmes was created by Sir Arthur Conan Doyle." },
  { id: "h086", category: "Literature", prompt: "Who wrote 'The Odyssey'?", answers: ["HOMER"], explanation: "'The Odyssey' is an ancient Greek epic poem attributed to Homer." },
  { id: "h087", category: "Literature", prompt: "Who authored 'To Kill a Mockingbird'?", answers: ["HARPER LEE"], explanation: "Harper Lee published 'To Kill a Mockingbird' in 1960." },
  { id: "h088", category: "Literature", prompt: "Who wrote 'Don Quixote'?", answers: ["MIGUEL DE CERVANTES", "CERVANTES"], explanation: "Miguel de Cervantes wrote 'Don Quixote'." },
  { id: "h089", category: "Art & Culture", prompt: "Who painted 'The Starry Night'?", answers: ["VINCENT VAN GOGH", "VAN GOGH"], explanation: "Vincent van Gogh painted 'The Starry Night' in 1889." },
  { id: "h090", category: "Art & Culture", prompt: "Who composed the 'Moonlight Sonata'?", answers: ["BEETHOVEN", "LUDWIG VAN BEETHOVEN"], explanation: "Ludwig van Beethoven composed Piano Sonata No. 14 ('Moonlight')." },
  { id: "h091", category: "Art & Culture", prompt: "Who sculpted the marble statue 'David' in Florence?", answers: ["MICHELANGELO"], explanation: "Michelangelo sculpted 'David' between 1501 and 1504." },
  { id: "h092", category: "Art & Culture", prompt: "Which traditional Japanese theater form uses elaborate makeup and stylized dance/drama?", answers: ["KABUKI"], explanation: "Kabuki is classical Japanese dance-drama." },
  { id: "h093", category: "Art & Culture", prompt: "In which city is the Louvre Museum located?", answers: ["PARIS"], explanation: "The Louvre Museum is located in Paris, France." },
  { id: "h094", category: "Science", prompt: "What is the chemical symbol for gold?", answers: ["AU"], explanation: "Au comes from the Latin word for gold, 'aurum'." },
  { id: "h095", category: "Science", prompt: "What is the chemical symbol for potassium?", answers: ["K"], explanation: "K comes from Neo-Latin 'kalium'." },
  { id: "h096", category: "Science", prompt: "What is the chemical symbol for sodium?", answers: ["NA"], explanation: "Na comes from Latin 'natrium'." },
  { id: "h097", category: "Geography", prompt: "Which continent has the largest land area?", answers: ["ASIA"], explanation: "Asia is the largest continent by both area and population." },
  { id: "h098", category: "Geography", prompt: "Which ocean lies between Africa, Asia, and Australia?", answers: ["INDIAN OCEAN", "INDIAN"], explanation: "The Indian Ocean borders eastern Africa, southern Asia, and western Australia." },
  { id: "h099", category: "Math", prompt: "What is the cube root of 125?", answers: ["5"], explanation: "5 × 5 × 5 = 125." },
  { id: "h100", category: "Computing", prompt: "What does RAM stand for?", answers: ["RANDOM ACCESS MEMORY"], explanation: "RAM stands for Random Access Memory." }
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
 * Picks a user-specific set of N random questions from the 100-question pool.
 * Deterministic per user seed (accessCode + sessionId) so the user's 25 questions
 * never change mid-session or across resume/reload, while different users get different sets.
 * @param {TypedQuizQuestion[]} pool
 * @param {string} userSeed
 * @param {number} count
 * @returns {TypedQuizQuestion[]}
 */
function pickUserRandomQuestions(pool, userSeed, count) {
  let seed = 2166136261;
  for (let i = 0; i < userSeed.length; i++) {
    seed ^= userSeed.charCodeAt(i);
    seed = Math.imul(seed, 16777619);
  }
  const nextRand = () => {
    seed += 0x6D2B79F5;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(count, copy.length));
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
    head.innerHTML = `<span>ചോദ്യം ${idx + 1} / ${state.deck.length} (100 Pool)</span><span>${q.category}</span>`;

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
  const userSeed = `${code}|${params.sessionId}|${params.playerName}`;

  state = {
    active: true,
    sessionId: params.sessionId,
    playerName: params.playerName,
    accessCode: code,
    deck: pickUserRandomQuestions(HARD_QUESTION_POOL, userSeed, QUESTIONS_PER_USER),
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
            UI.loginStatus.textContent = "APPS_SCRIPT_URL സെറ്റ് ചെയ്തിട്ടില്ല.";
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