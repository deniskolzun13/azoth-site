// ГЛУБИНА — выбор сеанса и билета (демо, без оплаты).
(function () {
  'use strict';

  const state = { date: '12 июня', time: '11:00', price: 900, type: 'Взрослый билет' };
  const sumDate = document.getElementById('sumDate');
  const sumType = document.getElementById('sumType');
  const sumPrice = document.getElementById('sumPrice');
  const buyDone = document.getElementById('buyDone');

  function wireChips(id, onPick) {
    const chips = Array.from(document.querySelectorAll(`#${id} .chip`));
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => {
          c.classList.toggle('on', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        onPick(chip);
      });
    });
    return chips;
  }

  wireChips('dateChips', (chip) => { state.date = chip.dataset.date; render(); });
  wireChips('timeChips', (chip) => { state.time = chip.dataset.time; render(); });
  wireChips('typeChips', (chip) => {
    state.price = Number(chip.dataset.price);
    state.type = chip.textContent.trim().replace(/\s*·.*$/, '');
    render();
  });

  function render() {
    sumDate.textContent = `${state.date} · ${state.time}`;
    sumType.textContent = state.type;
    sumPrice.textContent = state.price === 0 ? 'бесплатно' : `${state.price.toLocaleString('ru-RU')} ₽`;
  }

  document.getElementById('buyBtn').addEventListener('click', () => {
    const num = 'GLB-' + String(Math.floor(Math.random() * 9000) + 1000);
    document.getElementById('buyDoneText').textContent =
      `Билет ${num} на ${state.date}, ${state.time} (${state.type.toLowerCase()}) — ` +
      `${state.price === 0 ? 'бесплатно' : state.price.toLocaleString('ru-RU') + ' ₽'}. Ждём вас на Адмиралтейской, 2.`;
    buyDone.hidden = false;
    buyDone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  render();
})();
