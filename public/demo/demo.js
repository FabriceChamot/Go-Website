const tenuki = require("tenuki");

const boardElement = document.querySelector("#go-board");
const statusElement = document.querySelector("#game-status");
const moveCountElement = document.querySelector("#move-count");
const passButton = document.querySelector("#pass-button");
const undoButton = document.querySelector("#undo-button");
const newGameButton = document.querySelector("#new-game-button");

let game;

function updateGameInfo(currentGame) {
  const moveNumber = currentGame.moveNumber();
  const gameIsOver = currentGame.isOver();

  statusElement.textContent = gameIsOver
    ? "Game over"
    : `${capitalize(currentGame.currentPlayer())} to play`;
  moveCountElement.textContent = `${moveNumber} ${moveNumber === 1 ? "move" : "moves"}`;
  passButton.disabled = gameIsOver;
  undoButton.disabled = moveNumber === 0;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function startNewGame() {
  if (game) {
    while (game.moveNumber() > 0) {
      game.undo();
    }
    return;
  }

  boardElement.replaceChildren();
  game = new tenuki.Game({
    element: boardElement,
    boardSize: 19
  });
  game.callbacks.postRender = updateGameInfo;
  updateGameInfo(game);
}

passButton.addEventListener("click", () => {
  game.pass();
});

undoButton.addEventListener("click", () => {
  if (game.moveNumber() > 0) {
    game.undo();
  }
});

newGameButton.addEventListener("click", startNewGame);

startNewGame();
