// ФОРМА — конфигуратор дивана (размер × ткань → цена) и заказ (демо).
(function () {
  'use strict';

  const MODELS = { loft: 89000, oslo: 96000, pesok: 112000, grafit: 93000 };
  // [базовый тон, светлый (сиденье), тёмный (подушки), надбавка]
  const FABRICS = [
    ['#ba5e34', '#cf7b52', '#93441f', 0],
    ['#808468', '#9aa07e', '#5f6349', 0],
    ['#cab696', '#d9c9ae', '#a8946f', 0],
    ['#5c5a58', '#77746f', '#413f3d', 0],
    ['#e6ddd0', '#f2ece2', '#c4b8a6', 2500],
  ];

  const priceOut = document.getElementById('priceOut');
  const priceNote = document.getElementById('priceNote');
  const vsofa = document.getElementById('vsofa');
  const sizeChips = Array.from(document.querySelectorAll('#sizeChips .chip'));
  const swatches = Array.from(document.querySelectorAll('#fabSwatches .swatch'));
  const orderForm = document.getElementById('orderForm');
  const orderDone = document.getElementById('orderDone');
  const orderDoneText = document.getElementById('orderDoneText');

  const state = { model: 'loft', k: 1, fabric: 0 };

  let currentDisplayPrice = 89000;
  let priceAnimFrame = null;

  function fmt(n) {
    return n.toLocaleString('ru-RU') + ' ₽';
  }

  function animatePrice(targetPrice) {
    if (priceAnimFrame) cancelAnimationFrame(priceAnimFrame);
    const startPrice = currentDisplayPrice;
    const startTime = performance.now();
    const duration = 350;

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - (1 - progress) * (1 - progress);
      currentDisplayPrice = Math.round(startPrice + (targetPrice - startPrice) * ease);
      priceOut.textContent = fmt(currentDisplayPrice);
      if (progress < 1) {
        priceAnimFrame = requestAnimationFrame(step);
      } else {
        currentDisplayPrice = targetPrice;
        priceOut.textContent = fmt(targetPrice);
      }
    }
    priceAnimFrame = requestAnimationFrame(step);
  }

  function render() {
    const [base, light, dark, extra] = FABRICS[state.fabric];
    vsofa.style.setProperty('--fab', base);
    vsofa.style.setProperty('--fab-light', light);
    vsofa.style.setProperty('--fab-dark', dark);
    const price = Math.round((MODELS[state.model] * state.k + extra) / 100) * 100;
    animatePrice(price);
    orderForm.dataset.price = String(price);
  }

  sizeChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      sizeChips.forEach((c) => {
        c.classList.toggle('on', c === chip);
        c.setAttribute('aria-pressed', String(c === chip));
      });
      state.k = Number(chip.dataset.k);
      render();
    });
  });

  swatches.forEach((sw) => {
    sw.addEventListener('click', () => {
      swatches.forEach((s) => {
        s.classList.toggle('on', s === sw);
        s.setAttribute('aria-pressed', String(s === sw));
      });
      state.fabric = Number(sw.dataset.f);
      render();
    });
  });

  // «Собрать →» из каталога: выбрать модель/ткань и показать конфигуратор
  document.querySelectorAll('[data-goto-config]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.model = btn.dataset.model;
      const f = Number(btn.dataset.fabric);
      swatches[f]?.click();
      document.getElementById('config').scrollIntoView({ behavior: 'smooth' });
      render();
    });
  });

  document.getElementById('orderBtn').addEventListener('click', () => {
    orderDone.hidden = true;
    orderForm.hidden = false;
    orderForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    orderForm.querySelector('input')?.focus();
  });

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!orderForm.reportValidity()) return;
    const name = new FormData(orderForm).get('name');
    orderDoneText.textContent =
      `${name}, диван собран и добавлен в очередь производства — ` +
      `${orderForm.dataset.price} ₽. Перезвоним для подтверждения.`;
    orderForm.hidden = true;
    orderDone.hidden = false;
    orderDone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  render();
})();
