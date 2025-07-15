const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const auth = document.getElementById('auth');
const taskApp = document.getElementById('taskApp');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const filterStatus = document.getElementById('filterStatus');
const sortBy = document.getElementById('sortBy');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let user = localStorage.getItem('user') || '';

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
  let filtered = tasks;
  const filter = filterStatus.value;
  if (filter !== 'all') {
    filtered = filtered.filter(t => t.status === filter);
  }

  if (sortBy.value === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  taskList.innerHTML = '';
  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task ${task.status}`;
    li.innerHTML = `
      <strong>${task.title}</strong> - ${task.description} (${task.status})
      <button onclick="toggleStatus('${task.id}')">Toggle</button>
      <button onclick="deleteTask('${task.id}')">Delete</button>
    `;
    taskList.appendChild(li);
  });
}

function toggleStatus(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const status = document.getElementById('status').value;
  tasks.push({
    id: Date.now().toString(),
    title,
    description,
    status,
    createdAt: new Date().toISOString()
  });
  saveTasks();
  renderTasks();
  taskForm.reset();
});

filterStatus.addEventListener('change', renderTasks);
sortBy.addEventListener('change', renderTasks);

loginBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (name) {
    user = name;
    localStorage.setItem('user', user);
    updateUI();
  }
});

logoutBtn.addEventListener('click', () => {
  user = '';
  localStorage.removeItem('user');
  updateUI();
});

function updateUI() {
  if (user) {
    auth.style.display = 'block';
    usernameInput.style.display = 'none';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    taskApp.style.display = 'block';
  } else {
    usernameInput.style.display = 'inline-block';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    taskApp.style.display = 'none';
  }
  renderTasks();
}

updateUI();
