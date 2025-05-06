const array = new Array(23).fill(0);
const grid = document.getElementById('grid');
const cardsContainer = document.getElementById('cards');
const messages = document.getElementById('messages');
const popSound = new Audio('resources/pop.mp3');

let inputs = []; // track all inputs
let cardRules = [];
let messagesLog = []; // messages for Turing machine
let numSquares = array.length; // number of squares
let isRunning = false;
let halts = false; // does machine halt (essential for the game)
let numberOfCards = 3; // initial number of cards
let allowedLetters = '';
let regex = null; // regex for cards inputs

// =========================== INITIALIZATION =============================

createRegex();

document.getElementById('startButton').addEventListener('click', () => {
  if (halts && !isRunning) {
    resetMachine();
    isRunning = true;
    clearMessagesLog();
    logMessage("Running machine...\n");
    runTuringMachine();
  } else{
    clearMessagesLog();
    logMessage("Create valid machine before starting\n")
  }
});

document.getElementById('resetButton').addEventListener('click', () => {
  resetMachine();
  clearMessagesLog();
  logMessage("Machine reseted");
  
});

document.querySelectorAll('input[name="numStates"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    numberOfCards = parseInt(e.target.value);
    createRegex();
    createCards();
  });
});

createCards();
createSquares(numSquares);

window.addEventListener('resize', () => {
  createSquares(numSquares);
});

// ================================ FUNCTIONS ==============================

function createRegex() {
  let allowedLetters = '';
  for (let i = 0; i < numberOfCards; i++) {
    allowedLetters += String.fromCharCode(65 + i); // A, B, C, ...
  }
  allowedLetters += allowedLetters.toLowerCase(); // add lowercase variants
  regex = new RegExp(`^[01][RLrl][${allowedLetters}Zz]$`);
}

function createSquares(numSquares) {
  grid.innerHTML = '';
  const maxSquareSize = 50;
  const gridWidth = grid.offsetWidth;
  
  let squareSize = maxSquareSize;
  if (numSquares * maxSquareSize > gridWidth) {
    squareSize = Math.floor(gridWidth / numSquares);
  }

  // Create each square
  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement('div');
    square.className = 'square';
    square.style.width = `${squareSize}px`;
    square.style.height = `${squareSize}px`;

    const fontSize = squareSize * 0.7;
    square.style.fontSize = `${fontSize}px`;
    
    if(array[i] === 1){
      square.style.backgroundColor = 'grey';
    }else if(array[i] === 0){
      square.style.backgroundColor = 'white';
    }
    if (squareSize > 10) {
      square.textContent = array[i];
    }
    grid.appendChild(square);
  }
}

function logMessage(text) {
  messagesLog.push(text);
  messages.textContent = messagesLog.join('\n');
}

function clearMessagesLog(){
  messagesLog = [];
  messages.textContent = '';
}


