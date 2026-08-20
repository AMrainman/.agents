# .agents

一个**私人公开的 Skills 仓库**，用于存放个人常用、跨项目复用的 Agent Skills。

> ⚠️ 本仓库为个人用途公开维护：内容可随时变动，不保证稳定性与兼容性，欢迎参考，但请自行评估后再使用。

## 什么是 Skill

Skill 是为 AI 编码助手（如 [pi](https://github.com/badlogic/pi-mono)、Claude Code 等）提供的「专项任务说明书」，通常以 `SKILL.md` 形式存在。当任务与 Skill 描述匹配时，助手会加载对应说明并按其指引执行。

### skill 搜索、查看、安装、更新、卸载

```bash
# 1. 搜索社区技能（关键词匹配）
npx skills find <关键词>

# 2. 安装技能（-y 跳过确认，-g 全局安装，必加！）
npx skills add <owner/repo@skill> -y -g

# 3. 查看已安装的全部技能
npx skills list -g

# 4. 更新所有技能
npx skills update -g

# 5. 卸载某些技能，执行命令进入选择
npx skills remove -g
```

## 目录结构

```
.
├── .skill-lock.json   # 通过 skills CLI 安装的第三方 skill 锁文件
└── skills/            # 所有 skills（自建 + 安装）
    ├── <skill-name>/
    │   └── SKILL.md
    └── ...
```

## 当前 Skills

### 个人自建

| Skill | 说明 |
| --- | --- |
| agnes-ai-generation | 调用 Agnes AI / Sapiens AI 生成文本、图片、视频 |
| commit | 生成标准化 git commit message 并直接提交 |
| create-vue | 创建 Vue 项目 |
| kimi-webbridge | 控制真实浏览器进行网页交互 |

### [mattpocock/skills](https://github.com/mattpocock/skills)

个人开发流程：setup + grill-with-docs + to-spec + to-tickets + implement（tdd/code-review）

| Skill | 说明 |
| --- | --- |
| code-review | 基于固定节点对变更做规范与需求双维度审查 |
| codebase-design | 深模块设计的通用词汇与设计指导 |
| diagnosing-bugs | 疑难 bug 与性能回退的诊断流程 |
| domain-modeling | 构建与打磨项目领域模型（CONTEXT.md / ADR） |
| grill-with-docs | 结合文档对计划或决策进行追问压测 |
| grilling | 对计划或决策进行追问压测 |
| grill-me | 对个人想法进行追问压测 |
| implement | 按规格实现功能 |
| improve-codebase-architecture | 改进代码库架构 |
| research | 基于高可信来源做调研并输出文档 |
| setup-matt-pocock-skills | 安装 mattpocock 系列 skills |
| tdd | 测试驱动开发 |
| to-spec / to-tickets | 需求转规格 / 拆分工单 |

### [anthropics/skills](https://github.com/anthropics/skills)

| Skill | 说明 |
| --- | --- |
| frontend-design | UI 视觉设计指导 |

### [vercel-labs/skills](https://github.com/vercel-labs/skills)

| Skill | 说明 |
| --- | --- |
| find-skills | 发现并安装新的 skills |

## 使用方式

将本仓库克隆或软链到 Agent 的 skills 目录（如 `~/.agents`），或在支持 skills 的工具中通过 `find-skills` 搜索安装。

## 许可

除各 skill 自带的 LICENSE 外，本仓库自建内容不提供任何担保，使用风险自负。
