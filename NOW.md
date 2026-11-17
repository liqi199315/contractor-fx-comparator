# NOW.md

## 当前阶段（2026-11-15）

- **项目路径**：`/Users/dake/Projects/aiapp/30_products/contractor-fx-comparator/`（已迁入 `30_products/` 正式产品仓）
- **线上站点**：`https://contractorfx.com`。2026-11-12 部署记录里的 Worker 版本是 `e4a15f92-55da-4268-9cd7-c01ab4abe08a`。2026-11-15 上线时线上 `/release.json` 的 commit 与部署时 `git rev-parse HEAD` 一致，`npm run release:check` 输出 `match`；14 条路由全部 HTTP 200，页面含 `G-BMWC0P9PW2`。Worker Version ID 以 `npx wrangler deployments list` 为准。Zone `102de3b1af4b76feef4793ac430604f9`（`contractorfx.com`）状态 `active`。Email Routing 为 `enabled: true`、`status: ready`：`hello@contractorfx.com` 与 `privacy@contractorfx.com` 转发到 `liqi199315@gmail.com`，MX、SPF、DKIM 已锁定，并有 `_dmarc` TXT。
- **代码提交（2026-11-15 上线）**：`main` 已 rebase 到远端 `aa20438`（GA4 `payout_calc_result` 事件）之上，本地提交为 `30cf4e6` 发布清单与 404 品牌、`10ca4e6` 最终文档，均已 push 到 `origin/main`。rebase 后 `npm run verify:all` 退出码 `0`（Vitest 39/39、Playwright 7/7）。
- **GA4 注入事故与修复（2026-11-15）**：本轮第一次部署漏了 `PUBLIC_GA4_MEASUREMENT_ID`，线上页面落成 `G-PENDING000` 占位符，而 `release:check` 仍报匹配（清单读的是注册表，不是构建产物）。已用 `PUBLIC_SITE_URL=https://contractorfx.com PUBLIC_GA4_MEASUREMENT_ID=G-BMWC0P9PW2` 重建并重新部署；共享清单脚本新增“每个构建 HTML 必须含注册表 measurement ID”的强制校验，测试 10/10。今后构建必须显式带环境变量。
- **90 天试验窗口**：`2026-11-12` 至 `2027-02-10`（详见 `PLAN_90DAY.md`）
- **主关键词**：`wise vs payoneer calculator`
- **当前流量与转化基线**：统计通道已接通。`ga4-report.mjs`、`gsc-report.mjs`、`bing-report.mjs` 与 `analytics-registry.test.mjs` 均退出码 `0`。点击与事件的具体数字不写进本文，以当次报告为准。
- **GA4**：属性 ID `564010676`，数据流 ID `16325680671`，Measurement ID `G-BMWC0P9PW2`；`payout_calc_export` 已设为关键事件，保留期 14 个月，站内搜索和表单增强衡量已关闭。
- **GSC**：`sc-domain:contractorfx.com` DNS 验证成功，服务账号和 `liqi199315@gmail.com` 均为所有者；`https://contractorfx.com/sitemap-index.xml` 已提交，Google 返回待处理。
- **Bing Webmaster Tools**：`IsVerified: true`（Cloudflare 未代理的 `verify.bing.com` CNAME）。站点地图 `https://contractorfx.com/sitemap-index.xml` 已通过 `SubmitFeed` 提交。
- **共享统计登记**：`../../40_shared/analytics-sites.yaml` 键名 `contractorfx`，`ga4_property_id: "564010676"`，Measurement ID `G-BMWC0P9PW2`，`sc-domain:contractorfx.com`，站点 `https://contractorfx.com/`。
- **线上路由（2026-11-15）**：线上 `sitemap-index.xml` 与本地一致，都是 14 个 URL。五个长尾页（`/fx-markup-calculator/`、`/payoneer-fees-calculator-india/`、`/wise-vs-payoneer-philippines/`、`/fiverr-payoneer-withdrawal-fee/`、`/upwork-withdrawal-fee-payoneer/`）均为线上 HTTP `200`。这不等于证明线上 commit 是仓内任何本地 commit。
- **发布清单**：主会话最终 `npm run verify:all` 退出码 `0`（Vitest 33/33、Playwright 7/7、14 个内容路由、12 个附属产物）。`npm run release:check` 退出码 `0`，状态 `pending_live_manifest`。线上没有 `release.json`，因此任何本地 commit 都未证明已上线；这不是路由不一致。本地 C01 commit 是 `bb06221`（`bb062211ab5632a79bff2d68b0d313517d3d597a`，`chore: align release manifest and 404 branding`），不是 `00e73b4`。404 品牌修复已包含在 `bb06221`，不在工作区。记录该事实的文档提交不证明上线。上文 Worker 版本 `e4a15f92-55da-4268-9cd7-c01ab4abe08a` 是 2026-11-12 的部署记录，本次没有重新核对。
- **IndexNow**：2026-11-12 已提交当时 9 个 URL，HTTP `202`。后来上线的 5 个长尾 URL 还没有再次提交。
- **代码仓库**：公开仓库 `https://github.com/liqi199315/contractor-fx-comparator`（`gh repo view`：`visibility=PUBLIC`、`isPrivate=false`，2026-11-15 核实）。`package.json` 的 `"private": true` 只表示 npm 不发布，不是仓库可见性。

