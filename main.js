/**
 * 配置区域 (Configuration Area)
 * 在这里修改你的个人信息和链接
 */
const CONFIG = {
  // 个人信息
  name: "CoffCat",
  bio: "保持热爱，奔赴山海",
  avatar: "https://github.com/fluidicon.png", // 建议替换为你自己的图片 URL

  // 链接列表 (可按需增减)
  links: [
    {
      title: "Blog",
      url: "https://blog.ytaking.me/",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`,
    },
    {
      title: "GitHub",
      url: "https://github.com/CoffCat6",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
    },
    {
      title: "B站 (Bilibili)",
      url: "https://space.bilibili.com/yourid",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line></svg>`, // 占位 icon
    },
    {
      title: "抖音 (Douyin)",
      url: "https://www.douyin.com/user/yourid",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`, // 占位 icon (类似音符)
    },
    //取消注释下方代码即可使用邮件链接
    {
        title: "Email",
        url: "mailto:zhreddie@outlook.com",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
    }
  ],
};

/**
 * 核心逻辑 (Core Logic)
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. 初始化用户信息
  initProfile();

  // 2. 渲染链接
  renderLinks();

  // 3. 初始化并绑定暗色模式逻辑
  initTheme();

  // 4. 更新底部版权时间 & 最后更新时间
  updateFooterDates();
});

function initProfile() {
  document.getElementById("profile-name").textContent = CONFIG.name;
  document.getElementById("profile-bio").textContent = CONFIG.bio;
  document.getElementById("profile-avatar").src = CONFIG.avatar;
  document.title = `${CONFIG.name} | 导航页`;
}

function renderLinks() {
  const container = document.getElementById("links-container");
  container.innerHTML = ""; // 清空

  CONFIG.links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.url;
    a.className = "link-card";
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    a.innerHTML = `
            <div class="link-icon">${link.icon}</div>
            <span class="link-title">${link.title}</span>
        `;

    container.appendChild(a);
  });
}

function initTheme() {
  const themeBtn = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");
  const htmlEl = document.documentElement;

  // 检查本地存储或系统偏好
  const savedTheme = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  let currentTheme = "light";
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    currentTheme = "dark";
  }

  // 设置初始状态
  applyTheme(currentTheme);

  // 切换事件
  themeBtn.addEventListener("click", () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    applyTheme(currentTheme);
    localStorage.setItem("theme", currentTheme);
  });

  function applyTheme(theme) {
    htmlEl.setAttribute("data-theme", theme);
    if (theme === "dark") {
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    } else {
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    }
  }
}

function updateFooterDates() {
  // 当前年份
  document.getElementById("current-year").textContent =
    new Date().getFullYear();

  // 最后更新日期（使用构建时的 JS 运行时间作为粗略参考，在 Actions 部署静态页时，该 JS 会被打包并使用最新时间）
  // 为了美观，格式化为 YYYY-MM-DD
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  document.getElementById("last-updated-date").textContent = dateString;
}
