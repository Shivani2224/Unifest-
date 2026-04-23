let adminTab = 'stats';
let currentUser = null;

async function initAdmin() {
    currentUser = checkAuth();
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('admin-name-display').textContent = currentUser.name;
    lucide.createIcons();
    renderAdminContent();
}

function switchAdminTab(tab, el) {
    adminTab = tab;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    renderAdminContent();
}

async function renderAdminContent() {
    const c = document.getElementById('admin-content');
    c.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        if (adminTab === 'stats') await renderAdminStats(c);
        else if (adminTab === 'create') renderCreateEvent(c);
        else if (adminTab === 'events') await renderAdminEvents(c);
        else await renderAdminRegs(c);
    } catch (err) {
        toast('Error: ' + err.message, 'error');
    }

    lucide.createIcons();
}

async function renderAdminStats(c) {
    const events = await api.events.getAll();
    const regs = await api.registrations.getAll();

    const pending = regs.filter(r => r.status === 'pending').length;
    const accepted = regs.filter(r => r.status === 'accepted').length;

    c.innerHTML = `
    <h2 class="page-title">Overview</h2>
    <div class="stats-grid">
        <div class="glass stat-card fade-up"><div class="num">${events.length}</div><div class="lbl">Total Events</div></div>
        <div class="glass stat-card fade-up"><div class="num">${regs.length}</div><div class="lbl">Registrations</div></div>
        <div class="glass stat-card fade-up"><div class="num">${pending}</div><div class="lbl">Pending</div></div>
        <div class="glass stat-card fade-up"><div class="num">${accepted}</div><div class="lbl">Accepted</div></div>
    </div>
    <div class="glass panel">
        <h3 class="panel-title">Recent Registrations</h3>
        ${regs.length ? `
        <div class="table-wrap">
            <table>
                <thead><tr><th>Student</th><th>Event</th><th>Status</th></tr></thead>
                <tbody>
                    ${regs.slice(-5).reverse().map(r => {
                        const bc = r.status === 'accepted' ? 'badge-accepted' : r.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
                        return `<tr><td>${esc(r.user_name)}</td><td>${esc(r.event_name)}</td><td><span class="badge ${bc}">${r.status}</span></td></tr>`
                    }).join('')}
                </tbody>
            </table>
        </div>` : `<p class="text-muted">No registrations yet</p>`}
    </div>`;
}

function renderCreateEvent(c) {
    c.innerHTML = `
    <h2 class="page-title">Create Event</h2>
    <div class="glass panel auth-card fade-up">
        <form onsubmit="handleCreateEvent(event)">
            <div class="field"><label>Event Name</label><input type="text" id="ev-name" placeholder="Annual Tech Fest" required></div>
            <div class="field"><label>Description</label><textarea id="ev-desc" placeholder="Brief description..." required></textarea></div>
            <div class="form-row">
                <div><label>Venue</label><input type="text" id="ev-venue" placeholder="Main Auditorium" required></div>
                <div><label>Date</label><input type="date" id="ev-date" required></div>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="createEvBtn">Create Event</button>
        </form>
    </div>`;
}

async function handleCreateEvent(e) {
    e.preventDefault();
    const btn = document.getElementById('createEvBtn');

    const eventData = {
        name: document.getElementById('ev-name').value.trim(),
        description: document.getElementById('ev-desc').value.trim(),
        venue: document.getElementById('ev-venue').value.trim(),
        date: document.getElementById('ev-date').value
    };

    btn.disabled = true;
    btn.textContent = 'Creating...';

    try {
        await api.events.create(eventData);
        toast('Event created!', 'success');
        e.target.reset();
    } catch (err) {
        toast('Failed to create event: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Create Event';
    }
}

async function renderAdminEvents(c) {
    const events = await api.events.getAll();
    let html = `<h2 class="page-title">All Events</h2>`;

    if (!events.length) {
        html += `<div class="glass empty-state">No events yet</div>`;
        c.innerHTML = html;
        return;
    }

    html += `<div class="event-list">`;
    events.forEach(ev => {
        html += `<div class="glass event-row fade-up">
            <div class="event-row-main">
                <h3 class="event-row-title">${esc(ev.name)}</h3>
                <p class="event-row-meta">${esc(ev.venue)} • ${esc(ev.date)}</p>
            </div>
            <button class="btn btn-danger btn-xs" onclick="deleteEvent('${ev.id}')">
                <i data-lucide="trash-2" style="width:14px;height:14px"></i>
            </button>
        </div>`;
    });
    html += `</div>`;
    c.innerHTML = html;
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        await api.events.delete(id);
        toast('Event deleted', 'success');
        renderAdminContent();
    } catch (err) {
        toast('Failed to delete: ' + err.message, 'error');
    }
}

async function renderAdminRegs(c) {
    const regs = await api.registrations.getAll();
    let html = `<h2 class="page-title">All Registrations</h2>`;

    if (!regs.length) {
        html += `<div class="glass empty-state">No registrations yet</div>`;
        c.innerHTML = html;
        return;
    }

    html += `<div class="table-wrap glass">
        <table>
            <thead><tr><th>Student</th><th>Email</th><th>Event</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>`;

    regs.forEach(r => {
        const bc = r.status === 'accepted' ? 'badge-accepted' : r.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
        html += `<tr>
            <td class="td-strong">${esc(r.user_name)}</td>
            <td class="td-muted">${esc(r.user_email)}</td>
            <td>${esc(r.event_name)}</td>
            <td><span class="badge ${bc}">${r.status}</span></td>
            <td>
                ${r.status === 'pending' ? `
                <div class="action-cell">
                    <button class="btn btn-success btn-xs" onclick="updateRegStatus('${r.id}', 'accepted')">Accept</button>
                    <button class="btn btn-danger btn-xs" onclick="updateRegStatus('${r.id}', 'rejected')">Reject</button>
                </div>
                ` : `<span class="action-taken">Action Taken</span>`}
            </td>
        </tr>`;
    });

    html += `</tbody></table></div>`;
    c.innerHTML = html;
}

async function updateRegStatus(id, status) {
    try {
        await api.registrations.updateStatus(id, status);
        toast(`Registration ${status}`, 'success');
        renderAdminContent();
    } catch (err) {
        toast('Update failed: ' + err.message, 'error');
    }
}

window.initAdmin = initAdmin;
window.switchAdminTab = switchAdminTab;
window.handleCreateEvent = handleCreateEvent;
window.deleteEvent = deleteEvent;
window.updateRegStatus = updateRegStatus;
