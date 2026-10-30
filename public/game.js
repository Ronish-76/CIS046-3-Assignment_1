/**
 * Banana Puzzle Game - Client Controller
 * Demonstrates:
 * 1. Event-Driven Programming (EDP): Event listeners, DOM manipulation, async state flow
 * 2. Interoperability: HTTP requests to Node.js backend
 * 3. Virtual Identity: Authenticated login/register and session management
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Screen views ──────────────────────────────────────────────
  const startScreen      = document.getElementById('startScreen');
  const loadingView      = document.getElementById('loadingView');
  const activePuzzleView = document.getElementById('activePuzzleView');
  const resultView       = document.getElementById('resultView');
  const errorView        = document.getElementById('errorView');

  // ── Puzzle elements ───────────────────────────────────────────
  const puzzleImage       = document.getElementById('puzzleImage');
  const puzzleSourceBadge = document.getElementById('puzzleSourceBadge');
  const answerForm        = document.getElementById('answerForm');
  const answerInput       = document.getElementById('answerInput');
  const submitAnswerBtn   = document.getElementById('submitAnswerBtn');
  const quickNumpad       = document.getElementById('quickNumpad');

  // ── Stats ─────────────────────────────────────────────────────
  const scoreDisplay  = document.getElementById('scoreDisplay');
  const streakDisplay = document.getElementById('streakDisplay');
  const playedDisplay = document.getElementById('playedDisplay');

  // ── Identity ─────────────────────────────────────────────────
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userRoleBadge   = document.getElementById('userRoleBadge');
  const apiStatusBadge  = document.getElementById('apiStatusBadge');
  const openAuthBtn     = document.getElementById('openAuthBtn');
  const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');

  // ── Result view ───────────────────────────────────────────────
  const resultCard     = document.getElementById('resultCard');
  const resultIcon     = document.getElementById('resultIcon');
  const resultHeading  = document.getElementById('resultHeading');
  const resultFeedback = document.getElementById('resultFeedback');
  const resUserAns     = document.getElementById('resUserAns');
  const resCorrectAns  = document.getElementById('resCorrectAns');
  const nextPuzzleBtn  = document.getElementById('nextPuzzleBtn');

  // ── Controls ──────────────────────────────────────────────────
  const startGameBtn    = document.getElementById('startGameBtn');
  const newPuzzleBtn    = document.getElementById('newPuzzleBtn');
  const submitScoreBtn  = document.getElementById('submitScoreBtn');
  const resetSessionBtn = document.getElementById('resetSessionBtn');
  const retryApiBtn     = document.getElementById('retryApiBtn');
  const loadOfflineBtn  = document.getElementById('loadOfflineBtn');
  const toggleApiSimBtn = document.getElementById('toggleApiSimBtn');
  const simFailureStatus = document.getElementById('simFailureStatus');

  // ── Alert ─────────────────────────────────────────────────────
  const alertBanner   = document.getElementById('alertBanner');
  const alertIcon     = document.getElementById('alertIcon');
  const alertMessage  = document.getElementById('alertMessage');
  const alertCloseBtn = document.getElementById('alertCloseBtn');

  // ── Auth Modal ────────────────────────────────────────────────
  const authModal         = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authTabs          = document.querySelectorAll('.auth-tab');
  const loginForm         = document.getElementById('loginForm');
  const registerForm      = document.getElementById('registerForm');
  const loginUsername     = document.getElementById('loginUsername');
  const loginPassword     = document.getElementById('loginPassword');
  const regUsername       = document.getElementById('regUsername');
  const regPassword       = document.getElementById('regPassword');
  const regPasswordConfirm = document.getElementById('regPasswordConfirm');

  // ── Architecture Modal ────────────────────────────────────────
  const archModal        = document.getElementById('archModal');
  const archInfoBtn      = document.getElementById('archInfoBtn');
  const closeArchModalBtn = document.getElementById('closeArchModalBtn');

  // ── Leaderboard ───────────────────────────────────────────────
  const refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
  const leaderboardLoading    = document.getElementById('leaderboardLoading');
  const leaderboardEmpty      = document.getElementById('leaderboardEmpty');
  const leaderboardTable      = document.getElementById('leaderboardTable');
  const leaderboardBody       = document.getElementById('leaderboardBody');
  const myRankBanner          = document.getElementById('myRankBanner');
  const myRankText            = document.getElementById('myRankText');

  let isSimulatingFailure = false;
  let currentUser = null; // tracks logged-in user client-side

  // ══════════════════════════════════════════════════════════════
  // VIEW HELPERS
  // ══════════════════════════════════════════════════════════════

  function showView(view) {
    [startScreen, loadingView, activePuzzleView, resultView, errorView].forEach(v => {
      v === view ? v.classList.remove('hidden') : v.classList.add('hidden');
    });
  }

  function showAlert(msg, type = 'info') {
    alertMessage.textContent = msg;
    alertBanner.className = 'alert-banner';
    if (type === 'error') {
      alertBanner.classList.add('alert-error');
      alertIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    } else if (type === 'success') {
      alertBanner.classList.add('alert-success');
      alertIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else {
      alertIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
    }
    alertBanner.classList.remove('hidden');
  }

  function hideAlert() {
    alertBanner.classList.add('hidden');
  }

  // ══════════════════════════════════════════════════════════════
  // SESSION / IDENTITY
  // ══════════════════════════════════════════════════════════════

  async function loadSession() {
    try {
      const res  = await fetch('/api/session');
      const data = await res.json();
      updateIdentityUI(data.user);
      updateStatsUI(data.stats);
      currentUser = data.user?.isLoggedIn ? data.user : null;
      return data;
    } catch (err) {
      console.error('Failed to load session:', err);
      return null;
    }
  }

  function updateIdentityUI(user) {
    if (!user) return;
    userNameDisplay.textContent = user.username;

    if (user.isLoggedIn) {
      userRoleBadge.textContent = user.role;
      userRoleBadge.className = 'user-role ' + (user.role === 'admin' ? 'badge-admin' : 'badge-player');
      openAuthBtn.classList.add('hidden');
      logoutHeaderBtn.classList.remove('hidden');
    } else {
      userRoleBadge.textContent = 'Not logged in';
      userRoleBadge.className = 'user-role badge-guest';
      openAuthBtn.classList.remove('hidden');
      logoutHeaderBtn.classList.add('hidden');
    }
  }

  function updateStatsUI(stats) {
    if (!stats) return;
    scoreDisplay.textContent  = stats.score;
    streakDisplay.textContent = stats.streak;
    playedDisplay.textContent = stats.played;
  }

  // ══════════════════════════════════════════════════════════════
  // PUZZLE MANAGEMENT
  // ══════════════════════════════════════════════════════════════

  async function fetchNewPuzzle(offlineOnly = false) {
    showView(loadingView);
    hideAlert();

    try {
      const url  = `/api/puzzle/new${offlineOnly ? '?offline=true' : ''}`;
      const res  = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Server returned an error');
      }

      puzzleImage.src = data.question;

      if (data.source === 'live-api') {
        puzzleSourceBadge.textContent = 'Source: Live API';
        puzzleSourceBadge.style.color = '';
      } else if (data.source === 'mirror-api') {
        puzzleSourceBadge.textContent = 'Source: Mirror API';
        puzzleSourceBadge.style.color = '#10b981';
      } else {
        puzzleSourceBadge.textContent = 'Source: Offline Pool';
        puzzleSourceBadge.style.color = '#fbbf24';
        showAlert(data.message || 'Offline fallback mode active.', 'info');
      }

      answerInput.value = '';
      submitAnswerBtn.disabled = false;

      updateStatsUI(data.stats);
      showView(activePuzzleView);
      answerInput.focus();
    } catch (err) {
      console.error('Puzzle fetch error:', err);
      document.getElementById('errorMessageText').textContent = err.message;
      showView(errorView);
      showAlert(`API Error: ${err.message}`, 'error');
    }
  }

  // ══════════════════════════════════════════════════════════════
  // ANSWER SUBMISSION
  // ══════════════════════════════════════════════════════════════

  async function handleAnswerSubmit(userAnswer) {
    if (userAnswer === undefined || String(userAnswer).trim() === '') {
      showAlert('Please enter an answer between 0 and 9', 'error');
      return;
    }

    submitAnswerBtn.disabled = true;

    try {
      const res  = await fetch('/api/puzzle/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: parseInt(userAnswer, 10) })
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to check answer');

      updateStatsUI(data.stats);

      resUserAns.textContent  = data.userAnswer;
      resCorrectAns.textContent = data.solution;
      resultFeedback.textContent = data.feedback;

      if (data.correct) {
        resultCard.className    = 'result-card correct';
        resultIcon.innerHTML    = '<i class="fa-solid fa-face-smile-beam" style="color:#10b981"></i>';
        resultHeading.textContent = 'Correct!';
        resultHeading.style.color = '#10b981';
      } else {
        resultCard.className    = 'result-card incorrect';
        resultIcon.innerHTML    = '<i class="fa-solid fa-face-frown" style="color:#ef4444"></i>';
        resultHeading.textContent = 'Not quite!';
        resultHeading.style.color = '#ef4444';
      }

      showView(resultView);
      nextPuzzleBtn.focus();
    } catch (err) {
      console.error('Answer check error:', err);
      showAlert(err.message, 'error');
      submitAnswerBtn.disabled = false;
    }
  }

  // ══════════════════════════════════════════════════════════════
  // LEADERBOARD
  // ══════════════════════════════════════════════════════════════

  async function loadLeaderboard(highlightUsername = null) {
    leaderboardLoading.classList.remove('hidden');
    leaderboardEmpty.classList.add('hidden');
    leaderboardTable.classList.add('hidden');
    myRankBanner.classList.add('hidden');

    try {
      const res  = await fetch('/api/leaderboard?limit=10');
      const data = await res.json();

      leaderboardLoading.classList.add('hidden');

      if (!data.success || !data.scores || data.scores.length === 0) {
        leaderboardEmpty.classList.remove('hidden');
        return;
      }

      leaderboardBody.innerHTML = '';
      data.scores.forEach((entry) => {
        const isMe = highlightUsername &&
          entry.username.toLowerCase() === highlightUsername.toLowerCase();

        let rankIcon = '';
        let rankClass = 'lb-rank-n';
        if (entry.rank === 1) {
          rankIcon = '<i class="fa-solid fa-trophy" style="color:#ffd700"></i>';
          rankClass = 'lb-rank-1';
        } else if (entry.rank === 2) {
          rankIcon = '<i class="fa-solid fa-medal" style="color:#c0c0c0"></i>';
          rankClass = 'lb-rank-2';
        } else if (entry.rank === 3) {
          rankIcon = '<i class="fa-solid fa-medal" style="color:#cd7f32"></i>';
          rankClass = 'lb-rank-3';
        } else {
          rankIcon = entry.rank;
        }

        const roleTag = entry.role === 'admin'
          ? `<span class="lb-role-badge lb-role-admin">Admin</span>`
          : `<span class="lb-role-badge lb-role-player">Player</span>`;

        const tr = document.createElement('tr');
        if (isMe) tr.classList.add('lb-me');

        tr.innerHTML = `
          <td><span class="lb-rank-badge ${rankClass}">${rankIcon}</span></td>
          <td>
            ${escapeHtml(entry.username)}${roleTag}
            ${isMe ? '<strong class="lb-you-tag">(You)</strong>' : ''}
          </td>
          <td><span class="lb-score-val">${entry.score}</span></td>
          <td><span class="lb-streak-val"><i class="fa-solid fa-fire"></i> ${entry.bestStreak}</span></td>
          <td>${entry.played}</td>
        `;
        leaderboardBody.appendChild(tr);
      });

      leaderboardTable.classList.remove('hidden');

      if (data.playerRank) {
        myRankText.textContent = `You are ranked #${data.playerRank.rank} on the leaderboard!`;
        myRankBanner.classList.remove('hidden');
      }
    } catch (err) {
      leaderboardLoading.classList.add('hidden');
      leaderboardEmpty.classList.remove('hidden');
      console.error('Leaderboard error:', err);
    }
  }

  async function submitScore() {
    try {
      submitScoreBtn.disabled = true;
      submitScoreBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting&hellip;';

      const res  = await fetch('/api/leaderboard/submit', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to submit score');

      showAlert(`${data.message}`, 'success');
      await loadLeaderboard(currentUser?.username);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      submitScoreBtn.disabled = false;
      submitScoreBtn.innerHTML = '<i class="fa-solid fa-trophy"></i> Submit Score';
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ══════════════════════════════════════════════════════════════
  // AUTH MODAL
  // ══════════════════════════════════════════════════════════════

  function openAuthModal() {
    authModal.classList.remove('hidden');
    loginUsername.focus();
  }

  function closeAuthModal() {
    authModal.classList.add('hidden');
  }

  function switchTab(tabName) {
    authTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    loginForm.classList.toggle('hidden', tabName !== 'login');
    registerForm.classList.toggle('hidden', tabName !== 'register');
  }

  // Tab click
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Open / close auth modal
  openAuthBtn.addEventListener('click', openAuthModal);
  closeAuthModalBtn.addEventListener('click', closeAuthModal);
  authModal.addEventListener('click', (e) => { if (e.target === authModal) closeAuthModal(); });

  // ── Login submit ────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginUsername.value.trim();
    const password = loginPassword.value;

    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error);

      currentUser = data.user;
      updateIdentityUI(data.user);
      updateStatsUI(data.stats);
      loginPassword.value = '';
      closeAuthModal();

      let msg = `Welcome back, ${data.user.username}!`;
      if (data.previousBest !== null) {
        msg += ` Your personal best: ${data.previousBest} pts (Rank #${data.rank}).`;
      }
      showAlert(msg, 'success');
      await loadLeaderboard(data.user.username);
    } catch (err) {
      showAlert(err.message, 'error');
    }
  });

  // ── Register submit ─────────────────────────────────────────
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = regUsername.value.trim();
    const password = regPassword.value;
    const confirm  = regPasswordConfirm.value;

    if (password !== confirm) {
      showAlert('Passwords do not match.', 'error');
      return;
    }

    try {
      const res  = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error);

      currentUser = data.user;
      updateIdentityUI(data.user);
      updateStatsUI(data.stats);
      regPassword.value = '';
      regPasswordConfirm.value = '';
      closeAuthModal();
      showAlert(`Account created! Welcome, ${data.user.username}!`, 'success');
      await loadLeaderboard(data.user.username);
    } catch (err) {
      showAlert(err.message, 'error');
    }
  });

  // ── Logout ──────────────────────────────────────────────────
  logoutHeaderBtn.addEventListener('click', async () => {
    try {
      const res  = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();

      currentUser = null;
      updateIdentityUI(data.user);
      updateStatsUI({ score: 0, streak: 0, played: 0 });
      showAlert('Logged out successfully.', 'info');
      showView(startScreen);
      await loadLeaderboard(null);
    } catch (err) {
      showAlert('Logout failed.', 'error');
    }
  });

  // ══════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ══════════════════════════════════════════════════════════════

  // Game controls
  startGameBtn.addEventListener('click', () => fetchNewPuzzle());
  nextPuzzleBtn.addEventListener('click', () => fetchNewPuzzle());
  newPuzzleBtn.addEventListener('click', () => fetchNewPuzzle());
  retryApiBtn.addEventListener('click', () => fetchNewPuzzle(false));
  loadOfflineBtn.addEventListener('click', () => fetchNewPuzzle(true));

  // Answer form
  answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAnswerSubmit(answerInput.value);
  });

  // Quick numpad
  quickNumpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.numpad-btn');
    if (btn) {
      answerInput.value = btn.dataset.val;
      handleAnswerSubmit(btn.dataset.val);
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Only intercept digit keys when the answer input is NOT already focused
    // (prevents double-entry: once from JS and once from browser's native input handling)
    if (!activePuzzleView.classList.contains('hidden') && authModal.classList.contains('hidden')) {
      if (e.key >= '0' && e.key <= '9' && document.activeElement !== answerInput) {
        answerInput.value = e.key;
        answerInput.focus();
      }
    }
    if (!resultView.classList.contains('hidden') && e.key === 'Enter') fetchNewPuzzle();
  });

  // Reset session
  resetSessionBtn.addEventListener('click', async () => {
    if (confirm('Reset your score and stats for this session?')) {
      try {
        const res  = await fetch('/api/session/reset', { method: 'POST' });
        const data = await res.json();
        updateStatsUI(data.stats);
        showAlert('Session reset.', 'info');
        showView(startScreen);
      } catch {
        showAlert('Failed to reset session.', 'error');
      }
    }
  });

  // Submit score
  submitScoreBtn.addEventListener('click', () => submitScore());

  // Refresh leaderboard
  refreshLeaderboardBtn.addEventListener('click', () => loadLeaderboard(currentUser?.username));

  // API failure toggle
  toggleApiSimBtn.addEventListener('click', async () => {
    try {
      isSimulatingFailure = !isSimulatingFailure;
      const res  = await fetch('/api/admin/toggle-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: isSimulatingFailure })
      });
      const data = await res.json();

      simFailureStatus.textContent = isSimulatingFailure ? 'ON' : 'OFF';
      toggleApiSimBtn.style.color  = isSimulatingFailure ? '#ef4444' : '';
      showAlert(data.message, isSimulatingFailure ? 'error' : 'success');
    } catch (err) {
      console.error(err);
    }
  });

  // Architecture modal
  archInfoBtn.addEventListener('click', () => archModal.classList.remove('hidden'));
  closeArchModalBtn.addEventListener('click', () => archModal.classList.add('hidden'));
  archModal.addEventListener('click', (e) => { if (e.target === archModal) archModal.classList.add('hidden'); });

  // Alert close
  alertCloseBtn.addEventListener('click', hideAlert);

  // ══════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════
  loadSession().then((sessionData) => {
    const username = sessionData?.user?.isLoggedIn ? sessionData.user.username : null;
    loadLeaderboard(username);
  });

});
