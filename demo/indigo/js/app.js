// ИНДИГО — фильтры галереи, лайтбокс, запись (демо).
(function () {
  'use strict';

  // ---------- фильтры ----------
  const filters = document.querySelectorAll('.filter');
  const works = document.querySelectorAll('.work');
  filters.forEach((f) => {
    f.addEventListener('click', () => {
      filters.forEach((x) => {
        x.classList.toggle('on', x === f);
        x.setAttribute('aria-pressed', String(x === f));
      });
      const style = f.dataset.style;
      works.forEach((w) => {
        const show = style === 'all' || w.dataset.style === style;
        w.classList.toggle('hide', !show);
        w.classList.toggle('appear', show);
      });
    });
  });

  // ---------- лайтбокс ----------
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');
  works.forEach((w) => {
    w.querySelector('img').addEventListener('click', () => {
      lbImg.src = w.querySelector('img').src;
      lbImg.alt = w.querySelector('img').alt;
      lbCap.textContent = w.querySelector('figcaption').textContent;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLb() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  document.getElementById('lbClose').addEventListener('click', closeLb);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLb();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb();
  });

  // ---------- запись ----------
  const form = document.getElementById('bookForm');
  const done = document.getElementById('bookDone');
  const doneText = document.getElementById('bookDoneText');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    doneText.textContent =
      `${d.get('name')}, заявка на «${d.get('style')}» принята — мастер ${d.get('master')} ответит ` +
      `на ${d.get('contact')} с эскизом и окном в расписании.`;
    form.hidden = true;
    done.hidden = false;
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
