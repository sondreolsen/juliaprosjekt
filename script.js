const API_BASE = "https://api.dicebear.com/9.x/toon-head/svg";

const OPTIONS = {
  skin: {
    soft: "f1c3a5",
    warm: "c68e7a",
    tan: "b98e6a",
    deep: "a36b4f"
  },
  hairColor: {
    midnight: "2c1b18",
    chestnut: "724133",
    amber: "a55728",
    golden: "d6b370"
  },
  clothesColor: {
    berry: "b11f1f",
    pink: "ec4899",
    navy: "0b3286",
    orange: "f97316"
  }
};

const DEFAULT_STATE = {
  name: "Stjernevenn",
  seed: "avatar1-base",
  skin: "warm",
  hairStyle: "bun",
  rearHair: "longStraight",
  hairColor: "chestnut",
  eyes: "wide",
  eyebrows: "neutral",
  mouth: "smile",
  clothes: "turtleNeck",
  clothesColor: "orange",
  background: "cotton"
};

const STORAGE_KEY = "timba-avatar-state-v5";
const PREVIOUS_STORAGE_KEYS = [
  "timba-avatar-state-v4",
  "timba-avatar-state-v3",
  "timba-avatar-state-v2",
  "timba-avatar-state",
  "julia-avatar-state"
];

const state = loadState();

const preview = document.getElementById("avatar-preview");
const avatarImage = document.getElementById("avatar-image");
const score = document.getElementById("style-score");
const nameInput = document.getElementById("avatar-name");
const nameplate = document.getElementById("avatar-nameplate");
const saveMessage = document.getElementById("save-message");
const downloadButton = document.getElementById("download-button");

document.querySelectorAll("[data-setting]").forEach((group) => {
  group.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button) {
      return;
    }

    const setting = group.dataset.setting;
    state[setting] = button.dataset.value;
    syncButtons(group, button);
    renderAvatar();
  });
});

nameInput.addEventListener("input", () => {
  state.name = nameInput.value.trim() || DEFAULT_STATE.name;
  renderAvatar();
});

document.getElementById("randomize-button").addEventListener("click", () => {
  state.seed = createSeed();
  state.skin = randomKey(OPTIONS.skin);
  state.hairStyle = randomFrom(["bun", "sideComed", "spiky", "undercut"]);
  state.rearHair = randomFrom(["longStraight", "longWavy", "shoulderHigh", "neckHigh"]);
  state.hairColor = randomKey(OPTIONS.hairColor);
  state.eyes = randomFrom(["wide", "happy", "humble", "wink"]);
  state.eyebrows = randomFrom(["happy", "neutral", "raised", "sad"]);
  state.mouth = randomFrom(["smile", "laugh", "agape", "sad"]);
  state.clothes = randomFrom(["dress", "openJacket", "tShirt", "turtleNeck"]);
  state.clothesColor = randomKey(OPTIONS.clothesColor);
  state.background = randomFrom(["cotton", "sunset", "disco", "ocean"]);
  renderControls();
  renderAvatar();
  saveMessage.textContent = "Ny tilfeldig avatar klar.";
});

downloadButton.addEventListener("click", async () => {
  const originalLabel = downloadButton.textContent;
  downloadButton.disabled = true;
  downloadButton.textContent = "Lager bilde...";

  try {
    await downloadAvatarImage();
    saveMessage.textContent = "Bilde lastet ned.";
  } catch {
    saveMessage.textContent = "Kunne ikke lage bilde i denne nettleseren.";
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = originalLabel;
  }
});

renderControls();
renderAvatar();

function renderAvatar() {
  preview.dataset.bg = state.background;
  nameplate.textContent = state.name;
  nameInput.value = state.name;
  avatarImage.src = buildAvatarUrl(512);
  score.textContent = calculateScore();
  persistState();
}

function renderControls() {
  document.querySelectorAll("[data-setting]").forEach((group) => {
    const setting = group.dataset.setting;
    const selected = state[setting];
    group.querySelectorAll("button[data-value]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.value === selected);
    });
  });
}

function syncButtons(group, activeButton) {
  group.querySelectorAll("button[data-value]").forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
}

function buildAvatarUrl(size) {
  const params = new URLSearchParams({
    seed: state.seed,
    size: String(size),
    radius: "0",
    clip: "false",
    randomizeIds: "true",
    beardProbability: "0",
    hairProbability: "100",
    rearHairProbability: "100",
    backgroundColor: "transparent",
    body: "body",
    head: "head",
    hair: state.hairStyle,
    rearHair: state.rearHair,
    hairColor: OPTIONS.hairColor[state.hairColor],
    skinColor: OPTIONS.skin[state.skin],
    eyes: state.eyes,
    eyebrows: state.eyebrows,
    mouth: state.mouth,
    clothes: state.clothes,
    clothesColor: OPTIONS.clothesColor[state.clothesColor]
  });

  return `${API_BASE}?${params.toString()}`;
}

