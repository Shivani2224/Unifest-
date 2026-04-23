let studentTab = 'explore';
let currentUser = null;

async function initStudent() {
    currentUser = checkAuth();
    if (!currentUser) return;

    document.getElementById('student-name-display').textContent = currentUser.name;
    lucide.createIcons();
    renderStudentContent();
}

function switchStudentTab(tab, el) {
    studentTab = tab;
    document.querySelectorAll('.nav-links a').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    renderStudentContent();
}

async function renderStudentContent() {
    const c = document.getElementById('student-content');
    c.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        if (studentTab === 'explore') await renderExploreEvents(c);
        else await renderMyRegistrations(c);
    } catch (err) {
        toast('Failed to load content: ' + err.message, 'error');
    }

    lucide.createIcons();
}

async function renderExploreEvents(c) {
    const events = await api.events.getAll();
    const regs = await api.registrations.getAll();
    const myRegs = regs.filter(r => r.user_id === currentUser.id);
    const regEventIds = myRegs.map(r => r.event_id);

    let html = `<h2 class="page-title">Explore Events</h2>`;

    if (!events.length) {
        html += `<div class="glass empty-state">
            <i data-lucide="calendar-x" style="width:48px;height:48px;margin:0 auto 12px;opacity:.4"></i>
            <p>No events available yet</p>
        </div>`;
        c.innerHTML = html;
        return;
    }

    html += `<div class="explore-grid">`;
    events.forEach(ev => {
        const registered = regEventIds.includes(ev.id);
        html += `<div class="glass explore-card fade-up">
            <div class="explore-head">
                <h3 class="explore-title">${esc(ev.name)}</h3>
                <span class="badge explore-venue">
                    <i data-lucide="map-pin" style="width:12px;height:12px;display:inline;vertical-align:middle"></i> ${esc(ev.venue)}
                </span>
            </div>
            <p class="explore-desc">${esc(ev.description)}</p>
            ${ev.date ? `<p class="explore-meta"><i data-lucide="clock" style="width:12px;height:12px;display:inline;vertical-align:middle"></i> ${esc(ev.date)}</p>` : ''}
            ${registered
                ? `<button class="btn btn-ghost btn-block btn-xs" disabled>Already Registered</button>`
                : `<button class="btn btn-primary btn-block btn-sm" onclick="registerForEvent('${ev.id}', '${esc(ev.name)}')">Register Now</button>`}
        </div>`;
    });
    html += `</div>`;
    c.innerHTML = html;
}

async function registerForEvent(eventId, eventName) {
    try {
        await api.registrations.create({ event_id: eventId });
        toast('Registered successfully!', 'success');
        renderStudentContent();
    } catch (err) {
        toast(err.message, 'error');
    }
}

async function renderMyRegistrations(c) {
    const regs = await api.registrations.getAll();
    const myRegs = regs.filter(r => r.user_id === currentUser.id);

    let html = `<h2 class="page-title">My Registrations</h2>`;

    if (!myRegs.length) {
        html += `<div class="glass empty-state"><p>No registrations yet</p></div>`;
        c.innerHTML = html;
        return;
    }

    html += `<div class="table-wrap glass"><table><thead><tr><th>Event</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
    myRegs.forEach(r => {
        const bc = r.status === 'accepted' ? 'badge-accepted' : r.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
        html += `<tr>
            <td class="td-strong">${esc(r.event_name)}</td>
            <td><span class="badge ${bc}">${r.status}</span></td>
            <td class="td-muted">${new Date(r.created_at.replace(' ', 'T').replace(/Z?$/, 'Z')).toLocaleDateString()}</td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    c.innerHTML = html;
}

window.switchStudentTab = switchStudentTab;
window.registerForEvent = registerForEvent;
window.initStudent = initStudent;
