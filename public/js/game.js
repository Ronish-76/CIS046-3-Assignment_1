/**
 * GameController — Main Game Engine and State Machine
 */

class GameEngine {
  constructor() {
    this.selectedDifficulty = 'easy';
    this.currentPuzzle = null;
    this.puzzleStartTime = null;
    this.timerInterval = null;
    this.timeRemainingSeconds = 0;
    this.totalTimerDuration = 45;
    this.currentUser = null;

    this.dom = {
      userDisplayName: document.getElementById('userDisplayName'),
      userRoleTag: document.getElementById('userRoleTag'),
      adminNavBtn: document.getElementById('adminNavBtn'),
      logoutBtn: document.getElementById('logoutBtn'),
      muteBtn: document.getElementById('muteBtn'),

      // Stats
      statScore: document.getElementById('statScore'),
      statStreak: document.getElementById('statStreak'),
      statPlayed: document.getElementById('statPlayed'),

      // Game Views
      startCard: document.getElementById('startCard'),
      puzzleContainer: document.getElementById('puzzleContainer'),
      loadingCard: document.getElementById('loadingCard'),
      resultCard: document.getElementById('resultCard'),
      errorCard: document.getElementById('errorCard'),

      // Puzzle Elements
      puzzleImg: document.getElementById('puzzleImg'),
      difficultyBadge: document.getElementById('difficultyBadge'),
      sourceBadge: document.getElementById('sourceBadge'),
      timerBar: document.getElementById('timerBar'),
      timerCountdown: document.getElementById('timerCountdown'),
      answerInput: document.getElementById('answerInput'),
      submitAnswerBtn: document.getElementById('submitAnswerBtn'),

      // Result Elements
      resultIcon: document.getElementById('resultIcon'),
      resultTitle: document.getElementById('resultTitle'),
      resultFeedback: document.getElementById('resultFeedback'),
      resultUserAnswer: document.getElementById('resultUserAnswer'),
      resultCorrectSolution: document.getElementById('resultCorrectSolution'),
      resultPoints: document.getElementById('resultPoints'),
      nextPuzzleBtn: document.getElementById('nextPuzzleBtn'),

      // Leaderboard
      leaderboardBody: document.getElementById('leaderboardBody'),
      lbFilterButtons: document.querySelectorAll('[data-lb-difficulty]')
    };

    this.inputController = new InputController({
      inputElement: this.dom.answerInput,
      onSubmit: (val) => this.submitAnswer(val),
      onClear: () => {}
    });

    this.bindEvents();
    this.init();
  }

  async init() {
    try {
      const auth = await api.get('/api/auth/me');
      if (auth && auth.success && auth.user) {
        this.currentUser = auth.user;
        this.dom.userDisplayName.textContent = auth.user.displayName;
        this.dom.userRoleTag.textContent = auth.user.role.toUpperCase();

        if (auth.user.role === 'admin' && this.dom.adminNavBtn) {
          this.dom.adminNavBtn.classList.remove('hidden');
        }

        if (auth.sessionStats) {
          this.updateStatsUI(auth.sessionStats);
        }
      }
    } catch {
      window.location.replace('/login.html');
      return;
    }

    this.loadLeaderboard('all');
  }

