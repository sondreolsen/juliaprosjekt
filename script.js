const OPTIONS = {
  skin: {
    peach: "#f6c7a4",
    golden: "#d9966d",
    espresso: "#7a4a2f",
    rose: "#f0b6c1"
  },
  hairColor: {
    pink: "#ff64b4",
    violet: "#834dff",
    cyan: "#00cfff",
    sun: "#ffb703"
  },
  eyeColor: {
    berry: "#ff4f87",
    mint: "#00d4b4",
    night: "#3d348b",
    gold: "#ffbe0b"
  },
  outfitColor: {
    bubblegum: "#ff5da2",
    lime: "#97e600",
    orange: "#ff7b00",
    sky: "#5ac8fa"
  }
};

const DEFAULT_STATE = {
  name: "Stjernevenn",
  skin: "peach",
  hairStyle: "cloud",
  hairColor: "pink",
  eyes: "sparkle",
  eyeColor: "berry",
  outfit: "dress",
  outfitColor: "bubblegum",
  accessory: "bow",
  hairBling: "clip",
  jewelry: "necklace",
  background: "cotton"
};

const STORAGE_KEY = "timba-avatar-state";
const LEGACY_STORAGE_KEY = "julia-avatar-state";

const state = loadState();

const preview = document.getElementById("avatar-preview");
const hair = document.getElementById("avatar-hair");
const head = document.getElementById("avatar-head");
const eyes = document.getElementById("avatar-eyes");
const body = document.getElementById("avatar-body");
const accessory = document.getElementById("avatar-accessory");
const hairBling = document.getElementById("avatar-hair-bling");
const jewelry = document.getElementById("avatar-jewelry");
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
  state.hairStyle = randomFrom(["cloud", "bob", "spike", "buns"]);
  state.hairColor = randomKey(OPTIONS.hairColor);
  state.eyes = randomFrom(["sparkle", "wink", "dreamy"]);
  state.eyeColor = randomKey(OPTIONS.eyeColor);
  state.outfit = randomFrom(["dress", "hoodie", "cape"]);
  state.outfitColor = randomKey(OPTIONS.outfitColor);
  state.accessory = randomFrom(["bow", "glasses", "star", "none"]);
  state.hairBling = randomFrom(["clip", "pearls", "tiara", "none"]);
  state.jewelry = randomFrom(["necklace", "choker", "earrings", "none"]);
  state.background = randomFrom(["cotton", "sunset", "disco", "ocean"]);
  renderControls();
  renderAvatar();
  saveMessage.textContent = "Ny tilfeldig avatar klar.";
});

document.getElementById("save-button").addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveMessage.textContent = "Avataren er lagret på denne enheten.";
});

