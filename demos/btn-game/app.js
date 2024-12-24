const gameDuration = 30;

let score = 0;

let timeLeft = gameDuration;

const button = document.getElementById("movingButton");

const scoreDisplay = document.getElementById("score");

const timerDisplay = document.getElementById("timer");

function startTimer() {
    if (timeLeft < 0 || timeLeft == 0) {
      clearInterval(countdown);
      button.style.display = "none";
      console.log("Game Over! Your score is: " + score);
    }
  const countdown = setInterval(() => {
timeLeft = timeLeft - 1;
timerDisplay.textContent = "Time Left: " + timeLeft;

}, 1000);
}


function moveButton() {
  let maxX = gameArea.clientWidth - button.offsetWidth;
  let maxY = gameArea.clientHeight - button.offsetHeight;
  let randomX = Math.floor(Math.random() * maxX);
  let randomY = Math.floor(Math.random() * maxY);
  button.style.left = randomX + "px";
  button.style.top = randomY + "px";
}


button.addEventListener("click", () => {
score = score + 1;
scoreDisplay.textContent = "Score: " + score;
moveButton();
});

startTimer();

moveButton();
//# sourceMappingURL=app.js.map