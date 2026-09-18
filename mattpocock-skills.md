# mattpocock/skills 技能手册

> 来源：<https://github.com/mattpocock/skills>（Skills For Real Engineers）
> 本地安装位置：`~/.agents/skills/`，通过 `~/.pi/agent/skills/` 软链接暴露
> 本文档用于理解这套技能本身：它们是什么、怎么组合、亮点在哪

---

## 0. 一句话结论

这套技能不是一堆独立工具，而是一条
**「配置 → 对齐 → 架构 → 拆解 → 执行 → 收口」的流水线**，
中间靠仓库里的文档资产串起来：

- `CONTEXT.md` — 领域词汇表
- `docs/adr/` — 架构决策记录
- spec 产物 — 一份 spec 一个文件
- 工单产物 — 一张工单一个文件，声明阻塞边
- `docs/agents/*.md` — 技能消费契约（issue tracker / 领域文档布局 / triage 标签）

**每个技能的输出都是下一个技能的输入**，且跨会话存活。

---

## 1. 全景：技能的分层与依赖

| 层 | 技能 | 触发方式 | 一句话作用 |
| --- | --- | --- | --- |
| 配置 | `setup-matt-pocock-skills` | 用户 | 一次性把仓库的 issue tracker、领域文档布局登记好 |
| 对齐 | `grilling` | 模型 | **面试原语**：按设计树逐轮逼问，直到无隐含假设 |
| 对齐 | `grill-me` | 用户 | `grilling` 的入口（纯对话版） |
| 对齐 | `grill-with-docs` | 用户 | `grilling` + `domain-modeling`，边问边写 `CONTEXT.md`/ADR |
| 架构 | `domain-modeling` | 模型 | 术语与决策的**主动**建模，惰性更新 `CONTEXT.md` 与 ADR |
| 架构 | `codebase-design` | 模型 | 深模块设计的**共享词汇**（module/interface/depth/seam/adapter） |
| 架构 | `improve-codebase-architecture` | 用户 | 扫描深模块机会 → HTML 可视化报告 → 进入 grilling |
| 拆解 | `to-spec` | 用户 | 把已有对话**直接合成** spec（不面试） |
| 拆解 | `to-tickets` | 用户 | 拆成 tracer-bullet 垂直切片工单，声明阻塞边 |
| 执行 | `implement` | 用户 | 按 spec/工单实施，走 `tdd`，收尾走 `code-review` |
| 执行 | `tdd` | 模型 | 红-绿循环的纪律手册（好测试/坏测试/反模式） |
| 执行 | `diagnosing-bugs` | 模型 | 硬 bug 的六阶段诊断环，阶段间有硬门槛 |
| 执行 | `research` | 模型 | 后台代理查一手资料，产出带引用的 Markdown |
| 收口 | `code-review` | 模型 | 双轴评审（标准轴 + spec 轴），并行子代理 |

### 1.1 调用权限规则（重要）

技能按**谁能调用**分成两类：

| 类型 | 含义 | 成员 |
| --- | --- | --- |
| **User-invoked（用户触发）** | 只能由用户手动喊（`/xxx`）；职责是**编排** | `setup-matt-pocock-skills`、`grill-me`、`grill-with-docs`、`improve-codebase-architecture`、`to-spec`、`to-tickets`、`implement`、`triage`、`wayfinder`、`ask-matt` |
| **Model-invoked（模型触发）** | 用户可喊，代理在任务匹配时也能自动伸手；职责是承载**可复用纪律** | `grilling`、`domain-modeling`、`codebase-design`、`tdd`、`diagnosing-bugs`、`research`、`code-review`、`prototype`、`resolving-merge-conflicts`、`wizard`、`writing-for-agents` |

约束：**用户触发型技能可以调用模型触发型技能，但绝不能调用另一个用户触发型技能。**
这条规则避免了"技能互相乱喊"的失控，也让编排层始终只有一个入口。

---

## 2. 逐个技能：作用 + 亮点

### 2.1 `setup-matt-pocock-skills`（配置层）

**作用**：一次性探明仓库现状，把三件事写进仓库——issue tracker 位置、triage 标签词表、领域文档布局。

**亮点**：
- **先探索再提问，不问已知答案**：先读 `git remote`、`AGENTS.md`/`CLAUDE.md`、`CONTEXT.md`、`docs/adr/`、`.scratch/`、monorepo 信号，探索已确定的 section 直接跳过。
- **推荐答案先行**，用户一个字就能接受，降低配置摩擦。
- 产物是 `docs/agents/*.md` 三份**消费契约**，后续技能都读它——**配置与技能解耦**。
- 默认推荐 GitHub/GitLab Issues，也支持本地 markdown（`.scratch/<feature>/`）或自由描述的其他 tracker。
- 若 `triage` 未安装则跳过标签词表一节，不制造无用配置。

