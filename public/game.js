// ==========================================
// 1. GOOGLE FORM CONFIGURATION (UNCHANGED)
// ==========================================
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdV0o2pVUFKrOtdiC4dhsplYwAj3GEpByp9tBOCy8ueBTBwXQ/formResponse";
const ENTRY_PLAYER_NAME = "entry.1221814472";
const ENTRY_ACCESS_CODE = "entry.1185191600";
const ENTRY_COMPLETION_TIME = "entry.1494944407";

// ==========================================
// 2. 100 EXACT ACCESS CODES
// ==========================================
const RAW_CODES_STRING = "KKMQZN01-7842|KKMQZN02-9153|KKMQZN03-6204|KKMQZN04-5012|KKMQZN05-4657|KKMQZN06-3286|KKMQZN07-2679|KKMQZN08-9935|KKMQZN09-2424|KKMQZN10-7912|KKMQZN11-1520|KKMQZN12-1488|KKMQZN13-2535|KKMQZN14-4582|KKMQZN15-4811|KKMQZN16-9279|KKMQZN17-1434|KKMQZN18-4257|KKMQZN19-9928|KKMQZN20-7873|KKMQZN21-4611|KKMQZN22-8359|KKMQZN23-5557|KKMQZN24-1106|KKMQZN25-3615|KKMQZN26-7924|KKMQZN27-6574|KKMQZN28-5552|KKMQZN29-3547|KKMQZN30-4527|KKMQZN31-6514|KKMQZN32-2674|KKMQZN33-2519|KKMQZN34-7224|KKMQZN35-2584|KKMQZN36-6881|KKMQZN37-6635|KKMQZN38-5333|KKMQZN39-1711|KKMQZN40-8527|KKMQZN41-9785|KKMQZN42-3045|KKMQZN43-7201|KKMQZN44-2291|KKMQZN45-5803|KKMQZN46-6925|KKMQZN47-4150|KKMQZN48-2139|KKMQZN49-1750|KKMQZN50-4733|KKMQZN51-5741|KKMQZN52-2307|KKMQZN53-4814|KKMQZN54-2654|KKMQZN55-7227|KKMQZN56-5554|KKMQZN57-8428|KKMQZN58-6977|KKMQZN59-3664|KKMQZN60-7065|KKMQZN61-6820|KKMQZN62-4432|KKMQZN63-5374|KKMQZN64-2169|KKMQZN65-3803|KKMQZN66-9751|KKMQZN67-5010|KKMQZN68-3677|KKMQZN69-8573|KKMQZN70-7216|KKMQZN71-5422|KKMQZN72-4598|KKMQZN73-6313|KKMQZN74-1916|KKMQZN75-4752|KKMQZN76-1525|KKMQZN77-6168|KKMQZN78-7572|KKMQZN79-5386|KKMQZN80-2084|KKMQZN81-4456|KKMQZN82-6155|KKMQZN83-4483|KKMQZN84-9179|KKMQZN85-7482|KKMQZN86-8517|KKMQZN87-3340|KKMQZN88-5339|KKMQZN89-3287|KKMQZN90-5040|KKMQZN91-9830|KKMQZN92-5304|KKMQZN93-8019|KKMQZN94-7543|KKMQZN95-6930|KKMQZN96-4593|KKMQZN97-3266|KKMQZN98-9348|KKMQZN99-9085|KKMQZN100-4410";

const VALID_ACCESS_CODES = new Set(RAW_CODES_STRING.split("|"));

let currentPlayerName = "";
let currentAccessCode = "";
let gameStartTime = 0;
let timerInterval = null;
let isGameFinished = false;
let mazeInitialized = false;
let toastTimeout = null;

