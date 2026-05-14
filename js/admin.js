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
  ['posts', 'editor', 'notebooklm', 'nlm-editor', 'about', 'settings'].forEach(t => {
    document.getElementById('tab-' + t).style.display = (t === name) ? '' : 'none';
  });
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (name === 'posts')       loadPostsList();
  if (name === 'notebooklm')  loadNLMList();
  if (name === 'about')       loadAboutEditor();
  if (name === 'settings')    loadConfigToSettings();
}

// ---- 读取文章数据 ----
async function fetchPosts() {
  const res = await fetch(`posts.json?t=${Date.now()}`);
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 404) return { posts: [] };
    throw new Error(`HTTP ${res.status}：${text.slice(0, 80)}`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    // 显示实际收到的内容前80个字符，帮助诊断问题
    throw new Error(`收到内容：${text.slice(0, 80)}`);
  }
}

// ---- 获取文件 SHA（写入时必须）----
async function getFileSHA() {
  const { owner, repo, branch, token } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/posts.json`
            + `?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `获取 SHA 失败 HTTP ${res.status}`);
  }
  return (await res.json()).sha;
}

// ---- UTF-8 字符串转 base64（支持中文，避免大文件崩溃）----
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  // 用循环而非展开运算符，避免大文件时调用栈溢出
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ---- 写入文章数据 ----
async function savePostsJson(postsData, message) {
  const { owner, repo, branch, token } = getConfig();
  const sha = await getFileSHA();
  const body = {
    message,
    content: utf8ToBase64(JSON.stringify(postsData, null, 2)),
    branch,
  };
  if (sha) body.sha = sha;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/posts.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `发布失败 HTTP ${res.status}`);
  }
}

