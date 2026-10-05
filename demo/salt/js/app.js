// СОЛЬ — табы меню + бронирование (демо, без отправки).
(function () {
  'use strict';

  // ---------- табы меню ----------
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.menu-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('on', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      panels.forEach((p) => {
        const on = p.id === 'menu-' + tab.dataset.tab;
        p.classList.toggle('on', on);
        p.hidden = !on;
      });
    });
  });

  // ---------- бронирование ----------
  const form = document.getElementById('bookForm');
  const done = document.getElementById('bookDone');
  const doneText = document.getElementById('bookDoneText');
  const dateInput = form.querySelector('input[name="date"]');
  dateInput.min = new Date().toISOString().slice(0, 10);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const d = new Date(data.get('date') + 'T00:00');
    const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    doneText.textContent =
      `${data.get('name')}, ждём вас ${dateStr} в ${data.get('time')} — столик на ${data.get('guests')}. ` +
      `Подтверждение пришлём на ${data.get('phone')}.`;
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