---

### 2.2 `grilling`（对齐层的原语，最值得学的技能）

**作用**：把"想清楚要做什么"变成一个可终止的算法——把设计空间建模成**设计树**，每轮只问「前提已确定」的**前沿（frontier）**问题。

**亮点**：
1. **按轮次问，不按顺序问**：一轮把整个前沿编号列出，每题给推荐答案，然后**等**。答案会重塑树，再算下一轮前沿。依赖未决问题的题**不属于本轮**。
2. **事实归代理，决策归用户**（最狠的一条）：需要查文件/环境的事，派子代理去查，**绝不问用户能自己查到的事**；但决策必须抛给用户并等待。且不阻塞——只有依赖该事实的下游问题等，其余前沿照问。
3. **每题带推荐答案**：用户是"审阅"而非"从零作答"，沟通带宽大幅提升。
4. **明确的终止条件**：前沿为空 = 每根分支都走过、无静默假设；且**用户确认前不许动手**。
5. **统一题面格式**：`❓ **Q1** - **<标题>**：<正文>` + `➡️ <推荐答案>`。

---

### 2.3 `grill-me` / `grill-with-docs`（用户入口）

**作用**：薄壳。`grill-me` 只是"调用 grilling"；`grill-with-docs` 是"调用 grilling 和 domain-modeling"。

**亮点**：**极简的编排**。入口技能不含任何实质内容，改纪律只需改一处原语。`grill-with-docs` 被 README 称为"可能是本仓库最酷的技术"——因为它顺手把领域语言沉淀下来了。

---

### 2.4 `domain-modeling`（领域建模）

**作用**：**主动**建模（而非只是读词表）：挑战术语冲突、把模糊词锐化成规范词、用具体场景压测边界、交叉核对代码与说法、当场更新 `CONTEXT.md`。

**亮点**：
1. **边界感极强**：`CONTEXT.md` **只是词汇表**，"完全不含实现细节"，不是 spec、不是草稿本。
2. **ADR 三条件门禁**：只有同时满足「难回退 + 无上下文会困惑 + 是真权衡」才建议写 ADR；任何一条不满足就跳过。这条规则直接解释了为什么 ADR 数量停在合理区间而不是爆炸。
3. **"术语未收录是信号"**：要么你在发明项目不用的语言，要么是真缺口。
4. **五个动作固定**：挑战词汇表冲突 → 锐化模糊语言 → 讨论具体场景 → 与代码交叉核对 → 当场更新 `CONTEXT.md`（不批量攒）。
5. **文件惰性创建**：`CONTEXT.md` 在第一个术语确定时创建，`docs/adr/` 在第一篇 ADR 需要时创建。
6. 配套 `CONTEXT-FORMAT.md` 与 `ADR-FORMAT.md` 两份格式模板。

---

### 2.5 `codebase-design`（架构词汇表）

**作用**：定义一套**必须原样使用**的词汇：module / interface / depth / seam / adapter / leverage / locality。

**亮点**：
1. **给"深度"下了可操作的定义**：depth = 接口处的杠杆（leverage），而非 Ousterhout 的"实现行数/接口行数比"——它**明确拒绝**那个框架，因为"会奖励往实现里灌水"。
2. **删除测试**：想象删掉这个模块——复杂度消失了说明它是直通管道；复杂度在 N 个调用点重新出现，说明它在挣饭吃。
3. **"一个适配器 = 假接缝，两个 = 真接缝"**：直接给出"何时不该抽象"的判据。
4. **接口即测试面**：调用方和测试跨同一个接缝；想测到接口**后面**，说明模块形状错了。
5. **拒绝漂移**：明确禁止把 seam 说成 boundary（与 DDD 的有界上下文撞车），禁止用 component/service/API 替代既有术语。
6. **可测性三原则**：接受依赖而非自己创建、返回结果而非产生副作用、小接口。
7. **配套两份深化指南**：
   - `DEEPENING.md` — 按依赖类别（in-process / local-substitutable / remote but owned / true external）决定深化与测试策略；"替换而非叠加"测试。
   - `DESIGN-IT-TWICE.md` — 并行派 3+ 子代理，每个给**不同的设计约束**（最小接口 / 最大灵活 / 最常见调用方最省事 / ports & adapters），再比 depth、locality、seam 位置。

