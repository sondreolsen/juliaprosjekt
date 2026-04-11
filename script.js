const OPTIONS = {
  skin: {
    peach: "#f4c4a4",
    golden: "#d79b72",
    deep: "#9f6546",
    rose: "#f1c5c8"
  },
  hairColor: {
    midnight: "#2f3148",
    chestnut: "#6d3f35",
    rosepop: "#ff5fa8",
    teal: "#1298c5"
  },
  eyeColor: {
    brown: "#6c4a38",
    hazel: "#9c7741",
    sea: "#279db1",
    violet: "#6a5cff"
  },
  outfitColor: {
    berry: "#a0173a",
    pink: "#ff63ab",
    navy: "#4452a3",
    sun: "#ff9e16"
  }
};

const DEFAULT_STATE = {
  name: "Stjernevenn",
  skin: "golden",
  hairStyle: "bun",
  hairColor: "chestnut",
  eyes: "bright",
  eyeColor: "brown",
  outfit: "top",
  outfitColor: "sun",
  accessory: "none",
  hairBling: "none",
  jewelry: "none",
  background: "cotton"
};

const STORAGE_KEY = "timba-avatar-state-v2";
const PREVIOUS_STORAGE_KEYS = ["timba-avatar-state", "julia-avatar-state"];

const LEGACY_MAP = {
  hairStyle: {
    braid: "bun",
    cloud: "waves",
    buns: "bun",
    spike: "swept",
    bob: "bob"
  },
  eyes: {
    sparkle: "bright",
    dreamy: "soft",
    wink: "wink"
  },
  outfit: {
    dress: "dress",
    hoodie: "top",
    cape: "blazer"
  },
  hairColor: {
    pink: "rosepop",
    violet: "midnight",
    cyan: "teal",
    sun: "chestnut"
  },
  eyeColor: {
    berry: "brown",
    mint: "sea",
    night: "brown",
    gold: "hazel"
  },
  outfitColor: {
    bubblegum: "pink",
    lime: "sun",
    orange: "sun",
    sky: "navy"
  }
};

const state = loadState();

const preview = document.getElementById("avatar-preview");
const avatarCanvas = document.getElementById("avatar-canvas");
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
  state.skin = randomKey(OPTIONS.skin);
  state.hairStyle = randomFrom(["bun", "waves", "swept", "bob"]);
  state.hairColor = randomKey(OPTIONS.hairColor);
  state.eyes = randomFrom(["bright", "wink", "soft"]);
  state.eyeColor = randomKey(OPTIONS.eyeColor);
  state.outfit = randomFrom(["dress", "blazer", "top"]);
  state.outfitColor = randomKey(OPTIONS.outfitColor);
  state.accessory = randomFrom(["none", "bow", "glasses", "star"]);
  state.hairBling = randomFrom(["clip", "pearls", "tiara", "none"]);
  state.jewelry = randomFrom(["necklace", "choker", "earrings", "none"]);
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

  preview.style.setProperty("--skin-color", OPTIONS.skin[state.skin]);
  preview.style.setProperty("--hair-color", OPTIONS.hairColor[state.hairColor]);
  preview.style.setProperty("--outfit-color", OPTIONS.outfitColor[state.outfitColor]);
  preview.style.setProperty("--eye-color", OPTIONS.eyeColor[state.eyeColor]);

  toggleVariant('[data-style]', state.hairStyle);
  toggleVariant('[data-eyes]', state.eyes);
  toggleVariant('[data-outfit]', state.outfit);
  toggleVariant('[data-accessory]', state.accessory);
  toggleVariant('[data-hair-bling]', state.hairBling);
  toggleVariant('[data-jewelry]', state.jewelry);

  score.textContent = calculateScore();
  persistState();
}