// ==========================================
// 3. VERIFY ACCESS & START GAME (ONE-TIME USE)
// ==========================================
async function verifyAndStartGame() {
    const nameInput = document.getElementById("player-name").value.trim();
    const codeInput = document.getElementById("access-code").value.trim().toUpperCase();
    const errorMsg = document.getElementById("error-msg");
    const startBtn = document.getElementById("start-btn");

    if (!nameInput) {
        errorMsg.innerText = "ദയവായി നിങ്ങളുടെ പേര് നൽകുക!";
        return;
    }

    if (!VALID_ACCESS_CODES.has(codeInput)) {
        errorMsg.innerText = "തെറ്റായ ആക്സസ് കോഡ്! നിങ്ങൾക്ക് ലഭിച്ച കൃത്യമായ കോഡ് നൽകുക.";
        return;
    }

    startBtn.disabled = true;
    errorMsg.innerText = "ആക്സസ് കോഡ് പരിശോധിക്കുന്നു...";

    let serverChecked = false;
    try {
        const res = await fetch("/api/verify-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: codeInput, playerName: nameInput })
        });
        if (res.ok) {
            const data = await res.json();
            serverChecked = true;
            if (!data.valid) {
                startBtn.disabled = false;
                errorMsg.innerText = data.reason === "ALREADY_USED"
                    ? "ഈ ആക്സസ് കോഡ് ഇതിനകം ഉപയോഗിച്ചതാണ്! ഒരു കോഡ് ഒരു തവണ മാത്രമേ ഉപയോഗിക്കാൻ കഴിയൂ."
                    : "തെറ്റായ ആക്സസ് കോഡ്! നിങ്ങൾക്ക് ലഭിച്ച കൃത്യമായ കോഡ് നൽകുക.";
                return;
            }
        }
    } catch (_) {
        serverChecked = false;
    }

    if (!serverChecked && localStorage.getItem("used_code_" + codeInput)) {
        startBtn.disabled = false;
        errorMsg.innerText = "ഈ ആക്സസ് കോഡ് ഇതിനകം ഉപയോഗിച്ചതാണ്! ഒരു കോഡ് ഒരു തവണ മാത്രമേ ഉപയോഗിക്കാൻ കഴിയൂ.";
        return;
    }

    localStorage.setItem("used_code_" + codeInput, "true");
    startBtn.disabled = false;
    errorMsg.innerText = "";

    currentPlayerName = nameInput;
    currentAccessCode = codeInput;
    isGameFinished = false;

    document.getElementById("access-screen").style.display = "none";
    document.getElementById("hud-container").style.display = "block";
    document.getElementById("game-container").style.display = "block";
    document.getElementById("hud-player").innerText = `${currentPlayerName} (${currentAccessCode})`;

    updateDoorsHud();
    startMazeTimer();

    if (!mazeInitialized) {
        init3DMaze();
        mazeInitialized = true;
    } else {
        resetMazeState();
        animate();
    }
}

function showToast(msg) {
    const toast = document.getElementById("status-toast");
    toast.innerText = msg;
    toast.style.display = "block";
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.display = "none";
    }, 2600);
}

// ==========================================
// 4. TIMER LOGIC
// ==========================================
function getElapsedSeconds() {
    return (performance.now() - gameStartTime) / 1000;
}

function startMazeTimer() {
    clearInterval(timerInterval);
    gameStartTime = performance.now();
    document.getElementById("hud-timer").innerText = "Time: 0.00s";

    timerInterval = setInterval(() => {
        if (!isGameFinished) {
            const elapsed = getElapsedSeconds().toFixed(2);
            document.getElementById("hud-timer").innerText = `Time: ${elapsed}s`;
        }
    }, 50);
}

// ==========================================
// 5. 3D MAZE ENGINE & 5 SEQUENTIAL DOORS
// ==========================================
const MAZE_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 9, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const DOOR_ORDER = [2, 3, 4, 5, 6];

