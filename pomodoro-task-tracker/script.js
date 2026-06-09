// ─── CONSTANTS ──────────────────────────────────────────────────────────────
const CIRCUMFERENCE = 2 * Math.PI * 88; // ~552.92

const MODES = {
  focus: { label: 'Focus Time',  settingKey: 'focusDuration',      default: 25 },
  short: { label: 'Short Break', settingKey: 'shortBreakDuration',  default: 5  },
  long:  { label: 'Long Break',  settingKey: 'longBreakDuration',   default: 15 },
};

// ─── AUDIO FILE SOUNDS ───────────────────────────────────────────────────────
function playAudioFile(filename) {
  if (!settings.soundEnabled) return;
  try {
    const audio = document.getElementById(filename);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Audio play failed:', err));
    }
  } catch (err) {
    console.log('Audio error:', err);
  }
}

function playTimerFinishSound() {
  playAudioFile('timerFinishSound');
}

function playButtonClickSound() {
  playAudioFile('buttonClickSound');
}
// ─── LOAD PERSISTED STATE ────────────────────────────────────────────────────
let settings = {
  focusDuration:      25,
  shortBreakDuration: 5,
  longBreakDuration:  15,
  sessionsBeforeLong: 4,
  autoStartBreaks:    false,
  autoStartFocus:     false,
  soundEnabled:       true,
  notificationsEnabled: false,
  ...JSON.parse(localStorage.getItem('ptt_settings') || '{}'),
};

let tasks      = JSON.parse(localStorage.getItem('ptt_tasks')  || '[]');
let stats      = loadStats();
let theme      = localStorage.getItem('ptt_theme') || 'dark';

// ─── RUNTIME STATE ───────────────────────────────────────────────────────────
let mode         = 'focus';
let timeLeft     = settings.focusDuration * 60;
let totalTime    = settings.focusDuration * 60;
let running      = false;
let timerInterval = null;
let sessionNum   = 1;
let activeTaskId = null;
let filter       = 'all';

// ─── DOM REFS ─────────────────────────────────────────────────────────────────
const timerDisplay        = document.getElementById('timerDisplay');
const timerLabel          = document.getElementById('timerLabel');
const timerRing           = document.getElementById('timerRing');
const startBtn            = document.getElementById('startBtn');
const resetBtn            = document.getElementById('resetBtn');
const skipBtn             = document.getElementById('skipBtn');
const sessionDotsEl       = document.getElementById('sessionDots');
const sessionCountEl      = document.getElementById('sessionCount');
const sessionTotalEl      = document.getElementById('sessionTotal');
const currentTaskIndicator = document.getElementById('currentTaskIndicator');
const currentTaskName     = document.getElementById('currentTaskName');
const modeTabs            = document.querySelectorAll('.mode-tab');

const taskInput           = document.getElementById('taskInput');
const addTaskBtn          = document.getElementById('addTaskBtn');
const taskList            = document.getElementById('taskList');
const taskCounter         = document.getElementById('taskCounter');
const taskActionsEl       = document.getElementById('taskActions');
const clearDoneBtn        = document.getElementById('clearDoneBtn');
const filterBtns          = document.querySelectorAll('.filter-btn');
const prioritySelect      = document.getElementById('prioritySelect');

const themeToggle         = document.getElementById('themeToggle');
const statsToggle         = document.getElementById('statsToggle');
const statsSection        = document.getElementById('statsSection');
const settingsToggle      = document.getElementById('settingsToggle');
const settingsPanel       = document.getElementById('settingsPanel');
const settingsOverlay     = document.getElementById('settingsOverlay');
const settingsClose       = document.getElementById('settingsClose');
const saveSettingsBtn     = document.getElementById('saveSettingsBtn');
const resetStatsBtn       = document.getElementById('resetStatsBtn');
const clearAllTasksBtn    = document.getElementById('clearAllTasksBtn');

const statFocusTime       = document.getElementById('statFocusTime');
const statSessions        = document.getElementById('statSessions');
const statStreak          = document.getElementById('statStreak');
const statTasksDone       = document.getElementById('statTasksDone');

// Settings inputs
const sFocusDuration      = document.getElementById('sFocusDuration');
const sShortBreak         = document.getElementById('sShortBreak');
const sLongBreak          = document.getElementById('sLongBreak');
const sSessionsBeforeLong = document.getElementById('sSessionsBeforeLong');
const sAutoBreaks         = document.getElementById('sAutoBreaks');
const sAutoFocus          = document.getElementById('sAutoFocus');
const sSound              = document.getElementById('sSound');
const sNotifications      = document.getElementById('sNotifications');

