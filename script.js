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
  const width = preview.offsetWidth;
  const height = preview.offsetHeight;
  const clonedPreview = preview.cloneNode(true);
  clonedPreview.id = "avatar-preview-export";

  const cssText = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>${escapeXml(cssText)}</style>
          ${clonedPreview.outerHTML}
        </div>
      </foreignObject>
    </svg>
  `;

  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.drawImage(image, 0, 0, width, height);

    const link = document.createElement("a");
    const safeName = (state.name || "timba-avatar").trim().replace(/[^\w\-]+/g, "-").toLowerCase();
    link.href = canvas.toDataURL("image/png");
    link.download = `${safeName || "timba-avatar"}.png`;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