const PUZZLES = {
    2: {
        order: 1,
        tag: "DOOR 01 • TOUGH RIDDLE",
        title: "ഒന്നാം വാതിൽ പസിൽ",
        clue: "ഞാൻ എന്നും നിങ്ങളോടൊപ്പമുണ്ടാകും, പക്ഷേ വെളിച്ചമുള്ളപ്പോൾ മാത്രമേ എന്നെ കാണാൻ കഴിയൂ. ഇരുട്ടിൽ ഞാൻ മറയുന്നു. ഞാൻ ആരാണ്? (ഇംഗ്ലീഷിൽ ഒറ്റവാക്കിൽ ഉത്തരം നൽകുക)",
        answer: "SHADOW",
        unlocked: false,
        opening: false,
        mesh: null,
        baseY: 1.75
    },
    3: {
        order: 2,
        tag: "DOOR 02 • TOUGH MATH",
        title: "രണ്ടാം വാതിൽ പസിൽ",
        clue: "1, 4, 9, 16, 25, 36, 49, 64, 81, 100, ? — ഈ ശ്രേണിയിലെ അടുത്ത സംഖ്യ ഏതാണ്?",
        answer: "121",
        unlocked: false,
        opening: false,
        mesh: null,
        baseY: 1.75
    },
    4: {
        order: 3,
        tag: "DOOR 03 • TOUGH RIDDLE",
        title: "മൂന്നാം വാതിൽ പസിൽ",
        clue: "ഞാൻ വളരുമ്പോൾ ഞാൻ ചെറുതാകുന്നു (ചുരുങ്ങുന്നു). ഞാൻ ആരാണ്? (ഇംഗ്ലീഷിൽ ഒറ്റവാക്കിൽ ഉത്തരം നൽകുക)",
        answer: "CANDLE",
        unlocked: false,
        opening: false,
        mesh: null,
        baseY: 1.75
    },
    5: {
        order: 4,
        tag: "DOOR 04 • TOUGH NUMBER LOGIC",
        title: "നാലാം വാതിൽ പസിൽ",
        clue: "2, 6, 12, 20, 30, 42, 56, 72, 90, 110, ? — അടുത്ത സംഖ്യ ഏതാണ്?",
        answer: "144",
        unlocked: false,
        opening: false,
        mesh: null,
        baseY: 1.75
    },
    6: {
        order: 5,
        tag: "DOOR 05 • FINAL TOUGH GATE",
        title: "അഞ്ചാം വാതിൽ പസിൽ",
        clue: "എന്നിൽ നഗരങ്ങളുണ്ട് പക്ഷേ വീടുകളില്ല; കാടുകളുണ്ട് പക്ഷേ മരങ്ങളില്ല; നദികളുണ്ട് പക്ഷേ വെള്ളമില്ല. ഞാൻ ആരാണ്? (ഇംഗ്ലീഷിൽ ഒറ്റവാക്കിൽ ഉത്തരം നൽകുക)",
        answer: "MAP",
        unlocked: false,
        opening: false,
        mesh: null,
        baseY: 1.75
    }
};

function getNextRequiredDoorId() {
    for (const id of DOOR_ORDER) {
        if (!PUZZLES[id].unlocked) return id;
    }
    return null;
}

function updateDoorsHud() {
    const unlockedCount = DOOR_ORDER.filter(id => PUZZLES[id].unlocked).length;
    const nextId = getNextRequiredDoorId();
    const nextLabel = nextId ? `DOOR 0${PUZZLES[nextId].order}` : "ALL 5 DOORS OPEN";
    document.getElementById("hud-doors").innerText = `Next Door: ${nextLabel} (${unlockedCount} / 5)`;
}

let scene, camera, renderer;
const CELL_SIZE = 4;
let playerPos = { x: CELL_SIZE, z: CELL_SIZE };
let playerYaw = 0;
const keys = {};
let activeDoorId = null;
let isPuzzleOpen = false;
let animFrameId = null;

function resetMazeState() {
    playerPos = { x: CELL_SIZE, z: CELL_SIZE };
    playerYaw = 0;
    activeDoorId = null;
    isPuzzleOpen = false;
    document.getElementById("door-prompt").style.display = "none";
    document.getElementById("puzzle-modal").style.display = "none";
    document.getElementById("status-toast").style.display = "none";

    DOOR_ORDER.forEach((id) => {
        const p = PUZZLES[id];
        p.unlocked = false;
        p.opening = false;
        if (p.mesh) {
            p.mesh.position.y = p.baseY;
            p.mesh.visible = true;
            p.mesh.material.color.setHex(id === 2 ? 0xff9800 : 0x546e7a);
        }
    });
    updateDoorsHud();
}

