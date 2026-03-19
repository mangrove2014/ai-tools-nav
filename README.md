# AI 工具导航站

🤖 自动采集、每日更新的 AI 工具导航网站

## 功能特点

- ✅ **自动采集**：每日自动从 Product Hunt、GitHub 抓取最新 AI 工具
- ✅ **智能分类**：自动识别工具类型（写作、图像、视频、编程等）
- ✅ **零成本部署**：使用 Cloudflare Pages 免费托管
- ✅ **SEO 优化**：自动生成搜索引擎友好的页面
- ✅ **响应式设计**：支持桌面和移动端

## 项目结构

```
ai-tools-nav/
├── .github/workflows/     # GitHub Actions 自动化配置
│   └── daily-scrape.yml   # 每日自动采集和部署
├── scripts/
│   ├── scrape_tools.py    # 工具采集脚本
│   └── build.js           # 网站构建脚本
├── data/
│   └── tools.json         # 工具数据（自动更新）
├── dist/                  # 生成的静态网站
└── README.md
```

## 部署步骤

### 1. Fork 本项目

点击右上角 "Fork" 按钮，将项目复制到你的 GitHub 账号

### 2. 配置 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 创建一个新的 Pages 项目
3. 记录以下信息：
   - Account ID（在右侧栏）
   - 创建 API Token（需要有 Cloudflare Pages 编辑权限）

### 3. 配置 GitHub Secrets

在你的 GitHub 仓库中，进入 Settings → Secrets and variables → Actions，添加以下 secrets：

| Secret Name | 说明 | 获取方式 |
|------------|------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | Cloudflare Dashboard → My Profile → API Tokens |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 账号 ID | Cloudflare Dashboard 右侧栏 |
| `PRODUCT_HUNT_TOKEN` | Product Hunt API Token | [Product Hunt 开发者设置](https://www.producthunt.com/v2/oauth/applications) |

### 4. 手动触发首次部署

进入 GitHub 仓库的 Actions 页面，点击 "Daily AI Tools Scrape"，然后点击 "Run workflow" 手动触发。

### 5. 配置自定义域名（可选）

在 Cloudflare Pages 项目设置中，可以绑定自己的域名。

## 自动化流程

每天凌晨 2 点 UTC（北京时间上午 10 点），GitHub Actions 会自动：

1. 运行爬虫脚本采集新工具
2. 自动分类和去重
3. 构建静态网站
4. 部署到 Cloudflare Pages

## 本地开发

```bash
# 安装依赖
pip install requests beautifulsoup4

# 运行爬虫
python scripts/scrape_tools.py

# 构建网站
node scripts/build.js

# 预览（dist 目录就是完整网站）
```

## 接入 AdSense

1. 申请 [Google AdSense](https://www.google.com/adsense) 账号
2. 在 `scripts/build.js` 中替换 `ADSENSE_CLIENT` 为你的发布商 ID
3. 在 Google AdSense 中添加你的网站
4. 放置广告代码后等待审核通过

## 自定义配置

### 修改分类
编辑 `scripts/scrape_tools.py` 中的 `auto_categorize` 函数

### 添加数据源
在 `scrape_tools.py` 中添加新的爬虫函数

### 修改网站样式
编辑 `scripts/build.js` 中的 CSS 样式

## License

MIT
