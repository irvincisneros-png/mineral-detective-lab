const minerals = [
  { name: "Calcite", density: 2.71, luster: "Vitreous to pearly", hardness: "3", streak: "White", acid: "Strong fizz", colors: ["#f7e8c1", "#9f8753"] },
  { name: "Fluorite", density: 3.18, luster: "Vitreous", hardness: "4", streak: "White", acid: "No reaction", colors: ["#a782d5", "#49346b"] },
  { name: "Gypsum", density: 2.32, luster: "Pearly to silky", hardness: "2", streak: "White", acid: "No reaction", colors: ["#f5efe3", "#afa99f"] },
  { name: "Halite", density: 2.17, luster: "Vitreous", hardness: "2.5", streak: "White", acid: "No reaction", colors: ["#d9edf0", "#6d9ca1"] },
  { name: "Magnetite", density: 5.18, luster: "Metallic", hardness: "5.5–6.5", streak: "Black", acid: "No reaction", colors: ["#626970", "#11151a"] },
  { name: "Pyrite", density: 5.02, luster: "Metallic", hardness: "6–6.5", streak: "Greenish-black", acid: "No reaction", colors: ["#e2ba4d", "#66501a"] },
  { name: "Quartz", density: 2.65, luster: "Vitreous", hardness: "7", streak: "White", acid: "No reaction", colors: ["#e7d7ef", "#796b88"] },
  { name: "Talc", density: 2.75, luster: "Pearly to greasy", hardness: "1", streak: "White", acid: "No reaction", colors: ["#a8c9ad", "#506d58"] },
];

const testDescriptions = {
  mass: ["Mass", "The balance was zeroed before the dry specimen was placed on the pan."],
  volume: ["Volume", "Water level change in the graduated cylinder gives the specimen's volume."],
  luster: ["Luster", "The specimen was rotated beneath a bright lamp and reflected light was observed."],
  hardness: ["Hardness", "Scratch tools were compared from softer to harder until the boundary was found."],
  streak: ["Streak", "The specimen was drawn once across an unglazed porcelain plate."],
  acid: ["Acid reaction", "One drop of dilute hydrochloric acid was added with eye protection in place."],
};

