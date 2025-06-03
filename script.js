const array = new Array(25).fill(0);
const grid = document.getElementById("grid");
const cardsContainer = document.getElementById("cards");
const messages = document.getElementById("messages");
const popSound = new Audio("resources/pop.mp3");

let inputs = []; // track all inputs
let cardRules = [];
let messagesLog = []; // messages for Turing machine
let numSquares = array.length; // number of squares
let isRunning = false;
let halts = false; // does machine halt (essential for the game)
let numberOfCards = 3; // initial number of cards
let allowedLetters = "";
let regex = null; // regex for cards inputs
let oneCount = 0;
let shiftCount = 0;

const BB2 = {
  A0: "1RB",
  A1: "1LB",
  B0: "1LA",
  B1: "1RH",
};
const BB3 = {
  A0: "1RB",
  A1: "1RH",
  B0: "0RC",
  B1: "1RB",
  C0: "1LC",
  C1: "1LA",
};
const BB4 = {
  A0: "1RB",
  A1: "1LB",
  B0: "1LA",
  B1: "0LC",
  C0: "1RH",
  C1: "1LD",
  D0: "1RD",
  D1: "0RA",
};
// =========================== INITIALIZATION =============================

document.getElementById("startButton").addEventListener("click", async () => {
  if (isRunning) return;
  resetMachine();
  if (halts) {
    isRunning = true;
    clearMessagesLog();
    logMessage("Running machine...\n");
    await runTuringMachine();
  } else {
    clearMessagesLog();
    logMessage("Create valid machine before starting\n");
  }
});

document.getElementById("resetButton").addEventListener("click", () => {
  resetMachine();
  clearMessagesLog();
  logMessage("Machine reseted");
});

document.querySelectorAll(".bb-button").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.id;

    if (id === "bb2") {
      console.log("BB Σ(2) clicked");
      numberOfCards = 2;
      createRegex();
      createCards();
      inputs.forEach((input) => {
        input.value = BB2[input.id];
      });
      checkAllInputs();
    } else if (id === "bb3") {
      console.log("BB Σ(3) clicked");
      numberOfCards = 3;
      createRegex();
      createCards();
      inputs.forEach((input) => {
        input.value = BB3[input.id];
      });
      checkAllInputs();
    } else if (id === "bb4") {
      console.log("BB Σ(4) clicked");
      numberOfCards = 4;
      createRegex();
      createCards();
      inputs.forEach((input) => {
        input.value = BB4[input.id];
      });
      checkAllInputs();
    }
  });
});

document.querySelectorAll('input[name="numStates"]').forEach((radio) => {
  radio.addEventListener("change", (e) => {
    numberOfCards = parseInt(e.target.value);
    createRegex();
    createCards();
  });
});

createRegex();
createCards();
createSquares(numSquares);

// ================================ FUNCTIONS ==============================

function createRegex() {
  let allowedLetters = "";
  for (let i = 0; i < numberOfCards; i++) {
    allowedLetters += String.fromCharCode(65 + i); // A, B, C, ...
  }
  allowedLetters += allowedLetters.toLowerCase(); // add lowercase variants
  regex = new RegExp(`^[01][RLrl][${allowedLetters}Hh]$`);
}

function createSquares(numSquares) {
  grid.innerHTML = "";
  // Create each square
  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.textContent = array[i];
    if (array[i] === 1) {
      square.style.backgroundColor = "grey";
    } else if (array[i] === 0) {
      square.style.backgroundColor = "white";
    }
    grid.appendChild(square);
  }
}

function logMessage(text) {
  messagesLog.push(text);
  messages.textContent = messagesLog.join("\n");
}

function clearMessagesLog() {
  messagesLog = [];
  messages.textContent = "";
}

