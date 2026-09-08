const API_URL = '/api/students';

const form = document.getElementById('studentForm');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
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

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove('hidden');
  setTimeout(() => messageDiv.classList.add('hidden'), 4000);
}

function resetForm() {
  form.reset();
  fields.studentId.value = '';
  submitBtn.textContent = 'Register Student';
  cancelEditBtn.classList.add('hidden');
}

async function fetchStudents() {
  try {
    const res = await fetch(API_URL);
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

    row.innerHTML = `
      <td>${s.fullName}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${s.course}</td>
      <td>${s.year}</td>
      <td>${dobFormatted}</td>
      <td>
        <button class="action-btn edit-btn" data-id="${s._id}">Edit</button>
        <button class="action-btn delete-btn" data-id="${s._id}">Delete</button>
      </td>
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

  const id = fields.studentId.value;
  const isEdit = Boolean(id);

  try {
    const res = await fetch(isEdit ? `${API_URL}/${id}` : API_URL, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Something went wrong.', 'error');
      return;
    }

    showMessage(data.message, 'success');
    resetForm();
    fetchStudents();
  } catch (err) {
    showMessage('Network error. Please try again.', 'error');
  }
});

studentsBody.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Delete this student record?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      showMessage(data.message, res.ok ? 'success' : 'error');
      fetchStudents();
    } catch (err) {
      showMessage('Failed to delete student.', 'error');
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const s = await res.json();

      fields.studentId.value = s._id;
      fields.fullName.value = s.fullName;
      fields.email.value = s.email;
      fields.phone.value = s.phone;
      fields.course.value = s.course;
      fields.year.value = s.year;
      fields.dob.value = s.dob.split('T')[0];

      submitBtn.textContent = 'Update Student';
      cancelEditBtn.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showMessage('Failed to load student for editing.', 'error');
    }
  }
});

cancelEditBtn.addEventListener('click', resetForm);

fetchStudents();
