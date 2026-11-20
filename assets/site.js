(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const say = (zh, english) => en ? english : zh;
  const locale = en ? '/en' : '';
  const languageLink = document.querySelector('[data-language-switch]');
  const languagePath = languageLink ? new URL(languageLink.href).pathname : '';
  const syncLanguage = () => { if (languageLink) languageLink.href = languagePath + location.hash; };
  syncLanguage();
  window.addEventListener('hashchange', syncLanguage);

  // Keep previously shared homepage anchors useful after the long page retires.
  if (location.pathname === '/' || location.pathname === '/en/') {
    const old = {workspace:'workspace',workflow:'workspace',compare:'workspace',develop:'sample-filters',filters:'sample-filters','sample-filters':'sample-filters',portrait:'portrait',denoise:'denoise','star-trails':'star-trails',import:'import',delivery:'delivery'};
    const section = location.hash.slice(1);
    if (old[section]) { location.replace(locale + '/explore/#' + old[section]); return; }
    if (section === 'pro') { location.replace(locale + '/pro/'); return; }
    if (section === 'local') { location.replace(locale + '/privacy/'); return; }
    if (section === 'manifest') { location.replace(locale + '/devices/'); return; }
  }

  const menu = document.querySelector('[data-menu]');
  const toggle = document.querySelector('[data-menu-toggle]');
  function closeMenu(focus = false) {
    menu?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (focus) toggle?.focus();
  }
  toggle?.addEventListener('click', event => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open && event.detail === 0) menu.querySelector('a')?.focus();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu?.classList.contains('is-open')) closeMenu(true); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const links = [...gallery.querySelectorAll('[data-gallery-link]')];
    const panels = [...gallery.querySelectorAll('[data-gallery-panel]')];
    if (!links.length || !panels.length) return;
    const nav = links[0].parentElement;
    nav.setAttribute('role', 'tablist');
    const signatureViewer = gallery.querySelector('[data-signature-viewer]');
    const lookLinks = [...gallery.querySelectorAll('[data-look-link]')];
    const lookScenes = [...gallery.querySelectorAll('[data-look-scene]')];

    function selectLook() {
      const selected = lookScenes.find(scene => '#' + scene.id === location.hash) || lookScenes[0];
      signatureViewer.classList.add('is-enhanced');
      for (const scene of lookScenes) scene.hidden = scene !== selected;
      for (const link of lookLinks) {
        if (link.hash === '#' + selected.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      }
      const current = lookLinks.find(link => link.hash === '#' + selected.id);
      const reel = current.parentElement;
      const viewport = reel.getBoundingClientRect();
      const tile = current.getBoundingClientRect();
      reel.scrollLeft += Math.max(0, tile.right - viewport.right) + Math.min(0, tile.left - viewport.left);
      reel.scrollTop += Math.max(0, tile.bottom - viewport.bottom) + Math.min(0, tile.top - viewport.top);
    }
    const findPanel = hash => {
      let id;
      try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
      const target = document.getElementById(id);
      return panels.find(panel => panel.id === id || (target && panel.contains(target)));
    };
    function activate(panel, mode = '', focus = false) {
      if (!panel) return;
      gallery.classList.add('is-enhanced');
      panels.forEach(item => {
        item.hidden = item !== panel;
        item.setAttribute('role', 'tabpanel');
        const tab = links.find(link => link.hash === '#' + item.id);
        if (tab) item.setAttribute('aria-labelledby', tab.id);
      });
      links.forEach(link => {
        const selected = link.hash === '#' + panel.id;
        link.setAttribute('role', 'tab');
        link.setAttribute('aria-controls', link.hash.slice(1));
        link.setAttribute('aria-selected', String(selected));
        link.tabIndex = selected ? 0 : -1;
        if (selected && focus) link.focus();
      });
      if (mode && location.hash !== '#' + panel.id) history[mode + 'State'](null, '', '#' + panel.id);
      const stage = panel.closest('.document-stage');
      if (stage) stage.scrollTop = 0;
      if (signatureViewer && panel.contains(signatureViewer)) selectLook();
      syncLanguage();
    }
    links.forEach((link, index) => {
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const panel = findPanel(link.hash);
        if (!panel) return;
        event.preventDefault(); activate(panel, 'push');
      });
      link.addEventListener('keydown', event => {
        let next;
        if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % links.length;
        if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + links.length) % links.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = links.length - 1;
        if (next === undefined) return;
        event.preventDefault(); activate(findPanel(links[next].hash), 'replace', true);
      });
    });
    const readLocation = () => activate(findPanel(location.hash) || panels[0]);
    for (const link of lookLinks) {
      link.addEventListener('click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (location.hash !== link.hash) history.pushState(null, '', link.hash);
        readLocation();
      });
    }
    window.addEventListener('hashchange', readLocation);
    window.addEventListener('popstate', readLocation);
    readLocation();
  });

  document.querySelectorAll('[data-comparison]').forEach(comparison => {
    const range = comparison.querySelector('input[type=range]');
    const update = () => {
      const value = Math.min(100, Math.max(0, Number(range.value)));
      comparison.style.setProperty('--split', value + '%');
      range.setAttribute('aria-valuetext', say('原图 ' + value + '%，处理后 ' + (100 - value) + '%', value + '% original, ' + (100 - value) + '% edited'));
    };
    range.addEventListener('input', update);
    update();
    comparison.classList.add('is-interactive');
  });

  let lightbox;
  document.querySelectorAll('[data-lightbox]').forEach(trigger => trigger.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const source = trigger.querySelector('img');
    if (!source || typeof HTMLDialogElement === 'undefined') return;
    event.preventDefault();
    if (!lightbox) {
      lightbox = document.createElement('dialog');
      lightbox.className = 'lightbox';
      const close = document.createElement('button');
      close.className = 'dialog-close'; close.type = 'button'; close.textContent = '×';
      close.setAttribute('aria-label', say('关闭大图', 'Close enlarged image'));
      close.addEventListener('click', () => lightbox.close());
      const picture = document.createElement('img');
      const caption = document.createElement('p'); caption.id = 'lightbox-caption';
      lightbox.append(close, picture, caption);
      lightbox.setAttribute('aria-labelledby', caption.id);
      lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
      document.body.append(lightbox);
    }
    const picture = lightbox.querySelector('img');
    picture.src = source.currentSrc || source.src; picture.alt = source.alt;
    lightbox.querySelector('p').textContent = source.alt;
    lightbox.addEventListener('close', () => trigger.focus(), {once:true});
    lightbox.showModal();
  }));

  // The existing same-origin support endpoint is preserved. No requests occur
  // until the visitor explicitly submits the form; the static mirror has none.
  const form = document.querySelector('[data-support-form]');
  if (!form) return;
  if (location.hostname === 'glenffi.github.io') {
    form.innerHTML = say('<p>此镜像站不保存支持表单。请使用公开支持工单，并勿填写邮箱、原片或其他敏感信息。</p><a class="button button-secondary" href="https://github.com/Glenffi/Glenffi.github.io/issues/new/choose">打开支持工单 ↗</a>', '<p>This mirror does not store support forms. Use the public support tracker without sharing email addresses, original photos or other sensitive information.</p><a class="button button-secondary" href="https://github.com/Glenffi/Glenffi.github.io/issues/new/choose">Open a support issue ↗</a>');
    return;
  }
  const status = form.querySelector('[data-form-status]');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const button = form.querySelector('button[type=submit]');
    const data = Object.fromEntries(new FormData(form).entries());
    button.disabled = true;
    status.className = 'form-status'; status.textContent = say('正在提交…', 'Sending…');
    try {
      const response = await fetch('/api/support', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
      const result = await response.json();
      if (!response.ok || !result.ticket) throw new Error('Support unavailable');
      form.reset(); status.classList.add('is-success');
      status.textContent = say('已收到。支持编号：', 'Received. Ticket: ') + result.ticket;
    } catch {
      status.classList.add('is-error');
      status.textContent = say('暂时无法提交，已保留你填写的内容。可以稍后重试，或使用下方公开支持工单。', 'Unable to send right now. Your message has been kept. Try again later, or use the public support tracker below.');
    } finally { button.disabled = false; }
  });
})();