downloadButton.addEventListener("click", async () => {
  const originalLabel = downloadButton.textContent;
  downloadButton.disabled = true;
  downloadButton.textContent = "Lager PNG...";

  try {
    await downloadAvatarPng();
    saveMessage.textContent = "PNG lastet ned.";
  } catch {
    saveMessage.textContent = "Kunne ikke lage PNG i denne nettleseren.";
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

  head.style.background = OPTIONS.skin[state.skin];
  hair.style.background = OPTIONS.hairColor[state.hairColor];
  body.style.background = OPTIONS.outfitColor[state.outfitColor];

  hair.className = `avatar-hair hair-${state.hairStyle}`;
  eyes.className = `avatar-eyes eyes-${state.eyes}`;
  body.className = `avatar-body outfit-${state.outfit}`;
  accessory.className = `avatar-accessory accessory-${state.accessory}`;
  hairBling.className = `avatar-hair-bling hair-bling-${state.hairBling}`;
  jewelry.className = `avatar-jewelry jewelry-${state.jewelry}`;

  score.textContent = calculateScore();
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
  let total = 70;
  if (state.hairColor === "pink" || state.outfitColor === "bubblegum") {
    total += 8;
  }
  if (state.background === "disco" || state.background === "sunset") {
    total += 6;
  }
  if (state.accessory !== "none") {
    total += 5;
  }
  if (state.hairBling !== "none") {
    total += 4;
  }
  if (state.jewelry !== "none") {
    total += 4;
  }
  if (state.eyes === "dreamy") {
    total += 4;
  }
  return total;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...saved };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function randomKey(object) {
  return randomFrom(Object.keys(object));
}

function randomFrom(values) {
  return values[Math.floor(Math.random() * values.length)];
}

async function downloadAvatarPng() {
  const width = 720;
  const height = 960;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  drawAvatarPoster(context, width, height);

  const link = document.createElement("a");
  const safeName = (state.name || "timba-avatar").trim().replace(/[^\w\-]+/g, "-").toLowerCase();
  link.href = canvas.toDataURL("image/png");
  link.download = `${safeName || "timba-avatar"}.png`;
  link.click();
}

function drawAvatarPoster(context, width, height) {
  const skin = OPTIONS.skin[state.skin];
  const hairColor = OPTIONS.hairColor[state.hairColor];
  const outfitColor = OPTIONS.outfitColor[state.outfitColor];
  const eyeColor = OPTIONS.eyeColor[state.eyeColor];

  drawBackground(context, width, height);

  context.save();
  context.translate(width / 2, height / 2 + 30);

  drawLegs(context);
  drawShoes(context);
  drawArms(context, skin);
  drawBody(context, outfitColor);
  drawNeck(context, skin);
  drawHead(context, skin);
  drawHair(context, hairColor);
  drawFace(context, eyeColor);
  drawAccessory(context);
  drawHairBling(context);
  drawJewelry(context);

  context.restore();

  drawNameplate(context, width, height);
}

function drawBackground(context, width, height) {
  let gradient;
  if (state.background === "sunset") {
    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#ffd166");
    gradient.addColorStop(0.5, "#ff8fab");
    gradient.addColorStop(1, "#b5179e");
  } else if (state.background === "disco") {
    gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#3d348b");
    gradient.addColorStop(0.45, "#834dff");
    gradient.addColorStop(1, "#ff4f87");
  } else if (state.background === "ocean") {
    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#90e0ef");
    gradient.addColorStop(0.5, "#48cae4");
    gradient.addColorStop(1, "#00b4d8");
  } else {
    gradient = context.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#ffe6f0");
    gradient.addColorStop(1, "#ffd6ec");
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  drawGlow(context, width * 0.2, height * 0.18, 110, "rgba(255,255,255,0.6)");
  drawGlow(context, width * 0.78, height * 0.26, 70, "rgba(255,190,11,0.35)");
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

function drawLegs(context) {
  context.fillStyle = "#cfe6ff";
  roundRect(context, -52, 158, 34, 156, 18);
  roundRect(context, 18, 158, 34, 156, 18);
  context.fill();
}

function drawShoes(context) {
  context.fillStyle = "#17191f";
  roundRect(context, -70, 302, 62, 28, 14);
  roundRect(context, 8, 302, 62, 28, 14);
  context.fill();

  context.fillStyle = "#ffffff";
  roundRect(context, -62, 316, 46, 7, 4);
  roundRect(context, 16, 316, 46, 7, 4);
  context.fill();

  context.strokeStyle = "rgba(151,230,0,0.7)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(-66, 323);
  context.lineTo(-12, 323);
  context.moveTo(12, 323);
  context.lineTo(66, 323);
  context.stroke();
}

function drawArms(context, skin) {
  context.fillStyle = skin;
  context.save();
  context.translate(-86, 32);
  context.rotate(0.08);
  roundRect(context, 0, 0, 26, 160, 13);
  context.fill();
  context.restore();

  context.save();
  context.translate(60, 32);
  context.rotate(-0.08);
  roundRect(context, 0, 0, 26, 160, 13);
  context.fill();
  context.restore();
}

function drawBody(context, outfitColor) {
  context.fillStyle = outfitColor;

  if (state.outfit === "dress") {
    context.beginPath();
    context.moveTo(-48, 22);
    context.lineTo(48, 22);
    context.lineTo(102, 194);
    context.lineTo(-102, 194);
    context.closePath();
    context.fill();
  } else if (state.outfit === "cape") {
    context.beginPath();
    context.moveTo(-54, 20);
    context.lineTo(54, 20);
    context.lineTo(100, 186);
    context.lineTo(-100, 186);
    context.closePath();
    context.fill();
  } else {
    roundRect(context, -64, 22, 128, 162, 30);
    context.fill();
  }

  context.fillStyle = "rgba(255,255,255,0.78)";
  context.beginPath();
  context.moveTo(-34, 18);
  context.quadraticCurveTo(0, 56, 34, 18);
  context.lineTo(20, 0);
  context.lineTo(-20, 0);
  context.closePath();
  context.fill();
}

function drawNeck(context, skin) {
  context.fillStyle = skin;
  roundRect(context, -16, -4, 32, 34, 10);
  context.fill();
}

function drawHead(context, skin) {
  context.fillStyle = skin;
  context.beginPath();
  context.ellipse(0, -60, 64, 92, 0, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.ellipse(-72, -56, 10, 20, 0, 0, Math.PI * 2);
  context.ellipse(72, -56, 10, 20, 0, 0, Math.PI * 2);
  context.fill();
}

function drawHair(context, hairColor) {
  context.fillStyle = hairColor;

  if (state.hairStyle === "buns") {
    context.beginPath();
    context.arc(-54, -158, 26, 0, Math.PI * 2);
    context.arc(54, -158, 26, 0, Math.PI * 2);
    context.fill();
    roundRect(context, -56, -154, 112, 74, 28);
    context.fill();
  } else if (state.hairStyle === "spike") {
    context.beginPath();
    context.moveTo(-70, -82);
    context.lineTo(-54, -146);
    context.lineTo(-22, -108);
    context.lineTo(0, -160);
    context.lineTo(24, -114);
    context.lineTo(52, -144);
    context.lineTo(72, -82);
    context.closePath();
    context.fill();
  } else if (state.hairStyle === "bob") {
    roundRect(context, -86, -162, 172, 112, 34);
    context.fill();
    roundRect(context, -82, -104, 32, 104, 18);
    roundRect(context, 50, -104, 32, 104, 18);
    context.fill();
  } else {
    roundRect(context, -88, -162, 176, 100, 38);
    context.fill();
    roundRect(context, -84, -108, 30, 100, 18);
    roundRect(context, 54, -108, 30, 100, 18);
    context.fill();
  }
}

function drawFace(context, eyeColor) {
  context.strokeStyle = "rgba(89,38,58,0.82)";
  context.lineWidth = 6;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(-34, -96);
  context.quadraticCurveTo(-24, -104, -12, -96);
  context.moveTo(12, -96);
  context.quadraticCurveTo(24, -104, 34, -96);
  context.stroke();

  drawEye(context, -24, -62, eyeColor, state.eyes === "wink" ? "open" : state.eyes);
  drawEye(context, 24, -62, eyeColor, state.eyes === "wink" ? "wink" : state.eyes);

  context.strokeStyle = "rgba(181,118,107,0.55)";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, -36);
  context.lineTo(6, -12);
  context.lineTo(0, -4);
  context.stroke();

  context.fillStyle = "rgba(255,118,165,0.26)";
  context.beginPath();
  context.ellipse(-42, -10, 14, 8, 0, 0, Math.PI * 2);
  context.ellipse(42, -10, 14, 8, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#c75870";
  context.beginPath();
  context.ellipse(0, 20, 15, 8, 0, 0, Math.PI * 2);
  context.fill();
}

function drawEye(context, x, y, eyeColor, mode) {
  if (mode === "wink") {
    context.strokeStyle = "rgba(89,38,58,0.85)";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(x - 10, y);
    context.quadraticCurveTo(x, y + 8, x + 10, y);
    context.stroke();
    return;
  }

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.ellipse(x, y, 15, mode === "dreamy" ? 15 : 18, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "rgba(89,38,58,0.85)";
  context.lineWidth = 3;
  context.stroke();

  context.strokeStyle = "rgba(89,38,58,0.82)";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x, y - 8, 12, Math.PI * 1.08, Math.PI * 1.92);
  context.stroke();

  context.fillStyle = eyeColor;
  context.beginPath();
  context.ellipse(x, y + 2, 8, 11, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(x + 2, y - 3, 3, 0, Math.PI * 2);
  context.fill();
}

function drawAccessory(context) {
  if (state.accessory === "none") {
    return;
  }

  if (state.accessory === "bow") {
    context.fillStyle = "#ff4f87";
    context.save();
    context.translate(42, -150);
    context.rotate(0.15);
    roundRect(context, -24, -8, 18, 16, 6);
    roundRect(context, 6, -8, 18, 16, 6);
    context.fill();
    context.restore();
    return;
  }

  if (state.accessory === "glasses") {
    context.strokeStyle = "#55253b";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(-22, -64, 18, 0, Math.PI * 2);
    context.arc(22, -64, 18, 0, Math.PI * 2);
    context.moveTo(-4, -64);
    context.lineTo(4, -64);
    context.stroke();
    return;
  }

  context.fillStyle = "#ffbe0b";
  drawStar(context, 60, -150, 18, 9);
}

function drawHairBling(context) {
  if (state.hairBling === "none") {
    return;
  }

  if (state.hairBling === "clip") {
    context.save();
    context.translate(52, -132);
    context.rotate(-0.3);
    context.fillStyle = "#ffb3d1";
    roundRect(context, -18, -6, 36, 12, 6);
    context.fill();
    context.restore();
    return;
  }

  if (state.hairBling === "pearls") {
    context.fillStyle = "#ffffff";
    [-20, 0, 20].forEach((offset) => {
      context.beginPath();
      context.arc(offset + 26, -140 + Math.abs(offset) / 8, 6, 0, Math.PI * 2);
      context.fill();
    });
    return;
  }

  context.strokeStyle = "#f7d36f";
  context.lineWidth = 4;
  context.beginPath();
  context.arc(0, -144, 34, Math.PI, 0);
  context.stroke();
  drawStar(context, -18, -154, 8, 4);
  drawStar(context, 18, -154, 8, 4);
}

function drawJewelry(context) {
  if (state.jewelry === "none") {
    return;
  }

  if (state.jewelry === "choker") {
    context.fillStyle = "#b5179e";
    roundRect(context, -28, 10, 56, 10, 5);
    context.fill();
    return;
  }

  if (state.jewelry === "earrings") {
    context.strokeStyle = "#ffd84d";
    context.lineWidth = 4;
    context.beginPath();
    context.arc(-76, -52, 8, 0, Math.PI);
    context.arc(76, -52, 8, 0, Math.PI);
    context.stroke();
    return;
  }

  context.strokeStyle = "#f5d96b";
  context.lineWidth = 4;
  context.beginPath();
  context.arc(0, 18, 34, 0.2, Math.PI - 0.2);
  context.stroke();
  context.fillStyle = "#ffd84d";
  context.beginPath();
  context.arc(0, 52, 7, 0, Math.PI * 2);
  context.fill();
}

function drawNameplate(context, width, height) {
  const label = state.name || "Stjernevenn";
  context.font = "bold 32px Quicksand, sans-serif";
  const textWidth = context.measureText(label).width;
  const plateWidth = Math.max(170, textWidth + 56);
  const x = (width - plateWidth) / 2;
  const y = height - 84;

  context.fillStyle = "rgba(85,37,59,0.82)";
  roundRect(context, x, y, plateWidth, 56, 28);
  context.fill();

  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, width / 2, y + 30);
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

function drawStar(context, x, y, outerRadius, innerRadius) {
  context.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI / 5) * i;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    if (i === 0) {
      context.moveTo(pointX, pointY);
    } else {
      context.lineTo(pointX, pointY);
    }
  }
  context.closePath();
  context.fill();
}