function init3DMaze() {
    const container = document.getElementById("game-container");
    container.innerHTML = "";

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.Fog(0x050811, 1.5, 20);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 120);
    camera.position.set(playerPos.x, 1.7, playerPos.z);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x90a4ae, 0.35);
    scene.add(ambientLight);

    const playerLight = new THREE.PointLight(0x00e676, 1.25, 13);
    camera.add(playerLight);
    scene.add(camera);

    const floorGeo = new THREE.PlaneGeometry(90, 90);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f1420, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const wallGeo = new THREE.BoxGeometry(CELL_SIZE, 3.8, CELL_SIZE);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a2547, roughness: 0.7 });
    const exitMat = new THREE.MeshStandardMaterial({ color: 0x00e676, emissive: 0x00a844 });

    for (let row = 0; row < MAZE_MAP.length; row++) {
        for (let col = 0; col < MAZE_MAP[row].length; col++) {
            const cell = MAZE_MAP[row][col];
            const posX = col * CELL_SIZE;
            const posZ = row * CELL_SIZE;

            if (cell === 1) {
                const wall = new THREE.Mesh(wallGeo, wallMat);
                wall.position.set(posX, 1.9, posZ);
                scene.add(wall);
            } else if (PUZZLES[cell]) {
                const doorColor = cell === 2 ? 0xff9800 : 0x546e7a;
                const doorMat = new THREE.MeshStandardMaterial({
                    color: doorColor,
                    emissive: 0x1c1400,
                    roughness: 0.45
                });
                const door = new THREE.Mesh(wallGeo, doorMat);
                door.position.set(posX, PUZZLES[cell].baseY, posZ);
                scene.add(door);
                PUZZLES[cell].mesh = door;
            } else if (cell === 9) {
                const exitGoal = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.2, 2.2), exitMat);
                exitGoal.position.set(posX, 1.6, posZ);
                scene.add(exitGoal);
            }
        }
    }

    window.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        if (isPuzzleOpen && e.code === "Enter") {
            e.preventDefault();
            checkPuzzleAnswer();
            return;
        }

        if (isPuzzleOpen && e.code === "Escape") {
            e.preventDefault();
            closePuzzleModal();
            return;
        }

        if (e.code === "Space" && activeDoorId && !isPuzzleOpen && !isGameFinished) {
            e.preventDefault();
            tryOpenDoor(activeDoorId);
        }
    });

    window.addEventListener("keyup", (e) => {
        keys[e.code] = false;
    });

    document.getElementById("door-prompt").addEventListener("click", () => {
        if (activeDoorId && !isPuzzleOpen && !isGameFinished) {
            tryOpenDoor(activeDoorId);
        }
    });

    document.querySelectorAll(".touch-btn").forEach((btn) => {
        const keyCode = btn.getAttribute("data-key");

        const pressKey = (e) => {
            e.preventDefault();
            keys[keyCode] = true;
        };

        const releaseKey = (e) => {
            e.preventDefault();
            keys[keyCode] = false;
        };

        btn.addEventListener("touchstart", pressKey, { passive: false });
        btn.addEventListener("touchend", releaseKey, { passive: false });
        btn.addEventListener("touchcancel", releaseKey, { passive: false });
        btn.addEventListener("mousedown", pressKey);
        btn.addEventListener("mouseup", releaseKey);
        btn.addEventListener("mouseleave", releaseKey);
    });

    let lastTouchX = null;
    container.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            lastTouchX = e.touches[0].clientX;
        }
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1 && lastTouchX !== null && !isPuzzleOpen && !isGameFinished) {
            e.preventDefault();
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - lastTouchX;
            lastTouchX = currentX;
            playerYaw -= deltaX * 0.008;
        }
    }, { passive: false });

    container.addEventListener("touchend", () => {
        lastTouchX = null;
    }, { passive: true });

    let isDragging = false;
    window.addEventListener("mousedown", (e) => {
        if (e.target.closest(".touch-btn")) return;
        isDragging = true;
    });
    window.addEventListener("mouseup", () => {
        isDragging = false;
    });
    window.addEventListener("mousemove", (e) => {
        if (isDragging && !isPuzzleOpen && !isGameFinished) {
            playerYaw -= e.movementX * 0.005;
        }
    });

    window.addEventListener("resize", () => {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function tryOpenDoor(doorId) {
    const nextRequired = getNextRequiredDoorId();
    if (doorId !== nextRequired) {
        const reqOrder = PUZZLES[nextRequired].order;
        showToast(`ആദ്യം DOOR 0${reqOrder} തുറക്കുക! ക്രമത്തിൽ മാത്രമേ വാതിലുകൾ തുറക്കാൻ കഴിയൂ.`);
        return;
    }
    openPuzzleModal(doorId);
}

function animateDoors() {
    DOOR_ORDER.forEach((id) => {
        const p = PUZZLES[id];
        if (p.opening && p.mesh) {
            p.mesh.position.y += 0.12;
            if (p.mesh.position.y >= 5.8) {
                p.opening = false;
                p.mesh.visible = false;
            }
        }
    });
}

function animate() {
    if (isGameFinished) return;
    animFrameId = requestAnimationFrame(animate);

    if (!isPuzzleOpen) {
        updatePlayerMovement();
    }

    animateDoors();

    camera.position.set(playerPos.x, 1.7, playerPos.z);
    camera.rotation.y = playerYaw;
    renderer.render(scene, camera);
    drawMinimap();
}

function updatePlayerMovement() {
    const moveSpeed = 0.08;
    const rotSpeed = 0.04;

    if (keys["KeyQ"] || keys["ArrowLeft"]) playerYaw += rotSpeed;
    if (keys["KeyE"] || keys["ArrowRight"]) playerYaw -= rotSpeed;

    let dx = 0;
    let dz = 0;

    if (keys["KeyW"] || keys["ArrowUp"]) {
        dx -= Math.sin(playerYaw) * moveSpeed;
        dz -= Math.cos(playerYaw) * moveSpeed;
    }
    if (keys["KeyS"] || keys["ArrowDown"]) {
        dx += Math.sin(playerYaw) * moveSpeed;
        dz += Math.cos(playerYaw) * moveSpeed;
    }
    if (keys["KeyA"]) {
        dx -= Math.cos(playerYaw) * moveSpeed;
        dz += Math.sin(playerYaw) * moveSpeed;
    }
    if (keys["KeyD"]) {
        dx += Math.cos(playerYaw) * moveSpeed;
        dz -= Math.sin(playerYaw) * moveSpeed;
    }

    const nextX = playerPos.x + dx;
    const nextZ = playerPos.z + dz;

    if (!checkCollision(nextX, playerPos.z)) playerPos.x = nextX;
    if (!checkCollision(playerPos.x, nextZ)) playerPos.z = nextZ;

    checkNearbyInteractables();
}

function checkCollision(x, z) {
    const padding = 0.65;
    const points = [
        { x: x - padding, z: z - padding },
        { x: x + padding, z: z - padding },
        { x: x - padding, z: z + padding },
        { x: x + padding, z: z + padding }
    ];

    for (const p of points) {
        const col = Math.round(p.x / CELL_SIZE);
        const row = Math.round(p.z / CELL_SIZE);
        const cell = MAZE_MAP[row]?.[col];

        if (cell === 1) return true;
        if (PUZZLES[cell] && !PUZZLES[cell].unlocked) return true;
    }
    return false;
}

function checkNearbyInteractables() {
    const col = Math.round(playerPos.x / CELL_SIZE);
    const row = Math.round(playerPos.z / CELL_SIZE);

    if (MAZE_MAP[row]?.[col] === 9) {
        completeMazeGame();
        return;
    }

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 0]];
    let foundDoor = null;

    for (const [dr, dc] of dirs) {
        const cell = MAZE_MAP[row + dr]?.[col + dc];
        if (PUZZLES[cell] && !PUZZLES[cell].unlocked) {
            foundDoor = cell;
            break;
        }
    }

    activeDoorId = foundDoor;
    const promptEl = document.getElementById("door-prompt");
    if (foundDoor) {
        const nextRequired = getNextRequiredDoorId();
        const reqOrder = PUZZLES[nextRequired].order;
        promptEl.innerHTML = foundDoor === nextRequired
            ? `വാതിൽ പൂട്ടിയിരിക്കുന്നു! പസിൽ തുറക്കാൻ <b>SPACE</b> അല്ലെങ്കിൽ <b>TAP</b> ചെയ്യുക`
            : `ആദ്യം <b>DOOR 0${reqOrder}</b> തുറക്കുക (ലോക്ക്ഡ്)`;
        promptEl.style.display = "block";
    } else {
        promptEl.style.display = "none";
    }
}