function createCards() {
  cardsContainer.innerHTML = "";
  inputs = [];
  cardRules = [];
  halts = false;
  isRunning = false;
  clearMessagesLog();
  resetMachine();

  for (let i = 0; i < numberOfCards; i++) {
    const card = document.createElement("div");
    card.className = "card";

    const label = document.createElement("div");
    label.className = "card-label";

    const cardLetter = String.fromCharCode(65 + i);
    label.textContent = cardLetter;

    const inputGroup0 = createInputGroup("0", cardLetter);
    const inputGroup1 = createInputGroup("1", cardLetter);

    card.appendChild(label);
    card.appendChild(inputGroup0.group);
    card.appendChild(inputGroup1.group);

    cardsContainer.appendChild(card);

    inputs.push(inputGroup0.input, inputGroup1.input);

    setupValidation(inputGroup0.input);
    setupValidation(inputGroup1.input);
  }
}

// Helper function to create input groups
function createInputGroup(digit, cardLetter) {
  const group = document.createElement("div");
  group.className = "input-group";

  const label = document.createElement("label");
  label.textContent = digit;

  const input = document.createElement("input");
  input.type = "text";
  input.maxLength = 3;
  input.id = cardLetter + digit;

  group.appendChild(label);
  group.appendChild(input);

  // returns group div and its input
  return { group, input };
}

// Validation setup
function setupValidation(input) {
  input.addEventListener("input", () => {
    let value = input.value.toUpperCase();

    if (value.length === 1 && !/[01]/.test(value[0])) {
      value = "";
    } else if (value.length === 2 && !/[RL]/.test(value[1])) {
      value = value[0];
    } else if (value.length === 3 && !/[A-EH]/.test(value[2])) {
      value = value.slice(0, 2);
    }

    input.value = value;
    input.style.backgroundColor = "white";
  });

  input.addEventListener("blur", () => {
    checkAllInputs();
  });
}

// Check all inputs after blur
function checkAllInputs() {
  let zCount = 0;
  messagesLog = [];

  inputs.forEach((input) => {
    const value = input.value.trim();
    if (!regex.test(value)) {
      input.style.backgroundColor = "red";
      logMessage(`Invalid format: "${value}" ${input.id[0]}->${input.id[1]}`);
      halts = false;
    } else {
      input.style.backgroundColor = "lightgreen";
      if (value[2] === "H" || value[2] === "h") {
        zCount++;
      }
    }
  });

  if (zCount === 0) {
    logMessage("No input ends with H");
    halts = false;
  } else if (zCount > 1) {
    logMessage("Multiple inputs end with H");
  }

  if (messagesLog.length === 0) {
    logMessage(
      "Valid turing machine\n\nTesting if machine halts in reasonable time...\n"
    );
    rebuildCardRules();
    halts = checkIfHalts();
  }
}

// cards data
function rebuildCardRules() {
  cardRules = [];

  cardsContainer.querySelectorAll(".card").forEach((card) => {
    const cardLabel = card.querySelector(".card-label").textContent;
    const cardInputs = card.querySelectorAll("input");

    cardRules.push({
      cardLetter: cardLabel,
      zero: {
        input: cardInputs[0].value,
        element: cardInputs[0],
      },
      one: {
        input: cardInputs[1].value,
        element: cardInputs[1],
      },
    });
  });
}

function checkIfHalts() {
  const testArray = new Array(10000).fill(0);
  let currIndex = 5000;
  let currState = "A";
  let steps = 0;
  const maxSteps = 100000; // max steps limit

  while (currIndex >= 0 && currIndex < testArray.length && steps < maxSteps) {
    const currentValue = testArray[currIndex];
    const rule = cardRules.find((r) => r.cardLetter === currState);

    if (!rule) {
      logMessage(`No rule for state ${currState}. Machine halts.`);
      return false;
    }

    let instruction = currentValue === 0 ? rule.zero.input : rule.one.input;

    const write = parseInt(instruction[0]);
    const move = instruction[1];
    const nextState = instruction[2].toUpperCase();

    testArray[currIndex] = write;

    if (move === "R" || move === "r") {
      currIndex++;
    } else if (move === "L" || move === "l") {
      currIndex--;
    }

    if (nextState === "H") {
      logMessage(`Reached halting state H. Machine halts.`);
      return true;
    } else {
      currState = nextState;
    }

    steps++;
  }
  if (steps >= maxSteps) {
    logMessage(`Exceeded maximum steps. Machine probably doesn't halt.`);
  } else {
    logMessage(`Index went out of bounds. Machine probably doesn't halt.`);
  }
  return false;
}

