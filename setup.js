(function () {
  let phases = focusLoadPhases() || FOCUS_DEFAULT_PHASES.map(p => ({ ...p }));
  let templates = FOCUS_TEMPLATES.map(t => t.map(p => ({ ...p })));

  const phasesEl = document.getElementById('phases');
  const templatesEl = document.getElementById('templates');
  const totalMinEl = document.getElementById('totalMin');
  const endTimeEl = document.getElementById('endTime');

  function renderPhases() {
    phasesEl.innerHTML = '';
    phases.forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'phase';
      row.dataset.type = p.type;

      const labelBox = document.createElement('div');
      labelBox.className = 'phase-label';

      const select = document.createElement('select');
      FOCUS_TYPES.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = FOCUS_LABELS[t];
        if (t === p.type) opt.selected = true;
        select.appendChild(opt);
      });
      select.onchange = (e) => { phases[i].type = e.target.value; renderPhases(); };

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-btn';
      removeBtn.innerHTML = '&times;';
      removeBtn.setAttribute('aria-label', 'Fase verwijderen');
      removeBtn.onclick = () => { phases.splice(i, 1); renderPhases(); };

      labelBox.appendChild(select);
      if (phases.length > 1) labelBox.appendChild(removeBtn);

      const field = document.createElement('div');
      field.className = 'minutes-field';

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.value = p.minutes;
      input.setAttribute('aria-label', FOCUS_LABELS[p.type] + ' in minuten');
      input.oninput = (e) => {
        phases[i].minutes = Math.max(0, parseInt(e.target.value || '0', 10));
        updateSummary();
      };

      field.appendChild(input);
      row.appendChild(labelBox);
      row.appendChild(field);
      phasesEl.appendChild(row);
    });
    updateSummary();
  }

  function updateSummary() {
    const total = focusTotalMinutes(phases);
    totalMinEl.textContent = total + ' min';
    endTimeEl.textContent = focusEndTimeString(total * 60);
  }

  function renderTemplates() {
    templatesEl.innerHTML = '';
    templates.forEach((tpl) => {
      const row = document.createElement('div');
      row.className = 'template';
      tpl.forEach(seg => {
        const s = document.createElement('div');
        s.className = 'template-seg';
        s.dataset.type = seg.type;
        s.style.flex = String(Math.max(seg.minutes, 1));
        s.textContent = seg.minutes;
        row.appendChild(s);
      });
      row.title = tpl.map(s => FOCUS_LABELS[s.type] + ' ' + s.minutes + 'm').join(' \u2192 ');
      row.onclick = () => { phases = tpl.map(s => ({ ...s })); renderPhases(); };
      templatesEl.appendChild(row);
    });
  }

  document.getElementById('addBtn').onclick = () => {
    phases.push({ type: 'focus', minutes: 25 });
    renderPhases();
  };

  document.getElementById('resetBtn').onclick = () => {
    phases = FOCUS_DEFAULT_PHASES.map(p => ({ ...p }));
    renderPhases();
  };

  document.getElementById('saveTplBtn').onclick = () => {
    templates.push(phases.map(p => ({ ...p })));
    renderTemplates();
  };

  document.getElementById('startBtn').onclick = () => {
    const ok = focusSavePhases(phases);
    if (ok) {
      window.location.href = 'timer.html';
    } else {
      alert('Deze omgeving ondersteunt geen opslag (bv. Claude-voorvertoning). Zet dit bestand op een echte website, zoals GitHub Pages, om te starten.');
    }
  };

  renderPhases();
  renderTemplates();
})();