## 已就绪资产清单

- **计算与比较类型契约（`src/lib/types.ts`）**：定义 `BillingCurrency`、`PayoutCurrency`、`FundingMethod`、`FeeBearer`、`ProviderId`（wise / payoneer / deel / remote / swift-wire）、`PayoutScenarioInput`、`ProviderQuote`、`ComparisonSummary`、`BatchCsvRowResult`、`BatchAuditResult`、`FxRoutePreset` 等强类型结构。
- **透明费率计算与 CSV 审计引擎（`src/lib/fx-engine.ts`、`src/lib/sample-csv.ts`）**：建模 Wise Business、Payoneer、Deel、Remote、传统 SWIFT 电汇的月度席位费、入金通道费、固定提现费与汇率点差损耗，支持单笔及 12 个月多承包商折算、零上传团队 CSV 批量审计与 CFO 级 Markdown/CSV 备忘录导出。
- **20 个静态内容路由（17 个工具页 + 3 个联盟合规信任页）**：
  1. `/`（Wise vs Payoneer 综合国际结算计算器，默认 3,500 USD -> INR）
  2. `/wise-vs-payoneer-fee-calculator/`（Wise vs Payoneer 细分手续费对比，默认 2,000 USD -> PHP）
  3. `/deel-vs-remote-contractor-calculator/`（Deel vs Remote 承包商成本对比，默认 4,500 USD -> BRL，5 人团队）
  4. `/deel-vs-wise-contractor-payouts/`（Deel vs Wise 团队薪酬支出对比，默认 5,000 USD -> EUR，8 人团队）
  5. `/deel-withdrawal-fee-calculator/`（Deel 提现与汇率损耗计算器，默认 3,000 USD -> MXN 电汇）
  6. `/batch-contractor-payout-csv-audit/`（团队批量薪酬 CSV 隐形磨损审计，默认 6 人跨国团队）
  7. `/fx-markup-calculator/`（汇率加点公式页，默认 1,000 USD -> EUR。公式 spread = (mid rate - actual rate) / mid rate）
  8. `/payoneer-fees-calculator-india/`（印度收款人 USD -> INR。Payoneer India 公开带宽 1% 至 4%，核验日 2026-11-13）
  9. `/wise-vs-payoneer-philippines/`（菲律宾 VA 收款人页，默认 1,200 USD -> PHP）
  10. `/fiverr-payoneer-withdrawal-fee/`（Fiverr 提到 Payoneer Account 的公开手续费 $3.00。本地币银行转账两篇帮助文章不一致，因此不自动填数）
  11. `/upwork-withdrawal-fee-payoneer/`（Upwork 到 Payoneer 的美元手续费公开帮助页未给出。Direct to Local Bank 使用已公布的 $0.99）
  12. `/us-contractor-w8ben-tax-withholding-calculator/`（美国海外承包商 W-8BEN 预提税自查与非居民合规计算器，默认 4,000 USD -> INR）
  13. `/usd-to-brl-pix-contractor-payout-guide/`（巴西远程开发者 PIX 即时结算、IOF 税与外汇点差测算，默认 4,500 USD -> BRL）
  14. `/usd-to-mxn-spei-freelancer-payouts/`（墨西哥近岸外包 SPEI 即时清算、RESICO 税制合规与 Deel 提现费对比，默认 3,000 USD -> MXN）
  15. `/paypal-contractor-fx-fee-calculator/`（PayPal 隐性汇率加点与商业收款费率拆解，默认 2,500 USD -> EUR）
  16. `/usd-to-cad-contractor-payout-calculator/`（美加跨境本地 EFT 直存对比银行电汇接收费与汇率加点，默认 5,000 USD -> CAD）
  17. `/contractor-payout-fail-rate-reconciliation-guide/`（SWIFT 国际电汇中转行扣费 OUR/BEN/SHA 与退汇对账排错指南，默认 3,500 USD -> EUR）
  18. `/about/`（编辑政策与费率建模方法论：公开费率来源、中间价点差公式、季度复核机制、非官方关联声明与 hello@contractorfx.com 联系方式）
  19. `/privacy/`（零上传隐私保证：明确账单与团队 CSV 永不离开浏览器、匿名化 GA4 事件策略、GDPR 与 CCPA/CPRA 披露）
  20. `/terms/`（使用条款与免责声明：非财务/税务/法律建议声明、实时通道与 KYC 分层费率差异说明、FTC 16 CFR Part 255 联盟披露规范）
