# NOW.md

## 当前阶段（2026-11-12）

- **项目路径**：`/Users/dake/Projects/aiapp/30_products/contractor-fx-comparator/`（已迁入 `30_products/` 正式产品仓）
- **线上站点**：`https://contractorfx.com`，Cloudflare Worker 已部署，版本 `e4a15f92-55da-4268-9cd7-c01ab4abe08a`。Zone `102de3b1af4b76feef4793ac430604f9`（`contractorfx.com`）状态 `active`。Email Routing 为 `enabled: true`、`status: ready`：`hello@contractorfx.com` 与 `privacy@contractorfx.com` 转发到 `liqi199315@gmail.com`，MX、SPF、DKIM 已锁定，并有 `_dmarc` TXT。
- **90 天试验窗口**：`2026-11-12` 至 `2027-02-10`（详见 `PLAN_90DAY.md`）
- **主关键词**：`wise vs payoneer calculator`
- **当前流量与转化基线**：统计通道已接通。`ga4-report.mjs`、`gsc-report.mjs`、`bing-report.mjs` 与 `analytics-registry.test.mjs` 均退出码 `0`。点击与事件的具体数字不写进本文，以当次报告为准。
- **GA4**：属性 ID `564010676`，数据流 ID `16325680671`，Measurement ID `G-BMWC0P9PW2`；`payout_calc_export` 已设为关键事件，保留期 14 个月，站内搜索和表单增强衡量已关闭。
- **GSC**：`sc-domain:contractorfx.com` DNS 验证成功，服务账号和 `liqi199315@gmail.com` 均为所有者；`https://contractorfx.com/sitemap-index.xml` 已提交，Google 返回待处理。
- **Bing Webmaster Tools**：`IsVerified: true`（Cloudflare 未代理的 `verify.bing.com` CNAME）。站点地图 `https://contractorfx.com/sitemap-index.xml` 已通过 `SubmitFeed` 提交。
- **共享统计登记**：`../../40_shared/analytics-sites.yaml` 键名 `contractorfx`，`ga4_property_id: "564010676"`，Measurement ID `G-BMWC0P9PW2`，`sc-domain:contractorfx.com`，站点 `https://contractorfx.com/`。
- **IndexNow**：已提交 9 个 URL，HTTP `202`。
- **代码仓库**：私有仓库 `https://github.com/liqi199315/contractor-fx-comparator`。

## 已就绪资产清单

- **计算与比较类型契约（`src/lib/types.ts`）**：定义 `BillingCurrency`、`PayoutCurrency`、`FundingMethod`、`FeeBearer`、`ProviderId`（wise / payoneer / deel / remote / swift-wire）、`PayoutScenarioInput`、`ProviderQuote`、`ComparisonSummary`、`BatchCsvRowResult`、`BatchAuditResult`、`FxRoutePreset` 等强类型结构。
- **透明费率计算与 CSV 审计引擎（`src/lib/fx-engine.ts`、`src/lib/sample-csv.ts`）**：建模 Wise Business、Payoneer、Deel、Remote、传统 SWIFT 电汇的月度席位费、入金通道费、固定提现费与汇率点差损耗，支持单笔及 12 个月多承包商折算、零上传团队 CSV 批量审计与 CFO 级 Markdown/CSV 备忘录导出。
- **9 个静态内容路由（6 个工具页 + 3 个联盟合规信任页）**：
  1. `/`（Wise vs Payoneer 综合国际结算计算器，默认 3,500 USD -> INR）
  2. `/wise-vs-payoneer-fee-calculator/`（Wise vs Payoneer 细分手续费对比，默认 2,000 USD -> PHP）
  3. `/deel-vs-remote-contractor-calculator/`（Deel vs Remote 承包商成本对比，默认 4,500 USD -> BRL，5 人团队）
  4. `/deel-vs-wise-contractor-payouts/`（Deel vs Wise 团队薪酬支出对比，默认 5,000 USD -> EUR，8 人团队）
  5. `/deel-withdrawal-fee-calculator/`（Deel 提现与汇率损耗计算器，默认 3,000 USD -> MXN 电汇）
  6. `/batch-contractor-payout-csv-audit/`（团队批量薪酬 CSV 隐形磨损审计，默认 6 人跨国团队）
  7. `/about/`（编辑政策与费率建模方法论：公开费率来源、中间价点差公式、季度复核机制、非官方关联声明与 `hello@contractorfx.com` 联系方式）
  8. `/privacy/`（零上传隐私保证：明确账单与团队 CSV 永不离开浏览器、匿名化 GA4 事件策略、GDPR 与 CCPA/CPRA 披露）
  9. `/terms/`（使用条款与免责声明：非财务/税务/法律建议声明、实时通道与 KYC 分层费率差异说明、FTC `16 CFR Part 255` 联盟披露规范）