// ─── TIMER ───────────────────────────────────────────────────────────────────
function setMode(newMode) {
  mode = newMode;
  totalTime = settings[MODES[mode].settingKey] * 60;
  timeLeft  = totalTime;
  running   = false;
  clearInterval(timerInterval);
  timerInterval = null;
  renderTimerDisplay();
  renderRing();
  renderStartBtn();
  renderModeUI();
}

function startTimer() {
  if (running) return;
  running = true;
  renderStartBtn();
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  running = false;
  clearInterval(timerInterval);
  timerInterval = null;
  renderStartBtn();
}

function resetTimer() {
  pauseTimer();
  timeLeft = totalTime;
  renderTimerDisplay();
  renderRing();
  document.title = 'Focus Flow — Pomodoro Tracker';
}

function skipTimer() {
  pauseTimer();
  timeLeft = 0;
  onTimerComplete(true);
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    renderTimerDisplay();
    renderRing();
    document.title = `${formatTime(timeLeft)} — ${MODES[mode].label}`;
    if (timeLeft === 60 && mode === 'focus') playSound('tick');
  } else {
    onTimerComplete(false);
  }
}

function onTimerComplete(skipped) {
  pauseTimer();
  document.title = 'Focus Flow — Pomodoro Tracker';

  if (mode === 'focus' && !skipped) {
    sessionNum++;
    stats.sessions++;
    stats.focusMinutes += settings.focusDuration;
    saveStats();
    renderStatsDisplay();
    playTimerFinishSound();
    sendNotification('Focus session complete!', 'Time for a break. Well done!');

    if (sessionNum > settings.sessionsBeforeLong) {
      sessionNum = 1;
      setMode('long');
    } else {
      setMode('short');
    }
    renderSessionDots();
    if (settings.autoStartBreaks) setTimeout(startTimer, 600);

  } else if ((mode === 'short' || mode === 'long') && !skipped) {
    playTimerFinishSound();
    sendNotification('Break over!', "Ready to focus again?");
    setMode('focus');
    if (settings.autoStartFocus) setTimeout(startTimer, 600);

  } else {
    // Skipped — just advance mode
    if (mode === 'focus') {
      sessionNum++;
      if (sessionNum > settings.sessionsBeforeLong) {
        sessionNum = 1;
        setMode('long');
      } else {
        setMode('short');
      }
      renderSessionDots();
    } else {
      setMode('focus');
    }
  }
}

// ─── TIMER RENDERING ─────────────────────────────────────────────────────────
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function renderTimerDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
}

function renderRing() {
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  timerRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const colors = { focus: 'var(--focus-c)', short: 'var(--short-c)', long: 'var(--long-c)' };
  timerRing.style.stroke = colors[mode];
}

function renderStartBtn() {
  startBtn.querySelector('.play-icon').classList.toggle('hidden', running);
  startBtn.querySelector('.pause-icon').classList.toggle('hidden', !running);
}

function renderModeUI() {
  timerLabel.textContent = MODES[mode].label;
  modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
}

function renderSessionDots() {
  const total = settings.sessionsBeforeLong;
  sessionTotalEl.textContent = total;
  sessionCountEl.textContent = Math.min(sessionNum, total);

  sessionDotsEl.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    if (i < sessionNum - 1) dot.classList.add('done');
    else if (i === sessionNum - 1) dot.classList.add('active');
    sessionDotsEl.appendChild(dot);
  }
}

