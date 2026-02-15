codex/design-frontend-system-for-vaultix-hc6fqj
const API = '/api';

const storage = {
  get token() { return localStorage.getItem('vaultix_token') || ''; },
  set token(v) { localStorage.setItem('vaultix_token', v); },
  get otpToken() { return localStorage.getItem('vaultix_otp_token') || ''; },
  set otpToken(v) { localStorage.setItem('vaultix_otp_token', v); },
  get role() { return localStorage.getItem('vaultix_role') || ''; },
  set role(v) { localStorage.setItem('vaultix_role', v); }
};

const ROLE_LABEL = {
  data_owner: 'Data Owner',
  data_user: 'Data User',
  trust_authority: 'Trust Authority'
};

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(storage.token ? { Authorization: `Bearer ${storage.token}` } : {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function requireAuth() {
  if (!storage.token) {
    location.href = '/pages/login/index.html';
    return false;
  }
  return true;
}

function badgeClass(status) {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}



main
document.querySelectorAll('[data-progress]').forEach((bar) => {
  bar.style.width = `${bar.dataset.progress}%`;
});

document.querySelectorAll('[data-otp]').forEach((group) => {
  const inputs = [...group.querySelectorAll('input')];
  inputs.forEach((input, idx) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, 1);
      if (input.value && inputs[idx + 1]) inputs[idx + 1].focus();
    });
  });
});
codex/design-frontend-system-for-vaultix-hc6fqj

const loginForm = document.querySelector('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('[name=email]').value;
    const password = loginForm.querySelector('[name=password]').value;
    try {
      const resp = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      storage.otpToken = resp.token;
      storage.role = resp.role;
      alert(`Demo OTP: ${resp.demoOtp}`);
      location.href = '/pages/otp/index.html';
    } catch (err) { alert(err.message); }
  });
}

const registerForm = document.querySelector('#register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(registerForm).entries());
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      alert('Registration complete. Please login.');
      location.href = '/pages/login/index.html';
    } catch (err) { alert(err.message); }
  });
}

const otpForm = document.querySelector('#otp-form');
if (otpForm) {
  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const otp = [...otpForm.querySelectorAll('input')].map((i) => i.value).join('');
    try {
      const resp = await api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ token: storage.otpToken, otp }) });
      storage.token = resp.token;
      location.href = '/pages/dashboards/index.html';
    } catch (err) { alert(err.message); }
  });
}

const dashboardCards = document.querySelector('[data-dashboard-cards]');
if (dashboardCards && requireAuth()) {
  const role = storage.role || 'data_owner';
  document.querySelectorAll('[data-role-label]').forEach((el) => { el.textContent = ROLE_LABEL[role] || role; });

  const config = {
    data_owner: [
      ['Total Files', 'totalFiles'],
      ['Storage Used MB', 'storageUsedMb'],
      ['Requests Received', 'requestsReceived'],
      ['Approved Users', 'approvedUsers'],
    ],
    data_user: [
      ['Available Files', 'availableFiles'],
      ['Requests Made', 'requestsMade'],
      ['Approvals Received', 'approvalsReceived'],
    ],
    trust_authority: [
      ['Approval Queue', 'approvalQueue'],
      ['High Risk Flags', 'highRisk'],
      ['Audit Logs', 'auditLogs'],
    ]
  };

  api(`/dashboard/${role}`).then((d) => {
    dashboardCards.innerHTML = (config[role] || []).map(([label, key]) => (
      `<article class='card glass'><p class='subtle'>${label}</p><div class='metric'>${d[key] ?? '-'}</div></article>`
    )).join('');
  }).catch((err) => {
    dashboardCards.innerHTML = `<p class='subtle'>Unable to load dashboard: ${err.message}</p>`;
  });
}

const filesList = document.querySelector('[data-files]');
if (filesList && requireAuth()) {
  api('/files').then((files) => {
    filesList.innerHTML = files.map((f) => `<article class='card glass'><h3>${f.name}</h3><p class='subtle'>${f.category} • ${f.sizeMb}MB</p><span class='badge primary'>${f.permission}</span></article>`).join('');
  }).catch((err) => {
    filesList.innerHTML = `<p class='subtle'>${err.message}</p>`;
  });
}

const reqRows = document.querySelector('[data-request-rows]');
if (reqRows && requireAuth()) {
  const canModerate = ['data_owner', 'trust_authority'].includes(storage.role);
  const loadRequests = () => api('/access-requests').then((rows) => {
    document.querySelector('[data-pending-count]')?.replaceChildren(document.createTextNode(String(rows.filter((r) => r.status === 'pending').length)));
    reqRows.innerHTML = rows.map((r) => {
      const actions = canModerate && r.status === 'pending'
        ? `<button class='btn ghost' data-action='approved' data-id='${r.id}'>Approve</button> <button class='btn ghost' data-action='rejected' data-id='${r.id}'>Reject</button>`
        : `<span class='subtle'>No action</span>`;
      return `<tr><td>${r.requesterId}</td><td>${r.fileId}</td><td>${r.reason}</td><td><span class='badge ${badgeClass(r.status)}'>${r.status}</span></td><td>${actions}</td></tr>`;
    }).join('');
  }).catch((err) => {
    reqRows.innerHTML = `<tr><td colspan='5'>${err.message}</td></tr>`;
  });

  loadRequests();
  reqRows.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    try {
      await api(`/access-requests/${btn.dataset.id}`, { method: 'PATCH', body: JSON.stringify({ status: btn.dataset.action }) });
      await loadRequests();
    } catch (err) { alert(err.message); }
  });
}

const profileForm = document.querySelector('#profile-form');
if (profileForm && requireAuth()) {
  api('/profile').then((p) => {
    Object.keys(p).forEach((k) => {
      const field = profileForm.querySelector(`[name=${k}]`);
      if (field) field.value = p[k];
    });
    document.querySelector('[data-role-label]')?.replaceChildren(document.createTextNode(ROLE_LABEL[p.role] || p.role));
  }).catch(() => {});
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(profileForm).entries());
    try { await api('/profile', { method: 'PUT', body: JSON.stringify(payload) }); alert('Profile updated'); }
    catch (err) { alert(err.message); }
  });
}

const settingsForm = document.querySelector('#settings-form');
if (settingsForm && requireAuth()) {
  api('/settings').then((s) => {
    Object.keys(s).forEach((k) => {
      const f = settingsForm.querySelector(`[name=${k}]`);
      if (f) f.value = String(s[k]);
    });
  }).catch(() => {});
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(settingsForm).entries());
    payload.notifications = String(payload.notifications) === 'true';
    payload.otpEnabled = String(payload.otpEnabled) === 'true';
    try { await api('/settings', { method: 'PUT', body: JSON.stringify(payload) }); alert('Settings saved'); }
    catch (err) { alert(err.message); }
  });
}

const analyticsBox = document.querySelector('[data-analytics]');
if (analyticsBox && requireAuth()) {
  api('/analytics').then((a) => {
    [['storageUsage', a.storageUsage], ['accessTrends', a.accessTrends], ['approvalRates', a.approvalRates]].forEach(([k, v]) => {
      const bar = analyticsBox.querySelector(`[data-progress-key='${k}']`);
      if (bar) bar.style.width = `${v}%`;
      const txt = analyticsBox.querySelector(`[data-progress-text='${k}']`);
      if (txt) txt.textContent = `${v}%`;
    });
    const cat = analyticsBox.querySelector('[data-categories]');
    if (cat) cat.textContent = (a.categories || []).join(', ');
  }).catch(() => {});
}
main