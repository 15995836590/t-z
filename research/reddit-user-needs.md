# 「个人博客 / 写作平台」用户痛点调研

> 调研方向：个人博客 & 写作平台用户痛点
> 调研时间：2026-05-11
> 数据来源：Reddit 相关讨论（r/Blogging、r/Substack、r/writing、r/SideProject 等）以及 Hacker News、DEV.to、Medium、Substack、ResetEra 上对这些讨论的转述与延伸文章
> 说明：Reddit 站点对自动化抓取返回 403，下文采取"Web 搜索 + 二次来源"方式收集证据，每条痛点附 1–3 个可点击溯源链接。

---

## 一、心理与坚持类（最高频）

### 1. 写了没人看，越写越没动力
新博主普遍卡在"零读者"阶段几个月，挫败感是首要劝退原因。
"Every blogger begins with zero readers"——这是被反复引用的一句话。
- [Blog Tyrant: No One Reads My Blog](https://www.blogtyrant.com/no-one-reads-my-blog/)
- [Writing Cooperative: 10 Reasons No One is Reading Your Blog](https://writingcooperative.com/9-reasons-no-one-is-reading-your-blog-and-how-to-change-it-112e496606f8)
- [Writing Revolt: 7 Reasons Why No One Reads or Shares Your Blog Posts](https://www.writingrevolt.com/why-no-one-reads-shares-blog-posts/)

### 2. 博主倦怠（blogger burnout）
长期"喂内容"导致情绪和身体透支，是退坑的第二大原因。被描述为"chronic stress leading to physical, emotional, and mental exhaustion"。
- [Productive Blogging: 22 ways to avoid blogger burnout](https://www.productiveblogging.com/avoid-blogger-burnout/)
- [Productive Pixie: Why I Quit Blogging (2 年回顾)](https://www.theproductivepixie.com/2024/06/why-I-quit-blogging.html)
- [Stray Curls: What To Do When You Want to Quit Blogging](https://www.straycurls.com/blogger-burnout/)

### 3. 多平台分发疲劳
IG / Pinterest / TikTok / 邮件列表 / 博客同时维护，时间被切碎。"Stretching oneself too thin"是高频表达。
- [Leaf and Paw: Why I Have Stopped Blogging](https://leafandpaw.com/2023/02/01/why-i-have-stopped-blogging-life-update/)

### 4. 算法变化抹平自然流量
有博主 2020 年月流量 20w+，TikTok/Reels 起来后流量腰斩，加上内容被盗，直接放弃。
- [Mikayla Taylor: Why I Quit Blogging](https://mikaylataylor.com/why-i-quit-blogging/)

---

## 二、平台体验类（Medium / Substack / Ghost）

### 5. Medium 付费墙 + 算法双杀
90% 的 Medium 作者月入低于 100 美元；新作者好文章被付费墙锁住后没有冷启动机会，"sitting at 3 views after a month"。
- [Medium: Algorithm Punishes 90% of Writers in 2026](https://medium.com/write-a-catalyst/mediums-algorithm-punishes-90-of-writers-in-2026-and-the-10-are-doing-this-1-thing-differently-b76b399edb39)
- [cdevn: Why Medium Actually Sucks](https://www.cdevn.com/why-medium-actually-sucks/)
- [DEV.to: Why Medium Actually Sucks](https://dev.to/taillogs/why-medium-actually-sucks-203)

### 6. Medium 把出版商往付费墙赶
freeCodeCamp 被强推付费墙被拒后据称遭法律威胁，引发大量开发者作者出走。
- [DEV.to: Why Medium Actually Sucks（社区讨论转述）](https://dev.to/taillogs/why-medium-actually-sucks-203)

### 7. Substack 长得"千篇一律"
极简到病态，作者无法调整 layout，每个 newsletter 几乎长一个样。
- [becomeawritertoday: Substack vs Medium](https://becomeawritertoday.com/substack-vs-medium/)
- [annabyang: I Publish on Substack, Ghost, and Kit](https://blog.annabyang.com/publish-substack-ghost-kit/)

### 8. Substack 内容审核 + Tate 事件
作者群发起"April 18 blackout"抗议平台对极端内容的纵容；老用户对方向不满。
- [Techdirt: A Newsletter Writer Reflects On Leaving Substack](https://www.techdirt.com/2025/04/11/a-newsletter-writer-reflects-on-leaving-substack/)
- [fafonewscast: Substack Has a Tate Problem](https://fafonewscast.substack.com/p/substack-has-a-tate-problem-and-writers)

### 9. Ghost 自托管门槛高 + Pro 贵
免费版对非技术写作者过于陌生；从 Substack 迁过来"一个人扛不动"。
- [Howuku: WordPress vs Substack vs Ghost vs Medium](https://howuku.com/blog/wordpress-vs-substack-vs-ghost-vs-medium)

### 10. "不拥有受众"焦虑
Medium / Substack 都不是真正属于自己的邮件列表，平台一动受众就没。
- [Mr. Plan ₿: Medium vs Substack vs Ghost in 2025](https://medium.com/mr-plan-publication/medium-vs-substack-vs-ghost-in-2025-922053370a1d)

---

## 三、技术与工具类（开发者博主）

### 11. Jekyll / Hexo / Hugo 折腾成本
- Jekyll 依赖 Ruby 环境，gem 装机问题多，build 速度慢；
- Hexo 部署到 GitHub Pages 时图片不显示是典型坑；
- Hugo 速度极快但有命令行学习曲线。
- [draft.dev: Hugo vs Jekyll in 2026](https://draft.dev/learn/hugo-vs-jekyll)
- [10xdev: Jekyll vs Hugo vs Hexo](https://10xdev.blog/jekyll-hugo-hexo/)
- [EastonDev: 2025 Blog Framework Guide](https://eastondev.com/blog/en/posts/dev/20251123-blog-framework-guide/)

### 12. 静态博客天然没评论 / 没互动
"static site generators lack interactive engagement tools"。Disqus 又重又有跟踪器；自托管 Commento / Remark42 / Isso 又变成新的运维坑。
- [Hacker News: Best Self Hosted Comment System?](https://news.ycombinator.com/item?id=18308087)
- [Hacker News: Self-host comments on a static blog](https://news.ycombinator.com/item?id=23095273)
- [Hacker News: Open-source self-hosted comments systems for static websites](https://news.ycombinator.com/item?id=24676152)
- [ourcodeworld: Top 7 Self-Hosted Comment Systems](https://ourcodeworld.com/articles/read/1265/top-7-best-open-source-self-hosted-comment-system-alternatives-to-disqus)

---

## 四、分发与发现类

### 13. SEO 周期长，等不起
"没有 6 个月时间慢慢等" —— indie / 自由职业者对长期 SEO 的反复抱怨。
- [Hostinger: Reddit SEO Guide](https://www.hostinger.com/tutorials/reddit-seo-guide)
- [Otter PR: 10 Reddit SEO Strategies](https://otterpr.com/reddit-seo/)
- [Dorik: Reddit SEO Tips](https://dorik.com/blog/reddit-seo-tips)

### 14. 发现渠道断层 + RSS 不再普及
"今天读者不再 Google 你的名字；他们问 AI 助手、在 Medium 里搜、刷 Substack 推荐。"老读者怀念 RSS 时代但找不到回去的路。
- [Medium: When the Website Stopped Being Home](https://medium.com/@thecuriouscorner/when-the-website-stopped-being-home-a1bd50b2a230)
- [ResetEra: We should bring back personal websites](https://www.resetera.com/threads/we-should-bring-back-personal-websites.299597/)
- [krishafromtheisland: Why Don't People Keep Blogs Anymore?](http://www.krishafromtheisland.com/2019/04/why-dont-people-keep-blogs-anymore.html)
- [Is Blogging Dead in 2024? - The Creative Impact](https://thecreativeimpact.com/bloggingdead/)

---

## 五、对本项目（t-z 博客 + CMS）的启发

当前 repo 是 GitHub Pages + posts.json + 简易 CMS，已经无意中踩到了几个真实痛点：

| 痛点编号 | 当前项目契合度 | 可继续做的方向 |
|---|---|---|
| **#11 折腾成本** | ✅ 已用纯网页 CMS 替代本地构建 | 把"零环境、纯网页发布"做成 landing 卖点 |
| **#12 评论缺失** | ⚠️ 静态站，目前无评论 | 接入 giscus（GitHub Discussions）或 Utterances（GitHub Issues），零运维补上互动 |
| **#10 不拥有受众** | ✅ 内容存自己 repo / 自己域名 | 加 RSS 输出 + 邮件订阅入口，强化"内容主权"叙事 |
| **#1 没人看** | ⚠️ 通病 | 不是产品能直接解决的，但可考虑文章模板/写作提示降低启动摩擦 |
| **#14 发现渠道断层** | ⚠️ | 提供 RSS、sitemap、OG 标签默认开启，让内容可被各类聚合工具/AI 抓到 |

---

## 六、可继续验证的下一步

1. 直接到 Reddit 网页（人工浏览）抓取 r/Blogging、r/Substack、r/SideProject 的高赞原帖原话，补充直接引语；
2. 选 2–3 个最贴近本项目的痛点（建议 #11、#12、#10），各找 5+ 条用户原话做需求验证；
3. 对照 Hexo / Jekyll / Ghost 的官方 issue tracker 找高频负面反馈，补充技术侧痛点。
