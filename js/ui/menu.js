// ============================================================
// Полноэкранное меню с глитч-ссылками.
// ============================================================

import { gsap } from 'gsap';

export class Menu {
  constructor({ router }) {
    this.el = document.getElementById('menu');
    this.burger = document.getElementById('burger');
    this.isOpen = false;
    this.reduced = false;

    gsap.set(this.el, { clipPath: 'inset(0% 0% 100% 0%)' });
    const btns = this.el.querySelectorAll('.menu-nav button');
    const foot = this.el.querySelector('.menu-foot');

    this.tl = gsap.timeline({
      paused: true,
      onReverseComplete: () => { this.el.style.visibility = 'hidden'; },
    });
    this.tl.set(this.el, { visibility: 'visible' })
      .to(this.el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.55, ease: 'power3.inOut' })
      .fromTo(btns, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power3.out' }, '-=0.12')
      .fromTo(foot, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.35');

    this.burger.addEventListener('click', () => this.toggle());
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  toggle() { this.isOpen ? this.close() : this.open(); }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    document.body.classList.add('menu-open');
    this.el.setAttribute('aria-hidden', 'false');
    this.tl.timeScale(1).play();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    document.body.classList.remove('menu-open');
    this.el.setAttribute('aria-hidden', 'true');
    this.tl.timeScale(1.6).reverse();
  }
}
