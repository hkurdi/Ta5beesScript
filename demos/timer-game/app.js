const delayRange = [1000, 5000];

let startTime = 0;

let endTime = 0;

let reactionTime = 0;

const button = document.getElementById("reactionButton");

const display = document.getElementById("display");

const timerDisplay = document.getElementById("timer");

function startGame() {
  display.textContent = "Wait for the button to turn green...";
  button.style.backgroundColor = "red";
  button.disabled = true;
  let randomDelay = Math.floor(Math.random() * delayRange[1] - delayRange[0] + delayRange[0]);
  setTimeout(() => {
button.style.backgroundColor = "green";
button.disabled = false;
startTime = Date.now();
display.textContent = "Click Now!";
}, randomDelay);
}


function handleClick() {
  if (button.disabled == true) {
    display.textContent = "Too early! Refresh the page to try again.";
    return undefined;
  }

  endTime = Date.now();
  reactionTime = endTime - startTime;
  timerDisplay.textContent = "Reaction Time: " + reactionTime + " ms";
  display.textContent = "Good Job! Refresh the page to play again.";
  button.disabled = true;
}


button.addEventListener("click", handleClick);

startGame();
//# sourceMappingURL=app.js.map