// ---- 加载文章列表 ----
async function loadPostsList() {
  const el = document.getElementById('posts-list');
  el.innerHTML = '<p class="loading-text">加载中...</p>';
  try {
    const content = await fetchPosts();
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
      const content = await fetchPosts();
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
    const data = await fetchPosts();
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
    const data = await fetchPosts();
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

// ---- 关于我 ----
async function loadAboutEditor() {
  try {
    const data = await fetchPosts();
    const a = data.about || {};
    document.getElementById('about-avatar').value   = a.avatar   || '😊';
    document.getElementById('about-name').value     = a.name     || '';
    document.getElementById('about-tagline').value  = a.tagline  || '';
    document.getElementById('about-bio').value      = a.bio      || '';
    document.getElementById('about-hobbies').value  = (a.hobbies || []).join('\n');
    document.getElementById('about-blogname').value = a.blogName || '';
    document.getElementById('about-subtitle').value = a.blogSubtitle || '';
  } catch (err) {
    document.getElementById('about-msg').textContent = '加载失败：' + err.message;
    document.getElementById('about-msg').style.color = '#e74c3c';
  }
}

async function saveAbout() {
  const btnEl = document.getElementById('about-btn-text');
  const msgEl = document.getElementById('about-msg');
  btnEl.textContent = '发布中...';
  msgEl.textContent = '';
  try {
    const data = await fetchPosts();
    data.about = {
      avatar:       document.getElementById('about-avatar').value.trim()  || '😊',
      name:         document.getElementById('about-name').value.trim()     || '你好，我是博主',
      tagline:      document.getElementById('about-tagline').value.trim()  || '',
      bio:          document.getElementById('about-bio').value.trim()      || '',
      hobbies:      document.getElementById('about-hobbies').value.split('\n').map(s => s.trim()).filter(Boolean),
      blogName:     document.getElementById('about-blogname').value.trim() || '我的博客',
      blogSubtitle: document.getElementById('about-subtitle').value.trim() || '',
    };
    await savePostsJson(data, '更新关于我页面');
    msgEl.style.color = 'var(--primary)';
    msgEl.textContent = '✅ 保存成功！页面将在 1~2 分钟内更新';
    btnEl.textContent = '🚀 保存并发布';
  } catch (err) {
    btnEl.textContent = '🚀 保存并发布';
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '❌ 保存失败：' + err.message;
  }
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

// ---- NotebookLM 列表 ----
async function loadNLMList() {
  const el = document.getElementById('nlm-list');
  el.innerHTML = '<p class="loading-text">加载中...</p>';
  try {
    const data = await fetchPosts();
    const items = (data.notebooklm || []).sort((a, b) => b.id - a.id);
    if (!items.length) {
      el.innerHTML = '<p class="empty-tip">还没有 NotebookLM 音频，点"添加音频"开始吧！</p>';
      return;
    }
    el.innerHTML = items.map(item => `
      <div class="admin-post-item">
        <div class="admin-post-info">
          <span class="admin-post-tag">${item.tags && item.tags.length ? item.tags[0] : 'NotebookLM'}</span>
          <h4 class="admin-post-title">${item.title}</h4>
          <span class="admin-post-date">${formatDate(item.date)}</span>
        </div>
        <div class="admin-post-actions">
          <button class="btn-edit" onclick="showNLMEditor('${item.id}')">编辑</button>
          <button class="btn-del" onclick="deleteNLMItem('${item.id}', '${item.title.replace(/'/g,"\\'")}')">删除</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    el.innerHTML = `<p class="err-msg">加载失败：${err.message}</p>`;
  }
}

async function showNLMEditor(id) {
  document.getElementById('tab-notebooklm').style.display = 'none';
  document.getElementById('tab-nlm-editor').style.display = '';
  document.getElementById('nlm-save-msg').textContent = '';

  if (!id) {
    document.getElementById('nlm-editor-title').textContent = '添加音频';
    document.getElementById('nlm-edit-id').value    = '';
    document.getElementById('nlm-edit-title').value = '';
    document.getElementById('nlm-edit-url').value   = '';
    document.getElementById('nlm-edit-desc').value  = '';
    document.getElementById('nlm-edit-tags').value  = '';
    document.getElementById('nlm-edit-date').value  = new Date().toISOString().slice(0, 10);
    document.getElementById('nlm-save-btn-text').textContent = '💾 保存';
  } else {
    document.getElementById('nlm-editor-title').textContent = '编辑音频';
    try {
      const data = await fetchPosts();
      const item = (data.notebooklm || []).find(x => x.id === id);
      if (!item) return;
      document.getElementById('nlm-edit-id').value    = item.id;
      document.getElementById('nlm-edit-title').value = item.title;
      document.getElementById('nlm-edit-url').value   = item.url || '';
      document.getElementById('nlm-edit-desc').value  = item.description || '';
      document.getElementById('nlm-edit-tags').value  = (item.tags || []).join(', ');
      document.getElementById('nlm-edit-date').value  = item.date || '';
      document.getElementById('nlm-save-btn-text').textContent = '💾 保存修改';
    } catch (err) {
      alert('加载失败：' + err.message);
    }
  }
}

async function saveNLMItem() {
  const id    = document.getElementById('nlm-edit-id').value;
  const title = document.getElementById('nlm-edit-title').value.trim();
  const url   = document.getElementById('nlm-edit-url').value.trim();
  const desc  = document.getElementById('nlm-edit-desc').value.trim();
  const tags  = document.getElementById('nlm-edit-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const date  = document.getElementById('nlm-edit-date').value;
  const msgEl = document.getElementById('nlm-save-msg');
  const btnEl = document.getElementById('nlm-save-btn-text');

  if (!title) { msgEl.textContent = '请填写标题'; msgEl.style.color = '#e74c3c'; return; }

  btnEl.textContent = '保存中...';
  msgEl.textContent = '';

  try {
    const data = await fetchPosts();
    const items = data.notebooklm || [];

    if (id) {
      const idx = items.findIndex(x => x.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], title, url, description: desc, tags, date };
      }
    } else {
      items.push({
        id: Date.now().toString(),
        title,
        url,
        description: desc,
        tags,
        date: date || new Date().toISOString().slice(0, 10),
      });
    }

    data.notebooklm = items;
    await savePostsJson(data, id ? `编辑 NotebookLM: ${title}` : `新增 NotebookLM: ${title}`);

    msgEl.style.color = 'var(--primary)';
    msgEl.textContent = '✅ 保存成功！';
    btnEl.textContent = '💾 保存';
    setTimeout(() => showTab('notebooklm', null), 1500);
  } catch (err) {
    btnEl.textContent = '💾 保存';
    msgEl.style.color = '#e74c3c';
    msgEl.textContent = '❌ 保存失败：' + err.message;
  }
}

async function deleteNLMItem(id, title) {
  if (!confirm(`确定要删除《${title}》吗？`)) return;
  try {
    const data = await fetchPosts();
    data.notebooklm = (data.notebooklm || []).filter(x => x.id !== id);
    await savePostsJson(data, `删除 NotebookLM: ${title}`);
    loadNLMList();
  } catch (err) {
    alert('删除失败：' + err.message);
  }
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
