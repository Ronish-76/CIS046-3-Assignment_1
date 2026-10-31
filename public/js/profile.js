/**
 * ProfileController — User Metrics & Historical Attempt Logs
 */

document.addEventListener('DOMContentLoaded', async () => {
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileRole = document.getElementById('profileRole');
  const profileCreated = document.getElementById('profileCreated');

  const metricAccuracy = document.getElementById('metricAccuracy');
  const metricAvgTime = document.getElementById('metricAvgTime');
  const metricTotalSolved = document.getElementById('metricTotalSolved');
  const metricBestStreak = document.getElementById('metricBestStreak');
  const metricTotalAttempts = document.getElementById('metricTotalAttempts');
  const metricFastestTime = document.getElementById('metricFastestTime');

  const diffBreakdownList = document.getElementById('diffBreakdownList');
  const historyTableBody = document.getElementById('historyTableBody');

  // Verify auth first
  try {
    const auth = await api.get('/api/auth/me');
    if (!auth || !auth.user) {
      window.location.replace('/login.html');
      return;
    }

    if (auth.user.role === 'admin') {
      document.getElementById('adminNavBtn')?.classList.remove('hidden');
    }
  } catch {
    window.location.replace('/login.html');
    return;
  }

  // Load metrics
  try {
    const data = await api.get('/api/profile/metrics');
    if (!data.success || !data.metrics) return;

    const { user, summary, difficultyBreakdown, recentSessions } = data.metrics;

    if (user) {
      if (profileName) profileName.textContent = user.displayName;
      if (profileEmail) profileEmail.textContent = user.email;
      if (profileRole) profileRole.textContent = user.role.toUpperCase();
      if (profileCreated) profileCreated.textContent = new Date(user.createdAt).toLocaleDateString();
    }

    // Hydrate stat summary
    if (metricAccuracy) metricAccuracy.textContent = `${summary.accuracy ? summary.accuracy.toFixed(1) : 0}%`;
    if (metricAvgTime) metricAvgTime.textContent = `${summary.avgTimeSeconds ? summary.avgTimeSeconds.toFixed(2) : 0}s`;
    if (metricTotalSolved) metricTotalSolved.textContent = summary.correctAttempts || 0;
    if (metricTotalAttempts) metricTotalAttempts.textContent = summary.totalAttempts || 0;
    if (metricBestStreak) metricBestStreak.textContent = user.bestStreak || 0;
    if (metricFastestTime) metricFastestTime.textContent = summary.fastestTimeSeconds ? `${summary.fastestTimeSeconds.toFixed(2)}s` : '—';

    // Hydrate difficulty breakdown
    if (diffBreakdownList && Array.isArray(difficultyBreakdown)) {
      diffBreakdownList.innerHTML = '';
      if (difficultyBreakdown.length === 0) {
        diffBreakdownList.innerHTML = '<p class="text-muted">No game attempts recorded yet.</p>';
      } else {
        difficultyBreakdown.forEach(item => {
          const acc = item.attempts > 0 ? ((item.solved / item.attempts) * 100).toFixed(0) : 0;
          const avgS = item.avgTimeMs ? (item.avgTimeMs / 1000).toFixed(1) : 0;

          const card = document.createElement('div');
          card.className = 'diff-card';
          card.innerHTML = `
            <div class="diff-header">
              <span class="badge badge-${item._id}">${item._id.toUpperCase()}</span>
              <span class="font-mono font-bold">${item.totalPoints} pts</span>
            </div>
            <div class="diff-stats font-mono">
              <div>Attempts: <span>${item.attempts}</span></div>
              <div>Solved: <span>${item.solved} (${acc}%)</span></div>
              <div>Avg Speed: <span>${avgS}s</span></div>
            </div>
          `;
          diffBreakdownList.appendChild(card);
        });
      }
    }

    // Hydrate recent sessions history
    if (historyTableBody && Array.isArray(recentSessions)) {
      historyTableBody.innerHTML = '';
      if (recentSessions.length === 0) {
        historyTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-muted py-4">No recent game sessions recorded yet. Play a puzzle to see your logs!</td>
          </tr>
        `;
      } else {
        recentSessions.forEach(session => {
          const tr = document.createElement('tr');
          const timeSec = (session.timeTakenMs / 1000).toFixed(2);
          const dateStr = new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          tr.innerHTML = `
            <td class="font-mono text-muted">${dateStr}</td>
            <td><span class="badge badge-${session.difficulty}">${session.difficulty.toUpperCase()}</span></td>
            <td class="text-center">
              ${session.isCorrect
                ? '<span class="text-success"><i class="fa-solid fa-check"></i> Correct</span>'
                : '<span class="text-danger"><i class="fa-solid fa-xmark"></i> Failed</span>'}
            </td>
            <td class="font-mono">${session.userAnswer !== undefined ? (session.userAnswer === 999 ? 'Timeout' : session.userAnswer) : '—'}</td>
            <td class="font-mono font-bold ${session.pointsAwarded > 0 ? 'text-primary' : 'text-muted'}">+${session.pointsAwarded}</td>
            <td class="font-mono">${timeSec}s</td>
          `;
          historyTableBody.appendChild(tr);
        });
      }
    }
  } catch (err) {
    console.error('Failed to load user profile metrics:', err);
  }

  // Logout button
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await api.post('/api/auth/logout');
    window.location.replace('/login.html');
  });
});

