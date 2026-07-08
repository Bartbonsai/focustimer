(function () {
  const saved = focusLoadPhases();
  const usingDefault = !saved;
  const source = saved || FOCUS_DEFAULT_PHASES;

  let stages = source.map(p => ({
    type: p.type,
    duration: p.minutes * 60,
    remaining: p.minutes * 60,
    done: false
  }));

  let running = true;
  let tickHandle = null;

  // Geluid mag pas spelen na een gebruikersinteractie (browserbeleid).
  // We 'ontgrendelen' de audiocontext bij de eerste klik of toetsaanslag
  // op deze pagina, zodat de eerste faseovergang al hoorbaar is.
  const unlockOnce = () => {
    focusUnlockAudio();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce);
  window.addEventListener('keydown', unlockOnce);

  const stagesEl = document.getElementById('stages');
  const totalLeftEl = document.getElementById('totalLeft');
  const endTimeEl = document.getElementById('endTime');
  const toggleBtn = document.getElementById('toggleBtn');
  const pulseWrap = document.getElementById('pulseWrap');
  const emptyNote = document.getElementById('emptyNote');

  if (usingDefault && emptyNote) {
    emptyNote.style.display = 'block';
  }

  function activeIndex() {
    return stages.findIndex(s => !s.done);
  }

  function totalRemaining() {
    return stages.reduce((sum, s) => sum + (s.done ? 0 : s.remaining), 0);
  }

  function render() {
    stagesEl.innerHTML = '';
    const idx = activeIndex();

    stages.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'stage' + (s.done ? ' done' : '') + (i === idx ? ' active' : '');
      row.dataset.type = s.type;

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = FOCUS_LABELS[s.type];

      const controls = document.createElement('div');
      controls.className = 'controls';

      if (s.done) {
        const check = document.createElement('span');
        check.className = 'check';
        check.innerHTML = '&#10003;';
        controls.appendChild(check);
      } else {
        const minus = document.createElement('button');
        minus.className = 'step-btn';
        minus.textContent = '\u2212';
        minus.setAttribute('aria-label', 'Minuut eraf');
        minus.disabled = s.remaining <= 0;
        minus.onclick = () => adjust(i, -60);

        const time = document.createElement('span');
        time.className = 'time';
        time.textContent = focusFmt(s.remaining);

        const plus = document.createElement('button');
        plus.className = 'step-btn';
        plus.textContent = '+';
        plus.setAttribute('aria-label', 'Minuut erbij');
        plus.onclick = () => adjust(i, 60);

        controls.appendChild(minus);
        controls.appendChild(time);
        controls.appendChild(plus);
      }

      row.appendChild(label);
      row.appendChild(controls);
      stagesEl.appendChild(row);
    });

    totalLeftEl.textContent = focusFmt(totalRemaining());
    endTimeEl.textContent = focusEndTimeString(totalRemaining());

    const cur = stages[idx];
    const urgent = cur && cur.duration > 0 && (cur.remaining / cur.duration) < 0.2;
    pulseWrap.classList.toggle('urgent', !!urgent);

    const activeRow = document.querySelector('.stage.active');
    const path = document.getElementById('pulsePath');
    if (activeRow && path) {
      const colorVar = getComputedStyle(activeRow).getPropertyValue('--stage-color').trim();
      if (colorVar) path.setAttribute('stroke', colorVar);
    }

    if (idx === -1) {
      stopTimer();
      toggleBtn.textContent = 'Nieuwe sessie';
    }
  }

  function adjust(i, deltaSec) {
    const s = stages[i];
    s.remaining = Math.max(0, s.remaining + deltaSec);
    s.duration = Math.max(s.duration, s.remaining);
    render();
  }

  function tick() {
    const idx = activeIndex();
    if (idx === -1) { stopTimer(); return; }
    const s = stages[idx];
    s.remaining -= 1;
    if (s.remaining <= 0) {
      s.remaining = 0;
      s.done = true;
      const nextIdx = activeIndex();
      focusPlayChime(nextIdx === -1 ? 'done' : 'next');
    }
    render();
  }

  function startTimer() {
    running = true;
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = setInterval(tick, 1000);
  }

  function stopTimer() {
    running = false;
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
  }

  toggleBtn.onclick = () => {
    stopTimer();
    window.location.href = 'index.html';
  };

  render();
  startTimer();
})();