- **独立 Node ESM CLI（`bin/contractor-fx.mjs`、`src/cli.ts`）**：使用 `esbuild` 打包（`npm run build:cli` 挂载于 `npm run build`），支持单走廊费率测算（`--amount`、`--billing`、`--payout`、`--funding`、`--contractors`）、团队 CSV 批量损耗审计（`--csv`）、table/md/json 格式化输出及 `contractorfx.com` 交互引导，并在 `package.json` 注册 `bin` 字段。
- **光栅化社交卡片与双 IndexNow 密钥（`public/`）**：由 `scripts/render-social-cards.mjs` 调用 Playwright 渲染生成 1200x630 `public/og-image.png` 与 1280x640 `public/github-social-preview.png`，保留 `og-image.svg`；创建 `public/b7e3d1c84a924f508c6e23b9a1d05e42.txt` 对齐根路径探测。
- **生产级静态资产与构建后 SEO 门禁（`scripts/seo-preflight.mjs`）**：默认基准域名 `https://contractorfx.com`，全量校验 14 个内容路由与 12 个辅助产物（`404.html`、`sitemap-index.xml`、`robots.txt`、`llms.txt`、`_headers`、`og-image.svg`、`og-image.png`、`github-social-preview.png`、`site.webmanifest`、`indexnow-key.txt`、`b7e3d1c84a924f508c6e23b9a1d05e42.txt`、`release.json`）、PNG 8 字节魔数与 >5KB 大小校验、双 key 一致性、`_headers` 预览域名 `X-Robots-Tag: noindex` 拦截、唯一 `<title>` 与 `<meta name="description">`、精确 canonical、`og:image` 指向 PNG、JSON-LD 结构化数据、全站内部链接可达性，以及零占位符与零长短破折号。`release.json` 存在时，`project`、`siteUrl`、`routeCount`、`routes` 必须与 `sitemap-0.xml` 一致。
- **发布清单脚本**：`npm run build` 在 `astro build` 之后跑 `npm run release:manifest`（`scripts/release-manifest.mjs` 在主仓委托 `40_shared/scripts/indie-release-manifest.mjs`，在独立 CI 克隆与外盘 worktree 提供等价本地回退），写出 `dist/release.json`。`npm run release:check` 用 `--check-live --allow-pending-deploy` 对照 `https://contractorfx.com/release.json`。
- **轻量 GitHub Actions CI 门禁（`.github/workflows/ci.yml`）**：监听 `main` 分支 `push` 与 `pull_request`（配 `concurrency` 自动取消组），依次执行 `npm ci`、`npm test`、`npm run build`、`npm run seo:check`。
- **自动化测试闭环（Vitest + Playwright）**：42 项 Vitest 单元测试全绿（覆盖费率公式、CSV 解析、250ms 防抖与同步 flush 控制器、GA4 结果事件、CLI 命令分支、长尾路由来源与 marketplace preset）；8 条 Playwright E2E 路径全绿（覆盖计算器联动、Markdown 导出、零网络请求 CSV 审计、非法 CSV 恢复、连续按键 250ms 防抖与导出/示例加载即时 flush、GA4 `dataLayer` 去标识化事件、`375x812` 移动端信任页导航，以及 5 个长尾页的费率来源、预设切换与本地导出）。
- **冷启动分发与合规申请手册（`LAUNCH_KIT.md`、`LAUNCH_CHECKLIST.md`、`PLAN_90DAY.md`）**：提供 X 25 秒视频脚本与无外链发帖模板、3 组高意图痛点布尔检索词与高价值回复话术、HN Show HN 事实备忘、Reddit 深度干货拆解、目录站提交文案、Wise/Deel 申请陈词，并关联 `_ops/research/indie-site-workflow-20261112/tools/cf-zone-bootstrap.mjs` 自动化建站脚本。
- **敏感文件拦截守卫（`.gitignore`）**：显式拦截 `.env`、`.env.*`（保留 `!.env.example`）、`.dev.vars`、`.dev.vars.*` 与 `*.pem`。

