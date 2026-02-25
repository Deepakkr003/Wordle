// ==========================
// CONFIG
// ==========================
const ROWS = 6;
const COLS = 5;

let wordList = [];
let board = [];
let currentRow = 0;
let currentCol = 0;
let targetWord = "";
let gameOver = false;


// ==========================
// LOAD WORDS + START GAME
// ==========================
async function loadWords() {
  const res = await fetch("valid-wordle-words.txt");
  const text = await res.text();

  return text
    .split(/\r?\n/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === COLS);
}

async function start() {
  wordList = await loadWords();
  init();
}

start();


// ==========================
// INIT GAME
// ==========================
function init() {
  createBoard();
  setupKeyboard();
  newGame();

  document
    .getElementById("playAgainBtn")
    .addEventListener("click", newGame);
}


// ==========================
// CREATE BOARD
// ==========================
function createBoard() {
  const boardEl = document.getElementById("gameBoard");
  boardEl.innerHTML = "";
  board = [];

  for (let r = 0; r < ROWS; r++) {
    const rowEl = document.createElement("div");
    rowEl.classList.add("row");

    const rowData = [];

    for (let c = 0; c < COLS; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.id = `${r}-${c}`;
      rowEl.appendChild(tile);
      rowData.push("");
    }

    board.push(rowData);
    boardEl.appendChild(rowEl);
  }
}


// ==========================
// NEW GAME
// ==========================
function newGame() {
  targetWord = wordList[Math.floor(Math.random() * wordList.length)];
  currentRow = 0;
  currentCol = 0;
  gameOver = false;

  // Reset board
  document.querySelectorAll(".tile").forEach(t => {
    t.textContent = "";
    t.className = "tile";
  });

  document.querySelectorAll(".key").forEach(k => {
    k.className = "key";
  });

  board = Array.from({ length: ROWS }, () =>
    Array(COLS).fill("")
  );

  console.log("Target:", targetWord);
}


// ==========================
// KEYBOARD
// ==========================
function setupKeyboard() {
  document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();

  if (/^[a-z]$/.test(key)) addLetter(key);
  else if (key === "backspace") removeLetter();
  else if (key === "enter") submitGuess();
});
}


// ==========================
// INPUT HANDLING
// ==========================
function addLetter(letter) {
  if (currentCol >= COLS) return;

  const tile = document.getElementById(`${currentRow}-${currentCol}`);
  tile.textContent = letter.toUpperCase();
  tile.classList.add("filled");

  board[currentRow][currentCol] = letter;
  currentCol++;
}

function removeLetter() {
  if (currentCol === 0) return;
  currentCol--;
  const tile = document.getElementById(`${currentRow}-${currentCol}`);
  tile.textContent = "";
  tile.classList.remove("filled");

  board[currentRow][currentCol] = "";
}


// ==========================
// SUBMIT GUESS
// ==========================
function submitGuess() {

  if (gameOver) {
    showMessage("Game Over! Click Play Again.");
    return;
  }

  if (currentCol !== COLS) {
    showMessage("Enter 5 letters");
    return;
  }

  const guess = board[currentRow].join("");

  if (!wordList.includes(guess)) {
    showMessage("Not in word list");
    return;
  }

  evaluateGuess(guess);

  if (guess === targetWord) {
    endGame(true);
    return;
  }

  if (currentRow === ROWS - 1) {
    endGame(false);
    return;
  }

  currentRow++;
  currentCol = 0;
}


// ==========================
// WORDLE EVALUATION LOGIC
// (Correct duplicate handling)
// ==========================
function evaluateGuess(guess) {
  const letterCount = {};
  for (let char of targetWord) {
    letterCount[char] = (letterCount[char] || 0) + 1;
  }

  // First pass (correct letters)
  for (let c = 0; c < COLS; c++) {
    const tile = document.getElementById(`${currentRow}-${c}`);
    if (guess[c] === targetWord[c]) {
      tile.classList.add("correct");
      letterCount[guess[c]]--;
      updateKeyColor(guess[c], "correct");
    }
  }

  // Second pass (present/absent)
  for (let c = 0; c < COLS; c++) {
    const tile = document.getElementById(`${currentRow}-${c}`);

    if (!tile.classList.contains("correct")) {
      if (letterCount[guess[c]] > 0) {
        tile.classList.add("present");
        letterCount[guess[c]]--;
        updateKeyColor(guess[c], "present");
      } else {
        tile.classList.add("absent");
        updateKeyColor(guess[c], "absent");
      }
    }
  }
}


// ==========================
// UPDATE KEY COLOR
// ==========================
function updateKeyColor(letter, status) {
  const key = document.querySelector(`[data-key="${letter}"]`);
  if (!key) return;

  if (status === "correct") {
    key.className = "key correct";
  } else if (status === "present" && !key.classList.contains("correct")) {
    key.classList.add("present");
  } else if (
    status === "absent" &&
    !key.classList.contains("correct") &&
    !key.classList.contains("present")
  ) {
    key.classList.add("absent");
  }
}


// ==========================
// END GAME
// ==========================
function endGame(win) {
  gameOver = true;

  if (win) {
    showMessage("🎉 Congratulations! You guessed the word!");
  } else {
    showMessage(`Game Over! Word was ${targetWord.toUpperCase()}`);
  }
}

// ==========================
// MESSAGE
// ==========================
function showMessage(text) {
  const msg = document.getElementById("message");
  if (!msg) return;

  msg.textContent = text;

  // Show animation
  msg.classList.add("show");

  setTimeout(() => {
    msg.classList.remove("show");
  }, 2000);
}