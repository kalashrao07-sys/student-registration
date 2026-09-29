const API_URL = '/api/students';

const form = document.getElementById('studentForm');
const submitBtn = document.getElementById('submitBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const logoutBtn = document.getElementById('logoutBtn');
const welcomeText = document.getElementById('welcomeText');
const messageDiv = document.getElementById('message');
const studentsBody = document.getElementById('studentsBody');

const fields = {
  studentId: document.getElementById('studentId'),
  fullName: document.getElementById('fullName'),
  email: document.getElementById('email'),
  phone: document.getElementById('phone'),
  course: document.getElementById('course'),
  year: document.getElementById('year'),
  dob: document.getElementById('dob')
};

let currentUserId = null;

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove('hidden');
  setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

// Check session; redirect to login if not authenticated
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (!res.ok) {
      window.location.href = 'login.html';
      return;
    }
    const data = await res.json();
    currentUserId = data.student._id;
    welcomeText.textContent = `Welcome, ${data.student.fullName}`;
    populateForm(data.student);
    fetchStudents();
  } catch (err) {
    window.location.href = 'login.html';
  }
}

function populateForm(s) {
  fields.studentId.value = s._id;
  fields.fullName.value = s.fullName;
  fields.email.value = s.email;
  fields.phone.value = s.phone;
  fields.course.value = s.course;
  fields.year.value = s.year;
  fields.dob.value = s.dob.split('T')[0];
}

async function fetchStudents() {
  try {
    const res = await fetch(API_URL, { credentials: 'include' });
    if (res.status === 401) {
      window.location.href = 'login.html';
      return;
    }
    const students = await res.json();
    renderStudents(students);
  } catch (err) {
    showMessage('Failed to load students.', 'error');
  }
}

function renderStudents(students) {
  studentsBody.innerHTML = '';

  if (students.length === 0) {
    studentsBody.innerHTML = '<tr><td colspan="7">No students registered yet.</td></tr>';
    return;
  }

  students.forEach((s) => {
    const row = document.createElement('tr');
    const dobFormatted = new Date(s.dob).toLocaleDateString();
    const isMe = s._id === currentUserId;

    row.innerHTML = `
      <td>${s.fullName}${isMe ? ' <em>(you)</em>' : ''}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${s.course}</td>
      <td>${s.year}</td>
      <td>${dobFormatted}</td>
      <td>${isMe ? '<span class="tag">Editable below</span>' : '-'}</td>
    `;
    studentsBody.appendChild(row);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    fullName: fields.fullName.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    course: fields.course.value.trim(),
    year: fields.year.value,
    dob: fields.dob.value
  };

  try {
    const res = await fetch(`${API_URL}/${fields.studentId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Something went wrong.', 'error');
      return;
    }

    showMessage(data.message, 'success');
    fetchStudents();
  } catch (err) {
    showMessage('Network error. Please try again.', 'error');
  }
});

deleteAccountBtn.addEventListener('click', async () => {
  if (!confirm('Delete your account? This cannot be undone.')) return;

  try {
    const res = await fetch(`${API_URL}/${fields.studentId.value}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Failed to delete account.', 'error');
      return;
    }

    window.location.href = 'login.html';
  } catch (err) {
    showMessage('Network error. Please try again.', 'error');
  }
});

logoutBtn.addEventListener('click', async () => {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } finally {
    window.location.href = 'login.html';
  }
});

checkAuth();