- **独立 Node ESM CLI（`bin/contractor-fx.mjs`、`src/cli.ts`）**：使用 `esbuild` 打包（`npm run build:cli` 挂载于 `npm run build`），支持单走廊费率测算（`--amount`、`--billing`、`--payout`、`--funding`、`--contractors`）、团队 CSV 批量损耗审计（`--csv`）、table/md/json 格式化输出及 `contractorfx.com` 交互引导，并在 `package.json` 注册 `bin` 字段。
- **光栅化社交卡片与双 IndexNow 密钥（`public/`）**：由 `scripts/render-social-cards.mjs` 调用 Playwright 渲染生成 1200x630 `public/og-image.png` 与 1280x640 `public/github-social-preview.png`，保留 `og-image.svg`；创建 `public/b7e3d1c84a924f508c6e23b9a1d05e42.txt` 对齐根路径探测。
- **生产级静态资产与构建后 SEO 门禁（`scripts/seo-preflight.mjs`）**：默认基准域名 `https://contractorfx.com`，全量校验 9 个内容路由与 11 个辅助产物（`404.html`、`sitemap-index.xml`、`robots.txt`、`llms.txt`、`_headers`、`og-image.svg`、`og-image.png`、`github-social-preview.png`、`site.webmanifest`、`indexnow-key.txt`、`b7e3d1c84a924f508c6e23b9a1d05e42.txt`）、PNG 8 字节魔数与 >5KB 大小校验、双 key 一致性、`_headers` 预览域名 `X-Robots-Tag: noindex` 拦截、唯一 `<title>` 与 `<meta name="description">`、精确 canonical、`og:image` 指向 PNG、JSON-LD 结构化数据、全站内部链接可达性，以及零占位符与零长短破折号。
- **自动化测试闭环（Vitest + Playwright）**：27 项 Vitest 单元测试全绿（覆盖费率公式、CSV 解析与 CLI 命令分支）；6 条 Playwright E2E 路径全绿（覆盖计算器联动、Markdown 导出、零网络请求 CSV 审计、非法 CSV 恢复、GA4 `dataLayer` 去标识化事件与 `375x812` 移动端信任页导航）。
- **冷启动分发与合规申请手册（`LAUNCH_KIT.md`、`LAUNCH_CHECKLIST.md`、`PLAN_90DAY.md`）**：提供 X 25 秒视频脚本与无外链发帖模板、3 组高意图痛点布尔检索词与高价值回复话术、HN Show HN 事实备忘、Reddit 深度干货拆解、目录站提交文案、Wise/Deel 申请陈词，并关联 `_ops/research/indie-site-workflow-20261112/tools/cf-zone-bootstrap.mjs` 自动化建站脚本。
- **敏感文件拦截守卫（`.gitignore`）**：显式拦截 `.env`、`.env.*`（保留 `!.env.example`）、`.dev.vars`、`.dev.vars.*` 与 `*.pem`。

## 等待站长完成的清单（`[人工]`）

