# 导航项目部署与域名绑定指南

本文档将引导您从零开始，使用本仓库的代码部署 GitHub Pages，并绑定您的主域名（例如 `example.com` 或 `www.example.com`）。

---

## 阶段一：推送代码至 GitHub

1. 在 GitHub 上新建一个仓库（Repository），例如命名为 `site-nav`。**设为 Public。**
2. 在本地电脑的此项目根目录下（即包含 `index.html` 的目录），初始化 Git 并推送到远程：
   ```bash
   git init
   git add .
   git commit -m "init: navigation landing page"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/site-nav.git
   git push -u origin main
   ```

---

## 阶段二：配置 GitHub Pages 自动部署

本项目提供了纯静态网页自动部署的 Action。推荐使用官方提供的 **Actions 模式**。

### 推荐方法：GitHub Actions 模式 (部署自 `deploy.yml`)

采用这种方式，代码不会被推送到任何杂乱的 `gh-pages` 分支，而是直接打包成 artifact 进行部署，更加现代化且无缝。

#### 配置步骤：

1. 进入 GitHub 仓库网页。
2. 点击上方菜单栏的 **Settings**。
3. 在左侧边栏找到并点击 **Pages**。
4. 在 **Build and deployment** 下拉菜单处：
   - 找到 "Source" 选项。
   - 将其从 "Deploy from a branch" 修改为 **"GitHub Actions"**。
5. 此时，GitHub 会自动读取目录中的 `.github/workflows/deploy.yml`。
6. 回到顶部的 **Actions** 标签页，您应该能看到名为 `Deploy static content to Pages` 的任务正在自动运行。等它变成绿色对勾 ✅ 后，部署即告完成。
7. 在 Pages 设置页顶部会自动显示上线地址（此时还是默认的 `https://<user>.github.io/site-nav/`）。

> **关于替代方案 (`deploy-alt.yml`)**
> 如果您强迫症般需要使用原先熟知的 `peaceiris/actions-gh-pages` 方案，请在 `.github/workflows/deploy-alt.yml` 取消注释 `push: branches: ["main"]`，并在 `deploy.yml` 中禁用。
> 随后在 Settings -> Pages -> Source 中选择 "Deploy from a branch"，指定为 `gh-pages` 分支的 `/ (root)`。

---

## 阶段三：绑定主域名并配置 DNS

您需要修改代码和域名服务商（如阿里云、Cloudflare、GoDaddy 等）两处的设置。

### 1. 修改代码中的 `CNAME` 文件

1. 打开项目根目录下的 `CNAME` 文件。
2. 将里头的 `example.com` 替换为您实际拥有的域名，例如 `yourdomain.com` 或是 `www.yourdomain.com`。
   - **Tip**: 建议直接写 `yourdomain.com` (apex domain，裸域名)。GitHub 在处理裸域名时，会自动配置重定向，将 `www` 也包含在内。
3. 保存，提交 (Commit) 并推送 (Push)。这会触发一次新的自动部署。

### 2. 在 GitHub 平台进行设置确认

1. 虽然有了 CNAME 文件，GitHub 也会自动帮您填入系统，但为了保险起见，建议人工检查：
2. 去仓库进入 **Settings -> Pages**。
3. 往下找到 **Custom domain**。
4. 确保输入框里写着您的域名（如果没写，请手动输入并点 Save）。

### 3. 去域名服务商处添加 DNS 解析记录

这一步非常关键！您需要告诉网络请求去哪里寻找这个域名。

#### 方案 A：如果您绑定的是 `yourdomain.com`（APEX 裸域名，**推荐**）

您需要添加 **A 记录**，指向 GitHub 的四个官方 IP 地址。（添加 4 条记录）：

- **Type/类型**: `A`
- **Host/主机记录**: `@` (代表顶级域名)
- **Value/记录值**:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`

> _可选但推荐_：同时也添加一个 `CNAME` 记录，让输入了 `www` 的人也能访问。
>
> - **Type**: `CNAME`
> - **Host**: `www`
> - **Value**: `<你的用户名>.github.io`

#### 方案 B：如果您绑定的是纯二级域名，例如 `nav.yourdomain.com` 或仅限 `www.yourdomain.com`

您**只需要**添加一条 CNAME 记录即可：

- **Type/类型**: `CNAME`
- **Host/主机记录**: `nav` 或 `www`
- **Value/记录值**: `<你的用户名>.github.io` (注意不要加 `https://`，就是纯地址)

### 4. 开启 HTTPS（Enforce HTTPS）

1. DNS 设置完毕后，通常不会立刻生效，全球分发可能需要 1~15 分钟不等（有些甚至 24 小时）。
2. 在等待期间，GitHub Pages 设置页的 **Custom domain** 旁可能会提示 "DNS check unsuccessful"。不要急，耐心等待。
3. 当 DNS 生效后，该提示会变成 "DNS check in progress" 或直接提示 "successful"。
4. 此时，**务必勾选下方出现的 `Enforce HTTPS` 复选框**。
   - _注意：GitHub 会自动向 Let's Encrypt 申请 SSL 证书。刚生效的前几分钟，勾选框可能是灰色的无法点击。只要看到 "Certificate is provisioned"，就可以勾选上了。_
5. 勾选后，所有访问 `http://` 的流量将自动 301 重定向到安全的 `https://`。

---

至此，您的主导航着陆页已通过主域名完美上线，并且拥有自动更新的能力。以后只需在本地修改 `main.js` 配置，执行 `git push`，剩下的全自动！
