// =============================================
// 博客交互功能 - JavaScript
// =============================================

// --- 深色/浅色模式切换 ---
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// 从本地存储读取之前的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  body.classList.add('dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  const isDark = body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// --- 搜索功能 ---
function searchPosts() {
  const keyword = document.getElementById('searchInput').value.trim();
  if (!keyword) {
    alert('请输入搜索关键词');
    return;
  }

  // 定义文章数据（实际使用时可以在这里添加更多文章）
  const posts = [
    { title: '我为什么开始写博客？', url: 'post1.html', tags: ['生活随笔', '写作', '博客'] },
    { title: '《活着》读后感：在苦难中寻找意义', url: 'post2.html', tags: ['读书笔记', '余华', '活着'] },
    { title: '周末短途游：去了一个让人心旷神怡的地方', url: 'post3.html', tags: ['旅行游记', '周末', '短途游'] },
    { title: 'Reddit热帖解析：5条美股&AI爆款帖子改写成X平台风格', url: 'post4.html', tags: ['投资分析', '美股', 'AI', 'Reddit', 'X平台'] },
  ];

  const results = posts.filter(p =>
    p.title.includes(keyword) || p.tags.some(t => t.includes(keyword))
  );

  if (results.length === 0) {
    alert(`没有找到与"${keyword}"相关的文章`);
  } else {
    const resultText = results.map(r => `• ${r.title}`).join('\n');
    const go = confirm(`找到 ${results.length} 篇相关文章：\n\n${resultText}\n\n点击确定跳转到第一篇`);
    if (go) {
      window.location.href = results[0].url;
    }
  }
}

// 按 Enter 键触发搜索
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchPosts();
  });
}

// --- 评论功能 ---
function submitComment(event) {
  event.preventDefault();

  const form = event.target;
  const name = form.querySelector('input[type="text"]').value.trim();
  const text = form.querySelector('textarea').value.trim();

  if (!name || !text) return;

  const commentsList = document.getElementById('comments-list');

  // 创建评论元素
  const comment = document.createElement('div');
  comment.style.cssText = `
    padding: 16px;
    background: var(--bg);
    border-radius: 10px;
    margin-bottom: 12px;
    border: 1px solid var(--border);
    animation: fadeIn 0.3s ease;
  `;

  const now = new Date();
  const timeStr = `${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`;

  comment.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong style="color:var(--primary);">😊 ${name}</strong>
      <span style="font-size:0.8rem; color:var(--text-muted);">${timeStr}</span>
    </div>
    <p style="color:var(--text-light); font-size:0.95rem; line-height:1.7; margin:0;">${text}</p>
  `;

  commentsList.insertBefore(comment, commentsList.firstChild);

  // 清空表单
  form.querySelector('input[type="text"]').value = '';
  form.querySelector('textarea').value = '';

  // 提示
  const tip = document.createElement('p');
  tip.textContent = '评论发布成功！';
  tip.style.cssText = 'color: var(--primary); font-size:0.9rem; margin-bottom:12px;';
  commentsList.insertBefore(tip, commentsList.firstChild);
  setTimeout(() => tip.remove(), 3000);
}

// --- 阅读进度条 ---
// 仅在文章页面显示
if (document.querySelector('.post-content')) {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 64px;
    left: 0;
    width: 0%;
    height: 3px;
    background: var(--primary);
    z-index: 999;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = Math.min(progress, 100) + '%';
  });
}

// --- 返回顶部按钮 ---
const backToTop = document.createElement('button');
backToTop.innerHTML = '↑';
backToTop.title = '返回顶部';
backToTop.style.cssText = `
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 44px;
  height: 44px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 999;
`;
document.body.appendChild(backToTop);

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.style.opacity = '1';
    backToTop.style.transform = 'translateY(0)';
  } else {
    backToTop.style.opacity = '0';
    backToTop.style.transform = 'translateY(10px)';
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- 图片懒加载占位（预留功能）---
// 当你以后想添加图片时，可以在这里处理
