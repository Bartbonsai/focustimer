// Gedeeld tussen index.html (instellen) en timer.html (draaien).

const FOCUS_LABELS = { startup: 'Start up', focus: 'Focus on', finish: 'Finish up', off: 'Focus off' };
const FOCUS_TYPES = ['startup', 'focus', 'finish', 'off'];
const FOCUS_STORAGE_KEY = 'focusPhases';

const FOCUS_DEFAULT_PHASES = [
  { type: 'startup', minutes: 5 },
  { type: 'focus',   minutes: 40 },
  { type: 'finish',  minutes: 5 },
  { type: 'off',     minutes: 10 }
];

const FOCUS_TEMPLATES = [
  [ {type:'startup',minutes:5}, {type:'focus',minutes:40}, {type:'finish',minutes:5}, {type:'off',minutes:10} ],
  [ {type:'startup',minutes:5}, {type:'focus',minutes:20}, {type:'off',minutes:5}, {type:'focus',minutes:20}, {type:'finish',minutes:5}, {type:'off',minutes:5} ],
  [ {type:'startup',minutes:5}, {type:'focus',minutes:60}, {type:'finish',minutes:10}, {type:'off',minutes:15} ],
  [ {type:'startup',minutes:5}, {type:'focus',minutes:30}, {type:'off',minutes:5}, {type:'focus',minutes:30}, {type:'finish',minutes:5}, {type:'off',minutes:15} ]
];

function focusFmt(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function focusTotalMinutes(list) {
  return list.reduce((sum, p) => sum + (p.minutes || 0), 0);
}

function focusEndTimeString(totalSeconds) {
  const end = new Date(Date.now() + totalSeconds * 1000);
  return String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0');
}

// localStorage werkt alleen op een echte website (bv. GitHub Pages),
// niet in Claude's ingebouwde voorvertoning — vandaar de try/catch.
function focusSavePhases(phases) {
  try {
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(phases));
    return true;
  } catch (e) {
    console.warn('localStorage niet beschikbaar in deze omgeving:', e);
    return false;
  }
}

function focusLoadPhases() {
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
