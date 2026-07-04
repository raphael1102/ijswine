/* ── THEME TOGGLE ── */
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  // restore saved preference
  const saved = localStorage.getItem('ijs-theme');
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    btn.textContent = '☀️';
    btn.title = 'Switch to dark mode';
  } else {
    btn.textContent = '🌙';
    btn.title = 'Switch to light mode';
  }

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    btn.textContent = isLight ? '☀️' : '🌙';
    btn.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';
    localStorage.setItem('ijs-theme', isLight ? 'light' : 'dark');
  });
}

// Call it in DOMContentLoaded — add to your existing script.js init block,
// or this file handles it standalone:
document.addEventListener('DOMContentLoaded', setupThemeToggle);