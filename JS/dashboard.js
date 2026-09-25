// dashboard.js — shared between HTML/organizer.html and HTML/guest.html
// Follows the Corporate Event Management site theme (dark navy + gold).
// Layout is bespoke (hero banner, stat strip, two-column grids) so it does
// not mirror the Stackly reference dashboard.

// ===================== AUTH GUARD =====================
const stacklyUser = JSON.parse(localStorage.getItem('stacklyUser') || 'null');
if (!stacklyUser) {
  window.location.href = 'login.html';
}
if (typeof window.DASHBOARD_ROLE !== 'undefined' && stacklyUser && stacklyUser.role !== window.DASHBOARD_ROLE) {
  window.location.href = `${stacklyUser.role}.html`;
}

// ===================== ROLE CONFIG (menu) =====================
const ROLE_CONFIG = {
  organizer: {
    label: 'Organizer',
    menu: [
      { key: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
      { key: 'events', label: 'My Events', icon: 'fa-calendar-days' },
      { key: 'schedule', label: 'Schedule', icon: 'fa-clock' },
      { key: 'attendees', label: 'Attendees', icon: 'fa-user-group' },
      { key: 'messages', label: 'Messages', icon: 'fa-envelope' }
    ]
  },
  guest: {
    label: 'Guest',
    menu: [
      { key: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
      { key: 'registrations', label: 'My Events', icon: 'fa-ticket' },
      { key: 'schedule', label: 'Schedule', icon: 'fa-calendar-days' },
      { key: 'community', label: 'Community', icon: 'fa-comments' },
      { key: 'messages', label: 'Messages', icon: 'fa-envelope' }
    ]
  }
};

const role = window.DASHBOARD_ROLE || stacklyUser?.role || 'organizer';
const config = ROLE_CONFIG[role];

// ===================== HEADER =====================
document.getElementById('dashRoleBadge').textContent = config.label;
document.getElementById('dashUserName').textContent = stacklyUser?.name || 'Guest';
document.getElementById('dashUserEmail').textContent = stacklyUser?.email || '';
document.getElementById('dashAvatarInitial').textContent = (stacklyUser?.name || 'S').charAt(0).toUpperCase();

document.getElementById('dashSidebarAvatar').textContent = (stacklyUser?.name || 'S').charAt(0).toUpperCase();
document.getElementById('dashSidebarName').textContent = stacklyUser?.name || 'Guest';
document.getElementById('dashSidebarEmail').textContent = stacklyUser?.email || '';

// ===================== SIDEBAR NAV RENDER =====================
const dashNav = document.getElementById('dashNav');
config.menu.forEach((item, i) => {
  const el = document.createElement('div');
  el.className = 'dash-nav-item' + (i === 0 ? ' active' : '');
  el.setAttribute('data-view', item.key);
  el.innerHTML = `<i class="fa-solid ${item.icon}"></i> ${item.label}`;
  el.addEventListener('click', () => switchView(item.key, item.label));
  dashNav.appendChild(el);
});

// ===================== VIEW CONTENT HELPERS =====================
function pill(status) {
  const map = { Confirmed: 'ok', Completed: 'ok', Active: 'ok', Pending: 'pending', Cancelled: 'cancel' };
  return `<span class="dash-pill ${map[status] || 'ok'}">${status}</span>`;
}
function heroBanner(badge, title, sub, actionLabel) {
  return `<div class="dash-hero">
    <div>
      <div class="dh-eyebrow"><i class="fa-solid fa-star"></i> ${badge}</div>
      <h2 class="dh-title">${title}</h2>
      <p class="dh-sub">${sub}</p>
    </div>
    <a href="404.html" class="btn-gold"><i class="fa-solid fa-calendar-plus"></i> ${actionLabel}</a>
  </div>`;
}
function statStrip(items) {
  return `<div class="dash-stat-strip">
    ${items.map(it => `<div class="dss-item"><i class="fa-solid ${it.icon}"></i><div><strong>${it.val}</strong><span>${it.lab}</span></div></div>`).join('')}
  </div>`;
}
function panel(title, inner, link) {
  return `<div class="dash-panel">
    <div class="dash-panel-head"><h3>${title}</h3>${link ? `<a href="404.html">View all</a>` : ''}</div>
    ${inner}
  </div>`;
}
function barChart(title) {
  const data = [{l:'Mon',v:40},{l:'Tue',v:55},{l:'Wed',v:30},{l:'Thu',v:70},{l:'Fri',v:85},{l:'Sat',v:90},{l:'Sun',v:25}];
  const max = Math.max(...data.map(d => d.v));
  return panel(title, `<div class="mini-bar-chart" data-chart>
    ${data.map(d => `<div class="mbc-col"><div class="mbc-bar" data-h="${Math.round((d.v / max) * 130)}" style="height:0px;"></div><span>${d.l}</span></div>`).join('')}
  </div>`);
}
function activityFeed(title, items) {
  return panel(title, items.map(it => `<div class="activity-item"><div class="activity-dot"><i class="fa-solid ${it.icon}"></i></div><div><p>${it.text}</p><span>${it.time}</span></div></div>`).join(''));
}
function quickActions(title, actions) {
  return panel(title, `<div class="quick-action-strip">
    ${actions.map(a => `<a href="404.html" class="quick-action"><i class="fa-solid ${a.icon}"></i><span>${a.label}</span></a>`).join('')}
  </div>`);
}
function tablePanel(title, headers, rows, link) {
  return panel(title, `<div class="dash-table-wrap">
    <table class="dash-table"><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
  </div>`, link);
}
function progressPanel(title, rows) {
  return panel(title, rows.map(r => `<div class="dash-progress-row"><div class="dpr-top"><span>${r.l}</span><span>${r.v}%</span></div><div class="dash-progress-bar"><div class="dash-progress-fill" data-w="${r.v}" style="width:0%;"></div></div></div>`).join(''));
}
function todoPanel(title, rows) {
  return panel(title, rows.map(r => `<div class="todo-item${r.done ? ' done' : ''}"><i class="fa-solid ${r.done ? 'fa-circle-check' : 'fa-regular fa-circle'}"></i><div><strong>${r.l}</strong><span>${r.s}</span></div></div>`).join(''));
}
function listPanel(title, items) {
  return panel(title, items.map(it => `<div class="dash-list-item"><img class="dash-list-avatar" src="${it.img}" alt=""><div><strong>${it.name}</strong><span>${it.sub}</span></div></div>`).join(''));
}

// ===================== VIEWS PER ROLE =====================
const VIEWS = {
  organizer: {
    overview: () => `
      ${heroBanner('Event Control Center', `Good evening, ${stacklyUser?.name || 'there'}`, 'Your next four weeks are booked solid. Here is what moves tonight.', 'Create Event')}
      ${statStrip([
        { icon: 'fa-calendar-check', val: '12', lab: 'Active Events' },
        { icon: 'fa-user-group', val: '1,284', lab: 'Guests This Month' },
        { icon: 'fa-star', val: '4.8', lab: 'Avg. Event Rating' },
        { icon: 'fa-sack-dollar', val: '$18.6k', lab: 'This Month' }
      ])}
      <div class="dash-grid-2">
        ${tablePanel('Tonight\'s Line-Up', ['Event', 'Venue', 'Date', 'Status'], [
          ['The Midnight Gala', 'Rosewood Ballroom', 'Mar 12 · 7:00 PM', pill('Confirmed')],
          ['The Founder\'s Summit', 'Grand Hall', 'Apr 02 · 9:00 AM', pill('Pending')],
          ['The Orchid Reception', 'Skyline Pavilion', 'Apr 19 · 6:00 PM', pill('Confirmed')]
        ], true)}
        ${activityFeed('Recent Activity', [
          { icon: 'fa-circle-check', text: '"The Midnight Gala" moved to production', time: '2 hours ago' },
          { icon: 'fa-user-plus', text: '48 new guest registrations', time: 'Today' },
          { icon: 'fa-file-lines', text: 'Catering contract signed for Summit', time: '2 days ago' }
        ])}
      </div>
      ${quickActions('Quick Actions', [
        { icon: 'fa-calendar-plus', label: 'Create Event' },
        { icon: 'fa-bullhorn', label: 'Send Invites' },
        { icon: 'fa-user-plus', label: 'Add Attendee' },
        { icon: 'fa-file-invoice', label: 'New Invoice' }
      ])}`,
    events: () => `
      ${statStrip([
        { icon: 'fa-calendar-check', val: '12', lab: 'Active Events' },
        { icon: 'fa-circle-check', val: '64', lab: 'Events Completed' },
        { icon: 'fa-layer-group', val: '5', lab: 'In Planning' },
        { icon: 'fa-clock', val: '3', lab: 'Pending Reviews' }
      ])}
      <div class="dash-grid-2">
        ${progressPanel('Event Readiness', [
          { l: 'The Midnight Gala — Production', v: 82 },
          { l: 'The Founder\'s Summit — Logistics', v: 45 },
          { l: 'The Orchid Reception — Décor', v: 20 }
        ])}
        ${todoPanel('Backstage Checklist', [
          { l: 'Confirm florist for the Gala', s: 'Due Friday · The Midnight Gala', done: false },
          { l: 'Seating chart final sign-off', s: 'Due Monday · Orchid Reception', done: true },
          { l: 'Keynote run-through booked', s: 'Tuesday · Founder\'s Summit', done: false }
        ])}
      </div>
      ${tablePanel('All Events', ['Event', 'Client', 'Date', 'Status'], [
        ['The Midnight Gala', 'Meridian Hotels', 'Mar 12', pill('Active')],
        ['The Founder\'s Summit', 'Northwire', 'Apr 02', pill('Active')],
        ['The Orchid Reception', 'Aurum Labs', 'Apr 19', pill('Pending')]
      ], false)}
      ${quickActions('Event Actions', [
        { icon: 'fa-calendar-plus', label: 'Create Event' },
        { icon: 'fa-list-check', label: 'Checklist' },
        { icon: 'fa-users-line', label: 'Manage Crew' },
        { icon: 'fa-chart-simple', label: 'Event Reports' }
      ])}`,
    schedule: () => `
      ${statStrip([
        { icon: 'fa-calendar-check', val: '12', lab: 'Upcoming Events' },
        { icon: 'fa-circle-check', val: '64', lab: 'Completed' },
        { icon: 'fa-clock', val: '2', lab: 'Pending Confirmation' },
        { icon: 'fa-ban', val: '3', lab: 'Cancelled' }
      ])}
      ${tablePanel('All Sessions', ['Event', 'Venue', 'Date', 'Type', 'Status'], [
        ['The Midnight Gala', 'Rosewood Ballroom', 'Mar 12 · 7:00 PM', 'Gala', pill('Confirmed')],
        ['The Founder\'s Summit', 'Grand Hall', 'Apr 02 · 9:00 AM', 'Summit', pill('Pending')],
        ['The Orchid Reception', 'Skyline Pavilion', 'Apr 19 · 6:00 PM', 'Reception', pill('Confirmed')]
      ], false)}
      ${barChart('This Week\'s Bookings')}
      ${quickActions('Schedule Actions', [
        { icon: 'fa-calendar-plus', label: 'Book Venue' },
        { icon: 'fa-arrows-rotate', label: 'Reschedule' },
        { icon: 'fa-bell', label: 'Set Reminders' },
        { icon: 'fa-ban', label: 'Cancel Event' }
      ])}`,
    attendees: () => `
      ${statStrip([
        { icon: 'fa-user-group', val: '1,284', lab: 'Active Attendees' },
        { icon: 'fa-user-plus', val: '+38', lab: 'New This Month' },
        { icon: 'fa-armchair', val: '82%', lab: 'Seats Filled' },
        { icon: 'fa-face-smile', val: '96%', lab: 'Retention Rate' }
      ])}
      <div class="dash-grid-2">
        ${tablePanel('Registered Guests', ['Name', 'Event', 'Ticket', 'Status'], [
          ['Ananya Rao', 'The Midnight Gala', 'VIP', pill('Active')],
          ['Leo Fischer', 'The Founder\'s Summit', 'Standard', pill('Active')],
          ['Priya Nair', 'The Orchid Reception', 'VIP', pill('Pending')]
        ], false)}
        ${listPanel('Recently Joined', [
          { img: '../images/woman-headshot-black-blazer.webp', name: 'Priya Nair', sub: 'The Orchid Reception · VIP' },
          { img: '../images/man-headshot-gray-suit.webp', name: 'David Kim', sub: 'The Founder\'s Summit · Standard' }
        ])}
      </div>
      ${quickActions('Attendee Management', [
        { icon: 'fa-user-plus', label: 'Add Attendee' },
        { icon: 'fa-file-export', label: 'Export Guest List' },
        { icon: 'fa-message', label: 'Message All' },
        { icon: 'fa-chart-simple', label: 'Attendance Insights' }
      ])}`,
    messages: () => `
      ${statStrip([
        { icon: 'fa-envelope', val: '6', lab: 'Unread' },
        { icon: 'fa-comments', val: '24', lab: 'Conversations' },
        { icon: 'fa-user-group', val: '1,284', lab: 'Active Attendees' },
        { icon: 'fa-clock', val: '<4h', lab: 'Avg. Reply Time' }
      ])}
      <div class="dash-grid-2">
        ${listPanel('Recent Messages', [
          { img: '../images/man-headshot-navy-suit.webp', name: 'Meridian Hotels', sub: '"The Midnight Gala floor plan confirmed"' },
          { img: '../images/woman-headshot-white-blazer.webp', name: 'Aurum Labs', sub: '"Can we add 40 seats for the launch?"' },
          { img: '../images/man-headshot-dark-background.webp', name: 'Northwire', sub: '"Summit keynote slides attached"' }
        ])}
        ${quickActions('Conversation Tools', [
          { icon: 'fa-pen', label: 'New Message' },
          { icon: 'fa-bullhorn', label: 'Message Attendees' },
          { icon: 'fa-bell-slash', label: 'Notification Settings' },
          { icon: 'fa-inbox', label: 'Archived' }
        ])}
      </div>`
  },

  guest: {
    overview: () => `
      ${heroBanner('Guest Lounge', `Good evening, ${stacklyUser?.name || 'there'}`, 'Your seats are ready. Two premieres still accepting RSVPs this season.', 'Browse Events')}
      ${statStrip([
        { icon: 'fa-calendar-days', val: '3', lab: 'Upcoming Events' },
        { icon: 'fa-ticket', val: '14', lab: 'Events Attended' },
        { icon: 'fa-star', val: '2,150', lab: 'Reward Points' },
        { icon: 'fa-clock', val: '63h', lab: 'On The Floor' }
      ])}
      <div class="dash-grid-2">
        ${tablePanel('Your Upcoming Events', ['Event', 'Venue', 'Date', 'Status'], [
          ['The Midnight Gala', 'Rosewood Ballroom', 'Mar 12 · 7:00 PM', pill('Confirmed')],
          ['The Founder\'s Summit', 'Grand Hall', 'Apr 02 · 9:00 AM', pill('Pending')],
          ['The Orchid Reception', 'Skyline Pavilion', 'Apr 19 · 6:00 PM', pill('Confirmed')]
        ], true)}
        ${activityFeed('Recent Activity', [
          { icon: 'fa-ticket', text: 'Confirmed RSVP for "The Midnight Gala"', time: '2 hours ago' },
          { icon: 'fa-star', text: 'Earned 320 reward points this week', time: 'Today' },
          { icon: 'fa-comments', text: 'Joined the Hospitality Circle', time: '2 days ago' }
        ])}
      </div>
      ${quickActions('Quick Actions', [
        { icon: 'fa-ticket', label: 'Browse Events' },
        { icon: 'fa-calendar-check', label: 'RSVP Now' },
        { icon: 'fa-camera', label: 'Photo Gallery' },
        { icon: 'fa-message', label: 'Message Organizer' }
      ])}`,
    registrations: () => `
      ${statStrip([
        { icon: 'fa-ticket', val: '3', lab: 'Active Registrations' },
        { icon: 'fa-circle-check', val: '14', lab: 'Events Attended' },
        { icon: 'fa-gem', val: 'Gold', lab: 'Member Tier' },
        { icon: 'fa-clock', val: '63h', lab: 'On The Floor' }
      ])}
      <div class="dash-grid-2">
        ${progressPanel('Rewards Progress', [
          { l: 'Platinum Tier', v: 72 },
          { l: 'Early Bird Badge', v: 40 },
          { l: '10 Events Milestone', v: 85 }
        ])}
        ${todoPanel('My To-Dos', [
          { l: 'Confirm arrival for the Gala', s: 'Mar 12 · The Midnight Gala', done: false },
          { l: 'Submit dietary note', s: 'Apr 02 · Founder\'s Summit', done: true },
          { l: 'Pick dress code option', s: 'Apr 19 · Orchid Reception', done: false }
        ])}
      </div>
      ${tablePanel('My Events', ['Event', 'Venue', 'Date', 'Status'], [
        ['The Midnight Gala', 'Rosewood Ballroom', 'Mar 12', pill('Confirmed')],
        ['The Founder\'s Summit', 'Grand Hall', 'Apr 02', pill('Pending')],
        ['The Orchid Reception', 'Skyline Pavilion', 'Apr 19', pill('Confirmed')]
      ], false)}
      ${quickActions('Registration Actions', [
        { icon: 'fa-ticket', label: 'Find Events' },
        { icon: 'fa-calendar-plus', label: 'Add to Calendar' },
        { icon: 'fa-id-badge', label: 'My Digital Pass' },
        { icon: 'fa-award', label: 'My Rewards' }
      ])}`,
    schedule: () => `
      ${statStrip([
        { icon: 'fa-calendar-check', val: '3', lab: 'Upcoming' },
        { icon: 'fa-circle-check', val: '14', lab: 'Attended' },
        { icon: 'fa-clock', val: '1', lab: 'Pending RSVP' },
        { icon: 'fa-ban', val: '1', lab: 'Cancelled' }
      ])}
      ${tablePanel('All Events', ['Event', 'Venue', 'Date', 'Type', 'Status'], [
        ['The Midnight Gala', 'Rosewood Ballroom', 'Mar 12 · 7:00 PM', 'Gala', pill('Confirmed')],
        ['The Founder\'s Summit', 'Grand Hall', 'Apr 02 · 9:00 AM', 'Summit', pill('Pending')],
        ['Summer Rooftop Mixer', 'Skyline Rooftop', 'Jun 18 · 6:00 PM', 'Networking', pill('Confirmed')]
      ], false)}
      ${barChart('This Week\'s Activity')}
      ${quickActions('Schedule Actions', [
        { icon: 'fa-calendar-plus', label: 'Browse More' },
        { icon: 'fa-calendar-check', label: 'RSVP Now' },
        { icon: 'fa-bell', label: 'Reminder Settings' },
        { icon: 'fa-ban', label: 'Cancel Booking' }
      ])}`,
    community: () => `
      ${statStrip([
        { icon: 'fa-fire', val: '12', lab: 'Day Streak' },
        { icon: 'fa-ranking-star', val: '#3', lab: 'Community Rank' },
        { icon: 'fa-user-group', val: '4', lab: 'Circles Joined' },
        { icon: 'fa-comments', val: '26', lab: 'Posts This Month' }
      ])}
      <div class="dash-grid-2">
        ${tablePanel('Community Leaders', ['Rank', 'Member', 'Events'], [
          ['1', 'Ananya', '24'],
          ['2', 'Marco', '19'],
          ['3', 'You', '14']
        ], false)}
        ${listPanel('Your Circles', [
          { img: '../images/event-crew-team-celebration.webp', name: 'Hospitality Circle', sub: 'Weekly · 45 min' },
          { img: '../images/evening-rooftop-party.webp', name: 'Networking Rooftop Crew', sub: 'Monthly · 2 hours' }
        ])}
      </div>
      ${quickActions('Community Actions', [
        { icon: 'fa-users', label: 'Browse Circles' },
        { icon: 'fa-calendar', label: 'Community Events' },
        { icon: 'fa-ranking-star', label: 'View Leaderboard' },
        { icon: 'fa-user-plus', label: 'Find a Plus-One' }
      ])}`,
    messages: () => `
      ${statStrip([
        { icon: 'fa-envelope', val: '4', lab: 'Unread' },
        { icon: 'fa-comments', val: '9', lab: 'Conversations' },
        { icon: 'fa-calendar-days', val: '3', lab: 'Upcoming Events' },
        { icon: 'fa-clock', val: '<6h', lab: 'Avg. Reply Time' }
      ])}
      <div class="dash-grid-2">
        ${listPanel('Recent Messages', [
          { img: '../images/man-headshot-dark-background.webp', name: 'Stackly Events Desk', sub: '"Your Midnight Gala pass is ready"' },
          { img: '../images/woman-headshot-white-blazer.webp', name: 'Aurum Events', sub: '"See you at the rooftop mixer?"' },
          { img: '../images/man-headshot-navy-suit.webp', name: 'Northwire', sub: '"Summit dinner menu preview"' }
        ])}
        ${quickActions('Message Tools', [
          { icon: 'fa-pen', label: 'New Message' },
          { icon: 'fa-bullhorn', label: 'Message Organizer' },
          { icon: 'fa-bell-slash', label: 'Notification Settings' },
          { icon: 'fa-inbox', label: 'Archived' }
        ])}
      </div>`
  }
};

// ===================== ANIMATE BARS/PROGRESS ON RENDER =====================
function animateDashVisuals() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.mbc-bar[data-h]').forEach(bar => {
      bar.style.height = bar.getAttribute('data-h') + 'px';
    });
    document.querySelectorAll('.dash-progress-fill[data-w]').forEach(fill => {
      fill.style.width = fill.getAttribute('data-w') + '%';
    });
  });
}

