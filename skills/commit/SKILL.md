---
description: "生成公司项目标准化的 git commit message"
user-invocable: true
allowed-tools: Bash, Read, AskUserQuestion
---

# Commit Message 生成器

根据 TAPD story URL（可选）和当前 git 变更，自动生成规范的 commit message 并**直接提交**（无需用户确认）。提交后可选择是否推送到远端。

## 用法

```bash
/commit [TAPD_STORY_URL]
```

- 提供 `TAPD_STORY_URL` 时，commit message 中附带 `story_id`，并参考需求上下文理解改动。
- **未提供参数时，跳过需求文档相关内容，直接根据代码改动生成 commit message。**

**示例：**
```bash
/commit https://www.tapd.cn/tapd_fe/54686692/story/detail/1154686692001039660
```

---

## 执行步骤

收到 `/commit [URL]` 指令后，请按以下步骤执行：

### Step 1：判断模式

根据用户输入选择执行分支：

- **带参数模式**：用户提供了 TAPD story URL → 进入 Step 2，提取并获取需求信息。
- **无参数模式**：用户仅输入 `/commit` → **跳过 Step 2~4**，直接进入 Step 5。

### Step 2：解析 URL（带参数模式）

从用户提供的 TAPD URL 中提取：
- `workspace_id`：URL 中 `/tapd_fe/` 后面的数字
- `story_id`：URL 中 `/detail/` 后面的数字

链接格式：`https://www.tapd.cn/tapd_fe/{workspace_id}/story/detail/{story_id}`

若格式无效，则停止执行。

### Step 3：获取 TAPD 需求完整信息（带参数模式）

**首先检查当前对话上下文**，判断是否已存在该 story_id 对应的需求内容：

- **若已有**：上下文中包含该需求的 `name`、`description` 等字段，则**直接复用上下文中的内容，跳过 MCP 调用**
- **若没有或不完整**（缺少 description / acceptance_criteria）：调用 `mcp__tapd__get_story_text`：

```json
{
  "workspace_id": "<从URL提取的workspace_id>",
  "story_id": "<从URL提取的story_id>"
}
```

无论来源是上下文还是 MCP，目标是提取以下字段：
- `name`：需求标题（仅作参考，不直接用于 commit subject）
- `id`：需求ID
- `description`：需求描述（功能背景与详细说明）
- `acceptance_criteria` / `acceptanceCriteria`：验收标准（用户期望的具体行为）
- `label` / `tags`：标签（模块或功能域信息）

### Step 4：理解需求意图（带参数模式）

根据 `description` 和 `acceptance_criteria`，提炼出：
1. 这个需求**要解决什么问题**或**实现什么业务目标**
2. **用户侧**期望看到的具体变化（从验收标准提取）
3. 涉及的**功能模块或业务域**

以上信息仅作为理解改动的背景参考，**不直接作为 commit subject**。

### Step 5：分析 git 变更

依次执行以下 bash 命令：

```bash
# 获取变更文件列表
git diff HEAD --name-status 2>/dev/null || git diff --cached --name-status

# 获取详细 diff
git diff HEAD 2>/dev/null || git diff --cached
```

分析每处改动：

- **带参数模式**：对照需求意图，判断哪些是核心功能实现、哪些是配套调整。
- **无参数模式**：仅根据代码变更本身，判断改动的类型与范围。

### Step 6：生成 commit message

#### 6.1 带参数模式

按以下格式生成：

```
feat({story_id}): {改动总结}

- {要点1：用业务语言描述实现了什么功能}
- {要点2：体现用户价值，如"支持用户xxx操作"}
- {要点N：配套改动合并描述}
```

- `{改动总结}` 必须是对本次**代码改动的精炼概括**，不可直接使用需求标题。
- 需求标题/描述仅用于辅助理解改动背景。

#### 6.2 无参数模式

按以下格式生成：

```
{type}: {改动总结}

- {要点1}
- {要点2}
- {要点N}
```

- `{type}` 根据改动类型自动选择：`feat` / `fix` / `refactor` / `docs` / `test` / `perf` / `style` / `chore`。
- `{改动总结}` 精炼概括本次代码改动。

**通用写作规则：**
- 每条要点优先体现**业务价值**，其次才是技术手段
- 错误示例：「修改 UserForm.vue，添加 validatePhone 方法」
- 正确示例：「新增手机号格式校验，防止用户输入非法号码」
- 要点不超过 6 条，相似改动合并
- 全部使用中文

### Step 7：展示并直接提交

将生成的 commit message 展示给用户，然后**直接执行提交**，无需确认。

展示格式：

```
📝 生成的 Commit Message：

────────────────────────────────────────
feat(1154686692001039660): 新增手机号格式校验

- 新增手机号格式校验，防止用户输入非法号码
- 优化表单提交错误提示
────────────────────────────────────────
```

直接执行：

```bash
git commit -a -m "<commit_message>"
```

提交成功后运行 `git log --oneline -1` 展示提交结果。

### Step 8：是否推送

提交成功后，判断是否存在远端仓库：

- 若存在，直接推送
- 若不存在，结束流程
