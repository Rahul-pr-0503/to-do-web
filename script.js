let currentUser = null;
let tasks = [];

// -------- AUTH FUNCTIONS --------

// Switch between signup and login forms
function showSignup() {
  document.getElementById("signupForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
}

function showLogin() {
  document.getElementById("signupForm").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

// Sign Up
function signup() {
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[email]) {
    alert("User already exists. Please login.");
    return;
  }

  users[email] = { password, tasks: [] };
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful! Please login.");
  showLogin();
}

// Login
function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[email] || users[email].password !== password) {
    alert("Invalid email or password");
    return;
  }

  currentUser = email;
  tasks = users[email].tasks || [];

  document.getElementById("authSection").style.display = "none";
  document.getElementById("todoSection").style.display = "block";
  document.getElementById("welcomeMsg").innerText = "Welcome, " + email;

  loadTasks();
}

// Logout
function logout() {
  saveTasks();
  currentUser = null;
  tasks = [];

  document.getElementById("authSection").style.display = "block";
  document.getElementById("todoSection").style.display = "none";
}

// -------- TASK FUNCTIONS --------

// Add Task
function addTask() {
  const text = document.getElementById("taskText").value.trim();
  const date = document.getElementById("taskDate").value;
  const listType = document.getElementById("taskListSelect").value;

  if (!text || !currentUser) {
    alert("Please enter a task");
    return;
  }

  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.onchange = () => li.classList.toggle("completed", checkbox.checked);

  const details = document.createElement("div");
  details.className = "task-details";

  const span = document.createElement("span");
  span.textContent = text;

  const dateEl = document.createElement("small");
  dateEl.className = "task-date";
  if (date) dateEl.textContent = new Date(date).toLocaleString();

  details.appendChild(span);
  details.appendChild(dateEl);

  const actions = document.createElement("div");
  actions.className = "actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className = "edit";
  editBtn.onclick = () => editTask(span, editBtn);

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "delete";
  delBtn.onclick = () => {
    li.remove();
    tasks = tasks.filter(t => !(t.text === text && t.date === date));
    saveTasks();
  };

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(details);
  li.appendChild(actions);

  document.getElementById(listType + "List").appendChild(li);

  if (date) {
    tasks.push({ text, date: new Date(date), email: currentUser, alerted: false, listType });
  } else {
    tasks.push({ text, date: null, email: currentUser, alerted: false, listType });
  }

  saveTasks();

  document.getElementById("taskText").value = "";
  document.getElementById("taskDate").value = "";
}

// Edit Task
function editTask(span, button) {
  if (button.textContent === "Edit") {
    const input = document.createElement("input");
    input.type = "text";
    input.value = span.textContent;
    span.replaceWith(input);
    button.textContent = "Save";
    button.className = "save";
    button.onclick = () => saveTask(input, button);
  }
}

function saveTask(input, button) {
  const span = document.createElement("span");
  span.textContent = input.value;
  input.replaceWith(span);
  button.textContent = "Edit";
  button.className = "edit";
  button.onclick = () => editTask(span, button);

  // Update tasks
  const task = tasks.find(t => t.text === input.value);
  if (task) {
    task.text = input.value;
  }
  saveTasks();
}

// Load tasks for current user
function loadTasks() {
  document.getElementById("personalList").innerHTML = "";
  document.getElementById("workList").innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.onchange = () => li.classList.toggle("completed", checkbox.checked);

    const details = document.createElement("div");
    details.className = "task-details";

    const span = document.createElement("span");
    span.textContent = task.text;

    const dateEl = document.createElement("small");
    dateEl.className = "task-date";
    if (task.date) dateEl.textContent = new Date(task.date).toLocaleString();

    details.appendChild(span);
    details.appendChild(dateEl);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => editTask(span, editBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete";
    delBtn.onclick = () => {
      li.remove();
      tasks = tasks.filter(t => !(t.text === task.text && t.date === task.date));
      saveTasks();
    };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(details);
    li.appendChild(actions);

    document.getElementById(task.listType + "List").appendChild(li);
  });
}

// Save tasks to localStorage
function saveTasks() {
  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (currentUser) {
    users[currentUser].tasks = tasks;
    localStorage.setItem("users", JSON.stringify(users));
  }
}

// -------- REMINDER --------
setInterval(() => {
  if (!currentUser) return;
  const now = new Date();
  tasks.forEach(task => {
    if (task.date && !task.alerted) {
      const diff = (new Date(task.date) - now) / 60000;
      if (diff > 0 && diff <= 10) {
        emailjs.send("service_fo9u3uh", "template_jgv1at1", {
          task: task.text,
          date: new Date(task.date).toLocaleString(),
          to_email: task.email
        }).then(() => {
          console.log("Email sent successfully to " + task.email);
        }).catch(err => {
          console.error("EmailJS Error:", err);
        });
        task.alerted = true;
        saveTasks();
      }
    }
  });
}, 60000);