## 等待站长完成的清单（`[人工]`）

1. **社区冷启动**：按 `LAUNCH_KIT.md` 用站长账号发布 Show HN、Reddit、X、Product Hunt。不要代发。
2. **P2-1（预估 30 分钟）**：凭已上线的 `/about/`、`/privacy/`、`/terms/` 与 `hello@contractorfx.com`，使用 `LAUNCH_KIT.md` 第 5 节陈词提交 Wise Partnerize 与 Deel Affiliate 官方伙伴申请（详见 `LAUNCH_CHECKLIST.md` 第 6 节）。

## 下一步第一动作

- 站长按 `LAUNCH_KIT.md` 发布 Show HN、Reddit、X、Product Hunt，并提交 Wise Partnerize 与 Deel Affiliate 申请。GSC 站点地图处理结果仍为待处理，不阻塞这两项。2026-11-15 已把全部 14 条 URL 重新提交到 IndexNow（HTTP `200`），线上 `/release.json` 与部署 commit `10ca4e6dd2c9` 匹配。

## 行动记录

- `2026-11-17` `[AI]`：优化工作台输入性能并补齐自动化 PR CI 门禁（Issue #3）。新增 `src/lib/debounce.ts` 并在 `src/components/FxComparatorWorkbench.astro` 为数值/文本输入框与 `csv-input` 文本域的 `input` 事件接入 `250ms` 防抖，同时在下拉框/输入框 `change`、走廊/平台预设切换、加载示例 CSV、上传或拖拽 CSV 文件、切换 Tab、点击导出 Markdown/CSV 备忘录按钮时立即同步 `flush()`，消除大批量 CSV 编辑卡顿且保持导出零延迟一致；新增 `.github/workflows/ci.yml`（`push` 限 `main` + `pull_request` + `concurrency` 取消组，跑 `npm ci`、`npm test`、`npm run build`、`npm run seo:check`）与 `scripts/release-manifest.mjs` 独立构建清单包装器；本地 Node v24.16.0 + Chromium 实测通过 Vitest 单测与 Playwright E2E 及 `seo:check`，同步更新 `PLAN_90DAY.md`（`P0-7`）。未部署生产。
- `2026-11-17` `[AI]`：完成五站联动改造实施（遵循 28 天标题冻结期与零上传红线，不加 ads.txt，不接 AdSense，严守 totalFeeDragUsd 排序中立）。为前 6 个核心路由（`/` 至 `/batch-contractor-payout-csv-audit/`）补齐官方 feeSources、workedExample、auditCallout 与清算轨道信息；重构 `[preset].astro` 消除模板克隆感；同步在 `src/pages/index.astro` 挂载首页 `workedExample`、`auditCallout`、`feeSources`、`corridorContextNote` 与 `clearingRailInfo`；升级 `/about/` 与 `BaseLayout.astro` 补充跨国财资/薪酬编辑团队标准与语义化 `<time datetime="2026-11-17">` 更新时间；上线 6 个高价值无内耗子页面（W-8BEN 预提税、巴西 PIX、墨西哥 SPEI、PayPal 隐性汇率加点、加拿大 EFT、SWIFT 电汇对账排错），全站内容路由扩展至 20 条；更新 `scripts/seo-preflight.mjs`、`public/llms.txt`、`AGENTS.md`、`NOW.md`；跑通 `npm run verify:all`（Vitest 39/39、Playwright 7/7、SEO 预检 20 路由全绿，移动端 375px 无横向滚动）。未 push、未部署。
- `2026-11-15` `[AI]`：独立核验前的最终文档收口。本地 C01 commit 是 `bb06221`（`bb062211ab5632a79bff2d68b0d313517d3d597a`），不是 `00e73b4`。404 品牌修复已包含在 `bb06221`，不在工作区。主会话最终 `npm run verify:all` 退出码 `0`（Vitest 33/33、Playwright 7/7、14 个内容路由、12 个附属产物）。`npm run release:check` 退出码 `0`，状态 `pending_live_manifest`。线上没有 `release.json`，任何本地 commit 都未证明已上线。本轮只更新 `NOW.md`。未改代码与测试，未 push、未部署。
- `2026-11-15` `[AI]`：C01 文档收口。线上 sitemap 与本地一致，都是 14 个 URL；五个长尾页均为线上 HTTP `200`。`npm run release:check` 退出码 `0`，状态 `pending_live_manifest`（线上没有 `release.json`，线上 commit 未证明）。`gh repo view` 核实仓库为公开（`visibility=PUBLIC`）。修正 AGENTS/NOW 里“五页未部署 / 线上旧版 / 私有仓库”的过时说法；2026-11-13 记录里的“未部署”保留为当时状态。404 品牌修复（`src/pages/404.astro` 标题旧品牌 PayoutSpread 改为 ContractorFX，正文计算器数量从 6 改为 11，`canonicalPath="/404/"` 未改）已包含在 `bb06221`，不在工作区。未改主站 SEO 标题，未改 `PLAN_90DAY.md`，未 push、未部署。
- `2026-11-13` `[AI]`：新增 5 个长尾计算器路由（`/fx-markup-calculator/`、`/payoneer-fees-calculator-india/`、`/wise-vs-payoneer-philippines/`、`/fiverr-payoneer-withdrawal-fee/`、`/upwork-withdrawal-fee-payoneer/`），并加入站点地图、页头页脚与 `llms.txt`。费率只采用 2026-11-13 读到的官方帮助页或定价页。Fiverr Payoneer Account 为 $3.00（两篇帮助文章一致）；本地币银行转账 $1 与 $3 冲突，预设留空。Upwork 到 Payoneer 的美元金额公开页未给出，预设留空；Direct to Local Bank 使用已公布的 $0.99。Payoneer India 提现带宽为 1% 至 4%，notice `a_id/45313` 在未登录状态下没有渲染出印度生效日期。计算器新增 marketplace withdrawal preset，以及 `received-balance` 资金方式（已到账时不再加一笔新的客户入金费）。未部署。
- `2026-11-12` `[AI]`：核对 Email Routing（Zone `102de3b1af4b76feef4793ac430604f9`，`enabled: true`，`status: ready`，`hello@contractorfx.com` 与 `privacy@contractorfx.com` 转发至 `liqi199315@gmail.com`，MX、SPF、DKIM 锁定，`_dmarc` TXT）、Bing Webmaster Tools（`IsVerified: true`，`SubmitFeed` 已提交 `https://contractorfx.com/sitemap-index.xml`）与共享统计登记（`analytics-sites.yaml` 的 `contractorfx`）。`ga4-report.mjs`、`gsc-report.mjs`、`bing-report.mjs`、`analytics-registry.test.mjs` 退出码均为 `0`。剩余人工项为社区发布与联盟申请。
- `2026-11-12` `[AI]`：部署生产 Worker，自定义域名生效；构建、发布预检及 SEO 检查通过，六种搜索机器人线上 HTTP `200`，www HTTP `301`。完成 GA4 和 GSC 配置、提交站点地图和 IndexNow；GSC 处理结果及流量尚待核对。

