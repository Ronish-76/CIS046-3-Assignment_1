/**
 * AdminController — Protected Management Dashboard
 */

document.addEventListener('DOMContentLoaded', async () => {
  const adminUsersTableBody = document.getElementById('adminUsersTableBody');
  const adminSessionsTableBody = document.getElementById('adminSessionsTableBody');
  const metricTotalUsers = document.getElementById('metricTotalUsers');
  const metricTotalSessions = document.getElementById('metricTotalSessions');
  const metricTotalPoints = document.getElementById('metricTotalPoints');

  const toggleFailureBtn = document.getElementById('toggleFailureBtn');
  const failureStatusBadge = document.getElementById('failureStatusBadge');

  // Verify Admin privilege
  try {
    const auth = await api.get('/api/auth/me');
    if (!auth || !auth.user || auth.user.role !== 'admin') {
      alert('Access Denied: Administrator role required.');
      window.location.replace('/');
      return;
    }
  } catch {
    window.location.replace('/login.html');
    return;
  }

  // Load Admin Data
  async function loadAdminData() {
    try {
      const data = await api.get('/api/admin/stats');
      if (data.success && data.stats) {
        const { stats, apiStatus } = data;
        if (metricTotalUsers) metricTotalUsers.textContent = stats.totalUsers || 0;
        if (metricTotalSessions) metricTotalSessions.textContent = stats.totalSessions || 0;
        if (metricTotalPoints) metricTotalPoints.textContent = stats.totalPointsAwarded || 0;

        if (failureStatusBadge) {
          const isFailing = apiStatus.simulateFailure;
          failureStatusBadge.textContent = isFailing ? 'ACTIVE (Failing)' : 'INACTIVE (Normal)';
          failureStatusBadge.className = `badge ${isFailing ? 'badge-danger' : 'badge-success'}`;
        }

        renderGlobalSessions(stats.recentGlobalSessions || []);
      }

      const usersData = await api.get('/api/admin/users');
      if (usersData.success && usersData.users) {
        renderUsers(usersData.users);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  }

  function renderUsers(users) {
    if (!adminUsersTableBody) return;
    adminUsersTableBody.innerHTML = '';

    users.forEach(u => {
      const tr = document.createElement('tr');
      const dateStr = new Date(u.createdAt).toLocaleDateString();

      tr.innerHTML = `
        <td class="font-mono text-muted">${u._id.substring(u._id.length - 6)}</td>
        <td><strong>${u.displayName}</strong></td>
        <td class="text-muted">${u.email}</td>
        <td>
          <span class="badge ${u.role === 'admin' ? 'badge-warning' : 'badge-neutral'}">${u.role.toUpperCase()}</span>
        </td>
        <td class="font-mono">${u.totalScore || 0}</td>
        <td class="font-mono">${u.totalPuzzlesSolved || 0}</td>
        <td class="font-mono text-muted">${dateStr}</td>
        <td>
          <button class="btn btn-xs btn-outline btn-toggle-role" data-user-id="${u._id}" data-current-role="${u.role}">
            ${u.role === 'admin' ? 'Demote to Player' : 'Promote to Admin'}
          </button>
        </td>
      `;
      adminUsersTableBody.appendChild(tr);
    });

    // Bind role change
    document.querySelectorAll('.btn-toggle-role').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const currentRole = btn.dataset.currentRole;
        const newRole = currentRole === 'admin' ? 'player' : 'admin';

        if (confirm(`Change this user role to ${newRole}?`)) {
          try {
            await api.patch(`/api/admin/users/${userId}/role`, { role: newRole });
            loadAdminData();
          } catch (err) {
            alert(err.message || 'Role change failed.');
          }
        }
      });
    });
  }

  function renderGlobalSessions(sessions) {
    if (!adminSessionsTableBody) return;
    adminSessionsTableBody.innerHTML = '';

    if (sessions.length === 0) {
      adminSessionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No sessions logged yet.</td></tr>';
      return;
    }

    sessions.forEach(s => {
      const tr = document.createElement('tr');
      const timeSec = (s.timeTakenMs / 1000).toFixed(2);
      const userName = s.userId ? s.userId.displayName : 'Anonymous';

      tr.innerHTML = `
        <td class="font-mono text-muted">${s._id.substring(s._id.length - 6)}</td>
        <td><strong>${userName}</strong></td>
        <td><span class="badge badge-${s.difficulty}">${s.difficulty.toUpperCase()}</span></td>
        <td class="text-center">${s.isCorrect ? '<span class="text-success">Pass</span>' : '<span class="text-danger">Fail</span>'}</td>
        <td class="font-mono">+${s.pointsAwarded} pts (${timeSec}s)</td>
        <td>
          <button class="btn btn-xs btn-danger btn-purge-score" data-session-id="${s._id}">
            <i class="fa-solid fa-trash"></i> Purge
          </button>
        </td>
      `;
      adminSessionsTableBody.appendChild(tr);
    });

    // Bind purge buttons
    document.querySelectorAll('.btn-purge-score').forEach(btn => {
      btn.addEventListener('click', async () => {
        const sessionId = btn.dataset.sessionId;
        if (confirm('Permanently purge this attempt entry from database?')) {
          try {
            await api.delete(`/api/admin/scores/${sessionId}`);
            loadAdminData();
          } catch (err) {
            alert(err.message || 'Could not purge record.');
          }
        }
      });
    });
  }

  // Toggle API failure button
  toggleFailureBtn?.addEventListener('click', async () => {
    try {
      const res = await api.post('/api/admin/toggle-failure', {});
      alert(res.message);
      loadAdminData();
    } catch (err) {
      alert('Failed to toggle failure simulator.');
    }
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await api.post('/api/auth/logout');
    window.location.replace('/login.html');
  });

  loadAdminData();
});

