/**
 * Login page JS — handles tab switching, form validation,
 * register, login, and redirect to game on success.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── If already logged in, skip straight to the game ───────────
  fetch('/api/auth/me')
    .then(r => r.json())
    .then(data => {
      if (data.success) window.location.replace('/');
    })
    .catch(() => { /* not logged in — stay on this page */ });

  // ── Elements ───────────────────────────────────────────────────
  const tabBtns       = document.querySelectorAll('.tab-btn');
  const loginForm     = document.getElementById('loginForm');
  const registerForm  = document.getElementById('registerForm');

  const loginEmail    = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn      = document.getElementById('loginBtn');

  const regName           = document.getElementById('regName');
  const regEmail          = document.getElementById('regEmail');
  const regPassword       = document.getElementById('regPassword');
  const regConfirm        = document.getElementById('regConfirm');
  const registerBtn       = document.getElementById('registerBtn');
  const strengthFill      = document.getElementById('strengthFill');
  const strengthLabel     = document.getElementById('strengthLabel');

  const authAlert     = document.getElementById('authAlert');
  const authAlertIcon = document.getElementById('authAlertIcon');
  const authAlertText = document.getElementById('authAlertText');

  // ── Alert banner ────────────────────────────────────────────────
  function showAlert(msg, type = 'error') {
    authAlert.className = `auth-alert alert-${type}`;
    authAlertIcon.className = type === 'error'
      ? 'fa-solid fa-circle-xmark'
      : 'fa-solid fa-circle-check';
    authAlertText.textContent = msg;
    authAlert.classList.remove('hidden');
    authAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    authAlert.classList.add('hidden');
  }

  // ── Field validation helpers ────────────────────────────────────
  function setFieldError(inputEl, errId, msg) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = msg;
    inputEl.classList.toggle('field-invalid', !!msg);
    inputEl.classList.toggle('field-valid', !msg && inputEl.value.trim() !== '');
  }

  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => {
      el.classList.remove('field-invalid', 'field-valid');
    });
  }

  // ── Tab switching ───────────────────────────────────────────────
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      loginForm.classList.toggle('hidden', tab !== 'login');
      registerForm.classList.toggle('hidden', tab !== 'register');
      clearErrors();
      hideAlert();
    });
  });

  // ── Password visibility toggle ──────────────────────────────────
  document.querySelectorAll('.toggle-pw').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const icon  = btn.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
      } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
      }
    });
  });

  // ── Password strength indicator ─────────────────────────────────
  regPassword.addEventListener('input', () => {
    const val = regPassword.value;
    let strength = 0;
    if (val.length >= 6)  strength++;
    if (val.length >= 10) strength++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) strength++;

    strengthFill.className = 'strength-fill';
    if (val.length === 0) {
      strengthFill.style.width = '0%';
      strengthLabel.textContent = 'Enter a password';
    } else if (strength === 1) {
      strengthFill.classList.add('strength-weak');
      strengthLabel.textContent = 'Weak';
    } else if (strength === 2) {
      strengthFill.classList.add('strength-medium');
      strengthLabel.textContent = 'Medium';
    } else {
      strengthFill.classList.add('strength-strong');
      strengthLabel.textContent = 'Strong';
    }
  });

  // ── Button loading state ────────────────────────────────────────
  function setLoading(btn, loading) {
    const spinner = btn.querySelector('.btn-spinner');
    btn.disabled = loading;
    if (spinner) spinner.classList.toggle('hidden', !loading);
  }

  // ── LOGIN ────────────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearErrors();

    const email    = loginEmail.value.trim();
    const password = loginPassword.value;
    let valid = true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(loginEmail, 'loginEmailErr', 'Please enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setFieldError(loginPassword, 'loginPasswordErr', 'Password is required.');
      valid = false;
    }
    if (!valid) return;

    setLoading(loginBtn, true);

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please try again.');
      }

      // Redirect to game
      window.location.replace('/');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(loginBtn, false);
    }
  });

  // ── REGISTER ─────────────────────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();
    clearErrors();

    const displayName = regName.value.trim();
    const email       = regEmail.value.trim();
    const password    = regPassword.value;
    const confirm     = regConfirm.value;
    let valid = true;

    if (displayName.length < 2 || displayName.length > 30) {
      setFieldError(regName, 'regNameErr', 'Display name must be 2–30 characters.');
      valid = false;
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(displayName)) {
      setFieldError(regName, 'regNameErr', 'Letters, numbers, spaces and underscores only.');
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(regEmail, 'regEmailErr', 'Please enter a valid email address.');
      valid = false;
    }
    if (password.length < 6) {
      setFieldError(regPassword, 'regPasswordErr', 'Password must be at least 6 characters.');
      valid = false;
    }
    if (password !== confirm) {
      setFieldError(regConfirm, 'regConfirmErr', 'Passwords do not match.');
      valid = false;
    }
    if (!valid) return;

    setLoading(registerBtn, true);

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, displayName, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      // Redirect to game
      window.location.replace('/');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(registerBtn, false);
    }
  });

  // ── Real-time field validation ───────────────────────────────────
  loginEmail.addEventListener('blur', () => {
    const v = loginEmail.value.trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setFieldError(loginEmail, 'loginEmailErr', 'Not a valid email address.');
    } else {
      setFieldError(loginEmail, 'loginEmailErr', '');
    }
  });

  regEmail.addEventListener('blur', () => {
    const v = regEmail.value.trim();
    if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setFieldError(regEmail, 'regEmailErr', 'Not a valid email address.');
    } else {
      setFieldError(regEmail, 'regEmailErr', '');
    }
  });

  regConfirm.addEventListener('input', () => {
    if (regConfirm.value && regConfirm.value !== regPassword.value) {
      setFieldError(regConfirm, 'regConfirmErr', 'Passwords do not match.');
    } else {
      setFieldError(regConfirm, 'regConfirmErr', '');
    }
  });

});