---

### 2.6 `improve-codebase-architecture`（架构巡检）

**作用**：扫描深模块机会 → 写成自包含 HTML 报告（Tailwind + Mermaid，before/after 可视化）→ 用户挑一个 → 进入 grilling。

**亮点**：
1. **YAGNI 式定范围**：先看 `git log` 找**热点文件**，把注意力放在"最近一直在改的地方"，而不是全库均匀扫描。
2. **报告落在系统临时目录**，不污染仓库；`$TMPDIR` → `/tmp` → `%TEMP%` 兼容。
3. **强度分档**：Strong / Worth exploring / Speculative，并给 Top recommendation——用户不是面对一堆平权选项。
4. **ADR 冲突要显式标注**（"与 ADR-0007 冲突，但值得重开因为…"），而不是静默覆盖或全量罗列。
5. **只出候选，不出接口**：接口设计留给 grilling 和 design-it-twice。
6. **副作用内联处理**：命名新概念就补 `CONTEXT.md`；用户以有分量的理由否决候选，就问是否记 ADR，防止未来的巡检重复提同一件事。
7. 定位是**巡检而非抢救**：老旧代码库上能找出真候选，但不会替你解开一团泥。

---

### 2.7 `to-spec`（合成 spec）

**作用**：**不面试**，直接把已有对话合成 spec 并发布到 tracker。

**亮点**：
1. **先定 seam 再写 spec**：第 2 步就是"勾出你打算测试这个特性的接缝"，**优先复用既有接缝、用最高层的接缝、越少越好（理想是 1 个）**，并要用户确认。把"可测性"前置到 spec 阶段。
2. **明确禁止写文件路径和代码片段**（"过时太快"），只留决策。**唯一例外**：原型产出的、比散文更精确的片段（状态机/归约器/schema/类型形状）可以内联并注明来自原型。
3. **User Stories 要求"极长"**，覆盖所有方面。
4. 落盘就打 `ready-for-agent` 标签——"spec 天然是可被代理抓取的"。
5. 固定模板：Problem Statement / Solution / User Stories / Implementation Decisions / Testing Decisions / Out of Scope / Further Notes。
6. 与 `grilling` 的分工：**grilling 负责问出来，to-spec 负责写下来**，两者不重叠。

---

### 2.8 `to-tickets`（拆工单）

**作用**：把计划/spec/对话拆成 **tracer bullet 垂直切片**，每张声明阻塞边，发布到 tracker。

**亮点**：
1. **垂直切片规则**：每片是穿过**每一层**（schema/API/UI/测试）的窄而完整的路径，**不是**某一层的水平切片；每片独立可演示、可在**一个全新上下文窗口**内完成。
2. **"让改动变简单，再做简单改动"**：先做 prefactoring，且排在最前。
3. **宽重构是垂直切片的例外**：blast radius 横跨全库时，改用 **expand–contract**——先加新形式并存 → 按 blast radius 分批迁移（每批一票，被 expand 阻塞）→ 最后删除旧形式（被所有迁移批阻塞）。当批次无法各自保持绿时，允许共享集成分支 + 一张"整合验证"票，绿只在那张票承诺。**这是对"垂直切片原教旨主义"的必要修正**。
4. **先审后发**：粒度、阻塞边、合并/再拆三问，用户批准才落盘。
5. **按前沿推进**：阻塞者先编号（01 起），无原生阻塞链接就用文本 `Blocked by`；有原生阻塞链接的真实 tracker 就用原生关系。
6. **绝不改动父 issue**。
7. 提供本地文件与真实 tracker 两套模板。

---

### 2.9 `implement`（执行编排）

**作用**：按 spec/工单实施 → 在**预先约定的 seam** 上走 `/tdd` → 频繁跑类型检查、单测，最后全量 → 收尾走 `/code-review` → 提交当前分支。

**亮点**：它是**唯一串联三个技能**的编排器，且顺序有讲究：**测试面先约定（tdd 要求）→ 评审在提交前 → 提交在评审后**。全文不到 10 行，却把工程闭环固定下来了。

---

### 2.10 `tdd`（红-绿纪律）

**作用**：不是"教你怎么写测试"，而是**让红绿循环产出值得留下的测试**。

