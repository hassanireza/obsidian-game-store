"use strict";
// ================================================================
// Obsidian Game Club -- TypeScript
// ================================================================
'use strict';
// ── Cursor ────────────────────────────────────────────────────
function initCursor() {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches)
        return;
    let mx = -999, my = -999, rx = -999, ry = -999;
    document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
    });
    (function loop() {
        rx += (mx - rx) * 0.10;
        ry += (my - ry) * 0.10;
        ring.style.left = rx + 'px';
        ring.style.top = ry + 'px';
        requestAnimationFrame(loop);
    })();
    const hoverEls = 'a,button,[role=button],.game-card,.fpill,.sidebar-item,.genre-item,.icon-btn';
    document.querySelectorAll(hoverEls).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
    });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}
// ── Toast ──────────────────────────────────────────────────────
const Toast = (() => {
    let root = null;
    function getRoot() {
        if (!root) {
            root = document.getElementById('toast-root');
            if (!root) {
                root = document.createElement('div');
                root.id = 'toast-root';
                document.body.appendChild(root);
            }
        }
        return root;
    }
    return {
        show(msg, opts = {}) {
            const { type = 'info', duration = 3200 } = opts;
            const el = document.createElement('div');
            el.className = `toast ${type}`;
            el.innerHTML = `<span class="toast-dot"></span><span>${msg}</span>`;
            getRoot().appendChild(el);
            const t = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, duration);
            el.addEventListener('click', () => { clearTimeout(t); el.classList.add('out'); setTimeout(() => el.remove(), 250); });
        }
    };
})();
// ── Featured Slider ────────────────────────────────────────────
function initSlider() {
    var _a, _b;
    const slides = document.querySelectorAll('.featured-slide');
    const dots = document.querySelectorAll('.fdot');
    if (slides.length < 2) {
        (_a = slides[0]) === null || _a === void 0 ? void 0 : _a.classList.add('active');
        (_b = dots[0]) === null || _b === void 0 ? void 0 : _b.classList.add('active');
        return;
    }
    let cur = 0;
    let timer = 0;
    function go(n) {
        var _a, _b;
        slides[cur].classList.remove('active');
        (_a = dots[cur]) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        cur = (n + slides.length) % slides.length;
        slides[cur].classList.add('active');
        (_b = dots[cur]) === null || _b === void 0 ? void 0 : _b.classList.add('active');
    }
    dots.forEach((d, i) => d.addEventListener('click', () => { go(i); restart(); }));
    go(0);
    function start() { timer = window.setInterval(() => go(cur + 1), 5500); }
    function restart() { clearInterval(timer); start(); }
    start();
}
// ── Card 3-D Tilt ─────────────────────────────────────────────
function initTilt() {
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const cx = r.width / 2, cy = r.height / 2;
            const rx = ((y - cy) / cy) * -5;
            const ry = ((x - cx) / cx) * 5;
            card.style.transform = `scale(1.025) translateY(-3px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
}
// ── Mobile sidebar ─────────────────────────────────────────────
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('open-sidebar');
    const open = () => { sidebar === null || sidebar === void 0 ? void 0 : sidebar.classList.add('open'); overlay === null || overlay === void 0 ? void 0 : overlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const close = () => { sidebar === null || sidebar === void 0 ? void 0 : sidebar.classList.remove('open'); overlay === null || overlay === void 0 ? void 0 : overlay.classList.remove('open'); document.body.style.overflow = ''; };
    openBtn === null || openBtn === void 0 ? void 0 : openBtn.addEventListener('click', open);
    overlay === null || overlay === void 0 ? void 0 : overlay.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape')
        close(); });
}
// ── Wishlist toggle ────────────────────────────────────────────
function initWishlist() {
    document.querySelectorAll('[data-wl]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const slug = btn.dataset.wl;
            const csrf = getCsrf();
            const res = await fetch(`/game/${slug}/wishlist/`, { method: 'POST', headers: { 'X-CSRFToken': csrf } });
            if (res.status === 401) {
                Toast.show('Sign in to use your Wishlist', { type: 'info' });
                return;
            }
            const d = await res.json();
            const added = d.status === 'added';
            // sync all heart buttons for same slug
            document.querySelectorAll(`[data-wl="${slug}"]`).forEach(b => b.classList.toggle('active', added));
            Toast.show(d.msg, { type: added ? 'success' : 'info' });
        });
    });
}
// ── Library toggle ─────────────────────────────────────────────
function initLibrary() {
    document.querySelectorAll('[data-lib]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const slug = btn.dataset.lib;
            const csrf = getCsrf();
            const res = await fetch(`/game/${slug}/library/`, { method: 'POST', headers: { 'X-CSRFToken': csrf } });
            if (res.status === 401) {
                Toast.show('Sign in to manage your Library', { type: 'info' });
                return;
            }
            const d = await res.json();
            const added = d.status === 'added';
            document.querySelectorAll(`[data-lib="${slug}"]`).forEach(b => b.classList.toggle('active', added));
            Toast.show(d.msg, { type: added ? 'success' : 'info' });
        });
    });
}
// ── Store search (client-side fast filter) ─────────────────────
function initSearch() {
    var _a;
    const input = document.getElementById('store-search');
    const counter = document.getElementById('game-count');
    if (!input)
        return;
    const cards = Array.from(document.querySelectorAll('.game-card'));
    let debounce = 0;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = window.setTimeout(() => {
            const q = input.value.toLowerCase().trim();
            let n = 0;
            cards.forEach(c => {
                const name = (c.dataset.name || '').toLowerCase();
                const genre = (c.dataset.genre || '').toLowerCase();
                const ok = !q || name.includes(q) || genre.includes(q);
                (c.closest('.card-wrap') || c).style.display = ok ? '' : 'none';
                if (ok)
                    n++;
            });
            if (counter)
                counter.textContent = String(n);
        }, 180);
    });
    // Clear button
    (_a = document.querySelector('.search-clear')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
    });
}
// ── Scroll reveal ──────────────────────────────────────────────
function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach((en, i) => {
            if (en.isIntersecting) {
                setTimeout(() => en.target.classList.add('visible'), i * 50);
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}
// ── Count-up animation ─────────────────────────────────────────
function initCountUp() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.dataset.count, 10);
        let cur = 0;
        const step = target / 50;
        const t = setInterval(() => {
            cur = Math.min(cur + step, target);
            el.textContent = Math.round(cur).toLocaleString();
            if (cur >= target)
                clearInterval(t);
        }, 20);
    });
}
// ── Review form ────────────────────────────────────────────────
function initReview() {
    const form = document.getElementById('review-form');
    if (!form)
        return;
    let rating = 0;
    const stars = form.querySelectorAll('[data-star]');
    stars.forEach(s => {
        const n = parseInt(s.dataset.star, 10);
        s.addEventListener('mouseenter', () => stars.forEach((x, i) => x.textContent = i < n ? '★' : '☆'));
        s.addEventListener('mouseleave', () => stars.forEach((x, i) => { x.textContent = i < rating ? '★' : '☆'; x.classList.toggle('empty', i >= rating); }));
        s.addEventListener('click', () => {
            rating = n;
            stars.forEach((x, i) => { x.textContent = i < rating ? '★' : '☆'; x.classList.toggle('empty', i >= rating); });
        });
    });
    const submit = form.querySelector('[data-review-submit]');
    const textarea = form.querySelector('textarea');
    submit === null || submit === void 0 ? void 0 : submit.addEventListener('click', async () => {
        if (!rating) {
            Toast.show('Please select a rating', { type: 'error' });
            return;
        }
        const body = (textarea === null || textarea === void 0 ? void 0 : textarea.value.trim()) || '';
        if (body.length < 5) {
            Toast.show('Review is too short', { type: 'error' });
            return;
        }
        const slug = submit.dataset.reviewSubmit;
        const res = await fetch(`/game/${slug}/review/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
            body: JSON.stringify({ rating, body }),
        });
        if (res.status === 401) {
            Toast.show('Sign in to leave a review', { type: 'info' });
            return;
        }
        const d = await res.json();
        if (d.error) {
            Toast.show(d.error, { type: 'error' });
            return;
        }
        Toast.show('Review published!', { type: 'success' });
        if (textarea)
            textarea.value = '';
        rating = 0;
        stars.forEach(s => { s.textContent = '☆'; s.classList.add('empty'); });
    });
}
// ── Django messages auto-dismiss ───────────────────────────────
function initDjMessages() {
    document.querySelectorAll('.dj-msg').forEach(el => {
        setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4000);
    });
}
// ── Utils ──────────────────────────────────────────────────────
function getCsrf() {
    const m = document.cookie.match(/csrftoken=([^;]+)/);
    return m ? m[1] : '';
}
// ── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initSlider();
    initTilt();
    initSidebar();
    initWishlist();
    initLibrary();
    initSearch();
    initReveal();
    initCountUp();
    initReview();
    initDjMessages();
});
