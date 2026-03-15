// =============================================
// 博客管理后台 - 核心逻辑
// =============================================

const STORAGE = {
  TOKEN: 'blog_token',
  PWD:   'blog_pwd',
  OWNER: 'blog_owner',
  REPO:  'blog_repo',
  BRANCH:'blog_branch',
};

const DEFAULT_PWD = 'admin123';

// ---- 初始化 ----
window.addEventListener('DOMContentLoaded', () => {
  const hasConfig = localStorage.getItem(STORAGE.TOKEN);
  const hasPwd    = localStorage.getItem(STORAGE.PWD);

  if (!hasConfig || !hasPwd) {
    showPage('setup');
  } else {
    showPage('login');
  }
});

// ---- 页面切换 ----
function showPage(name) {
  ['login', 'setup', 'admin'].forEach(p => {
    document.getElementById('page-' + p).style.display = (p === name) ? '' : 'none';
  });
}

// ---- 登录 ----
function doLogin(e) {
  e.preventDefault();
  const pwd = document.getElementById('login-pwd').value;
  const saved = localStorage.getItem(STORAGE.PWD) || DEFAULT_PWD;
  if (pwd === saved) {
    showPage('admin');
    loadPostsList();
    loadConfigToSettings();
  } else {
    document.getElementById('login-err').textContent = '密码错误，请重试';
    document.getElementById('login-pwd').value = '';
    document.getElementById('login-pwd').focus();
  }
}

function doLogout() {
  showPage('login');
  document.getElementById('login-pwd').value = '';
  document.getElementById('login-err').textContent = '';
}

// ---- 首次设置 ----
function doSetup() {
  const owner  = document.getElementById('setup-owner').value.trim();
  const repo   = document.getElementById('setup-repo').value.trim();
  const branch = document.getElementById('setup-branch').value.trim();
  const token  = document.getElementById('setup-token').value.trim();
  const pwd    = document.getElementById('setup-pwd').value;
  const errEl  = document.getElementById('setup-err');

  if (!owner || !repo || !branch || !token) {
    errEl.textContent = '请填写所有必填项'; return;
  }
  if (pwd.length < 6) {
    errEl.textContent = '密码至少6位'; return;
  }

  localStorage.setItem(STORAGE.OWNER,  owner);
  localStorage.setItem(STORAGE.REPO,   repo);
  localStorage.setItem(STORAGE.BRANCH, branch);
  localStorage.setItem(STORAGE.TOKEN,  token);
  localStorage.setItem(STORAGE.PWD,    pwd);

  errEl.textContent = '';
  showPage('admin');
  loadPostsList();
  loadConfigToSettings();
}

// ---- 配置获取 ----
function getConfig() {
  return {
    owner:  localStorage.getItem(STORAGE.OWNER)  || '15995836590',
    repo:   localStorage.getItem(STORAGE.REPO)   || 't-z',
    branch: localStorage.getItem(STORAGE.BRANCH) || 'claude/create-blog-website-Xr1lh',
    token:  localStorage.getItem(STORAGE.TOKEN)  || '',
  };
}

// ---- Tab 切换 ----
function showTab(name, btn) {
  ['posts', 'editor', 'settings'].forEach(t => {
    document.getElementById('tab-' + t).style.display = (t === name) ? '' : 'none';
  });
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (name === 'posts') loadPostsList();
  if (name === 'settings') loadConfigToSettings();
}

