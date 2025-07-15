// Selectors for modal
const modal = document.getElementById('authModal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');

// Navbar buttons
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const createPostBtn = document.getElementById('createPostBtn');

const postsContainer = document.querySelector('.main_container');

// Show/hide modal
loginBtn.onclick = () => openModal('login');
registerBtn.onclick = () => openModal('register');
createPostBtn && (createPostBtn.onclick = () => openModal('create'));
closeBtn.onclick = () => modal.classList.add('hidden');
window.onclick = (e) => { if (e.target == modal) modal.classList.add('hidden'); };

// Check login state
if (localStorage.getItem('token')) {
  loginBtn.style.display = 'none';
  registerBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';
} else {
  logoutBtn.style.display = 'none';
}

logoutBtn.onclick = () => {
  localStorage.removeItem('token');
  window.location.reload();
}

// Open modal content
function openModal(type) {
  modal.classList.remove('hidden');

  if (type === 'login') {
    modalBody.innerHTML = `
      <h2>Login</h2>
      <input type="text" placeholder="Username" id="loginUsername">
      <input type="password" placeholder="Password" id="loginPassword">
      <button onclick="login()">Login</button>
    `;
  }

  if (type === 'register') {
    modalBody.innerHTML = `
      <h2>Register</h2>
      <input type="text" placeholder="Username" id="registerUsername">
      <input type="password" placeholder="Password" id="registerPassword">
      <button onclick="register()">Register</button>
    `;
  }

  if (type === 'create') {
    modalBody.innerHTML = `
      <h2>Create Post</h2>
      <input type="text" placeholder="Title" id="postTitle">
      <textarea placeholder="Description" id="postDesc"></textarea>
      <input type="text" placeholder="Image URL" id="postImage">
      <button onclick="createPost()">Create</button>
    `;
  }
}

// Auth: Register
async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('Registration successful! Please login.');
    modal.classList.add('hidden');
  } else {
    alert(data.error || 'Registration failed');
  }
}

// Auth: Login
async function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    alert('Login successful!');
    window.location.reload();
  } else {
    alert(data.error || 'Login failed');
  }
}

// CRUD: Load all posts
async function loadPosts() {
  const res = await fetch('/api/posts');
  const posts = await res.json();

  postsContainer.innerHTML = ''; // Clear existing

  posts.forEach(post => {
    const postCard = document.createElement('div');
    postCard.classList.add('card_container');

    postCard.innerHTML = `
      <a href="#" class="card_image_container">
        <img src="${post.image}" alt="post image" loading="lazy" class="card_image">
      </a>
      <div class="card_title_container">
        <a href="#" class="class_title_link">
          <h2 class="card_title">${post.title}</h2>
          <p class="card_desc">${post.description}</p>
        </a>
      </div>
      <div class="card_footer_container">
        <div class="author_container">
          <div class="author_avatar_container">
            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=${post.author}" loading="lazy" class="author_avatar" alt="">
          </div>
          <div class="author_info_container">
            <span class="author_name">${post.author}</span>
            <span class="author_date">${new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="card_tag_container">
          <button onclick="editPost('${post._id}')">Edit</button>
          <button onclick="deletePost('${post._id}')">Delete</button>
        </div>
      </div>
    `;

    postsContainer.appendChild(postCard);
  });
}

// CRUD: Create Post
async function createPost() {
  const title = document.getElementById('postTitle').value.trim();
  const description = document.getElementById('postDesc').value.trim();
  const image = document.getElementById('postImage').value.trim();

  const token = localStorage.getItem('token');

  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, image, author: 'You' })
  });

  if (res.ok) {
    alert('Post created!');
    modal.classList.add('hidden');
    loadPosts();
  } else {
    alert('Failed to create post.');
  }
}

// CRUD: Edit Post
function editPost(id) {
  const post = prompt('New title?');
  if (!post) return;

  const token = localStorage.getItem('token');
  fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title: post })
  }).then(() => loadPosts());
}

// CRUD: Delete Post
function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  const token = localStorage.getItem('token');
  fetch(`/api/posts/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(() => loadPosts());
}

// Initial load
loadPosts();
