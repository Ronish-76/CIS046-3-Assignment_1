/**
 * Banana Puzzle Game - Client Controller
 * Demonstrates:
 * 1. Event-Driven Programming (EDP): Event listeners, DOM manipulation, asynchronous state flow
 * 2. Interoperability: HTTP client requests to Node.js backend
 * 3. Virtual Identity: Managing player login/logout and session updates
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Screens
  const startScreen = document.getElementById('startScreen');
  const loadingView = document.getElementById('loadingView');
  const activePuzzleView = document.getElementById('activePuzzleView');
  const resultView = document.getElementById('resultView');
  const errorView = document.getElementById('errorView');

  // DOM Elements - Images & Inputs
  const puzzleImage = document.getElementById('puzzleImage');
  const puzzleSourceBadge = document.getElementById('puzzleSourceBadge');
  const answerForm = document.getElementById('answerForm');
  const answerInput = document.getElementById('answerInput');
  const submitAnswerBtn = document.getElementById('submitAnswerBtn');
  const quickNumpad = document.getElementById('quickNumpad');

  // DOM Elements - Stats & Identity
  const scoreDisplay = document.getElementById('scoreDisplay');
  const streakDisplay = document.getElementById('streakDisplay');
  const playedDisplay = document.getElementById('playedDisplay');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const apiStatusBadge = document.getElementById('apiStatusBadge');

  // DOM Elements - Result View Elements
  const resultCard = document.getElementById('resultCard');
  const resultIcon = document.getElementById('resultIcon');
  const resultHeading = document.getElementById('resultHeading');
  const resultFeedback = document.getElementById('resultFeedback');
  const resUserAns = document.getElementById('resUserAns');
  const resCorrectAns = document.getElementById('resCorrectAns');
  const nextPuzzleBtn = document.getElementById('nextPuzzleBtn');

  // DOM Elements - Controls & Modals
  const startGameBtn     = document.getElementById('startGameBtn');
  const newPuzzleBtn     = document.getElementById('newPuzzleBtn');
  const submitScoreBtn   = document.getElementById('submitScoreBtn');
  const resetSessionBtn  = document.getElementById('resetSessionBtn');
  const retryApiBtn      = document.getElementById('retryApiBtn');
  const loadOfflineBtn   = document.getElementById('loadOfflineBtn');
  const toggleApiSimBtn  = document.getElementById('toggleApiSimBtn');
  const simFailureStatus = document.getElementById('simFailureStatus');

  const alertBanner = document.getElementById('alertBanner');
  const alertIcon = document.getElementById('alertIcon');
  const alertMessage = document.getElementById('alertMessage');
  const alertCloseBtn = document.getElementById('alertCloseBtn');

  // Modals
  const identityModal = document.getElementById('identityModal');
  const identityModalBtn = document.getElementById('identityModalBtn');
  const closeIdentityModalBtn = document.getElementById('closeIdentityModalBtn');
  const identityForm = document.getElementById('identityForm');
  const usernameInput = document.getElementById('usernameInput');
  const userRoleSelect = document.getElementById('userRoleSelect');
  const logoutBtn = document.getElementById('logoutBtn');

  const archModal = document.getElementById('archModal');
  const archInfoBtn = document.getElementById('archInfoBtn');
  const closeArchModalBtn = document.getElementById('closeArchModalBtn');

  // Leaderboard elements
  const refreshLeaderboardBtn  = document.getElementById('refreshLeaderboardBtn');
  const leaderboardLoading     = document.getElementById('leaderboardLoading');
  const leaderboardEmpty       = document.getElementById('leaderboardEmpty');
  const leaderboardTable       = document.getElementById('leaderboardTable');
  const leaderboardBody        = document.getElementById('leaderboardBody');
  const myRankBanner           = document.getElementById('myRankBanner');
  const myRankText             = document.getElementById('myRankText');

  let isSimulatingFailure = false;

  // ==========================================
  // VIEW SWITCHING HELPERS
  // ==========================================
  function showView(viewToShow) {
    const views = [startScreen, loadingView, activePuzzleView, resultView, errorView];
    views.forEach(v => {
      if (v === viewToShow) {
        v.classList.remove('hidden');
      } else {
        v.classList.add('hidden');
      }
    });
  }

  function showAlert(msg, type = 'info') {
    alertMessage.textContent = msg;
    alertBanner.className = 'alert-banner';
    if (type === 'error') {
      alertBanner.classList.add('alert-error');
      alertIcon.textContent = '❌';
    } else if (type === 'success') {
      alertBanner.classList.add('alert-success');
      alertIcon.textContent = '✅';
    } else {
      alertIcon.textContent = 'ℹ️';
    }
    alertBanner.classList.remove('hidden');
  }

  function hideAlert() {
    alertBanner.classList.add('hidden');
  }

  // ==========================================
  // SESSION & IDENTITY MANAGEMENT (Theme: Virtual Identity)
  // ==========================================
  async function loadSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();

      updateIdentityUI(data.user);
      updateStatsUI(data.stats);
      return data; // Return so callers can access user info without a second fetch
    } catch (err) {
      console.error('Failed to load session:', err);
      return null;
    }
  }

  function updateIdentityUI(user) {
    if (!user) return;
    userNameDisplay.textContent = user.username;
    userRoleBadge.textContent = user.role;
    userRoleBadge.className = 'user-role ' + (user.role === 'admin' ? 'badge-admin' : (user.isLoggedIn ? 'badge-player' : 'badge-guest'));
    usernameInput.value = user.isLoggedIn ? user.username : '';
    userRoleSelect.value = user.role === 'admin' ? 'admin' : 'player';
  }

  function updateStatsUI(stats) {
    if (!stats) return;
    scoreDisplay.textContent = stats.score;
    streakDisplay.textContent = `🔥 ${stats.streak}`;
    playedDisplay.textContent = stats.played;
  }

  // ==========================================
  // PUZZLE MANAGEMENT (Theme: Interoperability)
  // ==========================================
  async function fetchNewPuzzle(offlineOnly = false) {
    showView(loadingView);
    hideAlert();

    try {
      const url = `/api/puzzle/new${offlineOnly ? '?offline=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Server returned an error');
      }

      // Display question image
      puzzleImage.src = data.question;
      puzzleSourceBadge.textContent = data.source === 'live-api'
        ? 'Source: Live Banana API'
        : (data.source === 'mirror-api' ? 'Source: Mirror Banana API' : 'Source: Offline Puzzle Pool');
      
      puzzleSourceBadge.style.color = data.source === 'offline-fallback' ? '#fbbf24' : '#10b981';

      if (data.source === 'offline-fallback') {
        showAlert(data.message || 'Offline fallback mode active.', 'info');
      }

      // Reset and focus input
      answerInput.value = '';
      answerForm.style.display = 'block';
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

  // ==========================================
  // ANSWER SUBMISSION (Theme: Event-Driven Programming)
  // ==========================================
  async function handleAnswerSubmit(userAnswer) {
    if (userAnswer === undefined || userAnswer === null || String(userAnswer).trim() === '') {
      showAlert('Please enter an answer between 0 and 9', 'error');
      return;
    }

    submitAnswerBtn.disabled = true;

    try {
      const res = await fetch('/api/puzzle/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: parseInt(userAnswer, 10) })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to check answer');
      }

      // Update statistics
      updateStatsUI(data.stats);

      // Populate Result View
      resUserAns.textContent = data.userAnswer;
      resCorrectAns.textContent = data.solution;
      resultFeedback.textContent = data.feedback;

      if (data.correct) {
        resultCard.className = 'result-card correct';
        resultIcon.textContent = '🎉';
        resultHeading.textContent = 'Awesome! Correct!';
        resultHeading.style.color = '#10b981';
      } else {
        resultCard.className = 'result-card incorrect';
        resultIcon.textContent = '❌';
        resultHeading.textContent = 'Oops! Not quite.';
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

  // ==========================================
  // LEADERBOARD (Persistent High Scores)
  // ==========================================

  /**
   * Fetch top scores from the server and render the leaderboard table.
   * @param {string|null} currentUsername - highlight this player's row if present
   */
  async function loadLeaderboard(currentUsername = null) {
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

      // Render rows
      leaderboardBody.innerHTML = '';
      data.scores.forEach((entry) => {
        const isMe = currentUsername &&
          entry.username.toLowerCase() === currentUsername.toLowerCase();

        // Rank badge styling
        let rankClass = 'lb-rank-n';
        if (entry.rank === 1) rankClass = 'lb-rank-1';
        else if (entry.rank === 2) rankClass = 'lb-rank-2';
        else if (entry.rank === 3) rankClass = 'lb-rank-3';

        const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank;

        const roleTag = entry.role === 'admin'
          ? `<span class="lb-role-badge lb-role-admin">Admin</span>`
          : `<span class="lb-role-badge lb-role-player">Player</span>`;

        const tr = document.createElement('tr');
        if (isMe) tr.classList.add('lb-me');

        tr.innerHTML = `
          <td><span class="lb-rank-badge ${rankClass}">${medal}</span></td>
          <td>${escapeHtml(entry.username)}${roleTag}${isMe ? ' <strong style="color:var(--primary);font-size:0.72rem;">(You)</strong>' : ''}</td>
          <td><span class="lb-score-val">${entry.score}</span></td>
          <td><span class="lb-streak-val">🔥 ${entry.bestStreak}</span></td>
          <td>${entry.played}</td>
        `;
        leaderboardBody.appendChild(tr);
      });

      leaderboardTable.classList.remove('hidden');

      // Show player's rank in banner if available
      if (data.playerRank) {
        myRankText.textContent = `You are currently ranked #${data.playerRank.rank} on the leaderboard!`;
        myRankBanner.classList.remove('hidden');
      }
    } catch (err) {
      leaderboardLoading.classList.add('hidden');
      leaderboardEmpty.classList.remove('hidden');
      console.error('Leaderboard load error:', err);
    }
  }

  /**
   * Submit current session score to the persistent leaderboard.
   */
  async function submitScore() {
    try {
      submitScoreBtn.disabled = true;
      submitScoreBtn.textContent = '⏳ Submitting…';

      const res  = await fetch('/api/leaderboard/submit', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit score');
      }

      showAlert(`🏆 ${data.message}`, 'success');

      // Refresh the leaderboard table with newly submitted data
      const sessionRes  = await fetch('/api/session');
      const sessionData = await sessionRes.json();
      await loadLeaderboard(sessionData.user?.username);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      submitScoreBtn.disabled = false;
      submitScoreBtn.textContent = '🏆 Submit Score';
    }
  }

  /** Escape HTML to prevent XSS in username display */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================
  // EVENT LISTENERS (Theme: Event-Driven Architecture)
  // ==========================================

  // 1. Start Game
  startGameBtn.addEventListener('click', () => fetchNewPuzzle());

  // 2. Next Puzzle / New Puzzle
  nextPuzzleBtn.addEventListener('click', () => fetchNewPuzzle());
  newPuzzleBtn.addEventListener('click', () => fetchNewPuzzle());

  // 11. Submit Score to Leaderboard
  submitScoreBtn.addEventListener('click', () => submitScore());

  // 12. Refresh Leaderboard
  refreshLeaderboardBtn.addEventListener('click', async () => {
    const sessionRes  = await fetch('/api/session');
    const sessionData = await sessionRes.json();
    loadLeaderboard(sessionData.user?.isLoggedIn ? sessionData.user.username : null);
  });

  // 3. Retry on Error
  retryApiBtn.addEventListener('click', () => fetchNewPuzzle(false));
  loadOfflineBtn.addEventListener('click', () => fetchNewPuzzle(true));

  // 4. Form Submit
  answerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleAnswerSubmit(answerInput.value);
  });

  // 5. Quick Numpad Buttons (0-9)
  quickNumpad.addEventListener('click', (e) => {
    const btn = e.target.closest('.numpad-btn');
    if (btn) {
      const val = btn.dataset.val;
      answerInput.value = val;
      handleAnswerSubmit(val);
    }
  });

  // 6. Keyboard Shortcuts (0-9 to input, Enter to submit)
  document.addEventListener('keydown', (e) => {
    // If inside active puzzle view and typing a digit
    if (!activePuzzleView.classList.contains('hidden') && !identityModal.classList.contains('hidden') === false) {
      if (e.key >= '0' && e.key <= '9') {
        answerInput.value = e.key;
      }
    }
    // Enter key on result view triggers next puzzle
    if (!resultView.classList.contains('hidden') && e.key === 'Enter') {
      fetchNewPuzzle();
    }
  });

  // 7. Reset Game Session
  resetSessionBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset your score and stats for this session?')) {
      try {
        const res = await fetch('/api/session/reset', { method: 'POST' });
        const data = await res.json();
        updateStatsUI(data.stats);
        showAlert('Game session has been reset.', 'info');
        showView(startScreen);
      } catch (err) {
        showAlert('Failed to reset session.', 'error');
      }
    }
  });

  // 8. Toggle API Failure Simulation (For tutor presentation / rubric evidence)
  toggleApiSimBtn.addEventListener('click', async () => {
    try {
      isSimulatingFailure = !isSimulatingFailure;
      const res = await fetch('/api/admin/toggle-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulate: isSimulatingFailure })
      });
      const data = await res.json();

      simFailureStatus.textContent = isSimulatingFailure ? 'ON (ACTIVE)' : 'OFF';
      toggleApiSimBtn.style.color = isSimulatingFailure ? '#ef4444' : 'inherit';
      showAlert(data.message, isSimulatingFailure ? 'error' : 'success');
    } catch (err) {
      console.error(err);
    }
  });

  // 9. Identity Modal controls
  identityModalBtn.addEventListener('click', () => {
    identityModal.classList.remove('hidden');
    usernameInput.focus();
  });

  closeIdentityModalBtn.addEventListener('click', () => {
    identityModal.classList.add('hidden');
  });

  identityModal.addEventListener('click', (e) => {
    if (e.target === identityModal) {
      identityModal.classList.add('hidden');
    }
  });

  identityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const role = userRoleSelect.value;

    try {
      const res = await fetch('/api/session/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      updateIdentityUI(data.user);
      updateStatsUI(data.stats);
      identityModal.classList.add('hidden');
      showAlert(`Identity updated: ${data.user.username} (${data.user.role})`, 'success');
      // Refresh leaderboard to highlight this player's existing entry if any
      loadLeaderboard(data.user.username);
    } catch (err) {
      showAlert(err.message, 'error');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/session/logout', { method: 'POST' });
      const data = await res.json();
      updateIdentityUI(data.user);
      updateStatsUI({ score: 0, streak: 0, played: 0 });
      identityModal.classList.add('hidden');
      showAlert('Logged out. Reverted to Guest.', 'info');
      showView(startScreen);
    } catch (err) {
      showAlert('Logout failed.', 'error');
    }
  });

  // 10. Architecture Guide Modal
  archInfoBtn.addEventListener('click', () => {
    archModal.classList.remove('hidden');
  });

  closeArchModalBtn.addEventListener('click', () => {
    archModal.classList.add('hidden');
  });

  archModal.addEventListener('click', (e) => {
    if (e.target === archModal) {
      archModal.classList.add('hidden');
    }
  });

  alertCloseBtn.addEventListener('click', hideAlert);

  // Initialize: load session info AND the leaderboard on page load
  loadSession().then((sessionData) => {
    const username = sessionData?.user?.isLoggedIn ? sessionData.user.username : null;
    loadLeaderboard(username);
  });
});
