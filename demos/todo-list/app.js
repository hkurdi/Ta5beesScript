let todoInput = document.getElementById("todoInput");

let todoList = document.getElementById("todoList");

function addTask() {
  if (todoInput.value == "") {
    return undefined;
  }

  let listItem = document.createElement("li");
  listItem.textContent = todoInput.value;
  todoList.appendChild(listItem);
  todoInput.value = "";
}
//# sourceMappingURL=app.js.map