  bindEvents() {
    // Difficulty mode buttons
    document.querySelectorAll('[data-difficulty-choice]').forEach(btn => {
      btn.addEventListener('click', () => {
        const newChoice = btn.dataset.difficultyChoice;
        document.querySelectorAll('[data-difficulty-choice]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedDifficulty = newChoice;

        // If currently in an active puzzle, switch immediately to the selected difficulty
        if (this.dom.puzzleContainer && !this.dom.puzzleContainer.classList.contains('hidden')) {
          this.fetchNewPuzzle();
        }

        // Also sync the leaderboard difficulty filter
        this.dom.lbFilterButtons.forEach(b => {
          b.classList.toggle('active', b.dataset.lbDifficulty === newChoice);
        });
        this.loadLeaderboard(newChoice);
      });
    });

    // Start / New game buttons
    document.getElementById('startGameBtn')?.addEventListener('click', () => this.fetchNewPuzzle());
    document.getElementById('newPuzzleBtn')?.addEventListener('click', () => this.fetchNewPuzzle());
    document.getElementById('retryBtn')?.addEventListener('click', () => this.fetchNewPuzzle(false));
    document.getElementById('offlineBtn')?.addEventListener('click', () => this.fetchNewPuzzle(true));
    this.dom.nextPuzzleBtn?.addEventListener('click', () => this.fetchNewPuzzle());

    // Submit answer form
    document.getElementById('answerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.inputController.triggerSubmit();
    });

    // Reset game session stats
    document.getElementById('resetGameBtn')?.addEventListener('click', async () => {
      if (confirm('Reset your current game session score and streak?')) {
        const res = await api.post('/api/game/reset');
        if (res.sessionStats) this.updateStatsUI(res.sessionStats);
        this.showView(this.dom.startCard);
      }
    });

    // Leaderboard filter buttons
    this.dom.lbFilterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.lbFilterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadLeaderboard(btn.dataset.lbDifficulty);
      });
    });

    // Audio mute button
    this.dom.muteBtn?.addEventListener('click', () => {
      const isMuted = window.audioController.toggleMute();
      this.dom.muteBtn.innerHTML = isMuted
        ? '<i class="fa-solid fa-volume-xmark"></i>'
        : '<i class="fa-solid fa-volume-high"></i>';
    });

    // Logout button
    this.dom.logoutBtn?.addEventListener('click', async () => {
      await api.post('/api/auth/logout');
      window.location.replace('/login.html');
    });
  }

  showView(targetView) {
    [this.dom.startCard, this.dom.puzzleContainer, this.dom.loadingCard, this.dom.resultCard, this.dom.errorCard].forEach(card => {
      if (card) {
        if (card === targetView) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      }
    });
  }

  updateStatsUI(stats) {
    if (!stats) return;
    if (this.dom.statScore) this.dom.statScore.textContent = stats.score || 0;
    if (this.dom.statStreak) this.dom.statStreak.textContent = stats.streak || 0;
    if (this.dom.statPlayed) this.dom.statPlayed.textContent = stats.played || 0;
  }

  async fetchNewPuzzle(forceOffline = false) {
    this.stopTimer();
    this.showView(this.dom.loadingCard);
    this.inputController.clear();
    this.inputController.setEnabled(false);

    try {
      const url = `/api/game/puzzle?difficulty=${this.selectedDifficulty}${forceOffline ? '&offline=true' : ''}`;
      const data = await api.get(url);

      if (!data.success) throw new Error(data.error || 'Failed to retrieve puzzle.');

      this.currentPuzzle = data;

      // Handle image loading fallback
      this.dom.puzzleImg.onerror = () => {
        console.warn('Puzzle image display failed in browser. Gracefully recovering using offline pool...');
        if (!forceOffline) {
          this.fetchNewPuzzle(true);
        }
      };

      this.dom.puzzleImg.src = data.question;
      this.dom.difficultyBadge.textContent = data.difficulty.toUpperCase();
      this.dom.difficultyBadge.className = `badge badge-${data.difficulty}`;
      this.dom.sourceBadge.textContent = data.source === 'primary-api' ? 'Live API' : (data.source === 'mirror-api' ? 'Mirror API' : 'Offline Cache');

      this.updateStatsUI(data.sessionStats);

      this.showView(this.dom.puzzleContainer);
      this.inputController.setEnabled(true);
      if (this.dom.answerInput) this.dom.answerInput.focus();

      // Start countdown timer
      this.startTimer(data.timeLimitSeconds);
    } catch (err) {
      document.getElementById('errorMessage').textContent = err.message || 'Remote API service unavailable.';
      this.showView(this.dom.errorCard);
    }
  }

  startTimer(durationSeconds) {
    this.totalTimerDuration = durationSeconds;
    this.timeRemainingSeconds = durationSeconds;
    this.puzzleStartTime = Date.now();

    this.renderTimer();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSeconds -= 1;
      this.renderTimer();

      if (this.timeRemainingSeconds <= 3 && this.timeRemainingSeconds > 0) {
        window.audioController.playTick();
      }

      if (this.timeRemainingSeconds <= 0) {
        this.stopTimer();
        // Time expired: auto submit with empty/timeout
        this.submitAnswer(-1, true);
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  renderTimer() {
    const pct = Math.max(0, Math.min(100, (this.timeRemainingSeconds / this.totalTimerDuration) * 100));
    if (this.dom.timerBar) {
      this.dom.timerBar.style.width = `${pct}%`;
      if (pct < 25) {
        this.dom.timerBar.style.backgroundColor = 'var(--color-danger)';
      } else if (pct < 50) {
        this.dom.timerBar.style.backgroundColor = 'var(--color-warning)';
      } else {
        this.dom.timerBar.style.backgroundColor = 'var(--color-primary)';
      }
    }
    if (this.dom.timerCountdown) {
      this.dom.timerCountdown.textContent = `${this.timeRemainingSeconds}s`;
    }
  }

  async submitAnswer(answerVal, isAutoTimeout = false) {
    if (!isAutoTimeout && (answerVal === undefined || answerVal === null || String(answerVal).trim() === '')) {
      if (this.dom.answerInput) this.dom.answerInput.focus();
      return;
    }

    this.stopTimer();
    this.inputController.setEnabled(false);

    const clientReportedTimeMs = Date.now() - (this.puzzleStartTime || Date.now());
    const numericAnswer = parseInt(answerVal, 10);

    try {
      const result = await api.post('/api/game/answer', {
        answer: isAutoTimeout ? 999 : numericAnswer,
        timeElapsed: clientReportedTimeMs
      });

      this.updateStatsUI(result.sessionStats);

      // Audio feedback synthesis
      if (result.correct) {
        if (result.streakBonus > 0) {
          window.audioController.playStreakBonus();
        } else {
          window.audioController.playSuccess();
        }
      } else {
        window.audioController.playError();
      }

      // Populate Result View
      this.dom.resultIcon.innerHTML = result.correct
        ? '<i class="fa-solid fa-circle-check text-success"></i>'
        : '<i class="fa-solid fa-circle-xmark text-danger"></i>';
      this.dom.resultTitle.textContent = result.correct ? 'Correct Solution!' : (result.isTimedOut ? 'Time Expired!' : 'Incorrect Solution');
      this.dom.resultFeedback.textContent = result.feedback;
      this.dom.resultUserAnswer.textContent = result.userAnswer === 999 ? 'Timed Out' : result.userAnswer;
      this.dom.resultCorrectSolution.textContent = result.solution;
      this.dom.resultPoints.textContent = `+${result.pointsAwarded} pts`;

      this.showView(this.dom.resultCard);
      this.dom.nextPuzzleBtn?.focus();

      // Refresh leaderboard after answer recorded
      this.loadLeaderboard(this.selectedDifficulty);
    } catch (err) {
      alert(err.message || 'Error checking answer.');
      this.inputController.setEnabled(true);
    }
  }

  async loadLeaderboard(difficulty = 'all') {
    if (!this.dom.leaderboardBody) return;

    try {
      const data = await api.get(`/api/game/leaderboard?difficulty=${difficulty}&limit=10`);
      if (!data.success || !data.rankings) return;

      this.dom.leaderboardBody.innerHTML = '';

      if (data.rankings.length === 0) {
        this.dom.leaderboardBody.innerHTML = `
          <tr>
            <td colspan="5" class="text-center text-muted py-4">No records yet for ${difficulty} mode. Be the first to solve!</td>
          </tr>
        `;
        return;
      }

      data.rankings.forEach(row => {
        const isMe = this.currentUser && String(row.userId) === String(this.currentUser.id);
        const tr = document.createElement('tr');
        if (isMe) tr.classList.add('tr-me');

        let rankBadge = `${row.rank}`;
        if (row.rank === 1) rankBadge = '🥇';
        else if (row.rank === 2) rankBadge = '🥈';
        else if (row.rank === 3) rankBadge = '🥉';

        tr.innerHTML = `
          <td class="font-mono text-center">${rankBadge}</td>
          <td>
            <strong>${row.displayName}</strong>
            ${isMe ? '<span class="badge badge-primary ml-1">You</span>' : ''}
          </td>
          <td class="font-mono font-bold text-primary">${row.totalPoints}</td>
          <td class="font-mono">${row.accuracy}%</td>
          <td class="font-mono">${row.avgTimeSeconds}s</td>
        `;

        this.dom.leaderboardBody.appendChild(tr);
      });
    } catch (err) {
      console.warn('Could not load leaderboard:', err.message);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new GameEngine();
});