// ─── SOUND (Web Audio API) ───────────────────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playSound(type) {
  if (!settings.soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    const patterns = {
      complete: [[880, 0, 0.15], [1100, 0.2, 0.15], [1320, 0.4, 0.3]],
      break:    [[660, 0, 0.15], [880, 0.2, 0.3]],
      tick:     [[440, 0, 0.08]],
    };
    (patterns[type] || []).forEach(([freq, delay, dur]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  } catch { /* audio not available */ }
}

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
function sendNotification(title, body) {
  if (!settings.notificationsEnabled) return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

// ─── TASKS ───────────────────────────────────────────────────────────────────
function saveTasks() {
  localStorage.setItem('ptt_tasks', JSON.stringify(tasks));
}

function addTask(text, priority) {
  if (!text.trim()) return;
  tasks.unshift({ id: Date.now(), text: text.trim(), priority, completed: false, createdAt: Date.now() });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  if (task.completed) {
    if (activeTaskId === id) setActiveTask(null);
    stats.tasksDone++;
    saveStats();
    renderStatsDisplay();
  }
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  if (activeTaskId === id) setActiveTask(null);
  saveTasks();
  renderTasks();
}

function setActiveTask(id) {
  activeTaskId = (activeTaskId === id) ? null : id;
  renderCurrentTaskIndicator();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  renderTasks();
  showToast('Completed tasks cleared');
}

function getFilteredTasks() {
  if (filter === 'active') return tasks.filter(t => !t.completed);
  if (filter === 'done')   return tasks.filter(t => t.completed);
  return tasks;
}

function renderTasks() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = '';

  // Task counter
  const done  = tasks.filter(t => t.completed).length;
  taskCounter.textContent = `${done} / ${tasks.length} completed`;

  // Show/hide clear done button
  taskActionsEl.style.display = tasks.some(t => t.completed) ? 'flex' : 'none';

  if (filtered.length === 0) {
    const li = document.createElement('li');
    li.className = 'task-empty';
    li.textContent = filter === 'done' ? 'No completed tasks yet.' : 'No tasks. Add one above!';
    taskList.appendChild(li);
    return;
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}${activeTaskId === task.id ? ' active-task' : ''}`;

    // Priority dot
    const dot = document.createElement('span');
    dot.className = `priority-dot priority-${task.priority}`;
    dot.title = task.priority !== 'none' ? `${task.priority} priority` : '';

    // Checkbox
    const check = document.createElement('button');
    check.className = `task-check${task.completed ? ' checked' : ''}`;
    if (task.completed) {
      check.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    }
    check.addEventListener('click', () => toggleTask(task.id));

    // Text
    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;
    if (!task.completed) {
      text.addEventListener('click', () => setActiveTask(task.id));
      text.title = activeTaskId === task.id ? 'Click to unset focus' : 'Click to focus on this task';
    }

    // Focus icon
    const focusIcon = document.createElement('span');
    focusIcon.className = 'focus-indicator';
    if (activeTaskId === task.id) {
      focusIcon.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      focusIcon.title = 'Currently focusing';
    }

    // Delete
    const del = document.createElement('button');
    del.className = 'task-delete';
    del.title = 'Delete task';
    del.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    del.addEventListener('click', () => deleteTask(task.id));

    li.append(dot, check, text, focusIcon, del);
    taskList.appendChild(li);
  });
}

function renderCurrentTaskIndicator() {
  if (activeTaskId) {
    const task = tasks.find(t => t.id === activeTaskId && !t.completed);
    if (task) {
      const label = task.text.length > 32 ? task.text.slice(0, 32) + '…' : task.text;
      currentTaskName.textContent = label;
      currentTaskIndicator.style.display = 'flex';
      return;
    }
  }
  currentTaskIndicator.style.display = 'none';
}

// ─── STATS ───────────────────────────────────────────────────────────────────
function loadStats() {
  const saved = JSON.parse(localStorage.getItem('ptt_stats') || '{}');
  const today = new Date().toDateString();
  if (saved.date !== today) {
    const streak = computeStreak(saved);
    return { date: today, focusMinutes: 0, sessions: 0, tasksDone: 0, streak };
  }
  return { date: today, focusMinutes: 0, sessions: 0, tasksDone: 0, streak: 1, ...saved };
}

function computeStreak(saved) {
  if (!saved.date) return 1;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return saved.date === yesterday.toDateString() ? (saved.streak || 1) + 1 : 1;
}

function saveStats() {
  localStorage.setItem('ptt_stats', JSON.stringify(stats));
}

function renderStatsDisplay() {
  const h = Math.floor(stats.focusMinutes / 60);
  const m = stats.focusMinutes % 60;
  statFocusTime.textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
  statSessions.textContent  = stats.sessions;
  statStreak.textContent    = stats.streak || 1;
  statTasksDone.textContent = stats.tasksDone;
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function populateSettingsUI() {
  sFocusDuration.value      = settings.focusDuration;
  sShortBreak.value         = settings.shortBreakDuration;
  sLongBreak.value          = settings.longBreakDuration;
  sSessionsBeforeLong.value = settings.sessionsBeforeLong;
  sAutoBreaks.checked       = settings.autoStartBreaks;
  sAutoFocus.checked        = settings.autoStartFocus;
  sSound.checked            = settings.soundEnabled;
  sNotifications.checked    = settings.notificationsEnabled;
}
// ─── CSV EXPORT ──────────────────────────────────────────────────────────────
function exportStatsAsCSV() {
  if (stats.focusMinutes === 0 && tasks.length === 0) {
    showToast('No data statisticsto export yet');
    return;
  }
  const headers = ['Metric', 'Value'];
  const rows = [
    ['Date', stats.date],
    ['Focus Minutes', stats.focusMinutes],
    ['Sessions Completed', stats.sessions],
    ['Tasks Done', stats.tasksDone],
    ['Day Streak', stats.streak]
  ];
  //Format CSV
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => '"${cell}"').join(',') + '\n';
  });
  //Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'focus-flow-stats-${stats.date}.csv';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.nodeType.removeChild(a);

  showToast('Statistics exported as CSV'); 
}
function saveSettings() {
  settings = {
    focusDuration:        Math.max(1, parseInt(sFocusDuration.value)      || 25),
    shortBreakDuration:   Math.max(1, parseInt(sShortBreak.value)         || 5),
    longBreakDuration:    Math.max(1, parseInt(sLongBreak.value)          || 15),
    sessionsBeforeLong:   Math.max(2, parseInt(sSessionsBeforeLong.value) || 4),
    autoStartBreaks:      sAutoBreaks.checked,
    autoStartFocus:       sAutoFocus.checked,
    soundEnabled:         sSound.checked,
    notificationsEnabled: sNotifications.checked,
  };
  localStorage.setItem('ptt_settings', JSON.stringify(settings));
  setMode(mode);
  renderSessionDots();
  closeSettings();
  showToast('Settings saved');
}

function openSettings() {
  populateSettingsUI();
  settingsPanel.classList.remove('hidden');
  settingsOverlay.classList.remove('hidden');
  setTimeout(() => {
    settingsPanel.classList.add('open');
    settingsOverlay.classList.add('open');
  }, 10);
}

function closeSettings() {
  settingsPanel.classList.remove('open');
  settingsOverlay.classList.remove('open');
  setTimeout(() => {
    settingsPanel.classList.add('hidden');
    settingsOverlay.classList.add('hidden');
  }, 300);
}

// ─── THEME ───────────────────────────────────────────────────────────────────
function applyTheme(t) {
  theme = t;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ptt_theme', theme);
}

// ─── TOAST ───────────────────────────────────────────────────────────────────
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ─── EVENT LISTENERS ─────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
playButtonClickSound();
running ? pauseTimer() : startTimer();
});
resetBtn.addEventListener('click', () => {
  playButtonClickSound();
  resetTimer();
});
skipBtn.addEventListener('click', () => {
  playButtonClickSound();
  skipTimer();
});

modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    playButtonClickSound();
    if (tab.dataset.mode !== mode) {
      pauseTimer();
      setMode(tab.dataset.mode);
    }
  });
});

addTaskBtn.addEventListener('click', () => {
  playButtonClickSound();
  addTask(taskInput.value, prioritySelect.value);
  taskInput.value = '';
  taskInput.focus();
});

taskInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTaskBtn.click();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

clearDoneBtn.addEventListener('click', clearCompleted);

themeToggle.addEventListener('click', () => applyTheme(theme === 'dark' ? 'light' : 'dark'));

statsToggle.addEventListener('click', () => {
  statsSection.classList.toggle('hidden');
  statsToggle.classList.toggle('active');
});

settingsToggle.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', closeSettings);
saveSettingsBtn.addEventListener('click', saveSettings);

sNotifications.addEventListener('change', () => {
  if (sNotifications.checked && Notification.permission !== 'granted') {
    Notification.requestPermission().then(p => {
      sNotifications.checked = p === 'granted';
      if (p !== 'granted') showToast('Notification permission denied');
    });
  }
});
const exportStatsBtn = document.getElementById('exportStatsBtn');
if (exportStatsBtn) {
  exportStatsBtn.addEventListener('click', exportStatsAsCSV);
}

resetStatsBtn.addEventListener('click', () => {
  if (confirm('Reset today\'s statistics?')) {
    stats = { date: new Date().toDateString(), focusMinutes: 0, sessions: 0, tasksDone: 0, streak: stats.streak };
    saveStats();
    renderStatsDisplay();
    showToast('Statistics reset');
  }
});

clearAllTasksBtn.addEventListener('click', () => {
  if (confirm('Clear ALL tasks? This cannot be undone.')) {
    tasks = [];
    activeTaskId = null;
    saveTasks();
    renderTasks();
    renderCurrentTaskIndicator();
    closeSettings();
    showToast('All tasks cleared');
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  // Don't intercept when typing in inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); running ? pauseTimer() : startTimer(); }
  if (e.key === 'r' || e.key === 'R') resetTimer();
});

// ─── INIT ─────────────────────────────────────────────────────────────────────
applyTheme(theme);
setMode('focus');
renderSessionDots();
renderTasks();
renderCurrentTaskIndicator();
renderStatsDisplay();