**亮点**（反模式写得比正面指导更有价值）：
1. **实现耦合**：mock 内部协作者、测私有方法、通过侧信道验证。识别特征：**重构时测试坏了但行为没变**。
2. **同义反复**：断言用与代码相同的方式重算期望值（`expect(add(a,b)).toBe(a+b)`、手工按同样方式推的 snapshot），**构造上必过、永不可能与代码不一致**。期望值必须来自独立真源（已知良好字面量、worked example、spec）。
3. **水平切片**：先写全部测试再写全部实现——你测的是**想象中**的行为、是事物的**形状**而非用户可见行为。必须**一片测试 → 一片实现**交替，每片是响应上一轮学习结果的 tracer bullet。
4. **"重构不属于红绿循环"**：重构归 review 阶段，不混进实现循环。
5. **测试只在预先确认的 seam 上写**；"接口形状本身有疑问"时去查 `codebase-design`（是参考资料，不是要跑一个会话）。
6. 配套 `tests.md`（好/坏测试示例）与 `mocking.md`（只在系统边界 mock：外部 API、数据库、时间/随机、文件系统；绝不 mock 自己的类/模块/内部协作者）。

---

### 2.11 `diagnosing-bugs`（诊断环）

**作用**：六阶段硬门槛诊断：建反馈环 → 复现+最小化 → 假设 → 插桩 → 修+回归测试 → 清理。

**亮点**：
1. **第 1 阶段就是全部**："构建一个能对**这个** bug 变红的紧反馈环，bug 就 90% 修好了。" 给了 10 种构造手段（失败测试 → curl/HTTP → CLI fixture diff → headless 浏览器 → 重放抓包 → 一次性 harness → 属性/fuzz → bisect harness → 差分环 → HITL 脚本）。
2. **硬门槛**："没有能变红的命令，就不许进第 2 阶段"——并点名它要防的具体失败：**"抓自己正在读代码建理论就停下：直接跳到假设，正是这个技能要防的事。"**
3. **环要当产品打磨**：更快、信号更锐（断言具体症状而非"没崩"）、更确定（钉住时间/种子/RNG/网络）。"30 秒的 flaky 环比没有环好不了多少；2 秒的确定性环是调试超能力。"
4. **非确定性 bug 换目标**：不求干净复现，求**更高复现率**（50% 可调，1% 不可调）。
5. **假设先出 3~5 条并排名**，每条必须**可证伪**（"如果 X 是原因，那么改 Y 会让 bug 消失"）；不能陈述预测的就是 vibe，丢弃。且**先给用户看排名**（他们常有领域知识能瞬间重排），但不阻塞。
6. **最小化到每个剩余元素都承重**：逐个砍输入/调用方/配置/数据/步骤，砍掉任何一个就变绿才算砍到位。
7. **插桩一次只改一个变量**，调试日志统一前缀（`[DEBUG-a4f2]`），清理时一个 grep 搞定——"未打标签的日志会活下来，打过标签的会死掉"。性能问题走独立分支：先建基线测量，再二分，**先量后修**。
8. **回归测试要先有正确的 seam**；**没有正确 seam 本身就是发现**（架构在阻止 bug 被锁死），转交给下一阶段。
9. 硬性 **Redact**：展示命令/输出前先脱敏成 `<REDACTED>`，凭据走环境变量，只引用携带信号的几行。
10. 第 6 阶段清理清单化：原复现不再复现、回归测试通过（或缺 seam 已记录）、`[DEBUG-...]` 全部移除、一次性原型删除、正确假设写进 commit/PR 消息。

---

### 2.12 `research`（查资料）

**作用**：派后台代理查问题，只信**一手来源**（官方文档、源码、规范、第一方 API），每条论断回溯到拥有它的源头，产出单个带引用的 Markdown。

**亮点**：**短到极致**（3 条职责），把"后台并行 + 一手来源 + 引用可追溯"三个约束压进十几行；落盘位置"匹配仓库既有约定，没有就放个合理位置并说明"。

---

### 2.13 `code-review`（双轴评审）

**作用**：对 `git diff <固定点>...HEAD` 做**两个互不干扰**的评审，并行子代理，并排呈现。

**亮点**：
1. **为什么要两轴**：符合标准但做错事 → 标准过/spec 挂；完全照 issue 做但破坏约定 → spec 过/标准挂。**分开报告，防止一轴掩盖另一轴**；结尾**禁止跨轴选唯一赢家**——那正是分轴要防的"重排序"。
2. **固定点先校验**：`git rev-parse` + diff 非空，坏 ref/空 diff 在**这里**失败，而不是在两个并行子代理里失败。
3. **标准轴自带 Fowler 气味基线**（《重构》第 3 章）：Mysterious Name、Duplicated Code、Feature Envy、Data Clumps、Primitive Obsession、Repeated Switches、Shotgun Surgery、Divergent Change、Speculative Generality、Message Chains、Middle Man、Refused Bequest——每条都是"是什么 → 怎么修"。
4. **两条约束绑定基线**：**仓库文档标准永远覆盖基线**（仓库认可的做法要抑制该气味）；**气味永远是判断题**（"possible Feature Envy"），不是硬违规；**工具已经强制的跳过**。
5. **spec 轴找三件事**：spec 要求但缺失/半成品、diff 里没被要求的行为（scope creep）、看起来实现了但实现错了。每条引用 spec 原文。
6. 找不到 spec 就跳过该轴并注明，而不是编一个；子代理各限 400 词，避免噪音淹没。