function createCards(){

  cardsContainer.innerHTML = '';
  inputs = [];
  cardRules = [];
  halts = false;
  isRunning = false;
  clearMessagesLog();
  resetMachine();
  
  for (let i = 0; i < numberOfCards; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const label = document.createElement('div');
    label.className = 'card-label';
  
    const cardLetter = String.fromCharCode(65 + i);
    label.textContent = cardLetter;
    
    const inputGroup0 = createInputGroup('0', cardLetter);
    const inputGroup1 = createInputGroup('1', cardLetter);
    
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
function createInputGroup(text, cardLetter) {
  const group = document.createElement('div');
  group.className = 'input-group';
  
  const label = document.createElement('label');
  label.textContent = text;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 3;
  
  input.dataset.valueLabel = text;
  input.dataset.card = cardLetter;

  group.appendChild(label);
  group.appendChild(input);
  
  // returns group div and its input
  return { group, input };
}

// Validation setup
function setupValidation(input) {
  input.addEventListener('input', () => {
    let value = input.value.toUpperCase();

    if (value.length === 1 && !/[01]/.test(value[0])) {
      value = '';
    } else if (value.length === 2 && !/[RL]/.test(value[1])) {
      value = value[0];
    } else if (value.length === 3 && !/[A-DZ]/.test(value[2])) {
      value = value.slice(0, 2);
    }

    input.value = value;
    input.style.backgroundColor = 'white';
  });

  input.addEventListener('blur', () => {
    checkAllInputs();
  });
}

// Check all inputs after blur
function checkAllInputs() {
  let zCount = 0;
  messagesLog = [];

  inputs.forEach(input => {
    const value = input.value.trim();
    if (!regex.test(value)) {
      input.style.backgroundColor = 'red';
      logMessage(`Invalid format: "${value}" ${input.dataset.card}->${input.dataset.valueLabel}`);
    } else {
      input.style.backgroundColor = 'lightgreen';
      if (value[2] === 'Z' || value[2] === 'z') {
        zCount++;
      }
    }
  });

  if (zCount === 0) {
    logMessage('No input ends with "Z"')
  } else if (zCount > 1) {
    logMessage('Multiple inputs end with "Z"');
  }

  if(messagesLog.length === 0){
    logMessage('Valid turing machine\nTesting if machine halts in reasonable time...\n');
    rebuildCardRules();
    halts = checkIfHalts();
  }

}

// cards data
function rebuildCardRules() {
  cardRules = [];

  cardsContainer.querySelectorAll('.card').forEach(card => {
    const cardLabel = card.querySelector('.card-label').textContent;
    const cardInputs = card.querySelectorAll('input');

    cardRules.push({
      cardLetter: cardLabel,
      zero: {
        input: cardInputs[0].value,
        element: cardInputs[0]
      },
      one: {
        input: cardInputs[1].value,
        element: cardInputs[1]
      }
    });
  });
}


function checkIfHalts() {
  const testArray = new Array(10000).fill(0);
  let currIndex = 5000;
  let currState = 'A';
  let steps = 0;
  const maxSteps = 100000; // max steps limit

  while (currIndex >= 0 && currIndex < testArray.length && steps < maxSteps) {
    const currentValue = testArray[currIndex];
    const rule = cardRules.find(r => r.cardLetter === currState);

    if (!rule) {
      logMessage(`No rule for state ${currState}. Machine halts.`);
      return false;
    }

    let instruction = currentValue === 0 ? rule.zero.input : rule.one.input;

    const write = parseInt(instruction[0]);
    const move = instruction[1];
    const nextState = instruction[2].toUpperCase();

    testArray[currIndex] = write;

    if (move === 'R' || move === 'r') {
      currIndex++;
    } else if (move === 'L' || move === 'l') {
      currIndex--;
    }

    if (nextState === 'Z') {
      logMessage(`Reached halting state Z. Machine halts.`);
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
  const machineCursor = document.createElement('div');
  machineCursor.className = 'machine';

  const square = document.querySelectorAll('.square')[Math.floor(array.length / 2)];
  grid.appendChild(machineCursor);
  updateMachineCursor(square);
  
  return machineCursor;
}

function updateMachineCursor(square) {
  const machineCursor = document.querySelector('.machine');

  if (square) {
    const squareRect = square.getBoundingClientRect();
    machineCursor.style.left = `${squareRect.left + (squareRect.width / 2) - 10}px`;
    machineCursor.style.top = `${squareRect.top - 20}px`;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTuringMachine() {
  let currIndex = Math.floor(array.length / 2);
  const numSquares = array.length;
  let currState = 'A';
  const machineCursor = createMachineCursor();

  while (isRunning) {
    if (currIndex >= numSquares) {
      logMessage('Out of bounds - increase displayed array size');
      isRunning = false;
      break;
    }

    const square = document.querySelectorAll('.square')[currIndex];
    const currentValue = array[currIndex];
    const rule = cardRules.find(r => r.cardLetter === currState);
    const instruction = currentValue === 0 ? rule.zero.input : rule.one.input;

    const write = parseInt(instruction[0]);
    const move = instruction[1];
    const nextState = instruction[2].toUpperCase();

    updateMachineCursor(square);

    await sleep(400);
    setInputColor(rule.cardLetter, currentValue);

    await sleep(400);
    playSound(popSound, 0.02);
    array[currIndex] = write;
    square.textContent = write;
    square.style.backgroundColor = write === 0 ? 'white' : 'grey';
    
    if (move === 'R' || move === 'r') {
      currIndex++;
    } else if (move === 'L' || move === 'l') {
      currIndex--;
    }

    if (nextState === 'Z') {
      logMessage('HALTED');
      isRunning = false;
      break;
    }

    await sleep(200);
    currState = nextState;
  }
}


function resetMachine(){
  isRunning = false;
  array.fill(0);  
  createSquares(numSquares);
  cleanInputsColor();
}

function setInputColor(state, label){

  cleanInputsColor();

  inputs.forEach(input => {
    if(input.dataset.valueLabel === String(label) && input.dataset.card === state){
      input.style.backgroundColor = '#bf03bc';
    }
  })
}

function cleanInputsColor(){
  inputs.forEach(input => {
    input.style.backgroundColor = 'white';
  })
}

function playSound(sound, delay){
  sound.currentTime = delay;
  sound.play();
}