// ---- GitHub API 调用 ----
async function githubRequest(method, path, body) {
  const { owner, repo, token } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    'Authorization': `token ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json',
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function getFileSHA() {
  try {
    const { branch } = getConfig();
    const data = await githubRequest('GET', `posts.json?ref=${branch}`);
    return { sha: data.sha, content: JSON.parse(atob(data.content.replace(/\n/g, ''))) };
  } catch {
    return { sha: null, content: { posts: [] } };
  }
}

async function savePostsJson(postsData, message) {
  const { branch } = getConfig();
  const { sha } = await getFileSHA();
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(postsData, null, 2))));
  const body = { message, content, branch };
  if (sha) body.sha = sha;
  await githubRequest('PUT', 'posts.json', body);
}

// ---- 加载文章列表 ----
async function loadPostsList() {
  const el = document.getElementById('posts-list');
  el.innerHTML = '<p class="loading-text">加载中...</p>';
  try {
    const { content } = await getFileSHA();
    const posts = (content.posts || []).sort((a, b) => b.id - a.id);

    // 更新分类 datalist
    const cats = [...new Set(posts.map(p => p.category).filter(Boolean))];
    document.getElementById('categories').innerHTML =
      cats.map(c => `<option value="${c}">`).join('');

    if (!posts.length) {
      el.innerHTML = '<p class="empty-tip">还没有文章，点"写新文章"开始吧！</p>';
      return;
    }
    el.innerHTML = posts.map(p => `
      <div class="admin-post-item">
        <div class="admin-post-info">
          <span class="admin-post-tag">${p.category || '未分类'}</span>
          <h4 class="admin-post-title">${p.title}</h4>
          <span class="admin-post-date">${formatDate(p.date)}</span>
        </div>
        <div class="admin-post-actions">
          <button class="btn-edit" onclick="showEditor('${p.id}')">编辑</button>
          <button class="btn-del" onclick="deletePost('${p.id}', '${p.title.replace(/'/g,"\\'")}')">删除</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = `<p class="err-msg">加载失败：${err.message}</p>`;
  }
}

// ---- 显示编辑器 ----
async function showEditor(id) {
  document.getElementById('tab-posts').style.display   = 'none';
  document.getElementById('tab-editor').style.display  = '';
  document.getElementById('tab-settings').style.display = 'none';

  document.getElementById('save-msg').textContent = '';

  if (!id) {
    // 新文章
    document.getElementById('editor-title').textContent = '写新文章';
    document.getElementById('edit-id').value       = '';
    document.getElementById('edit-title').value    = '';
    document.getElementById('edit-category').value = '';
    document.getElementById('edit-date').value     = new Date().toISOString().slice(0, 10);
    document.getElementById('edit-excerpt').value  = '';
    document.getElementById('edit-content').value  = '';
    document.getElementById('save-btn-text').textContent = '🚀 发布文章';
  } else {
    // 编辑已有文章
    document.getElementById('editor-title').textContent = '编辑文章';
    document.getElementById('save-btn-text').textContent = '💾 保存修改';
    try {
      const { content } = await getFileSHA();
      const post = content.posts.find(p => p.id === id);
      if (!post) return;
      document.getElementById('edit-id').value       = post.id;
      document.getElementById('edit-title').value    = post.title;
      document.getElementById('edit-category').value = post.category;
      document.getElementById('edit-date').value     = post.date;
      document.getElementById('edit-excerpt').value  = post.excerpt;
      document.getElementById('edit-content').value  = post.content;
    } catch (err) {
      alert('加载文章失败：' + err.message);
    }
  }
}

// ---- 保存文章 ----
async function savePost() {
  const id      = document.getElementById('edit-id').value;
  const title   = document.getElementById('edit-title').value.trim();
  const cat     = document.getElementById('edit-category').value.trim();
  const date    = document.getElementById('edit-date').value;
  const excerpt = document.getElementById('edit-excerpt').value.trim();
  const content = document.getElementById('edit-content').value.trim();
  const msgEl   = document.getElementById('save-msg');
  const btnEl   = document.getElementById('save-btn-text');

  if (!title)   { msgEl.textContent = '请填写文章标题'; msgEl.style.color = '#e74c3c'; return; }
  if (!content) { msgEl.textContent = '请填写文章正文'; msgEl.style.color = '#e74c3c'; return; }

  btnEl.textContent = '发布中...';
  msgEl.textContent = '';

  try {
    const { content: data } = await getFileSHA();
    const posts = data.posts || [];

    if (id) {
      // 更新
      const idx = posts.findIndex(p => p.id === id);
      if (idx !== -1) {
        posts[idx] = { ...posts[idx], title, category: cat || '未分类', date, excerpt, content };
      }
    } else {
      // 新增
      posts.push({
        id: Date.now().toString(),
        title,
        category: cat || '未分类',
        date: date || new Date().toISOString().slice(0, 10),
        excerpt: excerpt || content.slice(0, 80) + '……',
        content,
      });
    }

    await savePostsJson({ posts }, id ? `编辑文章: ${title}` : `发布文章: ${title}`);

    msgEl.style.color = 'var(--primary)';
    msgEl.textContent = '✅ 发布成功！网站将在 1~2 分钟内更新';
    btnEl.textContent = id ? '💾 保存修改' : '🚀 发布文章';

    setTimeout(() => showTab('posts', document.querySelector('.admin-tab')), 2000);
  } catch (err) {
    btnEl.textContent = id ? '💾 保存修改' : '🚀 发布文章';
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '❌ 发布失败：' + err.message;
  }
}

