document.addEventListener("DOMContentLoaded", async () => {
  // DOM Elements
  const elements = {
    themeToggle: document.getElementById("theme-toggle"),
    themeIconSun: document.getElementById("theme-icon-sun"),
    themeIconMoon: document.getElementById("theme-icon-moon"),
    langToggle: document.getElementById("lang-toggle"),
    app: document.getElementById("app"),
    loading: document.getElementById("loading"),
    errorMsg: document.getElementById("error-message"),
    name: document.getElementById("name"),
    bio: document.getElementById("bio"),
    avatar: document.getElementById("avatar"),
    bio: document.getElementById("bio"),
    avatar: document.getElementById("avatar"),
    portfolioSection: document.getElementById("portfolio-section"),
    portfolioTitle: document.getElementById("portfolio-title"),
    portfolioGrid: document.getElementById("portfolio-grid"),
    sections: document.getElementById("sections"),
    footer: document.getElementById("footer"),
    year: document.getElementById("year"),
    footerName: document.getElementById("footer-name"),
    toast: document.getElementById("toast"),
    modal: document.getElementById("modal"),
    modalOverlay: document.getElementById("modal-overlay"),
    modalClose: document.getElementById("modal-close"),
    modalPrev: document.getElementById("modal-prev"),
    modalNext: document.getElementById("modal-next"),
    modalImg: document.getElementById("modal-img"),
    modalCaption: document.getElementById("modal-caption"),
    statusBar: document.getElementById("status-bar"),
    statusText: document.getElementById("status-text"),
  };

  let config = null;
  let i18n = null;

  // Auto-detect browser language or load from localStorage
  let currentLang =
    localStorage.getItem("lang") ||
    (navigator.language.startsWith("zh") ? "zh" : "en");
  let currentTheme = localStorage.getItem("theme");

  // Gallery State
  let currentGalleryIndex = -1;
  let isGalleryMode = false;

  if (!currentTheme) {
    currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  // Initialize Theme
  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      elements.themeIconSun.classList.remove("hidden");
      elements.themeIconMoon.classList.add("hidden");
    } else {
      elements.themeIconSun.classList.add("hidden");
      elements.themeIconMoon.classList.remove("hidden");
    }
    localStorage.setItem("theme", theme);
    currentTheme = theme;
  };
  applyTheme(currentTheme);

  elements.themeToggle.addEventListener("click", () => {
    applyTheme(currentTheme === "light" ? "dark" : "light");
  });

  elements.langToggle.addEventListener("click", () => {
    currentLang = currentLang === "zh" ? "en" : "zh";
    localStorage.setItem("lang", currentLang);
    render();
  });

  // Translation Helper
  const t = (key, params = {}) => {
    if (!i18n || !i18n[currentLang] || !i18n[currentLang][key]) return key;
    let text = i18n[currentLang][key];
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  };

  // Toast Logic
  let toastTimeout;
  const showToast = (msgKey) => {
    elements.toast.textContent = t(msgKey);
    elements.toast.classList.remove("hidden");
    elements.toast.classList.add("show");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      elements.toast.classList.remove("show");
    }, 3000);
  };

  // Copy to Clipboard
  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast("copySuccess");
      } else {
        // Fallback approach
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          showToast("copySuccess");
        } catch (error) {
          showToast("copyFailed");
        }
        textArea.remove();
      }
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("copyFailed");
    }
  };

  // Modal Logic
  function openModal(imgSrc, caption = "", asGallery = false) {
    elements.modalImg.src = imgSrc;
    elements.modalCaption.textContent = caption ? t(caption) : "";
    elements.modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Prevent background scrolling

    isGalleryMode = asGallery;
    if (isGalleryMode && config && config.portfolio) {
      currentGalleryIndex = config.portfolio.indexOf(imgSrc);
      elements.modalPrev.classList.remove("hidden");
      elements.modalNext.classList.remove("hidden");
      elements.modal.classList.add("gallery-mode");
    } else {
      currentGalleryIndex = -1;
      elements.modalPrev.classList.add("hidden");
      elements.modalNext.classList.add("hidden");
      elements.modal.classList.remove("gallery-mode");
    }
    elements.modalClose.focus();
  }

  function closeModal() {
    elements.modal.classList.add("hidden");
    document.body.style.overflow = "";
    currentGalleryIndex = -1;
    isGalleryMode = false;
    // Optionally clear src to stop loading if it was a heavy image
    setTimeout(() => (elements.modalImg.src = ""), 300);
  }

  function navigateGallery(direction) {
    if (!isGalleryMode || currentGalleryIndex === -1 || !config.portfolio)
      return;

    let newIndex = currentGalleryIndex + direction;
    const total = config.portfolio.length;

    // Loop around
    if (newIndex >= total) newIndex = 0;
    if (newIndex < 0) newIndex = total - 1;

    currentGalleryIndex = newIndex;
    // Update image fluidly
    elements.modalImg.style.opacity = "0";
    setTimeout(() => {
      elements.modalImg.src = config.portfolio[currentGalleryIndex];
      elements.modalCaption.textContent = ""; // Portfolios don't have distinct captions right now
      elements.modalImg.style.opacity = "1";
    }, 150);
  }

  elements.modalClose.addEventListener("click", closeModal);
  elements.modalOverlay.addEventListener("click", closeModal);

  // Gallery Navigation Listeners
  elements.modalPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateGallery(-1);
  });
  elements.modalNext.addEventListener("click", (e) => {
    e.stopPropagation();
    navigateGallery(1);
  });

  // Keyboard accessibility for Modal
  document.addEventListener("keydown", (e) => {
    if (!elements.modal.classList.contains("hidden")) {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") navigateGallery(-1);
      if (e.key === "ArrowRight") navigateGallery(1);
    }
  });

  // Render Data to DOM
  const render = () => {
    if (!config || !i18n) return;

    // Set Language toggle text
    elements.langToggle.textContent = currentLang === "zh" ? "EN" : "中文";

    // Set Meta tags
    document.documentElement.lang = currentLang;
    document.title = t("pageTitle", { name: config.name });
    document.getElementById("meta-desc").content = t("pageDescription", {
      name: config.name,
      bio: config.bio[currentLang],
    });
    document.getElementById("og-title").content = t("pageTitle", {
      name: config.name,
    });
    document.getElementById("og-desc").content = t("pageDescription", {
      name: config.name,
      bio: config.bio[currentLang],
    });

    // Update App Texts
    elements.name.textContent = config.name;
    elements.footerName.textContent = config.name;
    elements.bio.textContent = config.bio[currentLang] || config.bio["en"];

    // Handle avatar failure gracefully by not crashing
    if (config.avatar) {
      elements.avatar.src = config.avatar;
      elements.avatar.onerror = () => {
        elements.avatar.src =
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QxZDVkYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IiM2YjcyODAiPj88L3RleHQ+PC9zdmc+"; // placeholder gray square
      };
    }

    // Status Bar
    const dateStr = config.buildTime
      ? new Date(config.buildTime).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    let statusHtml = t("updatedAt", { date: dateStr });
    if (config.status && config.status[currentLang]) {
      statusHtml += t("recentlyDoing", { status: config.status[currentLang] });
    }
    elements.statusText.textContent = statusHtml;
    elements.statusBar.style.display = "block";

    // Render Portfolio (if configured)
    if (config.portfolio && config.portfolio.length > 0) {
      elements.portfolioTitle.textContent = t("portfolioTitle");
      elements.portfolioGrid.innerHTML = "";

      config.portfolio.forEach((imgUrl, index) => {
        const imgWrap = document.createElement("div");
        imgWrap.className = "portfolio-item";
        // Add staggered entrance animations extending beyond global card index if desired
        imgWrap.style.animationDelay = `${0.2 + index * 0.1}s`;

        const imgStr = document.createElement("img");
        imgStr.src = imgUrl;
        imgStr.alt = `Portfolio shot ${index + 1}`;
        imgStr.loading = "lazy"; // Enhance performance

        // Add modal logic directly to images - open as Gallery Mode
        imgWrap.addEventListener("click", () => openModal(imgUrl, "", true));

        imgWrap.appendChild(imgStr);
        elements.portfolioGrid.appendChild(imgWrap);
      });

      elements.portfolioSection.classList.remove("hidden");
    } else {
      elements.portfolioSection.classList.add("hidden");
    }

    // Render Sections
    elements.sections.innerHTML = "";
    let globalCardIndex = 0; // for continuous staggering across sections
    config.sections.forEach((section) => {
      const sectionEl = document.createElement("div");
      sectionEl.className = "section";

      const titleEl = document.createElement("h2");
      titleEl.className = "section-title";
      titleEl.textContent = t(section.titleKey);
      sectionEl.appendChild(titleEl);

      const itemsEl = document.createElement("div");
      itemsEl.className = "section-items";

      section.items.forEach((item) => {
        let card;
        const hasDropdown = item.dropdownImage || item.dropdownText;
        const wrapper = hasDropdown ? document.createElement("div") : null;

        if (wrapper) {
          wrapper.className = "card-wrapper";
          wrapper.style.animationDelay = `${0.1 + globalCardIndex * 0.08}s`;
        }

        if (item.type === "link") {
          card = document.createElement("a");
          card.href = item.url;
          card.target = "_blank";
          card.rel = "noopener noreferrer";
        } else {
          card = document.createElement("button");
        }

        card.className = "card";
        if (!wrapper) {
          card.style.animationDelay = `${0.1 + globalCardIndex * 0.08}s`;
        }
        globalCardIndex++;

        // Left/Main part of the card
        const cardContentHtml = `
                    <div class="card-icon">${item.icon}</div>
                    <span class="card-title">${t(item.titleKey)}</span>
                `;

        // If it has a dropdown, we append a toggle button HTML
        if (hasDropdown) {
          card.innerHTML =
            cardContentHtml +
            `
                        <button class="card-toggle" aria-label="Toggle Dropdown">
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                    `;
        } else {
          card.innerHTML = cardContentHtml;
        }

        // Handle Main Card Clicks
        card.addEventListener("click", (e) => {
          // Stop if the toggle button specifically was clicked
          if (e.target.closest(".card-toggle")) {
            e.preventDefault();
            if (wrapper) wrapper.classList.toggle("expanded");
            return;
          }

          // Execute primary action
          if (item.type === "copy") {
            copyToClipboard(item.copyText);
          } else if (item.type === "qrcode") {
            openModal(item.qrcodeImage, item.qrcodeCaption);
          }
          // if item.type === 'link', the 'a' tag native behavior handles the navigation automatically.
        });

        if (wrapper) {
          wrapper.appendChild(card);

          // Build Dropdown
          const dropdown = document.createElement("div");
          dropdown.className = "card-dropdown";

          if (item.dropdownImage) {
            const img = document.createElement("img");
            img.src = item.dropdownImage;
            img.className = "dropdown-img";
            img.alt = "QR Code";
            dropdown.appendChild(img);
          }
          if (item.dropdownText) {
            const text = document.createElement("div");
            text.className = "dropdown-text";
            text.textContent = t(item.dropdownText); // Use t() in case it's a translation key, or fallback to exact string
            dropdown.appendChild(text);
          }
          wrapper.appendChild(dropdown);
          itemsEl.appendChild(wrapper);
        } else {
          itemsEl.appendChild(card);
        }
      });

      sectionEl.appendChild(itemsEl);
      elements.sections.appendChild(sectionEl);
    });

    elements.year.textContent = new Date().getFullYear();
  };

  // Main Run
  try {
    const [configRes, i18nRes] = await Promise.all([
      fetch("config.json"),
      fetch("i18n.json"),
    ]);

    if (!configRes.ok || !i18nRes.ok)
      throw new Error("Failed to fetch config data");

    config = await configRes.json();
    i18n = await i18nRes.json();

    // Check Analytics Injection
    if (config.analytics && config.analytics.enabled) {
      const script = document.createElement("script");
      script.defer = true;
      script.src = config.analytics.scriptSrc;
      if (config.analytics.websiteId) {
        script.dataset.domain = config.analytics.websiteId;
      }
      document.head.appendChild(script);
    }

    elements.loading.classList.add("hidden");
    elements.app.classList.remove("hidden");
    elements.footer.classList.remove("hidden");
    render();
  } catch (err) {
    console.error(err);
    elements.loading.classList.add("hidden");
    elements.errorMsg.textContent =
      "配置加载失败，请检查网络或刷新重试。 / Failed to load config.";
    elements.errorMsg.classList.remove("hidden");
  }
});