function calculateScore() {
  let total = 76;

  if (state.hairStyle === "bun" || state.rearHair === "longStraight") {
    total += 4;
  }
  if (state.clothes === "turtleNeck" || state.clothes === "openJacket") {
    total += 5;
  }
  if (state.hairColor === "chestnut" || state.clothesColor === "orange") {
    total += 5;
  }
  if (state.background === "sunset" || state.background === "disco") {
    total += 5;
  }
  if (state.eyes === "wide" || state.eyes === "humble") {
    total += 3;
  }
  if (state.mouth === "smile" || state.mouth === "laugh") {
    total += 3;
  }

  return total;
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      clearPreviousSavedState();
      return { ...DEFAULT_STATE };
    }

    const saved = JSON.parse(raw);
    return normalizeState(saved);
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function clearPreviousSavedState() {
  PREVIOUS_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
}

function normalizeState(saved) {
  const next = { ...DEFAULT_STATE, ...saved };

  if (!OPTIONS.skin[next.skin]) {
    next.skin = DEFAULT_STATE.skin;
  }
  if (!OPTIONS.hairColor[next.hairColor]) {
    next.hairColor = DEFAULT_STATE.hairColor;
  }
  if (!OPTIONS.clothesColor[next.clothesColor]) {
    next.clothesColor = DEFAULT_STATE.clothesColor;
  }
  if (!["bun", "sideComed", "spiky", "undercut"].includes(next.hairStyle)) {
    next.hairStyle = DEFAULT_STATE.hairStyle;
  }
  if (!["longStraight", "longWavy", "shoulderHigh", "neckHigh"].includes(next.rearHair)) {
    next.rearHair = DEFAULT_STATE.rearHair;
  }
  if (!["wide", "happy", "humble", "wink"].includes(next.eyes)) {
    next.eyes = DEFAULT_STATE.eyes;
  }
  if (!["happy", "neutral", "raised", "sad"].includes(next.eyebrows)) {
    next.eyebrows = DEFAULT_STATE.eyebrows;
  }
  if (!["smile", "laugh", "agape", "sad"].includes(next.mouth)) {
    next.mouth = DEFAULT_STATE.mouth;
  }
  if (!["dress", "openJacket", "tShirt", "turtleNeck"].includes(next.clothes)) {
    next.clothes = DEFAULT_STATE.clothes;
  }
  if (!["cotton", "sunset", "disco", "ocean"].includes(next.background)) {
    next.background = DEFAULT_STATE.background;
  }

  next.name = typeof next.name === "string" && next.name.trim() ? next.name.trim() : DEFAULT_STATE.name;
  next.seed = typeof next.seed === "string" && next.seed.trim() ? next.seed : DEFAULT_STATE.seed;
  return next;
}

function randomKey(object) {
  return randomFrom(Object.keys(object));
}

function randomFrom(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function createSeed() {
  return `timba-${Math.random().toString(36).slice(2, 10)}`;
}

async function downloadAvatarImage() {
  const safeName = (state.name || "timba-avatar").trim().replace(/[^\w\-]+/g, "-").toLowerCase();
  const width = 960;
  const height = 1180;
  const response = await fetch(buildAvatarUrl(1024));
  if (!response.ok) {
    throw new Error("Avatar request failed");
  }

  const svgText = await response.text();
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    drawPosterBackground(context, width, height, state.background);
    drawContainImage(context, image, 110, 70, width - 220, height - 250);
    drawNameplate(context, width, height, state.name);

    triggerDownload(canvas.toDataURL("image/png"), `${safeName || "timba-avatar"}.png`);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function drawPosterBackground(context, width, height, background) {
  let gradient;

  if (background === "sunset") {
    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#ffd36f");
    gradient.addColorStop(0.4, "#ffb38a");
    gradient.addColorStop(0.75, "#f66eae");
    gradient.addColorStop(1, "#b5179e");
  } else if (background === "disco") {
    gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#4930b4");
    gradient.addColorStop(0.38, "#7d55ff");
    gradient.addColorStop(1, "#ff5aa6");
  } else if (background === "ocean") {
    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#bff6ff");
    gradient.addColorStop(0.42, "#84e7ff");
    gradient.addColorStop(1, "#25bfd9");
  } else {
    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#ffe8f2");
    gradient.addColorStop(1, "#ffd0e6");
  }

  context.fillStyle = gradient;
  roundRect(context, 0, 0, width, height, 44);
  context.fill();

  drawGlow(context, width * 0.24, height * 0.18, width * 0.16, "rgba(255,255,255,0.82)");
  drawGlow(
    context,
    width * 0.8,
    height * 0.16,
    width * 0.14,
    background === "sunset" ? "rgba(255,196,102,0.42)" : background === "ocean" ? "rgba(0,207,255,0.24)" : "rgba(255,196,219,0.34)"
  );
}

function drawGlow(context, x, y, radius, color) {
  const glow = context.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, color);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = glow;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function drawContainImage(context, image, x, y, width, height) {
  const scale = Math.min(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawNameplate(context, width, height, label) {
  const text = label || DEFAULT_STATE.name;
  context.font = "700 34px Quicksand, Arial, sans-serif";
  const textWidth = context.measureText(text).width;
  const plateWidth = Math.max(190, textWidth + 72);
  const x = (width - plateWidth) / 2;
  const y = height - 118;

  context.fillStyle = "rgba(85,37,59,0.82)";
  roundRect(context, x, y, plateWidth, 70, 35);
  context.fill();

  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, width / 2, y + 37);
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function triggerDownload(dataUrl, fileName) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