// ---- 删除文章 ----
async function deletePost(id, title) {
  if (!confirm(`确定要删除文章《${title}》吗？\n\n删除后无法恢复！`)) return;
  try {
    const { content: data } = await getFileSHA();
    const posts = (data.posts || []).filter(p => p.id !== id);
    await savePostsJson({ posts }, `删除文章: ${title}`);
    loadPostsList();
  } catch (err) {
    alert('删除失败：' + err.message);
  }
}

// ---- 预览 ----
function previewPost() {
  const title   = document.getElementById('edit-title').value || '（无标题）';
  const content = document.getElementById('edit-content').value;
  document.getElementById('preview-content').innerHTML =
    `<h1 style="margin-bottom:20px">${title}</h1>` + parseContent(content);
  document.getElementById('preview-modal').style.display = '';
}

function closePreview() {
  document.getElementById('preview-modal').style.display = 'none';
}

// ---- 设置 ----
function loadConfigToSettings() {
  const cfg = getConfig();
  document.getElementById('cfg-owner').value  = cfg.owner;
  document.getElementById('cfg-repo').value   = cfg.repo;
  document.getElementById('cfg-branch').value = cfg.branch;
  document.getElementById('cfg-token').value  = '';
}

function saveConfig() {
  const owner  = document.getElementById('cfg-owner').value.trim();
  const repo   = document.getElementById('cfg-repo').value.trim();
  const branch = document.getElementById('cfg-branch').value.trim();
  const token  = document.getElementById('cfg-token').value.trim();
  if (!owner || !repo || !branch) { alert('请填写完整配置'); return; }
  localStorage.setItem(STORAGE.OWNER,  owner);
  localStorage.setItem(STORAGE.REPO,   repo);
  localStorage.setItem(STORAGE.BRANCH, branch);
  if (token) localStorage.setItem(STORAGE.TOKEN, token);
  alert('✅ 配置已保存');
}

function changePwd() {
  const oldPwd  = document.getElementById('pwd-old').value;
  const newPwd  = document.getElementById('pwd-new').value;
  const confirm = document.getElementById('pwd-confirm').value;
  const msgEl   = document.getElementById('pwd-msg');
  const saved   = localStorage.getItem(STORAGE.PWD) || DEFAULT_PWD;

  if (oldPwd !== saved)     { msgEl.style.color='#e74c3c'; msgEl.textContent='当前密码错误'; return; }
  if (newPwd.length < 6)    { msgEl.style.color='#e74c3c'; msgEl.textContent='新密码至少6位'; return; }
  if (newPwd !== confirm)   { msgEl.style.color='#e74c3c'; msgEl.textContent='两次密码不一致'; return; }

  localStorage.setItem(STORAGE.PWD, newPwd);
  msgEl.style.color = 'var(--primary)';
  msgEl.textContent = '✅ 密码修改成功';
  ['pwd-old','pwd-new','pwd-confirm'].forEach(id => document.getElementById(id).value = '');
}

function clearAll() {
  if (!confirm('确定清除所有设置？需要重新配置才能使用后台。')) return;
  Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
  location.reload();
}

// ---- 工具函数 ----
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

function parseContent(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '', i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i++; continue; }
    if (line.startsWith('## ')) {
      html += `<h2>${esc(line.slice(3))}</h2>`;
    } else if (line.startsWith('> ')) {
      html += `<blockquote>${esc(line.slice(2))}</blockquote>`;
    } else {
      let para = line;
      while (i + 1 < lines.length && lines[i + 1].trim() &&
             !lines[i + 1].trim().startsWith('## ') &&
             !lines[i + 1].trim().startsWith('> ')) {
        i++; para += ' ' + lines[i].trim();
      }
      html += `<p>${esc(para)}</p>`;
    }
    i++;
  }
  return html;
}

function esc(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
           .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
           .replace(/_(.+?)_/g,'<em>$1</em>');
}