function drawMinimap() {
    const canvas = document.getElementById("minimap");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rows = MAZE_MAP.length;
    const cols = MAZE_MAP[0].length;
    const tileW = canvas.width / cols;
    const tileH = canvas.height / rows;
    const nextRequired = getNextRequiredDoorId();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = MAZE_MAP[r][c];
            if (cell === 1) {
                ctx.fillStyle = "#243252";
            } else if (PUZZLES[cell]) {
                if (PUZZLES[cell].unlocked) ctx.fillStyle = "#1b5e20";
                else if (cell === nextRequired) ctx.fillStyle = "#ff9800";
                else ctx.fillStyle = "#546e7a";
            } else if (cell === 9) {
                ctx.fillStyle = "#00e676";
            } else {
                ctx.fillStyle = "#0a0e17";
            }
            ctx.fillRect(c * tileW, r * tileH, tileW - 1, tileH - 1);
        }
    }

    const px = (playerPos.x / CELL_SIZE) * tileW;
    const pz = (playerPos.z / CELL_SIZE) * tileH;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px, pz, 3.8, 0, Math.PI * 2);
    ctx.fill();
}

// ==========================================
// 6. PUZZLE MODAL LOGIC
// ==========================================
function openPuzzleModal(doorId) {
    isPuzzleOpen = true;
    const puzzle = PUZZLES[doorId];
    document.getElementById("puzzle-tag").innerText = puzzle.tag;
    document.getElementById("puzzle-title").innerText = puzzle.title;
    document.getElementById("puzzle-clue").innerText = puzzle.clue;
    document.getElementById("puzzle-answer").value = "";
    document.getElementById("puzzle-error").innerText = "";
    document.getElementById("puzzle-modal").style.display = "flex";
    setTimeout(() => document.getElementById("puzzle-answer").focus(), 50);
}