// ===================== VIEW SWITCH =====================
function switchView(key, label) {
  document.querySelectorAll('.dash-nav-item').forEach(item => item.classList.toggle('active', item.getAttribute('data-view') === key));
  document.getElementById('dashViewTitle').textContent = label;

  const isOverview = key === 'overview';
  const welcomeEl = document.getElementById('dashWelcomeMsg');
  if (welcomeEl) {
    welcomeEl.style.display = isOverview ? 'block' : 'none';
    welcomeEl.textContent = isOverview ? `Welcome back, ${stacklyUser?.name || 'there'}` : '';
  }

  const renderer = VIEWS[role][key];
  const body = document.getElementById('dashBody');
  body.innerHTML = renderer ? renderer() : '<p>No content available.</p>';
  body.scrollTop = 0;
  window.scrollTo(0, 0);
  animateDashVisuals();

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-nav');
      const targetItem = document.querySelector(`.dash-nav-item[data-view="${target}"]`);
      if (targetItem) targetItem.click();
    });
  });

  if (window.innerWidth <= 900) {
    document.getElementById('dashSidebar').classList.remove('open');
    document.getElementById('dashOverlay').classList.remove('show');
  }
}
switchView(config.menu[0].key, config.menu[0].label);

// ===================== MOBILE SIDEBAR TOGGLE =====================
document.getElementById('dashMenuToggle')?.addEventListener('click', () => {
  document.getElementById('dashSidebar').classList.add('open');
  document.getElementById('dashOverlay').classList.add('show');
});
document.getElementById('dashOverlay')?.addEventListener('click', () => {
  document.getElementById('dashSidebar').classList.remove('open');
  document.getElementById('dashOverlay').classList.remove('show');
});
document.getElementById('dashSidebarClose')?.addEventListener('click', () => {
  document.getElementById('dashSidebar').classList.remove('open');
  document.getElementById('dashOverlay').classList.remove('show');
});

// ===================== LOGOUT =====================
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('stacklyUser');
  window.location.href = 'login.html';
});

// ===================== HEADER SEARCH =====================
document.getElementById('dashSearchInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const input = e.target;
    const val = input.value.trim();

    if (!val) {
      const wrap = document.getElementById('dashHeaderSearch');
      wrap.classList.add('search-error');
      input.placeholder = 'Please type something to search';
      setTimeout(() => wrap.classList.remove('search-error'), 600);
      showToast('Type something to search first', 'circle-exclamation');
      return;
    }

    window.location.href = '404.html';
  }
});