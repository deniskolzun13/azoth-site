// ПУЛЬС — табы расписания + запись на пробную (демо).
(function () {
  'use strict';

  // ---------- расписание ----------
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('on', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      document.querySelectorAll('.sched').forEach((s) => {
        const on = s.id === 'day-' + tab.dataset.day;
        s.classList.toggle('on', on);
        s.hidden = !on;
      });
    });
  });

  // ---------- пробная тренировка ----------
  const form = document.getElementById('trialForm');
  const done = document.getElementById('trialDone');
  const doneText = document.getElementById('trialDoneText');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    doneText.textContent =
      `${d.get('name')}, ждём вас в клубе ${d.get('club')} — направление «${d.get('dir')}». ` +
      `Тренер перезвонит на ${d.get('phone')} и назначит время.`;
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