function closePuzzleModal() {
    isPuzzleOpen = false;
    document.getElementById("puzzle-modal").style.display = "none";
}

function checkPuzzleAnswer() {
    if (!activeDoorId) return;
    const userAns = document.getElementById("puzzle-answer").value.trim().toUpperCase();
    const puzzle = PUZZLES[activeDoorId];

    if (userAns === puzzle.answer) {
        puzzle.unlocked = true;
        puzzle.opening = true;
        updateDoorsHud();

        const nextId = getNextRequiredDoorId();
        if (nextId && PUZZLES[nextId]?.mesh) {
            PUZZLES[nextId].mesh.material.color.setHex(0xff9800);
        }

        closePuzzleModal();
        document.getElementById("door-prompt").style.display = "none";
        activeDoorId = null;
    } else {
        document.getElementById("puzzle-error").innerText = "തെറ്റായ ഉത്തരം! ക്ലൂ വീണ്ടും വായിച്ച് ശ്രമിക്കുക.";
    }
}

// ==========================================
// 7. COMPLETE GAME & SEND DATA TO GOOGLE FORM
// ==========================================
function completeMazeGame() {
    if (isGameFinished) return;
    isGameFinished = true;
    clearInterval(timerInterval);
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const finalSeconds = getElapsedSeconds().toFixed(2);
    const formattedTime = `${finalSeconds} seconds`;

    localStorage.setItem("used_code_" + currentAccessCode, "true");

    document.getElementById("hud-container").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    document.getElementById("win-screen").style.display = "flex";
    document.getElementById("final-time-text").innerText = `${currentPlayerName}, നിങ്ങൾ ${formattedTime} കൊണ്ട് 5 വാതിലുകളും കടന്ന് പുറത്തെത്തി!`;

    sendTimeToGoogleForm(currentPlayerName, currentAccessCode, formattedTime);
}

function sendTimeToGoogleForm(name, code, time) {
    const statusEl = document.getElementById("save-status");
    const formData = new URLSearchParams();

    formData.append(ENTRY_PLAYER_NAME, name);
    formData.append(ENTRY_ACCESS_CODE, code);
    formData.append(ENTRY_COMPLETION_TIME, time);

    fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
    })
    .then(() => {
        statusEl.innerText = "വിജയിച്ചു! നിങ്ങളുടെ സമയം Google Sheet-ൽ രേഖപ്പെടുത്തിയിട്ടുണ്ട്.";
        statusEl.style.color = "#00e676";
    })
    .catch((err) => {
        console.error("Google Form Submission Error:", err);
        statusEl.innerText = "സമയം സേവ് ചെയ്യുന്നതിൽ പിശക് സംഭവിച്ചു. ഇന്റർനെറ്റ് പരിശോധിക്കുക.";
        statusEl.style.color = "#ff5252";
    });
}