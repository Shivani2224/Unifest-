function toast(msg, type = 'info') {
    const c = document.getElementById('toasts');
    if (!c) {
        const container = document.createElement('div');
        container.id = 'toasts';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function esc(s) {
    return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;') : '';
}

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

window.toast = toast;
window.esc = esc;
window.checkAuth = checkAuth;
window.logout = logout;