const state = {
  mineral: null,
  mass: null,
  volume: null,
  completed: new Set(),
  score: 0,
  caseNumber: 1,
  solved: false,
  guesses: 0,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function makeCase(advance = false) {
  if (advance) state.caseNumber = state.caseNumber >= 5 ? 1 : state.caseNumber + 1;

  const previous = state.mineral?.name;
  const choices = minerals.filter((mineral) => mineral.name !== previous);
  state.mineral = choices[Math.floor(Math.random() * choices.length)];
  state.volume = Number(randomBetween(8.4, 19.8).toFixed(1));
  state.mass = Number((state.volume * state.mineral.density * randomBetween(.995, 1.005)).toFixed(1));
  state.completed = new Set();
  state.solved = false;
  state.guesses = 0;

  $("#case-count").textContent = `${state.caseNumber} / 5`;
  $("#sample-code").textContent = `MX-${Math.floor(randomBetween(100, 999))}`;
  $("#case-status").textContent = "In progress";
  $("#case-status").classList.remove("solved");
  $("#sample-visual").style.setProperty("--sample-a", state.mineral.colors[0]);
  $("#sample-visual").style.setProperty("--sample-b", state.mineral.colors[1]);
  $("#sample-visual").style.transform = `rotate(${randomBetween(-8, 6).toFixed(1)}deg)`;
  $("#tests-complete").textContent = "0";
  $("#mineral-choice").value = "";
  $("#submit-answer").textContent = "Submit identification";
  $("#submit-answer").disabled = false;
  $("#answer-feedback").textContent = "";
  $("#answer-feedback").className = "answer-feedback";
  $("#mass-value").textContent = "—";
  $("#volume-value").textContent = "—";
  $("#density-value").textContent = "—";
  $("#result-console").innerHTML = `<div class="console-idle"><span aria-hidden="true">↖</span><p>Select a test to collect your first observation.</p></div>`;
  $$(".test-card").forEach((card) => {
    card.classList.remove("complete");
    card.querySelector(".test-state").textContent = "＋";
  });
  $$("#evidence-list > div").forEach((row) => {
    row.classList.remove("recorded");
    const defaults = {
      mass: "Not measured", volume: "Not measured", density: "Needs mass + volume",
      luster: "Not observed", hardness: "Not tested", streak: "Not tested", acid: "Not tested",
    };
    row.querySelector("dd").textContent = defaults[row.dataset.evidence];
  });
}

function getReading(test) {
  const mineral = state.mineral;
  const readings = {
    mass: `${state.mass.toFixed(1)} g`,
    volume: `${state.volume.toFixed(1)} mL`,
    luster: mineral.luster,
    hardness: `${mineral.hardness} on Mohs scale`,
    streak: mineral.streak,
    acid: mineral.acid,
  };
  return readings[test];
}

function runTest(test) {
  if (!testDescriptions[test] || state.solved) return { ok: false, reason: state.solved ? "Case already solved" : "Unknown test" };
  const [title, description] = testDescriptions[test];
  const reading = getReading(test);
  state.completed.add(test);

  const card = document.querySelector(`[data-test="${test}"]`);
  card.classList.add("complete");
  card.querySelector(".test-state").textContent = "✓";
  $("#tests-complete").textContent = state.completed.size;

  const evidenceRow = document.querySelector(`[data-evidence="${test}"]`);
  evidenceRow.classList.add("recorded");
  evidenceRow.querySelector("dd").textContent = reading;

  $("#result-console").innerHTML = `
    <article class="result-reading">
      <header><h3>${title}</h3><span class="mono-label">OBSERVATION RECORDED</span></header>
      <p class="reading">${reading}</p>
      <p>${description}</p>
    </article>`;

  if (state.completed.has("mass")) $("#mass-value").textContent = `${state.mass.toFixed(1)} g`;
  if (state.completed.has("volume")) $("#volume-value").textContent = `${state.volume.toFixed(1)} mL`;
  if (state.completed.has("mass") && state.completed.has("volume")) {
    const measuredDensity = (state.mass / state.volume).toFixed(2);
    $("#density-value").textContent = `${measuredDensity} g/mL`;
    const densityRow = document.querySelector('[data-evidence="density"]');
    densityRow.classList.add("recorded");
    densityRow.querySelector("dd").textContent = `${measuredDensity} g/mL`;
  }
  return { ok: true, test, reading };
}

function submitIdentification(choice) {
  if (!choice || state.solved) return { correct: false, reason: state.solved ? "Case already solved" : "No mineral selected" };
  state.guesses += 1;
  const feedback = $("#answer-feedback");
  if (choice === state.mineral.name) {
    const evidenceBonus = state.completed.size * 15;
    const guessBonus = Math.max(20, 100 - (state.guesses - 1) * 35);
    const points = evidenceBonus + guessBonus;
    state.score += points;
    state.solved = true;
    $("#score").textContent = state.score;
    $("#case-status").textContent = "Identified";
    $("#case-status").classList.add("solved");
    feedback.textContent = `Correct — the specimen is ${choice}. +${points} points.`;
    feedback.className = "answer-feedback success";
    $("#submit-answer").textContent = state.caseNumber === 5 ? "Investigation complete" : "Case solved";
    $("#submit-answer").disabled = true;
    showToast(`Case solved: ${choice}`);
    return { correct: true, mineral: choice, points, score: state.score };
  }
  feedback.textContent = `Not yet. Compare more than one property and try again.`;
  feedback.className = "answer-feedback error";
  return { correct: false, mineral: choice, attempts: state.guesses };
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function populateReference() {
  const select = $("#mineral-choice");
  const table = $("#key-table-body");
  minerals.forEach((mineral) => {
    const option = document.createElement("option");
    option.value = mineral.name;
    option.textContent = mineral.name;
    select.append(option);

    const row = document.createElement("tr");
    [mineral.name, `${mineral.density.toFixed(2)} g/mL`, mineral.luster, mineral.hardness, mineral.streak, mineral.acid].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });
    table.append(row);
  });
}

function registerWebMCPTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = (tool) => Promise.resolve(context.registerTool(tool)).catch(() => {});

  register({
    name: "run_mineral_test",
    title: "Run mineral test",
    description: "Run one visible test on the current unknown mineral and record the observation in the lab notebook.",
    inputSchema: { type: "object", properties: { test: { type: "string", enum: ["mass", "volume", "luster", "hardness", "streak", "acid"] } }, required: ["test"], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || !testDescriptions[input.test]) throw new Error("Choose a valid mineral test.");
      return runTest(input.test);
    },
  });

  register({
    name: "submit_mineral_identification",
    title: "Submit mineral identification",
    description: "Submit a mineral name as the identification for the current specimen.",
    inputSchema: { type: "object", properties: { mineral: { type: "string", enum: minerals.map((item) => item.name) } }, required: ["mineral"], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || !minerals.some((item) => item.name === input.mineral)) throw new Error("Choose a mineral from the identification key.");
      $("#mineral-choice").value = input.mineral;
      return submitIdentification(input.mineral);
    },
  });
}

populateReference();
makeCase();
registerWebMCPTools();

$("#test-grid").addEventListener("click", (event) => {
  const button = event.target.closest("[data-test]");
  if (button) runTest(button.dataset.test);
});

$("#identify-form").addEventListener("submit", (event) => {
  event.preventDefault();
  submitIdentification($("#mineral-choice").value);
});

$("#new-case").addEventListener("click", () => {
  const wasSolved = state.solved;
  makeCase(wasSolved);
  showToast(wasSolved ? "New case ready" : "Specimen replaced");
});

$("#key-button").addEventListener("click", () => $("#key-dialog").showModal());
$("#help-button").addEventListener("click", () => $("#help-dialog").showModal());
$$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$$('dialog').forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
}));