function toggleVariant(selector, activeValue) {
  avatarCanvas.querySelectorAll(selector).forEach((node) => {
    const isActive = Object.values(node.dataset).includes(activeValue);
    node.toggleAttribute("hidden", !isActive);
  });
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

function calculateScore() {
  let total = 74;

  if (state.hairStyle === "bun" || state.hairStyle === "waves") {
    total += 4;
  }
  if (state.outfit === "blazer") {
    total += 5;
  }
  if (state.hairColor === "rosepop" || state.outfitColor === "pink") {
    total += 6;
  }
  if (state.background === "sunset" || state.background === "disco") {
    total += 5;
  }
  if (state.accessory !== "none") {
    total += 3;
  }
  if (state.hairBling !== "none") {
    total += 4;
  }
  if (state.jewelry !== "none") {
    total += 4;
  }
  if (state.eyes === "soft") {
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

  next.hairStyle = mapLegacyValue("hairStyle", next.hairStyle);
  next.eyes = mapLegacyValue("eyes", next.eyes);
  next.outfit = mapLegacyValue("outfit", next.outfit);
  next.hairColor = mapLegacyValue("hairColor", next.hairColor);
  next.eyeColor = mapLegacyValue("eyeColor", next.eyeColor);
  next.outfitColor = mapLegacyValue("outfitColor", next.outfitColor);

  if (!OPTIONS.skin[next.skin]) {
    next.skin = DEFAULT_STATE.skin;
  }
  if (!OPTIONS.hairColor[next.hairColor]) {
    next.hairColor = DEFAULT_STATE.hairColor;
  }
  if (!OPTIONS.eyeColor[next.eyeColor]) {
    next.eyeColor = DEFAULT_STATE.eyeColor;
  }
  if (!OPTIONS.outfitColor[next.outfitColor]) {
    next.outfitColor = DEFAULT_STATE.outfitColor;
  }
  if (!["bun", "waves", "swept", "bob"].includes(next.hairStyle)) {
    next.hairStyle = DEFAULT_STATE.hairStyle;
  }
  if (!["bright", "wink", "soft"].includes(next.eyes)) {
    next.eyes = DEFAULT_STATE.eyes;
  }
  if (!["dress", "blazer", "top"].includes(next.outfit)) {
    next.outfit = DEFAULT_STATE.outfit;
  }
  if (!["none", "bow", "glasses", "star"].includes(next.accessory)) {
    next.accessory = DEFAULT_STATE.accessory;
  }
  if (!["clip", "pearls", "tiara", "none"].includes(next.hairBling)) {
    next.hairBling = DEFAULT_STATE.hairBling;
  }
  if (!["necklace", "choker", "earrings", "none"].includes(next.jewelry)) {
    next.jewelry = DEFAULT_STATE.jewelry;
  }
  if (!["cotton", "sunset", "disco", "ocean"].includes(next.background)) {
    next.background = DEFAULT_STATE.background;
  }

  next.name = typeof next.name === "string" && next.name.trim() ? next.name.trim() : DEFAULT_STATE.name;
  return next;
}

function mapLegacyValue(key, value) {
  const mapping = LEGACY_MAP[key];
  return mapping?.[value] || value;
}

function randomKey(object) {
  return randomFrom(Object.keys(object));
}

function randomFrom(values) {
  return values[Math.floor(Math.random() * values.length)];
}

async function downloadAvatarImage() {
  const safeName = (state.name || "timba-avatar").trim().replace(/[^\w\-]+/g, "-").toLowerCase();
  const width = 860;
  const height = 1140;
  const svgMarkup = buildExportSvg(width, height);
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);
    triggerDownload(canvas.toDataURL("image/png"), `${safeName || "timba-avatar"}.png`);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function buildExportSvg(width, height) {
  const label = escapeXml(state.name || DEFAULT_STATE.name);
  const plateWidth = Math.max(210, label.length * 18 + 84);
  const plateX = (width - plateWidth) / 2;
  const svgContent = avatarCanvas.innerHTML;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        ${buildBackgroundDefs()}
      </defs>
      <style>
        ${buildExportStyles()}
      </style>
      ${buildBackgroundMarkup(width, height)}
      <svg x="0" y="40" width="${width}" height="${height - 120}" viewBox="0 0 420 520">
        ${svgContent}
      </svg>
      <g>
        <rect x="${plateX}" y="${height - 112}" width="${plateWidth}" height="64" rx="32" fill="rgba(85,37,59,0.82)" />
        <text x="${width / 2}" y="${height - 72}" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" font-size="32" font-weight="700" font-family="Quicksand, Arial, sans-serif">${label}</text>
      </g>
    </svg>
  `;
}

function buildExportStyles() {
  return `
    [hidden] { display: none !important; }
    .avatar-figure { transform-origin: center center; }
    .skin-fill { fill: ${OPTIONS.skin[state.skin]}; }
    .hair-fill { fill: ${OPTIONS.hairColor[state.hairColor]}; }
    .hair-shadow { opacity: 0.28; }
    .face-shadow { fill: rgba(123, 69, 55, 0.16); }
    .soft-shadow { opacity: 0.6; }
    .ear-shadow { opacity: 0.96; }
    .blush-fill { fill: rgba(245, 130, 155, 0.28); }
    .eye-white { fill: #ffffff; stroke: rgba(96, 62, 62, 0.45); stroke-width: 2.4; }
    .iris-fill { fill: ${OPTIONS.eyeColor[state.eyeColor]}; }
    .pupil-fill { fill: rgba(34, 26, 31, 0.9); }
    .eye-shine { fill: rgba(255, 255, 255, 0.95); }
    .brow-stroke, .lash-stroke, .wink-stroke, .nose-stroke, .smile-stroke, .glasses-bridge, .glasses-stroke, .jewel-stroke, .tiara-stroke { fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .brow-stroke { stroke: #4a3841; stroke-width: 5.4; }
    .lash-stroke { stroke: #40343c; stroke-width: 4.2; }
    .wink-stroke { stroke: #40343c; stroke-width: 4.4; }
    .nose-stroke { stroke: rgba(140, 91, 76, 0.64); stroke-width: 3.2; }
    .mouth-fill { fill: rgba(191, 98, 108, 0.88); }
    .smile-stroke { stroke: rgba(154, 70, 83, 0.82); stroke-width: 2.6; }
    .outfit-fill { fill: ${OPTIONS.outfitColor[state.outfitColor]}; }
    .outfit-shadow { fill: rgba(58, 27, 43, 0.18); }
    .outfit-neckline, .shirt-fill { fill: rgba(255, 255, 255, 0.92); }
    .lapel-fill { fill: rgba(255, 255, 255, 0.84); }
    .sleeve-fill { fill: ${lightenColor(OPTIONS.outfitColor[state.outfitColor], 12)}; }
    .accent-fill { fill: #ff7fb8; }
    .accent-strong-fill { fill: #ff4e93; }
    .star-fill { fill: #ffd34f; }
    .bling-fill { fill: #ffd0e5; }
    .bling-shine, .pearl-fill { fill: rgba(255, 255, 255, 0.96); }
    .tiara-fill { fill: #f7d36f; }
    .tiara-stroke { stroke: #f1cb59; stroke-width: 4.5; }
    .jewel-fill { fill: #ffd34f; }
    .jewel-stroke { stroke: #f0cf62; stroke-width: 4; }
    .choker-band, .choker-band-soft { fill: none; stroke-linecap: round; }
    .choker-band { stroke: #d26ab1; stroke-width: 5; }
    .choker-band-soft { stroke: rgba(255, 232, 245, 0.95); stroke-width: 2.2; }
    .choker-drop { fill: #f4b6d6; }
    .choker-stone { fill: #fff2fa; stroke: #d26ab1; stroke-width: 2; }
    .glasses-stroke, .glasses-bridge { stroke: rgba(79, 57, 70, 0.92); stroke-width: 4; }
  `;
}

function buildBackgroundDefs() {
  const gradients = {
    cotton: ["#ffe8f2", "#ffd0e6"],
    sunset: ["#ffd36f", "#b5179e"],
    disco: ["#4930b4", "#ff5aa6"],
    ocean: ["#bff6ff", "#25bfd9"]
  };

  const [startColor, endColor] = gradients[state.background];
  const glowTwo = state.background === "ocean"
    ? { color: "#00cfff", opacity: "0.24" }
    : state.background === "sunset"
      ? { color: "#ffc466", opacity: "0.42" }
      : { color: "#ffc4db", opacity: "0.34" };

  return `
    <linearGradient id="bg-gradient" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${startColor}" />
      <stop offset="100%" stop-color="${endColor}" />
    </linearGradient>
    <radialGradient id="glow-one" cx="24%" cy="18%" r="24%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glow-two" cx="80%" cy="16%" r="20%">
      <stop offset="0%" stop-color="${glowTwo.color}" stop-opacity="${glowTwo.opacity}" />
      <stop offset="100%" stop-color="${glowTwo.color}" stop-opacity="0" />
    </radialGradient>
  `;
}

function buildBackgroundMarkup(width, height) {
  return `
    <rect width="${width}" height="${height}" rx="48" fill="url(#bg-gradient)" />
    <circle cx="${Math.round(width * 0.24)}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.16)}" fill="url(#glow-one)" />
    <circle cx="${Math.round(width * 0.8)}" cy="${Math.round(height * 0.16)}" r="${Math.round(width * 0.14)}" fill="url(#glow-two)" />
  `;
}

function lightenColor(hexColor, amount) {
  const color = hexColor.replace("#", "");
  const numeric = parseInt(color, 16);
  const adjust = (value) => Math.min(255, Math.round(value + ((255 - value) * amount) / 100));
  const red = adjust((numeric >> 16) & 255);
  const green = adjust((numeric >> 8) & 255);
  const blue = adjust(numeric & 255);
  return `rgb(${red}, ${green}, ${blue})`;
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

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
