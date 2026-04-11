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
const score = document.getElementById("style-score");
const nameInput = document.getElementById("avatar-name");
const nameplate = document.getElementById("avatar-nameplate");
const saveMessage = document.getElementById("save-message");

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
  state.background = randomFrom(["cotton", "sunset", "disco", "ocean"]);
  renderControls();
  renderAvatar();
  saveMessage.textContent = "Ny tilfeldig avatar klar.";
});

document.getElementById("save-button").addEventListener("click", () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  saveMessage.textContent = "Avataren er lagret på denne enheten.";
});

renderControls();
renderAvatar();

function renderAvatar() {
  preview.dataset.bg = state.background;
  nameplate.textContent = state.name;
  nameInput.value = state.name;

  head.style.background = OPTIONS.skin[state.skin];
  hair.style.background = OPTIONS.hairColor[state.hairColor];
  body.style.background = OPTIONS.outfitColor[state.outfitColor];
  eyes.style.setProperty("--eye-color", OPTIONS.eyeColor[state.eyeColor]);

  hair.className = `avatar-hair hair-${state.hairStyle}`;
  eyes.className = `avatar-eyes eyes-${state.eyes}`;
  body.className = `avatar-body outfit-${state.outfit}`;
  accessory.className = `avatar-accessory accessory-${state.accessory}`;

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