1. **社区冷启动**：按 `LAUNCH_KIT.md` 用站长账号发布 Show HN、Reddit、X、Product Hunt。不要代发。
2. **P2-1（预估 30 分钟）**：凭已上线的 `/about/`、`/privacy/`、`/terms/` 与 `hello@contractorfx.com`，使用 `LAUNCH_KIT.md` 第 5 节陈词提交 Wise Partnerize 与 Deel Affiliate 官方伙伴申请（详见 `LAUNCH_CHECKLIST.md` 第 6 节）。

## 下一步第一动作

- 站长按 `LAUNCH_KIT.md` 发布 Show HN、Reddit、X、Product Hunt，并提交 Wise Partnerize 与 Deel Affiliate 申请。GSC 站点地图处理结果仍为待处理，不阻塞这两项。

## 行动记录

- `2026-11-12` `[AI]`：核对 Email Routing（Zone `102de3b1af4b76feef4793ac430604f9`，`enabled: true`，`status: ready`，`hello@contractorfx.com` 与 `privacy@contractorfx.com` 转发至 `liqi199315@gmail.com`，MX、SPF、DKIM 锁定，`_dmarc` TXT）、Bing Webmaster Tools（`IsVerified: true`，`SubmitFeed` 已提交 `https://contractorfx.com/sitemap-index.xml`）与共享统计登记（`analytics-sites.yaml` 的 `contractorfx`）。`ga4-report.mjs`、`gsc-report.mjs`、`bing-report.mjs`、`analytics-registry.test.mjs` 退出码均为 `0`。剩余人工项为社区发布与联盟申请。
- `2026-11-12` `[AI]`：部署生产 Worker，自定义域名生效；构建、发布预检及 SEO 检查通过，六种搜索机器人线上 HTTP `200`，www HTTP `301`。完成 GA4 和 GSC 配置、提交站点地图和 IndexNow；GSC 处理结果及流量尚待核对。

- `2026-11-12` `[AI]`：完成 MVP 核心计算引擎、6 个工具路由、基础预检脚本与 4 条 Playwright 测试初始化。
- `2026-11-12` `[AI]`：完成正式化升级（`30_products/contractor-fx-comparator` + `https://contractorfx.com`），新增 Wise/Deel 联盟审核级信任页（`/about/`、`/privacy/`、`/terms/`），升级 `scripts/seo-preflight.mjs` 覆盖 9 路由 + 8 静态产物 + JSON-LD + `og:image`，扩充 `tests/e2e/comparator.spec.ts` 至 6 条用例，并编写 `LAUNCH_CHECKLIST.md`。
- `2026-11-12` `[AI]`：完成生产加固。使用 Playwright 离线光栅化生成 1200x630 `og-image.png` 与 1280x640 `github-social-preview.png` 并更新 `BaseLayout.astro`；在 `.gitignore` 补充 `.env*`、`.dev.vars*`、`*.pem` 密钥拦截；部署双 IndexNow key 文件；通过 `esbuild` 打包 `bin/contractor-fx.mjs` 并编写 11 项 Vitest CLI 专项测试；升级 `README.md` 与 `LAUNCH_KIT.md`；`npm run verify:all` 验收全绿。
- `2026-11-12` `[AI]`：上线后最佳实践巡检收口：`wrangler.jsonc` 关闭 `workers_dev` 与 `preview_urls` 并重部署（Version `5b36b204-e26c-4964-ab27-f34992e4d8cb`，真网验证 `contractor-fx-comparator.liqi199315.workers.dev` 已返回 HTTP `404`）；`public/_headers` 补齐完整 `Content-Security-Policy` 并清理无效域名行；通过 GA4 Admin API 注册 `format`、`billing`、`payout` 三个自定义维度与 `row_count` 自定义指标；通过 `gh repo edit` 补齐 GitHub 仓库主页、简介与 10 个 Topics，并同步 `PLAN_90DAY.md` 状态。
