import { auth } from './firebase.js';
import { onAuthStateChanged, signOut } from
  'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

// Pages to show in global nav (dashboard omitted — logo links to dashboard)
const NAV_ITEMS = [
  { href: 'skills.html', label: 'Skills' },
  { href: 'queries.html', label: 'Queries' },
  { href: 'mocktests.html', label: 'Mock Tests' },
  { href: 'profile.html', label: 'Profile' }
];

function createLink(href, label) {
  const a = document.createElement('a');
  a.href = href;
  a.className =
    'text-sm text-indigo-600 px-3 py-2 rounded hover:bg-indigo-50 hover:text-indigo-700 transition';
  a.innerText = label;
  return a;
}

function createButton(label, onClick) {
  const b = document.createElement('button');
  b.className =
    'text-sm px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition';
  b.innerText = label;
  b.addEventListener('click', onClick);
  return b;
}

function buildNav() {
  // 🚫 DO NOT SHOW NAV ON LOGIN PAGE
  const current =
    (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  if (current === 'login.html') return;

  const container = document.getElementById('navLinks');
  if (!container) return;

  container.innerHTML = '';

  NAV_ITEMS.forEach(item => {
    const filename = item.href.split('/').pop().toLowerCase();
    if (filename === current) return; // skip current page
    container.appendChild(createLink(item.href, item.label));
  });

  // Auth-specific area
  const authArea = document.createElement('div');
  authArea.className = 'flex items-center gap-2';

  onAuthStateChanged(auth, (user) => {
    authArea.innerHTML = '';

    if (user) {
      const prof = createLink(
        'profile.html',
        user.displayName ? `Hi, ${user.displayName}` : 'Profile'
      );
      authArea.appendChild(prof);

      const out = createButton('Logout', async () => {
        await signOut(auth);
        window.location.href = 'login.html';
      });
      authArea.appendChild(out);
    } else {
      authArea.appendChild(createLink('login.html', 'Login'));
    }
  });

  container.appendChild(authArea);
}

// Run after DOM ready
window.addEventListener('DOMContentLoaded', buildNav);

export { buildNav };
