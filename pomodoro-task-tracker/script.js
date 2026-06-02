let timeLeft = 25 * 60;
let timerInterval = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

startBtn.addEventListener("click", function () {
  if (timerInterval !== null) return;

  timerInterval = setInterval(function () {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Focus session complete! Take a break.");
    }
  }, 1000);
});

pauseBtn.addEventListener("click", function () {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetBtn.addEventListener("click", function () {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = 25 * 60;
  updateTimerDisplay();
});

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskCounter() {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  taskCounter.textContent = `Completed: ${completedTasks} / ${totalTasks}`;
}

function renderTasks() {
  taskList.innerHTML = "";

  tasks.forEach(function (task, index) {
    const li = document.createElement("li");
    li.className = task.completed ? "completed task-item" : "task-item";

    const taskText = document.createElement("span");
    taskText.textContent = task.text;

    taskText.addEventListener("click", function () {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    deleteBtn.addEventListener("click", function () {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(taskText);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });

  updateTaskCounter();
}

addTaskBtn.addEventListener("click", function () {
  const taskText = taskInput.value.trim();

  if (taskText === "") return;

  tasks.push({
    text: taskText,
    completed: false
  });

  saveTasks();
  renderTasks();

  taskInput.value = "";
});

taskInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTaskBtn.click();
  }
});

updateTimerDisplay();
renderTasks();