---

## 3. 整体亮点：为什么它比 BMAD / Spec-Kit 那类更耐用

1. **小、可改、可组合**（作者原话）。每个技能只做一件事，编排靠薄壳（`grill-me`、`implement` 各不到 10 行）。大框架"接管了流程，也让流程里的 bug 难以修复"。
2. **产物是仓库里的资产，不是会话里的状态**。`CONTEXT.md`（省 token + 命名一致 + 代码更易导航）、ADR（不再重开已决之争）、spec、工单——跨会话存活，且能被下一个技能直接消费。
3. **跨技能词汇统一**。module / interface / seam / depth 在 `codebase-design`、`tdd`、`to-spec`、`improve-codebase-architecture`、`diagnosing-bugs` 里是**同一个意思**，技能之间不需要翻译层。
4. **反复出现一条分工纪律**：**查事实是代理的事，做决定是用户的事**（grilling 的核心、code-review 的固定点校验、to-tickets 的"先审后发"、diagnosing-bugs 的"假设先给用户排名"）。这是这套技能最一致的设计哲学。
5. **反模式和硬门槛写得比正面指导更狠**。`tdd` 的三个反模式、`diagnosing-bugs` 的"没有红命令不许进第 2 阶段"、`code-review` 的"禁止跨轴重排"——真正防止代理退化成"看起来在干活"的护栏。
6. **明确的例外通道**。`to-tickets` 为宽重构留了 expand–contract；`to-spec` 为原型片段留了内联例外；`codebase-design` 承认模块可以有**内部接缝**（私有、供自身测试用）。有例外通道的规则才不会被绕过。
7. **安装形态可选**：Claude Code 插件（只读订阅、自动更新）vs `skills.sh`（拷成可编辑文件、你自己拥有），对应"订阅"与"fork"两种哲学；不要同时装，会重复。

---

## 4. 其余上游技能（本文未详述）

| 技能 | 类型 | 作用 |
| --- | --- | --- |
| `triage` | 用户 | 工单在 5 个 triage 角色（`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`）间流转的状态机 |
| `wayfinder` | 用户 | 超过单个会话容量的大块工作，在 tracker 上铺成决策票地图，逐张解决直到路径清晰 |
| `ask-matt` | 用户 | 技能路由器：问哪个技能/流程适合当前处境 |
| `prototype` | 模型 | 一次性可丢弃原型：单 HTML 文件答状态/逻辑问题，或同路由多 UI 变体答视觉问题 |
| `resolving-merge-conflicts` | 模型 | 逐 hunk 按意图解决冲突（意图追溯到每一侧的一手来源），并完成操作，**绝不 `--abort`** |
| `wizard` | 模型 | 生成交互式 bash 向导，带人走过只有人能做的步骤（开基础设施、配凭据/CI secret、跑一次性迁移） |
| `writing-for-agents` | 模型 | 写"给代理看的文档"：skills、AGENTS.md/CLAUDE.md 及一切被指针指向的文档 |
| `handoff` | 用户 | 把当前对话压缩成交接文档，供另一个代理继续 |
| `to-questionnaire` | 用户 | 把一个人答不了的决策变成异步问卷（面试的是"怎么发"，不是"问什么"） |
| `wait-what` | 用户 | 消息没听懂时，用 `CONTEXT.md` 词汇 + 缺失上下文重新讲一遍 |
| `teach` | 用户 | 以当前目录为有状态教学空间，多会话教一个概念 |

---

## 5. 维护注意

- `code-review`、`to-spec`、`to-tickets` **硬依赖** `docs/agents/issue-tracker.md` 存在；缺失时会要求先跑 `setup-matt-pocock-skills`。
- `docs/agents/*.md` 是**仓库产物**，上游更新不会覆盖；但技能正文会被更新覆盖（用 `skills.sh` 安装时），需重新核对本地化约定是否仍然生效。
- 用户触发型与模型触发型的边界不能破：用户触发型技能之间**不得互相调用**。
