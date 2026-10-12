'use strict';
// Navigation is shared by every public page.
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function closeMenu() {
  if (!menu || !nav) return;
  nav.classList.remove('is-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menu');
}
if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu(); menu.focus();
    }
  });
  document.addEventListener('click', event => { if (!event.target.closest('.nav-wrap')) closeMenu(); });
  const desktop = window.matchMedia('(min-width:781px)');
  if (desktop.addEventListener) desktop.addEventListener('change', closeMenu);
}
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const quoteForm = document.querySelector('#quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!quoteForm.reportValidity()) return;
    const data = new FormData(quoteForm);
    const name = String(data.get('nome') || '').trim();
    if (!name) {
      const input = quoteForm.elements.nome;
      input.setCustomValidity('Informe seu nome.'); input.reportValidity();
      input.addEventListener('input', () => input.setCustomValidity(''), {once:true});
      return;
    }
    const company = String(data.get('empresa') || '').trim();
    const service = String(data.get('servico') || '').trim();
    const details = String(data.get('mensagem') || '').trim();
    const message = ['Olá! Vim pelo site da TAJO Digital.', '', `Nome: ${name}`, `Empresa: ${company || 'Não informada'}`, `Interesse: ${service}`, details ? `Projeto: ${details}` : ''].join('\n');
    window.location.assign('https://wa.me/5527999639610?text=' + encodeURIComponent(message));
  });
}

// Native dialogs support Escape, keyboard focus containment and return focus.
const videoDialog = document.querySelector('#videoDialog');
const video = document.querySelector('#centralVideo');
const openVideo = document.querySelector('[data-open-video]');
if (videoDialog && openVideo && typeof videoDialog.showModal === 'function') {
  openVideo.addEventListener('click', event => { event.preventDefault(); videoDialog.showModal(); });
  videoDialog.querySelector('[data-close-video]').addEventListener('click', () => videoDialog.close());
  videoDialog.addEventListener('click', event => {
    const r = videoDialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) videoDialog.close();
  });
  videoDialog.addEventListener('close', () => { if(video){video.pause();video.currentTime=0;} openVideo.focus({preventScroll:true}); });
}
const imageDialog = document.querySelector('#imageDialog');
let lastImageLink = null;
if (imageDialog && typeof imageDialog.showModal === 'function') {
  document.querySelectorAll('[data-lightbox]').forEach(link => link.addEventListener('click', event => {
    // Preserve normal new-tab interaction.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); lastImageLink = link;
    const img = imageDialog.querySelector('#expandedImage');
    img.src = link.href; img.alt = link.querySelector('img').alt;
    imageDialog.querySelector('#imageCaption').textContent = img.alt;
    imageDialog.showModal();
  }));
  imageDialog.querySelector('[data-close-image]').addEventListener('click', () => imageDialog.close());
  imageDialog.addEventListener('close', () => lastImageLink?.focus({preventScroll:true}));
  imageDialog.addEventListener('click', event => {
    const r = imageDialog.getBoundingClientRect();
    if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) imageDialog.close();
  });
}

// Small scroll effects, one scheduled paint per frame; no polling or tracking.
const header = document.querySelector('.site-header');
const topLink = document.querySelector('.back-top');
let scheduled = false;
function updateScroll() {
  header?.classList.toggle('is-scrolled', window.scrollY > 10);
  topLink?.classList.toggle('visible', window.scrollY > 700);
  scheduled = false;
}
window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateScroll); } }, {passive:true});
updateScroll();

const reduceMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const pending = new Set();
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-visible');pending.delete(entry.target);observer.unobserve(entry.target);}
  }), {threshold:0.08});
  document.querySelectorAll('.service-card,.project,.process-grid article,.feature-grid article,.region-list article').forEach(element => {
    // Avoid concealing elements already on screen.
    if(element.getBoundingClientRect().top > window.innerHeight){element.classList.add('reveal','reveal-pending');pending.add(element);observer.observe(element);}
  });
  const revealAll = () => { pending.forEach(el => el.classList.remove('reveal-pending'));pending.clear();observer.disconnect(); };
  document.addEventListener('focusin', event => { const el=event.target.closest('.reveal-pending');if(el){el.classList.remove('reveal-pending');pending.delete(el);observer.unobserve(el);} });
  window.addEventListener('beforeprint', revealAll);
  if(reduceMotion.addEventListener)reduceMotion.addEventListener('change', e=>{if(e.matches)revealAll();});
  // Fail open if observation is interrupted by a browser or extension.
  window.setTimeout(revealAll, 8000);
}
