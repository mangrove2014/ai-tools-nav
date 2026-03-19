#!/usr/bin/env python3
"""
AI 工具自动采集脚本
支持：Product Hunt、GitHub Trending
"""
import requests
import json
import os
import re
from datetime import datetime
from urllib.parse import urlparse

DATA_FILE = 'data/tools.json'

def load_existing_tools():
    """加载已有工具数据"""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_tools(tools):
    """保存工具数据"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(tools, f, ensure_ascii=False, indent=2)

def get_existing_urls(tools):
    """获取已存在的 URL 集合"""
    return {tool.get('url', '') for tool in tools}

def auto_categorize(name, description):
    """自动分类工具"""
    text = f"{name} {description}".lower()
    
    categories = {
        'AI写作': ['write', 'content', 'copy', 'blog', 'essay', 'article', 'text', 'writer', 'writing'],
        'AI图像': ['image', 'picture', 'photo', 'art', 'draw', 'design', 'paint', 'sketch', 'logo'],
        'AI视频': ['video', 'movie', 'clip', 'animation', 'film', 'footage'],
        'AI音频': ['audio', 'music', 'voice', 'sound', 'podcast', 'speech', 'sing'],
        'AI编程': ['code', 'program', 'developer', 'git', 'api', 'coding', 'programming'],
        'AI聊天': ['chat', 'chatbot', 'conversation', 'assistant', 'bot', 'talk'],
        'AI搜索': ['search', 'research', 'find', 'discovery'],
        'AI翻译': ['translate', 'translation', 'language', 'interpreter'],
        'AI办公': ['pdf', 'document', 'slide', 'spreadsheet', 'presentation', 'office'],
        'AI营销': ['marketing', 'seo', 'social media', 'ads', 'email marketing'],
    }
    
    for cat, keywords in categories.items():
        if any(kw in text for kw in keywords):
            return cat
    return 'AI其他'

def scrape_product_hunt():
    """从 Product Hunt 抓取 AI 工具"""
    token = os.getenv('PRODUCT_HUNT_TOKEN', '')
    if not token:
        print("⚠️ 未设置 PRODUCT_HUNT_TOKEN，跳过 Product Hunt 采集")
        return []
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    
    query = '''
    {
      posts(first: 20, featured: true, postedAfter: "2024-01-01") {
        edges {
          node {
            id
            name
            tagline
            url
            website
            thumbnail {
              url
            }
            topics {
              edges {
                node {
                  name
                }
              }
            }
            createdAt
          }
        }
      }
    }
    '''
    
    try:
        response = requests.post(
            'https://api.producthunt.com/v2/api/graphql',
            headers=headers,
            json={'query': query},
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        tools = []
        ai_keywords = ['ai', 'artificial intelligence', 'gpt', 'llm', 'machine learning', 
                      'automation', 'chatbot', 'generative', 'neural', 'model']
        
        for edge in data.get('data', {}).get('posts', {}).get('edges', []):
            node = edge['node']
            text = f"{node['name']} {node['tagline']}".lower()
            
            # 判断是否为 AI 工具
            is_ai = any(kw in text for kw in ai_keywords)
            topics = [t['node']['name'].lower() for t in node.get('topics', {}).get('edges', [])]
            is_ai = is_ai or any('artificial intelligence' in t or 'ai' in t for t in topics)
            
            if is_ai:
                website = node.get('website') or node.get('url')
                tools.append({
                    'id': node['id'],
                    'name': node['name'],
                    'description': node['tagline'],
                    'url': website,
                    'image': node.get('thumbnail', {}).get('url', ''),
                    'category': auto_categorize(node['name'], node['tagline']),
                    'source': 'producthunt',
                    'date_added': datetime.now().isoformat(),
                    'featured_date': node.get('createdAt', ''),
                    'topics': [t['node']['name'] for t in node.get('topics', {}).get('edges', [])]
                })
        
        print(f"✅ Product Hunt: 采集到 {len(tools)} 个 AI 工具")
        return tools
        
    except Exception as e:
        print(f"❌ Product Hunt 采集失败: {e}")
        return []

def scrape_github_trending():
    """从 GitHub Trending 抓取 AI 项目（简化版）"""
    # GitHub Trending 没有官方 API，这里用简单方式
    # 实际使用时可以接入 GitHub API 搜索
    
    ai_repos = [
        'chatgpt', 'claude', 'llama', 'stable-diffusion', 'midjourney',
        'openai', 'anthropic', 'langchain', 'autogpt', 'copilot'
    ]
    
    tools = []
    headers = {'Accept': 'application/vnd.github.v3+json'}
    
    for keyword in ai_repos[:3]:  # 限制数量避免 API 限制
        try:
            response = requests.get(
                f'https://api.github.com/search/repositories',
                params={'q': f'{keyword} in:name,description', 'sort': 'updated', 'per_page': 5},
                headers=headers,
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                for repo in data.get('items', []):
                    if repo.get('stargazers_count', 0) > 100:
                        tools.append({
                            'id': f"github_{repo['id']}",
                            'name': repo['name'],
                            'description': repo.get('description', 'No description')[:100],
                            'url': repo['html_url'],
                            'image': '',
                            'category': auto_categorize(repo['name'], repo.get('description', '')),
                            'source': 'github',
                            'date_added': datetime.now().isoformat(),
                            'stars': repo.get('stargazers_count', 0),
                            'language': repo.get('language', '')
                        })
        except Exception as e:
            print(f"⚠️ GitHub 搜索 {keyword} 失败: {e}")
    
    print(f"✅ GitHub: 采集到 {len(tools)} 个 AI 项目")
    return tools

def deduplicate_tools(existing_tools, new_tools):
    """去重合并"""
    existing_urls = get_existing_urls(existing_tools)
    added = 0
    
    for tool in new_tools:
        url = tool.get('url', '')
        # 标准化 URL 进行比较
        normalized = re.sub(r'https?://(www\.)?', '', url).rstrip('/')
        
        is_duplicate = any(
            re.sub(r'https?://(www\.)?', '', u).rstrip('/') == normalized 
            for u in existing_urls if u
        )
        
        if not is_duplicate and url:
            existing_tools.append(tool)
            added += 1
    
    return existing_tools, added

def main():
    print(f"🚀 开始采集 AI 工具 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 加载已有数据
    existing_tools = load_existing_tools()
    print(f"📊 已有工具: {len(existing_tools)} 个")
    
    # 采集新数据
    new_tools = []
    new_tools.extend(scrape_product_hunt())
    new_tools.extend(scrape_github_trending())
    
    # 去重合并
    all_tools, added = deduplicate_tools(existing_tools, new_tools)
    
    # 保存
    save_tools(all_tools)
    
    print(f"✨ 完成！新增 {added} 个工具，总计 {len(all_tools)} 个")
    
    # 输出统计
    categories = {}
    for tool in all_tools:
        cat = tool.get('category', '未分类')
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\n📈 分类统计:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")

if __name__ == '__main__':
    main()