function createMachineCursor() {
  const machineCursor = document.createElement("div");
  machineCursor.id = "machine";

  const square =
    document.querySelectorAll(".square")[Math.floor(array.length / 2)];
  grid.appendChild(machineCursor);
  updateMachineCursor(square);
}

function updateMachineCursor(square) {
  const machineCursor = document.getElementById("machine");

  if (square) {
    const squareRect = square.getBoundingClientRect();
    machineCursor.style.left = `${
      squareRect.left + squareRect.width / 2 - 10
    }px`;
    machineCursor.style.top = `${squareRect.top - 20}px`;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTuringMachine() {
  oneCount = 0;
  shiftCount = 0;
  let currIndex = Math.floor(array.length / 2);
  let currState = "A";
  createMachineCursor();

  while (isRunning) {
    await sleep(400);
    if (!isRunning) break; // to avoid further execution, if machine is reseted, running stops immediately!

    // ============================== initialize variables ===============================
    let square = document.querySelectorAll(".square")[currIndex];
    const currentValue = array[currIndex];
    const rule = cardRules.find((r) => r.cardLetter === currState);
    const instruction = currentValue === 0 ? rule.zero.input : rule.one.input;
    setInputColor(rule.cardLetter, currentValue);
    const write = parseInt(instruction[0]);
    const move = instruction[1];
    const nextState = instruction[2].toUpperCase();

    // ============================== write ===============================
    playSound(popSound, 0.02);
    array[currIndex] = write;
    square.textContent = write;
    square.style.backgroundColor = write === 0 ? "white" : "grey";

    if (move === "R" || move === "r") {
      currIndex++;
    } else if (move === "L" || move === "l") {
      currIndex--;
    }
    oneCount = array.filter((x) => x === 1).length;
    updateScores();

    await sleep(200);
    if (!isRunning) break; // to avoid further execution, if machine is reseted, running stops immediately!

    // ============================== move ===============================
    square = document.querySelectorAll(".square")[currIndex];
    updateMachineCursor(square);
    await sleep(400);
    if (!isRunning) break; // to avoid further execution, if machine is reseted, running stops immediately!
    // ============================== set input color and next state ===============================
    shiftCount++;
    updateScores();
    setInputColor(rule.cardLetter, currentValue);
    currState = nextState;

    if (nextState === "H") {
      logMessage("HALTED");
      isRunning = false;
      break;
    }
  }
}

function resetMachine() {
  const machine = document.getElementById("machine");
  if (machine) {
    machine.remove();
  }
  isRunning = false;
  oneCount = 0;
  shiftCount = 0;
  updateScores();
  array.fill(0);
  createSquares(numSquares);
  cleanInputsColor();
}

function setInputColor(state, digit) {
  cleanInputsColor();

  inputs.forEach((input) => {
    if (input.id[0] === String(state) && input.id[1] === String(digit)) {
      input.style.backgroundColor = "#bf03bc";
    }
  });
}

function cleanInputsColor() {
  inputs.forEach((input) => {
    input.style.backgroundColor = "white";
  });
}

function updateScores() {
  document.getElementById("oneCount").textContent = oneCount.toLocaleString();
  document.getElementById("shiftCount").textContent =
    shiftCount.toLocaleString();
}

function playSound(sound, delay) {
  sound.currentTime = delay;
  sound.play();
}

function openNav() {
  document.querySelector(".sidenav").classList.add("open");
}

function closeNav() {
  document.querySelector(".sidenav").classList.remove("open");
}
