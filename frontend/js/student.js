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
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
    renderStudentContent();
}

async function renderStudentContent() {
    const c = document.getElementById('student-content');
    c.innerHTML = '<div class="flex items-center justify-center p-20"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>';
    
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

    let html = `<h2 class="text-xl font-bold mb-5">Explore Events</h2>`;
    
    if (!events.length) {
        html += `<div class="glass p-8 text-center" style="color:var(--text-dim)">
            <i data-lucide="calendar-x" style="width:48px;height:48px;margin:0 auto 12px;opacity:.4"></i>
            <p>No events available yet</p>
        </div>`;
        c.innerHTML = html;
        return;
    }

    html += `<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">`;
    events.forEach(ev => {
        const registered = regEventIds.includes(ev.id);
        html += `<div class="glass p-5 fade-up">
            <div class="flex items-start justify-between mb-3">
                <h3 class="font-semibold text-lg">${esc(ev.name)}</h3>
                <span class="badge" style="background:rgba(119, 136, 115, 0.8);color:#F1F3E0;white-space:nowrap">
                    <i data-lucide="map-pin" style="width:12px;height:12px;display:inline;vertical-align:middle"></i> ${esc(ev.venue)}
                </span>
            </div>
            <p class="text-sm mb-4" style="color:#F1F3E0)">${esc(ev.description)}</p>
            ${ev.date ? `<p class="text-xs mb-3" style="color:#F1F3E0"><i data-lucide="clock" style="width:12px;height:12px;display:inline;vertical-align:middle"></i> ${esc(ev.date)}</p>` : ''}
            ${registered ? `<button class="btn btn-ghost w-full text-xs" style="background-color:#F1F3E0; color:#778873;" disabled> Already Registered</button>`
            : `<button class="btn btn-primary w-full text-sm" style="background-color:#F1F3E0; color:#778873;" onclick="registerForEvent('${ev.id}', '${esc(ev.name)}')">Register Now</button>`}
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

    let html = `<h2 class="text-xl font-bold mb-5">My Registrations</h2>`;
    
    if (!myRegs.length) {
        html += `<div class="glass p-8 text-center" style="color:#F1F3E0"><p>No registrations yet</p></div>`;
        c.innerHTML = html;
        return;
    }

    html += `<div class="table-wrap glass"><table><thead style="background-color:#F1F3E0;"><tr><th style="color:#778873;">Event</th><th style="color:#778873;">Status</th><th style="color:#778873;">Date</th></tr></thead><tbody>`;
    myRegs.forEach(r => {
        const bc = r.status === 'accepted' ? 'badge-accepted' : r.status === 'rejected' ? 'badge-rejected' : 'badge-pending';
        // Note: Backend should return event_name or we can enrich it
        html += `<tr>
            <td class="font-medium" style="color:#F1F3E0;">${esc(r.event_name)}</td>
            <td><span class="badge ${bc}" style="color:#F1F3E0;">${r.status}</span></td>
            <td style="color:#F1F3E0;">${new Date(r.created_at).toLocaleDateString()}</td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    c.innerHTML = html;
}

window.switchStudentTab = switchStudentTab;
window.registerForEvent = registerForEvent;
window.initStudent = initStudent;
