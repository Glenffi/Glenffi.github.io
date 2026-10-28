(() => {
  const english = document.documentElement.lang === "en";
  const words = (zh, en) => english ? en : zh;
  const languageLink = document.querySelector("[data-language-switch]");
  if (languageLink) {
    const target = new URL(languageLink.href);
    const preserveSection = () => { languageLink.href = target.pathname + window.location.hash; };
    preserveSection();
    window.addEventListener("hashchange", preserveSection);
  }
  const header = document.querySelector("[data-header]");
  const menu = document.querySelector("[data-menu]");
  const menuToggle = document.querySelector("[data-menu-toggle]");

  const syncHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const open = menu?.classList.toggle("is-open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menu.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -6%" });
    reveals.forEach((element) => observer.observe(element));
  }

  const form = document.querySelector("[data-support-form]");
  if (form) {
    if (window.location.hostname === "glenffi.github.io") {
      form.innerHTML = english ? `<p><strong>Public support tracker</strong></p><p>This mirror does not store support forms. Public issues must not include email addresses, original photos, serial numbers or other sensitive information.</p><p><a class="button button-primary" href="https://github.com/Glenffi/Glenffi.github.io/issues/new/choose">Open a support issue</a></p>` : `
        <p><strong>临时公开支持通道</strong></p>
        <p>此镜像站不保存支持表单，请使用 GitHub 支持工单。工单内容公开，请勿填写邮箱、原片、序列号或其他敏感信息。</p>
        <p><a class="button button-primary" href="https://github.com/Glenffi/Glenffi.github.io/issues/new/choose">打开 Siftroom 支持工单</a></p>
      `;
      return;
    }
    const status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("button[type='submit']");
      const data = Object.fromEntries(new FormData(form).entries());
      button.disabled = true;
      status.className = "form-status";
      status.textContent = words("正在提交…", "Sending…");
      try {
        const response = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "提交失败");
        form.reset();
        status.classList.add("is-success");
        status.textContent = words(`已收到。支持编号：${result.ticket}`, `Received. Ticket: ${result.ticket}`);
      } catch {
        status.classList.add("is-error");
        status.innerHTML = words('在线表单暂时不可用。请前往 <a class="text-link" href="https://github.com/Glenffi/Glenffi.github.io/issues/new">Siftroom 公开支持工单</a>，且不要提交隐私信息。', 'The support form is unavailable. Use the <a class="text-link" href="https://github.com/Glenffi/Glenffi.github.io/issues/new">public support tracker</a> without sharing sensitive information.');
      } finally {
        button.disabled = false;
      }
    });
  }
})();
