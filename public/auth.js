const messageDiv = document.getElementById('message');

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.classList.remove('hidden');
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || 'Login failed.', 'error');
        return;
      }

      window.location.href = 'index.html';
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    }
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      phone: document.getElementById('phone').value.trim(),
      course: document.getElementById('course').value.trim(),
      year: document.getElementById('year').value,
      dob: document.getElementById('dob').value
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || 'Sign up failed.', 'error');
        return;
      }

      window.location.href = 'index.html';
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    }
  });
}
