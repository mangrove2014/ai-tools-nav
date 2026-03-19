#!/usr/bin/env node
/**
 * 静态网站生成器
 * 从 data/tools.json 生成 HTML 页面
 */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tools.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'dist', 'index.html');

// 确保输出目录存在
if (!fs.existsSync(path.dirname(OUTPUT_FILE))) {
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
}

// 加载工具数据
function loadTools() {
    if (!fs.existsSync(DATA_FILE)) {
        console.log('⚠️ 工具数据文件不存在，创建空文件');
        fs.writeFileSync(DATA_FILE, '[]');
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

// 按分类分组
function groupByCategory(tools) {
    const groups = {};
    tools.forEach(tool => {
        const cat = tool.category || '未分类';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(tool);
    });
    // 按工具数量排序
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
}

// 生成 HTML
function generateHTML(tools) {
    const grouped = groupByCategory(tools);
    const totalTools = tools.length;
    const lastUpdate = new Date().toLocaleDateString('zh-CN');
    
    // AdSense 配置（用户需要替换为自己的）
    const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // 替换为你的 AdSense ID
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 工具导航 - 发现最新人工智能工具 | AI Tools Navigator</title>
    <meta name="description" content="聚合全球最新 AI 工具，包括 AI 写作、AI 绘画、AI 编程、AI 聊天等。每日自动更新，发现最好用的人工智能工具。">
    <meta name="keywords" content="AI工具,人工智能,ChatGPT,AI写作,AI绘画,AI编程,AI导航">
    
    <!-- Open Graph -->
    <meta property="og:title" content="AI 工具导航 - 发现最新人工智能工具">
    <meta property="og:description" content="聚合全球最新 AI 工具，每日自动更新">
    <meta property="og:type" content="website">
    
    <!-- AdSense -->
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --primary: #667eea;
            --primary-dark: #5a67d8;
            --secondary: #764ba2;
            --bg: #f7fafc;
            --card-bg: #ffffff;
            --text: #2d3748;
            --text-light: #718096;
            --border: #e2e8f0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.6;
        }
        
        /* Header */
        .header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            padding: 60px 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }
        
        /* Search */
        .search-section {
            max-width: 600px;
            margin: -25px auto 40px;
            padding: 0 20px;
            position: relative;
            z-index: 10;
        }
        
        .search-box {
            display: flex;
            background: white;
            border-radius: 50px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .search-box input {
            flex: 1;
            border: none;
            padding: 15px 25px;
            font-size: 1rem;
            outline: none;
        }
        
        .search-box button {
            background: var(--primary);
            color: white;
            border: none;
            padding: 15px 30px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
        }
        
        .search-box button:hover {
            background: var(--primary-dark);
        }
        
        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px 40px;
        }
        
        /* Ad Slots */
        .ad-slot {
            background: #f0f0f0;
            border: 2px dashed #ccc;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border-radius: 12px;
            color: #999;
        }
        
        /* Categories */
        .category {
            margin: 40px 0;
        }
        
        .category-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid var(--border);
        }
        
        .category h2 {
            font-size: 1.5rem;
            color: var(--text);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .category-count {
            background: var(--primary);
            color: white;
            font-size: 0.8rem;
            padding: 2px 10px;
            border-radius: 20px;
        }
        
        /* Tools Grid */
        .tools-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .tool-card {
            background: var(--card-bg);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
            border: 1px solid var(--border);
            display: flex;
            flex-direction: column;
        }
        
        .tool-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.12);
            border-color: var(--primary);
        }
        
        .tool-header {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 12px;
        }
        
        .tool-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            object-fit: cover;
            background: var(--bg);
            flex-shrink: 0;
        }
        
        .tool-icon-placeholder {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .tool-title {
            flex: 1;
        }
        
        .tool-title h3 {
            font-size: 1.1rem;
            margin-bottom: 4px;
            color: var(--text);
        }
        
        .tool-source {
            font-size: 0.75rem;
            color: var(--text-light);
            text-transform: uppercase;
        }
        
        .tool-description {
            color: var(--text-light);
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 15px;
            flex: 1;
        }
        
        .tool-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .tool-date {
            font-size: 0.8rem;
            color: var(--text-light);
        }
        
        .tool-link {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.9rem;
            transition: color 0.2s;
        }
        
        .tool-link:hover {
            color: var(--primary-dark);
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-light);
            border-top: 1px solid var(--border);
            margin-top: 40px;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }
            
            .stats {
                gap: 20px;
            }
            
            .tools-grid {
                grid-template-columns: 1fr;
            }
        }
        
        /* Hidden class for search */
        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <header class="header">
        <h1>🤖 AI 工具导航</h1>
        <p>发现最新人工智能工具，每日自动更新。聚合 AI 写作、AI 绘画、AI 编程等各类实用工具。</p>
        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">${totalTools}</div>
                <div class="stat-label">收录工具</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${grouped.length}</div>
                <div class="stat-label">分类</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${lastUpdate}</div>
                <div class="stat-label">最后更新</div>
            </div>
        </div>
    </header>
    
    <div class="search-section">
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="搜索 AI 工具...">
            <button onclick="searchTools()">搜索</button>
        </div>
    </div>
    
    <main class="container">
        <!-- 顶部广告位 -->
        <div class="ad-slot">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${ADSENSE_CLIENT}"
                 data-ad-slot="XXXXXXXXXX"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <p>广告位 - 请替换为你的 AdSense 代码</p>
        </div>
        
        ${grouped.map(([category, tools]) => `
        <section class="category" data-category="${category}">
            <div class="category-header">
                <h2>
                    ${getCategoryIcon(category)}
                    ${category}
                    <span class="category-count">${tools.length}</span>
                </h2>
            </div>
            <div class="tools-grid">
                ${tools.map(tool => `
                <article class="tool-card" data-name="${tool.name.toLowerCase()}" data-desc="${(tool.description || '').toLowerCase()}">
                    <div class="tool-header">
                        ${tool.image 
                            ? `<img src="${tool.image}" alt="${tool.name}" class="tool-icon" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` 
                            : ''}
                        <div class="tool-icon-placeholder" ${tool.image ? 'style="display:none"' : ''}>${tool.name.charAt(0)}</div>
                        <div class="tool-title">
                            <h3>${escapeHtml(tool.name)}</h3>
                            <span class="tool-source">${tool.source || 'unknown'}</span>
                        </div>
                    </div>
                    <p class="tool-description">${escapeHtml(tool.description || '暂无描述')}</p>
                    <div class="tool-footer">
                        <span class="tool-date">${formatDate(tool.date_added)}</span>
                        <a href="${tool.url}" target="_blank" rel="nofollow noopener" class="tool-link">
                            访问网站 →
                        </a>
                    </div>
                </article>
                `).join('')}
            </div>
        </section>
        `).join('')}
        
        <!-- 底部广告位 -->
        <div class="ad-slot">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="${ADSENSE_CLIENT}"
                 data-ad-slot="XXXXXXXXXX"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <p>广告位 - 请替换为你的 AdSense 代码</p>
        </div>
    </main>
    
    <footer class="footer">
        <p>🤖 AI Tools Navigator - 自动采集，每日更新</p>
        <p>数据来源：Product Hunt、GitHub 等</p>
        <p>最后更新：${new Date().toLocaleString('zh-CN')}</p>
    </footer>
    
    <script>
        // 搜索功能
        function searchTools() {
            const query = document.getElementById('searchInput').value.toLowerCase().trim();
            const cards = document.querySelectorAll('.tool-card');
            const categories = document.querySelectorAll('.category');
            
            if (!query) {
                cards.forEach(card => card.classList.remove('hidden'));
                categories.forEach(cat => cat.classList.remove('hidden'));
                return;
            }
            
            cards.forEach(card => {
                const name = card.dataset.name;
                const desc = card.dataset.desc;
                if (name.includes(query) || desc.includes(query)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
            
            // 隐藏没有匹配工具的分类
            categories.forEach(cat => {
                const visibleCards = cat.querySelectorAll('.tool-card:not(.hidden)');
                if (visibleCards.length === 0) {
                    cat.classList.add('hidden');
                } else {
                    cat.classList.remove('hidden');
                }
            });
        }
        
        // 回车搜索
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') searchTools();
        });
        
        // 初始化 AdSense
        (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</body>
</html>`;
}

// 分类图标
function getCategoryIcon(category) {
    const icons = {
        'AI写作': '✍️',
        'AI图像': '🎨',
        'AI视频': '🎬',
        'AI音频': '🎵',
        'AI编程': '💻',
        'AI聊天': '💬',
        'AI搜索': '🔍',
        'AI翻译': '🌐',
        'AI办公': '📄',
        'AI营销': '📈',
        'AI其他': '🤖'
    };
    return icons[category] || '🤖';
}

// HTML 转义
function escapeHtml(text) {
    const div = { toString: () => text };
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

// 主函数
function main() {
    console.log('🔨 开始构建网站...');
    
    const tools = loadTools();
    console.log(`📊 加载了 ${tools.length} 个工具`);
    
    const html = generateHTML(tools);
    fs.writeFileSync(OUTPUT_FILE, html, 'utf-8');
    
    console.log(`✅ 网站构建完成: ${OUTPUT_FILE}`);
    console.log(`📄 文件大小: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(2)} KB`);
}

main();
