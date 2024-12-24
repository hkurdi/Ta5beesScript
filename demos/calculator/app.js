let display = document.getElementById("display");

let currentNumber = "";

let previousNumber = "";

let operation = null;

function updateDisplay() {
  display.value = currentNumber || "0";
}


function appendNumber(number) {
  currentNumber = currentNumber + number;
  updateDisplay();
}


function setOperation(op) {
  previousNumber = currentNumber;
  currentNumber = "";
  operation = op;
}


function calculate() {
  const prev = parseFloat(previousNumber);
  const current = parseFloat(currentNumber);
  const sum = prev + current;
  const diff = prev - current;
  const prod = prev * current;
  const quotient = prev / current;
  if (operation == "+") {
    currentNumber = sum.toString();
  }
  else {
    if (operation == "-") {
      currentNumber = diff.toString();
    }
    else {
      if (operation == "*") {
        currentNumber = prod.toString();
      }
      else {
        if (operation == "/") {
          currentNumber = quotient.toString();
        }

      }

    }

  }

  updateDisplay();
}


function clear() {
  currentNumber = "";
  previousNumber = "";
  operation = null;
  updateDisplay();
}


let clearButton = document.getElementById("clear");

clearButton.addEventListener("click", clear);
//# sourceMappingURL=app.js.map