(() => {
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
      form.innerHTML = `
        <p><strong>临时公开支持通道</strong></p>
        <p>主域名备案同步期间，请使用 GitHub 支持工单。工单内容公开，请勿填写邮箱、原片、序列号或其他敏感信息。</p>
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
      status.textContent = "正在提交…";
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
        status.textContent = `已收到。支持编号：${result.ticket}`;
      } catch {
        status.classList.add("is-error");
        status.innerHTML = '在线表单暂时不可用。请前往 <a class="text-link" href="https://github.com/Glenffi/Glenffi.github.io/issues/new">Siftroom 公开支持工单</a>，且不要提交隐私信息。';
      } finally {
        button.disabled = false;
      }
    });
  }
})();