- `2026-11-12` `[AI]`：完成 MVP 核心计算引擎、6 个工具路由、基础预检脚本与 4 条 Playwright 测试初始化。
- `2026-11-12` `[AI]`：完成正式化升级（`30_products/contractor-fx-comparator` + `https://contractorfx.com`），新增 Wise/Deel 联盟审核级信任页（`/about/`、`/privacy/`、`/terms/`），升级 `scripts/seo-preflight.mjs` 覆盖 9 路由 + 8 静态产物 + JSON-LD + `og:image`，扩充 `tests/e2e/comparator.spec.ts` 至 6 条用例，并编写 `LAUNCH_CHECKLIST.md`。
- `2026-11-12` `[AI]`：完成生产加固。使用 Playwright 离线光栅化生成 1200x630 `og-image.png` 与 1280x640 `github-social-preview.png` 并更新 `BaseLayout.astro`；在 `.gitignore` 补充 `.env*`、`.dev.vars*`、`*.pem` 密钥拦截；部署双 IndexNow key 文件；通过 `esbuild` 打包 `bin/contractor-fx.mjs` 并编写 11 项 Vitest CLI 专项测试；升级 `README.md` 与 `LAUNCH_KIT.md`；`npm run verify:all` 验收全绿。
- `2026-11-12` `[AI]`：上线后最佳实践巡检收口：`wrangler.jsonc` 关闭 `workers_dev` 与 `preview_urls` 并重部署（Version `5b36b204-e26c-4964-ab27-f34992e4d8cb`，真网验证 `contractor-fx-comparator.liqi199315.workers.dev` 已返回 HTTP `404`）；`public/_headers` 补齐完整 `Content-Security-Policy` 并清理无效域名行；通过 GA4 Admin API 注册 `format`、`billing`、`payout` 三个自定义维度与 `row_count` 自定义指标；通过 `gh repo edit` 补齐 GitHub 仓库主页、简介与 10 个 Topics，并同步 `PLAN_90DAY.md` 状态。
