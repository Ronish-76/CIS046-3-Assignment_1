/**
 * Auth Controller — Login & Registration View Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to main game immediately
  api.get('/api/auth/me')
    .then(data => {
      if (data && data.success && data.user) {
        window.location.replace('/');
      }
    })
    .catch(() => {});

  const tabBtns = document.querySelectorAll('.tab-btn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');

  const regName = document.getElementById('regName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirm = document.getElementById('regConfirm');
  const registerBtn = document.getElementById('registerBtn');

  const authAlert = document.getElementById('authAlert');
  const authAlertText = document.getElementById('authAlertText');

  function showAlert(msg, isSuccess = false) {
    if (!authAlert) return;
    authAlert.className = `auth-alert ${isSuccess ? 'alert-success' : 'alert-error'}`;
    authAlertText.textContent = msg;
    authAlert.classList.remove('hidden');
  }

  function hideAlert() {
    if (authAlert) authAlert.classList.add('hidden');
  }

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      hideAlert();

      const tab = btn.dataset.tab;
      if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
    });
  });

  // Password visibility toggle
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = input.type === 'password' ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        }
      }
    });
  });

  // Login handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = loginEmail.value.trim();
      const password = loginPassword.value;

      loginBtn.disabled = true;
      loginBtn.querySelector('.btn-spinner')?.classList.remove('hidden');

      try {
        const res = await api.post('/api/auth/login', { email, password });
        if (res.success) {
          showAlert('Signed in successfully! Loading game...', true);
          setTimeout(() => {
            window.location.replace('/');
          }, 400);
        }
      } catch (err) {
        showAlert(err.message || 'Authentication failed.');
      } finally {
        loginBtn.disabled = false;
        loginBtn.querySelector('.btn-spinner')?.classList.add('hidden');
      }
    });
  }

  // Register handler
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const displayName = regName.value.trim();
      const email = regEmail.value.trim();
      const password = regPassword.value;
      const confirm = regConfirm.value;

      if (password !== confirm) {
        showAlert('Passwords do not match.');
        return;
      }

      registerBtn.disabled = true;
      registerBtn.querySelector('.btn-spinner')?.classList.remove('hidden');

      try {
        const res = await api.post('/api/auth/register', { email, displayName, password });
        if (res.success) {
          showAlert('Account created! Loading game...', true);
          setTimeout(() => {
            window.location.replace('/');
          }, 400);
        }
      } catch (err) {
        showAlert(err.message || 'Registration failed.');
      } finally {
        registerBtn.disabled = false;
        registerBtn.querySelector('.btn-spinner')?.classList.add('hidden');
      }
    });
  }
});

